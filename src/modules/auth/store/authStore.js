import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService.js'
import { useUsuariosStore } from '@/modules/configuracion/store/usuariosStore.js'

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(readStoredUser())
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  // Guarda token + usuario (incluye el rol) tanto en el store como en
  // localStorage, para que el guard del router pueda leer el rol de forma
  // síncrona incluso después de recargar la página.
  function persistSession(newToken, newUser) {
    token.value = newToken
    user.value  = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  async function login(credentials) {
    // Demo mode — bypasses API when no backend is available. Las cuentas
    // (incluidas las que crea el Administrador en Configuración → Usuarios
    // y Perfiles) viven en usuariosStore.
    const usuariosStore = useUsuariosStore()
    const cuenta = usuariosStore.autenticar(credentials.email, credentials.password)
    if (cuenta) {
      const mockToken = `demo-token-${cuenta.rol}-${cuenta.id}`
      const mockUser  = { id: cuenta.id, name: cuenta.nombre, email: cuenta.email, role: cuenta.rol }
      persistSession(mockToken, mockUser)
      return { token: mockToken, user: mockUser }
    }

    const { data } = await authService.login(credentials)
    persistSession(data.token, data.user)
    return data
  }

  // Login con proveedor externo (Google / Azure AD)
  async function loginWithProvider(providerUser) {
    const mockToken = `provider-token-${providerUser.provider}-${Date.now()}`
    const newUser = {
      name:     providerUser.name     || providerUser.email,
      email:    providerUser.email,
      avatar:   providerUser.avatar   || null,
      // El acceso corporativo vía SSO se trata como personal administrativo.
      role:     'admin',
      provider: providerUser.provider,
    }
    persistSession(mockToken, newUser)
    return { token: mockToken, user: newUser }
  }

  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchMe() {
    const { data } = await authService.me()
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
  }

  return { user, token, isAuthenticated, login, loginWithProvider, logout, fetchMe }
})
