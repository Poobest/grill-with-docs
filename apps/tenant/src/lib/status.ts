import type { BadgeVariants } from '@/components/ui/badge'

export type ContractStatus =
  | 'PENDING_DOWN_PAYMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DEFAULTED'

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type BadgeVariant = NonNullable<BadgeVariants['variant']>

interface StatusMeta {
  label: string
  variant: BadgeVariant
}

/** Contract status → Thai label + badge variant (UI-SPEC status palette). */
export const CONTRACT_STATUS: Record<ContractStatus, StatusMeta> = {
  PENDING_DOWN_PAYMENT: { label: 'รอชำระเงินดาวน์', variant: 'warning' },
  ACTIVE: { label: 'กำลังผ่อน', variant: 'success' },
  COMPLETED: { label: 'ปิดสัญญาแล้ว', variant: 'success' },
  CANCELLED: { label: 'ยกเลิก', variant: 'neutral' },
  DEFAULTED: { label: 'ผิดนัดชำระ', variant: 'danger' },
}

/** Payment status → Thai label + badge variant. */
export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  PENDING: { label: 'รออนุมัติ', variant: 'warning' },
  APPROVED: { label: 'อนุมัติแล้ว', variant: 'success' },
  REJECTED: { label: 'ปฏิเสธ', variant: 'danger' },
}
