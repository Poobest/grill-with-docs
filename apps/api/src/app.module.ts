import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './common/guards/roles.guard';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { BranchesModule } from './tenant/branches/branches.module';
import { UsersModule } from './tenant/users/users.module';
import { ProductsModule } from './tenant/products/products.module';
import { StockModule } from './tenant/stock/stock.module';
import { CustomersModule } from './tenant/customers/customers.module';
import { ContractsModule } from './tenant/contracts/contracts.module';
import { PaymentsModule } from './tenant/payments/payments.module';
import { CommissionsModule } from './tenant/commissions/commissions.module';
import { JobsModule } from './jobs/jobs.module';
import { PlansModule } from './platform/plans/plans.module';
import { TenantsModule } from './platform/tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    BranchesModule,
    UsersModule,
    ProductsModule,
    StockModule,
    CustomersModule,
    ContractsModule,
    PaymentsModule,
    CommissionsModule,
    JobsModule,
    PlansModule,
    TenantsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard('jwt') },
    { provide: APP_GUARD, useClass: SubscriptionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
