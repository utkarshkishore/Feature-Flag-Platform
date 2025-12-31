import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { evaluateFlag, UserContext } from './flag-evaluator';
import { createHash } from 'crypto';

@Injectable()
export class SdkService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async getFlags(sdkKey: string, user: UserContext) {
    const environment = await this.prisma.environment.findUnique({ where: { sdkKey } });
    if (!environment) {
      throw new UnauthorizedException('Invalid SDK key');
    }

    const userHash = createHash('sha256')
      .update(JSON.stringify({
        userId: user.userId || '',
        email: user.email || '',
        country: user.country || '',
        appVersion: user.appVersion || '',
      }))
      .digest('hex');

    const cacheKey = `flags:${environment.id}:${userHash}`;
    const cached = await this.redis.client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const flags = await this.prisma.featureFlag.findMany({
      where: { projectId: environment.projectId },
      include: { values: true },
    });

    const segments = await this.prisma.segment.findMany({
      where: { projectId: environment.projectId },
    });

    const evaluated = flags.map((flag) => {
      const envValue = flag.values.find((value) => value.environmentId === environment.id);
      return evaluateFlag(flag, envValue, user, segments);
    });

    const response = {
      environment: environment.name,
      flags: evaluated.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>),
      reasons: evaluated.reduce((acc, curr) => {
        acc[curr.key] = curr.reason;
        return acc;
      }, {} as Record<string, string>),
    };

    await this.redis.client.set(cacheKey, JSON.stringify(response), 'EX', 30);
    return response;
  }
}
