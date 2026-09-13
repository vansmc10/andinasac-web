<script setup>
import { computed, ref } from 'vue'

// ============================================================
// PROPS
// ============================================================

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
})

// ============================================================
// EVENTOS
// ============================================================

const emit = defineEmits([
  'next',
  'back',
  'fuelData',
])

// ============================================================
// DATOS DEL FORMULARIO
// ============================================================

const fuelPercentage = ref('')
const fuelLiters = ref('')

const odometer = ref('')

const registrationTime = ref('')

const observations = ref('')

// ============================================================
// CAPACIDAD DEL TANQUE
// ============================================================
//
// Si el vehículo tiene una capacidad definida,
// utilizamos ese valor.
//
// Si no existe, utilizamos 400 litros como referencia.
//
// ============================================================

const tankCapacity = computed(() => {
  const capacity =
    Number(
      props.vehicle?.tankCapacity
    )

  return capacity > 0
    ? capacity
    : 400
})

// ============================================================
// CONVERSIÓN PORCENTAJE → LITROS
// ============================================================

const calculatedLiters = computed(() => {

  const percentage =
    Number(fuelPercentage.value)

  if (
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    return 0
  }

  return Number(
    (
      tankCapacity.value *
      percentage /
      100
    ).toFixed(1)
  )
})

// ============================================================
// ACTUALIZAR LITROS DESDE PORCENTAJE
// ============================================================

function updateFromPercentage() {

  const percentage =
    Number(fuelPercentage.value)

  if (
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    fuelLiters.value = ''
    return
  }

  fuelLiters.value =
    calculatedLiters.value
}

// ============================================================
// ACTUALIZAR PORCENTAJE DESDE LITROS
// ============================================================

function updateFromLiters() {

  const liters =
    Number(fuelLiters.value)

  if (
    !Number.isFinite(liters) ||
    liters < 0 ||
    liters > tankCapacity.value
  ) {
    fuelPercentage.value = ''
    return
  }

  fuelPercentage.value =
    Number(
      (
        liters /
        tankCapacity.value *
        100
      ).toFixed(1)
    )
}

// ============================================================
// HORA
// ============================================================
//
// IMPORTANTE:
//
// NO utilizamos:
//
// type="time"
//
// Porque Chrome puede mostrar segundos:
//
// 02:01:00
//
// En su lugar utilizamos:
//
// type="text"
//
// El conductor escribe:
//
// 0201
//
// y automáticamente queda:
//
// 02:01
//
// ============================================================

function formatTime(value) {

  let clean =
    String(value || '')
      .replace(/\D/g, '')
      .slice(0, 4)

  if (clean.length >= 3) {

    clean =
      clean.slice(0, 2) +
      ':' +
      clean.slice(2)
  }

  registrationTime.value =
    clean
}

// ============================================================
// VALIDAR HORA
// ============================================================

function isValidTime(value) {

  return /^([01]\d|2[0-3]):([0-5]\d)$/
    .test(value)
}

// ============================================================
// VALIDAR ODÓMETRO
// ============================================================

const validOdometer = computed(() => {

  const value =
    Number(odometer.value)

  return (
    Number.isFinite(value) &&
    value >= 0
  )
})

// ============================================================
// VALIDAR COMBUSTIBLE
// ============================================================

const validFuel = computed(() => {

  const percentage =
    Number(fuelPercentage.value)

  const liters =
    Number(fuelLiters.value)

  const percentageValid =
    Number.isFinite(percentage) &&
    percentage >= 0 &&
    percentage <= 100

  const litersValid =
    Number.isFinite(liters) &&
    liters >= 0 &&
    liters <= tankCapacity.value

  return (
    percentageValid &&
    litersValid
  )
})

// ============================================================
// VALIDACIÓN PARA CONTINUAR
// ============================================================
//
// OBLIGATORIO:
//
// ✓ Combustible
// ✓ Odómetro
// ✓ Hora de registro
//
// OPCIONAL:
//
// ○ Observaciones
//
// ============================================================

const canContinue = computed(() => {

  return (
    validFuel.value &&
    validOdometer.value &&
    isValidTime(
      registrationTime.value
    )
  )
})

// ============================================================
// CONTINUAR
// ============================================================

