import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConfirmUploadDto,
  RequestPresignedUrlDto,
} from './dto/create-upload.dto';
import {
  PresignedUrlResponseDto,
  ConfirmUploadResponseDto,
} from './dto/upload-response.dto';
import { plainToInstance } from 'class-transformer';
import * as path from 'path';
import * as crypto from 'crypto';
import { UploadPurpose } from '../generated/prisma/enums';

const MAX_FILE_SIZES: Record<UploadPurpose, number> = {
  [UploadPurpose.EXPERIENCE]: 2 * 1024 * 1024,
  [UploadPurpose.AVATAR]: 1 * 1024 * 1024,
  [UploadPurpose.DOCUMENT]: 5 * 1024 * 1024,
};

const ALLOWED_MIME_TYPES: Record<UploadPurpose, string[]> = {
  [UploadPurpose.EXPERIENCE]: ['image/jpeg', 'image/png', 'image/webp'],
  [UploadPurpose.AVATAR]: ['image/jpeg', 'image/png', 'image/webp'],
  [UploadPurpose.DOCUMENT]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
};

const DOCUMENT_SIGNED_URL_TTL = 60 * 10; // 10 minutes

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly buckets: Record<UploadPurpose, string>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.buckets = {
      [UploadPurpose.EXPERIENCE]: this.configService.getOrThrow<string>(
        'SUPABASE_BUCKET_EXPERIENCE',
      ),
      [UploadPurpose.AVATAR]: this.configService.getOrThrow<string>(
        'SUPABASE_BUCKET_AVATAR',
      ),
      [UploadPurpose.DOCUMENT]: this.configService.getOrThrow<string>(
        'SUPABASE_BUCKET_DOCUMENT',
      ),
    };

    this.supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  // Step 1: Request Presigned Upload URL

  async requestPresignedUrl(userId: string, dto: RequestPresignedUrlDto) {
    const allowed = ALLOWED_MIME_TYPES[dto.purpose];
    if (!allowed.includes(dto.mimeType)) {
      throw new BadRequestException(
        `Invalid file type "${dto.mimeType}" for purpose "${dto.purpose}". Allowed: ${allowed.join(', ')}`,
      );
    }

    const ext = this.mimeToExt(dto.mimeType);
    const uuid = crypto.randomUUID();
    let key: string;

    // Determine the storage key based on purpose and userId
    switch (dto.purpose) {
      case UploadPurpose.AVATAR:
        key = `${userId}/${uuid}${ext}`;
        break;
      case UploadPurpose.DOCUMENT:
        key = `${userId}/${uuid}${ext}`;
        break;
      case UploadPurpose.EXPERIENCE:
      default: {
        if (!dto.experienceId) {
          throw new BadRequestException(
            'experienceId is required for experience uploads.',
          );
        }
        key = `${userId}/${dto.experienceId}/${uuid}${ext}`;
        break;
      }
    }

    const { data, error } = await this.supabase.storage
      .from(this.buckets[dto.purpose])
      .createSignedUploadUrl(key);

    if (error || !data) {
      this.logger.error('Failed to create presigned URL', error);
      throw new InternalServerErrorException(
        'Could not generate upload URL. Please try again.',
      );
    }

    this.logger.log(
      `Presigned URL issued for user=${userId} purpose=${dto.purpose} key=${key}`,
    );

    // Track the upload intent — purpose is now stored explicitly,
    // so confirm/delete never need to guess it from the key string.
    await this.prisma.media.create({
      data: {
        key,
        purpose: dto.purpose,
        mimeType: dto.mimeType,
        uploadedBy: userId,
        status: 'PENDING',
        fileSize: 0,
      },
    });

    return plainToInstance(PresignedUrlResponseDto, {
      uploadUrl: data.signedUrl,
      key,
      token: data.token,
    });
  }

  // Step 2: Confirm upload

  async confirmUpload(userId: string, dto: ConfirmUploadDto) {
    // Look up the pending Media row created at presign time — this is now
    // the single source of truth for purpose/bucket, not key-string parsing.
    const existing = await this.prisma.media.findUnique({
      where: { key: dto.key },
    });

    if (!existing) {
      throw new NotFoundException(
        'Upload session not found. Please request a new upload URL.',
      );
    }

    if (existing.uploadedBy !== userId) {
      throw new ForbiddenException(
        'This upload is associated with another account.',
      );
    }

    // Cross-check client-declared purpose against what was actually
    // requested at presign time — catches tampering/bugs early.
    if (dto.purpose !== existing.purpose) {
      throw new BadRequestException(
        `Declared purpose "${dto.purpose}" does not match the original upload request.`,
      );
    }

    const resolvedPurpose = existing.purpose;

    // Ownership is still enforced via the key's first path segment.
    this.assertKeyOwnership(dto.key, userId);

    const bucket = this.buckets[resolvedPurpose];

    if (existing.status === 'CONFIRMED') {
      return plainToInstance(ConfirmUploadResponseDto, {
        id: existing.id,
        key: existing.key,
        url: await this.getAccessUrl(dto.key, resolvedPurpose),
      });
    }

    const { data: objects, error } = await this.supabase.storage
      .from(bucket)
      .list(path.dirname(dto.key), {
        search: path.basename(dto.key),
        limit: 1,
      });

    if (error) {
      this.logger.error('Supabase list error during confirm', error);
      throw new InternalServerErrorException(
        'Could not verify upload. Please try again.',
      );
    }

    const uploaded = objects?.find((o) => o.name === path.basename(dto.key));
    if (!uploaded) {
      throw new NotFoundException(
        'Upload not found. Ensure the file was uploaded before confirming.',
      );
    }

    const fileSize = uploaded.metadata?.size ?? 0;
    const maxSize = MAX_FILE_SIZES[resolvedPurpose];

    if (fileSize > maxSize) {
      await this.supabase.storage.from(bucket).remove([dto.key]);
      throw new BadRequestException(
        `File size ${fileSize} bytes exceeds the ${maxSize / 1024 / 1024}MB limit for ${resolvedPurpose} uploads.`,
      );
    }

    const media = await this.prisma.media.update({
      where: { key: dto.key },
      data: {
        fileSize,
        status: 'CONFIRMED',
      },
    });

    this.logger.log(
      `Upload confirmed: mediaId=${media.id} key=${dto.key} size=${fileSize}B`,
    );

    return plainToInstance(ConfirmUploadResponseDto, {
      id: media.id,
      key: media.key,
      url: await this.getAccessUrl(dto.key, resolvedPurpose),
    });
  }

  // ---------------------------------------------------------------------
  // URL resolution
  // ---------------------------------------------------------------------

  async getAccessUrl(key: string, purpose: UploadPurpose): Promise<string> {
    if (purpose === UploadPurpose.DOCUMENT) {
      const { data, error } = await this.supabase.storage
        .from(this.buckets[purpose])
        .createSignedUrl(key, DOCUMENT_SIGNED_URL_TTL);

      if (error || !data) {
        this.logger.error('Failed to create signed document URL', error);
        throw new InternalServerErrorException(
          'Could not generate document access URL.',
        );
      }
      return data.signedUrl;
    }

    return this.getPublicUrl(key, purpose);
  }

  /** Build the public read URL for a storage key. Only valid for public buckets. */
  public getPublicUrl(key: string, purpose: UploadPurpose): string {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    return `${url}/storage/v1/object/public/${this.buckets[purpose]}/${key}`;
  }

  // ---------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------

  async deleteByMediaId(mediaId: string, userId: string): Promise<void> {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException('Media not found');
    if (media.uploadedBy !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this file',
      );
    }

    // Purpose comes straight from the DB record now — no more key parsing.
    const purpose = media.purpose;
    const bucket = this.buckets[purpose];

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([media.key]);
    if (error) {
      this.logger.error(`Failed to delete ${media.key} from Supabase`, error);
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
    this.logger.log(`Deleted media id=${mediaId} key=${media.key}`);
  }

  // ---------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------

  /**
   * Enforce that a storage key's owner segment matches the requesting user.
   * Key formats (no purpose-prefix anymore):
   *   avatar / document: {userId}/{uuid}{ext}
   *   experience:        {userId}/{experienceId}/{uuid}{ext}
   * So the userId is always the FIRST segment now.
   */
  private assertKeyOwnership(key: string, userId: string): void {
    const segments = key.split('/');
    const ownerSegment = segments[0];
    if (ownerSegment !== userId) {
      throw new ForbiddenException('You do not own this upload key.');
    }
  }

  private mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };
    return map[mimeType] ?? '';
  }
}
