<script setup>
import AppLayout from '@/components/AppLayout.vue'
import AppSelect from '@/components/AppSelect.vue'
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCurrency } from '@/modules/configuracion/composables/useCurrency.js'
import { useConductoresStore } from '@/modules/conductores/store/conductoresStore.js'
import { useConsumoStore } from '../store/consumoStore.js'

const { currency, formatCurrency } = useCurrency()

// Conductores activos registrados en el módulo Conductores, para elegir en
// el formulario de carga de combustible (fuente única: src/modules/conductores).
const conductoresStore = useConductoresStore()
const { activos: conductoresActivos } = storeToRefs(conductoresStore)
const opsConductor = computed(() => conductoresActivos.value.map(c => ({
  value: c.codigo,
  label: `${c.nombre} — ${c.codigo}`,
  nombre: c.nombre,
  icon: 'badge',
})))

const loaded = ref(false)
onMounted(() => setTimeout(() => { loaded.value = true }, 120))

// ── Filtros globales ─────────────────────────────────────
const periodoActivo    = ref('30d')
const filtroVehiculo   = ref('todos')
const busqueda         = ref('')
const modalAbierto     = ref(false)

// ── Opciones selects ─────────────────────────────────────
const opsVehiculo = [
  { value: 'VOL-882', label: 'VOL-882 — Volvo FH16',        icon: 'local_shipping' },
  { value: 'SCA-102', label: 'SCA-102 — Scania R450',       icon: 'local_shipping' },
  { value: 'MAN-404', label: 'MAN-404 — MAN TGX',           icon: 'local_shipping' },
  { value: 'MER-310', label: 'MER-310 — Mercedes Actros',   icon: 'local_shipping' },
  { value: 'TK-2201', label: 'TK-2201 — Volvo FMX',         icon: 'local_shipping' },
]
const opsFiltroVehiculo = [
  { value: 'todos', label: 'Todos los vehículos', icon: 'local_shipping' },
  ...opsVehiculo,
]
const opsEstacion = [
  { value: 'shell-central', label: 'Shell Express – Central',   icon: 'local_gas_station' },
  { value: 'shell-norte',   label: 'Shell Express – Norte',     icon: 'local_gas_station' },
  { value: 'bp-transworld', label: 'BP Transworld',             icon: 'local_gas_station' },
  { value: 'repsol-auto',   label: 'Repsol Autopista',          icon: 'local_gas_station' },
  { value: 'petromax-12',   label: 'PetroMax #12',              icon: 'local_gas_station' },
  { value: 'otra',          label: 'Otra estación…',            icon: 'add_location'      },
]
const opsTipoCombustible = [
  { value: 'diesel-b5',  label: 'Diésel B5',          icon: 'oil_barrel' },
  { value: 'diesel-b20', label: 'Diésel B20 Premium',  icon: 'oil_barrel' },
  { value: 'gnv',        label: 'GNV',                 icon: 'compress'   },
]

// ── Registros con fechaISO y vehiculoId para filtrar ─────
// Viven en un store (src/modules/consumo/store/consumoStore.js) para que
// no se pierdan al salir de esta pantalla o cerrar sesión.
const consumoStore = useConsumoStore()
const { registros } = storeToRefs(consumoStore)

// ── Límite de fecha según periodo ────────────────────────
const limiteISO = computed(() => {
  const d = new Date()
  if (periodoActivo.value === '30d') { d.setDate(d.getDate() - 30); return d.toISOString().slice(0,10) }
  if (periodoActivo.value === 'q')   { d.setMonth(d.getMonth() - 3); return d.toISOString().slice(0,10) }
  return '2025-01-01'   // año completo
})

// ── Registros filtrados ───────────────────────────────────
const registrosFiltrados = computed(() => {
  let lista = registros.value.filter(r => r.fechaISO >= limiteISO.value)

  if (filtroVehiculo.value !== 'todos') {
    lista = lista.filter(r => r.vehiculoId === filtroVehiculo.value)
  }

  const q = busqueda.value.trim().toLowerCase()
  if (q) {
    lista = lista.filter(r =>
      r.vehiculo.toLowerCase().includes(q) ||
      r.estacion.toLowerCase().includes(q) ||
      r.tipo.toLowerCase().includes(q)
    )
  }
  return lista
})