function continuar() {

  if (!canContinue.value) {
    return
  }

  const fuelData = {

    // --------------------------------------------------------
    // COMBUSTIBLE
    // --------------------------------------------------------

    percentage:
      Number(
        fuelPercentage.value
      ),

    liters:
      Number(
        fuelLiters.value
      ),

    tankCapacity:
      tankCapacity.value,

    // --------------------------------------------------------
    // ODÓMETRO
    // --------------------------------------------------------

    odometer:
      Number(
        odometer.value
      ),

    // --------------------------------------------------------
    // HORA
    // --------------------------------------------------------

    registrationTime:
      registrationTime.value,

    // --------------------------------------------------------
    // OBSERVACIONES
    // OPCIONAL
    // --------------------------------------------------------

    observations:
      observations.value.trim(),

    // --------------------------------------------------------
    // DATOS DEL SERVICIO
    // --------------------------------------------------------

    vehicle:
      props.vehicle || null,

    route:
      props.route || null,

    cargo:
      props.cargo || null,

    // --------------------------------------------------------
    // FECHA DEL REGISTRO
    // --------------------------------------------------------

    registeredAt:
      new Date().toISOString(),
  }

  // Evento principal.
  emit('next', fuelData)

  // Evento compatible con implementaciones anteriores.
  emit('fuelData', fuelData)
}

// ============================================================
// VOLVER
// ============================================================

function volver() {
  emit('back')
}
</script>


