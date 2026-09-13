<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/auth/store/authStore.js'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const router = useRouter()

// ═════════════════════════════════════════════
// USUARIO
// ═════════════════════════════════════════════

const userName = computed(() => {
  return authStore.user?.name || 'Chofer'
})

// ═════════════════════════════════════════════
// SERVICIO ACTIVO
// ═════════════════════════════════════════════

const activeTrip = ref(null)

// ═════════════════════════════════════════════
// CARGAR SERVICIO ACTIVO
// ═════════════════════════════════════════════

function loadActiveTrip() {
  try {
    const storedTrip = localStorage.getItem('activeTrip')

    if (!storedTrip) {
      activeTrip.value = null
      return
    }

    const parsedTrip = JSON.parse(storedTrip)

    if (parsedTrip && parsedTrip.startedAt) {
      activeTrip.value = parsedTrip
    } else {
      activeTrip.value = null
    }
  } catch (error) {
    console.error(
      'Error al cargar el servicio activo:',
      error
    )

    activeTrip.value = null
  }
}

// ═════════════════════════════════════════════
// SERVICIO ACTIVO
// ═════════════════════════════════════════════

const hasActiveTrip = computed(() => {
  return !!activeTrip.value?.startedAt
})

// ═════════════════════════════════════════════
// DATOS DEL VEHÍCULO
// ═════════════════════════════════════════════

const vehicleCode = computed(() => {
  return (
    activeTrip.value?.vehicle?.code ||
    activeTrip.value?.vehicle?.plate ||
    'Sin vehículo'
  )
})

const vehicleModel = computed(() => {
  return (
    activeTrip.value?.vehicle?.model ||
    activeTrip.value?.vehicle?.name ||
    'Vehículo pendiente de registrar'
  )
})

// ═════════════════════════════════════════════
// DATOS DE LA RUTA
// ═════════════════════════════════════════════

const routeOrigin = computed(() => {
  return (
    activeTrip.value?.route?.origin ||
    activeTrip.value?.route?.from ||
    activeTrip.value?.route?.departure ||
    'Origen pendiente'
  )
})

const routeDestination = computed(() => {
  return (
    activeTrip.value?.route?.destination ||
    activeTrip.value?.route?.to ||
    activeTrip.value?.route?.arrival ||
    'Destino pendiente'
  )
})

const routeName = computed(() => {
  if (
    routeOrigin.value !== 'Origen pendiente' ||
    routeDestination.value !== 'Destino pendiente'
  ) {
    return `${routeOrigin.value} → ${routeDestination.value}`
  }

  return 'Ruta pendiente de registrar'
})

// ═════════════════════════════════════════════
// COMBUSTIBLE
// ═════════════════════════════════════════════

const fuelPercentage = computed(() => {
  const percentage = activeTrip.value?.fuel?.percentage

  if (
    percentage === null ||
    percentage === undefined ||
    percentage === ''
  ) {
    return null
  }

  return Number(percentage)
})

const fuelLiters = computed(() => {
  const liters = activeTrip.value?.fuel?.liters

  if (
    liters === null ||
    liters === undefined ||
    liters === ''
  ) {
    return null
  }

  return Number(liters)
})

// ═════════════════════════════════════════════
// HORA DE INICIO
// ═════════════════════════════════════════════

const startedAtFormatted = computed(() => {
  const startedAt = activeTrip.value?.startedAt

  if (!startedAt) {
    return null
  }

  try {
    return new Date(startedAt).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return startedAt
  }
})

// ═════════════════════════════════════════════
// INCIDENTES
// ═════════════════════════════════════════════

const incidentCount = computed(() => {
  return activeTrip.value?.incidents?.length || 0
})

// ═════════════════════════════════════════════
// INICIAR SERVICIO
// ═════════════════════════════════════════════

function iniciarServicio() {
  router.push({
    name: 'start-trip',
  })
}

// ═════════════════════════════════════════════
// CONTINUAR SERVICIO
// ═════════════════════════════════════════════

function continuarServicio() {
  router.push({
    name: 'active-trip',
  })
}

// ═════════════════════════════════════════════
// MI VEHÍCULO
// ═════════════════════════════════════════════

