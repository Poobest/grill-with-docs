<script setup lang="ts">
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  Boxes,
  type LucideIcon,
} from '@lucide/vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatThb } from '@/lib/utils'

interface Kpi {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

// Mock figures — wired to the dashboard KPI API in a later slice.
const kpis: Kpi[] = [
  { label: 'ยอดขายรวมเดือนนี้', value: formatThb(842500), hint: '+12% จากเดือนก่อน', icon: TrendingUp },
  { label: 'commission รวม', value: formatThb(58975), hint: 'จากยอดเก็บจริง', icon: Wallet },
  { label: 'สัญญาค้างชำระ', value: '17', hint: '3 รายผิดนัด', icon: AlertTriangle },
  { label: 'สต็อกคงเหลือ', value: '264', hint: 'ทุกสาขา', icon: Boxes },
]

interface ArrearRow {
  customer: string
  contractNo: string
  branch: string
  overdueDays: number
  outstanding: number
}

const arrears: ArrearRow[] = [
  { customer: 'ปิยะ มั่งมี', contractNo: 'CT-2026-0188', branch: 'สีลม', overdueDays: 5, outstanding: 12400 },
  { customer: 'วันดี สุขใจ', contractNo: 'CT-2026-0172', branch: 'บางนา', overdueDays: 12, outstanding: 8600 },
  { customer: 'ก้อง ศรีสุข', contractNo: 'CT-2026-0151', branch: 'สีลม', overdueDays: 23, outstanding: 19800 },
]
</script>

<template>
  <PageHeader title="แดชบอร์ด" subtitle="ภาพรวมร้าน · 30 พฤษภาคม 2569" />

  <div class="space-y-6 p-6">
    <!-- KPI cards: Display numbers are the primary focal point (UI-SPEC Visual Hierarchy) -->
    <section class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="kpi in kpis" :key="kpi.label">
        <CardContent class="flex items-start justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-muted-foreground">{{ kpi.label }}</p>
            <p class="tabular mt-2 text-3xl font-semibold leading-none">{{ kpi.value }}</p>
            <p class="mt-2 text-xs text-muted-foreground">{{ kpi.hint }}</p>
          </div>
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-md bg-status-success-bg text-status-success"
          >
            <component :is="kpi.icon" class="size-4" />
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- Arrears table -->
    <section>
      <h2 class="mb-3 text-base font-semibold">ลูกค้าค้างชำระ</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>เลขที่สัญญา</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead class="text-center">ค้าง (วัน)</TableHead>
              <TableHead class="text-right">ยอดคงค้าง</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in arrears" :key="row.contractNo">
              <TableCell class="font-semibold">{{ row.customer }}</TableCell>
              <TableCell class="tabular text-primary">{{ row.contractNo }}</TableCell>
              <TableCell>{{ row.branch }}</TableCell>
              <TableCell class="text-center">
                <Badge :variant="row.overdueDays >= 15 ? 'danger' : 'warning'">
                  {{ row.overdueDays }} วัน
                </Badge>
              </TableCell>
              <TableCell class="tabular text-right font-semibold">
                {{ formatThb(row.outstanding) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </section>
  </div>
</template>
