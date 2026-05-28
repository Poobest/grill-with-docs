import api from './index'

export const paymentsApi = {
  list: () => api.get('/payments'),
  get: (id: string) => api.get(`/payments/${id}`),
  payCash: (data: object) => api.post('/payments/cash', data),
  paySlip: (data: object) => api.post('/payments/slip', data),
  approve: (id: string) => api.patch(`/payments/${id}/approve`),
  reject: (id: string) => api.patch(`/payments/${id}/reject`),
}
