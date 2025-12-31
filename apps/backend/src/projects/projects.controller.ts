import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../common/roles.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../organizations/organizations.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  list(@Headers('x-org-id') orgId: string) {
    return this.projects.list(orgId);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @UseGuards(RolesGuard)
  create(@Headers('x-org-id') orgId: string, @Body() dto: CreateProjectDto) {
    return this.projects.create(orgId, dto.name, dto.key);
  }

  @Get(':projectId/environments')
  listEnvs(@Param('projectId') projectId: string) {
    return this.projects.listEnvironments(projectId);
  }
}
