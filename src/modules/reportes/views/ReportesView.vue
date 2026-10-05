<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AppSelect from '@/components/AppSelect.vue'
import * as XLSX from 'xlsx'
import { useCurrency } from '@/modules/configuracion/composables/useCurrency.js'

const { currency, formatCurrency } = useCurrency()

// ── Filtros ────────────────────────────────────────────────
const periodoSel    = ref('30d')
const flotaSel      = ref('all')
const conductorSel  = ref('all')
const formatoExport = ref('xlsx')
const incluirGeo    = ref(false)
const mesActivo     = ref(null) // barra del gráfico seleccionada
const tooltipBar    = ref(null) // { mes, consumo, km, x, y }
const exportando    = ref(false)

const optsPeriodo = [
  { value: '30d', label: 'Últimos 30 días', icon: 'calendar_today' },
  { value: 'q',   label: 'Este trimestre',  icon: 'date_range'     },
  { value: 'y',   label: 'Año 2025',        icon: 'event_note'     },
]
const optsFlota = [
  { value: 'all',   label: 'Toda la flota',      icon: 'local_shipping' },
  { value: 'norte', label: 'Zona Norte (A1)',     icon: 'north'          },
  { value: 'urban', label: 'Distribución Urbana', icon: 'apartment'      },
]
const optsConductor = [
  { value: 'all',  label: 'Todos los conductores', icon: 'group'   },
  { value: 'mor',  label: 'Ricardo Morales',        icon: 'person'  },
  { value: 'sue',  label: 'Elena Suárez',           icon: 'person'  },
  { value: 'rui',  label: 'Jorge Ruiz',             icon: 'person'  },
  { value: 'lop',  label: 'Carmen López',           icon: 'person'  },
]

// ── Datos del gráfico ──────────────────────────────────────
const barrasTodas = [
  { mes: 'ENE', consumo: 40, km: 60,  costo: 18400, viajes: 124 },
  { mes: 'FEB', consumo: 55, km: 70,  costo: 22100, viajes: 148 },
  { mes: 'MAR', consumo: 70, km: 85,  costo: 28900, viajes: 189 },
  { mes: 'ABR', consumo: 35, km: 50,  costo: 15200, viajes: 102 },
  { mes: 'MAY', consumo: 85, km: 95,  costo: 34800, viajes: 212 },
  { mes: 'JUN', consumo: 60, km: 75,  costo: 24100, viajes: 163 },
]

const barras = computed(() => {
  // Simulamos filtro por periodo
  if (periodoSel.value === '30d') return barrasTodas.slice(-2)
  if (periodoSel.value === 'q')   return barrasTodas.slice(-3)
  return barrasTodas
})

const maxConsumo = computed(() => Math.max(...barras.value.map(b => b.consumo)))

// ── Tabla de detalle ───────────────────────────────────────
const tablaDetalle = computed(() => {
  const base = [
    { placa: 'TK-8829', conductor: 'Ricardo Morales', ruta: 'Lima → Arequipa',  km: 1248, consumo: 142.3, costo: 568.20, eficiencia: 8.8, estado: 'Completado'  },
    { placa: 'TK-4102', conductor: 'Elena Suárez',    ruta: 'Ruta Costa Sur',    km:  890, consumo: 108.6, costo: 434.40, eficiencia: 8.2, estado: 'En tránsito' },
    { placa: 'TK-9931', conductor: 'Jorge Ruiz',      ruta: 'Lima → Trujillo',   km: 1560, consumo: 186.2, costo: 744.80, eficiencia: 8.4, estado: 'Completado'  },
    { placa: 'TK-3314', conductor: 'Carmen López',    ruta: 'Lima → Callao',     km:  312, consumo:  36.4, costo: 145.60, eficiencia: 8.6, estado: 'Completado'  },
    { placa: 'TK-2201', conductor: 'Luis Torres',     ruta: 'Lima → Ica',        km:  980, consumo: 121.0, costo: 484.00, eficiencia: 8.1, estado: 'Completado'  },
    { placa: 'TK-7750', conductor: '—',               ruta: 'Sin asignación',     km:    0, consumo:   0.0, costo:   0.00, eficiencia:  0,  estado: 'Inactivo'    },
  ]
  if (conductorSel.value === 'mor') return base.filter(r => r.conductor.includes('Morales'))
  if (conductorSel.value === 'sue') return base.filter(r => r.conductor.includes('Suárez'))
  if (conductorSel.value === 'rui') return base.filter(r => r.conductor.includes('Ruiz'))
  if (conductorSel.value === 'lop') return base.filter(r => r.conductor.includes('López'))
  return base
})

