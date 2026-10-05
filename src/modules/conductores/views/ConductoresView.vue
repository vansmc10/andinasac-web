<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppLayout from '@/components/AppLayout.vue'
import AppSelect from '@/components/AppSelect.vue'
import { useConductoresStore } from '../store/conductoresStore.js'

const opsLicencia = [
  { value: 'A-I',    label: 'A-I    — Motos',            icon: 'two_wheeler'    },
  { value: 'A-IIa',  label: 'A-IIa  — Auto (<3,500 kg)', icon: 'directions_car' },
  { value: 'A-IIb',  label: 'A-IIb  — Auto + remolque',  icon: 'directions_car' },
  { value: 'A-IIIa', label: 'A-IIIa — Camión (<10 ton)', icon: 'local_shipping' },
  { value: 'A-IIIb', label: 'A-IIIb — Camión pesado',    icon: 'local_shipping' },
  { value: 'A-IIIc', label: 'A-IIIc — Articulado',       icon: 'local_shipping' },
]
const opsEstadoConductor = [
  { value: 'activo',   label: 'Activo',   icon: 'check_circle' },
  { value: 'descanso', label: 'Descanso', icon: 'bedtime'      },
  { value: 'inactivo', label: 'Inactivo', icon: 'cancel'       },
]

const busqueda = ref('')
const filtroEstado = ref('todos')
const modalAbierto = ref(false)
const modoEdicion = ref(false)
const conductorSeleccionado = ref(null)

// Los conductores viven en un store compartido (src/modules/conductores/store)
// para que otros módulos, como el registro de carga de combustible en
// Consumo, puedan listar los mismos conductores registrados aquí.
const conductoresStore = useConductoresStore()
const { conductores } = storeToRefs(conductoresStore)

const estadoConfig = {
  activo:   { label: 'Activo',    clase: 'bg-emerald-100 text-emerald-800' },
  descanso: { label: 'Descanso',  clase: 'bg-blue-100 text-blue-800'       },
  inactivo: { label: 'Inactivo',  clase: 'bg-slate-100 text-slate-600'     },
}

const contadores = computed(() => ({
  total: conductores.value.length,
  activos: conductores.value.filter(c => c.estado === 'activo').length,
  descanso: conductores.value.filter(c => c.estado === 'descanso').length,
  vencen: conductores.value.filter(c => {
    const dias = Math.ceil((new Date(c.vencLicencia) - new Date()) / 86400000)
    return dias < 30
  }).length,
}))

const conductoresFiltrados = computed(() => {
  let lista = conductores.value
  if (filtroEstado.value !== 'todos') lista = lista.filter(c => c.estado === filtroEstado.value)
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.codigo.toLowerCase().includes(q) ||
      c.dni.includes(q)
    )
  }
  return lista
})

const form = ref({
  codigo: '', nombre: '', dni: '', telefono: '', email: '',
  licencia: 'A-IIIb', vencLicencia: '', estado: 'activo', unidad: '',
})

function abrirNuevo() {
  modoEdicion.value = false
  form.value = { codigo: '', nombre: '', dni: '', telefono: '', email: '', licencia: 'A-IIIb', vencLicencia: '', estado: 'activo', unidad: '' }
  modalAbierto.value = true
}

function abrirEditar(c) {
  modoEdicion.value = true
  conductorSeleccionado.value = c
  form.value = { ...c }
  modalAbierto.value = true
}

function guardar() {
  if (modoEdicion.value) {
    const idx = conductores.value.findIndex(c => c.id === conductorSeleccionado.value.id)
    if (idx !== -1) conductores.value[idx] = { ...conductores.value[idx], ...form.value }
  } else {
    conductores.value.push({ ...form.value, id: Date.now(), km: 0, viajes: 0, calificacion: 0, foto: 'person' })
  }
  modalAbierto.value = false
}

function eliminar(c) {
  if (confirm(`¿Eliminar el conductor ${c.nombre}?`)) {
    conductores.value = conductores.value.filter(x => x.id !== c.id)
  }
}

function claseFecha(fecha) {
  const d = Math.ceil((new Date(fecha) - new Date()) / 86400000)
  if (d < 0)   return 'text-red-700 font-black'
  if (d < 30)  return 'text-amber-700 font-bold'
  return 'text-emerald-700 font-semibold'
}

function estrellas(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))
}