// ── KPIs calculados ───────────────────────────────────────
const kpis = computed(() => {
  const lista = registrosFiltrados.value
  const totalGalones = lista.reduce((s, r) => s + r.cantidad, 0)
  const totalCosto   = lista.reduce((s, r) => s + r.costo,   0)
  const alertas      = lista.filter(r => r.alerta).length
  const eficiencia   = totalGalones > 0 ? (lista.length * 120 / totalGalones).toFixed(1) : '—'
  return {
    cargas:        lista.length,
    totalGalones:  totalGalones.toFixed(1),
    totalCosto:    totalCosto.toFixed(2),
    alertas,
    eficiencia,
  }
})

// ── Eficiencia por vehículo ────────────────────────────────
const vehiculosEficiencia = computed(() => {
  const todos = [
    { id: 'VOL-882', modelo: 'Volvo FH16',       ruta: 'Norte',  eficiencia: 18.4, porcentaje: 85, estado: 'ok'      },
    { id: 'SCA-102', modelo: 'Scania R450',       ruta: 'Costa',  eficiencia: 16.1, porcentaje: 72, estado: 'ok'      },
    { id: 'MAN-404', modelo: 'MAN TGX',           ruta: 'Urbano', eficiencia: 11.8, porcentaje: 45, estado: 'critico' },
    { id: 'MER-310', modelo: 'Mercedes Actros',   ruta: 'Sur',    eficiencia: 15.5, porcentaje: 68, estado: 'ok'      },
    { id: 'TK-2201', modelo: 'Volvo FMX',         ruta: 'Lima',   eficiencia: 17.2, porcentaje: 79, estado: 'ok'      },
  ]
  if (filtroVehiculo.value === 'todos') return todos
  return todos.filter(v => v.id === filtroVehiculo.value)
})

// ── Formulario modal ──────────────────────────────────────
const hoy   = new Date().toISOString().slice(0, 10)
const ahora = new Date().toTimeString().slice(0, 5)

const form = ref({
  vehiculo: '', estacion: '', otraEstacion: '', tipo: 'diesel-b5',
  cantidad: '', total: '', km: '', fecha: hoy, hora: ahora,
  conductor: '', notas: '',
})

// El conductor ingresa cuánto pagó en total (como sale en el ticket del
// grifo) y cuántos galones cargó; el precio por galón se calcula solo,
// dividiendo el total entre la cantidad — no se pide como dato aparte.
const costoTotal = computed(() => {
  const t = parseFloat(form.value.total) || 0
  return t.toFixed(2)
})

const precioPorGalon = computed(() => {
  const q = parseFloat(form.value.cantidad) || 0
  const t = parseFloat(form.value.total)    || 0
  if (q <= 0 || t <= 0) return null
  return t / q
})

const errores = ref({})

function validar() {
  const e = {}
  if (!form.value.vehiculo)  e.vehiculo  = 'Selecciona un vehículo'
  if (!form.value.estacion)  e.estacion  = 'Selecciona la estación'
  if (form.value.estacion === 'otra' && !form.value.otraEstacion.trim()) e.otraEstacion = 'Ingresa el nombre'
  if (!form.value.cantidad  || parseFloat(form.value.cantidad)      <= 0) e.cantidad = 'Ingresa los galones'
  if (!form.value.total     || parseFloat(form.value.total)         <= 0) e.total    = 'Ingresa el total pagado'
  if (!form.value.km        || parseInt(form.value.km)              <= 0) e.km       = 'Ingresa el kilometraje'
  if (!form.value.fecha) e.fecha = 'Selecciona la fecha'
  errores.value = e
  return Object.keys(e).length === 0
}

