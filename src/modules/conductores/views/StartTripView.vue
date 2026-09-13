<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'

import VehicleStep from '../components/VehicleStep.vue'
import RouteStep from '../components/RouteStep.vue'
import CargoStep from '../components/CargoStep.vue'
import FuelStep from '../components/FuelStep.vue'
import InspectionStep from '../components/InspectionStep.vue'
import IncidentStep from '../components/IncidentStep.vue'
import TripSummary from '../components/TripSummary.vue'

const router = useRouter()

// ═════════════════════════════════════════════
// PASO ACTUAL
// ═════════════════════════════════════════════

const currentStep = ref(1)

// ═════════════════════════════════════════════
// ESTADO DEL SERVICIO
// ═════════════════════════════════════════════

const serviceStarted = ref(false)

// ═════════════════════════════════════════════
// INFORMACIÓN COMPLETA DEL SERVICIO
// ═════════════════════════════════════════════

const trip = ref({
  vehicle: null,
  route: null,
  cargo: null,
  fuel: null,
  inspection: null,
  incidents: [],
  startedAt: null,
})

// ═════════════════════════════════════════════
// PASOS DEL SERVICIO
// ═════════════════════════════════════════════

const steps = [
  {
    number: 1,
    label: 'Vehículo',
    icon: 'local_shipping',
  },
  {
    number: 2,
    label: 'Ruta',
    icon: 'route',
  },
  {
    number: 3,
    label: 'Carga',
    icon: 'inventory_2',
  },
  {
    number: 4,
    label: 'Combustible',
    icon: 'local_gas_station',
  },
  {
    number: 5,
    label: 'Inspección',
    icon: 'fact_check',
  },
  {
    number: 6,
    label: 'Incidencias',
    icon: 'warning',
  },
  {
    number: 7,
    label: 'Confirmación',
    icon: 'check_circle',
  },
]

// ═════════════════════════════════════════════
// PROGRESO
// ═════════════════════════════════════════════

const progress = computed(() => {
  return ((currentStep.value - 1) / (steps.length - 1)) * 100
})

// ═════════════════════════════════════════════
// PASO 1 → VEHÍCULO
// ═════════════════════════════════════════════

function handleVehicleNext(vehicle) {
  trip.value.vehicle = vehicle
  currentStep.value = 2
}

// ═════════════════════════════════════════════
// PASO 2 → RUTA
// ═════════════════════════════════════════════

function handleRouteNext(routeData) {
  trip.value.route = routeData
  currentStep.value = 3
}

// ═════════════════════════════════════════════
// PASO 3 → CARGA
// ═════════════════════════════════════════════

function handleCargoNext(cargoData) {
  trip.value.cargo = cargoData
  currentStep.value = 4
}

// ═════════════════════════════════════════════
// PASO 4 → COMBUSTIBLE
// ═════════════════════════════════════════════

function handleFuelNext(fuelData) {
  trip.value.fuel = fuelData
  currentStep.value = 5
}

// ═════════════════════════════════════════════
// PASO 5 → INSPECCIÓN
// ═════════════════════════════════════════════

function handleInspectionNext(inspectionData) {
  trip.value.inspection = inspectionData
  currentStep.value = 6
}

// ═════════════════════════════════════════════
// PASO 6 → INCIDENCIAS
// ═════════════════════════════════════════════

function handleIncidentNext(incidentData) {
  trip.value.incidents = incidentData.incidents || []
  currentStep.value = 7
}

// ═════════════════════════════════════════════
// PASO 7 → INICIAR SERVICIO
// ═════════════════════════════════════════════

function handleStartService() {
  const startedAt = new Date().toISOString()

  // Guardar fecha y hora de inicio
  trip.value.startedAt = startedAt

  // Marcar servicio como iniciado
  serviceStarted.value = true

  // Guardar servicio activo en el navegador
  localStorage.setItem(
    'activeTrip',
    JSON.stringify(trip.value)
  )

  // ═══════════════════════════════════════════
  // IR A LA PANTALLA OPERATIVA
  // ═══════════════════════════════════════════

  router.push({
    name: 'active-trip',
  })
}

// ═════════════════════════════════════════════
// VOLVER AL DASHBOARD
// ═════════════════════════════════════════════

function volverAlDashboard() {
  router.push({
    name: 'dashboard-conductor',
  })
}

