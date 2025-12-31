import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../common/roles.guard';
import { InviteUserDto } from './organizations.dto';
import { Request } from 'express';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private orgs: OrganizationsService) {}

  @Get()
  list(@Req() req: Request & { user: any }) {
    return this.orgs.listForUser(req.user.id);
  }

  @Post('invite')
  @Roles(Role.OWNER, Role.ADMIN)
  @UseGuards(RolesGuard)
  invite(@Headers('x-org-id') orgId: string, @Body() dto: InviteUserDto) {
    return this.orgs.invite(orgId, dto.email, dto.role);
  }
}
