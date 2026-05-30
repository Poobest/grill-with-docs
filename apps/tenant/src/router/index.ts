import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';
import ContractsView from '@/views/ContractsView.vue';
import CreateContractView from '@/views/CreateContractView.vue';
import ContractDetailView from '@/views/ContractDetailView.vue';
import CollectTodayView from '@/views/CollectTodayView.vue';
import CustomersView from '@/views/CustomersView.vue';
import ProductsView from '@/views/ProductsView.vue';
import BranchesView from '@/views/BranchesView.vue';
import UsersView from '@/views/UsersView.vue';
import StockView from '@/views/StockView.vue';
import PlaceholderView from '@/views/PlaceholderView.vue';
import LoginView from '@/views/LoginView.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/contracts', name: 'contracts', component: ContractsView },
    { path: '/contracts/new', name: 'contracts-new', component: CreateContractView },
    { path: '/contracts/:id', name: 'contract-detail', component: ContractDetailView },
    // Placeholder routes keep sidebar nav functional until each slice ships.
    { path: '/customers', name: 'customers', component: CustomersView },
    { path: '/collect-today', name: 'collect-today', component: CollectTodayView },
    { path: '/payments', component: PlaceholderView, meta: { title: 'การชำระเงิน' } },
    { path: '/products', name: 'products', component: ProductsView },
    { path: '/stock', name: 'stock', component: StockView },
    { path: '/branches', name: 'branches', component: BranchesView },
    { path: '/users', name: 'users', component: UsersView },
  ],
});

// Auth gate: every route except /login requires a valid session.
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login' };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
