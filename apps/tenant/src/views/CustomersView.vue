<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plus } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
} from '@/components/ui/table';
import { ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { fetchCustomers, type Customer } from '@/lib/contracts-api';
import { createCustomer, setCustomerSuspended } from '@/lib/admin-api';

const { show } = useToast();
const rows = ref<Customer[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const form = ref({ name: '', phone: '', contractLimit: 2 });

async function load() {
  loading.value = true;
  try {
    rows.value = await fetchCustomers();
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    const created = await createCustomer({ ...form.value });
    rows.value = [...rows.value, created];
    form.value = { name: '', phone: '', contractLimit: 2 };
    showForm.value = false;
    show(`เพิ่มลูกค้า ${created.name} เรียบร้อย`);
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
  } finally {
    saving.value = false;
  }
}

async function toggleSuspend(c: Customer) {
  try {
    const updated = await setCustomerSuspended(c.id, !c.isSuspended);
    rows.value = rows.value.map((r) => (r.id === c.id ? updated : r));
    show(updated.isSuspended ? `ระงับ ${c.name} แล้ว` : `ปลดระงับ ${c.name} แล้ว`);
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'ทำรายการไม่สำเร็จ', 'error');
  }
}

onMounted(load);
</script>

<template>
  <PageHeader title="ลูกค้า" subtitle="จัดการรายชื่อลูกค้า">
    <template #actions>
      <Button @click="showForm = !showForm"><Plus /> เพิ่มลูกค้า</Button>
    </template>
  </PageHeader>

  <div class="space-y-4 p-6">
    <Card v-if="showForm">
      <CardContent class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <Label for="name">ชื่อ</Label>
          <Input id="name" v-model="form.name" placeholder="ชื่อ-นามสกุล" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="phone">เบอร์โทร</Label>
          <Input id="phone" v-model="form.phone" placeholder="08x-xxx-xxxx" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="limit">วงเงินสัญญา</Label>
          <Input id="limit" v-model.number="form.contractLimit" type="number" />
        </div>
        <div class="sm:col-span-3">
          <Button :disabled="saving || !form.name || !form.phone" @click="save">
            {{ saving ? 'กำลังบันทึก…' : 'บันทึก' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อ</TableHead>
            <TableHead>เบอร์โทร</TableHead>
            <TableHead class="text-center">วงเงินสัญญา</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead class="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="c in rows" :key="c.id">
            <TableCell class="font-semibold">{{ c.name }}</TableCell>
            <TableCell class="tabular text-muted-foreground">{{ c.phone }}</TableCell>
            <TableCell class="text-center">{{ c.contractLimit }}</TableCell>
            <TableCell>
              <Badge :variant="c.isSuspended ? 'danger' : 'success'">
                {{ c.isSuspended ? 'ถูกระงับ' : 'ปกติ' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="outline" size="sm" @click="toggleSuspend(c)">
                {{ c.isSuspended ? 'ปลดระงับ' : 'ระงับ' }}
              </Button>
            </TableCell>
          </TableRow>
          <TableEmpty v-if="loading" :colspan="5">
            <p class="text-sm text-muted-foreground">กำลังโหลด…</p>
          </TableEmpty>
          <TableEmpty v-else-if="rows.length === 0" :colspan="5">
            <p class="font-semibold">ยังไม่มีลูกค้า</p>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
