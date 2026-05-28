<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { stockApi } from '../api/stock'
import { branchesApi } from '../api/branches'

interface Branch { id: string; name: string }
interface StockItem { id: string; product: { id: string; name: string }; quantity: number }

const branches = ref<Branch[]>([])
const selectedBranch = ref('')
const stock = ref<StockItem[]>([])
const loading = ref(false)
const showSetForm = ref(false)
const showAdjustForm = ref(false)
const setForm = ref({ productId: '', quantity: 0 })
const adjustForm = ref({ productId: '', delta: 0, reason: '' })
const error = ref('')

async function loadBranches() {
  const res = await branchesApi.list()
  branches.value = res.data
  if (branches.value.length > 0) {
    selectedBranch.value = branches.value[0].id
    await loadStock()
  }
}

async function loadStock() {
  if (!selectedBranch.value) return
  loading.value = true
  try {
    const res = await stockApi.list(selectedBranch.value)
    stock.value = res.data
  } finally {
    loading.value = false
  }
}

async function setStock() {
  error.value = ''
  try {
    await stockApi.set(selectedBranch.value, setForm.value)
    showSetForm.value = false
    await loadStock()
  } catch {
    error.value = 'Failed to set stock'
  }
}

async function adjustStock() {
  error.value = ''
  try {
    await stockApi.adjust(selectedBranch.value, adjustForm.value)
    showAdjustForm.value = false
    await loadStock()
  } catch {
    error.value = 'Failed to adjust stock'
  }
}

onMounted(loadBranches)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Stock</h1>
      <div class="flex gap-2">
        <button @click="showSetForm = true; showAdjustForm = false" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm">Set Stock</button>
        <button @click="showAdjustForm = true; showSetForm = false" class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm">Adjust Stock</button>
      </div>
    </div>

    <div class="mb-4 flex items-center gap-3">
      <label class="text-sm font-medium">Branch:</label>
      <select v-model="selectedBranch" @change="loadStock" class="border rounded px-3 py-2 text-sm">
        <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>
    </div>

    <div v-if="showSetForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-3">Set Stock</h2>
      <form @submit.prevent="setStock" class="flex gap-3 items-end">
        <div>
          <label class="text-xs text-gray-500 block mb-1">Product ID</label>
          <input v-model="setForm.productId" placeholder="Product ID" required class="border rounded px-3 py-2 text-sm w-48" />
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Quantity</label>
          <input v-model.number="setForm.quantity" type="number" min="0" required class="border rounded px-3 py-2 text-sm w-28" />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">Set</button>
        <button type="button" @click="showSetForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
      </form>
    </div>

    <div v-if="showAdjustForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-3">Adjust Stock</h2>
      <form @submit.prevent="adjustStock" class="flex gap-3 items-end">
        <div>
          <label class="text-xs text-gray-500 block mb-1">Product ID</label>
          <input v-model="adjustForm.productId" placeholder="Product ID" required class="border rounded px-3 py-2 text-sm w-48" />
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Delta (+/-)</label>
          <input v-model.number="adjustForm.delta" type="number" required class="border rounded px-3 py-2 text-sm w-28" />
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Reason</label>
          <input v-model="adjustForm.reason" placeholder="Reason" class="border rounded px-3 py-2 text-sm w-40" />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm">Adjust</button>
        <button type="button" @click="showAdjustForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
      </form>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-left">Product</th>
          <th class="px-4 py-3 text-left">Quantity</th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="2" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="s in stock" :key="s.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">{{ s.product.name }}</td>
            <td class="px-4 py-3 font-medium" :class="s.quantity === 0 ? 'text-red-500' : 'text-gray-800'">{{ s.quantity }}</td>
          </tr>
          <tr v-if="!loading && stock.length === 0"><td colspan="2" class="px-4 py-6 text-center text-gray-400">No stock records</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
