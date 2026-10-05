<script setup>
import AppLayout from '@/components/AppLayout.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import { useCurrency } from '../composables/useCurrency.js'
import { useUsuariosStore } from '../store/usuariosStore.js'
import { useUnidadesStore } from '@/modules/unidades/store/unidadesStore.js'
import { ROLES, ROLE_LABELS, MODULES, getRolePermissions, setRolePermissions } from '@/core/permissions.js'

const authStore = useAuthStore()
const { currency, currencyCode, currencies, setCurrency } = useCurrency()

const esAdmin = authStore.user?.role === ROLES.ADMIN

// Animación entrada
const loaded = ref(false)
onMounted(() => setTimeout(() => { loaded.value = true }, 120))

// ── Tabs ──────────────────────────────────────────────────
// "Usuarios y Perfiles" solo se ofrece al rol Administrador.
const tabs = [
  { id: 'perfil',         label: 'Perfil',          icon: 'person'           },
  { id: 'notificaciones', label: 'Notificaciones',   icon: 'notifications'    },
  { id: 'apariencia',     label: 'Apariencia',       icon: 'palette'          },
  { id: 'seguridad',      label: 'Seguridad',        icon: 'security'         },
  { id: 'sistema',        label: 'Sistema',          icon: 'tune'             },
  ...(esAdmin ? [{ id: 'usuarios', label: 'Usuarios y Perfiles', icon: 'admin_panel_settings' }] : []),
]
const activeTab = ref('perfil')

// ── Perfil ────────────────────────────────────────────────
const perfil = reactive({
  nombre:   authStore.user?.name  ?? 'Admin Global',
  email:    authStore.user?.email ?? 'admin@andina.com',
  cargo:    'Gestor de Flota',
  telefono: '+51 987 654 321',
  empresa:  'Andina Logística S.A.',
})
const perfilGuardado = ref(false)
function guardarPerfil() {
  perfilGuardado.value = true
  setTimeout(() => { perfilGuardado.value = false }, 2500)
}

const proveedor = computed(() => authStore.user?.provider ?? null)

// ── Notificaciones ────────────────────────────────────────
const notifs = reactive({
  desvio_combustible:  true,
  mantenimiento_proximo: true,
  ralenti_excesivo:    false,
  ruta_completada:     true,
  alertas_criticas:    true,
  resumen_diario:      false,
  correo_reportes:     true,
})

// ── Apariencia ────────────────────────────────────────────
const tema            = ref('light')   // 'light' | 'dark' | 'auto'
const colorblind      = ref('none')    // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
const compactSidebar  = ref(false)
const animaciones     = ref(true)

const colorblindOptions = [
  { value: 'none',          label: 'Sin filtro',     desc: 'Visión estándar' },
  { value: 'deuteranopia',  label: 'Deuteranopia',   desc: 'Dificultad con el verde' },
  { value: 'protanopia',    label: 'Protanopia',     desc: 'Dificultad con el rojo' },
  { value: 'tritanopia',    label: 'Tritanopia',     desc: 'Dificultad con el azul' },
]

// ── Seguridad ─────────────────────────────────────────────
const showCurrentPw  = ref(false)
const showNewPw      = ref(false)
const showConfirmPw  = ref(false)
const pwForm = reactive({ current: '', nuevo: '', confirmar: '' })
const pwError   = ref('')
const pwSuccess = ref(false)

function cambiarPassword() {
  pwError.value   = ''
  pwSuccess.value = false
  if (!pwForm.current || !pwForm.nuevo || !pwForm.confirmar) {
    pwError.value = 'Completa todos los campos.'; return
  }
  if (pwForm.nuevo.length < 8) {
    pwError.value = 'La nueva contraseña debe tener al menos 8 caracteres.'; return
  }
  if (pwForm.nuevo !== pwForm.confirmar) {
    pwError.value = 'Las contraseñas no coinciden.'; return
  }
  pwSuccess.value = true
  pwForm.current = pwForm.nuevo = pwForm.confirmar = ''
  setTimeout(() => { pwSuccess.value = false }, 3000)
}

const sesionesActivas = [
  { dispositivo: 'Chrome — Windows 11',         ubicacion: 'Lima, Perú',       fecha: 'Ahora',         actual: true  },
  { dispositivo: 'Mobile Safari — iPhone 15',   ubicacion: 'Lima, Perú',       fecha: 'Hace 2 horas',  actual: false },
  { dispositivo: 'Edge — Windows 10',           ubicacion: 'Arequipa, Perú',   fecha: 'Hace 3 días',   actual: false },
]

// ── Sistema ───────────────────────────────────────────────
const sistema = reactive({
  idioma:    'es',
  timezone:  'America/Lima',
  unidades:  'km',
  combustible: 'gal',
})
const sistemaGuardado = ref(false)
function guardarSistema() {
  sistemaGuardado.value = true
  setTimeout(() => { sistemaGuardado.value = false }, 2500)
}

