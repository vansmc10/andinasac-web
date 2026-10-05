import { storeToRefs } from 'pinia'
import { useAuthStore } from '../store/authStore.js'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router    = useRouter()

  // storeToRefs mantiene `user` como un ref reactivo real (en vez de una
  // copia estática del valor), necesario para que el menú y las guardas de
  // ruta reaccionen correctamente al rol del usuario (user.value?.role).
  const { user, isAuthenticated } = storeToRefs(authStore)

  async function handleLogout() {
    authStore.logout()
    await router.push({ name: 'login' })
  }

  return {
    user,
    isAuthenticated,
    handleLogout,
  }
}
