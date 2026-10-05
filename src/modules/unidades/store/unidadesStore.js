import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// ─────────────────────────────────────────────────────────────
// Unidades (flota) — fuente única de verdad
// ─────────────────────────────────────────────────────────────
// Igual que conductoresStore/consumoStore: vive en un store (persistido en
// localStorage) para no perderse al salir de la pantalla, y para que otros
// módulos —como la asignación de usuarios a camiones en Configuración—
// puedan leer la lista real de placas registradas.
const STORAGE_KEY = 'unidades.flota'

const seed = [
  { id: 1, placa: 'TK-8829', modelo: 'Volvo FH16', año: 2021, tipo: 'Camión Pesado',    estado: 'activo',    conductor: 'Ricardo Morales', km: 42100,  combustible: 'Diesel', capacidad: '28 ton', vencimientoSOAT: '2025-08-15', vencimientoRevision: '2025-10-01', imagen: 'directions_bus' },
  { id: 2, placa: 'TK-4102', modelo: 'Scania R500', año: 2020, tipo: 'Camión Pesado',    estado: 'alerta',   conductor: 'Elena Suárez',   km: 88200,  combustible: 'Diesel', capacidad: '32 ton', vencimientoSOAT: '2025-06-20', vencimientoRevision: '2025-07-10', imagen: 'local_shipping' },
  { id: 3, placa: 'TK-9931', modelo: 'Mercedes Actros', año: 2019, tipo: 'Tráiler',      estado: 'mantenimiento', conductor: 'Jorge Ruiz', km: 215900, combustible: 'Diesel', capacidad: '35 ton', vencimientoSOAT: '2025-12-01', vencimientoRevision: '2025-11-15', imagen: 'local_shipping' },
  { id: 4, placa: 'TK-3314', modelo: 'MAN TGX',    año: 2022, tipo: 'Camión Mediano',   estado: 'activo',    conductor: 'Carmen López',   km: 124500, combustible: 'Diesel', capacidad: '20 ton', vencimientoSOAT: '2026-01-30', vencimientoRevision: '2025-09-20', imagen: 'airport_shuttle' },
  { id: 5, placa: 'TK-2201', modelo: 'Volvo FMX',  año: 2023, tipo: 'Camión Pesado',    estado: 'activo',    conductor: 'Luis Torres',     km: 18300,  combustible: 'Diesel', capacidad: '25 ton', vencimientoSOAT: '2026-03-15', vencimientoRevision: '2026-02-01', imagen: 'directions_bus' },
  { id: 6, placa: 'TK-7750', modelo: 'DAF XF',     año: 2020, tipo: 'Tráiler',          estado: 'inactivo',  conductor: '—',               km: 301200, combustible: 'Diesel', capacidad: '33 ton', vencimientoSOAT: '2025-05-30', vencimientoRevision: '2025-06-15', imagen: 'local_shipping' },
]

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const useUnidadesStore = defineStore('unidades', () => {
  const unidades = ref(readStored() ?? seed)

  watch(unidades, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  return { unidades }
})
