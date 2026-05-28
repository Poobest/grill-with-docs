<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { productsApi } from '../api/products'

interface Product { id: string; name: string; price: number; description?: string; isActive: boolean }

const products = ref<Product[]>([])
const loading = ref(true)
const showForm = ref(false)
const editTarget = ref<Product | null>(null)
const form = ref({ name: '', price: 0, description: '' })
const error = ref('')

async function load() {
  loading.value = true
  try {
    const res = await productsApi.list()
    products.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editTarget.value = null
  form.value = { name: '', price: 0, description: '' }
  showForm.value = true
}

function openEdit(p: Product) {
  editTarget.value = p
  form.value = { name: p.name, price: p.price, description: p.description ?? '' }
  showForm.value = true
}

async function save() {
  error.value = ''
  try {
    if (editTarget.value) {
      await productsApi.update(editTarget.value.id, form.value)
    } else {
      await productsApi.create(form.value)
    }
    showForm.value = false
    await load()
  } catch {
    error.value = 'Failed to save'
  }
}

async function remove(id: string) {
  if (!confirm('Delete this product?')) return
  await productsApi.remove(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Products</h1>
      <button @click="openCreate" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">+ New Product</button>
    </div>

    <div v-if="showForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-4">{{ editTarget ? 'Edit Product' : 'New Product' }}</h2>
      <form @submit.prevent="save" class="space-y-3">
        <input v-model="form.name" placeholder="Product name" required class="w-full border rounded px-3 py-2 text-sm" />
        <input v-model.number="form.price" type="number" placeholder="Price" required min="0" class="w-full border rounded px-3 py-2 text-sm" />
        <input v-model="form.description" placeholder="Description (optional)" class="w-full border rounded px-3 py-2 text-sm" />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <div class="flex gap-2">
          <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">Save</button>
          <button type="button" @click="showForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
        </div>
      </form>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-left">Name</th>
          <th class="px-4 py-3 text-left">Price</th>
          <th class="px-4 py-3 text-left">Description</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="p in products" :key="p.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">{{ p.name }}</td>
            <td class="px-4 py-3">฿{{ p.price.toLocaleString() }}</td>
            <td class="px-4 py-3 text-gray-500">{{ p.description ?? '—' }}</td>
            <td class="px-4 py-3">
              <span :class="p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded text-xs">{{ p.isActive ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(p)" class="text-indigo-600 hover:underline text-xs">Edit</button>
              <button @click="remove(p.id)" class="text-red-500 hover:underline text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="!loading && products.length === 0"><td colspan="5" class="px-4 py-6 text-center text-gray-400">No products yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
