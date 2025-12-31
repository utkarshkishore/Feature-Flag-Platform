import { Controller, Get, Headers, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { SdkService } from './sdk.service';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from '../common/redis.service';
import { Request } from 'express';

@Controller('sdk')
export class SdkController {
  private limiter: RateLimiterRedis;

  constructor(private sdk: SdkService, private redis: RedisService) {
    const points = Number(process.env.SDK_RATE_LIMIT_PER_MINUTE || 120);
    this.limiter = new RateLimiterRedis({
      storeClient: this.redis.client,
      points,
      duration: 60,
      keyPrefix: 'sdk-rate',
    });
  }

  @Get('flags')
  async getFlags(
    @Headers('x-sdk-key') sdkKey: string,
    @Req() req: Request,
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('country') country?: string,
    @Query('appVersion') appVersion?: string,
  ) {
    const identifier = `${sdkKey}:${req.ip}`;
    try {
      await this.limiter.consume(identifier, 1);
    } catch (error) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    return this.sdk.getFlags(sdkKey, { userId, email, country, appVersion });
  }
}
