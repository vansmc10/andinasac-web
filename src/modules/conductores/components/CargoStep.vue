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
})

const emit = defineEmits(['next', 'back'])

// ═════════════════════════════════════════════
// DATOS DE LA CARGA
// ═════════════════════════════════════════════

const cargoType = ref('')
const cargoDescription = ref('')
const weight = ref('')
const quantity = ref('')
const unit = ref('toneladas')
const loadDocument = ref('')
const observations = ref('')

// ═════════════════════════════════════════════
// TIPOS DE CARGA
// ═════════════════════════════════════════════

const cargoTypes = [
  {
    id: 'alimentos',
    name: 'Alimentos',
    icon: 'restaurant',
  },
  {
    id: 'mercaderia',
    name: 'Mercadería general',
    icon: 'inventory_2',
  },
  {
    id: 'materiales',
    name: 'Materiales',
    icon: 'construction',
  },
  {
    id: 'refrigerada',
    name: 'Carga refrigerada',
    icon: 'ac_unit',
  },
  {
    id: 'peligrosa',
    name: 'Carga especial',
    icon: 'warning',
  },
  {
    id: 'otra',
    name: 'Otra',
    icon: 'category',
  },
]

// ═════════════════════════════════════════════
// VALIDACIÓN
// ═════════════════════════════════════════════

const canContinue = computed(() => {
  return (
    cargoType.value !== '' &&
    cargoDescription.value.trim() !== '' &&
    weight.value !== '' &&
    Number(weight.value) > 0 &&
    quantity.value !== '' &&
    Number(quantity.value) > 0
  )
})

// ═════════════════════════════════════════════
// SELECCIONAR TIPO DE CARGA
// ═════════════════════════════════════════════

function seleccionarTipo(tipo) {
  cargoType.value = tipo
}

// ═════════════════════════════════════════════
// CONTINUAR
// ═════════════════════════════════════════════

function continuar() {
  if (!canContinue.value) {
    return
  }

  const selectedType = cargoTypes.find(
    (type) => type.id === cargoType.value
  )

  const cargoData = {
    type: cargoType.value,
    typeName: selectedType?.name || '',
    description: cargoDescription.value.trim(),
    weight: Number(weight.value),
    unit: unit.value,
    quantity: Number(quantity.value),
    loadDocument: loadDocument.value.trim(),
    observations: observations.value.trim(),
    vehicle: props.vehicle || null,
    route: props.route || null,
  }

  emit('next', cargoData)
}

// ═════════════════════════════════════════════
// VOLVER
// ═════════════════════════════════════════════

function volver() {
  emit('back')
}
</script>