<template>

  <div class="max-w-5xl mx-auto">

    <!-- ====================================================== -->
    <!-- ENCABEZADO -->
    <!-- ====================================================== -->

    <div class="mb-8">

      <div class="flex items-center gap-3 mb-3">

        <div
          class="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center"
        >

          <span
            class="material-symbols-outlined text-orange-600"
          >
            local_gas_station
          </span>

        </div>

        <div>

          <p
            class="text-xs font-black uppercase tracking-widest text-orange-600"
          >
            Paso 4 de 7
          </p>

          <h2
            class="text-2xl font-black text-slate-800"
          >
            Registrar combustible
          </h2>

        </div>

      </div>

      <p class="text-sm text-slate-500">
        Registra el nivel de combustible y el kilometraje
        antes de iniciar el servicio.
      </p>

    </div>


    <!-- ====================================================== -->
    <!-- RESUMEN DEL VEHÍCULO -->
    <!-- ====================================================== -->

    <div
      v-if="vehicle"
      class="mb-6 bg-cyan-50 border border-cyan-200 rounded-2xl p-4"
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

          <p
            class="font-black text-slate-800"
          >

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


    <!-- ====================================================== -->
    <!-- NIVEL DE COMBUSTIBLE -->
    <!-- ====================================================== -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <div class="mb-5">

        <h3
          class="font-black text-slate-800"
        >
          Nivel de combustible
        </h3>

        <p
          class="text-xs text-slate-400 mt-1"
        >
          Indica cuánto combustible tiene el vehículo antes de salir.
        </p>

      </div>


      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-5"
      >

        <!-- ================================================== -->
        <!-- PORCENTAJE -->
        <!-- ================================================== -->

        <div>

          <label
            for="fuelPercentage"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Combustible
          </label>

          <div class="relative">

            <input
              id="fuelPercentage"
              v-model="fuelPercentage"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="Ej. 75"
              @input="updateFromPercentage"
              class="w-full h-12 px-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition"
            />

            <span
              class="absolute right-4 top-3.5 text-sm font-bold text-slate-400"
            >
              %
            </span>

          </div>

        </div>


        <!-- ================================================== -->
        <!-- LITROS -->
        <!-- ================================================== -->

        <div>

          <label
            for="fuelLiters"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Litros estimados
          </label>

          <div class="relative">

            <input
              id="fuelLiters"
              v-model="fuelLiters"
              type="number"
              min="0"
              :max="tankCapacity"
              step="0.1"
              placeholder="Ej. 300"
              @input="updateFromLiters"
              class="w-full h-12 px-4 pr-14 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition"
            />

            <span
              class="absolute right-4 top-3.5 text-sm font-bold text-slate-400"
            >
              L
            </span>

          </div>

        </div>

      </div>


      <!-- CAPACIDAD -->

      <div
        class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
      >

        <div
          class="flex items-center justify-between"
        >

          <span
            class="text-xs text-slate-500"
          >
            Capacidad estimada del tanque
          </span>

          <strong
            class="text-sm text-slate-700"
          >
            {{ tankCapacity }} L
          </strong>

        </div>

      </div>

    </div>


    <!-- ====================================================== -->
    <!-- KILOMETRAJE -->
    <!-- ====================================================== -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <div class="mb-5">

        <h3
          class="font-black text-slate-800"
        >
          Kilometraje inicial
        </h3>

        <p
          class="text-xs text-slate-400 mt-1"
        >
          Registra la lectura del odómetro antes de salir.
        </p>

      </div>


      <label
        for="odometer"
        class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
      >
        Odómetro
      </label>


      <div class="relative">

        <input
          id="odometer"
          v-model="odometer"
          type="number"
          min="0"
          step="1"
          placeholder="Ej. 200000"
          class="w-full h-12 px-4 pr-14 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition"
        />

        <span
          class="absolute right-4 top-3.5 text-xs font-bold text-slate-400"
        >
          km
        </span>

      </div>

    </div>


    <!-- ====================================================== -->
    <!-- HORA DE REGISTRO -->
    <!-- ====================================================== -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <div class="mb-5">

        <h3
          class="font-black text-slate-800"
        >
          Hora de registro
        </h3>

        <p
          class="text-xs text-slate-400 mt-1"
        >
          Registra la hora en que verificaste el combustible.
        </p>

      </div>


      <label
        for="registrationTime"
        class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
      >
        Hora
      </label>


      <div class="relative">

        <span
          class="material-symbols-outlined absolute left-3.5 top-3 text-blue-600 pointer-events-none"
        >
          schedule
        </span>


        <!-- ================================================== -->
        <!-- IMPORTANTE: TYPE TEXT -->
        <!-- ================================================== -->

        <input
          id="registrationTime"
          :value="registrationTime"
          type="text"
          inputmode="numeric"
          maxlength="5"
          placeholder="02:01"
          autocomplete="off"
          @input="
            formatTime(
              $event.target.value
            )
          "
          class="w-full h-12 pl-11 pr-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition"
        />

      </div>


      <p
        class="text-[11px] text-slate-400 mt-2"
      >
        Formato HH:MM. Los segundos no se utilizan.
      </p>


      <!-- ERROR HORA -->

      <p
        v-if="
          registrationTime &&
          !isValidTime(registrationTime)
        "
        class="text-xs text-red-500 mt-2"
      >
        Introduce una hora válida, por ejemplo 02:01.
      </p>

    </div>


    <!-- ====================================================== -->
    <!-- OBSERVACIONES -->
    <!-- ====================================================== -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
    >

      <div
        class="flex items-center justify-between mb-2"
      >

        <label
          for="fuelObservations"
          class="block text-xs font-bold text-slate-600 uppercase tracking-wider"
        >
          Observaciones
        </label>

        <span
          class="text-[10px] font-bold text-slate-400 uppercase"
        >
          Opcional
        </span>

      </div>


      <textarea
        id="fuelObservations"
        v-model="observations"
        rows="3"
        placeholder="Ej. Se verificó el nivel de combustible antes de iniciar el servicio..."
        class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-orange-500 focus:bg-white transition"
      ></textarea>


      <p
        class="text-[11px] text-slate-400 mt-2"
      >
        Puedes dejar este campo vacío.
      </p>

    </div>


    <!-- ====================================================== -->
    <!-- BOTONES -->
    <!-- ====================================================== -->

    <div
      class="flex items-center justify-between gap-3"
    >

      <!-- ATRÁS -->

      <button
        type="button"
        @click="volver"
        class="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
      >

        <span
          class="material-symbols-outlined"
        >
          arrow_back
        </span>

        Atrás

      </button>


      <!-- CONTINUAR -->

      <button
        type="button"
        @click="continuar"
        :disabled="!canContinue"
        class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition"
        :class="
          canContinue
            ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
            : 'bg-slate-300 cursor-not-allowed'
        "
      >

        Continuar

        <span
          class="material-symbols-outlined"
        >
          arrow_forward
        </span>

      </button>

    </div>


    <!-- ====================================================== -->
    <!-- AYUDA -->
    <!-- ====================================================== -->

    <div
      v-if="!canContinue"
      class="mt-4 text-center"
    >

      <p
        class="text-xs text-slate-400"
      >
        Completa combustible, odómetro y una hora válida
        para continuar.
      </p>

    </div>

  </div>
</template>