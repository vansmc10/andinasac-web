<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/modules/auth/store/authStore.js'
import AccessibilityBar from '@/components/AccessibilityBar.vue'

// ─────────────────────────────────────────
// AUTENTICACIÓN
// ─────────────────────────────────────────

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const route = useRoute()
const router = useRouter()

// ─────────────────────────────────────────
// SIDEBAR RESPONSIVE
// ─────────────────────────────────────────

const isMobile = ref(false)
const sidebarOpen = ref(true)

function checkBreakpoint() {
  isMobile.value = window.innerWidth < 768
  sidebarOpen.value = !isMobile.value
}

watch(
  () => route.path,
  () => {
    if (isMobile.value) {
      sidebarOpen.value = false
    }
  }
)

onMounted(() => {
  checkBreakpoint()
  window.addEventListener('resize', checkBreakpoint)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkBreakpoint)
})

// ─────────────────────────────────────────
// INFORMACIÓN DEL ROL
// ─────────────────────────────────────────

const roleInfo = computed(() => {
  switch (user.value?.role) {
    case 'admin':
      return {
        name: 'Administrador',
        shortName: 'Administrador',
        color: '#4f6073',
        icon: 'admin_panel_settings',
      }

    case 'conductor':
      return {
        name: 'Chofer',
        shortName: 'Chofer',
        color: '#0891b2',
        icon: 'local_shipping',
      }

    case 'controlador_rutas':
      return {
        name: 'Controlador de rutas',
        shortName: 'Controlador',
        color: '#059669',
        icon: 'map',
      }

    default:
      return {
        name: 'Usuario',
        shortName: 'Usuario',
        color: '#4f6073',
        icon: 'person',
      }
  }
})

// ─────────────────────────────────────────
// TÍTULO DEL BUSCADOR
// ─────────────────────────────────────────

const searchPlaceholder = computed(() => {
  switch (user.value?.role) {
    case 'admin':
      return 'Buscar flota, conductor o ruta…'

    case 'conductor':
      return 'Buscar información de mi operación…'

    case 'controlador_rutas':
      return 'Buscar unidad, ruta o incidencia…'

    default:
      return 'Buscar…'
  }
})

// ─────────────────────────────────────────
// NAVEGACIÓN SEGÚN ROL
// ─────────────────────────────────────────

const navSections = computed(() => {

  // ═══════════════════════════════════════
  // ADMINISTRADOR
  // ═══════════════════════════════════════

  if (user.value?.role === 'admin') {
    return [
      {
        label: 'Operaciones',

        items: [
          {
            to: '/dashboard',
            icon: 'dashboard',
            label: 'Resumen',
            badge: null,
          },

          {
            to: '/mapa',
            icon: 'map',
            label: 'Mapa en Vivo',
            badge: '3',
            badgeRed: true,
          },

          {
            to: '/consumo',
            icon: 'local_gas_station',
            label: 'Consumo',
            badge: null,
          },

          {
            to: '/mantenimiento',
            icon: 'build',
            label: 'Mantenimiento',
            badge: '5',
            badgeRed: false,
          },

          {
            to: '/reportes',
            icon: 'assessment',
            label: 'Reportes',
            badge: null,
          },
        ],
      },

      {
        label: 'Gestión',

        items: [
          {
            to: '/unidades',
            icon: 'directions_bus',
            label: 'Unidades',
            badge: null,
          },

          {
            to: '/conductores',
            icon: 'badge',
            label: 'Conductores',
            badge: null,
          },
        ],
      },
    ]
  }

  // ═══════════════════════════════════════
  // CHOFER
  // ═══════════════════════════════════════

  if (user.value?.role === 'conductor') {
    return [
      {
        label: 'Mi operación',

        items: [
          {
            to: '/dashboard-conductor',
            icon: 'dashboard',
            label: 'Mi panel',
            badge: null,
          },

          // Estas rutas se habilitarán cuando
          // creemos las pantallas específicas.
          //
          // {
          //   to: '/conductor/vehiculo',
          //   icon: 'local_shipping',
          //   label: 'Mi vehículo',
          // },
          //
          // {
          //   to: '/conductor/ruta',
          //   icon: 'route',
          //   label: 'Mi ruta',
          // },
          //
          // {
          //   to: '/conductor/recorrido',
          //   icon: 'map',
          //   label: 'Mi recorrido',
          // },
          //
          // {
          //   to: '/conductor/incidencias',
          //   icon: 'warning',
          //   label: 'Incidencias',
          // },
          //
          // {
          //   to: '/conductor/consumo',
          //   icon: 'local_gas_station',
          //   label: 'Registrar consumo',
          // },
        ],
      },
    ]
  }

  // ═══════════════════════════════════════
  // CONTROLADOR DE RUTAS
  // ═══════════════════════════════════════

  if (user.value?.role === 'controlador_rutas') {
    return [
      {
        label: 'Control operativo',

        items: [
          {
            to: '/dashboard-controlador',
            icon: 'dashboard',
            label: 'Panel operativo',
            badge: null,
          },

          {
            to: '/mapa',
            icon: 'map',
            label: 'Mapa en Vivo',
            badge: '3',
            badgeRed: true,
          },

          {
            to: '/unidades',
            icon: 'local_shipping',
            label: 'Unidades',
            badge: null,
          },

          {
            to: '/reportes',
            icon: 'assessment',
            label: 'Reportes',
            badge: null,
          },

          // Se habilitarán cuando creemos
          // las pantallas específicas:
          //
          // {
          //   to: '/controlador/rutas',
          //   icon: 'route',
          //   label: 'Rutas',
          // },
          //
          // {
          //   to: '/controlador/alertas',
          //   icon: 'notifications_active',
          //   label: 'Alertas',
          // },
          //
          // {
          //   to: '/controlador/incidencias',
          //   icon: 'warning',
          //   label: 'Incidencias',
          // },
        ],
      },
    ]
  }

  return []
})

