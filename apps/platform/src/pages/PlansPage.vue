<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Subscription Plans</h1>
      <button @click="openCreate" class="btn-primary">+ New Plan</button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">Branches</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">Users</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">฿/Month</th>
            <th class="text-right px-4 py-3 text-gray-600 font-medium">Tenants</th>
            <th class="text-center px-4 py-3 text-gray-600 font-medium">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="plan in plans" :key="plan.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">{{ plan.name }}</td>
            <td class="px-4 py-3 text-right">{{ plan.maxBranches }}</td>
            <td class="px-4 py-3 text-right">{{ plan.maxUsers }}</td>
            <td class="px-4 py-3 text-right">{{ Number(plan.pricePerMonth).toLocaleString() }}</td>
            <td class="px-4 py-3 text-right">{{ plan._count.tenants }}</td>
            <td class="px-4 py-3 text-center">
              <span :class="plan.isActive ? 'badge-green' : 'badge-gray'">
                {{ plan.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right space-x-3">
              <button @click="openEdit(plan)" class="text-indigo-600 hover:text-indigo-800 text-xs">Edit</button>
              <button v-if="plan.isActive" @click="handleDeactivate(plan.id)" class="text-red-600 hover:text-red-800 text-xs">Deactivate</button>
            </td>
          </tr>
          <tr v-if="!plans.length">
            <td colspan="7" class="px-4 py-10 text-center text-gray-400">No plans yet</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="modal.open" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">{{ modal.editing ? 'Edit Plan' : 'New Plan' }}</h2>
        <form @submit.prevent="handleSave" class="space-y-3">
          <div><label class="label">Name</label><input v-model="modal.form.name" required class="input" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Max Branches</label><input v-model.number="modal.form.maxBranches" type="number" min="1" required class="input" /></div>
            <div><label class="label">Max Users</label><input v-model.number="modal.form.maxUsers" type="number" min="1" required class="input" /></div>
          </div>
          <div><label class="label">Price / Month (฿)</label><input v-model.number="modal.form.pricePerMonth" type="number" min="0" step="0.01" required class="input" /></div>
          <p v-if="modal.error" class="text-red-600 text-sm">{{ modal.error }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="modal.open = false" class="btn-secondary">Cancel</button>
            <button type="submit" :disabled="modal.loading" class="btn-primary">{{ modal.loading ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { type Plan, plansApi } from '../api/plans'

const plans = ref<Plan[]>([])
const modal = reactive({
  open: false, editing: null as Plan | null, loading: false, error: '',
  form: { name: '', maxBranches: 1, maxUsers: 5, pricePerMonth: 0 },
})

async function load() { const { data } = await plansApi.findAll(); plans.value = data }

function openCreate() {
  modal.editing = null; modal.error = ''
  modal.form = { name: '', maxBranches: 1, maxUsers: 5, pricePerMonth: 0 }
  modal.open = true
}

function openEdit(plan: Plan) {
  modal.editing = plan; modal.error = ''
  modal.form = { name: plan.name, maxBranches: plan.maxBranches, maxUsers: plan.maxUsers, pricePerMonth: Number(plan.pricePerMonth) }
  modal.open = true
}

async function handleSave() {
  modal.loading = true; modal.error = ''
  try {
    if (modal.editing) await plansApi.update(modal.editing.id, modal.form)
    else await plansApi.create(modal.form)
    modal.open = false; await load()
  } catch { modal.error = 'Failed to save' }
  finally { modal.loading = false }
}

async function handleDeactivate(id: string) {
  if (!confirm('Deactivate this plan?')) return
  await plansApi.deactivate(id); await load()
}

onMounted(load)
</script>
