import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// ─────────────────────────────────────────────────────────────
// Registros de carga de combustible
// ─────────────────────────────────────────────────────────────
// Antes esta lista vivía como estado local dentro de ConsumoView.vue: cada
// vez que se salía de la pantalla (por ejemplo, al cerrar sesión) el
// componente se destruía y con él cualquier carga registrada, volviendo
// siempre a los 10 registros de ejemplo. Ahora vive en un store —
// sobrevive a navegar entre pantallas y a cerrar/iniciar sesión — y además
// se guarda en localStorage para que tampoco se pierda al recargar la
// página (mientras no haya un backend real conectado).
const STORAGE_KEY = 'consumo.registros'

const seed = [
  { fechaISO: '2025-05-14', fecha: '14 May, 2025', hora: '08:45 AM', vehiculoId: 'VOL-882', vehiculo: 'VOL-882 (Volvo FH16)',    estacion: 'Shell Express – Central',  cantidad: 45.0, costo: 215.50, km: '124,500', alerta: false, tipo: 'Diésel B5'  },
  { fechaISO: '2025-05-14', fecha: '14 May, 2025', hora: '06:20 AM', vehiculoId: 'SCA-102', vehiculo: 'SCA-102 (Scania R450)',   estacion: 'BP Transworld',             cantidad: 82.3, costo: 395.00, km: '88,240',  alerta: false, tipo: 'Diésel B5'  },
  { fechaISO: '2025-05-13', fecha: '13 May, 2025', hora: '11:15 PM', vehiculoId: 'MAN-404', vehiculo: 'MAN-404 (MAN TGX)',       estacion: 'PetroMax #12',              cantidad: 32.1, costo: 152.80, km: '215,900', alerta: true,  tipo: 'Diésel B20' },
  { fechaISO: '2025-05-13', fecha: '13 May, 2025', hora: '02:30 PM', vehiculoId: 'MER-310', vehiculo: 'MER-310 (Mercedes)',      estacion: 'Repsol Autopista',          cantidad: 60.5, costo: 290.40, km: '98,120',  alerta: false, tipo: 'Diésel B5'  },
  { fechaISO: '2025-05-12', fecha: '12 May, 2025', hora: '09:00 AM', vehiculoId: 'VOL-882', vehiculo: 'VOL-882 (Volvo FH16)',    estacion: 'Shell Express – Norte',     cantidad: 50.2, costo: 241.00, km: '124,000', alerta: false, tipo: 'Diésel B5'  },
  { fechaISO: '2025-04-28', fecha: '28 Abr, 2025', hora: '03:10 PM', vehiculoId: 'TK-2201', vehiculo: 'TK-2201 (Volvo FMX)',    estacion: 'Shell Express – Central',   cantidad: 38.7, costo: 185.76, km: '18,200',  alerta: false, tipo: 'Diésel B5'  },
  { fechaISO: '2025-04-25', fecha: '25 Abr, 2025', hora: '07:45 AM', vehiculoId: 'SCA-102', vehiculo: 'SCA-102 (Scania R450)',   estacion: 'BP Transworld',             cantidad: 75.0, costo: 360.00, km: '87,500',  alerta: false, tipo: 'Diésel B20' },
  { fechaISO: '2025-04-20', fecha: '20 Abr, 2025', hora: '10:30 AM', vehiculoId: 'MAN-404', vehiculo: 'MAN-404 (MAN TGX)',       estacion: 'Repsol Autopista',          cantidad: 41.0, costo: 196.80, km: '215,200', alerta: true,  tipo: 'Diésel B5'  },
  { fechaISO: '2025-03-15', fecha: '15 Mar, 2025', hora: '08:00 AM', vehiculoId: 'MER-310', vehiculo: 'MER-310 (Mercedes)',      estacion: 'Shell Express – Central',   cantidad: 55.0, costo: 264.00, km: '97,600',  alerta: false, tipo: 'Diésel B5'  },
  { fechaISO: '2025-02-10', fecha: '10 Feb, 2025', hora: '04:20 PM', vehiculoId: 'VOL-882', vehiculo: 'VOL-882 (Volvo FH16)',    estacion: 'Shell Express – Norte',     cantidad: 48.0, costo: 230.40, km: '122,000', alerta: false, tipo: 'GNV'        },
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

export const useConsumoStore = defineStore('consumo', () => {
  const registros = ref(readStored() ?? seed)

  watch(registros, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  return { registros }
})
