<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Printer } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { CONTRACT_STATUS, PAYMENT_STATUS } from '@/lib/status';
import { formatThb, formatDate } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import {
  fetchContractDetail,
  PAYMENT_TYPE_LABELS,
  type ContractDetail,
} from '@/lib/contracts-api';

const route = useRoute();
const router = useRouter();

const detail = ref<ContractDetail | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    detail.value = await fetchContractDetail(route.params.id as string);
  } catch (err) {
    error.value =
      err instanceof ApiError ? err.message : 'โหลดข้อมูลสัญญาไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
});

function printDoc() {
  window.print();
}
</script>

<template>
  <PageHeader
    :title="detail ? `สัญญา ${detail.id.slice(-8).toUpperCase()}` : 'รายละเอียดสัญญา'"
    :subtitle="detail?.customerName"
  >
    <template #actions>
      <Button variant="outline" size="sm" @click="router.push('/contracts')">
        <ArrowLeft />
        กลับ
      </Button>
      <Button v-if="detail" variant="outline" size="sm" @click="printDoc">
        <Printer />
        พิมพ์
      </Button>
    </template>
  </PageHeader>

  <div class="space-y-6 p-6">
    <p v-if="loading" class="text-sm text-muted-foreground">กำลังโหลด…</p>
    <p
      v-else-if="error"
      class="rounded-md bg-status-danger-bg px-4 py-3 text-sm font-semibold text-status-danger"
    >
      {{ error }}
    </p>

    <template v-else-if="detail">
      <!-- Summary -->
      <Card>
        <CardContent class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 sm:grid-cols-4">
          <div>
            <p class="text-xs text-muted-foreground">ลูกค้า</p>
            <p class="font-semibold">{{ detail.customerName }}</p>
            <p class="tabular text-xs text-muted-foreground">{{ detail.customerPhone }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">สินค้า</p>
            <p class="font-semibold">{{ detail.productName }}</p>
            <p class="text-xs text-muted-foreground">{{ PAYMENT_TYPE_LABELS[detail.paymentType] }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">สถานะ</p>
            <Badge :variant="CONTRACT_STATUS[detail.status].variant" class="mt-0.5">
              {{ CONTRACT_STATUS[detail.status].label }}
            </Badge>
            <p class="mt-1 text-xs text-muted-foreground">
              ผ่อนแล้ว {{ detail.paidCount }}/{{ detail.payments.length }} งวด
            </p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">ยอดคงเหลือ</p>
            <p class="tabular text-xl font-semibold text-primary">{{ formatThb(detail.outstanding) }}</p>
            <p class="tabular text-xs text-muted-foreground">จาก {{ formatThb(detail.totalAmount) }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Schedule -->
      <section>
        <h2 class="mb-3 text-base font-semibold">ตารางการผ่อน</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>งวด</TableHead>
                <TableHead>ครบกำหนด</TableHead>
                <TableHead class="text-right">จำนวนเงิน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ชำระเมื่อ</TableHead>
                <TableHead>เลขใบเสร็จ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="p in detail.payments" :key="p.id">
                <TableCell class="font-semibold">
                  {{ p.isDownPayment ? 'เงินดาวน์' : `งวดที่ ${p.seq}` }}
                </TableCell>
                <TableCell>{{ formatDate(p.dueDate) }}</TableCell>
                <TableCell class="tabular text-right font-semibold">{{ formatThb(p.amount) }}</TableCell>
                <TableCell>
                  <Badge :variant="PAYMENT_STATUS[p.status].variant">
                    {{ PAYMENT_STATUS[p.status].label }}
                  </Badge>
                </TableCell>
                <TableCell class="text-muted-foreground">{{ formatDate(p.paidAt) }}</TableCell>
                <TableCell class="tabular text-muted-foreground">{{ p.receiptNumber ?? '—' }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>
    </template>
  </div>
</template>
