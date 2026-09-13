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
})

const emit = defineEmits(['next', 'back'])

// ═════════════════════════════════════════════
// LISTA DE ELEMENTOS A INSPECCIONAR
// ═════════════════════════════════════════════

const inspectionItems = ref([
  {
    id: 'brakes',
    category: 'Seguridad',
    name: 'Sistema de frenos',
    description: 'Verificar funcionamiento del freno de servicio y estacionamiento.',
    status: null,
    observation: '',
  },
  {
    id: 'tires',
    category: 'Seguridad',
    name: 'Neumáticos',
    description: 'Verificar presión, desgaste y estado general de los neumáticos.',
    status: null,
    observation: '',
  },
  {
    id: 'lights',
    category: 'Seguridad',
    name: 'Luces y señalización',
    description: 'Verificar luces delanteras, posteriores, direccionales y freno.',
    status: null,
    observation: '',
  },
  {
    id: 'mirrors',
    category: 'Seguridad',
    name: 'Espejos retrovisores',
    description: 'Verificar estado, limpieza y correcta posición de los espejos.',
    status: null,
    observation: '',
  },
  {
    id: 'seatbelts',
    category: 'Seguridad',
    name: 'Cinturones de seguridad',
    description: 'Verificar funcionamiento y estado de los cinturones.',
    status: null,
    observation: '',
  },
  {
    id: 'extinguisher',
    category: 'Equipamiento',
    name: 'Extintor',
    description: 'Verificar presencia, estado y vigencia del extintor.',
    status: null,
    observation: '',
  },
  {
    id: 'firstAid',
    category: 'Equipamiento',
    name: 'Botiquín',
    description: 'Verificar presencia y condiciones del botiquín de primeros auxilios.',
    status: null,
    observation: '',
  },
  {
    id: 'engineOil',
    category: 'Motor',
    name: 'Nivel de aceite',
    description: 'Verificar que el nivel de aceite del motor sea adecuado.',
    status: null,
    observation: '',
  },
  {
    id: 'coolant',
    category: 'Motor',
    name: 'Refrigerante',
    description: 'Verificar nivel y posibles fugas del sistema de refrigeración.',
    status: null,
    observation: '',
  },
  {
    id: 'battery',
    category: 'Motor',
    name: 'Batería',
    description: 'Verificar estado, conexiones y posibles signos de corrosión.',
    status: null,
    observation: '',
  },
  {
    id: 'body',
    category: 'Carrocería',
    name: 'Carrocería',
    description: 'Verificar golpes, daños, puertas y estado general del vehículo.',
    status: null,
    observation: '',
  },
  {
    id: 'windshield',
    category: 'Carrocería',
    name: 'Parabrisas y ventanas',
    description: 'Verificar que no existan daños que afecten la visibilidad.',
    status: null,
    observation: '',
  },
  {
    id: 'cargoArea',
    category: 'Carga',
    name: 'Área de carga',
    description: 'Verificar limpieza, estado y condiciones del área destinada a la carga.',
    status: null,
    observation: '',
  },
])

// ═════════════════════════════════════════════
// ESTADO GENERAL
// ═════════════════════════════════════════════

const generalObservation = ref('')

// ═════════════════════════════════════════════
// COMPUTADOS
// ═════════════════════════════════════════════

const totalItems = computed(() => {
  return inspectionItems.value.length
})

const checkedItems = computed(() => {
  return inspectionItems.value.filter(
    (item) => item.status !== null
  ).length
})

const conformItems = computed(() => {
  return inspectionItems.value.filter(
    (item) => item.status === 'ok'
  ).length
})

const observationItems = computed(() => {
  return inspectionItems.value.filter(
    (item) => item.status === 'observation'
  ).length
})

const failedItems = computed(() => {
  return inspectionItems.value.filter(
    (item) => item.status === 'failed'
  ).length
})

