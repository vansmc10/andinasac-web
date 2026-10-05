import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// ─────────────────────────────────────────────────────────────
// Conductores registrados — fuente única de verdad
// ─────────────────────────────────────────────────────────────
// Vive aquí (en vez de dentro de ConductoresView.vue) para que otros
// módulos, como el registro de carga de combustible en Consumo, puedan
// listar los conductores reales sin duplicar los datos.
// Se guarda en localStorage (igual que consumoStore y unidadesStore) para
// que no se pierda al recargar la página. Esto también importa porque
// usuariosStore guarda un `conductorId` que apunta a un registro de acá
// (incluido el que crea automáticamente al dar de alta un usuario con rol
// Conductor) — si esta lista no persistiera, ese enlace quedaría roto tras
// recargar.
const STORAGE_KEY = 'conductores.lista'

function seedConductores() {
  return [
    { id: 1, codigo: 'CON-001', nombre: 'Ricardo Morales',  dni: '45231879', telefono: '987-654-321', email: 'r.morales@andina.com',   licencia: 'A-IIIb', vencLicencia: '2026-03-15', estado: 'activo',    unidad: 'TK-8829', km: 42100,  viajes: 156, calificacion: 4.8, foto: 'person' },
    { id: 2, codigo: 'CON-002', nombre: 'Elena Suárez',     dni: '52109843', telefono: '976-543-210', email: 'e.suarez@andina.com',     licencia: 'A-IIIb', vencLicencia: '2025-07-20', estado: 'activo',    unidad: 'TK-4102', km: 88200,  viajes: 214, calificacion: 4.6, foto: 'person' },
    { id: 3, codigo: 'CON-003', nombre: 'Jorge Ruiz',       dni: '38765012', telefono: '965-432-109', email: 'j.ruiz@andina.com',       licencia: 'A-IIIb', vencLicencia: '2025-09-01', estado: 'descanso',  unidad: 'TK-9931', km: 215900, viajes: 389, calificacion: 4.9, foto: 'person' },
    { id: 4, codigo: 'CON-004', nombre: 'Carmen López',     dni: '61823490', telefono: '954-321-098', email: 'c.lopez@andina.com',      licencia: 'A-IIb',  vencLicencia: '2026-11-10', estado: 'activo',    unidad: 'TK-3314', km: 124500, viajes: 201, calificacion: 4.7, foto: 'person' },
    { id: 5, codigo: 'CON-005', nombre: 'Luis Torres',      dni: '73912034', telefono: '943-210-987', email: 'l.torres@andina.com',     licencia: 'A-IIIb', vencLicencia: '2026-05-25', estado: 'activo',    unidad: 'TK-2201', km: 18300,  viajes: 45,  calificacion: 4.5, foto: 'person' },
    { id: 6, codigo: 'CON-006', nombre: 'María Fernández',  dni: '85034561', telefono: '932-109-876', email: 'm.fernandez@andina.com',  licencia: 'A-IIb',  vencLicencia: '2025-06-30', estado: 'inactivo',  unidad: '—',       km: 67800,  viajes: 132, calificacion: 4.3, foto: 'person' },
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

export const useConductoresStore = defineStore('conductores', () => {
  const conductores = ref(readStored() ?? seedConductores())

  watch(conductores, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  // Conductores disponibles para operar ahora mismo (usado, por ejemplo, en
  // el selector de Conductor del registro de carga de combustible).
  const activos = computed(() => conductores.value.filter(c => c.estado === 'activo'))

  return { conductores, activos }
})
