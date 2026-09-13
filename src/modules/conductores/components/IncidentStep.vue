<script setup>
import { computed, ref } from 'vue'

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
})

const emit = defineEmits(['next', 'back'])

// ═════════════════════════════════════════════
// TIPOS DE INCIDENCIA
// ═════════════════════════════════════════════

const incidentTypes = [
  {
    value: 'mechanical',
    label: 'Falla mecánica',
    icon: 'build',
  },
  {
    value: 'traffic',
    label: 'Incidente de tránsito',
    icon: 'traffic',
  },
  {
    value: 'cargo',
    label: 'Problema con la carga',
    icon: 'inventory_2',
  },
  {
    value: 'route',
    label: 'Problema en la ruta',
    icon: 'route',
  },
  {
    value: 'vehicle',
    label: 'Problema del vehículo',
    icon: 'local_shipping',
  },
  {
    value: 'other',
    label: 'Otro',
    icon: 'more_horiz',
  },
]

// ═════════════════════════════════════════════
// SEVERIDADES
// ═════════════════════════════════════════════

const severities = [
  {
    value: 'low',
    label: 'Leve',
    description: 'No impide continuar el servicio.',
  },
  {
    value: 'medium',
    label: 'Moderada',
    description: 'Requiere atención, pero permite continuar.',
  },
  {
    value: 'high',
    label: 'Grave',
    description: 'Puede comprometer la operación.',
  },
  {
    value: 'critical',
    label: 'Crítica',
    description: 'Requiere detener el servicio.',
  },
]

// ═════════════════════════════════════════════
// INCIDENCIAS DE LA INSPECCIÓN
// ═════════════════════════════════════════════

const inspectionIncidents = computed(() => {
  if (!props.inspection?.items) {
    return []
  }

  return props.inspection.items.filter(
    (item) =>
      item.status === 'observation' ||
      item.status === 'failed'
  )
})

// ═════════════════════════════════════════════
// INCIDENCIAS DURANTE EL SERVICIO
// ═════════════════════════════════════════════

const incidents = ref([])

// ═════════════════════════════════════════════
// FORMULARIO
// ═════════════════════════════════════════════

const showForm = ref(false)

const incidentType = ref('')
const severity = ref('')
const description = ref('')
const location = ref('')
const actionTaken = ref('')
const requiresAssistance = ref(false)
const assistanceType = ref('')

// ═════════════════════════════════════════════
// ESTADO
// ═════════════════════════════════════════════

const totalIncidents = computed(() => {
  return inspectionIncidents.value.length + incidents.value.length
})

const canSaveIncident = computed(() => {
  return (
    incidentType.value &&
    severity.value &&
    description.value.trim().length >= 5
  )
})

// ═════════════════════════════════════════════
// ABRIR FORMULARIO
// ═════════════════════════════════════════════

function openForm() {
  resetForm()
  showForm.value = true
}

// ═════════════════════════════════════════════
// CERRAR FORMULARIO
// ═════════════════════════════════════════════

function closeForm() {
  showForm.value = false
  resetForm()
}

// ═════════════════════════════════════════════
// REINICIAR FORMULARIO
// ═════════════════════════════════════════════

function resetForm() {
  incidentType.value = ''
  severity.value = ''
  description.value = ''
  location.value = ''
  actionTaken.value = ''
  requiresAssistance.value = false
  assistanceType.value = ''
}

// ═════════════════════════════════════════════
// GUARDAR INCIDENCIA
// ═════════════════════════════════════════════

function saveIncident() {
  if (!canSaveIncident.value) {
    return
  }

  incidents.value.push({
    id: Date.now(),

    type: incidentType.value,
    severity: severity.value,

    description: description.value.trim(),

    location: location.value.trim(),

    actionTaken: actionTaken.value.trim(),

    requiresAssistance: requiresAssistance.value,

    assistanceType: requiresAssistance.value
      ? assistanceType.value
      : '',

    registeredAt: new Date().toISOString(),

    source: 'route',
  })

  closeForm()
}

// ═════════════════════════════════════════════
// ELIMINAR INCIDENCIA
// ═════════════════════════════════════════════

function removeIncident(id) {
  incidents.value = incidents.value.filter(
    (incident) => incident.id !== id
  )
}

