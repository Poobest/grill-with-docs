import api from './index'

export const branchesApi = {
  list: () => api.get('/branches'),
  get: (id: string) => api.get(`/branches/${id}`),
  create: (data: object) => api.post('/branches', data),
  update: (id: string, data: object) => api.patch(`/branches/${id}`, data),
  remove: (id: string) => api.delete(`/branches/${id}`),
}