const rutas = [
  { nombre: 'Ruta Metropolitana A-12', eficiencia: 94 },
  { nombre: 'Interestatal Sur',         eficiencia: 78 },
  { nombre: 'Zona Norte B-7',           eficiencia: 65 },
]

const reportesHistorial = [
  { icono: 'picture_as_pdf', iconoClass: 'bg-red-100 text-error',         titulo: 'Resumen Mensual Eficiencia – Mayo 2025',      fecha: '01 Jun 2025', size: '2.4 MB', tipo: 'pdf' },
  { icono: 'table_chart',    iconoClass: 'bg-emerald-100 text-emerald-700', titulo: 'Detalle de Consumo y Rutas – Flota Pesada', fecha: '28 May 2025', size: '1.1 MB', tipo: 'xlsx' },
  { icono: 'picture_as_pdf', iconoClass: 'bg-red-100 text-error',         titulo: 'Informe de Incidencias Trimestral Q1',        fecha: '15 May 2025', size: '4.8 MB', tipo: 'pdf' },
  { icono: 'table_chart',    iconoClass: 'bg-emerald-100 text-emerald-700', titulo: 'Análisis de Rutas – Zona Norte',            fecha: '10 May 2025', size: '0.8 MB', tipo: 'xlsx' },
]

const categorias = [
  { icono: 'local_shipping',    nombre: 'Carga Pesada',         pct: 92 },
  { icono: 'airport_shuttle',   nombre: 'Última Milla',          pct: 76 },
  { icono: 'electric_car',      nombre: 'Vehículos Eléctricos', pct: 88 },
]

// ── Tooltip del gráfico ────────────────────────────────────
function mostrarTooltip(e, b) {
  mesActivo.value = b.mes
  tooltipBar.value = { ...b }
}
function ocultarTooltip() {
  mesActivo.value = null
  tooltipBar.value = null
}

