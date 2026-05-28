import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { StockModule } from '../stock/stock.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [CustomersModule, StockModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
