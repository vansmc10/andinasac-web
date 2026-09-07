<script setup>
import AppLayout from '@/components/AppLayout.vue'
import { ref, reactive, computed, onMounted } from 'vue'

const loaded = ref(false)
onMounted(() => setTimeout(() => { loaded.value = true }, 120))

const mesActual  = ref('Mayo 2025')
const busqueda   = ref('')
const filtroTipo = ref('todos')

// ── Modal Agendar ─────────────────────────────────────────
const modalAbierto = ref(false)
const formError    = ref('')

const form = reactive({
  id:          '',
  modelo:      '',
  tipo:        'Preventivo',
  trabajo:     '',
  mecanico:    '',
  ingreso:     '',
  salida:      '',
  prioridad:   'Media',
})

const colorPorTipo = { Preventivo: '#059669', Correctivo: '#dc2626', Revisión: '#0891b2' }

function abrirModal() {
  Object.assign(form, { id: '', modelo: '', tipo: 'Preventivo', trabajo: '', mecanico: '', ingreso: '', salida: '', prioridad: 'Media' })
  formError.value    = ''
  modalAbierto.value = true
}

function guardar() {
  if (!form.id.trim() || !form.modelo.trim() || !form.trabajo.trim() || !form.mecanico.trim()) {
    formError.value = 'Completa los campos obligatorios marcados con *'
    return
  }
  enTaller.value.unshift({
    id:       form.id.trim().toUpperCase(),
    modelo:   form.modelo.trim(),
    tipo:     form.tipo,
    trabajo:  form.trabajo.trim(),
    mecanico: form.mecanico.trim(),
    salida:   form.salida.trim() || 'Por definir',
    progreso: 0,
    color:    colorPorTipo[form.tipo] || '#4f6073',
  })
  modalAbierto.value = false
}

// ── KPI data ──────────────────────────────────────────────
const kpis = [
  { label: 'En Taller',       value: '14',      unit: 'unidades', icon: 'build',           color: '#4f6073', bg: 'rgba(79,96,115,0.10)',  trend: '+2 desde ayer',   trendIcon: 'trending_up',   trendColor: 'text-slate-500' },
  { label: 'Programados Hoy', value: '06',      unit: 'servicios', icon: 'event_available', color: '#059669', bg: 'rgba(5,150,105,0.10)',  trend: '4 prev · 2 corr', trendIcon: 'schedule',      trendColor: 'text-emerald-600' },
  { label: 'Alertas Críticas',value: '03',      unit: 'urgentes',  icon: 'warning',         color: '#dc2626', bg: 'rgba(220,38,38,0.10)',  trend: 'Acción inmediata', trendIcon: 'priority_high', trendColor: 'text-red-600' },
  { label: 'Gasto del Mes',   value: '$24.8k',  unit: 'soles',     icon: 'payments',        color: '#d97706', bg: 'rgba(217,119,6,0.10)',  trend: '-12% vs Abril',   trendIcon: 'arrow_downward',trendColor: 'text-emerald-600' },
]

// ── Alertas ───────────────────────────────────────────────
const alertas = [
  { icon: 'verified_user',    color: '#dc2626', bgBadge: 'bg-red-50 text-red-700 border-red-200',     titulo: 'SOAT Expira',        unidad: 'TRK-402 · Volvo FH16',    dias: 'Vence en 2 días',  urgencia: 'alta'   },
  { icon: 'settings_suggest', color: '#d97706', bgBadge: 'bg-amber-50 text-amber-700 border-amber-200', titulo: 'Revisión Técnica',   unidad: 'TRK-118 · Scania R500',   dias: 'Vence en 15 días', urgencia: 'media'  },
  { icon: 'analytics',        color: '#0891b2', bgBadge: 'bg-blue-50 text-blue-700 border-blue-200',  titulo: 'Garantía de Motor',  unidad: 'TRK-905 · Freightliner',  dias: 'Revisión Mensual', urgencia: 'baja'   },
  { icon: 'oil_barrel',       color: '#7c3aed', bgBadge: 'bg-violet-50 text-violet-700 border-violet-200', titulo: 'Cambio Aceite',   unidad: 'TRK-311 · MAN TGX',       dias: 'Vence en 7 días',  urgencia: 'media'  },
]

