import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true },
    });
  }

  async invite(orgId: string, email: string, role: Role) {
    const token = randomUUID();
    const invite = await this.prisma.invitation.create({
      data: {
        organizationId: orgId,
        email,
        role,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });
    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        action: 'invite.create',
        entityType: 'invitation',
        entityId: invite.id,
        diff: { email, role },
      },
    });
    return invite;
  }
}
