<template>
  <div v-if="tenant" class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink to="/tenants" class="text-indigo-600 hover:text-indigo-800 text-sm">← Tenants</RouterLink>
      <h1 class="text-2xl font-bold text-gray-900">{{ tenant.name }}</h1>
      <span :class="tenant.isActive ? 'badge-green' : 'badge-red'">{{ tenant.isActive ? 'Active' : 'Inactive' }}</span>
    </div>

    <!-- Info card -->
    <div class="bg-white rounded-lg shadow p-6 mb-4 grid grid-cols-2 gap-4 text-sm">
      <div><p class="text-gray-500">Plan</p><p class="font-medium">{{ tenant.plan.name }}</p></div>
      <div><p class="text-gray-500">Price</p><p class="font-medium">฿{{ Number(tenant.plan.pricePerMonth).toLocaleString() }}/mo</p></div>
      <div><p class="text-gray-500">Subscription Expires</p><p class="font-medium">{{ tenant.subscriptionExpiresAt ? new Date(tenant.subscriptionExpiresAt).toLocaleDateString('th') : '—' }}</p></div>
      <div class="grid grid-cols-3 gap-2 col-span-2">
        <div class="bg-gray-50 rounded p-3 text-center"><p class="text-2xl font-bold text-indigo-600">{{ tenant._count.users }}</p><p class="text-xs text-gray-500">Users</p></div>
        <div class="bg-gray-50 rounded p-3 text-center"><p class="text-2xl font-bold text-indigo-600">{{ tenant._count.branches }}</p><p class="text-xs text-gray-500">Branches</p></div>
        <div class="bg-gray-50 rounded p-3 text-center"><p class="text-2xl font-bold text-indigo-600">{{ tenant._count.contracts }}</p><p class="text-xs text-gray-500">Contracts</p></div>
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 class="font-semibold text-gray-900">Actions</h2>
      <div class="flex gap-2">
        <button v-if="!tenant.isActive" @click="handleActivate" class="btn-primary">Activate</button>
        <button v-if="tenant.isActive" @click="handleDeactivate" class="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer">Deactivate</button>
      </div>
      <div class="flex items-end gap-2">
        <div>
          <label class="label">Extend Subscription</label>
          <input v-model.number="extendMonths" type="number" min="1" class="input w-28" />
        </div>
        <button @click="handleExtend" :disabled="extendLoading" class="btn-primary">
          {{ extendLoading ? 'Extending...' : 'Extend' }}
        </button>
        <span class="text-sm text-gray-500">months</span>
      </div>
      <p v-if="msg" class="text-green-600 text-sm">{{ msg }}</p>
    </div>
  </div>
  <div v-else class="text-center py-20 text-gray-400">Loading...</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { type Tenant, tenantsApi } from '../api/tenants'

const route = useRoute()
const tenant = ref<Tenant | null>(null)
const extendMonths = ref(1)
const extendLoading = ref(false)
const msg = ref('')

async function load() { const { data } = await tenantsApi.findOne(route.params.id as string); tenant.value = data }

async function handleActivate() { await tenantsApi.activate(tenant.value!.id); await load() }
async function handleDeactivate() {
  if (!confirm('Deactivate this tenant?')) return
  await tenantsApi.deactivate(tenant.value!.id); await load()
}
async function handleExtend() {
  extendLoading.value = true; msg.value = ''
  try {
    const { data } = await tenantsApi.extendSubscription(tenant.value!.id, extendMonths.value)
    tenant.value = data; msg.value = `Extended to ${new Date(data.subscriptionExpiresAt!).toLocaleDateString('th')}`
  } finally { extendLoading.value = false }
}

onMounted(load)
</script>
