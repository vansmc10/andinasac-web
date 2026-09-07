<script setup>
import AppLayout from '@/components/AppLayout.vue'
import { ref, onMounted } from 'vue'

// Animación de entrada
const loaded = ref(false)
onMounted(() => setTimeout(() => { loaded.value = true }, 120))

const kpis = [
  {
    label: 'Unidades Activas', value: '124', sub: 'vehículos',
    icon: 'directions_bus', color: '#4f6073', bg: 'rgba(79,96,115,0.10)',
    trend: '+5.2% este mes', trendIcon: 'trending_up', pos: true,
  },
  {
    label: 'Consumo Promedio', value: '3.8', sub: 'Gal/km',
    icon: 'local_gas_station', color: '#0891b2', bg: 'rgba(8,145,178,0.10)',
    trend: '-0.4 vs mes pasado', trendIcon: 'trending_down', pos: false,
  },
  {
    label: 'Alertas Críticas', value: '12', sub: 'activas',
    icon: 'warning', color: '#dc2626', bg: 'rgba(220,38,38,0.10)',
    trend: 'Requieren atención', trendIcon: 'priority_high', pos: false,
  },
  {
    label: 'Productividad', value: '94%', sub: 'semanal',
    icon: 'trending_up', color: '#059669', bg: 'rgba(5,150,105,0.10)',
    trend: 'Estado: Óptimo', trendIcon: 'check_circle', pos: true,
  },
]

