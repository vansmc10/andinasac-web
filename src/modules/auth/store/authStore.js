import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService.js'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    // Demo mode — bypasses API when no backend is available
    if (credentials.email === 'admin@andina.com' && credentials.password === 'andina123') {
      const mockToken = 'demo-token-fleet-architect'
      const mockUser  = { name: 'Admin Global', email: 'admin@andina.com', role: 'admin' }
      token.value = mockToken
      user.value  = mockUser
      localStorage.setItem('token', mockToken)
      return { token: mockToken, user: mockUser }
    }

    const { data } = await authService.login(credentials)
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    return data
  }

  // Login con proveedor externo (Google / Azure AD)
  async function loginWithProvider(providerUser) {
    const mockToken = `provider-token-${providerUser.provider}-${Date.now()}`
    const newUser = {
      name:     providerUser.name     || providerUser.email,
      email:    providerUser.email,
      avatar:   providerUser.avatar   || null,
      role:     'user',
      provider: providerUser.provider,
    }
    token.value = mockToken
    user.value  = newUser
    localStorage.setItem('token', mockToken)
    return { token: mockToken, user: newUser }
  }

  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('token')
  }

  async function fetchMe() {
    const { data } = await authService.me()
    user.value = data
  }

  return { user, token, isAuthenticated, login, loginWithProvider, logout, fetchMe }
})