// ── Unidades en taller ────────────────────────────────────
const enTaller = ref([
  { id: 'TRK-504', modelo: 'Volvo FH460',           tipo: 'Preventivo',  trabajo: 'Cambio de inyectores y sistema de aire', salida: '14 May', progreso: 75,  color: '#4f6073', mecanico: 'J. Rodríguez' },
  { id: 'TRK-112', modelo: 'Mercedes-Benz Actros',  tipo: 'Preventivo',  trabajo: 'Mantenimiento preventivo 100 000 km',    salida: 'Hoy',    progreso: 95,  color: '#059669', mecanico: 'C. Torres'    },
  { id: 'TRK-287', modelo: 'Scania R500',            tipo: 'Correctivo',  trabajo: 'Reparación de frenos traseros',          salida: '18 May', progreso: 40,  color: '#dc2626', mecanico: 'M. Vargas'    },
  { id: 'TRK-801', modelo: 'MAN TGX 26.480',        tipo: 'Revisión',    trabajo: 'Revisión técnica semestral',             salida: '20 May', progreso: 20,  color: '#0891b2', mecanico: 'P. Quispe'    },
])

const tallerFiltrado = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  let lista = filtroTipo.value === 'todos' ? enTaller.value : enTaller.value.filter(v => v.tipo === filtroTipo.value)
  if (q) lista = lista.filter(v => v.id.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q) || v.trabajo.toLowerCase().includes(q))
  return lista
})

// ── Historial de costos ───────────────────────────────────
const costos = [
  { descripcion: 'Reparación Transmisión',     unidad: 'TRK-802', fecha: '05 May 2025', monto: 4200.00, tipo: 'Correctivo' },
  { descripcion: 'Cambio de Neumáticos (×10)', unidad: 'TRK-415', fecha: '02 May 2025', monto: 6800.00, tipo: 'Preventivo' },
  { descripcion: 'Aceite y Filtros',           unidad: 'TRK-220', fecha: '01 May 2025', monto:  450.00, tipo: 'Preventivo' },
  { descripcion: 'Cambio Amortiguadores',      unidad: 'TRK-109', fecha: '29 Abr 2025', monto: 1850.00, tipo: 'Correctivo' },
]

const costoBadge = { Preventivo: 'bg-emerald-50 text-emerald-700 border-emerald-200', Correctivo: 'bg-red-50 text-red-700 border-red-200' }

// ── Calendario ────────────────────────────────────────────
const diasCalendario = [
  { num: null, prev: true }, { num: null, prev: true }, { num: null, prev: true },
  { num: null, prev: true }, { num: null, prev: true }, { num: null, prev: true },
  { num: null, prev: true },
  ...Array.from({ length: 31 }, (_, i) => ({
    num: i + 1, prev: false,
    eventos: i + 1 === 3  ? [{ tipo: 'preventivo', label: 'TRK-201' }]
           : i + 1 === 9  ? [{ tipo: 'revision',   label: 'REVISIÓN' }, { tipo: 'correctivo', label: 'TRK-440' }]
           : i + 1 === 14 ? [{ tipo: 'preventivo', label: 'TRK-504' }]
           : i + 1 === 22 ? [{ tipo: 'correctivo', label: 'MAN-404' }]
           : i + 1 === 27 ? [{ tipo: 'revision',   label: 'TRK-118' }]
           : [],
  })),
]
const tipoClase = { preventivo: 'bg-[#4f6073] text-white', correctivo: 'bg-red-600 text-white', revision: 'bg-[#0891b2] text-white' }
const today = 14
</script>

