<script setup>
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ═════════════════════════════════════════════
// ROL SELECCIONADO
// ═════════════════════════════════════════════

const selectedRole = computed(() => {
  const role = route.query.role

  if (
    role === 'admin' ||
    role === 'conductor' ||
    role === 'controlador_rutas'
  ) {
    return role
  }

  return 'admin'
})

// ═════════════════════════════════════════════
// INFORMACIÓN DEL ROL
// ═════════════════════════════════════════════

const roleInfo = computed(() => {
  switch (selectedRole.value) {
    case 'conductor':
      return {
        label: 'Chofer',
        title: 'Acceso del chofer',
        description:
          'Ingresa para gestionar tu vehículo, ruta y servicio.',
        icon: 'local_shipping',
        color: '#0891b2',
        email: 'chofer@andina.com',
        password: 'chofer123',
      }

    case 'controlador_rutas':
      return {
        label: 'Controlador de rutas',
        title: 'Acceso del controlador',
        description:
          'Ingresa para supervisar rutas, unidades e incidencias.',
        icon: 'map',
        color: '#059669',
        email: 'controlador@andina.com',
        password: 'control123',
      }

    case 'admin':
    default:
      return {
        label: 'Administrador',
        title: 'Acceso del administrador',
        description:
          'Ingresa para administrar la plataforma de flota.',
        icon: 'admin_panel_settings',
        color: '#4f6073',
        email: 'admin@andina.com',
        password: 'andina123',
      }
  }
})

// ═════════════════════════════════════════════
// VALIDACIÓN
// ═════════════════════════════════════════════

const loginSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, 'El correo es requerido')
      .email('Ingresa un correo válido'),

    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),

    remember: z.boolean().optional(),
  })
)

const {
  handleSubmit,
  isSubmitting,
} = useForm({
  validationSchema: loginSchema,
})

const {
  value: email,
  errorMessage: emailError,
} = useField('email')

const {
  value: password,
  errorMessage: passwordError,
} = useField('password')

const {
  value: remember,
} = useField('remember')

const showPassword = ref(false)
const serverError = ref('')
const socialLoading = ref('')

// ═════════════════════════════════════════════
// VOLVER A SELECCIÓN DE ROL
// ═════════════════════════════════════════════

function volverSeleccionRol() {
  router.push({
    name: 'role-selection',
  })
}

// ═════════════════════════════════════════════
// DASHBOARD SEGÚN ROL
// ═════════════════════════════════════════════

async function irAlDashboard() {
  const role = authStore.user?.role

  switch (role) {
    case 'admin':
      await router.push({
        name: 'dashboard',
      })
      break

    case 'conductor':
      await router.push({
        name: 'dashboard-conductor',
      })
      break

    case 'controlador_rutas':
      await router.push({
        name: 'dashboard-controlador',
      })
      break

    default:
      await router.push({
        name: 'role-selection',
      })
  }
}

// ═════════════════════════════════════════════
// LOGIN CON CORREO
// ═════════════════════════════════════════════

const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''

  try {
    await authStore.login({
      email: values.email,
      password: values.password,
      remember: values.remember,
      role: selectedRole.value,
    })

    await irAlDashboard()

  } catch (error) {
    console.error('Error de inicio de sesión:', error)

    serverError.value =
      error?.message ||
      error?.response?.data?.message ||
      'Las credenciales no son válidas para este rol.'
  }
})

// ═════════════════════════════════════════════
// GOOGLE - DEMOSTRACIÓN
// ═════════════════════════════════════════════

async function loginWithGoogle() {
  serverError.value = ''
  socialLoading.value = 'google'

  try {
    await authStore.loginWithProvider({
      name: `Usuario Google - ${roleInfo.value.label}`,
      email: `google.${selectedRole.value}@andina.com`,
      avatar: null,
      provider: 'google',
      role: selectedRole.value,
    })

    await irAlDashboard()

  } catch (error) {
    console.error(error)

    serverError.value =
      error?.message ||
      'No se pudo iniciar sesión con Google.'

  } finally {
    socialLoading.value = ''
  }
}

