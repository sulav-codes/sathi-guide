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
  UploadPurpose,
} from './dto/create-upload.dto';
import * as path from 'path';
import * as crypto from 'crypto';

/** Max allowed file size per purpose (in bytes) */
const MAX_FILE_SIZES: Record<UploadPurpose, number> = {
  [UploadPurpose.EXPERIENCE]: 2 * 1024 * 1024, // 2 MB
  [UploadPurpose.AVATAR]: 1 * 1024 * 1024, // 1 MB
  [UploadPurpose.DOCUMENT]: 5 * 1024 * 1024, // 5 MB
};

const ALLOWED_MIME_TYPES: Record<UploadPurpose, string[]> = {
  [UploadPurpose.EXPERIENCE]: ['image/jpeg', 'image/png', 'image/webp'],
  [UploadPurpose.AVATAR]: ['image/jpeg', 'image/png', 'image/webp'],
  [UploadPurpose.DOCUMENT]: ['image/jpeg', 'image/png', 'application/pdf'],
};

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

  /**
   * Step 1: Generate a short-lived presigned upload URL.
   * The client uploads directly to Supabase — the backend never handles the binary.
   */
  async requestPresignedUrl(userId: string, dto: RequestPresignedUrlDto) {
    // Validate MIME type
    const allowed = ALLOWED_MIME_TYPES[dto.purpose];
    if (!allowed.includes(dto.mimeType)) {
      throw new BadRequestException(
        `Invalid file type "${dto.mimeType}" for purpose "${dto.purpose}". Allowed: ${allowed.join(', ')}`,
      );
    }

    // Build a predictable, ownership-scoped storage key (generated purely on the backend)
    const ext = this.mimeToExt(dto.mimeType);
    const uuid = crypto.randomUUID();
    let key: string;

    switch (dto.purpose) {
      case UploadPurpose.AVATAR:
        // avatars/{userId}/avatar{ext}  — predictable, no UUID needed (always replaces)
        key = `avatars/${userId}/avatar${ext}`;
        break;
      case UploadPurpose.DOCUMENT:
        // verification-documents/{userId}/{uuid}{ext}
        key = `verification-documents/${userId}/${uuid}${ext}`;
        break;
      case UploadPurpose.EXPERIENCE:
      default: {
        // experience-images/{userId}/{experienceId}/{uuid}{ext}  OR  experience-images/{userId}/temp/{uuid}{ext}
        const expSegment = dto.experienceId ?? 'temp';
        key = `experience-images/${userId}/${expSegment}/${uuid}${ext}`;
        break;
      }
    }

    // Ask Supabase for a presigned upload URL (valid for 10 minutes)
    const { data, error } = await this.supabase.storage
      .from(this.buckets[dto.purpose])
      .createSignedUploadUrl(key, { upsert: false });

    if (error || !data) {
      this.logger.error('Failed to create presigned URL', error);
      throw new InternalServerErrorException(
        'Could not generate upload URL. Please try again.',
      );
    }

    this.logger.log(
      `Presigned URL issued for user=${userId} purpose=${dto.purpose} key=${key}`,
    );

    return {
      uploadUrl: data.signedUrl,
      key, // client echoes this back in /confirm
      token: data.token, // may be needed by Supabase JS client
    };
  }

  /**
   * Step 2: Confirm the upload completed.
   * Verify the object exists in Supabase, then upsert a Media row.
   * Returns the Media record that can be attached to an experience/profile.
   */
  async confirmUpload(userId: string, dto: ConfirmUploadDto) {
    // Verify object actually exists in bucket (guards against fake confirms)
    const { data: objects, error } = await this.supabase.storage
      .from(this.buckets[dto.purpose])
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
    const maxSize = MAX_FILE_SIZES[dto.purpose];

    if (fileSize > maxSize) {
      // Clean up oversized file
      await this.supabase.storage
        .from(this.buckets[dto.purpose])
        .remove([dto.key]);
      throw new BadRequestException(
        `File size ${fileSize} bytes exceeds the ${maxSize / 1024 / 1024}MB limit for ${dto.purpose} uploads.`,
      );
    }

    // Upsert Media row — idempotent if client retries
    const media = await this.prisma.media.upsert({
      where: { key: dto.key },
      update: { uploadedBy: userId },
      create: {
        key: dto.key,
        mimeType: dto.mimeType,
        fileSize,
        uploadedBy: userId,
      },
    });

    this.logger.log(
      `Upload confirmed: mediaId=${media.id} key=${dto.key} size=${fileSize}B`,
    );

    return {
      id: media.id,
      key: media.key,
      url: this.getPublicUrl(dto.key, dto.purpose),
    };
  }

  /** Build the public read URL for a storage key. */
  getPublicUrl(key: string, purpose: UploadPurpose): string {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    return `${url}/storage/v1/object/public/${this.buckets[purpose]}/${key}`;
  }

  /**
   * Delete a Media record and its file from Supabase storage.
   * Called internally (e.g., when removing an experience image or replacing an avatar).
   * @param mediaId  The DB Media.id
   * @param userId   Must match Media.uploadedBy — enforces ownership
   */
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

    // Determine which bucket by the key prefix
    const bucket = this.resolveBucketFromKey(media.key);

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([media.key]);
    if (error) {
      this.logger.error(`Failed to delete ${media.key} from Supabase`, error);
      // Don't throw — the DB record will still be cleaned up
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
    this.logger.log(`Deleted media id=${mediaId} key=${media.key}`);
  }

  /** Resolve the correct bucket name from the object key prefix. */
  private resolveBucketFromKey(key: string): string {
    if (key.startsWith('avatars/')) return this.buckets[UploadPurpose.AVATAR];
    if (key.startsWith('verification-documents/'))
      return this.buckets[UploadPurpose.DOCUMENT];
    return this.buckets[UploadPurpose.EXPERIENCE]; // experience-images/
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
