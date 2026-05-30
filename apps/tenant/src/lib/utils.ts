import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a THB amount per UI-SPEC: `฿1,234` (no decimals for whole baht). */
export function formatThb(amount: number): string {
  return `฿${Math.round(amount).toLocaleString('th-TH')}`
}

/** Format an ISO date string as a short Thai (Buddhist-era) date, e.g. 30 พ.ค. 69. */
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })
}
