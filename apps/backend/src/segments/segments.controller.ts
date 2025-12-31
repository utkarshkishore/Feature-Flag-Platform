import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../common/roles.guard';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './segments.dto';

@Controller('segments')
@UseGuards(JwtAuthGuard)
export class SegmentsController {
  constructor(private segments: SegmentsService) {}

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.segments.list(projectId);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @UseGuards(RolesGuard)
  create(@Headers('x-org-id') orgId: string, @Body() dto: CreateSegmentDto) {
    return this.segments.create(orgId, dto);
  }
}
