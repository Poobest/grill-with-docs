<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, FileText } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { CONTRACT_STATUS } from '@/lib/status';
import { formatThb } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import {
  fetchContracts,
  PAYMENT_TYPE_LABELS,
  type ContractListItem,
} from '@/lib/contracts-api';

const router = useRouter();
const contracts = ref<ContractListItem[]>([]);
const loading = ref(true);
const error = ref('');
const query = ref('');

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return contracts.value;
  return contracts.value.filter(
    (c) =>
      c.customerName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q),
  );
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    contracts.value = await fetchContracts();
  } catch (err) {
    error.value =
      err instanceof ApiError
        ? err.message
        : 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <PageHeader title="สัญญาผ่อน" subtitle="สัญญาทั้งหมดในร้าน">
    <template #actions>
      <Button @click="router.push('/contracts/new')">
        <Plus />
        สร้างสัญญา
      </Button>
    </template>
  </PageHeader>

  <div class="space-y-4 p-6">
    <div class="max-w-xs">
      <Input v-model="query" placeholder="ค้นหาชื่อลูกค้า หรือเลขที่สัญญา" />
    </div>

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
            <TableHead>เลขที่สัญญา</TableHead>
            <TableHead>ลูกค้า</TableHead>
            <TableHead>สินค้า</TableHead>
            <TableHead>ประเภท</TableHead>
            <TableHead class="text-right">ยอดคงเหลือ</TableHead>
            <TableHead>สถานะ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="c in filtered" :key="c.id">
            <TableCell class="tabular font-semibold text-primary">
              {{ c.id.slice(-8).toUpperCase() }}
            </TableCell>
            <TableCell>{{ c.customerName }}</TableCell>
            <TableCell class="text-muted-foreground">{{ c.productName }}</TableCell>
            <TableCell>{{ PAYMENT_TYPE_LABELS[c.paymentType] }}</TableCell>
            <TableCell class="tabular text-right font-semibold">
              {{ formatThb(c.outstanding) }}
            </TableCell>
            <TableCell>
              <Badge :variant="CONTRACT_STATUS[c.status].variant">
                {{ CONTRACT_STATUS[c.status].label }}
              </Badge>
            </TableCell>
          </TableRow>

          <TableEmpty v-if="loading" :colspan="6">
            <p class="text-sm text-muted-foreground">กำลังโหลด…</p>
          </TableEmpty>

          <TableEmpty v-else-if="filtered.length === 0 && !error" :colspan="6">
            <FileText class="size-8 text-muted-foreground" />
            <p class="font-semibold">ยังไม่มีสัญญา</p>
            <p class="max-w-sm text-xs text-muted-foreground">
              เริ่มต้นด้วยการสร้างสัญญาผ่อนชำระให้ลูกค้า แล้วระบบจะคำนวณตารางงวดให้อัตโนมัติ
            </p>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
