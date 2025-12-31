import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SegmentsService {
  constructor(private prisma: PrismaService) {}

  list(projectId: string) {
    return this.prisma.segment.findMany({ where: { projectId } });
  }

  async create(orgId: string, data: any) {
    const segment = await this.prisma.segment.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        rules: data.rules,
      },
    });
    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        action: 'segment.create',
        entityType: 'segment',
        entityId: segment.id,
        diff: { name: segment.name },
      },
    });
    return segment;
  }
}
