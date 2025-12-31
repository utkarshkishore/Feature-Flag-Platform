import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from './prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string } | undefined;
    const orgId = request.headers['x-org-id'] as string | undefined;
    if (!user || !orgId) {
      throw new ForbiddenException('Missing organization context');
    }
    const membership = await this.prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this organization');
    }
    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    request.membership = membership;
    return true;
  }
}
