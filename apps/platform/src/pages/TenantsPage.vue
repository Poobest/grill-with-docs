<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tenants</h1>
      <RouterLink to="/tenants/new" class="btn-primary">+ New Tenant</RouterLink>
    </div>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Plan</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Expires</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">Users</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">Branches</th>
            <th class="text-center px-4 py-3 text-gray-600 font-medium">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="t in tenants" :key="t.id" @click="router.push(`/tenants/${t.id}`)" class="hover:bg-gray-50 cursor-pointer">
            <td class="px-4 py-3 font-medium">{{ t.name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ t.plan.name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ t.subscriptionExpiresAt ? new Date(t.subscriptionExpiresAt).toLocaleDateString('th') : '—' }}</td>
            <td class="px-4 py-3 text-right">{{ t._count.users }}</td>
            <td class="px-4 py-3 text-right">{{ t._count.branches }}</td>
            <td class="px-4 py-3 text-center">
              <span :class="t.isActive ? 'badge-green' : 'badge-red'">{{ t.isActive ? 'Active' : 'Inactive' }}</span>
            </td>
          </tr>
          <tr v-if="!tenants.length">
            <td colspan="6" class="px-4 py-10 text-center text-gray-400">No tenants yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { type Tenant, tenantsApi } from '../api/tenants'
const tenants = ref<Tenant[]>([])
const router = useRouter()
onMounted(async () => { const { data } = await tenantsApi.findAll(); tenants.value = data })
</script>
