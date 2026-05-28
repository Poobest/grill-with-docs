import api from './index'

export const customersApi = {
  list: () => api.get('/customers'),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: object) => api.post('/customers', data),
  update: (id: string, data: object) => api.patch(`/customers/${id}`, data),
  updateLimit: (id: string, data: object) => api.patch(`/customers/${id}/limit`, data),
  suspend: (id: string) => api.patch(`/customers/${id}/suspend`),
  unsuspend: (id: string) => api.patch(`/customers/${id}/unsuspend`),
  claim: (data: object) => api.post('/customers/claim', data),
}
