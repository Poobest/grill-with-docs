import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface TenantUser {
  id: string
  name: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('tenant_token'))
  const user = ref<TenantUser | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  function setAuth(newToken: string, newUser: TenantUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('tenant_token', newToken)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('tenant_token')
  }

  return { token, user, isLoggedIn, setAuth, logout }
})
