import api from './index'

export const usersApi = {
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: object) => api.post('/users', data),
  update: (id: string, data: object) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
}
