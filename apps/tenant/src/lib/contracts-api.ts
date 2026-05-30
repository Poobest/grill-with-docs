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

export interface Product {
  id: string;
  name: string;
  cashPrice: number;
  downPayment: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  isSuspended: boolean;
  contractLimit: number;
}

export interface CreateContractPayload {
  customerId: string;
  productId: string;
  branchId: string;
  paymentType: PaymentType;
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  DAILY: 'รายวัน',
  WEEKLY: 'รายสัปดาห์',
  MONTHLY: 'รายเดือน',
  CASH: 'เงินสด',
};

export interface ContractDetailPayment {
  id: string;
  seq: number;
  amount: number;
  dueDate: string;
  isDownPayment: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  method: string | null;
  paidAt: string | null;
  receiptNumber: string | null;
}

export interface ContractDetail {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  branchName: string;
  saleName: string;
  paymentType: PaymentType;
  status: ContractStatus;
  totalAmount: number;
  outstanding: number;
  installmentCount: number;
  paidCount: number;
  createdAt: string;
  payments: ContractDetailPayment[];
}

export function fetchContracts(): Promise<ContractListItem[]> {
  return apiFetch<ContractListItem[]>('/contracts');
}

export function fetchContractDetail(id: string): Promise<ContractDetail> {
  return apiFetch<ContractDetail>(`/contracts/${id}`);
}

export function fetchProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products');
}

export function fetchCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/customers');
}

export function createContract(payload: CreateContractPayload): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/contracts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface SchedulePreview {
  downPayment: number;
  installmentCount: number;
  installmentAmount: number;
  total: number;
}

const INSTALLMENTS: Record<PaymentType, number> = {
  DAILY: 30,
  WEEKLY: 12,
  MONTHLY: 12,
  CASH: 0,
};

/**
 * Client-side mirror of the server schedule for preview only (mirrors
 * ContractsService.buildSchedule counts). The server remains the source of truth.
 */
export function previewSchedule(
  product: Product,
  paymentType: PaymentType,
): SchedulePreview {
  if (paymentType === 'CASH') {
    return {
      downPayment: 0,
      installmentCount: 1,
      installmentAmount: product.cashPrice,
      total: product.cashPrice,
    };
  }
  const price =
    paymentType === 'DAILY'
      ? product.dailyPrice
      : paymentType === 'WEEKLY'
        ? product.weeklyPrice
        : product.monthlyPrice;
  const count = INSTALLMENTS[paymentType];
  return {
    downPayment: product.downPayment,
    installmentCount: count,
    installmentAmount: price,
    total: product.downPayment + count * price,
  };
}
