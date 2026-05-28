<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="bg-indigo-700 text-white px-6 py-3 flex items-center gap-6">
    <span class="font-bold text-lg mr-4">GrillDocs Tenant</span>
    <RouterLink to="/dashboard" class="hover:text-indigo-200 text-sm">Dashboard</RouterLink>
    <RouterLink to="/branches" class="hover:text-indigo-200 text-sm">Branches</RouterLink>
    <RouterLink to="/users" class="hover:text-indigo-200 text-sm">Users</RouterLink>
    <RouterLink to="/products" class="hover:text-indigo-200 text-sm">Products</RouterLink>
    <RouterLink to="/stock" class="hover:text-indigo-200 text-sm">Stock</RouterLink>
    <RouterLink to="/customers" class="hover:text-indigo-200 text-sm">Customers</RouterLink>
    <RouterLink to="/contracts" class="hover:text-indigo-200 text-sm">Contracts</RouterLink>
    <RouterLink to="/payments" class="hover:text-indigo-200 text-sm">Payments</RouterLink>
    <RouterLink to="/commissions" class="hover:text-indigo-200 text-sm">Commissions</RouterLink>
    <span class="ml-auto flex items-center gap-3 text-sm">
      <span v-if="auth.user">{{ auth.user.name }} ({{ auth.user.role }})</span>
      <button @click="logout" class="bg-indigo-900 hover:bg-indigo-800 px-3 py-1 rounded text-sm">Logout</button>
    </span>
  </nav>
</template>
