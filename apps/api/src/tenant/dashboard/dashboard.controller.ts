import { Controller, Get } from '@nestjs/common';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('kpi')
  kpi(@TenantId() tenantId: string) {
    return this.dashboard.getKpi(tenantId);
  }
}
