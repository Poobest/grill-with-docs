import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import BranchesPage from '../pages/BranchesPage.vue'
import UsersPage from '../pages/UsersPage.vue'
import ProductsPage from '../pages/ProductsPage.vue'
import StockPage from '../pages/StockPage.vue'
import CustomersPage from '../pages/CustomersPage.vue'
import ContractsPage from '../pages/ContractsPage.vue'
import PaymentsPage from '../pages/PaymentsPage.vue'
import CommissionsPage from '../pages/CommissionsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage },
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
    { path: '/branches', component: BranchesPage, meta: { requiresAuth: true } },
    { path: '/users', component: UsersPage, meta: { requiresAuth: true } },
    { path: '/products', component: ProductsPage, meta: { requiresAuth: true } },
    { path: '/stock', component: StockPage, meta: { requiresAuth: true } },
    { path: '/customers', component: CustomersPage, meta: { requiresAuth: true } },
    { path: '/contracts', component: ContractsPage, meta: { requiresAuth: true } },
    { path: '/payments', component: PaymentsPage, meta: { requiresAuth: true } },
    { path: '/commissions', component: CommissionsPage, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('tenant_token')
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/dashboard'
})

export default router
