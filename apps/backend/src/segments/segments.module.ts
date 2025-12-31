import { Module } from '@nestjs/common';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [SegmentsController],
  providers: [SegmentsService, PrismaService],
})
export class SegmentsModule {}
