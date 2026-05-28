<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { branchesApi } from '../api/branches'

interface Branch { id: string; name: string; address?: string; isActive: boolean }

const branches = ref<Branch[]>([])
const loading = ref(true)
const showForm = ref(false)
const editTarget = ref<Branch | null>(null)
const form = ref({ name: '', address: '' })
const error = ref('')

async function load() {
  loading.value = true
  try {
    const res = await branchesApi.list()
    branches.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editTarget.value = null
  form.value = { name: '', address: '' }
  showForm.value = true
}

function openEdit(b: Branch) {
  editTarget.value = b
  form.value = { name: b.name, address: b.address ?? '' }
  showForm.value = true
}

async function save() {
  error.value = ''
  try {
    if (editTarget.value) {
      await branchesApi.update(editTarget.value.id, form.value)
    } else {
      await branchesApi.create(form.value)
    }
    showForm.value = false
    await load()
  } catch {
    error.value = 'Failed to save'
  }
}

async function remove(id: string) {
  if (!confirm('Delete this branch?')) return
  await branchesApi.remove(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Branches</h1>
      <button @click="openCreate" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">+ New Branch</button>
    </div>

    <div v-if="showForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-4">{{ editTarget ? 'Edit Branch' : 'New Branch' }}</h2>
      <form @submit.prevent="save" class="space-y-3">
        <input v-model="form.name" placeholder="Branch name" required class="w-full border rounded px-3 py-2 text-sm" />
        <input v-model="form.address" placeholder="Address" class="w-full border rounded px-3 py-2 text-sm" />
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
          <th class="px-4 py-3 text-left">Address</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="4" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="b in branches" :key="b.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">{{ b.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ b.address ?? '—' }}</td>
            <td class="px-4 py-3">
              <span :class="b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded text-xs">
                {{ b.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(b)" class="text-indigo-600 hover:underline text-xs">Edit</button>
              <button @click="remove(b.id)" class="text-red-500 hover:underline text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="!loading && branches.length === 0"><td colspan="4" class="px-4 py-6 text-center text-gray-400">No branches yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