function abrirVehiculo() {
  if (hasActiveTrip.value) {
    router.push({
      name: 'active-trip',
    })

    return
  }

  router.push({
    name: 'start-trip',
  })
}

// ═════════════════════════════════════════════
// MI RECORRIDO
// ═════════════════════════════════════════════

function abrirRecorrido() {
  if (hasActiveTrip.value) {
    router.push({
      name: 'active-trip',
    })

    return
  }

  router.push({
    name: 'start-trip',
  })
}

// ═════════════════════════════════════════════
// REGISTRAR CONSUMO
// ═════════════════════════════════════════════

function registrarConsumo() {
  if (hasActiveTrip.value) {
    router.push({
      name: 'active-trip',
    })

    return
  }

  router.push({
    name: 'start-trip',
  })
}

// ═════════════════════════════════════════════
// REPORTAR INCIDENCIA
// ═════════════════════════════════════════════

function reportarIncidencia() {
  if (hasActiveTrip.value) {
    router.push({
      name: 'active-trip',
    })

    return
  }

  router.push({
    name: 'start-trip',
  })
}

// ═════════════════════════════════════════════
// ACTUALIZAR SI CAMBIA LOCALSTORAGE
// ═════════════════════════════════════════════

function handleStorageChange(event) {
  if (event.key === 'activeTrip') {
    loadActiveTrip()
  }
}

// ═════════════════════════════════════════════
// MONTAR
// ═════════════════════════════════════════════

onMounted(() => {
  loadActiveTrip()

  window.addEventListener(
    'storage',
    handleStorageChange
  )
})

// ═════════════════════════════════════════════
// DESMONTAR
// ═════════════════════════════════════════════

onBeforeUnmount(() => {
  window.removeEventListener(
    'storage',
    handleStorageChange
  )
})
</script>