// ── Usuarios y Perfiles (solo Administrador) ──────────────
const usuariosStore = esAdmin ? useUsuariosStore() : null
const { usuarios } = esAdmin ? storeToRefs(usuariosStore) : { usuarios: ref([]) }

const unidadesStore = esAdmin ? useUnidadesStore() : null
const { unidades } = esAdmin ? storeToRefs(unidadesStore) : { unidades: ref([]) }
const opsUnidadesAsignables = computed(() => unidades.value.map(u => ({
  value: u.placa, label: `${u.placa} — ${u.modelo}`, icon: 'local_shipping',
})))

const opsRolUsuario = [
  { value: ROLES.CONDUCTOR,  label: 'Conductor',      icon: 'badge' },
  { value: ROLES.SUPERVISOR, label: 'Supervisor',     icon: 'supervisor_account' },
  { value: ROLES.ADMIN,      label: 'Administrador',  icon: 'shield_person' },
]

function rolLabel(rol) { return ROLE_LABELS[rol] ?? rol }
function rolBadgeClass(rol) {
  return {
    [ROLES.ADMIN]:      'bg-violet-50 text-violet-700 border-violet-200',
    [ROLES.SUPERVISOR]: 'bg-blue-50 text-blue-700 border-blue-200',
    [ROLES.CONDUCTOR]:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[rol] ?? 'bg-slate-100 text-slate-600 border-slate-200'
}

// -- Matriz de permisos por rol (Conductor / Supervisor) --
// El Administrador siempre tiene acceso total y no se lista aquí.
const permisos = reactive(getRolePermissions())
const permisosGuardado = ref(false)
function tienePermiso(rol, route) {
  return permisos[rol]?.includes(route) ?? false
}
function togglePermiso(rol, route) {
  const lista = permisos[rol]
  const idx = lista.indexOf(route)
  if (idx === -1) lista.push(route)
  else lista.splice(idx, 1)
}
function guardarPermisos() {
  setRolePermissions({ [ROLES.SUPERVISOR]: permisos[ROLES.SUPERVISOR], [ROLES.CONDUCTOR]: permisos[ROLES.CONDUCTOR] })
  permisosGuardado.value = true
  setTimeout(() => { permisosGuardado.value = false }, 2500)
}

// -- CRUD de usuarios --
const modalUsuarioAbierto  = ref(false)
const modoEdicionUsuario   = ref(false)
const usuarioSeleccionado  = ref(null)
const formUsuario  = ref({ nombre: '', email: '', password: '', rol: ROLES.CONDUCTOR, unidadesAsignadas: [] })
const erroresUsuario = ref({})

function abrirNuevoUsuario() {
  modoEdicionUsuario.value = false
  formUsuario.value = { nombre: '', email: '', password: '', rol: ROLES.CONDUCTOR, unidadesAsignadas: [] }
  erroresUsuario.value = {}
  modalUsuarioAbierto.value = true
}
function abrirEditarUsuario(u) {
  modoEdicionUsuario.value = true
  usuarioSeleccionado.value = u
  formUsuario.value = { nombre: u.nombre, email: u.email, password: '', rol: u.rol, unidadesAsignadas: [...(u.unidadesAsignadas || [])] }
  erroresUsuario.value = {}
  modalUsuarioAbierto.value = true
}
function cerrarModalUsuario() {
  modalUsuarioAbierto.value = false
}
function validarUsuario() {
  const e = {}
  if (!formUsuario.value.nombre.trim()) e.nombre = 'Ingresa el nombre'
  if (!formUsuario.value.email.trim()) {
    e.email = 'Ingresa el correo'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formUsuario.value.email)) {
    e.email = 'Correo inválido'
  } else if (usuariosStore.existeEmail(formUsuario.value.email, modoEdicionUsuario.value ? usuarioSeleccionado.value?.id : null)) {
    e.email = 'Ese correo ya está en uso'
  }
  const nuevaPassword = formUsuario.value.password
  if (!modoEdicionUsuario.value && nuevaPassword.length < 6) e.password = 'Mínimo 6 caracteres'
  if (modoEdicionUsuario.value && nuevaPassword && nuevaPassword.length < 6) e.password = 'Mínimo 6 caracteres'
  erroresUsuario.value = e
  return Object.keys(e).length === 0
}
function guardarUsuario() {
  if (!validarUsuario()) return
  if (modoEdicionUsuario.value) {
    const cambios = {
      nombre: formUsuario.value.nombre.trim(),
      email:  formUsuario.value.email.trim(),
      rol:    formUsuario.value.rol,
      unidadesAsignadas: formUsuario.value.unidadesAsignadas,
    }
    if (formUsuario.value.password) cambios.password = formUsuario.value.password
    usuariosStore.actualizar(usuarioSeleccionado.value.id, cambios)
  } else {
    usuariosStore.crear({
      nombre: formUsuario.value.nombre.trim(),
      email:  formUsuario.value.email.trim(),
      password: formUsuario.value.password,
      rol: formUsuario.value.rol,
      unidadesAsignadas: formUsuario.value.unidadesAsignadas,
    })
  }
  modalUsuarioAbierto.value = false
}
function esUsuarioActual(u) {
  return u.email === authStore.user?.email
}
function eliminarUsuario(u) {
  if (esUsuarioActual(u)) { alert('No puedes eliminar tu propia cuenta.'); return }
  if (confirm(`¿Eliminar al usuario ${u.nombre}?`)) usuariosStore.eliminar(u.id)
}
function toggleActivoUsuario(u) {
  if (esUsuarioActual(u)) { alert('No puedes desactivar tu propia cuenta.'); return }
  usuariosStore.toggleActivo(u.id)
}
</script>

