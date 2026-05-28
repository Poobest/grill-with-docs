<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { customersApi } from '../api/customers'

interface Customer { id: string; name: string; phone?: string; nationalId?: string; creditLimit: number; status: string }

const customers = ref<Customer[]>([])
const loading = ref(true)
const showForm = ref(false)
const editTarget = ref<Customer | null>(null)
const form = ref({ name: '', phone: '', nationalId: '', creditLimit: 50000 })
const limitForm = ref({ customerId: '', newLimit: 0 })
const showLimitModal = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  try {
    const res = await customersApi.list()
    customers.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editTarget.value = null
  form.value = { name: '', phone: '', nationalId: '', creditLimit: 50000 }
  showForm.value = true
}

function openEdit(c: Customer) {
  editTarget.value = c
  form.value = { name: c.name, phone: c.phone ?? '', nationalId: c.nationalId ?? '', creditLimit: c.creditLimit }
  showForm.value = true
}

async function save() {
  error.value = ''
  try {
    if (editTarget.value) {
      await customersApi.update(editTarget.value.id, form.value)
    } else {
      await customersApi.create(form.value)
    }
    showForm.value = false
    await load()
  } catch {
    error.value = 'Failed to save'
  }
}

function openLimit(c: Customer) {
  limitForm.value = { customerId: c.id, newLimit: c.creditLimit }
  showLimitModal.value = true
}

async function saveLimit() {
  await customersApi.updateLimit(limitForm.value.customerId, { creditLimit: limitForm.value.newLimit })
  showLimitModal.value = false
  await load()
}

async function toggleSuspend(c: Customer) {
  if (c.status === 'SUSPENDED') {
    await customersApi.unsuspend(c.id)
  } else {
    await customersApi.suspend(c.id)
  }
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Customers</h1>
      <button @click="openCreate" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">+ New Customer</button>
    </div>

    <div v-if="showForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-4">{{ editTarget ? 'Edit Customer' : 'New Customer' }}</h2>
      <form @submit.prevent="save" class="grid grid-cols-2 gap-3">
        <input v-model="form.name" placeholder="Full name" required class="border rounded px-3 py-2 text-sm" />
        <input v-model="form.phone" placeholder="Phone" class="border rounded px-3 py-2 text-sm" />
        <input v-model="form.nationalId" placeholder="National ID" class="border rounded px-3 py-2 text-sm" />
        <input v-model.number="form.creditLimit" type="number" placeholder="Credit limit" min="0" class="border rounded px-3 py-2 text-sm" />
        <p v-if="error" class="text-red-500 text-sm col-span-2">{{ error }}</p>
        <div class="col-span-2 flex gap-2">
          <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">Save</button>
          <button type="button" @click="showForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
        </div>
      </form>
    </div>

    <div v-if="showLimitModal" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-3">Update Credit Limit</h2>
      <form @submit.prevent="saveLimit" class="flex gap-3 items-end">
        <input v-model.number="limitForm.newLimit" type="number" min="0" required class="border rounded px-3 py-2 text-sm w-40" />
        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">Update</button>
        <button type="button" @click="showLimitModal = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
      </form>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-left">Name</th>
          <th class="px-4 py-3 text-left">Phone</th>
          <th class="px-4 py-3 text-left">Credit Limit</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="c in customers" :key="c.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">{{ c.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ c.phone ?? '—' }}</td>
            <td class="px-4 py-3">฿{{ c.creditLimit.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span :class="c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : c.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded text-xs">{{ c.status }}</span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(c)" class="text-indigo-600 hover:underline text-xs">Edit</button>
              <button @click="openLimit(c)" class="text-green-600 hover:underline text-xs">Limit</button>
              <button @click="toggleSuspend(c)" :class="c.status === 'SUSPENDED' ? 'text-green-600' : 'text-red-500'" class="hover:underline text-xs">{{ c.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend' }}</button>
            </td>
          </tr>
          <tr v-if="!loading && customers.length === 0"><td colspan="5" class="px-4 py-6 text-center text-gray-400">No customers yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
