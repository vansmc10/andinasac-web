import { useAuthStore } from '../store/authStore.js'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router    = useRouter()

  async function handleLogout() {
    authStore.logout()
    await router.push({ name: 'login' })
  }

  return {
    user:            authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    handleLogout,
  }
}
