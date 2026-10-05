import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useConductoresStore } from '@/modules/conductores/store/conductoresStore.js'

// ─────────────────────────────────────────────────────────────
// Usuarios y Perfiles — cuentas de acceso al sistema
// ─────────────────────────────────────────────────────────────
// Unifica el login con el módulo Conductores: cuando se crea (o edita) un
// usuario con rol Conductor, automáticamente se le vincula (o crea) un
// perfil en el store de Conductores (src/modules/conductores/store), para
// que aparezca también ahí y en el selector de conductor del registro de
// combustible.
//
// NOTA: no hay backend real todavía, así que la contraseña se guarda tal
// cual en localStorage — es un modo de demostración, no un esquema de
// autenticación seguro. Con un backend real esto se reemplaza por
// autenticación del lado del servidor (hash de contraseña, tokens, etc.).
const STORAGE_KEY = 'app.usuarios'

function seedUsuarios() {
  return [
    { id: 1, nombre: 'Admin Global',     email: 'admin@andina.com',     password: 'andina123',    rol: 'admin',     activo: true, conductorId: null, unidadesAsignadas: [] },
    { id: 2, nombre: 'Carlos Conductor', email: 'conductor@andina.com', password: 'conductor123', rol: 'conductor', activo: true, conductorId: null, unidadesAsignadas: [] },
  ]
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const useUsuariosStore = defineStore('usuarios', () => {
  const usuarios = ref(readStored() ?? seedUsuarios())

  watch(usuarios, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  const conductoresStore = useConductoresStore()

  // Si el usuario tiene rol Conductor y todavía no tiene un perfil de
  // conductor vinculado (DNI, licencia, unidad asignada…), se le crea uno.
  function asegurarPerfilConductor(usuario) {
    if (usuario.rol !== 'conductor' || usuario.conductorId) return
    const siguiente = conductoresStore.conductores.length + 1
    const nuevoConductor = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      codigo: `CON-${String(siguiente).padStart(3, '0')}`,
      nombre: usuario.nombre,
      dni: '', telefono: '', email: usuario.email,
      licencia: 'A-IIIb', vencLicencia: '', estado: 'activo',
      unidad: usuario.unidadesAsignadas?.[0] || '—',
      km: 0, viajes: 0, calificacion: 0, foto: 'person',
    }
    conductoresStore.conductores.push(nuevoConductor)
    usuario.conductorId = nuevoConductor.id
  }

  // Autocura cuentas ya guardadas (o la semilla, en el primer arranque)
  // que sean rol Conductor y aún no tengan perfil vinculado.
  usuarios.value.forEach(asegurarPerfilConductor)

  // Si el perfil de Conductores vinculado a un usuario desaparece (por
  // ejemplo, el Administrador lo elimina desde la sección Conductores), el
  // usuario quedaría con un conductorId "huérfano" apuntando a un registro
  // que ya no existe. Este watch lo detecta y le crea un perfil nuevo, para
  // que una cuenta con rol Conductor nunca quede sin conductor vinculado.
  watch(conductoresStore.conductores, (lista) => {
    const idsExistentes = new Set(lista.map(c => c.id))
    usuarios.value.forEach(u => {
      if (u.conductorId && !idsExistentes.has(u.conductorId)) {
        u.conductorId = null
        asegurarPerfilConductor(u)
      }
    })
  }, { deep: true })

  function crear({ nombre, email, password, rol, unidadesAsignadas = [] }) {
    const nuevo = { id: Date.now(), nombre, email, password, rol, activo: true, conductorId: null, unidadesAsignadas }
    usuarios.value.push(nuevo)
    asegurarPerfilConductor(nuevo)
    return nuevo
  }

  function actualizar(id, cambios) {
    const idx = usuarios.value.findIndex(u => u.id === id)
    if (idx === -1) return
    usuarios.value[idx] = { ...usuarios.value[idx], ...cambios }
    const usuario = usuarios.value[idx]
    asegurarPerfilConductor(usuario)
    if (usuario.conductorId && usuario.unidadesAsignadas?.length) {
      const c = conductoresStore.conductores.find(c => c.id === usuario.conductorId)
      if (c) c.unidad = usuario.unidadesAsignadas[0]
    }
  }

  function eliminar(id) {
    usuarios.value = usuarios.value.filter(u => u.id !== id)
  }

  function toggleActivo(id) {
    const u = usuarios.value.find(u => u.id === id)
    if (u) u.activo = !u.activo
  }

  /** Usado por el login: busca una cuenta activa que calce email + contraseña. */
  function autenticar(email, password) {
    return usuarios.value.find(u =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password &&
      u.activo !== false
    ) ?? null
  }

  function existeEmail(email, exceptoId = null) {
    return usuarios.value.some(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== exceptoId)
  }

  return { usuarios, crear, actualizar, eliminar, toggleActivo, autenticar, existeEmail }
})
