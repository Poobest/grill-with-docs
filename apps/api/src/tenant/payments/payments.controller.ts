import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentStatus, UserRole } from '@prisma/client';
import { CurrentTenant, CurrentUser } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { RecordCashDto, SubmitSlipDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('contractId') contractId?: string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.service.findAll(tenantId, { contractId, status });
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post('cash')
  @Roles(UserRole.SALE, UserRole.SALE_LEAD, UserRole.TENANT_ADMIN)
  recordCash(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RecordCashDto,
  ) {
    return this.service.recordCash(tenantId, user.id, dto);
  }

  @Post('slip')
  submitSlip(
    @CurrentTenant() tenantId: string,
    @Body() dto: SubmitSlipDto,
  ) {
    return this.service.submitSlip(tenantId, dto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.SALE, UserRole.SALE_LEAD, UserRole.TENANT_ADMIN)
  approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.approve(tenantId, user.id, id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.SALE, UserRole.SALE_LEAD, UserRole.TENANT_ADMIN)
  reject(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.reject(tenantId, id);
  }
}
