import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface Admin { id: string; email: string }

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('platform_token'))
  const admin = ref<Admin | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  function setAuth(newToken: string, newAdmin: Admin) {
    token.value = newToken
    admin.value = newAdmin
    localStorage.setItem('platform_token', newToken)
  }

  function logout() {
    token.value = null
    admin.value = null
    localStorage.removeItem('platform_token')
  }

  return { token, admin, isLoggedIn, setAuth, logout }
})
