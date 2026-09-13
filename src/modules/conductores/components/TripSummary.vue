<script setup>
import { computed } from 'vue'

const props = defineProps({
  vehicle: {
    type: Object,
    default: null,
  },

  route: {
    type: Object,
    default: null,
  },

  cargo: {
    type: Object,
    default: null,
  },

  fuel: {
    type: Object,
    default: null,
  },

  inspection: {
    type: Object,
    default: null,
  },

  incidents: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['start', 'back'])

const hasInspectionProblems = computed(() => {
  return Boolean(props.inspection?.hasProblems)
})

const inspectionStatus = computed(() => {
  if (!props.inspection) {
    return {
      label: 'No registrada',
      icon: 'help',
      class: 'bg-gray-100 text-gray-600',
    }
  }

  if (props.inspection.failedItems > 0) {
    return {
      label: 'Presenta fallas',
      icon: 'error',
      class: 'bg-red-100 text-red-700',
    }
  }

  if (props.inspection.observationItems > 0) {
    return {
      label: 'Con observaciones',
      icon: 'warning',
      class: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Conforme',
    icon: 'check_circle',
    class: 'bg-green-100 text-green-700',
  }
})

const fuelPercentage = computed(() => {
  return props.fuel?.percentage ?? 0
})

const fuelLiters = computed(() => {
  return props.fuel?.liters ?? 0
})

const totalIncidents = computed(() => {
  return props.incidents?.length ?? 0
})

const hasIncidents = computed(() => {
  return totalIncidents.value > 0
})

const requiresAssistance = computed(() => {
  return props.incidents?.some(
    (incident) => incident.requiresAssistance === true
  )
})

function formatDate(date) {
  if (!date) return 'No registrada'

  try {
    return new Date(date).toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return date
  }
}

function getVehicleName() {
  if (!props.vehicle) return 'No seleccionado'

  return (
    props.vehicle.plate ||
    props.vehicle.placa ||
    props.vehicle.name ||
    props.vehicle.description ||
    'Vehículo seleccionado'
  )
}

function getVehicleModel() {
  if (!props.vehicle) return ''

  const brand = props.vehicle.brand || props.vehicle.marca || ''
  const model = props.vehicle.model || props.vehicle.modelo || ''

  return `${brand} ${model}`.trim()
}

function getRouteOrigin() {
  if (!props.route) return 'No registrada'

  return (
    props.route.origin ||
    props.route.origen ||
    props.route.startPoint ||
    props.route.start ||
    'No registrada'
  )
}

function getRouteDestination() {
  if (!props.route) return 'No registrada'

  return (
    props.route.destination ||
    props.route.destino ||
    props.route.endPoint ||
    props.route.end ||
    'No registrada'
  )
}

function getCargoDescription() {
  if (!props.cargo) return 'No registrada'

  return (
    props.cargo.type ||
    props.cargo.cargoType ||
    props.cargo.loadType ||
    props.cargo.description ||
    'Carga registrada'
  )
}

function getCargoWeight() {
  if (!props.cargo) return 'No registrada'

  const weight =
    props.cargo.weight ??
    props.cargo.weightKg ??
    props.cargo.quantity ??
    props.cargo.cantidad

  if (weight === undefined || weight === null || weight === '') {
    return 'No especificado'
  }

  return `${weight} kg`
}

function getIncidentSeverityClass(severity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-700'
    case 'high':
      return 'bg-orange-100 text-orange-700'
    case 'medium':
      return 'bg-amber-100 text-amber-700'
    case 'low':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getIncidentSeverityLabel(severity) {
  switch (severity) {
    case 'critical':
      return 'Crítica'
    case 'high':
      return 'Alta'
    case 'medium':
      return 'Media'
    case 'low':
      return 'Baja'
    default:
      return 'No especificada'
  }
}

function handleStartService() {
  emit('start')
}
</script>

<template>
  <div class="space-y-6">

    <!-- ENCABEZADO -->
    <div>
      <div class="flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100"
        >
          <span class="material-symbols-outlined text-2xl text-green-600">
            fact_check
          </span>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            Confirmación del servicio
          </h2>

          <p class="text-sm text-gray-500">
            Revisa toda la información antes de iniciar el servicio.
          </p>
        </div>
      </div>
    </div>

    <!-- ALERTA DE INSPECCIÓN -->
    <div
      v-if="hasInspectionProblems"
      class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
    >
      <span class="material-symbols-outlined mt-0.5 text-amber-600">
        warning
      </span>

      <div>
        <p class="font-semibold text-amber-800">
          Se detectaron observaciones durante la inspección
        </p>

        <p class="mt-1 text-sm text-amber-700">
          Estas observaciones serán registradas como incidencias del servicio.
          Verifica la información antes de continuar.
        </p>
      </div>
    </div>

    <!-- VEHÍCULO -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div class="flex items-center justify-between border-b border-gray-100 p-5">
        <div class="flex items-center gap-3">

          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"
          >
            <span class="material-symbols-outlined text-blue-600">
              local_shipping
            </span>
          </div>

          <div>
            <h3 class="font-bold text-gray-900">
              Vehículo
            </h3>

            <p class="text-xs text-gray-500">
              Unidad seleccionada para el servicio
            </p>
          </div>

        </div>

        <span class="material-symbols-outlined text-green-500">
          check_circle
        </span>
      </div>

      <div class="grid gap-4 p-5 md:grid-cols-3">

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Placa
          </p>

          <p class="mt-1 font-semibold text-gray-900">
            {{ getVehicleName() }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Modelo
          </p>

          <p class="mt-1 font-semibold text-gray-900">
            {{ getVehicleModel() || 'No especificado' }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Estado
          </p>

          <span
            class="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
          >
            <span class="material-symbols-outlined text-sm">
              check_circle
            </span>

            Seleccionado
          </span>
        </div>

      </div>
    </section>

    <!-- RUTA -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div class="flex items-center justify-between border-b border-gray-100 p-5">

        <div class="flex items-center gap-3">

          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100"
          >
            <span class="material-symbols-outlined text-purple-600">
              route
            </span>
          </div>

          <div>
            <h3 class="font-bold text-gray-900">
              Ruta
            </h3>

            <p class="text-xs text-gray-500">
              Recorrido programado
            </p>
          </div>

        </div>

        <span class="material-symbols-outlined text-green-500">
          check_circle
        </span>

      </div>

      <div class="p-5">

        <div class="relative ml-2">

          <div
            class="absolute left-[7px] top-4 h-[calc(100%-32px)] w-0.5 bg-gray-200"
          ></div>

          <div class="relative flex items-start gap-4">

            <div
              class="z-10 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-4 ring-green-50"
            ></div>

            <div>
              <p class="text-xs font-medium uppercase text-gray-400">
                Origen
              </p>

              <p class="font-semibold text-gray-900">
                {{ getRouteOrigin() }}
              </p>
            </div>

          </div>

          <div class="relative mt-8 flex items-start gap-4">

            <div
              class="z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-4 ring-red-50"
            ></div>

            <div>
              <p class="text-xs font-medium uppercase text-gray-400">
                Destino
              </p>

              <p class="font-semibold text-gray-900">
                {{ getRouteDestination() }}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- CARGA -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div class="flex items-center justify-between border-b border-gray-100 p-5">

        <div class="flex items-center gap-3">

          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100"
          >
            <span class="material-symbols-outlined text-orange-600">
              inventory_2
            </span>
          </div>

          <div>
            <h3 class="font-bold text-gray-900">
              Carga
            </h3>

            <p class="text-xs text-gray-500">
              Información de la carga transportada
            </p>
          </div>

        </div>

        <span class="material-symbols-outlined text-green-500">
          check_circle
        </span>

      </div>

      <div class="grid gap-4 p-5 md:grid-cols-2">

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Tipo de carga
          </p>

          <p class="mt-1 font-semibold text-gray-900">
            {{ getCargoDescription() }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Peso / cantidad
          </p>

          <p class="mt-1 font-semibold text-gray-900">
            {{ getCargoWeight() }}
          </p>
        </div>

      </div>
    </section>

    <!-- COMBUSTIBLE -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div class="flex items-center justify-between border-b border-gray-100 p-5">

        <div class="flex items-center gap-3">

          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100"
          >
            <span class="material-symbols-outlined text-yellow-600">
              local_gas_station
            </span>
          </div>

          <div>
            <h3 class="font-bold text-gray-900">
              Combustible
            </h3>

            <p class="text-xs text-gray-500">
              Registro al inicio del servicio
            </p>
          </div>

        </div>

        <span class="material-symbols-outlined text-green-500">
          check_circle
        </span>

      </div>

      <div class="grid gap-4 p-5 md:grid-cols-3">

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Nivel
          </p>

          <p class="mt-1 text-xl font-bold text-gray-900">
            {{ fuelPercentage }}%
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Combustible estimado
          </p>

          <p class="mt-1 text-xl font-bold text-gray-900">
            {{ fuelLiters }} L
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Kilometraje
          </p>

          <p class="mt-1 text-xl font-bold text-gray-900">
            {{ fuel?.odometer ?? 'No registrado' }}
          </p>
        </div>

      </div>
    </section>

    <!-- INSPECCIÓN -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div class="flex items-center justify-between border-b border-gray-100 p-5">

        <div class="flex items-center gap-3">

          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100"
          >
            <span class="material-symbols-outlined text-cyan-600">
              fact_check
            </span>
          </div>

          <div>
            <h3 class="font-bold text-gray-900">
              Inspección del vehículo
            </h3>

            <p class="text-xs text-gray-500">
              Resultado de la revisión previa
            </p>
          </div>

        </div>

        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="inspectionStatus.class"
        >
          {{ inspectionStatus.label }}
        </span>

      </div>

      <div class="grid gap-4 p-5 md:grid-cols-4">

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Elementos revisados
          </p>

          <p class="mt-1 text-xl font-bold text-gray-900">
            {{ inspection?.checkedItems ?? 0 }}
            /
            {{ inspection?.totalItems ?? 0 }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Conformes
          </p>

          <p class="mt-1 text-xl font-bold text-green-600">
            {{ inspection?.conformItems ?? 0 }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Observaciones
          </p>

          <p class="mt-1 text-xl font-bold text-amber-600">
            {{ inspection?.observationItems ?? 0 }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase text-gray-400">
            Fallas
          </p>

          <p class="mt-1 text-xl font-bold text-red-600">
            {{ inspection?.failedItems ?? 0 }}
          </p>
        </div>

      </div>

      <div
        v-if="inspection?.generalObservation"
        class="border-t border-gray-100 bg-gray-50 p-5"
      >
        <p class="text-xs font-medium uppercase text-gray-400">
          Observación general
        </p>

        <p class="mt-1 text-sm text-gray-700">
          {{ inspection.generalObservation }}
        </p>
      </div>

    </section>

    <!-- INCIDENCIAS -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div class="flex items-center justify-between border-b border-gray-100 p-5">

        <div class="flex items-center gap-3">

          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100"
          >
            <span class="material-symbols-outlined text-red-600">
              warning
            </span>
          </div>

          <div>
            <h3 class="font-bold text-gray-900">
              Incidencias
            </h3>

            <p class="text-xs text-gray-500">
              Eventos registrados durante la preparación del servicio
            </p>
          </div>

        </div>

        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="
            hasIncidents
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          "
        >
          {{ totalIncidents }}
          {{ totalIncidents === 1 ? 'incidencia' : 'incidencias' }}
        </span>

      </div>

      <div
        v-if="!hasIncidents"
        class="p-6 text-center"
      >
        <span
          class="material-symbols-outlined text-4xl text-green-500"
        >
          check_circle
        </span>

        <p class="mt-2 font-semibold text-gray-900">
          No se registraron incidencias
        </p>

        <p class="mt-1 text-sm text-gray-500">
          El servicio no presenta incidencias registradas hasta este momento.
        </p>
      </div>

      <div
        v-else
        class="divide-y divide-gray-100"
      >

        <div
          v-for="(incident, index) in incidents"
          :key="incident.id || index"
          class="p-5"
        >

          <div class="flex items-start justify-between gap-4">

            <div class="flex items-start gap-3">

              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50"
              >
                <span class="material-symbols-outlined text-red-600">
                  warning
                </span>
              </div>

              <div>

                <p class="font-semibold text-gray-900">
                  {{ incident.description || 'Incidencia registrada' }}
                </p>

                <p
                  v-if="incident.location"
                  class="mt-1 text-sm text-gray-500"
                >
                  📍 {{ incident.location }}
                </p>

              </div>

            </div>

            <span
              class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
              :class="getIncidentSeverityClass(incident.severity)"
            >
              {{ getIncidentSeverityLabel(incident.severity) }}
            </span>

          </div>

          <div
            v-if="incident.actionTaken"
            class="mt-3 rounded-lg bg-gray-50 p-3"
          >
            <p class="text-xs font-semibold uppercase text-gray-400">
              Acción realizada
            </p>

            <p class="mt-1 text-sm text-gray-700">
              {{ incident.actionTaken }}
            </p>
          </div>

          <div
            v-if="incident.requiresAssistance"
            class="mt-3 flex items-center gap-2 text-sm font-medium text-red-600"
          >
            <span class="material-symbols-outlined text-base">
              support_agent
            </span>

            Requiere asistencia
          </div>

        </div>

      </div>

      <div
        v-if="requiresAssistance"
        class="border-t border-red-100 bg-red-50 p-4"
      >
        <div class="flex items-center gap-3">

          <span class="material-symbols-outlined text-red-600">
            support_agent
          </span>

          <div>
            <p class="font-semibold text-red-800">
              Se requiere asistencia
            </p>

            <p class="text-sm text-red-700">
              Una o más incidencias requieren atención antes o durante el servicio.
            </p>
          </div>

        </div>
      </div>

    </section>

    <!-- RESUMEN FINAL -->
    <section
      class="rounded-2xl border-2 border-green-200 bg-green-50 p-5"
    >

      <div class="flex items-start gap-3">

        <span class="material-symbols-outlined text-3xl text-green-600">
          verified
        </span>

        <div>

          <h3 class="font-bold text-green-900">
            Todo listo para iniciar
          </h3>

          <p class="mt-1 text-sm text-green-800">
            Has completado el registro previo del servicio.
            Verifica la información y presiona
            <strong>Iniciar servicio</strong>
            para comenzar el viaje.
          </p>

        </div>

      </div>

      <div class="mt-4 grid gap-3 text-sm md:grid-cols-3">

        <div class="rounded-lg bg-white/70 p-3">
          <p class="text-xs text-gray-500">
            Vehículo
          </p>

          <p class="font-semibold text-gray-900">
            {{ getVehicleName() }}
          </p>
        </div>

        <div class="rounded-lg bg-white/70 p-3">
          <p class="text-xs text-gray-500">
            Ruta
          </p>

          <p class="font-semibold text-gray-900">
            {{ getRouteOrigin() }}
            →
            {{ getRouteDestination() }}
          </p>
        </div>

        <div class="rounded-lg bg-white/70 p-3">
          <p class="text-xs text-gray-500">
            Registro
          </p>

          <p class="font-semibold text-gray-900">
            {{ formatDate(new Date()) }}
          </p>
        </div>

      </div>

    </section>

    <!-- BOTONES -->
    <div
      class="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between"
    >

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        @click="emit('back')"
      >
        <span class="material-symbols-outlined">
          arrow_back
        </span>

        Volver a incidencias
      </button>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-3 font-bold text-white shadow-sm transition hover:bg-green-700"
        @click="handleStartService"
      >
        <span class="material-symbols-outlined">
          play_arrow
        </span>

        Iniciar servicio
      </button>

    </div>

  </div>
</template>