<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore.js'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()

// ─────────────────────────────────────────
// USUARIO
// ─────────────────────────────────────────

const userName = computed(() => {
  return authStore.user?.name || 'Controlador de Rutas'
})

// ─────────────────────────────────────────
// DATOS OPERATIVOS DEMO
// ─────────────────────────────────────────

const unidadesEnRuta = 18
const rutasActivas = 12
const alertasActivas = 3
const incidencias = 2
</script>

<template>
  <AppLayout>

    <!-- ═════════════════════════════════════ -->
    <!-- ENCABEZADO -->
    <!-- ═════════════════════════════════════ -->

    <div
      class="bg-white border-b border-slate-200 px-6 py-5 -mx-5 md:-mx-10 -mt-5 md:-mt-10 mb-6"
    >

      <div class="max-w-7xl mx-auto">

        <div class="flex items-start justify-between gap-4">

          <div>

            <p
              class="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1"
            >
              Panel de control de rutas
            </p>

            <h1 class="text-2xl font-black text-slate-800">
              Hola, {{ userName }}
            </h1>

            <p class="text-sm text-slate-500 mt-1">
              Supervisa el estado de las rutas y unidades en operación.
            </p>

          </div>

          <!-- ESTADO -->

          <div
            class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold"
          >

            <span
              class="w-2 h-2 rounded-full bg-emerald-500"
            ></span>

            Sistema operativo

          </div>

        </div>

      </div>

    </div>

    <!-- ═════════════════════════════════════ -->
    <!-- CONTENIDO -->
    <!-- ═════════════════════════════════════ -->

    <div class="max-w-7xl mx-auto">

      <!-- ═══════════════════════════════════ -->
      <!-- INDICADORES OPERATIVOS -->
      <!-- ═══════════════════════════════════ -->

      <section class="mb-6">

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >

          <!-- UNIDADES EN RUTA -->

          <div
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          >

            <div class="flex items-center justify-between">

              <div
                class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center"
              >

                <span
                  class="material-symbols-outlined text-blue-600"
                >
                  local_shipping
                </span>

              </div>

              <span
                class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"
              >
                En ruta
              </span>

            </div>

            <p class="text-3xl font-black text-slate-800 mt-4">
              {{ unidadesEnRuta }}
            </p>

            <p
              class="text-xs font-black uppercase tracking-wide text-slate-400 mt-1"
            >
              Unidades en ruta
            </p>

            <p class="text-xs text-slate-500 mt-2">
              Unidades actualmente operativas
            </p>

          </div>

          <!-- RUTAS ACTIVAS -->

          <div
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          >

            <div class="flex items-center justify-between">

              <div
                class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center"
              >

                <span
                  class="material-symbols-outlined text-emerald-600"
                >
                  route
                </span>

              </div>

              <span
                class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"
              >
                Activas
              </span>

            </div>

            <p class="text-3xl font-black text-slate-800 mt-4">
              {{ rutasActivas }}
            </p>

            <p
              class="text-xs font-black uppercase tracking-wide text-slate-400 mt-1"
            >
              Rutas activas
            </p>

            <p class="text-xs text-slate-500 mt-2">
              Servicios en seguimiento
            </p>

          </div>

          <!-- ALERTAS -->

          <div
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          >

            <div class="flex items-center justify-between">

              <div
                class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center"
              >

                <span
                  class="material-symbols-outlined text-red-600"
                >
                  notifications_active
                </span>

              </div>

              <span
                class="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full"
              >
                Atención
              </span>

            </div>

            <p class="text-3xl font-black text-slate-800 mt-4">
              {{ alertasActivas }}
            </p>

            <p
              class="text-xs font-black uppercase tracking-wide text-slate-400 mt-1"
            >
              Alertas activas
            </p>

            <p class="text-xs text-slate-500 mt-2">
              Requieren supervisión
            </p>

          </div>

          <!-- INCIDENCIAS -->

          <div
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          >

            <div class="flex items-center justify-between">

              <div
                class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center"
              >

                <span
                  class="material-symbols-outlined text-amber-600"
                >
                  warning
                </span>

              </div>

              <span
                class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full"
              >
                Pendientes
              </span>

            </div>

            <p class="text-3xl font-black text-slate-800 mt-4">
              {{ incidencias }}
            </p>

            <p
              class="text-xs font-black uppercase tracking-wide text-slate-400 mt-1"
            >
              Incidencias
            </p>

            <p class="text-xs text-slate-500 mt-2">
              Casos pendientes de atención
            </p>

          </div>

        </div>

      </section>

      <!-- ═══════════════════════════════════ -->
      <!-- MAPA + ALERTAS -->
      <!-- ═══════════════════════════════════ -->

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        <!-- ═════════════════════════════════ -->
        <!-- MAPA OPERATIVO -->
        <!-- ═════════════════════════════════ -->

        <section
          class="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >

          <div
            class="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
          >

            <div>

              <h2 class="text-lg font-black text-slate-800">
                Seguimiento de unidades
              </h2>

              <p class="text-sm text-slate-500 mt-1">
                Vista general de las unidades actualmente en ruta.
              </p>

            </div>

            <span
              class="flex items-center gap-2 text-xs font-bold text-emerald-600"
            >

              <span
                class="w-2 h-2 rounded-full bg-emerald-500"
              ></span>

              Actualizado ahora

            </span>

          </div>

          <!-- MAPA SIMULADO -->

          <div
            class="relative h-[360px] overflow-hidden"
            style="
              background-color:#e8eef2;
              background-image:
                linear-gradient(#d3dde3 1px, transparent 1px),
                linear-gradient(90deg, #d3dde3 1px, transparent 1px);
              background-size:40px 40px;
            "
          >

            <!-- RUTA 1 -->

            <div
              class="absolute left-[12%] top-[68%] w-[70%] h-1 bg-blue-500 rotate-[-18deg] rounded-full"
            ></div>

            <!-- RUTA 2 -->

            <div
              class="absolute left-[35%] top-[25%] w-[50%] h-1 bg-emerald-500 rotate-[20deg] rounded-full"
            ></div>

            <!-- UNIDAD 1 -->

            <div
              class="absolute left-[24%] top-[60%] w-9 h-9 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center"
            >

              <span
                class="material-symbols-outlined text-white text-sm"
              >
                local_shipping
              </span>

            </div>

            <!-- UNIDAD 2 -->

            <div
              class="absolute left-[58%] top-[42%] w-9 h-9 rounded-full bg-emerald-600 border-4 border-white shadow-lg flex items-center justify-center"
            >

              <span
                class="material-symbols-outlined text-white text-sm"
              >
                local_shipping
              </span>

            </div>

            <!-- UNIDAD 3 -->

            <div
              class="absolute left-[72%] top-[65%] w-9 h-9 rounded-full bg-red-600 border-4 border-white shadow-lg flex items-center justify-center"
            >

              <span
                class="material-symbols-outlined text-white text-sm"
              >
                warning
              </span>

            </div>

            <!-- UNIDAD 4 -->

            <div
              class="absolute left-[48%] top-[75%] w-9 h-9 rounded-full bg-amber-500 border-4 border-white shadow-lg flex items-center justify-center"
            >

              <span
                class="material-symbols-outlined text-white text-sm"
              >
                local_shipping
              </span>

            </div>

            <!-- LEYENDA -->

            <div
              class="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl shadow-md px-4 py-3"
            >

              <p
                class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2"
              >
                Estado de unidades
              </p>

              <div class="flex flex-wrap gap-4">

                <span class="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  En movimiento
                </span>

                <span class="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Detenida
                </span>

                <span class="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Alerta
                </span>

              </div>

            </div>

            <!-- BOTÓN MAPA -->

            <button
              type="button"
              class="absolute right-4 bottom-4 bg-white text-slate-700 px-4 py-2.5 rounded-xl shadow-md text-xs font-bold hover:bg-slate-50 transition"
            >

              <span class="material-symbols-outlined text-sm align-middle mr-1">
                open_in_full
              </span>

              Ver mapa completo

            </button>

          </div>

        </section>

        <!-- ═════════════════════════════════ -->
        <!-- ALERTAS -->
        <!-- ═════════════════════════════════ -->

        <section
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >

          <div
            class="px-5 py-5 border-b border-slate-100 flex items-center justify-between"
          >

            <div>

              <h2 class="text-lg font-black text-slate-800">
                Alertas activas
              </h2>

              <p class="text-xs text-slate-500 mt-1">
                Requieren seguimiento
              </p>

            </div>

            <span
              class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"
            >

              <span
                class="material-symbols-outlined text-red-600 text-lg"
              >
                notifications_active
              </span>

            </span>

          </div>

          <div>

            <!-- ALERTA CRÍTICA -->

            <div
              class="p-4 border-b border-slate-100 bg-red-50/60"
            >

              <div class="flex gap-3">

                <div
                  class="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0"
                >

                  <span
                    class="material-symbols-outlined text-red-600"
                  >
                    warning
                  </span>

                </div>

                <div class="min-w-0">

                  <div class="flex items-center justify-between gap-2">

                    <p class="text-sm font-bold text-slate-800">
                      Desvío de ruta
                    </p>

                    <span class="text-[9px] font-black text-red-600">
                      CRÍTICA
                    </span>

                  </div>

                  <p class="text-xs text-slate-500 mt-1">
                    Unidad #452 fuera del recorrido establecido.
                  </p>

                  <p class="text-[10px] text-slate-400 mt-2">
                    Hace 4 minutos
                  </p>

                </div>

              </div>

            </div>

            <!-- ALERTA MEDIA -->

            <div
              class="p-4 border-b border-slate-100 bg-amber-50/50"
            >

              <div class="flex gap-3">

                <div
                  class="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"
                >

                  <span
                    class="material-symbols-outlined text-amber-600"
                  >
                    schedule
                  </span>

                </div>

                <div class="min-w-0">

                  <div class="flex items-center justify-between gap-2">

                    <p class="text-sm font-bold text-slate-800">
                      Retraso en ruta
                    </p>

                    <span class="text-[9px] font-black text-amber-600">
                      MEDIA
                    </span>

                  </div>

                  <p class="text-xs text-slate-500 mt-1">
                    Ruta Lima–Chimbote presenta 18 min de retraso.
                  </p>

                  <p class="text-[10px] text-slate-400 mt-2">
                    Hace 12 minutos
                  </p>

                </div>

              </div>

            </div>

            <!-- ALERTA BAJA -->

            <div
              class="p-4 bg-slate-50/60"
            >

              <div class="flex gap-3">

                <div
                  class="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"
                >

                  <span
                    class="material-symbols-outlined text-blue-600"
                  >
                    info
                  </span>

                </div>

                <div class="min-w-0">

                  <div class="flex items-center justify-between gap-2">

                    <p class="text-sm font-bold text-slate-800">
                      Parada prolongada
                    </p>

                    <span class="text-[9px] font-black text-blue-600">
                      BAJA
                    </span>

                  </div>

                  <p class="text-xs text-slate-500 mt-1">
                    Unidad #221 detenida durante más de 10 minutos.
                  </p>

                  <p class="text-[10px] text-slate-400 mt-2">
                    Hace 20 minutos
                  </p>

                </div>

              </div>

            </div>

          </div>

          <div class="p-4 border-t border-slate-100">

            <button
              type="button"
              class="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition"
            >
              Ver todas las alertas
            </button>

          </div>

        </section>

      </div>

      <!-- ═════════════════════════════════════ -->
      <!-- RUTAS EN SEGUIMIENTO -->
      <!-- ═════════════════════════════════════ -->

      <section
        class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6"
      >

        <div
          class="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
        >

          <div>

            <h2 class="text-lg font-black text-slate-800">
              Rutas en seguimiento
            </h2>

            <p class="text-sm text-slate-500 mt-1">
              Estado actual de los principales servicios.
            </p>

          </div>

          <button
            type="button"
            class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition"
          >

            <span class="material-symbols-outlined text-sm">
              route
            </span>

            Gestionar rutas

          </button>

        </div>

        <div class="overflow-x-auto">

          <table class="w-full text-sm">

            <thead>

              <tr class="bg-slate-50 text-left">

                <th
                  class="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400"
                >
                  Ruta
                </th>

                <th
                  class="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400"
                >
                  Unidad
                </th>

                <th
                  class="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400"
                >
                  Conductor
                </th>

                <th
                  class="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400"
                >
                  Progreso
                </th>

                <th
                  class="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400"
                >
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>

              <!-- RUTA 1 -->

              <tr
                class="border-t border-slate-100 hover:bg-slate-50 transition"
              >

                <td class="px-6 py-4">

                  <p class="font-bold text-slate-800">
                    Lima → Trujillo
                  </p>

                  <p class="text-xs text-slate-400 mt-1">
                    Ruta R-001
                  </p>

                </td>

                <td class="px-6 py-4 font-semibold text-slate-600">
                  #452
                </td>

                <td class="px-6 py-4 text-slate-600">
                  J. Pérez
                </td>

                <td class="px-6 py-4">

                  <div class="flex items-center gap-3">

                    <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        class="h-full bg-emerald-500 rounded-full"
                        style="width:68%"
                      ></div>

                    </div>

                    <span class="text-xs font-bold text-slate-600">
                      68%
                    </span>

                  </div>

                </td>

                <td class="px-6 py-4">

                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold"
                  >

                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>

                    En ruta

                  </span>

                </td>

              </tr>

              <!-- RUTA 2 -->

              <tr
                class="border-t border-slate-100 hover:bg-slate-50 transition"
              >

                <td class="px-6 py-4">

                  <p class="font-bold text-slate-800">
                    Lima → Chimbote
                  </p>

                  <p class="text-xs text-slate-400 mt-1">
                    Ruta R-002
                  </p>

                </td>

                <td class="px-6 py-4 font-semibold text-slate-600">
                  #221
                </td>

                <td class="px-6 py-4 text-slate-600">
                  M. García
                </td>

                <td class="px-6 py-4">

                  <div class="flex items-center gap-3">

                    <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        class="h-full bg-amber-500 rounded-full"
                        style="width:42%"
                      ></div>

                    </div>

                    <span class="text-xs font-bold text-slate-600">
                      42%
                    </span>

                  </div>

                </td>

                <td class="px-6 py-4">

                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold"
                  >

                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>

                    Retrasada

                  </span>

                </td>

              </tr>

              <!-- RUTA 3 -->

              <tr
                class="border-t border-slate-100 hover:bg-slate-50 transition"
              >

                <td class="px-6 py-4">

                  <p class="font-bold text-slate-800">
                    Lima → Ica
                  </p>

                  <p class="text-xs text-slate-400 mt-1">
                    Ruta R-003
                  </p>

                </td>

                <td class="px-6 py-4 font-semibold text-slate-600">
                  #110
                </td>

                <td class="px-6 py-4 text-slate-600">
                  A. Rodríguez
                </td>

                <td class="px-6 py-4">

                  <div class="flex items-center gap-3">

                    <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        class="h-full bg-blue-500 rounded-full"
                        style="width:91%"
                      ></div>

                    </div>

                    <span class="text-xs font-bold text-slate-600">
                      91%
                    </span>

                  </div>

                </td>

                <td class="px-6 py-4">

                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold"
                  >

                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>

                    Próxima llegada

                  </span>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>

      <!-- ═════════════════════════════════════ -->
      <!-- ACCIONES RÁPIDAS -->
      <!-- ═════════════════════════════════════ -->

      <section
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
      >

        <h2 class="text-lg font-black text-slate-800">
          Acciones rápidas
        </h2>

        <p class="text-sm text-slate-500 mt-1 mb-5">
          Herramientas para supervisar la operación.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <!-- MAPA -->

          <button
            type="button"
            class="text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition"
          >

            <span
              class="material-symbols-outlined text-emerald-600 mb-2"
            >
              map
            </span>

            <p class="font-bold text-slate-800">
              Mapa en vivo
            </p>

            <p class="text-xs text-slate-500 mt-1">
              Supervisa las unidades en tiempo real.
            </p>

          </button>

          <!-- RUTAS -->

          <button
            type="button"
            class="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition"
          >

            <span
              class="material-symbols-outlined text-blue-600 mb-2"
            >
              route
            </span>

            <p class="font-bold text-slate-800">
              Gestionar rutas
            </p>

            <p class="text-xs text-slate-500 mt-1">
              Consulta y supervisa los servicios.
            </p>

          </button>

          <!-- ALERTAS -->

          <button
            type="button"
            class="text-left p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition"
          >

            <span
              class="material-symbols-outlined text-red-600 mb-2"
            >
              notifications_active
            </span>

            <p class="font-bold text-slate-800">
              Ver alertas
            </p>

            <p class="text-xs text-slate-500 mt-1">
              Revisa eventos que requieren atención.
            </p>

          </button>

          <!-- INCIDENCIAS -->

          <button
            type="button"
            class="text-left p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition"
          >

            <span
              class="material-symbols-outlined text-amber-600 mb-2"
            >
              warning
            </span>

            <p class="font-bold text-slate-800">
              Incidencias
            </p>

            <p class="text-xs text-slate-500 mt-1">
              Gestiona los incidentes reportados.
            </p>

          </button>

        </div>

      </section>

    </div>

  </AppLayout>
</template>