<template>
  <AppLayout>

    <!-- ═════════════════════════════════════ -->
    <!-- ENCABEZADO DEL CHOFER -->
    <!-- ═════════════════════════════════════ -->

    <div
      class="bg-white border-b border-slate-200 px-6 py-5 -mx-5 md:-mx-10 -mt-5 md:-mt-10 mb-6"
    >

      <div class="max-w-7xl mx-auto">

        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >

          <!-- INFORMACIÓN -->

          <div>

            <p
              class="text-xs font-black uppercase tracking-widest text-cyan-600 mb-1"
            >
              Panel del conductor
            </p>

            <h1
              class="text-2xl font-black text-slate-800"
            >
              Hola, {{ userName }}
            </h1>

            <p
              class="text-sm text-slate-500 mt-1"
            >
              Aquí puedes gestionar tu servicio y consultar
              el estado de tu operación.
            </p>

          </div>

          <!-- BOTÓN PRINCIPAL -->

          <button
            v-if="!hasActiveTrip"
            type="button"
            @click="iniciarServicio"
            class="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 text-white font-black shadow-sm hover:bg-cyan-700 transition"
          >

            <span class="material-symbols-outlined">
              local_shipping
            </span>

            Iniciar servicio

          </button>

          <button
            v-else
            type="button"
            @click="continuarServicio"
            class="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-black shadow-sm hover:bg-emerald-700 transition"
          >

            <span class="material-symbols-outlined">
              play_arrow
            </span>

            Continuar servicio

          </button>

        </div>

      </div>

    </div>


    <!-- ═════════════════════════════════════ -->
    <!-- CONTENIDO -->
    <!-- ═════════════════════════════════════ -->

    <div class="max-w-7xl mx-auto">


      <!-- ═══════════════════════════════════ -->
      <!-- ESTADO DE OPERACIÓN -->
      <!-- ═══════════════════════════════════ -->

      <section class="mb-6">

        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >

          <!-- CABECERA -->

          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          >

            <div>

              <h2
                class="text-lg font-black text-slate-800"
              >
                Estado de mi operación
              </h2>

              <p
                class="text-sm text-slate-500 mt-1"
              >
                Información de tu servicio actual
              </p>

            </div>


            <!-- ESTADO -->

            <div
              v-if="hasActiveTrip"
              class="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold"
            >

              <span
                class="w-2 h-2 rounded-full bg-emerald-500"
              ></span>

              En servicio

            </div>

            <div
              v-else
              class="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-bold"
            >

              <span
                class="w-2 h-2 rounded-full bg-slate-400"
              ></span>

              Servicio no iniciado

            </div>

          </div>


          <!-- ═════════════════════════════════ -->
          <!-- TARJETAS -->
          <!-- ═════════════════════════════════ -->

          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-4"
          >

            <!-- VEHÍCULO -->

            <div
              class="rounded-xl bg-slate-50 p-5"
            >

              <div
                class="flex items-center gap-3 mb-3"
              >

                <div
                  class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center"
                >

                  <span
                    class="material-symbols-outlined text-cyan-700"
                  >
                    local_shipping
                  </span>

                </div>

                <span
                  class="text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Mi vehículo
                </span>

              </div>

              <p
                class="text-xl font-black text-slate-800"
              >
                {{ vehicleCode }}
              </p>

              <p
                class="text-sm text-slate-500 mt-1"
              >
                {{ vehicleModel }}
              </p>

            </div>


            <!-- RUTA -->

            <div
              class="rounded-xl bg-slate-50 p-5"
            >

              <div
                class="flex items-center gap-3 mb-3"
              >

                <div
                  class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"
                >

                  <span
                    class="material-symbols-outlined text-blue-700"
                  >
                    route
                  </span>

                </div>

                <span
                  class="text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Ruta asignada
                </span>

              </div>

              <p
                class="text-xl font-black text-slate-800"
              >
                {{ routeName }}
              </p>

              <p
                class="text-sm text-slate-500 mt-1"
              >
                {{
                  hasActiveTrip
                    ? 'Ruta activa'
                    : 'Pendiente de registrar'
                }}
              </p>

            </div>


            <!-- COMBUSTIBLE -->

            <div
              class="rounded-xl bg-slate-50 p-5"
            >

              <div
                class="flex items-center gap-3 mb-3"
              >

                <div
                  class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"
                >

                  <span
                    class="material-symbols-outlined text-amber-700"
                  >
                    local_gas_station
                  </span>

                </div>

                <span
                  class="text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Combustible
                </span>

              </div>

              <p
                v-if="fuelPercentage !== null"
                class="text-xl font-black text-slate-800"
              >
                {{ fuelPercentage }}%
              </p>

              <p
                v-else
                class="text-xl font-black text-slate-400"
              >
                Pendiente
              </p>

              <p
                v-if="fuelLiters !== null"
                class="text-sm text-slate-500 mt-1"
              >
                {{ fuelLiters }} litros registrados
              </p>

              <p
                v-else
                class="text-sm text-slate-500 mt-1"
              >
                Registrar al iniciar servicio
              </p>

            </div>

          </div>


          <!-- INFORMACIÓN DEL SERVICIO ACTIVO -->

          <div
            v-if="hasActiveTrip"
            class="mt-5 pt-5 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >

            <div
              class="flex items-center gap-2 text-sm text-slate-500"
            >

              <span
                class="material-symbols-outlined text-base text-emerald-600"
              >
                schedule
              </span>

              Servicio iniciado:
              <strong class="text-slate-700">
                {{ startedAtFormatted }}
              </strong>

            </div>

            <div
              class="flex items-center gap-2 text-sm"
              :class="
                incidentCount > 0
                  ? 'text-red-600'
                  : 'text-emerald-600'
              "
            >

              <span class="material-symbols-outlined text-base">
                {{
                  incidentCount > 0
                    ? 'warning'
                    : 'check_circle'
                }}
              </span>

              <strong>
                {{ incidentCount }}
              </strong>

              {{
                incidentCount === 1
                  ? 'incidencia registrada'
                  : 'incidencias registradas'
              }}

            </div>

          </div>

        </div>

      </section>


      <!-- ═══════════════════════════════════ -->
      <!-- BOTÓN DE INICIO -->
      <!-- ═══════════════════════════════════ -->

      <section
        v-if="!hasActiveTrip"
        class="mb-6"
      >

        <div
          class="rounded-2xl bg-cyan-50 border border-cyan-200 p-6"
        >

          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-5"
          >

            <div class="flex items-start gap-4">

              <div
                class="w-12 h-12 shrink-0 rounded-xl bg-cyan-600 text-white flex items-center justify-center"
              >

                <span class="material-symbols-outlined text-2xl">
                  play_circle
                </span>

              </div>

              <div>

                <h2
                  class="text-lg font-black text-slate-800"
                >
                  ¿Listo para iniciar tu servicio?
                </h2>

                <p
                  class="text-sm text-slate-600 mt-1"
                >
                  Antes de salir deberás registrar el vehículo,
                  ruta, carga, combustible, inspección e incidencias.
                </p>

              </div>

            </div>

            <button
              type="button"
              @click="iniciarServicio"
              class="shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-black hover:bg-cyan-700 transition"
            >

              <span class="material-symbols-outlined">
                local_shipping
              </span>

              Iniciar servicio

            </button>

          </div>

        </div>

      </section>


      <!-- ═══════════════════════════════════ -->
      <!-- DOS COLUMNAS -->
      <!-- ═══════════════════════════════════ -->

      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >


        <!-- ═════════════════════════════════ -->
        <!-- MI RUTA DE HOY -->
        <!-- ═════════════════════════════════ -->

        <section
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >

          <div
            class="flex items-center justify-between mb-5"
          >

            <div>

              <h2
                class="text-lg font-black text-slate-800"
              >
                Mi ruta de hoy
              </h2>

              <p
                class="text-sm text-slate-500 mt-1"
              >
                Información del recorrido
              </p>

            </div>

            <span
              class="material-symbols-outlined text-slate-400"
            >
              route
            </span>

          </div>


          <!-- SIN SERVICIO -->

          <div
            v-if="!hasActiveTrip"
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"
          >

            <span
              class="material-symbols-outlined text-4xl text-slate-400"
            >
              route
            </span>

            <p
              class="font-bold text-slate-700 mt-3"
            >
              No hay una ruta activa
            </p>

            <p
              class="text-sm text-slate-500 mt-1"
            >
              La ruta aparecerá aquí cuando completes
              el registro del servicio.
            </p>

            <button
              type="button"
              @click="iniciarServicio"
              class="mt-4 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition"
            >
              Registrar servicio
            </button>

          </div>


          <!-- RUTA ACTIVA -->

          <div
            v-else
            class="space-y-4"
          >

            <!-- SALIDA -->

            <div class="flex gap-4">

              <div class="flex flex-col items-center">

                <div
                  class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center"
                >

                  <span
                    class="material-symbols-outlined text-emerald-600 text-lg"
                  >
                    play_arrow
                  </span>

                </div>

                <div
                  class="w-px h-10 bg-slate-200"
                ></div>

              </div>

              <div>

                <p class="font-bold text-slate-800">
                  Salida
                </p>

                <p
                  class="text-sm text-slate-500"
                >
                  {{ routeOrigin }}
                </p>

              </div>

            </div>


            <!-- DESTINO -->

            <div class="flex gap-4">

              <div class="flex flex-col items-center">

                <div
                  class="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center"
                >

                  <span
                    class="material-symbols-outlined text-cyan-600 text-lg"
                  >
                    location_on
                  </span>

                </div>

              </div>

              <div>

                <p class="font-bold text-slate-800">
                  Destino
                </p>

                <p
                  class="text-sm text-slate-500"
                >
                  {{ routeDestination }}
                </p>

              </div>

            </div>


            <!-- BOTÓN -->

            <button
              type="button"
              @click="continuarServicio"
              class="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 font-bold hover:bg-cyan-100 transition"
            >

              <span class="material-symbols-outlined">
                map
              </span>

              Ver servicio activo

            </button>

          </div>

        </section>


        <!-- ═════════════════════════════════ -->
        <!-- ACCIONES RÁPIDAS -->
        <!-- ═════════════════════════════════ -->

        <section
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >

          <h2
            class="text-lg font-black text-slate-800"
          >
            Acciones rápidas
          </h2>

          <p
            class="text-sm text-slate-500 mt-1 mb-5"
          >
            Accede rápidamente a las funciones de tu operación.
          </p>


          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >

            <!-- ═════════════════════════════ -->
            <!-- MI VEHÍCULO -->
            <!-- ═════════════════════════════ -->

            <button
              type="button"
              @click="abrirVehiculo"
              class="text-left p-4 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 transition"
            >

              <span
                class="material-symbols-outlined text-cyan-600 mb-2"
              >
                local_shipping
              </span>

              <p
                class="font-bold text-slate-800"
              >
                Mi vehículo
              </p>

              <p
                class="text-xs text-slate-500 mt-1"
              >
                {{
                  hasActiveTrip
                    ? 'Consulta tu vehículo en servicio.'
                    : 'Selecciona el vehículo para iniciar.'
                }}
              </p>

            </button>


            <!-- ═════════════════════════════ -->
            <!-- MI RECORRIDO -->
            <!-- ═════════════════════════════ -->

            <button
              type="button"
              @click="abrirRecorrido"
              class="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition"
            >

              <span
                class="material-symbols-outlined text-blue-600 mb-2"
              >
                map
              </span>

              <p
                class="font-bold text-slate-800"
              >
                Mi recorrido
              </p>

              <p
                class="text-xs text-slate-500 mt-1"
              >
                {{
                  hasActiveTrip
                    ? 'Consulta el avance de tu ruta.'
                    : 'Primero registra tu servicio.'
                }}
              </p>

            </button>


            <!-- ═════════════════════════════ -->
            <!-- CONSUMO -->
            <!-- ═════════════════════════════ -->

            <button
              type="button"
              @click="registrarConsumo"
              class="text-left p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition"
            >

              <span
                class="material-symbols-outlined text-amber-600 mb-2"
              >
                local_gas_station
              </span>

              <p
                class="font-bold text-slate-800"
              >
                Registrar consumo
              </p>

              <p
                class="text-xs text-slate-500 mt-1"
              >
                {{
                  hasActiveTrip
                    ? 'Consulta y registra información del combustible.'
                    : 'El combustible se registra al iniciar.'
                }}
              </p>

            </button>


            <!-- ═════════════════════════════ -->
            <!-- INCIDENCIA -->
            <!-- ═════════════════════════════ -->

            <button
              type="button"
              @click="reportarIncidencia"
              class="text-left p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition"
            >

              <span
                class="material-symbols-outlined text-red-600 mb-2"
              >
                warning
              </span>

              <p
                class="font-bold text-slate-800"
              >
                Reportar incidencia
              </p>

              <p
                class="text-xs text-slate-500 mt-1"
              >
                {{
                  hasActiveTrip
                    ? 'Reporta un problema durante la ruta.'
                    : 'Las incidencias se registran durante el servicio.'
                }}
              </p>

            </button>

          </div>


          <!-- BOTÓN SERVICIO ACTIVO -->

          <button
            v-if="hasActiveTrip"
            type="button"
            @click="continuarServicio"
            class="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition"
          >

            <span class="material-symbols-outlined">
              play_arrow
            </span>

            Continuar servicio activo

          </button>

        </section>

      </div>


      <!-- ═══════════════════════════════════ -->
      <!-- AVISO -->
      <!-- ═══════════════════════════════════ -->

      <section class="mt-6">

        <div
          class="rounded-2xl bg-cyan-50 border border-cyan-100 p-5 flex gap-4"
        >

          <span
            class="material-symbols-outlined text-cyan-600"
          >
            info
          </span>

          <div>

            <p
              class="font-bold text-cyan-900"
            >
              {{
                hasActiveTrip
                  ? 'Servicio activo'
                  : 'Antes de iniciar tu servicio'
              }}
            </p>

            <p
              class="text-sm text-cyan-800 mt-1"
            >
              {{
                hasActiveTrip
                  ? 'Puedes continuar tu servicio, consultar la ruta y reportar incidencias desde la pantalla operativa.'
                  : 'Registra el vehículo, ruta, carga, combustible, inspección e incidencias antes de comenzar tu recorrido.'
              }}
            </p>

          </div>

        </div>

      </section>

    </div>

  </AppLayout>
</template>