// ── Exportar Excel ─────────────────────────────────────────
async function exportarExcel() {
  exportando.value = true
  await new Promise(r => setTimeout(r, 600)) // UX feedback

  const wb = XLSX.utils.book_new()

  // Hoja 1: Resumen mensual
  const resumen = barras.value.map(b => ({
    'Mes':                    b.mes,
    'Consumo (%)':            b.consumo,
    'Kilometraje (%)':        b.km,
    [`Costo ${currency.value.code}`]: b.costo,
    'Viajes Completados':     b.viajes,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), 'Resumen Mensual')

  // Hoja 2: Detalle por unidad
  const detalle = tablaDetalle.value.map(r => ({
    'Placa':        r.placa,
    'Conductor':    r.conductor,
    'Ruta':         r.ruta,
    'Km Recorridos': r.km,
    'Consumo (L)':  r.consumo,
    [`Costo (${currency.value.code})`]: r.costo,
    'Eficiencia':   r.eficiencia,
    'Estado':       r.estado,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalle), 'Detalle Unidades')

  // Hoja 3: Rentabilidad por ruta
  const rutasSheet = rutas.map(r => ({
    'Ruta': r.nombre,
    'Eficiencia (%)': r.eficiencia,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rutasSheet), 'Rentabilidad Rutas')

  if (incluirGeo.value) {
    // Hoja 4: Datos geográficos (coordenadas)
    const geo = [
      { Placa: 'TK-8829', Latitud: -12.0464, Longitud: -77.0428, UltimaActualizacion: '2025-05-14 13:22' },
      { Placa: 'TK-4102', Latitud: -12.1219, Longitud: -77.0282, UltimaActualizacion: '2025-05-14 13:18' },
      { Placa: 'TK-9931', Latitud: -11.9843, Longitud: -77.0958, UltimaActualizacion: '2025-05-14 12:55' },
      { Placa: 'TK-3314', Latitud: -12.0656, Longitud: -77.1168, UltimaActualizacion: '2025-05-14 13:25' },
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(geo), 'Datos Geográficos')
  }

  const filename = `reporte-andina-${new Date().toISOString().slice(0,10)}.xlsx`
  XLSX.writeFile(wb, filename)
  exportando.value = false
}

function exportarCSV() {
  const datos = tablaDetalle.value
  const cols = ['placa', 'conductor', 'ruta', 'km', 'consumo', 'costo', 'eficiencia', 'estado']
  const headers = ['Placa', 'Conductor', 'Ruta', 'Km', 'Consumo(L)', `Costo(${currency.value.code})`, 'Eficiencia', 'Estado']
  const rows = datos.map(r => cols.map(c => `"${r[c]}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `reporte-andina-${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

function iniciarExtraccion() {
  formatoExport.value === 'xlsx' ? exportarExcel() : exportarCSV()
}

function descargarHistorial(r) {
  if (r.tipo === 'xlsx') {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Titulo: r.titulo, Fecha: r.fecha, Tamaño: r.size }]), 'Info')
    XLSX.writeFile(wb, `${r.titulo.slice(0,30).replace(/\s+/g, '-')}.xlsx`)
  } else {
    alert(`Descargando PDF: ${r.titulo}`)
  }
}

// ── Búsqueda en tabla ──────────────────────────────────────
const busquedaTabla = ref('')

// ── KPIs de resumen ────────────────────────────────────────
const kpis = computed(() => {
  const filas = tablaDetalle.value
  const totalKm     = filas.reduce((s, r) => s + r.km, 0)
  const totalCosto  = filas.reduce((s, r) => s + r.costo, 0)
  const totalViajes = barras.value.reduce((s, b) => s + b.viajes, 0)
  const eficArr     = filas.filter(r => r.eficiencia > 0)
  const eficProm    = eficArr.length ? (eficArr.reduce((s, r) => s + r.eficiencia, 0) / eficArr.length).toFixed(1) : '—'
  return { totalKm, totalCosto, totalViajes, eficProm }
})

// ── Columna ordenable ──────────────────────────────────────
const ordenCol = ref('placa')
const ordenDir = ref('asc')
function ordenar(col) {
  if (ordenCol.value === col) ordenDir.value = ordenDir.value === 'asc' ? 'desc' : 'asc'
  else { ordenCol.value = col; ordenDir.value = 'asc' }
}
const tablaOrdenada = computed(() => {
  let lista = [...tablaDetalle.value]
  // Filtrar por búsqueda
  const q = busquedaTabla.value.trim().toLowerCase()
  if (q) {
    lista = lista.filter(r =>
      r.placa.toLowerCase().includes(q)     ||
      r.conductor.toLowerCase().includes(q) ||
      r.ruta.toLowerCase().includes(q)      ||
      r.estado.toLowerCase().includes(q)
    )
  }
  // Ordenar
  return lista.sort((a, b) => {
    const va = a[ordenCol.value]; const vb = b[ordenCol.value]
    const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
    return ordenDir.value === 'asc' ? cmp : -cmp
  })
})
</script>

<template>
  <AppLayout>

    <!-- Page header + Filtros con AppSelect -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
      <div>
        <span class="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Análisis de Desempeño</span>
        <h2 class="text-4xl font-extrabold text-on-surface tracking-tight leading-none font-headline">Reportes</h2>
      </div>

      <!-- Filtros con AppSelect -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-surface-container-high shadow-sm">
          <div class="w-44">
            <AppSelect v-model="periodoSel" :options="optsPeriodo" label="Periodo" size="sm" variant="ghost" />
          </div>
          <div class="w-px h-8 bg-surface-container-high" aria-hidden="true"></div>
          <div class="w-52">
            <AppSelect v-model="flotaSel" :options="optsFlota" label="Flota" size="sm" variant="ghost" />
          </div>
          <div class="w-px h-8 bg-surface-container-high" aria-hidden="true"></div>
          <div class="w-52">
            <AppSelect v-model="conductorSel" :options="optsConductor" label="Conductor" size="sm" variant="ghost" :searchable="true" />
          </div>
        </div>
      </div>
    </div>

    <!-- KPIs de resumen (misma línea de diseño que Conductores/Unidades) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div
        v-for="[valor, label, icon, color, bg] in [
          [kpis.totalViajes,                 'Viajes periodo',    'flight_takeoff', '#4f6073', 'rgba(79,96,115,0.10)'  ],
          [kpis.totalKm.toLocaleString()+' km', 'Km recorridos', 'route',          '#2563eb', 'rgba(37,99,235,0.10)'  ],
          [formatCurrency(kpis.totalCosto, { decimals: 0 }), 'Costo total', 'payments', '#059669', 'rgba(5,150,105,0.10)'  ],
          [kpis.eficProm,                    'Eficiencia prom.',  'speed',          '#d97706', 'rgba(217,119,6,0.10)'  ],
        ]"
        :key="label"
        class="relative bg-surface rounded-2xl p-5 border border-surface-container-high overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none" :style="{ background: bg, filter:'blur(2px)' }" aria-hidden="true"></div>
        <div class="flex items-start justify-between mb-3 relative z-10">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: bg }">
            <span class="material-symbols-outlined text-xl" :style="{ color }" style="font-variation-settings:'FILL' 1">{{ icon }}</span>
          </div>
          <span class="text-2xl font-headline font-black text-on-surface leading-none">{{ valor }}</span>
        </div>
        <p class="text-[11px] font-black text-on-surface-variant uppercase tracking-widest relative z-10">{{ label }}</p>
        <div class="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl" :style="{ background: color }"></div>
      </div>
    </div>

    <!-- KPI estilo flip + Rentabilidad por ruta -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      <div
        v-for="m in [
          { icono:'local_shipping', valor:'87.5%', label:'Utilización de Flota',  delta:'+12.4%', ok:true  },
          { icono:'timer_off',      valor:'14.2h', label:'Ralentí Prom / Mes',    delta:'-2.1h',  ok:false },
        ]"
        :key="m.label"
        class="bg-surface-container rounded-2xl p-6 flex flex-col justify-between h-40 group hover:bg-on-surface transition-all duration-300 cursor-pointer border border-surface-container-high"
      >
        <div class="flex justify-between items-start">
          <span class="material-symbols-outlined text-primary group-hover:text-on-primary text-3xl" style="font-variation-settings:'FILL' 1">{{ m.icono }}</span>
          <span class="text-xs font-black px-2 py-0.5 rounded-full border" :class="m.ok ? 'text-emerald-700 bg-emerald-50 border-emerald-200 group-hover:bg-emerald-900 group-hover:text-emerald-300 group-hover:border-emerald-700' : 'text-red-600 bg-red-50 border-red-200 group-hover:bg-red-900 group-hover:text-red-300 group-hover:border-red-700'">{{ m.delta }}</span>
        </div>
        <div>
          <h3 class="text-4xl font-extrabold text-on-surface group-hover:text-on-primary font-headline">{{ m.valor }}</h3>
          <p class="text-[10px] font-bold text-outline group-hover:text-on-primary/60 uppercase tracking-widest mt-1">{{ m.label }}</p>
        </div>
      </div>

      <!-- Rentabilidad por ruta -->
      <div class="md:col-span-2 bg-surface rounded-2xl overflow-hidden border border-surface-container-high shadow-sm">
        <div class="px-5 py-4 border-b border-surface-container-low">
          <h3 class="text-[11px] font-black uppercase tracking-widest text-on-surface">Rentabilidad por Ruta</h3>
        </div>
        <div class="p-5 space-y-4">
          <div v-for="r in rutas" :key="r.nombre">
            <div class="flex justify-between items-center text-[11px] font-bold mb-2">
              <span class="text-on-surface">{{ r.nombre }}</span>
              <span class="font-black px-2 py-0.5 rounded-full text-[10px] border"
                :class="r.eficiencia >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : r.eficiencia >= 70 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200'">
                {{ r.eficiencia }}%
              </span>
            </div>
            <div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                :class="r.eficiencia >= 80 ? 'bg-emerald-500' : r.eficiencia >= 70 ? 'bg-amber-500' : 'bg-red-500'"
                :style="`width: ${r.eficiencia}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráfico + Tabla + Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">

        <!-- Gráfico de barras interactivo -->
        <div class="bg-surface rounded-xl p-8 border border-surface-container-high shadow-sm">
          <div class="flex justify-between items-start mb-8">
            <div>
              <h3 class="text-xl font-extrabold tracking-tight font-headline" id="chart-title">Análisis Operativo Mensual</h3>
              <p class="text-xs text-on-surface-variant mt-1">Haz clic en una barra para filtrar la tabla</p>
            </div>
            <div class="flex gap-2">
              <span class="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg text-[10px] font-bold uppercase tracking-wider border border-surface-container-high">
                <span class="w-2.5 h-2.5 rounded-sm bg-primary"></span> Consumo
              </span>
              <span class="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg text-[10px] font-bold uppercase tracking-wider border border-surface-container-high">
                <span class="w-2.5 h-2.5 rounded-sm bg-primary/25"></span> Kilometraje
              </span>
            </div>
          </div>

          <div
            role="img"
            aria-labelledby="chart-title"
            class="h-64 flex items-end justify-between gap-3 relative"
          >
            <div
              v-for="b in barras"
              :key="b.mes"
              class="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
              @mouseenter="mostrarTooltip($event, b)"
              @mouseleave="ocultarTooltip"
              @click="mesActivo = mesActivo === b.mes ? null : b.mes"
              :aria-label="`${b.mes}: consumo ${b.consumo}%, kilometraje ${b.km}%`"
              tabindex="0"
              @keyup.enter="mesActivo = mesActivo === b.mes ? null : b.mes"
            >
              <!-- Tooltip -->
              <Transition name="tooltip-fade">
                <div
                  v-if="mesActivo === b.mes"
                  class="absolute -top-2 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[11px] font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none"
                  style="transform: none; position: absolute; top: -60px;"
                >
                  <div class="font-black text-sm mb-0.5">{{ b.mes }} {{ new Date().getFullYear() }}</div>
                  <div>Consumo: <strong>{{ b.consumo }}%</strong></div>
                  <div>Km: <strong>{{ b.km }}%</strong></div>
                  <div>Costo: <strong>{{ formatCurrency(b.costo, { decimals: 0 }) }}</strong></div>
                  <div>Viajes: <strong>{{ b.viajes }}</strong></div>
                </div>
              </Transition>

              <!-- Barras dobles apiladas -->
              <div class="w-full flex gap-1.5 items-end" :style="`height: ${(b.km / maxConsumo) * 220}px`">
                <div
                  class="flex-1 rounded-t-lg transition-all duration-500 relative overflow-hidden"
                  :class="mesActivo === b.mes ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary/20 group-hover:bg-primary/30'"
                  :style="`height: 100%`"
                >
                </div>
                <div
                  class="flex-1 rounded-t-lg transition-all duration-500"
                  :class="mesActivo === b.mes ? 'bg-primary shadow-lg' : 'bg-primary group-hover:bg-primary/80'"
                  :style="`height: ${(b.consumo / b.km) * 100}%`"
                >
                </div>
              </div>
              <span class="text-[10px] font-black text-on-surface-variant group-hover:text-on-surface transition-colors">{{ b.mes }}</span>
            </div>
          </div>
        </div>

        <!-- Tabla detalle ordenable + buscador -->
        <div class="bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-sm">
          <!-- Header con buscador -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-surface-container-low">
            <div>
              <h3 class="text-sm font-black uppercase tracking-widest text-on-surface">Detalle por Unidad</h3>
              <p class="text-[11px] text-on-surface-variant mt-0.5">
                {{ tablaOrdenada.length }} de {{ tablaDetalle.length }} registros
                <span v-if="busquedaTabla" class="text-primary font-bold"> · filtrado</span>
              </p>
            </div>
            <div class="relative w-full sm:w-64">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                v-model="busquedaTabla"
                type="search"
                placeholder="Buscar placa, conductor, ruta…"
                class="w-full pl-9 pr-4 py-2 text-xs"
                aria-label="Buscar en la tabla de detalle"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm" role="grid" aria-label="Detalle de rendimiento por unidad">
              <thead>
                <tr style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%);">
                  <th
                    v-for="[col, lbl] in [['placa','Placa'],['conductor','Conductor'],['ruta','Ruta'],['km','Km'],['consumo','Consumo (L)'],['costo','Costo'],['eficiencia','Efic.'],['estado','Estado']]"
                    :key="col"
                    @click="ordenar(col)"
                    class="text-left text-[10px] font-black uppercase tracking-widest px-4 py-3.5 cursor-pointer select-none transition-colors hover:bg-white/10"
                    :class="ordenCol === col ? 'text-white' : 'text-white/70'"
                  >
                    <div class="flex items-center gap-1">
                      {{ lbl }}
                      <span class="material-symbols-outlined text-[12px] opacity-80">
                        {{ ordenCol === col ? (ordenDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in tablaOrdenada"
                  :key="r.placa"
                  class="border-t border-surface-container-low hover:bg-surface-container/50 transition-colors group"
                >
                  <td class="px-4 py-3.5 font-black text-on-surface">{{ r.placa }}</td>
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                      <span class="text-xs text-on-surface font-semibold">{{ r.conductor }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[14px] text-on-surface-variant">route</span>
                      <span class="text-xs text-on-surface-variant font-medium">{{ r.ruta }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-1">
                      <span class="text-sm font-black text-on-surface">{{ r.km.toLocaleString() }}</span>
                      <span class="text-[10px] text-on-surface-variant">km</span>
                    </div>
                  </td>
                  <td class="px-4 py-3.5 font-bold text-on-surface text-xs">{{ r.consumo }} L</td>
                  <td class="px-4 py-3.5 font-black text-on-surface text-xs">{{ formatCurrency(r.costo) }}</td>
                  <td class="px-4 py-3.5">
                    <span
                      class="text-[10px] font-black px-2 py-0.5 rounded-full border"
                      :class="r.eficiencia >= 8.5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : r.eficiencia >= 8 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'"
                    >{{ r.eficiencia > 0 ? r.eficiencia : '—' }}</span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      class="text-[10px] font-black px-2.5 py-1 rounded-full border"
                      :class="r.estado === 'Completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : r.estado === 'En tránsito' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'"
                    >{{ r.estado }}</span>
                  </td>
                </tr>
                <!-- Sin resultados -->
                <tr v-if="tablaOrdenada.length === 0">
                  <td colspan="8" class="px-6 py-14 text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-5xl block mb-2 opacity-40">search_off</span>
                    <p class="text-sm font-bold">Sin resultados para "{{ busquedaTabla }}"</p>
                    <button @click="busquedaTabla = ''" class="mt-2 text-xs text-primary font-bold hover:underline">Limpiar búsqueda</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Historial de reportes -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Historial de Reportes</h3>
            <button class="text-primary text-xs font-bold hover:underline">VER TODO</button>
          </div>
          <div class="bg-surface rounded-xl overflow-hidden border border-surface-container-high divide-y divide-surface-container-low shadow-sm">
            <div
              v-for="r in reportesHistorial"
              :key="r.titulo"
              class="px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors group"
            >
              <div class="flex items-center gap-4">
                <div class="p-2.5 rounded-lg" :class="r.iconoClass">
                  <span class="material-symbols-outlined text-xl">{{ r.icono }}</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface">{{ r.titulo }}</p>
                  <div class="flex gap-3 mt-0.5">
                    <span class="text-[10px] text-on-surface-variant font-bold uppercase">{{ r.fecha }}</span>
                    <span class="text-[10px] text-on-surface-variant font-bold">{{ r.size }}</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all" title="Previsualizar">
                  <span class="material-symbols-outlined text-lg">visibility</span>
                </button>
                <button @click="descargarHistorial(r)" class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all" title="Descargar">
                  <span class="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar derecho -->
      <div class="space-y-6">

        <!-- Exportación -->
        <div class="rounded-xl text-surface shadow-xl relative overflow-hidden" style="background: linear-gradient(145deg, #4f6073 0%, #2d3748 100%);">
          <div class="absolute -right-8 -bottom-8 opacity-5" aria-hidden="true">
            <span class="material-symbols-outlined" style="font-size:140px">cloud_download</span>
          </div>
          <div class="relative p-7">
            <h3 class="text-lg font-extrabold mb-1">Exportación</h3>
            <p class="text-xs text-white/60 mb-6 leading-relaxed">Genera archivos para ERP o análisis externos.</p>

            <fieldset class="mb-5">
              <legend class="text-[10px] font-black uppercase tracking-widest mb-3 text-white/70">Formato</legend>
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="formatoExport = 'xlsx'"
                  class="py-2.5 rounded-lg font-bold text-xs transition-all border"
                  :class="formatoExport === 'xlsx' ? 'bg-white text-on-surface border-white' : 'bg-white/8 border-white/20 hover:bg-white/15'"
                >
                  <span class="material-symbols-outlined text-base block mb-0.5">table_chart</span>
                  XLSX (Excel)
                </button>
                <button
                  @click="formatoExport = 'csv'"
                  class="py-2.5 rounded-lg font-bold text-xs transition-all border"
                  :class="formatoExport === 'csv' ? 'bg-white text-on-surface border-white' : 'bg-white/8 border-white/20 hover:bg-white/15'"
                >
                  <span class="material-symbols-outlined text-base block mb-0.5">description</span>
                  CSV (Raw)
                </button>
              </div>
            </fieldset>

            <label class="flex items-center gap-3 bg-white/8 p-4 rounded-lg border border-white/15 cursor-pointer hover:bg-white/15 transition-colors mb-5">
              <div
                class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                :class="incluirGeo ? 'bg-white border-white' : 'border-white/40'"
                @click="incluirGeo = !incluirGeo"
              >
                <span v-if="incluirGeo" class="material-symbols-outlined text-on-surface" style="font-size:14px">check</span>
              </div>
              <span class="text-xs font-bold text-white/80 select-none">Incluir datos geográficos</span>
            </label>

            <button
              @click="iniciarExtraccion"
              :disabled="exportando"
              class="w-full bg-white text-on-surface py-3.5 rounded-lg font-extrabold text-sm uppercase tracking-wider hover:bg-surface-container-low active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span v-if="exportando" class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-lg">{{ formatoExport === 'xlsx' ? 'table_chart' : 'description' }}</span>
              {{ exportando ? 'Generando…' : `Descargar ${formatoExport.toUpperCase()}` }}
            </button>
          </div>
        </div>

        <!-- Eficiencia por categoría -->
        <div class="bg-surface rounded-xl p-6 border border-surface-container-high shadow-sm">
          <h3 class="text-xs font-bold uppercase tracking-[0.2em] mb-5 text-on-surface">Eficiencia por Categoría</h3>
          <div class="space-y-5">
            <div v-for="c in categorias" :key="c.nombre" class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center border border-surface-container-high shrink-0">
                <span class="material-symbols-outlined text-primary text-lg">{{ c.icono }}</span>
              </div>
              <div class="flex-1">
                <div class="flex justify-between mb-1.5">
                  <span class="text-xs font-bold text-on-surface">{{ c.nombre }}</span>
                  <span class="text-xs font-black" :class="c.pct >= 85 ? 'text-emerald-600' : c.pct >= 70 ? 'text-amber-600' : 'text-red-600'">{{ c.pct }}%</span>
                </div>
                <div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="c.pct >= 85 ? 'bg-emerald-500' : c.pct >= 70 ? 'bg-amber-500' : 'bg-red-500'"
                    :style="`width: ${c.pct}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- IA Recomendación -->
        <div class="bg-surface rounded-xl p-5 border-l-4 border-primary border border-surface-container-high">
          <div class="flex gap-3">
            <span class="material-symbols-outlined text-primary shrink-0 mt-0.5">auto_awesome</span>
            <div>
              <p class="text-xs font-black uppercase tracking-wider mb-1.5 text-primary">Recomendación IA</p>
              <p class="text-xs leading-relaxed text-on-surface font-medium">
                Reducir el ralentí en Flota Pesada un <strong>5%</strong> podría ahorrar hasta <strong>{{ formatCurrency(12400, { decimals: 0 }) }}</strong> en combustible este trimestre.
              </p>
            </div>
          </div>
        </div>

        <!-- Resumen rápido del periodo seleccionado -->
        <div class="bg-surface rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-surface-container-low">
            <h3 class="text-[11px] font-black uppercase tracking-widest text-on-surface">Resumen del Periodo</h3>
          </div>
          <div class="divide-y divide-surface-container-low">
            <div v-for="[icon, label, valor, color] in [
              ['flight_takeoff', 'Total viajes',    kpis.totalViajes,                  '#4f6073'],
              ['route',          'Km recorridos',   kpis.totalKm.toLocaleString()+' km', '#2563eb'],
              ['payments',       'Costo total',     formatCurrency(kpis.totalCosto, { decimals: 0 }), '#059669'],
              ['speed',          'Eficiencia prom.',kpis.eficProm,                     '#d97706'],
            ]" :key="label" class="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container/50 transition-colors">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :style="{ background: color+'18' }">
                <span class="material-symbols-outlined text-[16px]" :style="{ color }" style="font-variation-settings:'FILL' 1">{{ icon }}</span>
              </div>
              <span class="text-xs text-on-surface-variant font-bold flex-1">{{ label }}</span>
              <span class="text-sm font-black text-on-surface">{{ valor }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.tooltip-fade-enter-active, .tooltip-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.tooltip-fade-enter-from, .tooltip-fade-leave-to { opacity: 0; transform: translateY(4px); }
</style>
