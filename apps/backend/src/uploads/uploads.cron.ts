import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from './uploads.service';

@Injectable()
export class UploadsCronService {
  private readonly logger = new Logger(UploadsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Run every night at midnight to delete abandoned uploads.
   * Finds PENDING media older than 24 hours.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Starting cleanup of abandoned PENDING uploads...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const abandonedUploads = await this.prisma.media.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
      });

      if (abandonedUploads.length === 0) {
        this.logger.log('No abandoned uploads to clean up.');
        return;
      }

      this.logger.log(`Found ${abandonedUploads.length} abandoned uploads.`);

      let deletedCount = 0;
      for (const upload of abandonedUploads) {
        try {
          // Delete from storage
          await this.uploadsService.deleteByMediaId(
            upload.id,
            upload.uploadedBy || '',
          );
          deletedCount++;
        } catch (err) {
          this.logger.error(
            `Failed to cleanup abandoned upload ${upload.id}`,
            err,
          );
        }
      }

      this.logger.log(
        `Successfully cleaned up ${deletedCount} abandoned uploads.`,
      );
    } catch (error) {
      this.logger.error('Error during abandoned uploads cleanup', error);
    }
  }
}
