import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  CurrentUser,
  TenantId,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Pending payments due today or earlier — the Sale collect-today worklist. */
  @Get('collect-today')
  collectToday(@TenantId() tenantId: string) {
    return this.payments.listDue(tenantId);
  }

  /** Records a cash collection at the branch and approves it. */
  @Post(':id/cash')
  recordCash(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payments.recordCash(id, user.userId);
  }

  /** Approves a submitted transfer slip. */
  @Post(':id/approve')
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payments.approve(id, user.userId);
  }
}
