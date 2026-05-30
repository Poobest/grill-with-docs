import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a THB amount per UI-SPEC: `฿1,234` (no decimals for whole baht). */
export function formatThb(amount: number): string {
  return `฿${Math.round(amount).toLocaleString('th-TH')}`
}
