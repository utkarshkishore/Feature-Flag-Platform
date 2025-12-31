import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  list(@Headers('x-org-id') orgId: string) {
    return this.audit.list(orgId);
  }
}
