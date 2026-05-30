<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
} from '@/components/ui/table';
import { ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { fetchStock, setStock, type StockRow } from '@/lib/admin-api';

const { show } = useToast();
const rows = ref<StockRow[]>([]);
const loading = ref(true);
const edits = ref<Record<string, number>>({});
const savingKey = ref('');

const keyOf = (r: StockRow) => `${r.branchId}:${r.productId}`;

async function load() {
  loading.value = true;
  try {
    rows.value = await fetchStock();
    edits.value = Object.fromEntries(rows.value.map((r) => [keyOf(r), r.quantity]));
  } finally {
    loading.value = false;
  }
}

async function save(r: StockRow) {
  const key = keyOf(r);
  const qty = edits.value[key] ?? r.quantity;
  savingKey.value = key;
  try {
    await setStock({ branchId: r.branchId, productId: r.productId, quantity: qty });
    rows.value = rows.value.map((x) =>
      keyOf(x) === key ? { ...x, quantity: qty } : x,
    );
    show(`อัปเดตสต็อก ${r.productName} เป็น ${qty} ชิ้น`);
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
  } finally {
    savingKey.value = '';
  }
}

onMounted(load);
</script>

<template>
  <PageHeader title="สต็อก" subtitle="ปรับจำนวนสินค้าคงเหลือต่อสาขา" />

  <div class="space-y-4 p-6">
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>สินค้า</TableHead>
            <TableHead>สาขา</TableHead>
            <TableHead class="text-center">คงเหลือ</TableHead>
            <TableHead class="w-48 text-right">ปรับจำนวน</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="r in rows" :key="keyOf(r)">
            <TableCell class="font-semibold">{{ r.productName }}</TableCell>
            <TableCell class="text-muted-foreground">{{ r.branchName }}</TableCell>
            <TableCell class="text-center">
              <Badge :variant="r.quantity > 0 ? 'success' : 'danger'">{{ r.quantity }}</Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center justify-end gap-2">
                <Input v-model.number="edits[keyOf(r)]" type="number" class="h-8 w-20" />
                <Button
                  size="sm"
                  variant="outline"
                  :disabled="savingKey === keyOf(r) || edits[keyOf(r)] === r.quantity"
                  @click="save(r)"
                >
                  บันทึก
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableEmpty v-if="loading" :colspan="4">
            <p class="text-sm text-muted-foreground">กำลังโหลด…</p>
          </TableEmpty>
          <TableEmpty v-else-if="rows.length === 0" :colspan="4">
            <p class="font-semibold">ยังไม่มีข้อมูลสต็อก</p>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
