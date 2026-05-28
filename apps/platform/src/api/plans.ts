import api from './index'

export interface Plan {
  id: string; name: string; maxBranches: number; maxUsers: number
  pricePerMonth: number; isActive: boolean; _count: { tenants: number }
}

export const plansApi = {
  findAll: () => api.get<Plan[]>('/platform/plans'),
  create: (data: Pick<Plan, 'name' | 'maxBranches' | 'maxUsers' | 'pricePerMonth'>) =>
    api.post<Plan>('/platform/plans', data),
  update: (id: string, data: Partial<Plan>) => api.patch<Plan>(`/platform/plans/${id}`, data),
  deactivate: (id: string) => api.delete(`/platform/plans/${id}`),
}
