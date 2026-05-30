<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import { ApiError } from '@/lib/api';
import { formatThb } from '@/lib/utils';
import {
  fetchProducts,
  fetchCustomers,
  createContract,
  previewSchedule,
  PAYMENT_TYPE_LABELS,
  type Product,
  type Customer,
  type PaymentType,
} from '@/lib/contracts-api';

const router = useRouter();
const auth = useAuthStore();

const products = ref<Product[]>([]);
const customers = ref<Customer[]>([]);
const customerId = ref('');
const productId = ref('');
const paymentType = ref<PaymentType>('DAILY');

const loading = ref(true);
const submitting = ref(false);
const error = ref('');

const paymentTypes = Object.entries(PAYMENT_TYPE_LABELS) as [
  PaymentType,
  string,
][];

const selectedProduct = computed(() =>
  products.value.find((p) => p.id === productId.value),
);
const preview = computed(() =>
  selectedProduct.value
    ? previewSchedule(selectedProduct.value, paymentType.value)
    : null,
);
const canSubmit = computed(
  () => customerId.value !== '' && productId.value !== '' && !submitting.value,
);

onMounted(async () => {
  try {
    [products.value, customers.value] = await Promise.all([
      fetchProducts(),
      fetchCustomers(),
    ]);
  } catch (err) {
    error.value =
      err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
});

async function onSubmit() {
  error.value = '';
  const branchId = auth.user?.branchId;
  if (!branchId) {
    error.value = 'บัญชีของคุณยังไม่ได้สังกัดสาขา ไม่สามารถสร้างสัญญาได้';
    return;
  }
  submitting.value = true;
  try {
    await createContract({
      customerId: customerId.value,
      productId: productId.value,
      branchId,
      paymentType: paymentType.value,
    });
    await router.push('/contracts');
  } catch (err) {
    error.value =
      err instanceof ApiError ? err.message : 'สร้างสัญญาไม่สำเร็จ';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <PageHeader title="สร้างสัญญาผ่อน" subtitle="เลือกลูกค้า สินค้า และประเภทการผ่อน">
    <template #actions>
      <Button variant="outline" size="sm" @click="router.push('/contracts')">
        <ArrowLeft />
        กลับ
      </Button>
    </template>
  </PageHeader>

  <div class="grid max-w-3xl gap-6 p-6 lg:grid-cols-[1fr_280px]">
    <!-- Form -->
    <Card>
      <CardContent class="flex flex-col gap-4 p-4">
        <p v-if="loading" class="text-sm text-muted-foreground">กำลังโหลด…</p>

        <template v-else>
          <div class="flex flex-col gap-1.5">
            <Label for="customer">ลูกค้า</Label>
            <Select id="customer" v-model="customerId">
              <option value="" disabled>— เลือกลูกค้า —</option>
              <option
                v-for="c in customers"
                :key="c.id"
                :value="c.id"
                :disabled="c.isSuspended"
              >
                {{ c.name }} ({{ c.phone }}){{ c.isSuspended ? ' · ถูกระงับ' : '' }}
              </option>
            </Select>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="product">สินค้า</Label>
            <Select id="product" v-model="productId">
              <option value="" disabled>— เลือกสินค้า —</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </Select>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="type">ประเภทการผ่อน</Label>
            <Select id="type" v-model="paymentType">
              <option v-for="[value, label] in paymentTypes" :key="value" :value="value">
                {{ label }}
              </option>
            </Select>
          </div>

          <p
            v-if="error"
            class="rounded-md bg-status-danger-bg px-3 py-2 text-xs font-semibold text-status-danger"
          >
            {{ error }}
          </p>

          <Button class="mt-1" :disabled="!canSubmit" @click="onSubmit">
            {{ submitting ? 'กำลังสร้าง…' : 'สร้างสัญญา' }}
          </Button>
        </template>
      </CardContent>
    </Card>

    <!-- Live schedule preview -->
    <Card v-if="preview" class="h-fit">
      <CardContent class="flex flex-col gap-3 p-4">
        <p class="text-xs font-semibold text-muted-foreground">สรุปตารางผ่อน</p>
        <dl class="flex flex-col gap-2 text-sm">
          <div v-if="preview.downPayment > 0" class="flex justify-between">
            <dt class="text-muted-foreground">เงินดาวน์</dt>
            <dd class="tabular font-semibold">{{ formatThb(preview.downPayment) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">จำนวนงวด</dt>
            <dd class="tabular font-semibold">{{ preview.installmentCount }} งวด</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">ยอดต่องวด</dt>
            <dd class="tabular font-semibold">{{ formatThb(preview.installmentAmount) }}</dd>
          </div>
          <div class="mt-1 flex justify-between border-t pt-2">
            <dt class="font-semibold">ยอดรวมทั้งสัญญา</dt>
            <dd class="tabular text-base font-semibold text-primary">
              {{ formatThb(preview.total) }}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  </div>
</template>