const progress = computed(() => {
  if (!totalItems.value) return 0

  return Math.round(
    (checkedItems.value / totalItems.value) * 100
  )
})

const allChecked = computed(() => {
  return checkedItems.value === totalItems.value
})

const hasProblems = computed(() => {
  return failedItems.value > 0 || observationItems.value > 0
})

// ═════════════════════════════════════════════
// CATEGORÍAS
// ═════════════════════════════════════════════

const categories = computed(() => {
  return [...new Set(
    inspectionItems.value.map((item) => item.category)
  )]
})

function itemsByCategory(category) {
  return inspectionItems.value.filter(
    (item) => item.category === category
  )
}

// ═════════════════════════════════════════════
// SELECCIONAR ESTADO
// ═════════════════════════════════════════════

function setStatus(item, status) {
  item.status = status

  // Si vuelve a "Bueno", eliminamos la observación anterior.
  if (status === 'ok') {
    item.observation = ''
  }
}

// ═════════════════════════════════════════════
// VALIDACIÓN
// ═════════════════════════════════════════════

function canContinue() {
  if (!allChecked.value) {
    return false
  }

  return true
}

// ═════════════════════════════════════════════
// CONTINUAR
// ═════════════════════════════════════════════

function handleNext() {
  if (!canContinue()) {
    return
  }

  const inspectionData = {
    vehicle: props.vehicle,
    route: props.route,
    cargo: props.cargo,
    fuel: props.fuel,

    items: inspectionItems.value.map((item) => ({
      id: item.id,
      category: item.category,
      name: item.name,
      status: item.status,
      observation: item.observation,
    })),

    totalItems: totalItems.value,
    checkedItems: checkedItems.value,
    conformItems: conformItems.value,
    observationItems: observationItems.value,
    failedItems: failedItems.value,

    hasProblems: hasProblems.value,

    generalObservation: generalObservation.value,

    inspectedAt: new Date().toISOString(),
  }

  emit('next', inspectionData)
}
</script>