// ═════════════════════════════════════════════
// VOLVER A PASO ANTERIOR
// ═════════════════════════════════════════════

function goToStep(step) {
  // Si el servicio ya inició,
  // no permitir regresar al formulario.
  if (serviceStarted.value) {
    return
  }

  if (step >= 1 && step <= currentStep.value) {
    currentStep.value = step
  }
}

// ═════════════════════════════════════════════
// SI YA EXISTE UN SERVICIO ACTIVO
// ═════════════════════════════════════════════

onMounted(() => {
  const storedTrip = localStorage.getItem('activeTrip')

  if (!storedTrip) {
    return
  }

  try {
    const existingTrip = JSON.parse(storedTrip)

    if (
      existingTrip &&
      existingTrip.startedAt
    ) {
      trip.value = existingTrip

      serviceStarted.value = true

      // Si el conductor intenta volver a
      // iniciar servicio teniendo uno activo,
      // lo llevamos directamente al servicio.
      router.replace({
        name: 'active-trip',
      })
    }
  } catch (error) {
    console.error(
      'Error al recuperar el servicio activo:',
      error
    )

    localStorage.removeItem('activeTrip')
  }
})
</script>

<template>
  <AppLayout>

    <!-- ═══════════════════════════════════════ -->
    <!-- ENCABEZADO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="bg-white border-b border-slate-200 px-6 py-5 -mx-5 md:-mx-10 -mt-5 md:-mt-10 mb-6"
    >
      <div class="max-w-7xl mx-auto">

        <div
          class="flex items-center justify-between gap-4"
        >

          <!-- TÍTULO -->

          <div>

            <p
              class="text-xs font-black uppercase tracking-widest text-cyan-600 mb-1"
            >
              Gestión del servicio
            </p>

            <h1
              class="text-2xl font-black text-slate-800"
            >
              Iniciar servicio
            </h1>

            <p
              class="text-sm text-slate-500 mt-1"
            >
              Registra la información de tu viaje antes
              de iniciar la ruta.
            </p>

          </div>

          <!-- VOLVER -->

          <button
            type="button"
            @click="volverAlDashboard"
            class="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >

            <span class="material-symbols-outlined text-lg">
              arrow_back
            </span>

            Volver

          </button>

        </div>

      </div>
    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- CONTENIDO -->
    <!-- ═══════════════════════════════════════ -->

    <div class="max-w-7xl mx-auto">

      <!-- ═══════════════════════════════════ -->
      <!-- INDICADOR DE PASOS -->
      <!-- ═══════════════════════════════════ -->

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 mb-6"
      >

        <!-- DESKTOP -->

        <div class="hidden md:block">

          <div class="relative">

            <!-- LÍNEA BASE -->

            <div
              class="absolute left-0 right-0 top-5 h-1 bg-slate-100 rounded-full"
            ></div>

            <!-- LÍNEA PROGRESO -->

            <div
              class="absolute left-0 top-5 h-1 bg-cyan-500 rounded-full transition-all duration-500"
              :style="`width: ${progress}%`"
            ></div>

            <!-- PASOS -->

            <div
              class="relative flex justify-between"
            >

              <button
                v-for="step in steps"
                :key="step.number"
                type="button"
                class="flex flex-col items-center bg-transparent border-0"
                @click="goToStep(step.number)"
              >

                <!-- CÍRCULO -->

                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all"
                  :class="
                    step.number < currentStep
                      ? 'bg-cyan-600 text-white'
                      : step.number === currentStep
                        ? 'bg-cyan-600 text-white ring-4 ring-cyan-100'
                        : 'bg-slate-200 text-slate-400'
                  "
                >

                  <span
                    v-if="step.number < currentStep"
                    class="material-symbols-outlined text-lg"
                  >
                    check
                  </span>

                  <span
                    v-else
                    class="material-symbols-outlined text-lg"
                  >
                    {{ step.icon }}
                  </span>

                </div>

                <!-- NOMBRE -->

                <span
                  class="mt-2 text-[10px] font-black uppercase tracking-wide text-center"
                  :class="
                    step.number <= currentStep
                      ? 'text-cyan-700'
                      : 'text-slate-400'
                  "
                >
                  {{ step.label }}
                </span>

              </button>

            </div>

          </div>

        </div>


        <!-- MOBILE -->

        <div class="md:hidden">

          <div
            class="flex items-center justify-between"
          >

            <div
              class="flex items-center gap-3"
            >

              <div
                class="w-11 h-11 rounded-xl bg-cyan-100 flex items-center justify-center"
              >

                <span
                  class="material-symbols-outlined text-cyan-700"
                >
                  {{ steps[currentStep - 1].icon }}
                </span>

              </div>

              <div>

                <p
                  class="text-xs font-black text-cyan-600 uppercase"
                >
                  Paso {{ currentStep }} de {{ steps.length }}
                </p>

                <p
                  class="font-black text-slate-800"
                >
                  {{ steps[currentStep - 1].label }}
                </p>

              </div>

            </div>

            <span
              class="text-sm font-black text-slate-500"
            >
              {{ Math.round((currentStep / steps.length) * 100) }}%
            </span>

          </div>


          <!-- BARRA -->

          <div
            class="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden"
          >

            <div
              class="h-full bg-cyan-500 rounded-full transition-all duration-500"
              :style="`width: ${(currentStep / steps.length) * 100}%`"
            ></div>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════ -->
      <!-- RESUMEN VEHÍCULO -->
      <!-- ═══════════════════════════════════ -->

      <div
        v-if="trip.vehicle"
        class="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 mb-6"
      >

        <div class="flex items-center gap-3">

          <div
            class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center"
          >

            <span
              class="material-symbols-outlined text-cyan-700"
            >
              local_shipping
            </span>

          </div>

          <div>

            <p
              class="text-[10px] font-black uppercase tracking-widest text-cyan-600"
            >
              Vehículo seleccionado
            </p>

            <p class="font-black text-slate-800">

              {{ trip.vehicle.code }}

              <span
                v-if="trip.vehicle.model"
                class="font-medium text-slate-500"
              >
                · {{ trip.vehicle.model }}
              </span>

            </p>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════ -->
      <!-- PASO 1 -->
      <!-- ═══════════════════════════════════ -->

      <VehicleStep
        v-if="currentStep === 1"
        @next="handleVehicleNext"
      />


      <!-- ═══════════════════════════════════ -->
      <!-- PASO 2 -->
      <!-- ═══════════════════════════════════ -->

      <RouteStep
        v-else-if="currentStep === 2"
        :vehicle="trip.vehicle"
        @next="handleRouteNext"
        @back="currentStep = 1"
      />


      <!-- ═══════════════════════════════════ -->
      <!-- PASO 3 -->
      <!-- ═══════════════════════════════════ -->

      <CargoStep
        v-else-if="currentStep === 3"
        :vehicle="trip.vehicle"
        :route="trip.route"
        @next="handleCargoNext"
        @back="currentStep = 2"
      />


      <!-- ═══════════════════════════════════ -->
      <!-- PASO 4 -->
      <!-- ═══════════════════════════════════ -->

      <FuelStep
        v-else-if="currentStep === 4"
        :vehicle="trip.vehicle"
        :route="trip.route"
        :cargo="trip.cargo"
        @next="handleFuelNext"
        @back="currentStep = 3"
      />


      <!-- ═══════════════════════════════════ -->
      <!-- PASO 5 -->
      <!-- ═══════════════════════════════════ -->

      <InspectionStep
        v-else-if="currentStep === 5"
        :vehicle="trip.vehicle"
        :route="trip.route"
        :cargo="trip.cargo"
        :fuel="trip.fuel"
        @next="handleInspectionNext"
        @back="currentStep = 4"
      />


      <!-- ═══════════════════════════════════ -->
      <!-- PASO 6 -->
      <!-- ═══════════════════════════════════ -->

      <IncidentStep
        v-else-if="currentStep === 6"
        :vehicle="trip.vehicle"
        :route="trip.route"
        :cargo="trip.cargo"
        :fuel="trip.fuel"
        :inspection="trip.inspection"
        @next="handleIncidentNext"
        @back="currentStep = 5"
      />


      <!-- ═══════════════════════════════════ -->
      <!-- PASO 7 -->
      <!-- ═══════════════════════════════════ -->

      <TripSummary
        v-else-if="currentStep === 7"
        :vehicle="trip.vehicle"
        :route="trip.route"
        :cargo="trip.cargo"
        :fuel="trip.fuel"
        :inspection="trip.inspection"
        :incidents="trip.incidents"
        @start="handleStartService"
        @back="currentStep = 6"
      />

    </div>

  </AppLayout>
</template>