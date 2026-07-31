import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/strategies/jwt.strategy';
import {
  ConfirmUploadDto,
  RequestPresignedUrlDto,
} from './dto/create-upload.dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * POST /uploads/presign
   * Returns a short-lived Supabase presigned upload URL + the object key.
   * The client PUTs the binary directly to this URL (backend never touches the file bytes).
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
   * Confirms the upload completed. Creates/updates the Media row in DB.
   * Returns { id, key, url } to attach to the owning entity.
   */
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.uploadsService.confirmUpload(user.sub, dto);
  }

  /**
   * DELETE /uploads/:id
   * Deletes the media record from DB and the file from Supabase storage.
   * Only the original uploader can delete their own files.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.uploadsService.deleteByMediaId(id, user.sub);
  }
}
