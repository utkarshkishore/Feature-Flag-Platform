import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { FlagsModule } from './flags/flags.module';
import { AuditModule } from './audit/audit.module';
import { SdkModule } from './sdk/sdk.module';
import { HealthModule } from './health/health.module';
import { SegmentsModule } from './segments/segments.module';
import { RequestIdMiddleware } from './common/request-id.middleware';
import { RequestLoggerMiddleware } from './common/request-logger.middleware';

@Module({
  imports: [
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    FlagsModule,
    AuditModule,
    SdkModule,
    HealthModule,
    SegmentsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
