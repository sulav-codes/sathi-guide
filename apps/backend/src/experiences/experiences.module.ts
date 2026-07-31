import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
