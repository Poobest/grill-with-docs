<template>
  <div class="max-w-lg">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink to="/tenants" class="text-indigo-600 hover:text-indigo-800 text-sm">← Tenants</RouterLink>
      <h1 class="text-2xl font-bold text-gray-900">New Tenant</h1>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="handleCreate" class="space-y-4">
        <div><label class="label">Tenant Name</label><input v-model="form.name" required class="input" /></div>
        <div>
          <label class="label">Subscription Plan</label>
          <select v-model="form.planId" required class="input">
            <option value="">Select plan...</option>
            <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }} (฿{{ Number(p.pricePerMonth).toLocaleString() }}/mo)</option>
          </select>
        </div>
        <div><label class="label">Subscription Months</label><input v-model.number="form.subscriptionMonths" type="number" min="1" required class="input" /></div>
        <hr class="my-2" />
        <p class="text-sm font-medium text-gray-700">Admin Account</p>
        <div><label class="label">Name</label><input v-model="form.adminName" required class="input" /></div>
        <div><label class="label">Email</label><input v-model="form.adminEmail" type="email" required class="input" /></div>
        <div><label class="label">Password</label><input v-model="form.adminPassword" type="password" minlength="6" required class="input" /></div>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <div class="flex justify-end gap-2 pt-2">
          <RouterLink to="/tenants" class="btn-secondary">Cancel</RouterLink>
          <button type="submit" :disabled="loading" class="btn-primary">{{ loading ? 'Creating...' : 'Create Tenant' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { type Plan, plansApi } from '../api/plans'
import { tenantsApi } from '../api/tenants'

const router = useRouter()
const plans = ref<Plan[]>([])
const loading = ref(false)
const error = ref('')
const form = ref({ name: '', planId: '', adminName: '', adminEmail: '', adminPassword: '', subscriptionMonths: 1 })

onMounted(async () => { const { data } = await plansApi.findAll(); plans.value = data.filter(p => p.isActive) })

async function handleCreate() {
  loading.value = true; error.value = ''
  try {
    await tenantsApi.create(form.value)
    router.push('/tenants')
  } catch { error.value = 'Failed to create tenant' }
  finally { loading.value = false }
}
</script>
