import { type VariantProps, cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

/*
 * Status palette mirrors the UI-SPEC "Status badge palette":
 *   success  → ACTIVE / APPROVED / COMPLETED (emerald)
 *   warning  → PENDING_DOWN_PAYMENT / PENDING (amber)
 *   danger   → DEFAULTED / REJECTED (red)
 *   neutral  → CANCELLED (slate)
 * These are semantic status tokens, intentionally outside the 10% accent budget.
 */
export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold leading-tight transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        success:
          'border-transparent bg-status-success-bg text-status-success',
        warning:
          'border-transparent bg-status-warning-bg text-status-warning',
        danger: 'border-transparent bg-status-danger-bg text-status-danger',
        neutral:
          'border-transparent bg-status-neutral-bg text-status-neutral',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
