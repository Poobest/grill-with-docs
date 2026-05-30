<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plus } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
} from '@/components/ui/table';
import { formatThb } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { fetchProducts, type Product } from '@/lib/contracts-api';
import { createProduct } from '@/lib/admin-api';

const { show } = useToast();
const rows = ref<Product[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);

const blank = () => ({
  name: '', cashPrice: 0, downPayment: 0, dailyPrice: 0, weeklyPrice: 0, monthlyPrice: 0,
});
const form = ref(blank());

const priceFields: { key: keyof ReturnType<typeof blank>; label: string }[] = [
  { key: 'cashPrice', label: 'ราคาเงินสด' },
  { key: 'downPayment', label: 'เงินดาวน์' },
  { key: 'dailyPrice', label: 'ราคา/วัน' },
  { key: 'weeklyPrice', label: 'ราคา/สัปดาห์' },
  { key: 'monthlyPrice', label: 'ราคา/เดือน' },
];

async function load() {
  loading.value = true;
  try {
    rows.value = await fetchProducts();
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    const created = await createProduct({ ...form.value });
    rows.value = [...rows.value, created];
    form.value = blank();
    showForm.value = false;
    show(`เพิ่มสินค้า ${created.name} เรียบร้อย`);
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <PageHeader title="สินค้า" subtitle="จัดการสินค้าและราคา">
    <template #actions>
      <Button @click="showForm = !showForm"><Plus /> เพิ่มสินค้า</Button>
    </template>
  </PageHeader>

  <div class="space-y-4 p-6">
    <Card v-if="showForm">
      <CardContent class="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
        <div class="col-span-2 flex flex-col gap-1.5 sm:col-span-3">
          <Label for="name">ชื่อสินค้า</Label>
          <Input id="name" v-model="form.name" placeholder="เช่น ทีวี 55 นิ้ว" />
        </div>
        <div v-for="f in priceFields" :key="f.key" class="flex flex-col gap-1.5">
          <Label :for="f.key">{{ f.label }}</Label>
          <Input :id="f.key" v-model.number="form[f.key]" type="number" />
        </div>
        <div class="col-span-2 sm:col-span-3">
          <Button :disabled="saving || !form.name" @click="save">
            {{ saving ? 'กำลังบันทึก…' : 'บันทึก' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>สินค้า</TableHead>
            <TableHead class="text-right">เงินสด</TableHead>
            <TableHead class="text-right">ดาวน์</TableHead>
            <TableHead class="text-right">/วัน</TableHead>
            <TableHead class="text-right">/สัปดาห์</TableHead>
            <TableHead class="text-right">/เดือน</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="p in rows" :key="p.id">
            <TableCell class="font-semibold">{{ p.name }}</TableCell>
            <TableCell class="tabular text-right">{{ formatThb(p.cashPrice) }}</TableCell>
            <TableCell class="tabular text-right">{{ formatThb(p.downPayment) }}</TableCell>
            <TableCell class="tabular text-right">{{ formatThb(p.dailyPrice) }}</TableCell>
            <TableCell class="tabular text-right">{{ formatThb(p.weeklyPrice) }}</TableCell>
            <TableCell class="tabular text-right">{{ formatThb(p.monthlyPrice) }}</TableCell>
          </TableRow>
          <TableEmpty v-if="loading" :colspan="6">
            <p class="text-sm text-muted-foreground">กำลังโหลด…</p>
          </TableEmpty>
          <TableEmpty v-else-if="rows.length === 0" :colspan="6">
            <p class="font-semibold">ยังไม่มีสินค้า</p>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
