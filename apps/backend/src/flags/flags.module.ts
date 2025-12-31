import { Module } from '@nestjs/common';
import { FlagsController } from './flags.controller';
import { FlagsService } from './flags.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [FlagsController],
  providers: [FlagsService, PrismaService],
})
export class FlagsModule {}
