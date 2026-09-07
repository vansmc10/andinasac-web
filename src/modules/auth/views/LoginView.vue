<script setup>
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore.js'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const loginSchema = toTypedSchema(
  z.object({
    email:    z.string().min(1, 'El correo es requerido').email('Ingresa un correo corporativo válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    remember: z.boolean().optional(),
  })
)

const { handleSubmit, isSubmitting } = useForm({ validationSchema: loginSchema })

const { value: email,    errorMessage: emailError    } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: remember                              } = useField('remember')

const showPassword     = ref(false)
const serverError      = ref('')
const socialLoading    = ref('')  // 'google' | 'azure' | ''

// ── Redirigir tras login ──────────────────────────────────
async function afterLogin() {
  const redirect = route.query.redirect
  await router.push(redirect && redirect !== '/' ? redirect : { name: 'dashboard' })
}

// ── Login email/password ──────────────────────────────────
const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  try {
    await authStore.login(values)
    await afterLogin()
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Credenciales inválidas. Intenta nuevamente.'
  }
})

// ── Login con Google (Google Identity Services) ───────────
async function loginWithGoogle() {
  serverError.value = ''
  socialLoading.value = 'google'

  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    // Demo mode: si no hay client_id configurado
    if (!clientId || clientId === 'TU_GOOGLE_CLIENT_ID') {
      await authStore.loginWithProvider({
        name:     'Usuario Google (Demo)',
        email:    'demo.google@andina.com',
        avatar:   null,
        provider: 'google',
      })
      await afterLogin()
      return
    }

    // Real: Google Identity Services
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services no está cargado.')
    }

    await new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response) => {
          if (response.error) { reject(new Error(response.error)); return }
          try {
            const res     = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` },
            })
            const profile = await res.json()
            await authStore.loginWithProvider({
              name:     profile.name,
              email:    profile.email,
              avatar:   profile.picture,
              provider: 'google',
              token:    response.access_token,
            })
            resolve()
          } catch (e) { reject(e) }
        },
      })
      client.requestAccessToken()
    })

    await afterLogin()
  } catch (err) {
    serverError.value = err.message || 'Error al iniciar sesión con Google.'
  } finally {
    socialLoading.value = ''
  }
}

// ── Login con Azure AD (MSAL) ─────────────────────────────
async function loginWithAzure() {
  serverError.value = ''
  socialLoading.value = 'azure'

  try {
    const clientId = import.meta.env.VITE_AZURE_CLIENT_ID
    const tenantId = import.meta.env.VITE_AZURE_TENANT_ID

    // Demo mode: si no hay client_id configurado
    if (!clientId || clientId === 'TU_AZURE_CLIENT_ID') {
      await authStore.loginWithProvider({
        name:     'Usuario Azure (Demo)',
        email:    'demo.azure@andina.com',
        avatar:   null,
        provider: 'azure',
      })
      await afterLogin()
      return
    }

    // Real: MSAL Browser
    const { PublicClientApplication } = await import('@azure/msal-browser')

    const msalInstance = new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
        redirectUri: window.location.origin,
      },
      cache: { cacheLocation: 'sessionStorage' },
    })

    await msalInstance.initialize()

    const response = await msalInstance.loginPopup({
      scopes: ['openid', 'email', 'profile', 'User.Read'],
    })

    await authStore.loginWithProvider({
      name:     response.account.name,
      email:    response.account.username,
      avatar:   null,
      provider: 'azure',
      token:    response.accessToken,
    })

    await afterLogin()
  } catch (err) {
    if (err.errorCode !== 'user_cancelled') {
      serverError.value = err.message || 'Error al iniciar sesión con Azure AD.'
    }
  } finally {
    socialLoading.value = ''
  }
}
</script>

<template>
  <div class="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row overflow-hidden">

    <!-- ===== Brand Side (Visual) ===== -->
    <div
      class="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden items-center justify-center p-12"
      style="background:linear-gradient(135deg,#2d3d4e 0%,#1a2530 100%)"
      aria-hidden="true"
    >
      <!-- Grid decorativo -->
      <div class="absolute inset-0 opacity-10"
        style="background-image:repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.5) 40px,rgba(255,255,255,0.5) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.5) 40px,rgba(255,255,255,0.5) 41px)">
      </div>
      <!-- Blobs ambient -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20" style="background:#4f6073"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15" style="background:#0891b2"></div>

      <!-- Content -->
      <div class="relative z-10 max-w-lg">
        <!-- Brand -->
        <div class="mb-10 flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl" style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px)">
            <span class="material-symbols-outlined text-white text-3xl" style="font-variation-settings:'FILL' 1">local_shipping</span>
          </div>
          <div>
            <p class="text-white/50 text-[10px] font-black uppercase tracking-widest mb-0.5">Plataforma Empresarial</p>
            <h1 class="text-white text-2xl font-black uppercase tracking-widest leading-none font-headline">Andina Logística</h1>
          </div>
        </div>

        <h2 class="font-black text-white leading-tight mb-5 tracking-tight text-4xl font-headline">
          Gestión inteligente<br>
          <span style="color:#7dd3fc">de tu flota.</span>
        </h2>

        <p class="text-white/70 text-base font-medium leading-relaxed mb-10">
          Monitorea en tiempo real, anticipa mantenimientos y optimiza rutas desde una sola plataforma.
        </p>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-2xl p-5 border" style="background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.12)">
            <p class="text-2xl font-black text-white mb-0.5">124</p>
            <p class="text-white/60 text-xs font-bold uppercase tracking-widest">Unidades activas</p>
          </div>
          <div class="rounded-2xl p-5 border" style="background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.12)">
            <p class="text-2xl font-black text-white mb-0.5">99.8%</p>
            <p class="text-white/60 text-xs font-bold uppercase tracking-widest">Disponibilidad</p>
          </div>
          <div class="rounded-2xl p-5 border" style="background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.12)">
            <p class="text-2xl font-black text-white mb-0.5">94%</p>
            <p class="text-white/60 text-xs font-bold uppercase tracking-widest">Productividad</p>
          </div>
          <div class="rounded-2xl p-5 border" style="background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.12)">
            <p class="text-2xl font-black text-white mb-0.5">3.8</p>
            <p class="text-white/60 text-xs font-bold uppercase tracking-widest">Gal/km promedio</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Login Side (Form) ===== -->
    <div class="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-white overflow-y-auto">
      <div class="flex-grow flex flex-col justify-center px-8 sm:px-14 lg:px-16 py-12">

        <!-- Mobile brand -->
        <div class="md:hidden flex items-center gap-3 mb-10">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#4f6073,#3a4a5c)">
            <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings:'FILL' 1">local_shipping</span>
          </div>
          <h1 class="text-xl font-black uppercase tracking-widest font-headline" style="color:#4f6073">Andina Logística</h1>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-3xl font-black text-slate-800 tracking-tight mb-1.5 font-headline">
            Bienvenido de nuevo
          </h2>
          <p class="text-slate-500 font-medium text-sm">
            Inicia sesión para acceder a tu consola de flota
          </p>
        </div>

        <!-- Server error -->
        <div
          v-if="serverError"
          role="alert"
          class="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
        >
          <span class="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
          <p class="text-sm font-semibold text-red-600">{{ serverError }}</p>
        </div>

        <!-- ── Social Login ── -->
        <div class="grid grid-cols-2 gap-3 mb-6">

          <!-- Google -->
          <button
            type="button"
            @click="loginWithGoogle"
            :disabled="socialLoading !== ''"
            class="flex items-center justify-center gap-2.5 h-12 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all font-bold text-sm text-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <template v-if="socialLoading === 'google'">
              <span class="material-symbols-outlined text-[#4285F4] animate-spin text-xl">progress_activity</span>
              <span>Conectando…</span>
            </template>
            <template v-else>
              <!-- Google "G" SVG logo -->
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google
            </template>
          </button>

          <!-- Azure AD -->
          <button
            type="button"
            @click="loginWithAzure"
            :disabled="socialLoading !== ''"
            class="flex items-center justify-center gap-2.5 h-12 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300/50 transition-all font-bold text-sm text-slate-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <template v-if="socialLoading === 'azure'">
              <span class="material-symbols-outlined text-[#0078D4] animate-spin text-xl">progress_activity</span>
              <span>Conectando…</span>
            </template>
            <template v-else>
              <!-- Microsoft logo SVG -->
              <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
                <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
                <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              Microsoft
            </template>
          </button>

        </div>

        <!-- Divider -->
        <div class="relative flex items-center mb-6">
          <div class="flex-1 h-px bg-slate-200"></div>
          <span class="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">o con correo</span>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" aria-labelledby="login-heading" novalidate class="space-y-5">
          <h2 id="login-heading" class="sr-only">Formulario de inicio de sesión</h2>

          <!-- Email -->
          <div class="space-y-1.5">
            <label for="email" class="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Correo Corporativo
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                required
                aria-required="true"
                :aria-invalid="!!emailError"
                :aria-describedby="emailError ? 'email-error' : undefined"
                placeholder="nombre@empresa.com"
                class="w-full h-12 px-4 pr-11 bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-[#4f6073] focus:bg-white placeholder:text-slate-400 transition-all"
                :class="{ 'border-red-400 bg-red-50': emailError }"
              />
              <span aria-hidden="true" class="material-symbols-outlined absolute right-3.5 top-3 text-slate-400 text-xl">mail</span>
            </div>
            <p v-if="emailError" id="email-error" role="alert" class="text-xs font-semibold text-red-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">error</span>{{ emailError }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center">
              <label for="password" class="block text-xs font-bold text-slate-600 uppercase tracking-wider">Contraseña</label>
              <a href="#" class="text-xs font-bold hover:underline" style="color:#4f6073">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                required
                aria-required="true"
                :aria-invalid="!!passwordError"
                :aria-describedby="passwordError ? 'password-error' : undefined"
                placeholder="••••••••"
                class="w-full h-12 px-4 pr-11 bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-[#4f6073] focus:bg-white placeholder:text-slate-400 transition-all"
                :class="{ 'border-red-400 bg-red-50': passwordError }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span class="material-symbols-outlined text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <p v-if="passwordError" id="password-error" role="alert" class="text-xs font-semibold text-red-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">error</span>{{ passwordError }}
            </p>
          </div>

          <!-- Remember -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="remember"
              type="checkbox"
              class="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer"
              style="accent-color:#4f6073"
            />
            <label for="remember" class="ml-2.5 text-sm font-semibold text-slate-600 cursor-pointer">Recordar esta terminal</label>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isSubmitting || socialLoading !== ''"
            class="w-full h-13 py-3.5 text-white text-base font-bold rounded-xl shadow-lg hover:opacity-90 focus:outline-none focus:ring-4 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%);focus-ring-color:rgba(79,96,115,0.4)"
          >
            <template v-if="isSubmitting">
              <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              Verificando…
            </template>
            <template v-else>
              Acceder a la consola
              <span aria-hidden="true" class="material-symbols-outlined text-xl">login</span>
            </template>
          </button>
        </form>

        <!-- Demo hint -->
        <div class="mt-5 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Acceso de demostración</p>
          <p class="text-xs text-slate-400 font-mono">admin@andina.com / andina123</p>
          <p class="text-[10px] text-slate-400 mt-1">También puedes usar Google o Microsoft sin credenciales reales.</p>
        </div>

        <p class="mt-6 text-center text-sm font-semibold text-slate-500">
          ¿Nuevo en la plataforma?
          <a href="#" class="font-bold hover:underline" style="color:#4f6073">Solicitar acceso</a>
        </p>
      </div>

      <!-- Footer -->
      <footer class="px-8 sm:px-14 lg:px-16 py-6 bg-slate-50 border-t border-slate-100 mt-auto">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2025 Andina Logística. Todos los derechos reservados.
          </p>
          <nav aria-label="Navegación del pie de página" class="flex gap-5">
            <a href="#" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Privacidad</a>
            <a href="#" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Términos</a>
            <a href="#" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Soporte</a>
          </nav>
        </div>
      </footer>
    </div>
  </div>
</template>
