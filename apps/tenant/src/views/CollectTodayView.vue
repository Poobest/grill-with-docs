<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CalendarClock, HandCoins } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/table';
import { formatThb } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import {
  fetchCollectToday,
  recordCash,
  type DuePayment,
} from '@/lib/payments-api';

const { show } = useToast();

const items = ref<DuePayment[]>([]);
const loading = ref(true);
const error = ref('');
const collectingId = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    items.value = await fetchCollectToday();
  } catch (err) {
    error.value =
      err instanceof ApiError
        ? err.message
        : 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
  } finally {
    loading.value = false;
  }
}

async function collect(item: DuePayment) {
  collectingId.value = item.id;
  try {
    const result = await recordCash(item.id);
    items.value = items.value.filter((i) => i.id !== item.id);
    show(
      `รับเงิน ${item.customerName} เรียบร้อย · ออกใบเสร็จเลขที่ ${result.receiptNumber}`,
    );
  } catch (err) {
    show(
      err instanceof ApiError ? err.message : 'บันทึกการรับเงินไม่สำเร็จ',
      'error',
    );
  } finally {
    collectingId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <PageHeader title="เก็บเงินวันนี้" subtitle="งวดที่ถึงกำหนดและค้างชำระ" />

  <div class="space-y-4 p-6">
    <p
      v-if="error"
      class="flex items-center justify-between gap-4 rounded-md bg-status-danger-bg px-4 py-3 text-sm font-semibold text-status-danger"
    >
      {{ error }}
      <Button variant="outline" size="sm" @click="load">ลองใหม่</Button>
    </p>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ลูกค้า</TableHead>
            <TableHead>สินค้า</TableHead>
            <TableHead>งวด</TableHead>
            <TableHead class="text-right">จำนวนเงิน</TableHead>
            <TableHead class="text-center">สถานะ</TableHead>
            <TableHead class="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="p in items" :key="p.id">
            <TableCell class="font-semibold">
              {{ p.customerName }}
              <span class="block text-xs font-normal text-muted-foreground tabular">
                {{ p.customerPhone }}
              </span>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ p.productName }}</TableCell>
            <TableCell>
              <span v-if="p.isDownPayment">เงินดาวน์</span>
              <span v-else>ค่างวด</span>
            </TableCell>
            <TableCell class="tabular text-right font-semibold">
              {{ formatThb(p.amount) }}
            </TableCell>
            <TableCell class="text-center">
              <Badge v-if="p.overdueDays > 0" :variant="p.overdueDays >= 15 ? 'danger' : 'warning'">
                ค้าง {{ p.overdueDays }} วัน
              </Badge>
              <Badge v-else variant="neutral">ครบกำหนดวันนี้</Badge>
            </TableCell>
            <TableCell class="text-right">
              <Button
                size="sm"
                :disabled="collectingId === p.id"
                @click="collect(p)"
              >
                <HandCoins />
                {{ collectingId === p.id ? 'กำลังบันทึก…' : 'รับเงินสด' }}
              </Button>
            </TableCell>
          </TableRow>

          <TableEmpty v-if="loading" :colspan="6">
            <p class="text-sm text-muted-foreground">กำลังโหลด…</p>
          </TableEmpty>
          <TableEmpty v-else-if="items.length === 0 && !error" :colspan="6">
            <CalendarClock class="size-8 text-muted-foreground" />
            <p class="font-semibold">ไม่มีรายการเก็บเงินวันนี้</p>
            <p class="text-xs text-muted-foreground">เก็บครบทุกงวดที่ถึงกำหนดแล้ว</p>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
