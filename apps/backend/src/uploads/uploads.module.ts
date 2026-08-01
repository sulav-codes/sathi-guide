import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsCronService } from './uploads.cron';

@Module({
  imports: [PrismaModule],
  controllers: [UploadsController],
  providers: [UploadsService, UploadsCronService],
  exports: [UploadsService], // Other modules can inject UploadsService for avatar/doc uploads
})
export class UploadsModule {}