// ─────────────────────────────────────────
// ELEMENTO ACTIVO
// ─────────────────────────────────────────

function isActive(to) {
  return (
    route.path === to ||
    (to !== '/' && route.path.startsWith(to))
  )
}

// ─────────────────────────────────────────
// INICIALES DEL USUARIO
// ─────────────────────────────────────────

const userInitials = computed(() => {
  const name = user.value?.name ?? 'Usuario'

  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// ─────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────

async function handleLogout() {
  authStore.logout()

  await router.push({
    name: 'role-selection',
  })
}

// ─────────────────────────────────────────
// ¿MOSTRAR CONFIGURACIÓN?
// Solo administrador
// ─────────────────────────────────────────

const showConfiguration = computed(() => {
  return user.value?.role === 'admin'
})

// ─────────────────────────────────────────
// ¿MOSTRAR BOTÓN REPORTES?
// Admin + controlador
// ─────────────────────────────────────────

const showReportsButton = computed(() => {
  return (
    user.value?.role === 'admin' ||
    user.value?.role === 'controlador_rutas'
  )
})

// ─────────────────────────────────────────
// TEXTO DEL BOTÓN REPORTES
// ─────────────────────────────────────────

const reportsButtonText = computed(() => {
  if (user.value?.role === 'controlador_rutas') {
    return 'Reportes operativos'
  }

  return 'Reportes'
})
</script>

<template>
  <div class="bg-surface text-on-surface antialiased min-h-screen">

    <!-- ═════════════════════════════════════ -->
    <!-- OVERLAY MÓVIL -->
    <!-- ═════════════════════════════════════ -->

    <Transition name="overlay">

      <div
        v-if="isMobile && sidebarOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="sidebarOpen = false"
        aria-hidden="true"
      ></div>

    </Transition>

    <!-- ═════════════════════════════════════ -->
    <!-- SIDEBAR -->
    <!-- ═════════════════════════════════════ -->

    <aside
      aria-label="Navegación Principal"
      class="h-screen w-64 fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 shadow-2xl"
      :class="
        (!isMobile || sidebarOpen)
          ? 'translate-x-0'
          : '-translate-x-full'
      "
      style="background:#ffffff"
    >

      <!-- ─────────────────────────────────── -->
      <!-- BRAND -->
      <!-- ─────────────────────────────────── -->

      <div
        class="px-5 py-5 flex items-center gap-3 flex-shrink-0"
        style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)"
      >

        <div
          class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <span
            class="material-symbols-outlined text-white text-xl"
            style="font-variation-settings:'FILL' 1"
          >
            local_shipping
          </span>
        </div>

        <div class="flex-1 min-w-0">

          <p
            class="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-0.5"
          >
            Sistema de Flota
          </p>

          <h1
            class="text-base font-black text-white tracking-tight leading-none font-headline truncate"
          >
            Andina Logística
          </h1>

        </div>

        <!-- Cerrar menú móvil -->

        <button
          v-if="isMobile"
          @click="sidebarOpen = false"
          aria-label="Cerrar menú"
          class="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <span class="material-symbols-outlined text-xl">
            close
          </span>
        </button>

      </div>

      <!-- ═════════════════════════════════════ -->
      <!-- IDENTIFICACIÓN DEL ROL -->
      <!-- ═════════════════════════════════════ -->

      <div
        class="px-4 py-3 border-b border-slate-100 bg-slate-50"
      >

        <div class="flex items-center gap-3">

          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center"
            :style="`background:${roleInfo.color}15`"
          >

            <span
              class="material-symbols-outlined text-lg"
              :style="`color:${roleInfo.color}; font-variation-settings:'FILL' 1`"
            >
              {{ roleInfo.icon }}
            </span>

          </div>

          <div class="min-w-0">

            <p
              class="text-[9px] font-black uppercase tracking-widest text-slate-400"
            >
              Sesión actual
            </p>

            <p
              class="text-xs font-black truncate"
              :style="`color:${roleInfo.color}`"
            >
              {{ roleInfo.name }}
            </p>

          </div>

        </div>

      </div>

      <!-- ═════════════════════════════════════ -->
      <!-- NAVEGACIÓN -->
      <!-- ═════════════════════════════════════ -->

      <nav
        class="flex-1 overflow-y-auto py-4 px-3 space-y-1"
        aria-label="Menú principal"
      >

        <template
          v-for="section in navSections"
          :key="section.label"
        >

          <!-- Título de sección -->

          <p
            class="px-3 pt-3 pb-1.5 text-[9px] font-black uppercase tracking-[0.18em] first:pt-1"
            style="color:#94a3b8"
          >
            {{ section.label }}
          </p>

          <!-- Elementos -->

          <RouterLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative"
            :class="
              isActive(item.to)
                ? 'text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            "
            :style="
              isActive(item.to)
                ? `background:linear-gradient(135deg,${roleInfo.color} 0%,#3a4a5c 100%)`
                : ''
            "
          >

            <!-- Icono -->

            <span
              class="material-symbols-outlined text-[22px] flex-shrink-0 transition-all"
              :style="
                isActive(item.to)
                  ? 'font-variation-settings:\'FILL\' 1'
                  : 'font-variation-settings:\'FILL\' 0'
              "
            >
              {{ item.icon }}
            </span>

            <span class="flex-1 truncate">
              {{ item.label }}
            </span>

            <!-- Badge -->

            <span
              v-if="item.badge"
              class="text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none flex-shrink-0 min-w-[18px] text-center"
              :class="
                isActive(item.to)
                  ? 'bg-white/25 text-white'
                  : item.badgeRed
                    ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-700'
              "
            >
              {{ item.badge }}
            </span>

            <!-- Indicador -->

            <span
              v-if="isActive(item.to)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/60"
              aria-hidden="true"
            ></span>

          </RouterLink>

        </template>

      </nav>

      <!-- ═════════════════════════════════════ -->
      <!-- FOOTER SIDEBAR -->
      <!-- ═════════════════════════════════════ -->

      <div
        class="flex-shrink-0 border-t border-slate-100 px-3 py-3 space-y-0.5"
      >

        <!-- ─────────────────────────────────── -->
        <!-- CONFIGURACIÓN -->
        <!-- SOLO ADMIN -->
        <!-- ─────────────────────────────────── -->

        <RouterLink
          v-if="showConfiguration"
          to="/configuracion"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          :class="
            isActive('/configuracion')
              ? 'text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          "
          :style="
            isActive('/configuracion')
              ? `background:linear-gradient(135deg,${roleInfo.color} 0%,#3a4a5c 100%)`
              : ''
          "
        >

          <span
            class="material-symbols-outlined text-[22px]"
            :style="
              isActive('/configuracion')
                ? 'font-variation-settings:\'FILL\' 1'
                : ''
            "
          >
            settings
          </span>

          <span>
            Configuración
          </span>

        </RouterLink>

        <!-- ─────────────────────────────────── -->
        <!-- CERRAR SESIÓN -->
        <!-- TODOS LOS ROLES -->
        <!-- ─────────────────────────────────── -->

        <button
          type="button"
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >

          <span class="material-symbols-outlined text-[22px]">
            logout
          </span>

          <span>
            Cerrar sesión
          </span>

        </button>

        <!-- ─────────────────────────────────── -->
        <!-- USUARIO -->
        <!-- ─────────────────────────────────── -->

        <div class="mt-1 pt-3 px-1 flex items-center gap-3">

          <!-- Avatar -->

          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-black overflow-hidden"
            :style="
              `background:linear-gradient(135deg,${roleInfo.color},#3a4a5c)`
            "
          >

            <img
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="user.name"
              class="w-full h-full object-cover"
            />

            <span v-else>
              {{ userInitials }}
            </span>

          </div>

          <!-- Datos -->

          <div class="flex-1 min-w-0">

            <p
              class="text-sm font-bold text-slate-700 truncate leading-none mb-0.5"
            >
              {{ user?.name ?? 'Usuario' }}
            </p>

            <p
              class="text-[11px] text-slate-400 truncate leading-none"
            >
              {{ user?.email ?? '' }}
            </p>

          </div>

        </div>

      </div>

    </aside>

    <!-- ═════════════════════════════════════ -->
    <!-- TOP APP BAR -->
    <!-- ═════════════════════════════════════ -->

    <header
      class="fixed top-0 right-0 z-40 bg-white border-b border-slate-100 flex justify-between items-center h-16 px-4 md:px-8 transition-all duration-300 shadow-sm"
      :style="isMobile ? 'left:0' : 'left:16rem'"
    >

      <!-- Hamburger -->

      <button
        v-if="isMobile"
        @click="sidebarOpen = true"
        aria-label="Abrir menú de navegación"
        class="p-2 mr-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <span class="material-symbols-outlined">
          menu
        </span>
      </button>

      <!-- Buscador -->

      <div class="flex items-center flex-1 max-w-lg">

        <div class="relative w-full">

          <label
            class="sr-only"
            for="main-search"
          >
            Buscar en la plataforma
          </label>

          <span
            aria-hidden="true"
            class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl"
          >
            search
          </span>

          <input
            id="main-search"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all placeholder:text-slate-400"
          />

        </div>

      </div>

      <!-- Acciones -->

      <div class="flex items-center gap-2 ml-3">

        <!-- Notificaciones -->

        <button
          aria-label="Notificaciones"
          class="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >

          <span class="material-symbols-outlined text-[22px]">
            notifications
          </span>

          <span
            class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
            aria-hidden="true"
          ></span>

        </button>

        <!-- Reportes -->

        <RouterLink
          v-if="showReportsButton"
          to="/reportes"
          class="hidden sm:flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
          :style="
            `background:linear-gradient(135deg,${roleInfo.color} 0%,#3a4a5c 100%)`
          "
        >

          <span
            class="material-symbols-outlined text-base"
            style="font-variation-settings:'FILL' 1"
          >
            assessment
          </span>

          <span class="hidden md:inline">
            {{ reportsButtonText }}
          </span>

        </RouterLink>

      </div>

    </header>

    <!-- ═════════════════════════════════════ -->
    <!-- CONTENIDO PRINCIPAL -->
    <!-- ═════════════════════════════════════ -->

    <main
      id="main-content"
      class="mt-16 p-5 md:p-10 transition-all duration-300"
      :class="isMobile ? 'ml-0' : 'ml-64'"
    >

      <slot />

    </main>

    <!-- ═════════════════════════════════════ -->
    <!-- FAB -->
    <!-- ═════════════════════════════════════ -->

    <slot name="fab" />

    <!-- ═════════════════════════════════════ -->
    <!-- ACCESIBILIDAD -->
    <!-- ═════════════════════════════════════ -->

    <AccessibilityBar />

  </div>
</template>

<style>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity .25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>