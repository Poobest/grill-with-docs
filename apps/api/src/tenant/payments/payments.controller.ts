import { Controller, Param, Post } from '@nestjs/common';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

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
