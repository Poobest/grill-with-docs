<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { contractsApi } from '../api/contracts'
import { customersApi } from '../api/customers'
import { productsApi } from '../api/products'
import { branchesApi } from '../api/branches'

interface Contract { id: string; customer: { name: string }; product: { name: string }; totalAmount: number; remainingAmount: number; status: string; installments: number; createdAt: string }
interface Customer { id: string; name: string }
interface Product { id: string; name: string; price: number }
interface Branch { id: string; name: string }

const contracts = ref<Contract[]>([])
const customers = ref<Customer[]>([])
const products = ref<Product[]>([])
const branches = ref<Branch[]>([])
const loading = ref(true)
const showForm = ref(false)
const form = ref({ customerId: '', productId: '', branchId: '', installments: 12, downPayment: 0, interestRate: 0 })
const error = ref('')

async function load() {
  loading.value = true
  try {
    const [c, cu, pr, br] = await Promise.all([contractsApi.list(), customersApi.list(), productsApi.list(), branchesApi.list()])
    contracts.value = c.data
    customers.value = cu.data
    products.value = pr.data
    branches.value = br.data
  } finally {
    loading.value = false
  }
}

async function create() {
  error.value = ''
  try {
    await contractsApi.create(form.value)
    showForm.value = false
    await load()
  } catch {
    error.value = 'Failed to create contract'
  }
}

async function cancel(id: string) {
  if (!confirm('Cancel this contract?')) return
  await contractsApi.cancel(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Contracts</h1>
      <button @click="showForm = !showForm" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">+ New Contract</button>
    </div>

    <div v-if="showForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-4">New Contract</h2>
      <form @submit.prevent="create" class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-gray-500 block mb-1">Customer</label>
          <select v-model="form.customerId" required class="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select customer</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Product</label>
          <select v-model="form.productId" required class="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select product</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Branch</label>
          <select v-model="form.branchId" required class="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select branch</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Installments (months)</label>
          <input v-model.number="form.installments" type="number" min="1" required class="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Down Payment</label>
          <input v-model.number="form.downPayment" type="number" min="0" class="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Interest Rate (%)</label>
          <input v-model.number="form.interestRate" type="number" min="0" step="0.1" class="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <p v-if="error" class="text-red-500 text-sm col-span-2">{{ error }}</p>
        <div class="col-span-2 flex gap-2">
          <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">Create</button>
          <button type="button" @click="showForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
        </div>
      </form>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-left">Customer</th>
          <th class="px-4 py-3 text-left">Product</th>
          <th class="px-4 py-3 text-left">Total</th>
          <th class="px-4 py-3 text-left">Remaining</th>
          <th class="px-4 py-3 text-left">Installments</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="c in contracts" :key="c.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">{{ c.customer.name }}</td>
            <td class="px-4 py-3">{{ c.product.name }}</td>
            <td class="px-4 py-3">฿{{ c.totalAmount.toLocaleString() }}</td>
            <td class="px-4 py-3">฿{{ c.remainingAmount.toLocaleString() }}</td>
            <td class="px-4 py-3">{{ c.installments }}</td>
            <td class="px-4 py-3">
              <span :class="c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : c.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'" class="px-2 py-0.5 rounded text-xs">{{ c.status }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button v-if="c.status === 'ACTIVE'" @click="cancel(c.id)" class="text-red-500 hover:underline text-xs">Cancel</button>
            </td>
          </tr>
          <tr v-if="!loading && contracts.length === 0"><td colspan="7" class="px-4 py-6 text-center text-gray-400">No contracts yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
