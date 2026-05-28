import api from './index'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; admin: { id: string; email: string } }>(
      '/auth/platform/login', { email, password },
    ),
}
