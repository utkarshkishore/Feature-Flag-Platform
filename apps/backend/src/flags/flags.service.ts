import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlagsService {
  constructor(private prisma: PrismaService) {}

  list(projectId: string) {
    return this.prisma.featureFlag.findMany({
      where: { projectId },
      include: { values: true },
    });
  }

  get(id: string) {
    return this.prisma.featureFlag.findUnique({
      where: { id },
      include: { values: true },
    });
  }

  async create(orgId: string, input: any) {
    const envValues = input.envValues as Record<string, Prisma.InputJsonValue> | undefined;
    const flag = await this.prisma.featureFlag.create({
      data: {
        projectId: input.projectId,
        key: input.key,
        name: input.name,
        description: input.description,
        type: input.type,
        defaultValue: input.defaultValue,
        rules: input.rules || [],
        values: envValues
          ? {
              create: Object.entries(envValues).map(([environmentId, value]) => ({
                environment: { connect: { id: environmentId } },
                value,
              })),
            }
          : undefined,
      },
      include: { values: true },
    });
    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        action: 'flag.create',
        entityType: 'flag',
        entityId: flag.id,
        diff: { key: flag.key },
      },
    });
    return flag;
  }

  async update(orgId: string, id: string, input: any) {
    const envValues = input.envValues as Record<string, Prisma.InputJsonValue> | undefined;
    const flag = await this.prisma.featureFlag.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        defaultValue: input.defaultValue,
        rules: input.rules,
      },
      include: { values: true },
    });

    if (envValues) {
      for (const [environmentId, value] of Object.entries(envValues)) {
        await this.prisma.flagEnvironmentValue.upsert({
          where: { flagId_environmentId: { flagId: id, environmentId } },
          update: { value },
          create: { flagId: id, environmentId, value },
        });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        action: 'flag.update',
        entityType: 'flag',
        entityId: id,
        diff: { updates: input },
      },
    });

    return this.get(id);
  }
}
