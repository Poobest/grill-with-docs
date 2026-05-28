<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

async function login() {
  error.value = ''
  loading.value = true
  try {
    const res = await authApi.login(email.value, password.value)
    auth.setAuth(res.data.accessToken, res.data.user)
    router.push('/dashboard')
  } catch {
    error.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-white shadow rounded-lg p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-6 text-center text-indigo-700">Tenant Login</h1>
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-medium text-sm disabled:opacity-50">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>