<template>
  <div class="max-w-5xl mx-auto">

    <!-- ═══════════════════════════════════════ -->
    <!-- ENCABEZADO -->
    <!-- ═══════════════════════════════════════ -->

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <!-- TÍTULO -->

      <div class="px-6 py-5 border-b border-slate-200">

        <div class="flex items-start justify-between gap-4">

          <div class="flex items-start gap-4">

            <div
              class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"
            >
              <span class="material-symbols-outlined text-amber-600 text-2xl">
                fact_check
              </span>
            </div>

            <div>

              <p
                class="text-xs font-black uppercase tracking-widest text-amber-600 mb-1"
              >
                Paso 5 de 7
              </p>

              <h2 class="text-xl md:text-2xl font-black text-slate-800">
                Inspección del vehículo
              </h2>

              <p class="text-sm text-slate-500 mt-1">
                Verifica el estado del vehículo antes de iniciar el servicio.
              </p>

            </div>

          </div>

          <!-- PORCENTAJE -->

          <div class="text-right shrink-0">

            <p class="text-2xl font-black text-slate-800">
              {{ progress }}%
            </p>

            <p class="text-xs text-slate-400 font-bold">
              completado
            </p>

          </div>

        </div>

        <!-- BARRA -->

        <div class="mt-5">

          <div class="h-2 bg-slate-100 rounded-full overflow-hidden">

            <div
              class="h-full bg-amber-500 rounded-full transition-all duration-300"
              :style="`width: ${progress}%`"
            ></div>

          </div>

          <div class="flex justify-between mt-2">

            <span class="text-xs font-bold text-slate-400">
              {{ checkedItems }} de {{ totalItems }} verificados
            </span>

            <span
              v-if="hasProblems"
              class="text-xs font-black text-red-600"
            >
              {{ failedItems + observationItems }} con observaciones
            </span>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- RESUMEN DEL VEHÍCULO -->
      <!-- ═══════════════════════════════════════ -->

      <div
        v-if="vehicle"
        class="mx-6 mt-5 bg-cyan-50 border border-cyan-100 rounded-xl p-4"
      >

        <div class="flex items-center gap-3">

          <span class="material-symbols-outlined text-cyan-700">
            local_shipping
          </span>

          <div>

            <p class="text-[10px] font-black uppercase tracking-widest text-cyan-600">
              Vehículo inspeccionado
            </p>

            <p class="font-black text-slate-800">
              {{ vehicle.code }}

              <span
                v-if="vehicle.model"
                class="font-medium text-slate-500"
              >
                · {{ vehicle.model }}
              </span>
            </p>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- INDICADORES -->
      <!-- ═══════════════════════════════════════ -->

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-6">

        <!-- VERIFICADOS -->

        <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">

          <p class="text-xs font-bold text-slate-500">
            Verificados
          </p>

          <p class="text-2xl font-black text-slate-800 mt-1">
            {{ checkedItems }}
          </p>

        </div>


        <!-- CONFORMES -->

        <div class="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

          <p class="text-xs font-bold text-emerald-600">
            Conformes
          </p>

          <p class="text-2xl font-black text-emerald-700 mt-1">
            {{ conformItems }}
          </p>

        </div>


        <!-- OBSERVACIONES -->

        <div class="rounded-xl bg-amber-50 border border-amber-100 p-4">

          <p class="text-xs font-bold text-amber-600">
            Observaciones
          </p>

          <p class="text-2xl font-black text-amber-700 mt-1">
            {{ observationItems }}
          </p>

        </div>


        <!-- NO CONFORMES -->

        <div class="rounded-xl bg-red-50 border border-red-100 p-4">

          <p class="text-xs font-bold text-red-600">
            No conformes
          </p>

          <p class="text-2xl font-black text-red-700 mt-1">
            {{ failedItems }}
          </p>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- LISTA DE INSPECCIÓN -->
      <!-- ═══════════════════════════════════════ -->

      <div class="px-6 pb-6">

        <div
          v-for="category in categories"
          :key="category"
          class="mb-6 last:mb-0"
        >

          <!-- CATEGORÍA -->

          <div class="flex items-center gap-2 mb-3">

            <span class="material-symbols-outlined text-slate-500 text-lg">
              {{
                category === 'Seguridad'
                  ? 'security'
                  : category === 'Motor'
                    ? 'engineering'
                    : category === 'Equipamiento'
                      ? 'medical_services'
                      : category === 'Carrocería'
                        ? 'directions_car'
                        : 'inventory_2'
              }}
            </span>

            <h3 class="text-sm font-black uppercase tracking-wider text-slate-700">
              {{ category }}
            </h3>

          </div>


          <!-- ELEMENTOS -->

          <div class="space-y-3">

            <div
              v-for="item in itemsByCategory(category)"
              :key="item.id"
              class="border border-slate-200 rounded-xl p-4 transition"
              :class="
                item.status === 'failed'
                  ? 'border-red-200 bg-red-50/40'
                  : item.status === 'observation'
                    ? 'border-amber-200 bg-amber-50/40'
                    : item.status === 'ok'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'bg-white'
              "
            >

              <div class="flex flex-col lg:flex-row lg:items-center gap-4">

                <!-- INFORMACIÓN -->

                <div class="flex-1">

                  <div class="flex items-start gap-3">

                    <div
                      class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      :class="
                        item.status === 'ok'
                          ? 'bg-emerald-100 text-emerald-600'
                          : item.status === 'observation'
                            ? 'bg-amber-100 text-amber-600'
                            : item.status === 'failed'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-slate-100 text-slate-500'
                      "
                    >

                      <span class="material-symbols-outlined">
                        {{
                          item.status === 'ok'
                            ? 'check_circle'
                            : item.status === 'observation'
                              ? 'warning'
                              : item.status === 'failed'
                                ? 'cancel'
                                : 'help'
                        }}
                      </span>

                    </div>

                    <div>

                      <p class="font-black text-slate-800">
                        {{ item.name }}
                      </p>

                      <p class="text-xs text-slate-500 mt-0.5">
                        {{ item.description }}
                      </p>

                    </div>

                  </div>

                </div>


                <!-- ESTADOS -->

                <div class="flex flex-wrap gap-2 lg:shrink-0">

                  <!-- BUENO -->

                  <button
                    type="button"
                    @click="setStatus(item, 'ok')"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-black transition"
                    :class="
                      item.status === 'ok'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                    "
                  >

                    <span class="material-symbols-outlined text-base">
                      check
                    </span>

                    Bueno

                  </button>


                  <!-- OBSERVACIÓN -->

                  <button
                    type="button"
                    @click="setStatus(item, 'observation')"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-black transition"
                    :class="
                      item.status === 'observation'
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                    "
                  >

                    <span class="material-symbols-outlined text-base">
                      warning
                    </span>

                    Observación

                  </button>


                  <!-- NO CONFORME -->

                  <button
                    type="button"
                    @click="setStatus(item, 'failed')"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-black transition"
                    :class="
                      item.status === 'failed'
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50'
                    "
                  >

                    <span class="material-symbols-outlined text-base">
                      close
                    </span>

                    No conforme

                  </button>

                </div>

              </div>


              <!-- OBSERVACIÓN -->

              <div
                v-if="item.status === 'observation' || item.status === 'failed'"
                class="mt-4 pl-0 lg:pl-12"
              >

                <label
                  class="block text-xs font-black text-slate-600 mb-2"
                >
                  Describa la anomalía encontrada
                  <span class="text-red-500">*</span>
                </label>

                <textarea
                  v-model="item.observation"
                  rows="2"
                  placeholder="Ejemplo: desgaste irregular en neumático delantero derecho..."
                  class="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
                ></textarea>

              </div>

            </div>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- OBSERVACIÓN GENERAL -->
      <!-- ═══════════════════════════════════════ -->

      <div class="px-6 pb-6">

        <div class="border-t border-slate-200 pt-6">

          <label
            class="block text-sm font-black text-slate-700 mb-2"
          >
            Observación general
            <span class="font-normal text-slate-400">
              (opcional)
            </span>
          </label>

          <textarea
            v-model="generalObservation"
            rows="3"
            placeholder="Registra cualquier comentario adicional sobre el estado del vehículo..."
            class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 resize-none"
          ></textarea>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- ALERTA -->
      <!-- ═══════════════════════════════════════ -->

      <div
        v-if="hasProblems"
        class="mx-6 mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200"
      >

        <div class="flex items-start gap-3">

          <span class="material-symbols-outlined text-amber-600">
            warning
          </span>

          <div>

            <p class="text-sm font-black text-amber-800">
              Se encontraron observaciones durante la inspección
            </p>

            <p class="text-xs text-amber-700 mt-1">
              Estas incidencias serán registradas y podrán ser revisadas
              antes de iniciar el servicio.
            </p>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════════ -->
      <!-- BOTONES -->
      <!-- ═══════════════════════════════════════ -->

      <div
        class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-t border-slate-200 bg-slate-50"
      >

        <!-- ATRÁS -->

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


        <!-- CONTINUAR -->

        <button
          type="button"
          @click="handleNext"
          :disabled="!canContinue()"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition"
          :class="
            canContinue()
              ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          "
        >

          <span
            v-if="!allChecked"
            class="material-symbols-outlined text-lg"
          >
            lock
          </span>

          <span
            v-else
            class="material-symbols-outlined text-lg"
          >
            arrow_forward
          </span>

          {{ allChecked ? 'Continuar a incidencias' : 'Complete la inspección' }}

        </button>

      </div>

    </div>

  </div>
</template>