import { Module } from '@nestjs/common';
import { CommissionsModule } from '../commissions/commissions.module';
import { StockModule } from '../stock/stock.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [StockModule, CommissionsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
