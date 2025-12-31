import { Body, Controller, Get, Headers, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../common/roles.guard';
import { FlagsService } from './flags.service';
import { CreateFlagDto, UpdateFlagDto } from './flags.dto';

@Controller('flags')
@UseGuards(JwtAuthGuard)
export class FlagsController {
  constructor(private flags: FlagsService) {}

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.flags.list(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.flags.get(id);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @UseGuards(RolesGuard)
  create(@Headers('x-org-id') orgId: string, @Body() dto: CreateFlagDto) {
    return this.flags.create(orgId, dto);
  }

  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @UseGuards(RolesGuard)
  update(@Headers('x-org-id') orgId: string, @Param('id') id: string, @Body() dto: UpdateFlagDto) {
    return this.flags.update(orgId, id, dto);
  }
}
