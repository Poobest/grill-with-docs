import api from './index'

export interface Tenant {
  id: string; name: string; isActive: boolean
  subscriptionExpiresAt: string | null
  plan: { id: string; name: string; pricePerMonth: number }
  _count: { users: number; branches: number; contracts: number; payments?: number }
}

export const tenantsApi = {
  findAll: () => api.get<Tenant[]>('/platform/tenants'),
  findOne: (id: string) => api.get<Tenant>(`/platform/tenants/${id}`),
  create: (data: {
    name: string; planId: string; adminName: string
    adminEmail: string; adminPassword: string; subscriptionMonths?: number
  }) => api.post<Tenant>('/platform/tenants', data),
  activate: (id: string) => api.patch(`/platform/tenants/${id}/activate`),
  deactivate: (id: string) => api.patch(`/platform/tenants/${id}/deactivate`),
  extendSubscription: (id: string, months: number) =>
    api.patch<Tenant>(`/platform/tenants/${id}/extend-subscription`, { months }),
}
