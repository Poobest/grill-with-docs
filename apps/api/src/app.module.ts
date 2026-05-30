import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ContractsModule } from './tenant/contracts/contracts.module';
import { PaymentsModule } from './tenant/payments/payments.module';
import { ProductsModule } from './tenant/products/products.module';
import { CustomersModule } from './tenant/customers/customers.module';
import { DashboardModule } from './tenant/dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ContractsModule,
    PaymentsModule,
    ProductsModule,
    CustomersModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Every route is protected by default; open routes use @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