const alertas = [
  { icon: 'local_gas_station', color: '#dc2626', bg: 'bg-red-50',   border: 'border-red-500',    titulo: 'Desvío de combustible',  desc: 'Unidad #452 — parada no autorizada.',         prioridad: 'Crítica',     pColor: 'text-red-600'    },
  { icon: 'build',             color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-500',  titulo: 'Mantenimiento próximo',   desc: 'Unidad #221 — 10 000 km para servicio.',      prioridad: 'Media',       pColor: 'text-amber-600'  },
  { icon: 'timer',             color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-500',  titulo: 'Ralentí excesivo',        desc: 'Conductor J. Pérez — 25 min en zona descarga.',prioridad: 'Baja',        pColor: 'text-amber-600'  },
  { icon: 'check_circle',      color: '#0891b2', bg: 'bg-blue-50',  border: 'border-blue-500',   titulo: 'Ruta completada',         desc: 'Unidad #110 — entrega exitosa Centro Norte.',  prioridad: 'Informativa', pColor: 'text-blue-600'   },
]
</script>

<template>
  <AppLayout>
    <Transition name="page-fade" appear>
      <div v-if="loaded">

        <!-- ── Header ── -->
        <header class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <p class="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Panel de Control</p>
            <h2 class="text-3xl font-black tracking-tight text-on-surface font-headline">Visión General de Flota</h2>
            <p class="text-on-surface-variant font-medium mt-1 text-sm">Resumen operativo en tiempo real — {{ new Date().toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long' }) }}</p>
          </div>
          <RouterLink
            to="/reportes"
            class="flex items-center gap-2 text-white px-6 py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all font-bold text-sm min-h-[48px] self-start sm:self-auto"
            style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)"
          >
            <span class="material-symbols-outlined text-lg" style="font-variation-settings:'FILL' 1">assessment</span>
            Ver Reportes
          </RouterLink>
        </header>

        <!-- ── KPI Cards ── -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" role="region" aria-label="Indicadores clave de desempeño">
          <div
            v-for="k in kpis" :key="k.label"
            class="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            :style="{ borderBottom: `3px solid ${k.color}` }"
          >
            <!-- Blur -->
            <div class="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-50" :style="`background:${k.color}`"></div>

            <div class="relative flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center" :style="`background:${k.bg}`">
                <span class="material-symbols-outlined text-xl" :style="`color:${k.color};font-variation-settings:'FILL' 1`">{{ k.icon }}</span>
              </div>
            </div>

            <p class="text-2xl font-black text-slate-800 font-headline">{{ k.value }}</p>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{{ k.label }}</p>
            <p class="text-[11px] text-slate-400 font-semibold mt-0.5">{{ k.sub }}</p>

            <div class="flex items-center gap-1 mt-3" :class="k.pos ? 'text-emerald-600' : k.color === '#dc2626' ? 'text-red-500' : 'text-slate-500'">
              <span class="material-symbols-outlined text-sm">{{ k.trendIcon }}</span>
              <span class="text-[11px] font-bold">{{ k.trend }}</span>
            </div>
          </div>
        </div>

        <!-- ── Mapa + Alertas ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Mapa preview -->
          <section
            aria-labelledby="map-section-title"
            class="lg:col-span-2 relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
            style="background:linear-gradient(135deg,#e8edf1 0%,#d4dce3 100%);min-height:320px"
          >
            <h3 id="map-section-title" class="sr-only">Vista previa del mapa de flota</h3>

            <!-- Fondo decorativo estilo mapa -->
            <div class="absolute inset-0 opacity-20" style="background-image:repeating-linear-gradient(0deg,transparent,transparent 40px,#94a3b8 40px,#94a3b8 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#94a3b8 40px,#94a3b8 41px)"></div>

            <!-- Marcadores simulados -->
            <div class="absolute top-[38%] left-[32%]">
              <div class="w-4 h-4 rounded-full border-2 border-white shadow-md relative" style="background:#4f6073">
                <div class="w-4 h-4 rounded-full animate-ping absolute inset-0 opacity-40" style="background:#4f6073"></div>
              </div>
            </div>
            <div class="absolute top-[55%] left-[58%]">
              <div class="w-4 h-4 rounded-full border-2 border-white shadow-md" style="background:#059669"></div>
            </div>
            <div class="absolute top-[25%] left-[68%]">
              <div class="w-4 h-4 rounded-full border-2 border-white shadow-md" style="background:#dc2626"></div>
            </div>
            <div class="absolute top-[65%] left-[22%]">
              <div class="w-4 h-4 rounded-full border-2 border-white shadow-md relative" style="background:#4f6073">
                <div class="w-4 h-4 rounded-full animate-ping absolute inset-0 opacity-40" style="background:#4f6073"></div>
              </div>
            </div>
            <div class="absolute top-[45%] left-[50%]">
              <div class="w-3 h-3 rounded-full border-2 border-white shadow-md" style="background:#94a3b8"></div>
            </div>

            <!-- Overlay info -->
            <div class="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between" style="background:linear-gradient(to top,rgba(30,41,59,0.75),transparent)">
              <div>
                <p class="text-white text-sm font-black font-headline">Mapa en Vivo</p>
                <div class="flex items-center gap-4 mt-1">
                  <span class="flex items-center gap-1.5 text-xs font-bold text-white/80">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>132 en ruta
                  </span>
                  <span class="flex items-center gap-1.5 text-xs font-bold text-white/80">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>3 alertas
                  </span>
                  <span class="flex items-center gap-1.5 text-xs font-bold text-white/80">
                    <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>13 parados
                  </span>
                </div>
              </div>
              <RouterLink
                to="/mapa"
                class="flex items-center gap-2 bg-white/95 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-white transition-colors shadow"
              >
                <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">open_in_full</span>
                Ver mapa completo
              </RouterLink>
            </div>
          </section>

          <!-- Alertas recientes -->
          <section aria-labelledby="alerts-title" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div class="flex justify-between items-center px-5 py-4" style="background:linear-gradient(135deg,#4f6073 0%,#3a4a5c 100%)">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-white text-lg" style="font-variation-settings:'FILL' 1">notifications_active</span>
                <h3 id="alerts-title" class="text-sm font-black text-white font-headline">Alertas Recientes</h3>
              </div>
              <button class="text-white/70 text-xs font-bold hover:text-white transition-colors uppercase tracking-wide">Ver todas</button>
            </div>

            <div class="flex-1 divide-y divide-slate-100 overflow-y-auto">
              <article
                v-for="a in alertas" :key="a.titulo"
                class="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                :class="a.bg"
                role="alert"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :style="`background:${a.color}18`">
                  <span class="material-symbols-outlined text-base" :style="`color:${a.color};font-variation-settings:'FILL' 1`">{{ a.icon }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-slate-800">{{ a.titulo }}</p>
                  <p class="text-xs text-slate-500 mt-0.5 leading-snug">{{ a.desc }}</p>
                  <span class="text-[10px] font-black uppercase tracking-wide mt-1 block" :class="a.pColor">
                    Prioridad: {{ a.prioridad }}
                  </span>
                </div>
              </article>
            </div>
          </section>
        </div>

      </div>
    </Transition>

    <!-- FAB -->
    <template #fab>
      <button
        aria-label="Agregar nuevo elemento a la flota"
        class="fixed bottom-10 right-10 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-50 focus:ring-4 focus:ring-[#4f6073]/40"
        style="background:linear-gradient(135deg,#4f6073,#3a4a5c)"
      >
        <span class="material-symbols-outlined text-2xl" aria-hidden="true">add</span>
      </button>
    </template>
  </AppLayout>
</template>

<style scoped>
.page-fade-enter-active { transition: all 0.45s cubic-bezier(0.16,1,0.3,1); }
.page-fade-enter-from   { opacity: 0; transform: translateY(12px); }
</style>
