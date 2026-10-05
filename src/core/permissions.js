// ─────────────────────────────────────────────────────────────
// Control de acceso por rol
// ─────────────────────────────────────────────────────────────
// Fuente única de verdad sobre qué puede ver cada rol. El router
// (src/router/index.js) y el menú lateral (src/components/AppLayout.vue)
// consultan estas funciones para proteger rutas y filtrar la navegación.
//
// El Administrador puede activar/desactivar módulos para Conductor y
// Supervisor desde Configuración → Usuarios y Perfiles (los cambios se
// aplican por ROL, no por persona). Esos permisos se guardan en
// localStorage bajo ROLE_PERMISSIONS_KEY; si no hay nada guardado se usan
// los valores por defecto de DEFAULT_ROLE_ROUTES.

export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  CONDUCTOR: 'conductor',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.CONDUCTOR]: 'Conductor',
}

// Módulos que se pueden activar/desactivar por rol (todo lo protegido por
// `requiresAuth` en el router, menos Configuración: esa queda reservada al
// Administrador y no se ofrece como toggle).
export const MODULES = [
  { route: 'dashboard',      label: 'Resumen' },
  { route: 'mapa',           label: 'Mapa en Vivo' },
  { route: 'consumo',        label: 'Consumo' },
  { route: 'mantenimiento',  label: 'Mantenimiento' },
  { route: 'reportes',       label: 'Reportes' },
  { route: 'unidades',       label: 'Unidades' },
  { route: 'conductores',    label: 'Conductores' },
]

// Nombres de ruta permitidos por defecto para cada rol que NO sea
// Administrador (el rol ADMIN siempre tiene acceso total y no se lista).
const DEFAULT_ROLE_ROUTES = {
  [ROLES.SUPERVISOR]: ['unidades', 'consumo', 'mantenimiento', 'reportes', 'conductores'],
  [ROLES.CONDUCTOR]:  ['unidades', 'consumo'], // Datos del vehículo + Registro de combustible
}

// Ruta a la que se envía a cada rol justo después de iniciar sesión, o
// cuando intenta entrar a una sección que no le corresponde.
const HOME_ROUTE_BY_ROLE = {
  [ROLES.ADMIN]: 'dashboard',
  [ROLES.SUPERVISOR]: 'unidades',
  [ROLES.CONDUCTOR]: 'unidades',
}
const DEFAULT_HOME_ROUTE = 'dashboard'

const ROLE_PERMISSIONS_KEY = 'app.rolePermissions'

function readStoredPermissions() {
  try {
    const raw = localStorage.getItem(ROLE_PERMISSIONS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/** Mapa efectivo rol → rutas permitidas: lo guardado por el Admin, o el default. */
export function getRolePermissions() {
  const stored = readStoredPermissions()
  return {
    [ROLES.SUPERVISOR]: stored?.[ROLES.SUPERVISOR] ?? [...DEFAULT_ROLE_ROUTES[ROLES.SUPERVISOR]],
    [ROLES.CONDUCTOR]:  stored?.[ROLES.CONDUCTOR]  ?? [...DEFAULT_ROLE_ROUTES[ROLES.CONDUCTOR]],
  }
}

/** Guarda el mapa rol → rutas permitidas que edita el Administrador. */
export function setRolePermissions(map) {
  localStorage.setItem(ROLE_PERMISSIONS_KEY, JSON.stringify(map))
}

/**
 * ¿Puede este rol acceder a la ruta `routeName`?
 * Sin rol reconocido → sin acceso (el guard de router lo manda a login).
 */
export function canAccessRoute(role, routeName) {
  if (!routeName) return true
  if (role === ROLES.ADMIN) return true
  const allowed = getRolePermissions()[role]
  return !!allowed && allowed.includes(routeName)
}

/** Ruta "home" a la que redirigir a un usuario según su rol. */
export function homeRouteFor(role) {
  return HOME_ROUTE_BY_ROLE[role] || DEFAULT_HOME_ROUTE
}

/** Lee el rol del usuario guardado en localStorage (sesión actual). */
export function getStoredRole() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw)?.role ?? null : null
  } catch {
    return null
  }
}