// ── Helpers de diseño de cards ────────────────────────────
const _gradientes = [
  ['#4f6073','#3a4a5c'], ['#7c3aed','#4c1d95'], ['#0891b2','#0e7490'],
  ['#b45309','#78350f'], ['#1d4ed8','#1e3a8a'], ['#be185d','#831843'],
]
function avatarGradient(id) {
  const [a, b] = _gradientes[(id - 1) % _gradientes.length]
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
}
function iniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function formatKm(km) {
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k` : String(km)
}
function accentEstado(estado) {
  return { activo: 'bg-emerald-500', descanso: 'bg-blue-500', inactivo: 'bg-slate-400' }[estado]
}
function badgeEstado(estado) {
  return {
    activo:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    descanso: 'bg-blue-50   text-blue-700   border-blue-200',
    inactivo: 'bg-slate-100 text-slate-600  border-slate-200',
  }[estado]
}
</script>

<template>
  <AppLayout>
    <template #header-action>
      <button @click="abrirNuevo" class="flex items-center gap-2 bg-on-surface text-surface px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md" aria-label="Registrar nuevo conductor">
        <span class="material-symbols-outlined text-base">person_add</span>
        Nuevo Conductor
      </button>
    </template>

    <!-- KPIs -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div
        v-for="[k, label, icon, color, bg] in [
          ['total',   'Total conductores', 'group',        '#4f6073', 'rgba(79,96,115,0.10)'],
          ['activos', 'Activos',           'check_circle', '#059669', 'rgba(5,150,105,0.10)'],
          ['descanso','En descanso',       'bedtime',      '#2563eb', 'rgba(37,99,235,0.10)'],
          ['vencen',  'Licencias próx.',   'badge',        '#d97706', 'rgba(217,119,6,0.10)'],
        ]"
        :key="k"
        class="relative bg-surface rounded-2xl p-5 border border-surface-container-high overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- Fondo decorativo círculo difuminado -->
        <div
          class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none"
          :style="{ background: bg, filter: 'blur(2px)' }"
          aria-hidden="true"
        ></div>

        <!-- Fila superior: ícono coloreado + número -->
        <div class="flex items-start justify-between mb-3 relative z-10">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="{ background: bg }"
          >
            <span
              class="material-symbols-outlined text-xl"
              :style="{ color }"
              style="font-variation-settings:'FILL' 1"
            >{{ icon }}</span>
          </div>
          <span class="text-4xl font-headline font-black text-on-surface leading-none">{{ contadores[k] }}</span>
        </div>

        <!-- Label + línea inferior de acento -->
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
          placeholder="Buscar nombre, código o DNI..."
          class="w-full pl-10 pr-4 py-2.5 text-sm"
          aria-label="Buscar conductores"
        />
      </div>
      <div role="group" aria-label="Filtrar por estado" class="flex gap-2">
        <button
          v-for="[val, label] in [['todos','Todos'],['activo','Activos'],['descanso','Descanso'],['inactivo','Inactivos']]"
          :key="val"
          @click="filtroEstado = val"
          :aria-pressed="filtroEstado === val"
          class="px-4 py-2.5 text-xs font-black rounded-lg border-2 uppercase transition-all"
          :class="filtroEstado === val ? 'bg-on-surface text-surface border-on-surface' : 'bg-surface border-surface-container-high text-on-surface hover:border-on-surface'"
        >{{ label }}</button>
      </div>
    </div>

    <!-- Grid cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <article
        v-for="c in conductoresFiltrados"
        :key="c.id"
        class="bg-surface rounded-2xl border border-surface-container-high shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
      >
        <!-- Franja de color por estado (top) -->
        <div class="h-1 w-full" :class="accentEstado(c.estado)"></div>

        <div class="p-5">
          <!-- ── Header: Avatar + Nombre + Badge ── -->
          <div class="flex items-start gap-3 mb-5">
            <!-- Avatar con iniciales + gradiente -->
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md select-none"
              :style="{ background: avatarGradient(c.id) }"
              aria-hidden="true"
            >{{ iniciales(c.nombre) }}</div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start gap-2">
                <div class="min-w-0">
                  <h3 class="text-sm font-black text-on-surface leading-snug truncate">{{ c.nombre }}</h3>
                  <p class="text-[11px] text-on-surface-variant font-bold mt-0.5">{{ c.codigo }} · {{ c.licencia }}</p>
                </div>
                <span
                  class="text-[9px] font-black px-2.5 py-1 rounded-full uppercase border shrink-0 tracking-wide"
                  :class="badgeEstado(c.estado)"
                >{{ estadoConfig[c.estado].label }}</span>
              </div>
              <!-- Estrellas debajo del nombre -->
              <div class="flex items-center gap-1.5 mt-2">
                <span class="text-amber-400 text-[13px] leading-none tracking-tighter" :aria-label="`${c.calificacion} de 5 estrellas`">{{ estrellas(c.calificacion) }}</span>
                <span class="text-[11px] font-black text-on-surface">{{ c.calificacion }}</span>
              </div>
            </div>
          </div>

          <!-- ── Strip de 3 métricas ── -->
          <div class="grid grid-cols-3 rounded-xl overflow-hidden border border-surface-container-high mb-4 bg-surface-container">
            <div class="py-3 text-center">
              <p class="text-base font-headline font-black text-on-surface leading-none">{{ formatKm(c.km) }}</p>
              <p class="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1">km</p>
            </div>
            <div class="py-3 text-center border-x border-surface-container-high">
              <p class="text-base font-headline font-black text-on-surface leading-none">{{ c.viajes }}</p>
              <p class="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Viajes</p>
            </div>
            <div class="py-3 text-center">
              <p class="text-base font-headline font-black text-on-surface leading-none">{{ c.calificacion }}</p>
              <p class="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Rating</p>
            </div>
          </div>

          <!-- ── Info: unidad · vencimiento · teléfono ── -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">local_shipping</span>
              <span class="text-[11px] text-on-surface-variant font-bold flex-1">Unidad asignada</span>
              <span class="text-xs font-black text-on-surface">{{ c.unidad }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">event_available</span>
              <span class="text-[11px] text-on-surface-variant font-bold flex-1">Venc. licencia</span>
              <span class="text-xs font-bold" :class="claseFecha(c.vencLicencia)">{{ c.vencLicencia }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">phone</span>
              <span class="text-[11px] text-on-surface-variant font-bold flex-1">Teléfono</span>
              <span class="text-xs font-black text-on-surface">{{ c.telefono }}</span>
            </div>
          </div>

          <!-- ── Footer: email + acciones ── -->
          <div class="flex justify-between items-center pt-3 border-t border-surface-container-low">
            <p class="flex items-center gap-1 text-[10px] text-on-surface-variant font-bold truncate max-w-[55%]">
              <span class="material-symbols-outlined text-[13px]">mail</span>
              <span class="truncate">{{ c.email }}</span>
            </p>
            <div class="flex gap-1">
              <button
                @click="abrirEditar(c)"
                class="p-2 rounded-lg bg-surface-container opacity-0 group-hover:opacity-100 hover:bg-surface-container-high transition-all"
                :aria-label="`Editar conductor ${c.nombre}`"
              >
                <span class="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
              </button>
              <button
                @click="eliminar(c)"
                class="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                :aria-label="`Eliminar conductor ${c.nombre}`"
              >
                <span class="material-symbols-outlined text-red-400 text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      <!-- Estado vacío -->
      <div v-if="conductoresFiltrados.length === 0" class="col-span-full py-20 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style="background:rgba(79,96,115,0.10)">
          <span class="material-symbols-outlined text-3xl" style="color:#4f6073;font-variation-settings:'FILL' 1">person_search</span>
        </div>
        <p class="font-black text-slate-700 text-base">Sin conductores encontrados</p>
        <p class="text-xs text-slate-400 mt-1 max-w-xs">No hay resultados para los filtros aplicados. Intenta con otro nombre, código o estado.</p>
        <button
          @click="busqueda = ''; filtroEstado = 'todos'"
          class="mt-5 text-sm font-black px-5 py-2.5 rounded-xl border-2 transition-all hover:bg-[#4f6073] hover:text-white"
          style="color:#4f6073;border-color:#4f6073"
        >
          <span class="material-symbols-outlined text-sm align-middle mr-1">filter_list_off</span>
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="modalAbierto"
        role="dialog"
        :aria-modal="true"
        :aria-label="modoEdicion ? 'Editar conductor' : 'Registrar nuevo conductor'"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalAbierto = false" aria-hidden="true"></div>
        <div class="relative bg-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border-2 border-surface-container-high">
          <div class="flex justify-between items-center px-7 py-5 sticky top-0 z-10 rounded-t-2xl" style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%);">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-xl">{{ modoEdicion ? 'edit' : 'person_add' }}</span>
              </div>
              <h2 class="text-lg font-black text-white font-headline tracking-tight">
                {{ modoEdicion ? `Editar ${form.nombre}` : 'Nuevo Conductor' }}
              </h2>
            </div>
            <button @click="modalAbierto = false" aria-label="Cerrar modal" class="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="guardar" class="p-6 grid grid-cols-2 gap-5" novalidate>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="fc-codigo">Código</label>
              <input id="fc-codigo" v-model="form.codigo" placeholder="CON-007" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="fc-nombre">Nombre Completo *</label>
              <input id="fc-nombre" v-model="form.nombre" required placeholder="Juan Pérez García" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="fc-dni">DNI *</label>
              <input id="fc-dni" v-model="form.dni" required maxlength="8" placeholder="12345678" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="fc-telefono">Teléfono</label>
              <input id="fc-telefono" v-model="form.telefono" placeholder="987-654-321" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div class="col-span-2">
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="fc-email">Correo Electrónico</label>
              <input id="fc-email" v-model="form.email" type="email" placeholder="nombre@andina.com" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <AppSelect v-model="form.licencia" :options="opsLicencia" label="Tipo de Licencia" :searchable="false" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="fc-venc">Vencimiento Licencia</label>
              <input id="fc-venc" v-model="form.vencLicencia" type="date" class="w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <AppSelect v-model="form.estado" :options="opsEstadoConductor" label="Estado" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2" for="fc-unidad">Unidad Asignada</label>
              <input id="fc-unidad" v-model="form.unidad" placeholder="TK-0000 ó —" class="w-full px-3 py-2.5 text-sm" />
            </div>

            <div class="col-span-2 flex gap-3 justify-end pt-4 border-t border-surface-container-low">
              <button type="button" @click="modalAbierto = false" class="px-6 py-2.5 border-2 border-surface-container-high rounded-lg text-sm font-black text-on-surface hover:bg-surface-container transition-all">Cancelar</button>
              <button type="submit" class="px-8 py-2.5 bg-on-surface text-surface rounded-lg text-sm font-black hover:opacity-90 active:scale-95 transition-all shadow-md">
                {{ modoEdicion ? 'Guardar Cambios' : 'Registrar Conductor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
