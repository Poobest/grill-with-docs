import api from './index'

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
}
