import { apiFetch } from '@/lib/api';
import type { Customer, Product } from '@/lib/contracts-api';

// ── Products ──────────────────────────────────────────────────────────────
export interface CreateProductPayload {
  name: string;
  cashPrice: number;
  downPayment: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
}

export function createProduct(payload: CreateProductPayload): Promise<Product> {
  return apiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Customers ─────────────────────────────────────────────────────────────
export function createCustomer(payload: {
  name: string;
  phone: string;
  contractLimit: number;
}): Promise<Customer> {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function setCustomerSuspended(
  id: string,
  isSuspended: boolean,
): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ isSuspended }),
  });
}

// ── Branches ──────────────────────────────────────────────────────────────
export interface Branch {
  id: string;
  name: string;
  address: string | null;
}

export function fetchBranches(): Promise<Branch[]> {
  return apiFetch<Branch[]>('/branches');
}

export function createBranch(payload: {
  name: string;
  address?: string;
}): Promise<Branch> {
  return apiFetch<Branch>('/branches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Users ─────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'SALE_LEAD' | 'SALE';

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string | null;
  branchName: string | null;
  installmentRate: number;
  cashRate: number;
  overrideRate: number;
  isActive: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: string;
  installmentRate?: number;
  cashRate?: number;
  overrideRate?: number;
}

export function fetchUsers(): Promise<TenantUser[]> {
  return apiFetch<TenantUser[]>('/users');
}

export function createUser(payload: CreateUserPayload): Promise<TenantUser> {
  return apiFetch<TenantUser>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'ผู้ดูแลร้าน',
  SALE_LEAD: 'หัวหน้าทีมขาย',
  SALE: 'พนักงานขาย',
};

// ── Stock ─────────────────────────────────────────────────────────────────
export interface StockRow {
  branchId: string;
  productId: string;
  branchName: string;
  productName: string;
  quantity: number;
}

export function fetchStock(): Promise<StockRow[]> {
  return apiFetch<StockRow[]>('/stock');
}

export function setStock(payload: {
  branchId: string;
  productId: string;
  quantity: number;
}): Promise<unknown> {
  return apiFetch('/stock', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
