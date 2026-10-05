<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppLayout from '@/components/AppLayout.vue'
import AppSelect from '@/components/AppSelect.vue'
import { useUnidadesStore } from '../store/unidadesStore.js'

const opsTipo = [
  { value: 'Camión Pesado',  label: 'Camión Pesado',  icon: 'local_shipping' },
  { value: 'Camión Mediano', label: 'Camión Mediano',  icon: 'airport_shuttle' },
  { value: 'Tráiler',        label: 'Tráiler',          icon: 'local_shipping' },
  { value: 'Furgón',         label: 'Furgón',           icon: 'directions_car' },
  { value: 'Cisterna',       label: 'Cisterna',         icon: 'water_drop' },
]
const opsEstado = [
  { value: 'activo',        label: 'Activo',        icon: 'check_circle' },
  { value: 'alerta',        label: 'Alerta',        icon: 'warning'      },
  { value: 'mantenimiento', label: 'Mantenimiento', icon: 'build'        },
  { value: 'inactivo',      label: 'Inactivo',      icon: 'cancel'       },
]
const opsCombustible = [
  { value: 'Diesel',    label: 'Diesel',    icon: 'local_gas_station' },
  { value: 'Gasolina',  label: 'Gasolina',  icon: 'local_gas_station' },
  { value: 'GNV',       label: 'GNV',       icon: 'compress'          },
  { value: 'Eléctrico', label: 'Eléctrico', icon: 'bolt'              },
]

const busqueda = ref('')
const filtroEstado = ref('todos')
const modalAbierto = ref(false)
const modoEdicion = ref(false)
const unidadSeleccionada = ref(null)

// La flota vive en un store (src/modules/unidades/store/unidadesStore.js)
// para no perderse al salir de esta pantalla o cerrar sesión, y para que
// otros módulos (ej. asignación de usuarios a camiones) lean la misma lista.
const unidadesStore = useUnidadesStore()
const { unidades } = storeToRefs(unidadesStore)

const estadoConfig = {
  activo:        { label: 'Activo',        clase: 'bg-emerald-100 text-emerald-800' },
  alerta:        { label: 'Alerta',        clase: 'bg-red-100 text-red-800'         },
  mantenimiento: { label: 'Mantenimiento', clase: 'bg-amber-100 text-amber-800'     },
  inactivo:      { label: 'Inactivo',      clase: 'bg-slate-100 text-slate-600'     },
}

const contadores = computed(() => ({
  total: unidades.value.length,
  activos: unidades.value.filter(u => u.estado === 'activo').length,
  alerta: unidades.value.filter(u => u.estado === 'alerta').length,
  mantenimiento: unidades.value.filter(u => u.estado === 'mantenimiento').length,
}))

const unidadesFiltradas = computed(() => {
  let lista = unidades.value
  if (filtroEstado.value !== 'todos') lista = lista.filter(u => u.estado === filtroEstado.value)
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(u =>
      u.placa.toLowerCase().includes(q) ||
      u.modelo.toLowerCase().includes(q) ||
      u.conductor.toLowerCase().includes(q)
    )
  }
  return lista
})

const form = ref({
  placa: '', modelo: '', año: new Date().getFullYear(), tipo: 'Camión Pesado',
  estado: 'activo', conductor: '', km: 0, combustible: 'Diesel',
  capacidad: '', vencimientoSOAT: '', vencimientoRevision: '',
})

function abrirNuevo() {
  modoEdicion.value = false
  form.value = { placa: '', modelo: '', año: new Date().getFullYear(), tipo: 'Camión Pesado', estado: 'activo', conductor: '', km: 0, combustible: 'Diesel', capacidad: '', vencimientoSOAT: '', vencimientoRevision: '' }
  modalAbierto.value = true
}

function abrirEditar(u) {
  modoEdicion.value = true
  unidadSeleccionada.value = u
  form.value = { ...u }
  modalAbierto.value = true
}

