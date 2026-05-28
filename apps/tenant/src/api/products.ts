import api from './index'

export const productsApi = {
  list: () => api.get('/products'),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: object) => api.post('/products', data),
  update: (id: string, data: object) => api.patch(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
}
