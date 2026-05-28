import api from './index'

export const commissionsApi = {
  list: () => api.get('/commissions'),
}
