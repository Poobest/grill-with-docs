<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plus } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
} from '@/components/ui/table';
import { ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { fetchBranches, type Branch } from '@/lib/admin-api';
import {
  fetchUsers, createUser, ROLE_LABELS, type TenantUser, type UserRole,
} from '@/lib/admin-api';

const { show } = useToast();
const rows = ref<TenantUser[]>([]);
const branches = ref<Branch[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);

const blank = () => ({
  name: '', email: '', password: '', role: 'SALE' as UserRole, branchId: '',
  installmentRate: 0.05, cashRate: 0.02, overrideRate: 0,
});
const form = ref(blank());

const roles = Object.entries(ROLE_LABELS) as [UserRole, string][];

async function load() {
  loading.value = true;
  try {
    [rows.value, branches.value] = await Promise.all([fetchUsers(), fetchBranches()]);
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    const created = await createUser({
      ...form.value,
      branchId: form.value.branchId || undefined,
    });
    rows.value = [...rows.value, created];
    form.value = blank();
    showForm.value = false;
    show(`เพิ่มพนักงาน ${created.name} เรียบร้อย`);
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <PageHeader title="พนักงาน" subtitle="จัดการผู้ใช้และสิทธิ์">
    <template #actions>
      <Button @click="showForm = !showForm"><Plus /> เพิ่มพนักงาน</Button>
    </template>
  </PageHeader>

  <div class="space-y-4 p-6">
    <Card v-if="showForm">
      <CardContent class="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <Label for="name">ชื่อ</Label>
          <Input id="name" v-model="form.name" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email">อีเมล</Label>
          <Input id="email" v-model="form.email" type="email" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="password">รหัสผ่าน</Label>
          <Input id="password" v-model="form.password" type="password" placeholder="อย่างน้อย 6 ตัว" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="role">ตำแหน่ง</Label>
          <Select id="role" v-model="form.role">
            <option v-for="[v, l] in roles" :key="v" :value="v">{{ l }}</option>
          </Select>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="branch">สาขา</Label>
          <Select id="branch" v-model="form.branchId">
            <option value="">— ไม่ระบุ —</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </Select>
        </div>
        <div class="flex items-end">
          <Button :disabled="saving || !form.name || !form.email || form.password.length < 6" @click="save">
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
            <TableHead>อีเมล</TableHead>
            <TableHead>ตำแหน่ง</TableHead>
            <TableHead>สาขา</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="u in rows" :key="u.id">
            <TableCell class="font-semibold">{{ u.name }}</TableCell>
            <TableCell class="text-muted-foreground">{{ u.email }}</TableCell>
            <TableCell><Badge variant="secondary">{{ ROLE_LABELS[u.role] }}</Badge></TableCell>
            <TableCell>{{ u.branchName ?? '—' }}</TableCell>
          </TableRow>
          <TableEmpty v-if="loading" :colspan="4">
            <p class="text-sm text-muted-foreground">กำลังโหลด…</p>
          </TableEmpty>
          <TableEmpty v-else-if="rows.length === 0" :colspan="4">
            <p class="font-semibold">ยังไม่มีพนักงาน</p>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
