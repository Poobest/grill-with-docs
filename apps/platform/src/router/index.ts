import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import PlansPage from '../pages/PlansPage.vue'
import TenantCreatePage from '../pages/TenantCreatePage.vue'
import TenantDetailPage from '../pages/TenantDetailPage.vue'
import TenantsPage from '../pages/TenantsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage },
    { path: '/', redirect: '/tenants' },
    { path: '/plans', component: PlansPage, meta: { requiresAuth: true } },
    { path: '/tenants', component: TenantsPage, meta: { requiresAuth: true } },
    { path: '/tenants/new', component: TenantCreatePage, meta: { requiresAuth: true } },
    { path: '/tenants/:id', component: TenantDetailPage, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('platform_token')
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/tenants'
})

export default router
