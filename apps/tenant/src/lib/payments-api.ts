import { apiFetch } from '@/lib/api';

export interface DuePayment {
  id: string;
  contractId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  amount: number;
  dueDate: string;
  isDownPayment: boolean;
  overdueDays: number;
}

export interface ApprovedPayment {
  id: string;
  status: string;
  method: string | null;
  receiptNumber: string | null;
}

export function fetchCollectToday(): Promise<DuePayment[]> {
  return apiFetch<DuePayment[]>('/payments/collect-today');
}

export function recordCash(paymentId: string): Promise<ApprovedPayment> {
  return apiFetch<ApprovedPayment>(`/payments/${paymentId}/cash`, {
    method: 'POST',
  });
}