<template>
  <div class="max-w-5xl mx-auto">

    <!-- ═══════════════════════════════════════ -->
    <!-- ENCABEZADO -->
    <!-- ═══════════════════════════════════════ -->

    <div class="mb-8">

      <div class="flex items-center gap-3 mb-3">

        <div
          class="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-orange-600">
            inventory_2
          </span>
        </div>

        <div>

          <p
            class="text-xs font-black uppercase tracking-widest text-orange-600"
          >
            Paso 3 de 7
          </p>

          <h2 class="text-2xl font-black text-slate-800">
            Registrar carga
          </h2>

        </div>

      </div>

      <p class="text-sm text-slate-500">
        Registra la carga que transportarás durante este servicio.
      </p>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- RESUMEN DEL SERVICIO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6"
    >

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- VEHÍCULO -->

        <div
          v-if="vehicle"
          class="flex items-center gap-3"
        >

          <div
            class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center"
          >

            <span class="material-symbols-outlined text-cyan-700">
              local_shipping
            </span>

          </div>

          <div>

            <p
              class="text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Vehículo
            </p>

            <p class="font-black text-slate-800">
              {{ vehicle.code }}

              <span class="font-medium text-slate-500">
                · {{ vehicle.model }}
              </span>
            </p>

          </div>

        </div>


        <!-- RUTA -->

        <div
          v-if="route"
          class="flex items-center gap-3"
        >

          <div
            class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"
          >

            <span class="material-symbols-outlined text-blue-700">
              route
            </span>

          </div>

          <div>

            <p
              class="text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Ruta
            </p>

            <p class="font-black text-slate-800">
              {{ route.origin }}
              →
              {{ route.destination }}
            </p>

          </div>

        </div>

      </div>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- TIPO DE CARGA -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <div class="mb-5">

        <h3 class="font-black text-slate-800">
          Tipo de carga
        </h3>

        <p class="text-xs text-slate-400 mt-1">
          Selecciona el tipo de mercancía que transportarás.
        </p>

      </div>


      <div
        class="grid grid-cols-2 md:grid-cols-3 gap-4"
      >

        <button
          v-for="type in cargoTypes"
          :key="type.id"
          type="button"
          @click="seleccionarTipo(type.id)"
          class="text-left rounded-xl border-2 p-4 transition-all"
          :class="
            cargoType === type.id
              ? 'border-orange-500 bg-orange-50 shadow-sm'
              : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
          "
        >

          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            :class="
              cargoType === type.id
                ? 'bg-orange-100'
                : 'bg-slate-100'
            "
          >

            <span
              class="material-symbols-outlined"
              :class="
                cargoType === type.id
                  ? 'text-orange-600'
                  : 'text-slate-500'
              "
            >
              {{ type.icon }}
            </span>

          </div>

          <p class="font-bold text-slate-700 text-sm">
            {{ type.name }}
          </p>

        </button>

      </div>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- DESCRIPCIÓN -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <h3 class="font-black text-slate-800 mb-1">
        Información de la carga
      </h3>

      <p class="text-xs text-slate-400 mb-5">
        Ingresa las características principales de la mercancía.
      </p>


      <!-- DESCRIPCIÓN -->

      <div class="mb-5">

        <label
          for="cargoDescription"
          class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
        >
          Descripción de la carga
        </label>

        <input
          id="cargoDescription"
          v-model="cargoDescription"
          type="text"
          placeholder="Ej. Productos alimenticios empaquetados"
          class="w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition"
        />

      </div>


      <!-- PESO / CANTIDAD / UNIDAD -->

      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-5"
      >

        <!-- PESO -->

        <div>

          <label
            for="weight"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Peso total
          </label>

          <div class="relative">

            <input
              id="weight"
              v-model="weight"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              class="w-full h-12 px-4 pr-20 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition"
            />

            <span
              class="absolute right-4 top-3.5 text-xs font-bold text-slate-400"
            >
              {{ unit }}
            </span>

          </div>

        </div>


        <!-- CANTIDAD -->

        <div>

          <label
            for="quantity"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Cantidad
          </label>

          <input
            id="quantity"
            v-model="quantity"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            class="w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition"
          />

        </div>


        <!-- UNIDAD -->

        <div>

          <label
            for="unit"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Unidad de peso
          </label>

          <select
            id="unit"
            v-model="unit"
            class="w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition"
          >

            <option value="toneladas">
              Toneladas
            </option>

            <option value="kilogramos">
              Kilogramos
            </option>

          </select>

        </div>

      </div>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- DOCUMENTO DE CARGA -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <label
        for="loadDocument"
        class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
      >
        Documento / orden de carga
      </label>

      <div class="relative">

        <span
          class="material-symbols-outlined absolute left-3.5 top-3 text-slate-400"
        >
          description
        </span>

        <input
          id="loadDocument"
          v-model="loadDocument"
          type="text"
          placeholder="Ej. OC-2026-00452"
          class="w-full h-12 pl-11 pr-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition"
        />

      </div>

      <p class="text-xs text-slate-400 mt-2">
        Puedes ingresar el número de orden, guía o documento relacionado.
      </p>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- OBSERVACIONES -->
    <!-- ═══════════════════════════════════════ -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
    >

      <label
        for="cargoObservations"
        class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
      >
        Observaciones
      </label>

      <textarea
        id="cargoObservations"
        v-model="observations"
        rows="3"
        placeholder="Indica alguna condición especial de la carga..."
        class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-orange-500 focus:bg-white transition"
      ></textarea>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- BOTONES -->
    <!-- ═══════════════════════════════════════ -->

    <div class="flex items-center justify-between gap-3">

      <button
        type="button"
        @click="volver"
        class="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
      >

        <span class="material-symbols-outlined">
          arrow_back
        </span>

        Atrás

      </button>


      <button
        type="button"
        @click="continuar"
        :disabled="!canContinue"
        class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition"
        :class="
          canContinue
            ? 'bg-orange-500 hover:bg-orange-600 shadow-md'
            : 'bg-slate-300 cursor-not-allowed'
        "
      >

        Continuar

        <span class="material-symbols-outlined">
          arrow_forward
        </span>

      </button>

    </div>

  </div>
</template>