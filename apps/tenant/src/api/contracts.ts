import api from './index'

export const contractsApi = {
  list: () => api.get('/contracts'),
  get: (id: string) => api.get(`/contracts/${id}`),
  create: (data: object) => api.post('/contracts', data),
  cancel: (id: string) => api.delete(`/contracts/${id}/cancel`),
}