// ═════════════════════════════════════════════
// CONTINUAR
// ═════════════════════════════════════════════

function handleNext() {
  const inspectionProblems = inspectionIncidents.value.map(
    (item) => ({
      id: `inspection-${item.id}`,

      type: 'vehicle',

      severity:
        item.status === 'failed'
          ? 'high'
          : 'medium',

      description: `${item.name}: ${item.observation || 'Se detectó una anomalía durante la inspección.'}`,

      location: 'Inspección preoperacional',

      actionTaken: '',

      requiresAssistance:
        item.status === 'failed',

      assistanceType:
        item.status === 'failed'
          ? 'Revisión del vehículo'
          : '',

      registeredAt:
        new Date().toISOString(),

      source: 'inspection',

      inspectionItemId: item.id,
    })
  )

  const allIncidents = [
    ...inspectionProblems,
    ...incidents.value,
  ]

  const incidentData = {
    vehicle: props.vehicle,
    route: props.route,
    cargo: props.cargo,
    fuel: props.fuel,
    inspection: props.inspection,

    incidents: allIncidents,

    totalIncidents: allIncidents.length,

    hasIncidents: allIncidents.length > 0,

    requiresAssistance: allIncidents.some(
      (incident) => incident.requiresAssistance
    ),

    registeredAt: new Date().toISOString(),
  }

  emit('next', incidentData)
}
</script>

