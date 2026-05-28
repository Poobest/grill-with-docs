import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { CurrentTenant, CurrentUser } from '../../common/decorators/tenant.decorator';
import { CommissionsService } from './commissions.service';

@Controller('commissions')
@UseGuards(AuthGuard('jwt'))
export class CommissionsController {
  constructor(private service: CommissionsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string; role: UserRole },
    @Query('userId') userId?: string,
  ) {
    // Sale และ Sale Lead เห็นแค่ commission ของตัวเอง
    const scopedUserId =
      user.role === UserRole.TENANT_ADMIN ? userId : user.id;
    return this.service.findAll(tenantId, { userId: scopedUserId });
  }
}
