<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import AppNav from './components/AppNav.vue'

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNav v-if="auth.isLoggedIn" />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
