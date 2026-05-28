<template>
  <nav class="bg-indigo-700 text-white">
    <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
      <div class="flex items-center gap-6">
        <span class="font-bold">Platform Admin</span>
        <RouterLink to="/plans" class="text-sm hover:text-indigo-200">Plans</RouterLink>
        <RouterLink to="/tenants" class="text-sm hover:text-indigo-200">Tenants</RouterLink>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-indigo-200">{{ auth.admin?.email }}</span>
        <button @click="handleLogout" class="text-sm hover:text-indigo-200 cursor-pointer">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
const router = useRouter()
function handleLogout() { auth.logout(); router.push('/login') }
</script>
