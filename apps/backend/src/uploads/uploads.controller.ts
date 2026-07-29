import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/strategies/jwt.strategy';
import { ConfirmUploadDto, RequestPresignedUrlDto } from './dto/create-upload.dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * POST /uploads/presign
   * Returns a short-lived Supabase presigned upload URL.
   * The mobile client PUTs the binary directly to this URL.
   */
  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async requestPresignedUrl(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestPresignedUrlDto,
  ) {
    return this.uploadsService.requestPresignedUrl(user.sub, dto);
  }

  /**
   * POST /uploads/confirm
   * Confirms the upload completed. Creates/updates Media row in DB.
   * Returns the media id + public URL to attach to the entity.
   */
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.uploadsService.confirmUpload(user.sub, dto);
  }
}