// ═════════════════════════════════════════════
// MICROSOFT - DEMOSTRACIÓN
// ═════════════════════════════════════════════

async function loginWithAzure() {
  serverError.value = ''
  socialLoading.value = 'azure'

  try {
    await authStore.loginWithProvider({
      name: `Usuario Microsoft - ${roleInfo.value.label}`,
      email: `microsoft.${selectedRole.value}@andina.com`,
      avatar: null,
      provider: 'azure',
      role: selectedRole.value,
    })

    await irAlDashboard()

  } catch (error) {
    console.error(error)

    serverError.value =
      error?.message ||
      'No se pudo iniciar sesión con Microsoft.'

  } finally {
    socialLoading.value = ''
  }
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-100"
  >

    <!-- ═══════════════════════════════════════ -->
    <!-- PANEL IZQUIERDO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="hidden md:flex md:w-1/2 lg:w-3/5 relative items-center justify-center p-12 overflow-hidden"
      style="background:linear-gradient(135deg,#2d3d4e 0%,#1a2530 100%)"
    >

      <!-- Fondo -->

      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image:
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            rgba(255,255,255,0.5) 40px,
            rgba(255,255,255,0.5) 41px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(255,255,255,0.5) 40px,
            rgba(255,255,255,0.5) 41px
          );
        "
      ></div>

      <div
        class="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
        style="background:#4f6073"
      ></div>

      <div
        class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15"
        style="background:#0891b2"
      ></div>

      <!-- Contenido -->

      <div class="relative z-10 max-w-lg w-full">

        <!-- Marca -->

        <div class="flex items-center gap-4 mb-10">

          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center"
            style="background:rgba(255,255,255,0.15)"
          >
            <span
              class="material-symbols-outlined text-white text-3xl"
            >
              local_shipping
            </span>
          </div>

          <div>
            <p
              class="text-white/50 text-[10px] font-black uppercase tracking-widest"
            >
              Plataforma Empresarial
            </p>

            <h1
              class="text-white text-2xl font-black uppercase tracking-widest"
            >
              Andina Logística
            </h1>
          </div>

        </div>

        <!-- Título -->

        <h2
          class="font-black text-white leading-tight mb-5 tracking-tight text-4xl"
        >
          Gestión inteligente
          <br>

          <span style="color:#7dd3fc">
            de tu flota.
          </span>
        </h2>

        <p
          class="text-white/70 text-base font-medium leading-relaxed mb-10"
        >
          Monitorea en tiempo real, anticipa mantenimientos y
          optimiza rutas desde una sola plataforma.
        </p>

        <!-- Estadísticas -->

        <div class="grid grid-cols-2 gap-4">

          <div
            class="rounded-2xl p-5 border"
            style="
              background:rgba(255,255,255,0.07);
              border-color:rgba(255,255,255,0.12)
            "
          >
            <p class="text-2xl font-black text-white">
              124
            </p>

            <p
              class="text-white/60 text-xs font-bold uppercase tracking-widest"
            >
              Unidades activas
            </p>
          </div>

          <div
            class="rounded-2xl p-5 border"
            style="
              background:rgba(255,255,255,0.07);
              border-color:rgba(255,255,255,0.12)
            "
          >
            <p class="text-2xl font-black text-white">
              99.8%
            </p>

            <p
              class="text-white/60 text-xs font-bold uppercase tracking-widest"
            >
              Disponibilidad
            </p>
          </div>

          <div
            class="rounded-2xl p-5 border"
            style="
              background:rgba(255,255,255,0.07);
              border-color:rgba(255,255,255,0.12)
            "
          >
            <p class="text-2xl font-black text-white">
              94%
            </p>

            <p
              class="text-white/60 text-xs font-bold uppercase tracking-widest"
            >
              Productividad
            </p>
          </div>

          <div
            class="rounded-2xl p-5 border"
            style="
              background:rgba(255,255,255,0.07);
              border-color:rgba(255,255,255,0.12)
            "
          >
            <p class="text-2xl font-black text-white">
              3.8
            </p>

            <p
              class="text-white/60 text-xs font-bold uppercase tracking-widest"
            >
              Gal/km promedio
            </p>
          </div>

        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- PANEL DERECHO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-white overflow-y-auto"
    >

      <div
        class="flex-grow flex flex-col justify-center px-8 sm:px-14 lg:px-16 py-10"
      >

        <!-- Marca móvil -->

        <div class="md:hidden flex items-center gap-3 mb-8">

          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            style="background:#4f6073"
          >
            <span
              class="material-symbols-outlined text-white"
            >
              local_shipping
            </span>
          </div>

          <h1
            class="text-xl font-black uppercase tracking-widest"
            style="color:#4f6073"
          >
            Andina Logística
          </h1>

        </div>

        <!-- ═══════════════════════════════════ -->
        <!-- ROL -->
        <!-- ═══════════════════════════════════ -->

        <div
          class="inline-flex self-start items-center gap-2 px-3 py-2 rounded-xl mb-4"
          :style="{
            backgroundColor: `${roleInfo.color}15`,
            color: roleInfo.color
          }"
        >

          <span class="material-symbols-outlined text-lg">
            {{ roleInfo.icon }}
          </span>

          <span
            class="text-xs font-black uppercase tracking-wider"
          >
            {{ roleInfo.label }}
          </span>

        </div>

        <!-- TÍTULO -->

        <div class="mb-7">

          <h2
            class="text-3xl font-black text-slate-800 tracking-tight mb-2"
          >
            {{ roleInfo.title }}
          </h2>

          <p
            class="text-slate-500 font-medium text-sm"
          >
            {{ roleInfo.description }}
          </p>

        </div>

        <!-- ═══════════════════════════════════ -->
        <!-- ERROR -->
        <!-- ═══════════════════════════════════ -->

        <div
          v-if="serverError"
          class="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3"
          role="alert"
        >

          <span
            class="material-symbols-outlined text-red-500"
          >
            error
          </span>

          <p class="text-sm font-semibold text-red-600">
            {{ serverError }}
          </p>

        </div>

        <!-- ═══════════════════════════════════ -->
        <!-- GOOGLE / MICROSOFT -->
        <!-- ═══════════════════════════════════ -->

        <div class="grid grid-cols-2 gap-3 mb-6">

          <button
            type="button"
            @click="loginWithGoogle"
            :disabled="socialLoading !== ''"
            class="flex items-center justify-center gap-2 h-12 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-sm text-slate-700 disabled:opacity-60"
          >

            <span
              v-if="socialLoading === 'google'"
              class="material-symbols-outlined animate-spin"
            >
              progress_activity
            </span>

            <span v-else class="font-black text-lg">
              G
            </span>

            <span>
              Google
            </span>

          </button>

          <button
            type="button"
            @click="loginWithAzure"
            :disabled="socialLoading !== ''"
            class="flex items-center justify-center gap-2 h-12 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-sm text-slate-700 disabled:opacity-60"
          >

            <span
              v-if="socialLoading === 'azure'"
              class="material-symbols-outlined animate-spin"
            >
              progress_activity
            </span>

            <span
              v-else
              class="w-4 h-4 grid grid-cols-2 gap-[2px]"
            >
              <span style="background:#F25022"></span>
              <span style="background:#7FBA00"></span>
              <span style="background:#00A4EF"></span>
              <span style="background:#FFB900"></span>
            </span>

            <span>
              Microsoft
            </span>

          </button>

        </div>

        <!-- DIVISOR -->

        <div class="flex items-center mb-6">

          <div class="flex-1 h-px bg-slate-200"></div>

          <span
            class="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
          >
            o con correo
          </span>

          <div class="flex-1 h-px bg-slate-200"></div>

        </div>

        <!-- ═══════════════════════════════════ -->
        <!-- FORMULARIO -->
        <!-- ═══════════════════════════════════ -->

        <form
          @submit.prevent="onSubmit"
          class="space-y-5"
          novalidate
        >

          <!-- CORREO -->

          <div>

            <label
              for="email"
              class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
            >
              Correo corporativo
            </label>

            <div class="relative">

              <input
                id="email"
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="nombre@empresa.com"
                class="w-full h-12 px-4 pr-11 bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#4f6073] focus:bg-white transition"
                :class="{
                  'border-red-400 bg-red-50':
                    emailError
                }"
              />

              <span
                class="material-symbols-outlined absolute right-3.5 top-3 text-slate-400"
              >
                mail
              </span>

            </div>

            <p
              v-if="emailError"
              class="text-xs font-semibold text-red-500 mt-1"
            >
              {{ emailError }}
            </p>

          </div>

          <!-- CONTRASEÑA -->

          <div>

            <label
              for="password"
              class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
            >
              Contraseña
            </label>

            <div class="relative">

              <input
                id="password"
                v-model="password"
                :type="
                  showPassword
                    ? 'text'
                    : 'password'
                "
                name="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full h-12 px-4 pr-12 bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#4f6073] focus:bg-white transition"
                :class="{
                  'border-red-400 bg-red-50':
                    passwordError
                }"
              />

              <button
                type="button"
                @click="
                  showPassword = !showPassword
                "
                class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                :aria-label="
                  showPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                "
              >

                <span class="material-symbols-outlined">
                  {{
                    showPassword
                      ? 'visibility_off'
                      : 'visibility'
                  }}
                </span>

              </button>

            </div>

            <p
              v-if="passwordError"
              class="text-xs font-semibold text-red-500 mt-1"
            >
              {{ passwordError }}
            </p>

          </div>

          <!-- RECORDAR -->

          <div class="flex items-center">

            <input
              id="remember"
              v-model="remember"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-300"
              style="accent-color:#4f6073"
            />

            <label
              for="remember"
              class="ml-2 text-sm font-semibold text-slate-600"
            >
              Recordar esta terminal
            </label>

          </div>

          <!-- BOTÓN -->

          <button
            type="submit"
            :disabled="
              isSubmitting ||
              socialLoading !== ''
            "
            class="w-full h-13 py-3.5 text-white text-base font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)"
          >

            <span
              v-if="isSubmitting"
              class="material-symbols-outlined animate-spin"
            >
              progress_activity
            </span>

            <span v-if="isSubmitting">
              Verificando...
            </span>

            <template v-else>

              <span>
                Acceder como {{ roleInfo.label }}
              </span>

              <span class="material-symbols-outlined">
                login
              </span>

            </template>

          </button>

        </form>

        <!-- ═══════════════════════════════════ -->
        <!-- DEMOSTRACIÓN -->
        <!-- ═══════════════════════════════════ -->

        <div
          class="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50"
        >

          <p
            class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Acceso de demostración
          </p>

          <p class="text-xs text-slate-500">
            <strong>Correo:</strong>
            <span class="font-mono">
              {{ roleInfo.email }}
            </span>
          </p>

          <p class="text-xs text-slate-500 mt-1">
            <strong>Contraseña:</strong>
            <span class="font-mono">
              {{ roleInfo.password }}
            </span>
          </p>

        </div>

        <!-- ═══════════════════════════════════ -->
        <!-- CAMBIAR ROL -->
        <!-- ═══════════════════════════════════ -->

        <button
          type="button"
          @click="volverSeleccionRol"
          class="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center gap-2"
        >

          <span class="material-symbols-outlined text-lg">
            swap_horiz
          </span>

          Cambiar tipo de usuario

        </button>

        <!-- SOLICITAR ACCESO -->

        <p
          class="mt-6 text-center text-sm font-semibold text-slate-500"
        >
          ¿Nuevo en la plataforma?

          <span
            class="font-bold"
            style="color:#4f6073"
          >
            Solicitar acceso
          </span>
        </p>

      </div>

      <!-- FOOTER -->

      <footer
        class="px-8 sm:px-14 lg:px-16 py-5 bg-slate-50 border-t border-slate-100"
      >

        <p
          class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center"
        >
          © 2025 Andina Logística. Todos los derechos reservados.
        </p>

      </footer>

    </div>

  </div>
</template>