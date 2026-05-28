<template>
  <div class="min-h-screen bg-gray-50">
    <AppNav v-if="auth.isLoggedIn" />
    <div class="max-w-6xl mx-auto px-4 py-8">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNav from './components/AppNav.vue'
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
</script>