<template>
  <div class="max-w-5xl mx-auto">

    <!-- ═══════════════════════════════════════ -->
    <!-- ENCABEZADO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >

      <div class="px-6 py-5 border-b border-slate-200">

        <div class="flex items-start justify-between gap-4">

          <div class="flex items-start gap-4">

            <div
              class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0"
            >

              <span
                class="material-symbols-outlined text-red-600 text-2xl"
              >
                warning
              </span>

            </div>

            <div>

              <p
                class="text-xs font-black uppercase tracking-widest text-red-600 mb-1"
              >
                Paso 6 de 7
              </p>

              <h2 class="text-xl md:text-2xl font-black text-slate-800">
                Incidencias
              </h2>

              <p class="text-sm text-slate-500 mt-1">
                Registra las anomalías encontradas o cualquier incidente
                ocurrido durante el servicio.
              </p>

            </div>

          </div>

          <div class="text-right shrink-0">

            <p class="text-2xl font-black text-slate-800">
              {{ totalIncidents }}
            </p>

            <p class="text-xs text-slate-400 font-bold">
              registradas
            </p>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- AVISO DE INSPECCIÓN -->
      <!-- ═══════════════════════════════════════ -->

      <div
        v-if="inspectionIncidents.length > 0"
        class="mx-6 mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200"
      >

        <div class="flex items-start gap-3">

          <span class="material-symbols-outlined text-amber-600">
            fact_check
          </span>

          <div>

            <p class="text-sm font-black text-amber-800">
              Se encontraron anomalías durante la inspección
            </p>

            <p class="text-xs text-amber-700 mt-1">
              {{ inspectionIncidents.length }}
              elemento(s) de la inspección requieren atención.
              Se incluirán automáticamente en el registro de incidencias.
            </p>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- INCIDENCIAS DE INSPECCIÓN -->
      <!-- ═══════════════════════════════════════ -->

      <div
        v-if="inspectionIncidents.length > 0"
        class="px-6 pt-6"
      >

        <h3 class="text-sm font-black uppercase tracking-wider text-slate-700 mb-3">
          Anomalías detectadas en la inspección
        </h3>

        <div class="space-y-3">

          <div
            v-for="item in inspectionIncidents"
            :key="item.id"
            class="p-4 rounded-xl border"
            :class="
              item.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            "
          >

            <div class="flex items-start gap-3">

              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :class="
                  item.status === 'failed'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-600'
                "
              >

                <span class="material-symbols-outlined">
                  {{
                    item.status === 'failed'
                      ? 'cancel'
                      : 'warning'
                  }}
                </span>

              </div>

              <div class="flex-1">

                <div class="flex flex-wrap items-center gap-2">

                  <p class="font-black text-slate-800">
                    {{ item.name }}
                  </p>

                  <span
                    class="text-[10px] font-black uppercase px-2 py-1 rounded-full"
                    :class="
                      item.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    "
                  >
                    {{
                      item.status === 'failed'
                        ? 'No conforme'
                        : 'Observación'
                    }}
                  </span>

                </div>

                <p class="text-sm text-slate-600 mt-1">
                  {{ item.observation || 'Sin descripción adicional.' }}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- INCIDENCIAS REGISTRADAS -->
      <!-- ═══════════════════════════════════════ -->

      <div class="px-6 pt-6">

        <div class="flex items-center justify-between gap-3 mb-3">

          <h3 class="text-sm font-black uppercase tracking-wider text-slate-700">
            Incidentes durante el servicio
          </h3>

          <button
            type="button"
            @click="openForm"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-black hover:bg-red-700 transition"
          >

            <span class="material-symbols-outlined text-base">
              add
            </span>

            Registrar incidente

          </button>

        </div>


        <!-- VACÍO -->

        <div
          v-if="incidents.length === 0"
          class="border border-dashed border-slate-300 rounded-xl p-6 text-center"
        >

          <div
            class="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3"
          >

            <span class="material-symbols-outlined text-slate-400">
              report_problem
            </span>

          </div>

          <p class="font-black text-slate-700">
            No hay incidentes adicionales
          </p>

          <p class="text-xs text-slate-500 mt-1">
            Si durante el recorrido ocurrió algún problema,
            puedes registrarlo aquí.
          </p>

        </div>


        <!-- LISTA -->

        <div
          v-else
          class="space-y-3"
        >

          <div
            v-for="incident in incidents"
            :key="incident.id"
            class="border border-slate-200 rounded-xl p-4"
          >

            <div class="flex items-start justify-between gap-3">

              <div class="flex items-start gap-3">

                <div
                  class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0"
                >

                  <span class="material-symbols-outlined">
                    {{
                      incidentTypes.find(
                        (type) => type.value === incident.type
                      )?.icon || 'warning'
                    }}
                  </span>

                </div>

                <div>

                  <div class="flex flex-wrap items-center gap-2">

                    <p class="font-black text-slate-800">
                      {{
                        incidentTypes.find(
                          (type) => type.value === incident.type
                        )?.label
                      }}
                    </p>

                    <span
                      class="text-[10px] font-black uppercase px-2 py-1 rounded-full"
                      :class="
                        incident.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : incident.severity === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : incident.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                      "
                    >
                      {{
                        severities.find(
                          (item) => item.value === incident.severity
                        )?.label
                      }}
                    </span>

                  </div>

                  <p class="text-sm text-slate-600 mt-1">
                    {{ incident.description }}
                  </p>

                  <p
                    v-if="incident.location"
                    class="text-xs text-slate-400 mt-2"
                  >
                    📍 {{ incident.location }}
                  </p>

                </div>

              </div>


              <button
                type="button"
                @click="removeIncident(incident.id)"
                class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                title="Eliminar"
              >

                <span class="material-symbols-outlined text-lg">
                  delete
                </span>

              </button>

            </div>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- FORMULARIO -->
      <!-- ═══════════════════════════════════════ -->

      <div
        v-if="showForm"
        class="mx-6 mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200"
      >

        <div class="flex items-center justify-between mb-5">

          <div>

            <h3 class="font-black text-slate-800">
              Registrar incidente
            </h3>

            <p class="text-xs text-slate-500 mt-1">
              Completa la información del incidente.
            </p>

          </div>

          <button
            type="button"
            @click="closeForm"
            class="w-8 h-8 rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"
          >

            <span class="material-symbols-outlined">
              close
            </span>

          </button>

        </div>


        <!-- TIPO -->

        <div class="mb-5">

          <label class="block text-xs font-black text-slate-700 mb-2">
            Tipo de incidente
            <span class="text-red-500">*</span>
          </label>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">

            <button
              v-for="type in incidentTypes"
              :key="type.value"
              type="button"
              @click="incidentType = type.value"
              class="flex items-center gap-2 p-3 rounded-xl border text-left transition"
              :class="
                incidentType === type.value
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-red-200'
              "
            >

              <span class="material-symbols-outlined text-lg">
                {{ type.icon }}
              </span>

              <span class="text-xs font-bold">
                {{ type.label }}
              </span>

            </button>

          </div>

        </div>


        <!-- SEVERIDAD -->

        <div class="mb-5">

          <label class="block text-xs font-black text-slate-700 mb-2">
            Severidad
            <span class="text-red-500">*</span>
          </label>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">

            <button
              v-for="item in severities"
              :key="item.value"
              type="button"
              @click="severity = item.value"
              class="p-3 rounded-xl border text-left transition"
              :class="
                severity === item.value
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-red-200'
              "
            >

              <p
                class="text-xs font-black"
                :class="
                  item.value === 'critical'
                    ? 'text-red-700'
                    : item.value === 'high'
                      ? 'text-orange-700'
                      : item.value === 'medium'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                "
              >
                {{ item.label }}
              </p>

              <p class="text-[10px] text-slate-400 mt-1 leading-tight">
                {{ item.description }}
              </p>

            </button>

          </div>

        </div>


        <!-- DESCRIPCIÓN -->

        <div class="mb-4">

          <label class="block text-xs font-black text-slate-700 mb-2">
            Descripción del incidente
            <span class="text-red-500">*</span>
          </label>

          <textarea
            v-model="description"
            rows="3"
            placeholder="Describe qué ocurrió..."
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
          ></textarea>

        </div>


        <!-- UBICACIÓN -->

        <div class="mb-4">

          <label class="block text-xs font-black text-slate-700 mb-2">
            Ubicación
            <span class="font-normal text-slate-400">
              (opcional)
            </span>
          </label>

          <div class="relative">

            <span
              class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              location_on
            </span>

            <input
              v-model="location"
              type="text"
              placeholder="Ejemplo: Km 145 de la ruta..."
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />

          </div>

        </div>


        <!-- ACCIÓN TOMADA -->

        <div class="mb-4">

          <label class="block text-xs font-black text-slate-700 mb-2">
            Acción tomada
            <span class="font-normal text-slate-400">
              (opcional)
            </span>
          </label>

          <textarea
            v-model="actionTaken"
            rows="2"
            placeholder="¿Qué hiciste para atender el incidente?"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
          ></textarea>

        </div>


        <!-- ASISTENCIA -->

        <div class="p-4 rounded-xl bg-white border border-slate-200">

          <label class="flex items-center gap-3 cursor-pointer">

            <input
              v-model="requiresAssistance"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />

            <span class="text-sm font-black text-slate-700">
              Requiere asistencia
            </span>

          </label>


          <div
            v-if="requiresAssistance"
            class="mt-3"
          >

            <label class="block text-xs font-bold text-slate-600 mb-2">
              Tipo de asistencia
            </label>

            <select
              v-model="assistanceType"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-red-400"
            >

              <option value="">
                Seleccionar asistencia
              </option>

              <option value="mechanical">
                Asistencia mecánica
              </option>

              <option value="tow">
                Grúa / remolque
              </option>

              <option value="medical">
                Asistencia médica
              </option>

              <option value="traffic">
                Apoyo de control de tránsito
              </option>

              <option value="other">
                Otra asistencia
              </option>

            </select>

          </div>

        </div>


        <!-- GUARDAR -->

        <div class="flex justify-end gap-2 mt-5">

          <button
            type="button"
            @click="closeForm"
            class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="saveIncident"
            :disabled="!canSaveIncident"
            class="px-5 py-2.5 rounded-xl text-sm font-black transition"
            :class="
              canSaveIncident
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            "
          >
            Guardar incidente
          </button>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- BOTONES FINALES -->
      <!-- ═══════════════════════════════════════ -->

      <div
        class="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-t border-slate-200 bg-slate-50"
      >

        <button
          type="button"
          @click="$emit('back')"
          class="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
        >

          <span class="material-symbols-outlined text-lg">
            arrow_back
          </span>

          Atrás

        </button>


        <button
          type="button"
          @click="handleNext"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white text-sm font-black hover:bg-cyan-700 transition shadow-sm"
        >

          Continuar a confirmación

          <span class="material-symbols-outlined text-lg">
            arrow_forward
          </span>

        </button>

      </div>

    </div>

  </div>
</template>