import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { apiFetch } from '@/lib/api';

export interface AuthUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'SALE_LEAD' | 'SALE';
  tenantId: string;
  branchId: string | null;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

const ROLE_LABELS: Record<AuthUser['role'], string> = {
  ADMIN: 'ผู้ดูแลร้าน',
  SALE_LEAD: 'หัวหน้าทีมขาย',
  SALE: 'พนักงานขาย',
};

function readUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<AuthUser | null>(readUser());

  const isAuthenticated = computed(() => token.value !== null);
  const roleLabel = computed(() =>
    user.value ? ROLE_LABELS[user.value.role] : '',
  );

  async function login(email: string, password: string): Promise<void> {
    const result = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    token.value = result.accessToken;
    user.value = result.user;
    localStorage.setItem('token', result.accessToken);
    localStorage.setItem('user', JSON.stringify(result.user));
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, isAuthenticated, roleLabel, login, logout };
});
