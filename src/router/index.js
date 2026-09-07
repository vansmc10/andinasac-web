import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'blank' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mapa',
    name: 'mapa',
    component: () => import('@/modules/mapa/views/MapaView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/consumo',
    name: 'consumo',
    component: () => import('@/modules/consumo/views/ConsumoView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mantenimiento',
    name: 'mantenimiento',
    component: () => import('@/modules/mantenimiento/views/MantenimientoView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: () => import('@/modules/reportes/views/ReportesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/unidades',
    name: 'unidades',
    component: () => import('@/modules/unidades/views/UnidadesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/conductores',
    name: 'conductores',
    component: () => import('@/modules/conductores/views/ConductoresView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/configuracion',
    name: 'configuracion',
    component: () => import('@/modules/configuracion/views/ConfiguracionView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token        = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth !== false

  // ── Ruta protegida sin sesión → redirige a login conservando la URL destino
  if (requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // ── Ya logueado intenta entrar al login → redirige al dashboard
  if (to.name === 'login' && token) {
    return { name: 'dashboard' }
  }
})

export default router
