import { PrismaClient, EnvironmentName, FlagType, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      passwordHash,
      name: 'Demo Owner',
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Org',
      slug: 'demo-org',
      members: {
        create: {
          userId: user.id,
          role: Role.OWNER,
        },
      },
    },
  });

  const project = await prisma.project.upsert({
    where: { organizationId_key: { organizationId: org.id, key: 'web-app' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Web App',
      key: 'web-app',
    },
  });

  const environments = await prisma.environment.findMany({
    where: { projectId: project.id },
  });

  if (environments.length === 0) {
    await prisma.environment.createMany({
      data: [
        { projectId: project.id, name: EnvironmentName.DEV, sdkKey: `sdk_dev_${randomUUID()}` },
        { projectId: project.id, name: EnvironmentName.STAGING, sdkKey: `sdk_stg_${randomUUID()}` },
        { projectId: project.id, name: EnvironmentName.PROD, sdkKey: `sdk_prod_${randomUUID()}` },
      ],
    });
  }

  const flag = await prisma.featureFlag.upsert({
    where: { projectId_key: { projectId: project.id, key: 'new-checkout' } },
    update: {},
    create: {
      projectId: project.id,
      key: 'new-checkout',
      name: 'New Checkout',
      description: 'Controls rollout of new checkout UI',
      type: FlagType.BOOLEAN,
      defaultValue: true,
      rules: [
        {
          name: 'Beta Users',
          conditions: [{ field: 'emailDomain', op: 'equals', value: 'example.com' }],
          rollout: { percentage: 50 },
        },
      ],
    },
  });

  const envRecords = await prisma.environment.findMany({ where: { projectId: project.id } });

  for (const env of envRecords) {
    await prisma.flagEnvironmentValue.upsert({
      where: { flagId_environmentId: { flagId: flag.id, environmentId: env.id } },
      update: { value: env.name === EnvironmentName.PROD ? false : true },
      create: { flagId: flag.id, environmentId: env.id, value: env.name === EnvironmentName.PROD ? false : true },
    });
  }

  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      actorId: user.id,
      action: 'seed',
      entityType: 'seed',
      entityId: project.id,
      diff: { message: 'Seeded demo data' },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
