import { apiFetch } from '@/lib/api';
import type { ContractStatus } from '@/lib/status';

export type PaymentType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CASH';

export interface ContractListItem {
  id: string;
  customerName: string;
  productName: string;
  paymentType: PaymentType;
  status: ContractStatus;
  totalAmount: number;
  outstanding: number;
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  DAILY: 'รายวัน',
  WEEKLY: 'รายสัปดาห์',
  MONTHLY: 'รายเดือน',
  CASH: 'เงินสด',
};

export function fetchContracts(): Promise<ContractListItem[]> {
  return apiFetch<ContractListItem[]>('/contracts');
}
