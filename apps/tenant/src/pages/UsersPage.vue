<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usersApi } from '../api/users'
import { branchesApi } from '../api/branches'

interface User { id: string; name: string; email: string; role: string; isActive: boolean; branchId?: string }
interface Branch { id: string; name: string }

const users = ref<User[]>([])
const branches = ref<Branch[]>([])
const loading = ref(true)
const showForm = ref(false)
const editTarget = ref<User | null>(null)
const form = ref({ name: '', email: '', password: '', role: 'STAFF', branchId: '' })
const error = ref('')

async function load() {
  loading.value = true
  try {
    const [u, b] = await Promise.all([usersApi.list(), branchesApi.list()])
    users.value = u.data
    branches.value = b.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editTarget.value = null
  form.value = { name: '', email: '', password: '', role: 'STAFF', branchId: '' }
  showForm.value = true
}

function openEdit(u: User) {
  editTarget.value = u
  form.value = { name: u.name, email: u.email, password: '', role: u.role, branchId: u.branchId ?? '' }
  showForm.value = true
}

async function save() {
  error.value = ''
  try {
    const payload: Record<string, unknown> = { name: form.value.name, email: form.value.email, role: form.value.role, branchId: form.value.branchId || undefined }
    if (form.value.password) payload.password = form.value.password
    if (editTarget.value) {
      await usersApi.update(editTarget.value.id, payload)
    } else {
      await usersApi.create({ ...payload, password: form.value.password })
    }
    showForm.value = false
    await load()
  } catch {
    error.value = 'Failed to save'
  }
}

async function remove(id: string) {
  if (!confirm('Delete this user?')) return
  await usersApi.remove(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Users</h1>
      <button @click="openCreate" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">+ New User</button>
    </div>

    <div v-if="showForm" class="bg-white shadow rounded-lg p-6 mb-4">
      <h2 class="font-semibold mb-4">{{ editTarget ? 'Edit User' : 'New User' }}</h2>
      <form @submit.prevent="save" class="grid grid-cols-2 gap-3">
        <input v-model="form.name" placeholder="Name" required class="border rounded px-3 py-2 text-sm" />
        <input v-model="form.email" type="email" placeholder="Email" required class="border rounded px-3 py-2 text-sm" />
        <input v-model="form.password" type="password" :placeholder="editTarget ? 'New password (optional)' : 'Password'" :required="!editTarget" class="border rounded px-3 py-2 text-sm" />
        <select v-model="form.role" class="border rounded px-3 py-2 text-sm">
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="STAFF">STAFF</option>
        </select>
        <select v-model="form.branchId" class="border rounded px-3 py-2 text-sm col-span-2">
          <option value="">No specific branch</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <p v-if="error" class="text-red-500 text-sm col-span-2">{{ error }}</p>
        <div class="col-span-2 flex gap-2">
          <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">Save</button>
          <button type="button" @click="showForm = false" class="border px-4 py-2 rounded text-sm">Cancel</button>
        </div>
      </form>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-left">Name</th>
          <th class="px-4 py-3 text-left">Email</th>
          <th class="px-4 py-3 text-left">Role</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3"></th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
          <tr v-else v-for="u in users" :key="u.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">{{ u.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ u.email }}</td>
            <td class="px-4 py-3"><span class="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{{ u.role }}</span></td>
            <td class="px-4 py-3">
              <span :class="u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded text-xs">{{ u.isActive ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(u)" class="text-indigo-600 hover:underline text-xs">Edit</button>
              <button @click="remove(u.id)" class="text-red-500 hover:underline text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0"><td colspan="5" class="px-4 py-6 text-center text-gray-400">No users yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