function guardar() {
  if (!validar()) return
  const vehiculoLabel = opsVehiculo.find(v => v.value === form.value.vehiculo)?.label.split('—')[1]?.trim() ?? form.value.vehiculo
  const estacionLabel = form.value.estacion === 'otra'
    ? form.value.otraEstacion
    : opsEstacion.find(e => e.value === form.value.estacion)?.label ?? form.value.estacion
  const conductorLabel = opsConductor.value.find(c => c.value === form.value.conductor)?.nombre ?? form.value.conductor

  const fechaDisplay = new Date(form.value.fecha).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })

  registros.value.unshift({
    fechaISO:   form.value.fecha,
    fecha:      fechaDisplay,
    hora:       form.value.hora,
    vehiculoId: form.value.vehiculo,
    vehiculo:   `${form.value.vehiculo} (${vehiculoLabel})`,
    estacion:   estacionLabel,
    conductor:  conductorLabel,
    cantidad:   parseFloat(form.value.cantidad),
    costo:      parseFloat(costoTotal.value),
    precioPorGalon: precioPorGalon.value,
    km:         parseInt(form.value.km).toLocaleString(),
    alerta:     false,
    tipo:       opsTipoCombustible.find(t => t.value === form.value.tipo)?.label ?? form.value.tipo,
  })
  cerrar()
}

function cerrar() {
  modalAbierto.value = false
  errores.value = {}
  form.value = { vehiculo:'', estacion:'', otraEstacion:'', tipo:'diesel-b5', cantidad:'', total:'', km:'', fecha:hoy, hora:ahora, conductor:'', notas:'' }
}
</script>

