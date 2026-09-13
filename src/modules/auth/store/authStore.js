import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService.js'

export const useAuthStore = defineStore('auth', () => {

  // ═════════════════════════════════════════════
  // ESTADO INICIAL
  // ═════════════════════════════════════════════

  function getStoredUser() {
    try {
      const storedUser = localStorage.getItem('user')

      if (!storedUser) {
        return null
      }

      return JSON.parse(storedUser)

    } catch (error) {

      console.error(
        'Error al recuperar el usuario guardado:',
        error
      )

      localStorage.removeItem('user')

      return null
    }
  }

  const user = ref(getStoredUser())

  const token = ref(
    localStorage.getItem('token')
  )

  const isAuthenticated = computed(
    () => !!token.value && !!user.value
  )


  // ═════════════════════════════════════════════
  // USUARIOS DEMO
  // ═════════════════════════════════════════════
  //
  // Estos usuarios son solamente para demostración.
  // Más adelante serán reemplazados por el backend.
  //
  // ═════════════════════════════════════════════

  const usuariosDemo = [

    // ───────────────────────────────────────────
    // ADMINISTRADOR
    // ───────────────────────────────────────────

    {
      email: 'admin@andina.com',

      password: 'andina123',

      user: {
        name: 'Admin Global',
        email: 'admin@andina.com',
        role: 'admin',
      },
    },


    // ───────────────────────────────────────────
    // CHOFER
    // ───────────────────────────────────────────

    {
      email: 'chofer@andina.com',

      password: 'chofer123',

      user: {
        name: 'Chofer Andina',
        email: 'chofer@andina.com',
        role: 'conductor',
      },
    },


    // ───────────────────────────────────────────
    // CONTROLADOR DE RUTAS
    // ───────────────────────────────────────────

    {
      email: 'controlador@andina.com',

      password: 'control123',

      user: {
        name: 'Controlador de Rutas',
        email: 'controlador@andina.com',
        role: 'controlador_rutas',
      },
    },
  ]


  // ═════════════════════════════════════════════
  // GUARDAR SESIÓN
  // ═════════════════════════════════════════════

  function saveSession(newToken, newUser) {

    token.value = newToken

    user.value = newUser

    localStorage.setItem(
      'token',
      newToken
    )

    localStorage.setItem(
      'user',
      JSON.stringify(newUser)
    )
  }


  // ═════════════════════════════════════════════
  // LOGIN
  // ═════════════════════════════════════════════

  async function login(credentials) {

    // ───────────────────────────────────────────
    // BUSCAR USUARIO DEMO
    // ───────────────────────────────────────────

    const usuario = usuariosDemo.find(
      (u) =>
        u.email === credentials.email &&
        u.password === credentials.password
    )


    // ═══════════════════════════════════════════
    // LOGIN DEMO
    // ═══════════════════════════════════════════

    if (usuario) {

      // ─────────────────────────────────────────
      // VALIDACIÓN OPCIONAL DEL ROL
      // ─────────────────────────────────────────
      //
      // LoginView podrá enviar:
      //
      // credentials.role
      //
      // para asegurarnos de que el usuario
      // corresponda al rol seleccionado.
      //
      // ─────────────────────────────────────────

      if (
        credentials.role &&
        credentials.role !== usuario.user.role
      ) {

        throw new Error(
          'El usuario no corresponde al rol seleccionado.'
        )
      }


      const mockToken =
        `demo-token-${usuario.user.role}-${Date.now()}`


      saveSession(
        mockToken,
        usuario.user
      )


      return {
        token: mockToken,
        user: usuario.user,
      }
    }


    // ═══════════════════════════════════════════
    // LOGIN CON BACKEND
    // ═══════════════════════════════════════════

    try {

      const { data } =
        await authService.login(credentials)


      if (!data?.token || !data?.user) {

        throw new Error(
          'El servidor no devolvió una sesión válida.'
        )
      }


      // ─────────────────────────────────────────
      // VALIDAR ROL DEL BACKEND
      // ─────────────────────────────────────────

      if (
        credentials.role &&
        data.user.role !== credentials.role
      ) {

        throw new Error(
          'El usuario no tiene permisos para el rol seleccionado.'
        )
      }


      saveSession(
        data.token,
        data.user
      )


      return data

    } catch (error) {

      console.error(
        'Error durante el inicio de sesión:',
        error
      )

      throw error
    }
  }


  // ═════════════════════════════════════════════
  // LOGIN CON GOOGLE / MICROSOFT
  // ═════════════════════════════════════════════

  async function loginWithProvider(providerUser) {

    // ───────────────────────────────────────────
    // ROL
    // ───────────────────────────────────────────
    //
    // Si LoginView envía el rol seleccionado,
    // lo respetamos.
    //
    // Si no lo envía, se utiliza "user".
    // Esto nos sirve mientras seguimos
    // desarrollando el prototipo.
    //
    // ───────────────────────────────────────────

    const role =
      providerUser.role || 'user'


    const mockToken =
      `provider-token-${providerUser.provider}-${Date.now()}`


    const newUser = {

      name:
        providerUser.name ||
        providerUser.email,

      email:
        providerUser.email,

      avatar:
        providerUser.avatar || null,

      role,

      provider:
        providerUser.provider,
    }


    saveSession(
      mockToken,
      newUser
    )


    return {
      token: mockToken,
      user: newUser,
    }
  }


  // ═════════════════════════════════════════════
  // CERRAR SESIÓN
  // ═════════════════════════════════════════════

  function logout() {

    user.value = null

    token.value = null

    localStorage.removeItem('token')

    localStorage.removeItem('user')
  }


  // ═════════════════════════════════════════════
  // OBTENER USUARIO DESDE BACKEND
  // ═════════════════════════════════════════════

  async function fetchMe() {

    try {

      const { data } =
        await authService.me()


      if (!data) {

        throw new Error(
          'El servidor no devolvió información del usuario.'
        )
      }


      user.value = data


      localStorage.setItem(
        'user',
        JSON.stringify(data)
      )


      return data

    } catch (error) {

      console.error(
        'Error al obtener el usuario:',
        error
      )

      throw error
    }
  }


  // ═════════════════════════════════════════════
  // EXPORTAR STORE
  // ═════════════════════════════════════════════

  return {

    user,
    token,
    isAuthenticated,

    login,
    loginWithProvider,
    logout,
    fetchMe,
  }
})