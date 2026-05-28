<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { commissionsApi } from '../api/commissions'

interface Commission { id: string; user?: { name: string }; amount: number; type: string; status: string; createdAt: string }

const commissions = ref<Commission[]>([])
const loading = ref(true)
const total = ref(0)

async function load() {
  loading.value = true
  try {
    const res = await commissionsApi.list()
    commissions.value = res.data
    total.value = commissions.value.reduce((sum, c) => sum + c.amount, 0)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Commissions</h1>
      <div class="bg-purple-100 text-purple-800 px-4 py-2 rounded font-semibold text-sm">Total: ฿{{ total.toLocaleString() }}</div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-left">User</th>
          <th class="px-4 py-3 text-left">Amount</th>
          <th class="px-4 py-3 text-left">Type</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3 text-left">Date</th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="c in commissions" :key="c.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">{{ c.user?.name ?? '—' }}</td>
            <td class="px-4 py-3 font-medium text-purple-700">฿{{ c.amount.toLocaleString() }}</td>
            <td class="px-4 py-3"><span class="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">{{ c.type }}</span></td>
            <td class="px-4 py-3">
              <span :class="c.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="px-2 py-0.5 rounded text-xs">{{ c.status }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(c.createdAt).toLocaleDateString() }}</td>
          </tr>
          <tr v-if="!loading && commissions.length === 0"><td colspan="5" class="px-4 py-6 text-center text-gray-400">No commissions yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