<template>
  <AppLayout>
    <Transition name="page-fade" appear>
    <div v-if="loaded">

    <!-- ── Page header ─────────────────────────────────── -->
    <section class="mb-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span class="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2 block">Métricas de Energía</span>
          <h2 class="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Consumo de Combustible</h2>
        </div>
        <!-- Selector de periodo -->
        <div class="flex items-center gap-1.5 bg-surface-container p-1.5 rounded-xl border border-surface-container-high">
          <button
            v-for="p in [{ key:'30d', label:'30 días' },{ key:'q', label:'Trimestre' },{ key:'y', label:'Anual' }]"
            :key="p.key"
            @click="periodoActivo = p.key"
            class="px-4 py-2 text-sm font-black rounded-lg transition-all"
            :class="periodoActivo === p.key ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
          >{{ p.label }}</button>
        </div>
      </div>
    </section>

    <!-- ── KPIs ────────────────────────────────────────── -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div
        v-for="[valor, label, icon, color, bg] in [
          [kpis.cargas,                     'Cargas registradas', 'receipt_long',     '#4f6073', 'rgba(79,96,115,0.10)'  ],
          [kpis.totalGalones + ' Gal',      'Total combustible',  'local_gas_station','#2563eb', 'rgba(37,99,235,0.10)'  ],
          [formatCurrency(kpis.totalCosto), 'Gasto total',        'payments',         '#059669', 'rgba(5,150,105,0.10)'  ],
          [kpis.alertas + (kpis.alertas === 1 ? ' alerta' : ' alertas'), 'Desvíos detectados', 'warning', '#dc2626', 'rgba(220,38,38,0.10)'],
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
    </section>

    <!-- ── Gráfico eficiencia + Alertas ─────────────────── -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

      <!-- Eficiencia por vehículo -->
      <div class="lg:col-span-2 bg-surface rounded-2xl p-7 border border-surface-container-high shadow-sm">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="font-black text-lg text-on-surface font-headline">Eficiencia por Vehículo</h3>
            <p class="text-xs text-on-surface-variant mt-0.5">KM / Galón respecto al objetivo (20 km/gal)</p>
          </div>
          <div class="flex gap-3 text-[10px] font-black uppercase tracking-wider">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-[#4f6073] inline-block"></span>Real</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-red-400 inline-block"></span>Crítico</span>
          </div>
        </div>
        <div class="space-y-5">
          <div v-for="v in vehiculosEficiencia" :key="v.id">
            <div class="flex justify-between items-center mb-1.5">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[15px] text-on-surface-variant">local_shipping</span>
                <span class="text-xs font-black text-on-surface">{{ v.id }} — {{ v.modelo }}</span>
                <span class="text-[10px] font-bold text-on-surface-variant">Ruta {{ v.ruta }}</span>
              </div>
              <span
                class="text-xs font-black px-2 py-0.5 rounded-full border"
                :class="v.estado === 'critico'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
              >
                {{ v.eficiencia }} km/gal
              </span>
            </div>
            <div class="w-full h-7 bg-surface-container rounded-lg relative overflow-hidden border border-surface-container-high">
              <div
                class="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                :class="v.estado === 'critico' ? 'bg-red-400' : 'bg-[#4f6073]'"
                :style="`width: ${v.porcentaje}%`"
              >
                <span class="text-[10px] font-black text-white">{{ v.porcentaje }}%</span>
              </div>
            </div>
          </div>
          <p v-if="vehiculosEficiencia.length === 0" class="text-sm text-center text-on-surface-variant py-4">
            Sin datos para este filtro
          </p>
        </div>
      </div>

      <!-- Alertas críticas -->
      <div class="bg-surface rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-surface-container-low flex items-center gap-2" style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)">
          <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings:'FILL' 1">warning</span>
          <h3 class="font-black text-white font-headline">Alertas Críticas</h3>
        </div>
        <div class="p-4 space-y-3">
          <div class="p-4 rounded-xl flex items-start gap-3 border border-red-100 bg-red-50">
            <div class="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-white text-base" style="font-variation-settings:'FILL' 1">trending_down</span>
            </div>
            <div>
              <p class="text-xs font-black text-red-800 uppercase tracking-wide">Caída de Eficiencia</p>
              <p class="text-xs font-bold text-red-700 mt-0.5">MAN TGX · Ruta Urbano</p>
              <p class="text-[11px] text-red-600 mt-1">Desvío de <strong>25%</strong> del objetivo — KM/Gal por debajo del mínimo.</p>
            </div>
          </div>
          <div class="p-4 rounded-xl flex items-start gap-3 border border-amber-100 bg-amber-50">
            <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-white text-base" style="font-variation-settings:'FILL' 1">location_on</span>
            </div>
            <div>
              <p class="text-xs font-black text-amber-800 uppercase tracking-wide">Geocerca Violada</p>
              <p class="text-xs font-bold text-amber-700 mt-0.5">Estación no autorizada</p>
              <p class="text-[11px] text-amber-600 mt-1">Carga en "PetroMax #12" fuera del perímetro.</p>
            </div>
          </div>
          <div class="p-4 rounded-xl flex items-start gap-3 border border-surface-container-high bg-surface-container">
            <div class="w-8 h-8 rounded-lg bg-slate-400 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-white text-base" style="font-variation-settings:'FILL' 1">schedule</span>
            </div>
            <div>
              <p class="text-xs font-black text-on-surface uppercase tracking-wide">Mantenimiento</p>
              <p class="text-xs font-bold text-on-surface-variant mt-0.5">Servicio preventivo</p>
              <p class="text-[11px] text-on-surface-variant mt-1">Filtros obstruidos detectados por OBD.</p>
            </div>
          </div>
        </div>
        <div class="px-4 pb-4">
          <button class="w-full py-2.5 border border-surface-container-high rounded-xl text-xs font-black text-on-surface hover:bg-surface-container transition-colors">
            Ver historial de alertas
          </button>
        </div>
      </div>
    </section>

    <!-- ── Tabla de registros ────────────────────────────── -->
    <section class="bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-sm">

      <!-- Toolbar: título + filtros + buscador + acción -->
      <div class="px-6 py-4 border-b border-surface-container-low">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 class="font-black text-base text-on-surface font-headline">Cargas de Combustible</h3>
            <p class="text-[11px] text-on-surface-variant mt-0.5">
              {{ registrosFiltrados.length }} de {{ registros.length }} registros
              <span v-if="filtroVehiculo !== 'todos' || busqueda" class="text-primary font-bold"> · filtrado</span>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Filtro vehículo -->
            <div class="w-52">
              <AppSelect
                v-model="filtroVehiculo"
                :options="opsFiltroVehiculo"
                label=""
                size="sm"
                variant="ghost"
                placeholder="Todos los vehículos"
              />
            </div>

            <!-- Buscador texto -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[17px]">search</span>
              <input
                v-model="busqueda"
                type="search"
                placeholder="Buscar estación, tipo…"
                class="pl-9 pr-4 py-2 text-xs w-48"
                aria-label="Buscar en registros"
              />
            </div>

            <!-- Botón registrar -->
            <button
              @click="modalAbierto = true"
              class="flex items-center gap-2 text-on-primary text-xs font-black px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
              style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)"
            >
              <span class="material-symbols-outlined text-base">add</span>
              Registrar Carga
            </button>
          </div>
        </div>

        <!-- Chips de filtros activos -->
        <div v-if="filtroVehiculo !== 'todos' || busqueda" class="flex items-center gap-2 mt-3 flex-wrap">
          <span class="text-[10px] font-black text-on-surface-variant uppercase tracking-wide">Filtros activos:</span>
          <button
            v-if="filtroVehiculo !== 'todos'"
            @click="filtroVehiculo = 'todos'"
            class="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-black rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            {{ filtroVehiculo }}
            <span class="material-symbols-outlined text-[13px]">close</span>
          </button>
          <button
            v-if="busqueda"
            @click="busqueda = ''"
            class="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-black rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            "{{ busqueda }}"
            <span class="material-symbols-outlined text-[13px]">close</span>
          </button>
          <button @click="filtroVehiculo = 'todos'; busqueda = ''" class="text-[11px] text-on-surface-variant font-bold hover:text-on-surface transition-colors underline">
            Limpiar todo
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="w-full text-left" role="grid" aria-label="Registros de carga de combustible">
          <thead>
            <tr style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%);">
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80">Fecha y Hora</th>
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80">Vehículo</th>
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80 hidden md:table-cell">Estación</th>
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80 hidden lg:table-cell">Tipo</th>
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80">Cantidad</th>
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80">Costo</th>
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80 hidden lg:table-cell">KM</th>
              <th class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/80 text-right">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container-low">
            <tr
              v-for="r in registrosFiltrados"
              :key="r.fechaISO + r.vehiculo + r.hora"
              class="hover:bg-surface-container/50 transition-colors group"
              :class="r.alerta ? 'bg-red-50/40' : ''"
            >
              <td class="px-5 py-4">
                <p class="text-xs font-black text-on-surface">{{ r.fecha }}</p>
                <p class="text-[10px] text-on-surface-variant font-bold mt-0.5">{{ r.hora }}</p>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[14px] text-on-surface-variant" style="font-variation-settings:'FILL' 1">local_shipping</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-on-surface leading-tight">{{ r.vehiculo }}</p>
                    <p v-if="r.conductor" class="text-[10px] text-on-surface-variant font-semibold leading-tight mt-0.5 truncate">{{ r.conductor }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 hidden md:table-cell">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px] text-on-surface-variant">local_gas_station</span>
                  <span class="text-xs text-on-surface font-semibold">{{ r.estacion }}</span>
                </div>
              </td>
              <td class="px-5 py-4 hidden lg:table-cell">
                <span class="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-lg">{{ r.tipo }}</span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-baseline gap-1">
                  <span class="text-sm font-black text-on-surface">{{ r.cantidad.toFixed(1) }}</span>
                  <span class="text-[10px] text-on-surface-variant">Gal</span>
                </div>
              </td>
              <td class="px-5 py-4">
                <span class="text-sm font-black text-on-surface">{{ formatCurrency(r.costo) }}</span>
              </td>
              <td class="px-5 py-4 hidden lg:table-cell">
                <span class="text-xs font-bold text-on-surface">{{ r.km }} km</span>
              </td>
              <td class="px-5 py-4 text-right">
                <span
                  class="text-[10px] font-black px-2.5 py-1 rounded-full border"
                  :class="r.alerta
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
                >
                  {{ r.alerta ? 'Alerta' : 'Normal' }}
                </span>
              </td>
            </tr>

            <!-- Estado vacío -->
            <tr v-if="registrosFiltrados.length === 0">
              <td colspan="8" class="px-6 py-16 text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-5xl block mb-3 opacity-40">search_off</span>
                <p class="text-sm font-bold">Sin registros para los filtros aplicados</p>
                <button @click="filtroVehiculo = 'todos'; busqueda = ''" class="mt-2 text-xs text-primary font-bold hover:underline">
                  Limpiar filtros
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer tabla -->
      <div class="px-6 py-4 border-t border-surface-container-low bg-surface-container/30 flex items-center justify-between">
        <span class="text-xs text-on-surface font-bold">
          Mostrando {{ registrosFiltrados.length }} de {{ registros.length }} registros
        </span>
        <div class="flex gap-2">
          <button class="flex items-center gap-1 px-3 py-2 rounded-lg border border-surface-container-high bg-surface text-xs font-bold hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-sm">chevron_left</span> Anterior
          </button>
          <button class="flex items-center gap-1 px-3 py-2 rounded-lg border border-surface-container-high bg-surface text-xs font-bold hover:bg-surface-container transition-colors">
            Siguiente <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         MODAL: Registrar Carga de Combustible
    ══════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modalAbierto" role="dialog" aria-modal="true" aria-label="Registrar carga de combustible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrar" aria-hidden="true"></div>

          <div class="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-surface-container-high flex flex-col">
            <!-- Header modal -->
            <div class="flex items-center justify-between px-7 py-5 rounded-t-2xl sticky top-0 z-10" style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings:'FILL' 1">local_gas_station</span>
                </div>
                <div>
                  <h2 class="text-lg font-black text-white font-headline tracking-tight">Registrar Carga de Combustible</h2>
                  <p class="text-[11px] text-white/60 font-semibold">Logística Andina SAC</p>
                </div>
              </div>
              <button @click="cerrar" aria-label="Cerrar" class="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Total a pagar -->
            <div class="px-7 py-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
              <span class="text-xs font-black text-on-surface-variant uppercase tracking-widest">Total a Pagar</span>
              <div class="flex items-baseline gap-1">
                <span class="text-2xl font-black font-headline text-on-surface">{{ formatCurrency(costoTotal) }}</span>
                <span class="text-xs font-bold text-on-surface-variant">{{ currency.code }}</span>
              </div>
            </div>

            <!-- Body -->
            <form @submit.prevent="guardar" class="p-7 space-y-5" novalidate>
              <!-- Vehículo + Conductor -->
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <AppSelect v-model="form.vehiculo" :options="opsVehiculo" label="Vehículo *" :searchable="true" placeholder="Seleccionar unidad…" />
                  <p v-if="errores.vehiculo" role="alert" class="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">error</span>{{ errores.vehiculo }}
                  </p>
                </div>
                <div>
                  <AppSelect v-model="form.conductor" :options="opsConductor" label="Conductor" :searchable="true" placeholder="Seleccionar conductor…" />
                </div>
              </div>

              <!-- Estación + Tipo combustible -->
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <AppSelect v-model="form.estacion" :options="opsEstacion" label="Estación *" :searchable="true" placeholder="Seleccionar estación…" />
                  <p v-if="errores.estacion" role="alert" class="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">error</span>{{ errores.estacion }}
                  </p>
                </div>
                <div v-if="form.estacion === 'otra'">
                  <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5" for="cc-otra">Nombre de la estación *</label>
                  <input id="cc-otra" v-model="form.otraEstacion" placeholder="Ej: Primax Los Olivos" class="w-full px-3 py-2.5 text-sm" />
                  <p v-if="errores.otraEstacion" role="alert" class="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">error</span>{{ errores.otraEstacion }}
                  </p>
                </div>
                <div v-else>
                  <AppSelect v-model="form.tipo" :options="opsTipoCombustible" label="Tipo de Combustible" />
                </div>
              </div>

              <!-- Cantidad + Total pagado -->
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5" for="cc-cantidad">Cantidad (Galones) *</label>
                  <div class="relative">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-on-surface-variant">Gal</span>
                    <input id="cc-cantidad" v-model="form.cantidad" type="number" min="0.1" step="0.1" placeholder="0.0" class="w-full px-3 py-2.5 text-sm pr-12" />
                  </div>
                  <p v-if="errores.cantidad" role="alert" class="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">error</span>{{ errores.cantidad }}
                  </p>
                </div>
                <div>
                  <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5" for="cc-total">Total Pagado *</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-on-surface-variant">{{ currency.symbol }}</span>
                    <input id="cc-total" v-model="form.total" type="number" min="0.01" step="0.01" placeholder="85.00" class="w-full pl-7 pr-3 py-2.5 text-sm" />
                  </div>
                  <p v-if="errores.total" role="alert" class="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">error</span>{{ errores.total }}
                  </p>
                </div>
              </div>

              <!-- KM + Precio por galón (calculado) -->
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5" for="cc-km">Kilometraje Actual *</label>
                  <div class="relative">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-on-surface-variant">km</span>
                    <input id="cc-km" v-model="form.km" type="number" min="0" placeholder="124500" class="w-full px-3 py-2.5 text-sm pr-12" />
                  </div>
                  <p v-if="errores.km" role="alert" class="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">error</span>{{ errores.km }}
                  </p>
                </div>
                <div class="bg-surface-container rounded-xl p-4 border border-surface-container-high flex flex-col justify-center">
                  <p class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Precio por Galón</p>
                  <p class="text-2xl font-black font-headline text-on-surface">
                    {{ precioPorGalon !== null ? formatCurrency(precioPorGalon) : '—' }}
                  </p>
                  <p class="text-[10px] text-on-surface-variant mt-1">
                    {{ currency.symbol }}{{ form.total || '0.00' }} ÷ {{ form.cantidad || '0' }} Gal
                  </p>
                </div>
              </div>

              <!-- Fecha + Hora -->
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5" for="cc-fecha">Fecha *</label>
                  <input id="cc-fecha" v-model="form.fecha" type="date" class="w-full px-3 py-2.5 text-sm" />
                  <p v-if="errores.fecha" role="alert" class="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">error</span>{{ errores.fecha }}
                  </p>
                </div>
                <div>
                  <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5" for="cc-hora">Hora</label>
                  <input id="cc-hora" v-model="form.hora" type="time" class="w-full px-3 py-2.5 text-sm" />
                </div>
              </div>

              <!-- Notas -->
              <div>
                <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5" for="cc-notas">Notas / Observaciones</label>
                <textarea id="cc-notas" v-model="form.notas" rows="2" placeholder="Ej: Carga de emergencia, conductor reportó luz de reserva encendida." class="w-full px-3 py-2.5 text-sm resize-none"></textarea>
              </div>

              <!-- Acciones -->
              <div class="flex gap-3 justify-end pt-2 border-t border-surface-container-low">
                <button type="button" @click="cerrar" class="px-6 py-2.5 border border-surface-container-high rounded-xl text-sm font-black text-on-surface hover:bg-surface-container transition-all">
                  Cancelar
                </button>
                <button type="submit" class="px-8 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2" style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)">
                  <span class="material-symbols-outlined text-base">save</span>
                  Registrar Carga
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    </div>
    </Transition>

    <!-- FAB -->
    <template #fab>
      <button
        @click="modalAbierto = true"
        aria-label="Agregar nueva carga de combustible"
        class="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 border-4 border-white"
        style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)"
      >
        <span class="material-symbols-outlined text-2xl" style="font-variation-settings:'FILL' 1" aria-hidden="true">add</span>
      </button>
    </template>
  </AppLayout>
</template>

<style scoped>
.page-fade-enter-active { transition: all 0.45s cubic-bezier(0.16,1,0.3,1); }
.page-fade-enter-from   { opacity: 0; transform: translateY(12px); }
.modal-fade-enter-active { transition: all 0.2s ease-out; }
.modal-fade-leave-active { transition: all 0.15s ease-in; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .relative, .modal-fade-leave-to .relative { transform: scale(0.97) translateY(8px); }
</style>
