import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EnvironmentName } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  list(orgId: string) {
    return this.prisma.project.findMany({
      where: { organizationId: orgId },
      include: { environments: true },
    });
  }

  async create(orgId: string, name: string, key: string) {
    const project = await this.prisma.project.create({
      data: {
        organizationId: orgId,
        name,
        key,
        environments: {
          create: [
            { name: EnvironmentName.DEV, sdkKey: `sdk_dev_${randomUUID()}` },
            { name: EnvironmentName.STAGING, sdkKey: `sdk_stg_${randomUUID()}` },
            { name: EnvironmentName.PROD, sdkKey: `sdk_prod_${randomUUID()}` },
          ],
        },
      },
      include: { environments: true },
    });
    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        action: 'project.create',
        entityType: 'project',
        entityId: project.id,
        diff: { name, key },
      },
    });
    return project;
  }

  listEnvironments(projectId: string) {
    return this.prisma.environment.findMany({ where: { projectId } });
  }
}
