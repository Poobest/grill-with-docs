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
import { ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { fetchBranches, createBranch, type Branch } from '@/lib/admin-api';

const { show } = useToast();
const rows = ref<Branch[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);
const form = ref({ name: '', address: '' });

async function load() {
  loading.value = true;
  try {
    rows.value = await fetchBranches();
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    const created = await createBranch({ ...form.value });
    rows.value = [...rows.value, created];
    form.value = { name: '', address: '' };
    showForm.value = false;
    show(`เพิ่มสาขา ${created.name} เรียบร้อย`);
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <PageHeader title="สาขา" subtitle="จัดการสาขาของร้าน">
    <template #actions>
      <Button @click="showForm = !showForm"><Plus /> เพิ่มสาขา</Button>
    </template>
  </PageHeader>

  <div class="space-y-4 p-6">
    <Card v-if="showForm">
      <CardContent class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <Label for="name">ชื่อสาขา</Label>
          <Input id="name" v-model="form.name" placeholder="เช่น สาขาสีลม" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="address">ที่อยู่</Label>
          <Input id="address" v-model="form.address" placeholder="ที่อยู่ (ไม่บังคับ)" />
        </div>
        <div class="sm:col-span-2">
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
            <TableHead>ชื่อสาขา</TableHead>
            <TableHead>ที่อยู่</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="b in rows" :key="b.id">
            <TableCell class="font-semibold">{{ b.name }}</TableCell>
            <TableCell class="text-muted-foreground">{{ b.address ?? '—' }}</TableCell>
          </TableRow>
          <TableEmpty v-if="loading" :colspan="2">
            <p class="text-sm text-muted-foreground">กำลังโหลด…</p>
          </TableEmpty>
          <TableEmpty v-else-if="rows.length === 0" :colspan="2">
            <p class="font-semibold">ยังไม่มีสาขา</p>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
