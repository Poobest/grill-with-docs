import api from './index'

export const stockApi = {
  list: (branchId: string) => api.get(`/branches/${branchId}/stock`),
  set: (branchId: string, data: object) => api.post(`/branches/${branchId}/stock/set`, data),
  adjust: (branchId: string, data: object) => api.patch(`/branches/${branchId}/stock/adjust`, data),
}