<template>
  <AppLayout>
    <Transition name="page-fade" appear>
    <div v-if="loaded">
    <!-- ── Header ── -->
    <header class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
      <div>
        <p class="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Gestión de Activos</p>
        <h2 class="text-3xl font-black tracking-tight text-on-surface font-headline">Mantenimiento de Flota</h2>
        <p class="text-on-surface-variant font-medium mt-1 text-sm">Control preventivo y correctivo de {{ enTaller.length }} unidades en proceso</p>
      </div>
      <button
        @click="abrirModal"
        class="flex items-center gap-2 text-white px-6 py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all font-bold text-sm min-h-[48px] self-start sm:self-auto"
        style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)"
      >
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">add</span>
        Agendar Mantenimiento
      </button>
    </header>

    <!-- ── KPI Cards ── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="k in kpis" :key="k.label"
        class="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
        style="border-bottom: 3px solid var(--kpi-color)"
        :style="{ '--kpi-color': k.color }"
      >
        <!-- Blur decoration -->
        <div class="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-60" :style="`background:${k.color}`"></div>

        <div class="relative flex items-start justify-between mb-4">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center" :style="`background:${k.bg}`">
            <span class="material-symbols-outlined text-xl" :style="`color:${k.color};font-variation-settings:'FILL' 1`">{{ k.icon }}</span>
          </div>
        </div>
        <p class="text-2xl font-black text-slate-800 font-headline">{{ k.value }}</p>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{{ k.label }}</p>
        <div class="flex items-center gap-1 mt-3" :class="k.trendColor">
          <span class="material-symbols-outlined text-sm">{{ k.trendIcon }}</span>
          <span class="text-[11px] font-bold">{{ k.trend }}</span>
        </div>
      </div>
    </div>

    <!-- ── Grid principal ── -->
    <div class="grid grid-cols-12 gap-6">

      <!-- ══ Unidades en Taller (izq) ══ -->
      <section class="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Header degradado -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings:'FILL' 1">garage</span>
            <h3 class="text-base font-black text-white font-headline">Unidades en Taller</h3>
            <span class="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full">{{ tallerFiltrado.length }}</span>
          </div>
          <!-- Filtros tipo -->
          <div class="flex gap-1">
            <button
              v-for="[val, lbl] in [['todos','Todos'],['Preventivo','Prev.'],['Correctivo','Corr.'],['Revisión','Rev.']]"
              :key="val"
              @click="filtroTipo = val"
              class="text-[10px] font-black px-2.5 py-1 rounded-lg transition-colors"
              :class="filtroTipo === val ? 'bg-white text-[#4f6073]' : 'bg-white/15 text-white hover:bg-white/25'"
            >{{ lbl }}</button>
          </div>
        </div>

        <!-- Buscador -->
        <div class="px-6 py-3 border-b border-slate-100">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar unidad, modelo o trabajo..."
              class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all"
            />
          </div>
        </div>

        <!-- Lista de unidades -->
        <div class="divide-y divide-slate-100">
          <div
            v-for="v in tallerFiltrado" :key="v.id"
            class="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
          >
            <!-- Icono tipo -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" :style="`background:${v.color}18`">
              <span class="material-symbols-outlined text-2xl" :style="`color:${v.color};font-variation-settings:'FILL' 1`">local_shipping</span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-sm font-black text-slate-800">{{ v.id }}</span>
                <span class="text-xs font-semibold text-slate-500">{{ v.modelo }}</span>
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-full border"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': v.tipo === 'Preventivo',
                    'bg-red-50 text-red-700 border-red-200':             v.tipo === 'Correctivo',
                    'bg-blue-50 text-blue-700 border-blue-200':          v.tipo === 'Revisión',
                  }"
                >{{ v.tipo }}</span>
              </div>
              <p class="text-xs text-slate-500 truncate mb-2">{{ v.trabajo }}</p>
              <!-- Barra de progreso -->
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"
                  role="progressbar" :aria-valuenow="v.progreso" aria-valuemin="0" aria-valuemax="100">
                  <div class="h-full rounded-full transition-all duration-700" :style="`width:${v.progreso}%;background:${v.color}`"></div>
                </div>
                <span class="text-xs font-black" :style="`color:${v.color}`">{{ v.progreso }}%</span>
              </div>
            </div>

            <!-- Meta derecha -->
            <div class="text-right flex-shrink-0">
              <div class="flex items-center gap-1 justify-end mb-1">
                <span class="material-symbols-outlined text-sm text-slate-400">person</span>
                <span class="text-xs font-semibold text-slate-600">{{ v.mecanico }}</span>
              </div>
              <div
                class="text-xs font-black px-3 py-1 rounded-lg inline-flex items-center gap-1"
                :style="`background:${v.color}15;color:${v.color}`"
              >
                <span class="material-symbols-outlined text-sm">event</span>
                {{ v.salida }}
              </div>
              <!-- Acciones hover -->
              <div class="mt-2 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button aria-label="Ver detalles" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                </button>
                <button aria-label="Editar" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="tallerFiltrado.length === 0" class="px-6 py-12 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300 mb-3 block">search_off</span>
            <p class="font-bold text-slate-500">Sin resultados para "<span class="italic">{{ busqueda }}</span>"</p>
            <button @click="busqueda = ''; filtroTipo = 'todos'" class="mt-3 text-sm font-bold text-[#4f6073] hover:underline">Limpiar filtros</button>
          </div>
        </div>
      </section>

      <!-- ══ Panel derecho (Alertas + Costos) ══ -->
      <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">

        <!-- Alertas y Vencimientos -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div class="px-5 py-4" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings:'FILL' 1">notification_important</span>
              <h3 class="text-base font-black text-white font-headline">Alertas y Vencimientos</h3>
            </div>
          </div>

          <div class="p-4 space-y-3">
            <div
              v-for="a in alertas" :key="a.titulo"
              class="flex items-start gap-3 p-3 rounded-xl border-l-4 bg-slate-50"
              :style="`border-left-color:${a.color}`"
            >
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" :style="`background:${a.color}18`">
                <span class="material-symbols-outlined text-lg" :style="`color:${a.color};font-variation-settings:'FILL' 1`">{{ a.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-black text-slate-800">{{ a.titulo }}</p>
                <p class="text-xs text-slate-500 truncate">{{ a.unidad }}</p>
                <span class="inline-block mt-1.5 text-[10px] font-black px-2 py-0.5 rounded-full border" :class="a.bgBadge">
                  {{ a.dias }}
                </span>
              </div>
            </div>
          </div>

          <div class="px-4 pb-4">
            <button class="w-full py-2.5 text-sm font-black text-[#4f6073] border-2 border-[#4f6073]/30 hover:border-[#4f6073] hover:bg-[#4f6073]/5 rounded-xl transition-all min-h-[44px]">
              Ver todas las alertas
            </button>
          </div>
        </section>

        <!-- Historial y Costos -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
          <!-- Gasto total -->
          <div class="px-5 py-5 text-white" style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%)">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gasto Total del Mes</p>
                <p class="text-3xl font-black font-headline">$24,850</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="flex items-center text-emerald-400 font-bold text-xs gap-0.5">
                    <span class="material-symbols-outlined text-sm">arrow_downward</span>-12% vs Abril
                  </span>
                  <span class="text-[10px] text-slate-500 font-semibold">· Presupuesto OK</span>
                </div>
              </div>
              <div class="opacity-20" aria-hidden="true">
                <span class="material-symbols-outlined text-6xl" style="font-variation-settings:'FILL' 1">payments</span>
              </div>
            </div>
          </div>

          <!-- Lista costos -->
          <div class="divide-y divide-slate-100">
            <div
              v-for="c in costos" :key="c.descripcion"
              class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group"
            >
              <div class="min-w-0 mr-3">
                <p class="text-xs font-bold text-slate-800 truncate">{{ c.descripcion }}</p>
                <p class="text-[10px] text-slate-400 font-semibold mt-0.5">{{ c.unidad }} · {{ c.fecha }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full border" :class="costoBadge[c.tipo]">{{ c.tipo }}</span>
                <span class="text-sm font-black text-slate-800">${{ c.monto.toLocaleString('es', { minimumFractionDigits: 2 }) }}</span>
                <button aria-label="Ver detalle" class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-500 transition-all">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- ══ Calendario ══ -->
      <section class="col-span-12 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Header degradado -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings:'FILL' 1">calendar_month</span>
              <h3 class="text-base font-black text-white font-headline">Calendario de Mantenimientos</h3>
            </div>
            <p class="text-xs text-white/60 font-semibold mt-0.5">{{ mesActual }} — Programación preventiva y correctiva</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Leyenda inline -->
            <div class="hidden sm:flex gap-3 mr-3">
              <div v-for="[t, c, l] in [['preventivo','#4f6073','Preventivo'],['correctivo','#dc2626','Correctivo'],['revision','#0891b2','Revisión']]" :key="t" class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm" :style="`background:${c}`"></span>
                <span class="text-[10px] font-bold text-white/70 uppercase">{{ l }}</span>
              </div>
            </div>
            <button aria-label="Mes anterior" class="p-2 bg-white/10 hover:bg-white/25 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-white">chevron_left</span>
            </button>
            <button aria-label="Mes siguiente" class="p-2 bg-white/10 hover:bg-white/25 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-white">chevron_right</span>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-7 gap-1.5 mb-2">
            <div v-for="d in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="d"
              class="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7 gap-1.5">
            <div
              v-for="(dia, i) in diasCalendario.slice(0, 35)" :key="i"
              class="h-16 md:h-20 rounded-xl p-1.5 text-xs transition-colors"
              :class="{
                'bg-slate-50 text-slate-300':                          dia.prev || !dia.num,
                'bg-[#4f6073] text-white ring-2 ring-[#4f6073] ring-offset-2 shadow-md': !dia.prev && dia.num === today,
                'bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700': !dia.prev && dia.num && dia.num !== today,
              }"
            >
              <span v-if="dia.num" class="block font-black leading-none mb-1">{{ dia.num }}</span>
              <div v-if="dia.eventos?.length" class="space-y-0.5">
                <div
                  v-for="ev in dia.eventos.slice(0,2)" :key="ev.label"
                  class="px-1 py-0.5 text-[8px] rounded font-black leading-none flex items-center gap-0.5 truncate"
                  :class="tipoClase[ev.tipo]"
                >
                  <span class="material-symbols-outlined text-[9px]">build</span>
                  <span class="truncate">{{ ev.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    </div>
    </Transition>

    <!-- ── FAB: Uptime ── -->
    <template #fab>
      <div
        aria-label="Estado de uptime"
        role="complementary"
        class="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl z-40 p-5 max-w-[260px] border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(79,96,115,0.12)">
            <span class="material-symbols-outlined text-xl" style="color:#4f6073;font-variation-settings:'FILL' 1">electric_bolt</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de Red</p>
            <p class="text-sm font-black text-slate-800">Uptime: <span style="color:#059669">94.2%</span></p>
          </div>
        </div>
        <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2"
          role="progressbar" aria-valuenow="94" aria-valuemin="0" aria-valuemax="100">
          <div class="h-full rounded-full" style="width:94.2%;background:linear-gradient(90deg,#4f6073,#059669)"></div>
        </div>
        <p class="text-[10px] text-slate-400 font-semibold leading-relaxed">
          Eficiencia mejoró <strong class="text-emerald-600">+2.4%</strong> tras optimizar mantenimientos preventivos
        </p>
      </div>
    </template>

    <!-- ── Modal Agendar Mantenimiento ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="modalAbierto"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog" aria-modal="true" aria-label="Agendar mantenimiento"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalAbierto = false" aria-hidden="true"></div>

          <!-- Panel -->
          <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            <!-- Header -->
            <div class="px-6 py-5 flex items-center justify-between shrink-0" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-lg" style="font-variation-settings:'FILL' 1">build</span>
                </div>
                <div>
                  <h2 class="text-base font-black text-white font-headline">Agendar Mantenimiento</h2>
                  <p class="text-white/60 text-xs font-semibold">Completa los datos del servicio</p>
                </div>
              </div>
              <button @click="modalAbierto = false" aria-label="Cerrar" class="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <!-- Formulario -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">

              <!-- Error -->
              <div v-if="formError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600">
                <span class="material-symbols-outlined text-base">error</span>
                {{ formError }}
              </div>

              <!-- Fila 1: ID + Modelo -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    ID de Unidad <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.id"
                    type="text" placeholder="TRK-000"
                    @input="formError = ''"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                    :class="{ 'border-red-300 bg-red-50': formError && !form.id }"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Modelo <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.modelo"
                    type="text" placeholder="Ej: Volvo FH460"
                    @input="formError = ''"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all placeholder:text-slate-400"
                    :class="{ 'border-red-300 bg-red-50': formError && !form.modelo }"
                  />
                </div>
              </div>

              <!-- Fila 2: Tipo + Mecánico -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">Tipo de Servicio</label>
                  <select
                    v-model="form.tipo"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all"
                  >
                    <option>Preventivo</option>
                    <option>Correctivo</option>
                    <option>Revisión</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Mecánico Asignado <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.mecanico"
                    type="text" placeholder="Nombre del mecánico"
                    @input="formError = ''"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all placeholder:text-slate-400"
                    :class="{ 'border-red-300 bg-red-50': formError && !form.mecanico }"
                  />
                </div>
              </div>

              <!-- Trabajo -->
              <div>
                <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Descripción del Trabajo <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.trabajo"
                  rows="3"
                  placeholder="Describe el trabajo a realizar..."
                  @input="formError = ''"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all placeholder:text-slate-400"
                  :class="{ 'border-red-300 bg-red-50': formError && !form.trabajo }"
                ></textarea>
              </div>

              <!-- Fila 3: Ingreso + Salida estimada + Prioridad -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">Fecha Ingreso</label>
                  <input
                    v-model="form.ingreso"
                    type="date"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">Salida Estimada</label>
                  <input
                    v-model="form.salida"
                    type="text" placeholder="Ej: 20 May"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">Prioridad</label>
                  <select
                    v-model="form.prioridad"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#4f6073]/30 focus:border-[#4f6073] focus:outline-none transition-all"
                  >
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </div>
              </div>

              <!-- Preview del tipo seleccionado -->
              <div class="flex items-center gap-3 p-3 rounded-xl border" :style="`background:${colorPorTipo[form.tipo]}0d;border-color:${colorPorTipo[form.tipo]}30`">
                <span class="material-symbols-outlined text-lg" :style="`color:${colorPorTipo[form.tipo]};font-variation-settings:'FILL' 1`">
                  {{ form.tipo === 'Preventivo' ? 'event_available' : form.tipo === 'Correctivo' ? 'build' : 'fact_check' }}
                </span>
                <div>
                  <p class="text-xs font-black" :style="`color:${colorPorTipo[form.tipo]}`">{{ form.tipo }}</p>
                  <p class="text-[11px] text-slate-500 font-medium">Prioridad: {{ form.prioridad }} · Mecánico: {{ form.mecanico || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                @click="modalAbierto = false"
                class="px-5 py-2.5 text-sm font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="guardar"
                class="px-6 py-2.5 text-sm font-black text-white rounded-xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                style="background:linear-gradient(135deg,#4f6073,#3a4a5c)"
              >
                <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">check_circle</span>
                Agendar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<style scoped>
.page-fade-enter-active  { transition: all 0.45s cubic-bezier(0.16,1,0.3,1); }
.page-fade-enter-from    { opacity: 0; transform: translateY(12px); }
.modal-fade-enter-active { transition: all 0.22s ease-out; }
.modal-fade-leave-active { transition: all 0.18s ease-in; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.97) translateY(6px); }
</style>
