import { createRouter, createWebHistory } from 'vue-router'

// ═════════════════════════════════════════════
// FUNCIONES DE AUTENTICACIÓN
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// OBTENER USUARIO GUARDADO
// ─────────────────────────────────────────────

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      return null
    }

    return JSON.parse(storedUser)
  } catch (error) {
    console.error(
      'Error al leer el usuario guardado:',
      error
    )

    localStorage.removeItem('user')

    return null
  }
}

// ─────────────────────────────────────────────
// OBTENER SERVICIO ACTIVO
// ─────────────────────────────────────────────

function hasActiveTrip() {
  try {
    const storedTrip = localStorage.getItem('activeTrip')

    if (!storedTrip) {
      return false
    }

    const trip = JSON.parse(storedTrip)

    return !!(
      trip &&
      trip.startedAt
    )
  } catch (error) {
    console.error(
      'Error al comprobar el servicio activo:',
      error
    )

    localStorage.removeItem('activeTrip')

    return false
  }
}

// ─────────────────────────────────────────────
// OBTENER DASHBOARD SEGÚN ROL
// ─────────────────────────────────────────────

function getDashboardByRole(role) {
  switch (role) {
    case 'admin':
      return {
        name: 'dashboard',
      }

    case 'conductor':
      return {
        name: 'dashboard-conductor',
      }

    case 'controlador_rutas':
      return {
        name: 'dashboard-controlador',
      }

    default:
      return {
        name: 'role-selection',
      }
  }
}

// ─────────────────────────────────────────────
// VERIFICAR SI EL ROL TIENE PERMISO
// ─────────────────────────────────────────────

function hasRolePermission(to, user) {
  // Si la ruta no define roles,
  // cualquier usuario autenticado puede acceder.
  if (
    !to.meta.roles ||
    to.meta.roles.length === 0
  ) {
    return true
  }

  // Si no existe usuario, no tiene permiso.
  if (!user) {
    return false
  }

  return to.meta.roles.includes(user.role)
}

// ═════════════════════════════════════════════
// RUTAS
// ═════════════════════════════════════════════