function guardar() {
  if (modoEdicion.value) {
    const idx = unidades.value.findIndex(u => u.id === unidadSeleccionada.value.id)
    if (idx !== -1) unidades.value[idx] = { ...unidades.value[idx], ...form.value }
  } else {
    unidades.value.push({ ...form.value, id: Date.now(), imagen: 'directions_bus' })
  }
  modalAbierto.value = false
}

function eliminar(u) {
  if (confirm(`¿Eliminar la unidad ${u.placa}?`)) {
    unidades.value = unidades.value.filter(x => x.id !== u.id)
  }
}

function diasHasta(fecha) {
  const diff = Math.ceil((new Date(fecha) - new Date()) / 86400000)
  return diff
}

function claseFecha(fecha) {
  const d = diasHasta(fecha)
  if (d < 0)   return 'text-red-700 font-black'
  if (d < 30)  return 'text-amber-700 font-bold'
  return 'text-emerald-700 font-semibold'
}

// ── Helpers de colores ────────────────────────────────────
const _tipoConf = {
  'Camión Pesado':  { icon: 'local_shipping',  color: '#4f6073', bg: 'rgba(79,96,115,0.11)'  },
  'Camión Mediano': { icon: 'airport_shuttle',  color: '#0891b2', bg: 'rgba(8,145,178,0.11)'  },
  'Tráiler':        { icon: 'rv_hookup',        color: '#7c3aed', bg: 'rgba(124,58,237,0.11)' },
  'Furgón':         { icon: 'directions_car',   color: '#059669', bg: 'rgba(5,150,105,0.11)'  },
  'Cisterna':       { icon: 'water_drop',       color: '#d97706', bg: 'rgba(217,119,6,0.11)'  },
}
function tipoConf(tipo) {
  return _tipoConf[tipo] ?? _tipoConf['Camión Pesado']
}

const _badgeEstado = {
  activo:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
  alerta:        'bg-red-50 text-red-700 border border-red-200',
  mantenimiento: 'bg-amber-50 text-amber-700 border border-amber-200',
  inactivo:      'bg-slate-100 text-slate-500 border border-slate-200',
}
function badgeEstado(estado) {
  return _badgeEstado[estado] ?? _badgeEstado.inactivo
}