<template>
  <AppLayout>
    <Transition name="page-fade" appear>
      <div v-if="loaded">

        <!-- ── Header ── -->
        <header class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Cuenta y Plataforma</p>
            <h2 class="text-3xl font-black tracking-tight text-slate-800 font-headline">Configuración</h2>
            <p class="text-slate-500 font-medium mt-1 text-sm">Personaliza tu cuenta, notificaciones y preferencias del sistema.</p>
          </div>
          <!-- Proveedor badge -->
          <div v-if="proveedor" class="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border"
            :class="proveedor === 'google' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-sky-50 border-sky-200 text-sky-700'">
            <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">
              {{ proveedor === 'google' ? 'g_translate' : 'cloud' }}
            </span>
            <span class="text-xs font-black uppercase tracking-wide">
              {{ proveedor === 'google' ? 'Sesión Google' : 'Sesión Microsoft' }}
            </span>
          </div>
        </header>

        <!-- ── Layout: tabs izq + contenido der ── -->
        <div class="flex flex-col lg:flex-row gap-6">

          <!-- Tabs verticales -->
          <nav class="lg:w-52 flex-shrink-0" aria-label="Secciones de configuración">
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all border-b border-slate-50 last:border-b-0"
                :class="activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'"
                :style="activeTab === tab.id ? 'background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)' : ''"
              >
                <span
                  class="material-symbols-outlined text-[20px]"
                  :style="activeTab === tab.id ? 'font-variation-settings:\'FILL\' 1' : ''"
                >{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </div>
          </nav>

          <!-- Contenido de la sección activa -->
          <div class="flex-1 min-w-0">

            <!-- ══ PERFIL ══ -->
            <section v-if="activeTab === 'perfil'" class="space-y-5">

              <!-- Avatar + info -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">person</span>
                  <h3 class="font-black text-white text-sm">Información Personal</h3>
                </div>
                <div class="p-6">
                  <!-- Avatar -->
                  <div class="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black overflow-hidden flex-shrink-0"
                      style="background:linear-gradient(135deg,#4f6073,#3a4a5c)">
                      <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="perfil.nombre" class="w-full h-full object-cover" />
                      <span v-else>{{ perfil.nombre.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="font-black text-slate-800">{{ perfil.nombre }}</p>
                      <p class="text-sm text-slate-500">{{ perfil.cargo }}</p>
                      <div class="flex items-center gap-2 mt-2">
                        <span v-if="proveedor" class="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md"
                          :class="proveedor === 'google' ? 'bg-blue-100 text-blue-600' : 'bg-sky-100 text-sky-600'">
                          {{ proveedor }}
                        </span>
                        <span class="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600">Activo</span>
                      </div>
                    </div>
                    <button
                      class="ml-auto text-xs font-bold px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-[#4f6073] hover:text-[#4f6073] transition-all"
                      :disabled="!!proveedor"
                      :title="proveedor ? 'Gestionado por ' + proveedor : ''"
                    >
                      Cambiar foto
                    </button>
                  </div>

                  <!-- Campos -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre completo</label>
                      <input v-model="perfil.nombre" type="text"
                        class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all"
                        :disabled="!!proveedor" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo electrónico</label>
                      <input v-model="perfil.email" type="email"
                        class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all"
                        :disabled="!!proveedor" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo</label>
                      <input v-model="perfil.cargo" type="text"
                        class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</label>
                      <input v-model="perfil.telefono" type="tel"
                        class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all" />
                    </div>
                    <div class="sm:col-span-2 space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</label>
                      <input v-model="perfil.empresa" type="text"
                        class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all" />
                    </div>
                  </div>

                  <div v-if="proveedor" class="mt-4 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <span class="material-symbols-outlined text-amber-500 text-lg flex-shrink-0">info</span>
                    <p class="text-xs text-amber-700 font-semibold">
                      Nombre y correo son gestionados por tu cuenta de <span class="uppercase font-black">{{ proveedor }}</span>.
                      Edítalos desde tu proveedor de identidad.
                    </p>
                  </div>

                  <div class="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                    <button @click="guardarPerfil"
                      class="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                      style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                      <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">save</span>
                      Guardar cambios
                    </button>
                    <Transition name="fade-msg">
                      <span v-if="perfilGuardado" class="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                        <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">check_circle</span>
                        Guardado correctamente
                      </span>
                    </Transition>
                  </div>
                </div>
              </div>
            </section>

            <!-- ══ NOTIFICACIONES ══ -->
            <section v-if="activeTab === 'notificaciones'" class="space-y-5">
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">notifications_active</span>
                  <h3 class="font-black text-white text-sm">Alertas y Avisos</h3>
                </div>
                <div class="divide-y divide-slate-50">
                  <label v-for="(item, key) in [
                    { key:'desvio_combustible',    label:'Desvío de combustible',   desc:'Parada no autorizada detectada en una unidad.',         icon:'local_gas_station', color:'#dc2626' },
                    { key:'mantenimiento_proximo', label:'Mantenimiento próximo',    desc:'Aviso cuando una unidad está cerca del intervalo de servicio.', icon:'build',            color:'#d97706' },
                    { key:'ralenti_excesivo',      label:'Ralentí excesivo',         desc:'Conductor con motor encendido sin movimiento por más de 15 min.', icon:'timer',           color:'#d97706' },
                    { key:'ruta_completada',       label:'Ruta completada',          desc:'Confirmación cuando una unidad finaliza su entrega.',    icon:'check_circle',     color:'#0891b2' },
                    { key:'alertas_criticas',      label:'Alertas críticas',         desc:'Notificación inmediata ante incidentes de alta prioridad.', icon:'warning',         color:'#dc2626' },
                    { key:'resumen_diario',        label:'Resumen diario',           desc:'Email con el reporte operativo al cierre del día.',      icon:'summarize',        color:'#059669' },
                    { key:'correo_reportes',       label:'Envío de reportes',        desc:'Recibir por correo los reportes exportados.',            icon:'mail',             color:'#4f6073' },
                  ]" :key="item.key"
                    class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      :style="`background:${item.color}18`">
                      <span class="material-symbols-outlined text-[18px]" :style="`color:${item.color};font-variation-settings:'FILL' 1`">{{ item.icon }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800">{{ item.label }}</p>
                      <p class="text-xs text-slate-400 mt-0.5 leading-snug">{{ item.desc }}</p>
                    </div>
                    <!-- Toggle -->
                    <button
                      type="button"
                      role="switch"
                      :aria-checked="notifs[item.key]"
                      :aria-label="item.label"
                      @click.prevent="notifs[item.key] = !notifs[item.key]"
                      class="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#4f6073]/40"
                      :style="notifs[item.key] ? 'background:linear-gradient(135deg,#4f6073,#3a4a5c)' : 'background:#e2e8f0'"
                    >
                      <span
                        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                        :class="notifs[item.key] ? 'translate-x-5' : 'translate-x-0'"
                      ></span>
                    </button>
                  </label>
                </div>
              </div>
            </section>

            <!-- ══ APARIENCIA ══ -->
            <section v-if="activeTab === 'apariencia'" class="space-y-5">

              <!-- Tema -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">palette</span>
                  <h3 class="font-black text-white text-sm">Tema de la Interfaz</h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-3 gap-3">
                    <button
                      v-for="opt in [
                        { val:'light', label:'Claro',     icon:'light_mode',  bg:'#f8fafc', border:'#e2e8f0' },
                        { val:'dark',  label:'Oscuro',    icon:'dark_mode',   bg:'#1e293b', border:'#334155' },
                        { val:'auto',  label:'Automático',icon:'brightness_auto', bg:'linear-gradient(135deg,#f8fafc 50%,#1e293b 50%)', border:'#94a3b8' },
                      ]"
                      :key="opt.val"
                      @click="tema = opt.val"
                      class="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                      :class="tema === opt.val ? 'border-[#4f6073] shadow-md' : 'border-slate-200 hover:border-slate-300'"
                    >
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="`background:${opt.bg}`">
                        <span class="material-symbols-outlined text-xl" :style="`color:${tema === opt.val ? '#4f6073' : '#94a3b8'};font-variation-settings:'FILL' 1`">{{ opt.icon }}</span>
                      </div>
                      <span class="text-xs font-bold text-slate-600">{{ opt.label }}</span>
                      <span v-if="tema === opt.val"
                        class="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style="background:#4f6073">
                        <span class="material-symbols-outlined text-white text-[10px]" style="font-variation-settings:'FILL' 1">check</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Accesibilidad: daltonismo -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">visibility</span>
                  <h3 class="font-black text-white text-sm">Accesibilidad Visual</h3>
                </div>
                <div class="p-6">
                  <p class="text-xs text-slate-500 font-medium mb-4">Filtros de color para distintos tipos de daltonismo.</p>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      v-for="opt in colorblindOptions"
                      :key="opt.value"
                      @click="colorblind = opt.value"
                      class="flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all"
                      :class="colorblind === opt.value ? 'border-[#4f6073] bg-[#4f6073]/5' : 'border-slate-200 hover:border-slate-300'"
                    >
                      <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        :style="colorblind === opt.value ? 'background:#4f6073' : 'background:#e2e8f0'">
                        <span v-if="colorblind === opt.value" class="material-symbols-outlined text-white text-[12px]" style="font-variation-settings:'FILL' 1">check</span>
                      </div>
                      <div>
                        <p class="text-xs font-black text-slate-700">{{ opt.label }}</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">{{ opt.desc }}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Opciones extra -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <h3 class="font-black text-white text-sm">Opciones de Interfaz</h3>
                </div>
                <div class="divide-y divide-slate-50">
                  <label class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span class="material-symbols-outlined text-slate-500 text-[18px]">view_sidebar</span>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-bold text-slate-800">Barra lateral compacta</p>
                      <p class="text-xs text-slate-400">Muestra solo íconos en el menú lateral.</p>
                    </div>
                    <button type="button" role="switch" :aria-checked="compactSidebar"
                      @click.prevent="compactSidebar = !compactSidebar"
                      class="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                      :style="compactSidebar ? 'background:linear-gradient(135deg,#4f6073,#3a4a5c)' : 'background:#e2e8f0'">
                      <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                        :class="compactSidebar ? 'translate-x-5' : 'translate-x-0'"></span>
                    </button>
                  </label>
                  <label class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span class="material-symbols-outlined text-slate-500 text-[18px]">animation</span>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-bold text-slate-800">Animaciones de interfaz</p>
                      <p class="text-xs text-slate-400">Transiciones y efectos visuales en la UI.</p>
                    </div>
                    <button type="button" role="switch" :aria-checked="animaciones"
                      @click.prevent="animaciones = !animaciones"
                      class="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                      :style="animaciones ? 'background:linear-gradient(135deg,#4f6073,#3a4a5c)' : 'background:#e2e8f0'">
                      <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                        :class="animaciones ? 'translate-x-5' : 'translate-x-0'"></span>
                    </button>
                  </label>
                </div>
              </div>
            </section>

            <!-- ══ SEGURIDAD ══ -->
            <section v-if="activeTab === 'seguridad'" class="space-y-5">

              <!-- Cambiar contraseña -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">lock</span>
                  <h3 class="font-black text-white text-sm">Cambiar Contraseña</h3>
                </div>
                <div class="p-6">

                  <div v-if="proveedor" class="flex items-start gap-2.5 p-3.5 bg-sky-50 border border-sky-200 rounded-xl mb-5">
                    <span class="material-symbols-outlined text-sky-500 text-lg flex-shrink-0">info</span>
                    <p class="text-xs text-sky-700 font-semibold">
                      Tu cuenta usa autenticación de <span class="uppercase font-black">{{ proveedor }}</span>.
                      La contraseña se gestiona desde tu proveedor de identidad.
                    </p>
                  </div>

                  <div class="space-y-4" :class="{ 'opacity-40 pointer-events-none': !!proveedor }">
                    <!-- Contraseña actual -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña actual</label>
                      <div class="relative">
                        <input v-model="pwForm.current" :type="showCurrentPw ? 'text' : 'password'"
                          class="w-full h-11 px-4 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all"
                          placeholder="••••••••" />
                        <button type="button" @click="showCurrentPw = !showCurrentPw" class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600">
                          <span class="material-symbols-outlined text-xl">{{ showCurrentPw ? 'visibility_off' : 'visibility' }}</span>
                        </button>
                      </div>
                    </div>
                    <!-- Nueva contraseña -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nueva contraseña</label>
                      <div class="relative">
                        <input v-model="pwForm.nuevo" :type="showNewPw ? 'text' : 'password'"
                          class="w-full h-11 px-4 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all"
                          placeholder="Mínimo 8 caracteres" />
                        <button type="button" @click="showNewPw = !showNewPw" class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600">
                          <span class="material-symbols-outlined text-xl">{{ showNewPw ? 'visibility_off' : 'visibility' }}</span>
                        </button>
                      </div>
                      <!-- Indicador fuerza -->
                      <div v-if="pwForm.nuevo" class="flex gap-1 mt-1">
                        <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors"
                          :class="pwForm.nuevo.length >= i * 3
                            ? i <= 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : i === 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                            : 'bg-slate-100'">
                        </div>
                      </div>
                    </div>
                    <!-- Confirmar -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmar nueva contraseña</label>
                      <div class="relative">
                        <input v-model="pwForm.confirmar" :type="showConfirmPw ? 'text' : 'password'"
                          class="w-full h-11 px-4 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all"
                          placeholder="Repite la nueva contraseña" />
                        <button type="button" @click="showConfirmPw = !showConfirmPw" class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600">
                          <span class="material-symbols-outlined text-xl">{{ showConfirmPw ? 'visibility_off' : 'visibility' }}</span>
                        </button>
                      </div>
                    </div>

                    <!-- Error / success -->
                    <p v-if="pwError" class="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                      <span class="material-symbols-outlined text-sm">error</span>{{ pwError }}
                    </p>
                    <Transition name="fade-msg">
                      <p v-if="pwSuccess" class="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">check_circle</span>
                        Contraseña actualizada correctamente.
                      </p>
                    </Transition>

                    <button @click="cambiarPassword"
                      class="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                      style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                      <span class="material-symbols-outlined text-base">lock_reset</span>
                      Actualizar contraseña
                    </button>
                  </div>
                </div>
              </div>

              <!-- Sesiones activas -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">devices</span>
                  <h3 class="font-black text-white text-sm">Sesiones Activas</h3>
                </div>
                <div class="divide-y divide-slate-50">
                  <div v-for="sesion in sesionesActivas" :key="sesion.dispositivo"
                    class="flex items-center gap-4 px-6 py-4">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      :class="sesion.actual ? 'bg-emerald-100' : 'bg-slate-100'">
                      <span class="material-symbols-outlined text-[18px]"
                        :class="sesion.actual ? 'text-emerald-600' : 'text-slate-400'"
                        style="font-variation-settings:'FILL' 1">
                        {{ sesion.dispositivo.includes('iPhone') || sesion.dispositivo.includes('Mobile') ? 'smartphone' : 'computer' }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800 truncate">{{ sesion.dispositivo }}</p>
                      <p class="text-xs text-slate-400">{{ sesion.ubicacion }} · {{ sesion.fecha }}</p>
                    </div>
                    <span v-if="sesion.actual"
                      class="text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md bg-emerald-100 text-emerald-600 flex-shrink-0">
                      Esta sesión
                    </span>
                    <button v-else
                      class="text-[11px] font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- ══ SISTEMA ══ -->
            <section v-if="activeTab === 'sistema'" class="space-y-5">

              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">tune</span>
                  <h3 class="font-black text-white text-sm">Preferencias del Sistema</h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Idioma -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Idioma</label>
                      <select v-model="sistema.idioma"
                        class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all">
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                      </select>
                    </div>
                    <!-- Zona horaria -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Zona horaria</label>
                      <select v-model="sistema.timezone"
                        class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all">
                        <option value="America/Lima">América/Lima (UTC-5)</option>
                        <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                        <option value="America/Santiago">América/Santiago (UTC-4)</option>
                        <option value="America/Buenos_Aires">América/Buenos Aires (UTC-3)</option>
                        <option value="America/Mexico_City">América/México (UTC-6)</option>
                      </select>
                    </div>
                    <!-- Unidades de distancia -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidad de distancia</label>
                      <div class="flex rounded-xl overflow-hidden border border-slate-200">
                        <button v-for="u in [{v:'km',l:'Kilómetros (km)'},{v:'mi',l:'Millas (mi)'}]" :key="u.v"
                          @click="sistema.unidades = u.v"
                          class="flex-1 py-2.5 text-sm font-bold transition-colors"
                          :class="sistema.unidades === u.v ? 'text-white' : 'text-slate-500 hover:bg-slate-50'"
                          :style="sistema.unidades === u.v ? 'background:linear-gradient(135deg,#4f6073,#3a4a5c)' : ''">
                          {{ u.l }}
                        </button>
                      </div>
                    </div>
                    <!-- Unidad de combustible -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidad de combustible</label>
                      <div class="flex rounded-xl overflow-hidden border border-slate-200">
                        <button v-for="u in [{v:'gal',l:'Galones (gal)'},{v:'lt',l:'Litros (L)'}]" :key="u.v"
                          @click="sistema.combustible = u.v"
                          class="flex-1 py-2.5 text-sm font-bold transition-colors"
                          :class="sistema.combustible === u.v ? 'text-white' : 'text-slate-500 hover:bg-slate-50'"
                          :style="sistema.combustible === u.v ? 'background:linear-gradient(135deg,#4f6073,#3a4a5c)' : ''">
                          {{ u.l }}
                        </button>
                      </div>
                    </div>
                    <!-- Moneda -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Moneda</label>
                      <div class="flex rounded-xl overflow-hidden border border-slate-200">
                        <button v-for="c in currencies" :key="c.code"
                          @click="setCurrency(c.code)"
                          type="button"
                          class="flex-1 py-2.5 text-sm font-bold transition-colors"
                          :class="currencyCode === c.code ? 'text-white' : 'text-slate-500 hover:bg-slate-50'"
                          :style="currencyCode === c.code ? 'background:linear-gradient(135deg,#4f6073,#3a4a5c)' : ''">
                          {{ c.symbol }} {{ c.name }}
                        </button>
                      </div>
                      <p class="text-[11px] text-slate-400">Los montos en Consumo, Mantenimiento y Reportes se muestran en {{ currency.name }}.</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                    <button @click="guardarSistema"
                      class="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                      style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                      <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">save</span>
                      Guardar preferencias
                    </button>
                    <Transition name="fade-msg">
                      <span v-if="sistemaGuardado" class="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                        <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">check_circle</span>
                        Guardado correctamente
                      </span>
                    </Transition>
                  </div>
                </div>
              </div>

              <!-- Acerca de -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <h3 class="font-black text-white text-sm">Acerca de la Plataforma</h3>
                </div>
                <div class="p-6 grid grid-cols-2 gap-4">
                  <div v-for="item in [
                    { label:'Versión',       value:'1.0.0'          },
                    { label:'Build',         value:'2025.05'        },
                    { label:'Entorno',       value:'Demo'           },
                    { label:'Framework',     value:'Vue 3 + Vite'   },
                  ]" :key="item.label" class="space-y-0.5">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">{{ item.label }}</p>
                    <p class="text-sm font-bold text-slate-700">{{ item.value }}</p>
                  </div>
                </div>
              </div>

            </section>

            <!-- ══ USUARIOS Y PERFILES (solo Administrador) ══ -->
            <section v-if="activeTab === 'usuarios' && esAdmin" class="space-y-5">

              <!-- Matriz de permisos por rol -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">tune</span>
                  <div>
                    <h3 class="font-black text-white text-sm">Permisos por Rol</h3>
                    <p class="text-[11px] text-white/60 font-semibold">Activa o desactiva a qué módulos tiene acceso cada rol. El Administrador siempre tiene acceso total.</p>
                  </div>
                </div>
                <div class="p-6 overflow-x-auto">
                  <table class="w-full text-sm min-w-[420px]">
                    <thead>
                      <tr class="border-b border-slate-100">
                        <th class="text-left py-2 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</th>
                        <th class="text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Supervisor</th>
                        <th class="text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Conductor</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                      <tr v-for="m in MODULES" :key="m.route">
                        <td class="py-2.5 pr-4 font-semibold text-slate-700">{{ m.label }}</td>
                        <td class="py-2.5 px-4 text-center">
                          <button type="button" role="switch" :aria-checked="tienePermiso('supervisor', m.route)"
                            :aria-label="`Supervisor — ${m.label}`"
                            @click="togglePermiso('supervisor', m.route)"
                            class="w-10 h-6 rounded-full relative transition-colors mx-auto"
                            :class="tienePermiso('supervisor', m.route) ? '' : 'bg-slate-200'"
                            :style="tienePermiso('supervisor', m.route) ? 'background:#4f6073' : ''">
                            <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                              :style="tienePermiso('supervisor', m.route) ? 'left:18px' : 'left:2px'"></span>
                          </button>
                        </td>
                        <td class="py-2.5 px-4 text-center">
                          <button type="button" role="switch" :aria-checked="tienePermiso('conductor', m.route)"
                            :aria-label="`Conductor — ${m.label}`"
                            @click="togglePermiso('conductor', m.route)"
                            class="w-10 h-6 rounded-full relative transition-colors mx-auto"
                            :class="tienePermiso('conductor', m.route) ? '' : 'bg-slate-200'"
                            :style="tienePermiso('conductor', m.route) ? 'background:#4f6073' : ''">
                            <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                              :style="tienePermiso('conductor', m.route) ? 'left:18px' : 'left:2px'"></span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                    <button @click="guardarPermisos"
                      class="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                      style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                      <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">save</span>
                      Guardar permisos
                    </button>
                    <Transition name="fade-msg">
                      <span v-if="permisosGuardado" class="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                        <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">check_circle</span>
                        Guardado correctamente
                      </span>
                    </Transition>
                  </div>
                </div>
              </div>

              <!-- Lista de usuarios -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 flex items-center justify-between gap-3" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-white" style="font-variation-settings:'FILL' 1">group</span>
                    <h3 class="font-black text-white text-sm">Usuarios ({{ usuarios.length }})</h3>
                  </div>
                  <button @click="abrirNuevoUsuario"
                    class="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-colors">
                    <span class="material-symbols-outlined text-base">add</span>
                    Nuevo usuario
                  </button>
                </div>
                <div class="divide-y divide-slate-50">
                  <div v-for="u in usuarios" :key="u.id" class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
                      style="background:linear-gradient(135deg,#4f6073,#3a4a5c)">
                      {{ u.nombre.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <p class="text-sm font-bold text-slate-800 truncate">{{ u.nombre }}</p>
                        <span v-if="esUsuarioActual(u)" class="text-[9px] font-black uppercase text-slate-400">(tú)</span>
                      </div>
                      <p class="text-[11px] text-slate-400 truncate">{{ u.email }}</p>
                      <p v-if="u.unidadesAsignadas?.length" class="text-[10px] text-slate-400 mt-0.5">
                        <span class="material-symbols-outlined text-[12px] align-middle">local_shipping</span>
                        {{ u.unidadesAsignadas.join(', ') }}
                      </p>
                    </div>
                    <span class="text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wide flex-shrink-0" :class="rolBadgeClass(u.rol)">
                      {{ rolLabel(u.rol) }}
                    </span>
                    <span class="text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0"
                      :class="u.activo !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                      {{ u.activo !== false ? 'Activo' : 'Inactivo' }}
                    </span>
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <button @click="toggleActivoUsuario(u)" :aria-label="u.activo !== false ? 'Desactivar' : 'Activar'"
                        class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">{{ u.activo !== false ? 'toggle_on' : 'toggle_off' }}</span>
                      </button>
                      <button @click="abrirEditarUsuario(u)" aria-label="Editar usuario" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button @click="eliminarUsuario(u)" aria-label="Eliminar usuario" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal Nuevo/Editar usuario -->
              <Transition name="fade-msg">
                <div v-if="modalUsuarioAbierto" class="fixed inset-0 z-[60] flex items-center justify-center p-4" style="background:rgba(15,23,42,0.55)">
                  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div class="px-6 py-4 flex items-center justify-between" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                      <h3 class="font-black text-white text-sm">{{ modoEdicionUsuario ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
                      <button @click="cerrarModalUsuario" aria-label="Cerrar" class="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all">
                        <span class="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                    <form @submit.prevent="guardarUsuario" class="p-6 space-y-4" novalidate>
                      <div>
                        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5" for="us-nombre">Nombre completo *</label>
                        <input id="us-nombre" v-model="formUsuario.nombre" placeholder="Ej: Carmen López"
                          class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all" />
                        <p v-if="erroresUsuario.nombre" role="alert" class="text-xs text-red-500 font-bold mt-1">{{ erroresUsuario.nombre }}</p>
                      </div>
                      <div>
                        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5" for="us-email">Correo *</label>
                        <input id="us-email" v-model="formUsuario.email" type="email" placeholder="nombre@andina.com"
                          class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all" />
                        <p v-if="erroresUsuario.email" role="alert" class="text-xs text-red-500 font-bold mt-1">{{ erroresUsuario.email }}</p>
                      </div>
                      <div>
                        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5" for="us-password">
                          Contraseña {{ modoEdicionUsuario ? '(dejar vacío para no cambiarla)' : '*' }}
                        </label>
                        <input id="us-password" v-model="formUsuario.password" type="password" placeholder="••••••••"
                          class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#4f6073] focus:bg-white transition-all" />
                        <p v-if="erroresUsuario.password" role="alert" class="text-xs text-red-500 font-bold mt-1">{{ erroresUsuario.password }}</p>
                      </div>
                      <div>
                        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Rol *</label>
                        <div class="flex rounded-xl overflow-hidden border border-slate-200">
                          <button v-for="r in opsRolUsuario" :key="r.value" type="button"
                            @click="formUsuario.rol = r.value"
                            class="flex-1 py-2.5 text-xs font-bold transition-colors"
                            :class="formUsuario.rol === r.value ? 'text-white' : 'text-slate-500 hover:bg-slate-50'"
                            :style="formUsuario.rol === r.value ? 'background:linear-gradient(135deg,#4f6073,#3a4a5c)' : ''">
                            {{ r.label }}
                          </button>
                        </div>
                      </div>
                      <div v-if="formUsuario.rol !== 'admin'">
                        <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Camiones asignados</label>
                        <div class="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto">
                          <button v-for="op in opsUnidadesAsignables" :key="op.value" type="button"
                            @click="formUsuario.unidadesAsignadas.includes(op.value)
                              ? (formUsuario.unidadesAsignadas = formUsuario.unidadesAsignadas.filter(v => v !== op.value))
                              : formUsuario.unidadesAsignadas.push(op.value)"
                            class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors"
                            :class="formUsuario.unidadesAsignadas.includes(op.value)
                              ? 'text-white border-transparent'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'"
                            :style="formUsuario.unidadesAsignadas.includes(op.value) ? 'background:#4f6073' : ''">
                            {{ op.value }}
                          </button>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1">Elige uno o varios. Un Conductor sin unidad asignada aún puede registrar cargas de combustible.</p>
                      </div>
                      <div class="flex items-center gap-3 pt-2">
                        <button type="submit"
                          class="flex-1 flex items-center justify-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                          style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
                          <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">save</span>
                          {{ modoEdicionUsuario ? 'Guardar cambios' : 'Crear usuario' }}
                        </button>
                        <button type="button" @click="cerrarModalUsuario"
                          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Transition>

            </section>

          </div>
        </div>

      </div>
    </Transition>
  </AppLayout>
</template>

<style scoped>
.page-fade-enter-active { transition: all 0.45s cubic-bezier(0.16,1,0.3,1); }
.page-fade-enter-from   { opacity: 0; transform: translateY(12px); }

.fade-msg-enter-active { transition: all 0.3s ease; }
.fade-msg-leave-active { transition: all 0.2s ease; }
.fade-msg-enter-from, .fade-msg-leave-to { opacity: 0; transform: translateX(-6px); }
</style>