const routes = [

  // ═══════════════════════════════════════════
  // SELECCIÓN DE ROL
  // ═══════════════════════════════════════════

  {
    path: '/',
    name: 'role-selection',

    component: () =>
      import(
        '@/modules/auth/views/RoleSelectionView.vue'
      ),

    meta: {
      requiresAuth: false,
      layout: 'blank',
    },
  },

  // ═══════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════

  {
    path: '/login',
    name: 'login',

    component: () =>
      import(
        '@/modules/auth/views/LoginView.vue'
      ),

    meta: {
      requiresAuth: false,
      layout: 'blank',
    },
  },

  // ═══════════════════════════════════════════
  // ADMINISTRADOR
  // ═══════════════════════════════════════════

  // ───────────────────────────────────────────
  // DASHBOARD ADMINISTRADOR
  // ───────────────────────────────────────────

  {
    path: '/dashboard',
    name: 'dashboard',

    component: () =>
      import(
        '@/modules/dashboard/views/DashboardView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },

  // ───────────────────────────────────────────
  // MAPA
  // Administrador + Controlador
  // ───────────────────────────────────────────

  {
    path: '/mapa',
    name: 'mapa',

    component: () =>
      import(
        '@/modules/mapa/views/MapaView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: [
        'admin',
        'controlador_rutas',
      ],
    },
  },

  // ───────────────────────────────────────────
  // CONSUMO
  // Solo administrador
  // ───────────────────────────────────────────

  {
    path: '/consumo',
    name: 'consumo',

    component: () =>
      import(
        '@/modules/consumo/views/ConsumoView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },

  // ───────────────────────────────────────────
  // MANTENIMIENTO
  // Solo administrador
  // ───────────────────────────────────────────

  {
    path: '/mantenimiento',
    name: 'mantenimiento',

    component: () =>
      import(
        '@/modules/mantenimiento/views/MantenimientoView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },

  // ───────────────────────────────────────────
  // REPORTES
  // Administrador + Controlador
  // ───────────────────────────────────────────

  {
    path: '/reportes',
    name: 'reportes',

    component: () =>
      import(
        '@/modules/reportes/views/ReportesView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: [
        'admin',
        'controlador_rutas',
      ],
    },
  },

  // ───────────────────────────────────────────
  // UNIDADES
  // Solo administrador
  // ───────────────────────────────────────────

  {
    path: '/unidades',
    name: 'unidades',

    component: () =>
      import(
        '@/modules/unidades/views/UnidadesView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },

  // ───────────────────────────────────────────
  // CONDUCTORES
  // Solo administrador
  // ───────────────────────────────────────────

  {
    path: '/conductores',
    name: 'conductores',

    component: () =>
      import(
        '@/modules/conductores/views/ConductoresView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },

  // ───────────────────────────────────────────
  // CONFIGURACIÓN
  // Solo administrador
  // ───────────────────────────────────────────

  {
    path: '/configuracion',
    name: 'configuracion',

    component: () =>
      import(
        '@/modules/configuracion/views/ConfiguracionView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },

  // ═══════════════════════════════════════════
  // CONDUCTOR / CHOFER
  // ═══════════════════════════════════════════

  // ───────────────────────────────────────────
  // DASHBOARD DEL CONDUCTOR
  // ───────────────────────────────────────────

  {
    path: '/dashboard-conductor',
    name: 'dashboard-conductor',

    component: () =>
      import(
        '@/modules/dashboard/views/DriverDashboardView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['conductor'],
    },
  },

  // ───────────────────────────────────────────
  // INICIO DE SERVICIO
  // ───────────────────────────────────────────
  //
  // Flujo:
  //
  // 1. Vehículo
  // 2. Ruta
  // 3. Carga
  // 4. Combustible
  // 5. Inspección
  // 6. Incidencias
  // 7. Confirmación
  //
  // ───────────────────────────────────────────

  {
    path: '/conductor/iniciar-servicio',
    name: 'start-trip',

    component: () =>
      import(
        '@/modules/conductores/views/StartTripView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['conductor'],
    },
  },

  // ───────────────────────────────────────────
  // SERVICIO ACTIVO
  // ───────────────────────────────────────────
  //
  // Pantalla operativa del conductor.
  //
  // Incluye:
  //
  // - Vehículo
  // - Ruta
  // - Combustible
  // - Ubicación
  // - Incidencias
  // - Emergencia
  // - Audio
  // - Finalizar servicio
  //
  // ───────────────────────────────────────────

  {
    path: '/conductor/servicio-activo',
    name: 'active-trip',

    component: () =>
      import(
        '@/modules/conductores/views/ActiveTripView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['conductor'],
    },
  },

  // ═══════════════════════════════════════════
  // CONTROLADOR DE RUTAS
  // ═══════════════════════════════════════════

  // ───────────────────────────────────────────
  // DASHBOARD DEL CONTROLADOR
  // ───────────────────────────────────────────

  {
    path: '/dashboard-controlador',
    name: 'dashboard-controlador',

    component: () =>
      import(
        '@/modules/dashboard/views/ControllerDashboardView.vue'
      ),

    meta: {
      requiresAuth: true,
      roles: ['controlador_rutas'],
    },
  },

  // ═══════════════════════════════════════════
  // RUTA NO ENCONTRADA
  // ═══════════════════════════════════════════

  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

// ═════════════════════════════════════════════
// CREACIÓN DEL ROUTER
// ═════════════════════════════════════════════

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ═════════════════════════════════════════════
// PROTECCIÓN DE RUTAS
// ═════════════════════════════════════════════

router.beforeEach((to) => {

  // ───────────────────────────────────────────
  // DATOS DE SESIÓN
  // ───────────────────────────────────────────

  const token = localStorage.getItem('token')
  const user = getStoredUser()

  const requiresAuth =
    to.meta.requiresAuth === true

  // ═══════════════════════════════════════════
  // 1. RUTA PROTEGIDA SIN SESIÓN
  // ═══════════════════════════════════════════

  if (requiresAuth && !token) {
    return {
      name: 'login',

      query: {
        redirect: to.fullPath,
      },
    }
  }

  // ═══════════════════════════════════════════
  // 2. HAY TOKEN PERO NO HAY USUARIO
  // ═══════════════════════════════════════════

  if (
    requiresAuth &&
    token &&
    !user
  ) {

    console.warn(
      'Existe un token pero no existe un usuario guardado.'
    )

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    return {
      name: 'login',
    }
  }

  // ═══════════════════════════════════════════
  // 3. VALIDAR ROL
  // ═══════════════════════════════════════════

  if (
    requiresAuth &&
    !hasRolePermission(to, user)
  ) {

    console.warn(
      `Acceso denegado a "${to.name}" para el rol "${user?.role}".`
    )

    return getDashboardByRole(
      user?.role
    )
  }

  // ═══════════════════════════════════════════
  // 4. CONDUCTOR CON SERVICIO ACTIVO
  // ═══════════════════════════════════════════
  //
  // Si el conductor intenta entrar nuevamente
  // al formulario de inicio teniendo un servicio
  // activo, lo enviamos directamente al servicio.
  //
  // Esto evita iniciar dos servicios.
  //
  // ───────────────────────────────────────────

  if (
    to.name === 'start-trip' &&
    user?.role === 'conductor' &&
    hasActiveTrip()
  ) {

    console.info(
      'El conductor ya tiene un servicio activo.'
    )

    return {
      name: 'active-trip',
    }
  }

  // ═══════════════════════════════════════════
  // 5. USUARIO AUTENTICADO → LOGIN
  // ═══════════════════════════════════════════

  if (
    to.name === 'login' &&
    token &&
    user
  ) {

    return getDashboardByRole(
      user.role
    )
  }

  // ═══════════════════════════════════════════
  // 6. USUARIO AUTENTICADO → SELECCIÓN DE ROL
  // ═══════════════════════════════════════════

  if (
    to.name === 'role-selection' &&
    token &&
    user
  ) {

    return getDashboardByRole(
      user.role
    )
  }

  // ═══════════════════════════════════════════
  // 7. TODO CORRECTO
  // ═══════════════════════════════════════════

  return true
})

// ═════════════════════════════════════════════
// EXPORTAR ROUTER
// ═════════════════════════════════════════════

export default router