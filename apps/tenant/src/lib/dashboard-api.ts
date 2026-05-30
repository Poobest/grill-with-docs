import { apiFetch } from '@/lib/api';

export interface DashboardKpi {
  totalCollected: number;
  totalCommission: number;
  overdueContracts: number;
  totalStock: number;
}

export function fetchDashboardKpi(): Promise<DashboardKpi> {
  return apiFetch<DashboardKpi>('/dashboard/kpi');
}
