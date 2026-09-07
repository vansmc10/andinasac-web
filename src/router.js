import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './components/LoginView.vue';
import DashboardView from './components/DashboardView.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
