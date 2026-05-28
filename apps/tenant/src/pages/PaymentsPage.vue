<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { paymentsApi } from '../api/payments'
import { contractsApi } from '../api/contracts'

interface Payment { id: string; contract?: { customer?: { name: string } }; amount: number; method: string; status: string; createdAt: string; slipUrl?: string }
interface Contract { id: string; customer: { name: string } }

const payments = ref<Payment[]>([])
const contracts = ref<Contract[]>([])
const loading = ref(true)
const showCashForm = ref(false)
const showSlipForm = ref(false)
const cashForm = ref({ contractId: '', amount: 0 })
const slipForm = ref({ contractId: '', amount: 0, slipUrl: '' })
const error = ref('')

async function load() {
  loading.value = true
  try {
    const [p, c] = await Promise.all([paymentsApi.list(), contractsApi.list()])
    payments.value = p.data
    contracts.value = c.data.filter((c: Contract & { status: string }) => c.status === 'ACTIVE')
  } finally {
    loading.value = false
  }
}

async function payCash() {
  error.value = ''
  try {
    await paymentsApi.payCash(cashForm.value)
    showCashForm.value = false
    await load()
  } catch {
    error.value = 'Failed to record payment'
  }
}

async function paySlip() {
  error.value = ''
  try {
    await paymentsApi.paySlip(slipForm.value)
    showSlipForm.value = false
    await load()
  } catch {
    error.value = 'Failed to submit slip'
  }
}

async function approve(id: string) {
  await paymentsApi.approve(id)
  await load()
}

async function reject(id: string) {
  await paymentsApi.reject(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Payments</h1>
      <div class="flex gap-2">
        <button @click="showCashForm = true; showSlipForm = false" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">Cash Payment</button>
        <button @click="showSlipForm = true; showCashForm = false" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">Slip Payment</button>
      </div>
    </div>

    <div v-if="showCashForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-3">Cash Payment</h2>
      <form @submit.prevent="payCash" class="flex gap-3 items-end">
        <div>
          <label class="text-xs text-gray-500 block mb-1">Contract</label>
          <select v-model="cashForm.contractId" required class="border rounded px-3 py-2 text-sm w-52">
            <option value="">Select contract</option>
            <option v-for="c in contracts" :key="c.id" :value="c.id">{{ c.customer.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Amount</label>
          <input v-model.number="cashForm.amount" type="number" min="1" required class="border rounded px-3 py-2 text-sm w-32" />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">Record</button>
        <button type="button" @click="showCashForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
      </form>
    </div>

    <div v-if="showSlipForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-3">Slip Payment</h2>
      <form @submit.prevent="paySlip" class="flex gap-3 items-end flex-wrap">
        <div>
          <label class="text-xs text-gray-500 block mb-1">Contract</label>
          <select v-model="slipForm.contractId" required class="border rounded px-3 py-2 text-sm w-52">
            <option value="">Select contract</option>
            <option v-for="c in contracts" :key="c.id" :value="c.id">{{ c.customer.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Amount</label>
          <input v-model.number="slipForm.amount" type="number" min="1" required class="border rounded px-3 py-2 text-sm w-32" />
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Slip URL</label>
          <input v-model="slipForm.slipUrl" placeholder="https://..." required class="border rounded px-3 py-2 text-sm w-60" />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Submit</button>
        <button type="button" @click="showSlipForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
      </form>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-left">Customer</th>
          <th class="px-4 py-3 text-left">Amount</th>
          <th class="px-4 py-3 text-left">Method</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3 text-left">Date</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="p in payments" :key="p.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">{{ p.contract?.customer?.name ?? '—' }}</td>
            <td class="px-4 py-3 font-medium">฿{{ p.amount.toLocaleString() }}</td>
            <td class="px-4 py-3"><span class="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{{ p.method }}</span></td>
            <td class="px-4 py-3">
              <span :class="p.status === 'APPROVED' ? 'bg-green-100 text-green-800' : p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'" class="px-2 py-0.5 rounded text-xs">{{ p.status }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(p.createdAt).toLocaleDateString() }}</td>
            <td class="px-4 py-3 text-right space-x-2">
              <template v-if="p.status === 'PENDING'">
                <button @click="approve(p.id)" class="text-green-600 hover:underline text-xs">Approve</button>
                <button @click="reject(p.id)" class="text-red-500 hover:underline text-xs">Reject</button>
              </template>
            </td>
          </tr>
          <tr v-if="!loading && payments.length === 0"><td colspan="6" class="px-4 py-6 text-center text-gray-400">No payments yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
