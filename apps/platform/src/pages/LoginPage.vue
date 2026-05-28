<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Platform Admin</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" required class="input" />
        </div>
        <div>
          <label class="label">Password</label>
          <input v-model="form.password" type="password" required class="input" />
        </div>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true; error.value = ''
  try {
    const { data } = await authApi.login(form.value.email, form.value.password)
    auth.setAuth(data.accessToken, data.admin)
    router.push('/tenants')
  } catch { error.value = 'Invalid email or password' }
  finally { loading.value = false }
}
</script>
