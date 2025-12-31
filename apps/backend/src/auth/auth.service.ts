import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Role } from '@prisma/client';

const ACCESS_TTL_SECONDS = 900;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private get jwtSecret() {
    return process.env.JWT_SECRET || 'dev_jwt_secret';
  }

  private get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret';
  }

  async register(email: string, password: string, name: string | undefined, orgName: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        memberships: {
          create: {
            role: Role.OWNER,
            organization: {
              create: { name: orgName, slug: `${slug}-${randomUUID().slice(0, 6)}` },
            },
          },
        },
      },
      include: { memberships: { include: { organization: true } } },
    });
    const org = user.memberships[0].organization;
    return this.issueTokens(user.id, email, org.id);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });
    if (!membership) {
      throw new UnauthorizedException('No organization membership');
    }
    return this.issueTokens(user.id, email, membership.organizationId);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, { secret: this.refreshSecret });
      const record = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
      if (!record || record.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      return this.issueTokens(user.id, user.email, payload.orgId);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  private async issueTokens(userId: string, email: string, orgId: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, orgId },
      { secret: this.jwtSecret, expiresIn: ACCESS_TTL_SECONDS },
    );
    const refreshId = randomUUID();
    const refreshToken = this.jwt.sign(
      { sub: userId, jti: refreshId, orgId },
      { secret: this.refreshSecret, expiresIn: REFRESH_TTL_SECONDS },
    );
    await this.prisma.refreshToken.create({
      data: {
        id: refreshId,
        userId,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      },
    });
    return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS };
  }
}