function formatKm(km) {
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k` : String(km)
}
</script>

<template>
  <AppLayout>
    <template #header-action>
      <button @click="abrirNuevo" class="flex items-center gap-2 bg-on-surface text-surface px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md" aria-label="Registrar nueva unidad">
        <span class="material-symbols-outlined text-base">add</span>
        Nueva Unidad
      </button>
    </template>

    <!-- KPI bar -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div
        v-for="[k, label, icon, color, bg] in [
          ['total',        'Total unidades',   'inventory_2',  '#4f6073', 'rgba(79,96,115,0.10)'  ],
          ['activos',      'Activos',          'check_circle', '#059669', 'rgba(5,150,105,0.10)'  ],
          ['alerta',       'Con alerta',       'warning',      '#dc2626', 'rgba(220,38,38,0.10)'  ],
          ['mantenimiento','En taller',        'build',        '#d97706', 'rgba(217,119,6,0.10)'  ],
        ]"
        :key="k"
        class="relative bg-surface rounded-2xl p-5 border border-surface-container-high overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div
          class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none"
          :style="{ background: bg, filter: 'blur(2px)' }"
          aria-hidden="true"
        ></div>
        <div class="flex items-start justify-between mb-3 relative z-10">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: bg }">
            <span class="material-symbols-outlined text-xl" :style="{ color }" style="font-variation-settings:'FILL' 1">{{ icon }}</span>
          </div>
          <span class="text-4xl font-headline font-black text-on-surface leading-none">{{ contadores[k] }}</span>
        </div>
        <p class="text-[11px] font-black text-on-surface-variant uppercase tracking-widest relative z-10">{{ label }}</p>
        <div class="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl" :style="{ background: color }"></div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 items-center mb-6 flex-wrap">
      <div class="relative flex-1 min-w-48">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar placa, modelo o conductor..."
          class="w-full pl-10 pr-4 py-2.5 text-sm"
          aria-label="Buscar unidades"
        />
      </div>
      <div role="group" aria-label="Filtrar por estado" class="flex gap-2">
        <button
          v-for="[val, label] in [['todos','Todos'],['activo','Activos'],['alerta','Alertas'],['mantenimiento','En Taller'],['inactivo','Inactivos']]"
          :key="val"
          @click="filtroEstado = val"
          :aria-pressed="filtroEstado === val"
          class="px-4 py-2.5 text-xs font-black rounded-lg border-2 uppercase transition-all"
          :class="filtroEstado === val ? 'bg-on-surface text-surface border-on-surface' : 'bg-surface border-surface-container-high text-on-surface hover:border-on-surface'"
        >{{ label }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-sm">
      <table class="w-full" role="grid" aria-label="Tabla de unidades de flota">
        <thead>
          <tr style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%);">
            <th class="text-left text-[10px] font-black uppercase tracking-widest px-5 py-4 text-white/80">Unidad</th>
            <th class="text-left text-[10px] font-black uppercase tracking-widest px-5 py-4 text-white/80 hidden md:table-cell">Tipo</th>
            <th class="text-left text-[10px] font-black uppercase tracking-widest px-5 py-4 text-white/80">Estado</th>
            <th class="text-left text-[10px] font-black uppercase tracking-widest px-5 py-4 text-white/80 hidden lg:table-cell">Conductor</th>
            <th class="text-left text-[10px] font-black uppercase tracking-widest px-5 py-4 text-white/80 hidden lg:table-cell">Odómetro</th>
            <th class="text-left text-[10px] font-black uppercase tracking-widest px-5 py-4 text-white/80 hidden xl:table-cell">SOAT · Rev. Técnica</th>
            <th class="text-right text-[10px] font-black uppercase tracking-widest px-5 py-4 text-white/80">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in unidadesFiltradas"
            :key="u.id"
            class="border-t border-surface-container-low hover:bg-surface-container/60 transition-colors group"
          >
            <!-- Unidad: ícono con color por tipo + placa + modelo -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  :style="{ background: tipoConf(u.tipo).bg }"
                >
                  <span
                    class="material-symbols-outlined text-xl"
                    :style="{ color: tipoConf(u.tipo).color }"
                    style="font-variation-settings:'FILL' 1"
                  >{{ tipoConf(u.tipo).icon }}</span>
                </div>
                <div>
                  <p class="text-sm font-black text-on-surface">{{ u.placa }}</p>
                  <p class="text-[11px] text-on-surface-variant font-semibold">{{ u.modelo }} · {{ u.año }}</p>
                </div>
              </div>
            </td>

            <!-- Tipo -->
            <td class="px-5 py-4 hidden md:table-cell">
              <span
                class="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                :style="{ color: tipoConf(u.tipo).color, background: tipoConf(u.tipo).bg }"
              >{{ u.tipo }}</span>
            </td>

            <!-- Estado -->
            <td class="px-5 py-4">
              <span
                class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide"
                :class="badgeEstado(u.estado)"
              >{{ estadoConfig[u.estado].label }}</span>
            </td>

            <!-- Conductor -->
            <td class="px-5 py-4 hidden lg:table-cell">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                <span class="text-xs text-on-surface font-semibold">{{ u.conductor }}</span>
              </div>
            </td>

            <!-- Odómetro -->
            <td class="px-5 py-4 hidden lg:table-cell">
              <div class="flex items-center gap-1">
                <span class="text-sm font-black text-on-surface">{{ formatKm(u.km) }}</span>
                <span class="text-[10px] text-on-surface-variant font-bold">km</span>
              </div>
            </td>

            <!-- SOAT + Rev. Técnica -->
            <td class="px-5 py-4 hidden xl:table-cell">
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] font-black text-on-surface-variant uppercase tracking-wide w-8">SOAT</span>
                  <span class="text-[11px] font-bold" :class="claseFecha(u.vencimientoSOAT)">{{ u.vencimientoSOAT }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] font-black text-on-surface-variant uppercase tracking-wide w-8">Rev.</span>
                  <span class="text-[11px] font-bold" :class="claseFecha(u.vencimientoRevision)">{{ u.vencimientoRevision }}</span>
                </div>
              </div>
            </td>

            <!-- Acciones -->
            <td class="px-5 py-4">
              <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="abrirEditar(u)"
                  class="p-2 rounded-lg hover:bg-surface-container-high transition-all"
                  :aria-label="`Editar unidad ${u.placa}`"
                >
                  <span class="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
                </button>
                <button
                  @click="eliminar(u)"
                  class="p-2 rounded-lg hover:bg-red-50 transition-all"
                  :aria-label="`Eliminar unidad ${u.placa}`"
                >
                  <span class="material-symbols-outlined text-red-400 text-[18px]">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="unidadesFiltradas.length === 0" class="py-20 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-6xl block mb-3 opacity-40">search_off</span>
        <p class="text-sm font-bold">No se encontraron unidades</p>
        <p class="text-xs mt-1 opacity-60">Intenta con otra placa, modelo o filtro</p>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="modalAbierto"
        role="dialog"
        :aria-modal="true"
        :aria-label="modoEdicion ? 'Editar unidad' : 'Registrar nueva unidad'"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalAbierto = false" aria-hidden="true"></div>
        <div class="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-surface-container-high">
          <div class="flex justify-between items-center px-7 py-5 sticky top-0 z-10 rounded-t-2xl" style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%);">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-xl">{{ modoEdicion ? 'edit' : 'directions_bus' }}</span>
              </div>
              <h2 class="text-lg font-black text-white font-headline tracking-tight">
                {{ modoEdicion ? `Editar ${form.placa}` : 'Nueva Unidad' }}
              </h2>
            </div>
            <button @click="modalAbierto = false" aria-label="Cerrar modal" class="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="guardar" class="p-6 grid grid-cols-2 gap-5" novalidate>
            <div class="col-span-2 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <div>
                <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-placa">Placa *</label>
                <input id="f-placa" v-model="form.placa" required placeholder="TK-0000" class="w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-modelo">Modelo *</label>
                <input id="f-modelo" v-model="form.modelo" required placeholder="Volvo FH16" class="w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-año">Año</label>
                <input id="f-año" v-model.number="form.año" type="number" min="1990" :max="new Date().getFullYear()+1" class="w-full px-3 py-2.5 text-sm" />
              </div>
            </div>

            <div>
              <AppSelect v-model="form.tipo"    :options="opsTipo"     label="Tipo de Vehículo" />
            </div>
            <div>
              <AppSelect v-model="form.estado"  :options="opsEstado"   label="Estado" />
            </div>

            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-conductor">Conductor Asignado</label>
              <input id="f-conductor" v-model="form.conductor" placeholder="Nombre del conductor" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-km">Odómetro (km)</label>
              <input id="f-km" v-model.number="form.km" type="number" min="0" class="w-full px-3 py-2.5 text-sm" />
            </div>

            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-capacidad">Capacidad de Carga</label>
              <input id="f-capacidad" v-model="form.capacidad" placeholder="25 ton" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <AppSelect v-model="form.combustible" :options="opsCombustible" label="Combustible" />
            </div>

            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-soat">Venc. SOAT</label>
              <input id="f-soat" v-model="form.vencimientoSOAT" type="date" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="f-revision">Venc. Revisión Técnica</label>
              <input id="f-revision" v-model="form.vencimientoRevision" type="date" class="w-full px-3 py-2.5 text-sm" />
            </div>

            <div class="col-span-2 flex gap-3 justify-end pt-4 border-t border-surface-container-low">
              <button type="button" @click="modalAbierto = false" class="px-6 py-2.5 border-2 border-surface-container-high rounded-lg text-sm font-black text-on-surface hover:bg-surface-container transition-all">Cancelar</button>
              <button type="submit" class="px-8 py-2.5 bg-on-surface text-surface rounded-lg text-sm font-black hover:opacity-90 active:scale-95 transition-all shadow-md">
                {{ modoEdicion ? 'Guardar Cambios' : 'Registrar Unidad' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
