<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  CalendarClock,
  Package,
  Boxes,
  Store,
  UserCog,
  LogOut,
  type LucideIcon,
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const initials = computed(() => auth.user?.name?.slice(0, 2) ?? '—')

function onLogout() {
  auth.logout()
  void router.push('/login')
}

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface NavSection {
  /** Role-scoped grouping per UI-SPEC (Admin / Sale Lead / Sale share one app). */
  heading: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    heading: 'ภาพรวม',
    items: [{ label: 'แดชบอร์ด', to: '/', icon: LayoutDashboard }],
  },
  {
    heading: 'งานขาย',
    items: [
      { label: 'สัญญาผ่อน', to: '/contracts', icon: FileText },
      { label: 'ลูกค้า', to: '/customers', icon: Users },
      { label: 'เก็บเงินวันนี้', to: '/collect-today', icon: CalendarClock },
      { label: 'การชำระเงิน', to: '/payments', icon: Wallet },
    ],
  },
  {
    heading: 'จัดการร้าน',
    items: [
      { label: 'สินค้า', to: '/products', icon: Package },
      { label: 'สต็อก', to: '/stock', icon: Boxes },
      { label: 'สาขา', to: '/branches', icon: Store },
      { label: 'พนักงาน', to: '/users', icon: UserCog },
    ],
  },
]
</script>

<template>
  <aside class="flex h-screen w-60 shrink-0 flex-col border-r bg-card">
    <!-- Brand -->
    <div class="flex h-14 items-center gap-2 border-b px-4">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold"
      >
        ผ
      </div>
      <span class="text-sm font-semibold tracking-tight">ระบบผ่อนชำระ</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <div v-for="section in sections" :key="section.heading" class="mb-4">
        <p class="px-2 pb-1 text-xs font-semibold uppercase text-muted-foreground">
          {{ section.heading }}
        </p>
        <ul class="flex flex-col gap-0.5">
          <li v-for="item in section.items" :key="item.to">
            <RouterLink
              :to="item.to"
              exact-active-class="bg-status-success-bg text-primary font-semibold"
              class="flex h-10 items-center gap-2.5 rounded-md px-2 text-foreground transition-colors hover:bg-secondary"
            >
              <component :is="item.icon" class="size-4 shrink-0" />
              <span class="text-sm">{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Current user -->
    <div class="flex items-center gap-2.5 border-t p-3">
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold"
      >
        {{ initials }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold">{{ auth.user?.name }}</p>
        <p class="truncate text-xs text-muted-foreground">{{ auth.roleLabel }}</p>
      </div>
      <button
        type="button"
        aria-label="ออกจากระบบ"
        title="ออกจากระบบ"
        class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
        @click="onLogout"
      >
        <LogOut class="size-4" />
      </button>
    </div>
  </aside>
</template>
