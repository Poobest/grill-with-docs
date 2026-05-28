<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-gray-600">Welcome back, <strong>{{ auth.user?.name }}</strong></p>
      <p class="text-sm text-gray-500 mt-1">Role: {{ auth.user?.role }}</p>
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink to="/customers" class="bg-indigo-50 rounded-lg p-4 text-center hover:bg-indigo-100">
          <div class="text-2xl font-bold text-indigo-700">→</div>
          <div class="text-sm text-gray-600 mt-1">Customers</div>
        </RouterLink>
        <RouterLink to="/contracts" class="bg-green-50 rounded-lg p-4 text-center hover:bg-green-100">
          <div class="text-2xl font-bold text-green-700">→</div>
          <div class="text-sm text-gray-600 mt-1">Contracts</div>
        </RouterLink>
        <RouterLink to="/payments" class="bg-yellow-50 rounded-lg p-4 text-center hover:bg-yellow-100">
          <div class="text-2xl font-bold text-yellow-700">→</div>
          <div class="text-sm text-gray-600 mt-1">Payments</div>
        </RouterLink>
        <RouterLink to="/commissions" class="bg-purple-50 rounded-lg p-4 text-center hover:bg-purple-100">
          <div class="text-2xl font-bold text-purple-700">→</div>
          <div class="text-sm text-gray-600 mt-1">Commissions</div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
