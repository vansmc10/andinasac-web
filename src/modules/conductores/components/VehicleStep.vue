<script setup>
import { ref } from 'vue'

const emit = defineEmits(['next'])

const selectedVehicle = ref('')

const vehicles = [
  {
    id: 452,
    code: 'Unidad #452',
    model: 'Volvo FH 500',
    plate: 'ABC-452',
    type: 'Tracto camión',
    status: 'Disponible',
  },
  {
    id: 221,
    code: 'Unidad #221',
    model: 'Scania R450',
    plate: 'DEF-221',
    type: 'Tracto camión',
    status: 'Disponible',
  },
  {
    id: 110,
    code: 'Unidad #110',
    model: 'Mercedes-Benz Actros',
    plate: 'GHI-110',
    type: 'Tracto camión',
    status: 'Disponible',
  },
]

function continuar() {
  if (!selectedVehicle.value) {
    return
  }

  const vehicle = vehicles.find(
    (item) => String(item.id) === String(selectedVehicle.value)
  )

  emit('next', vehicle)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">

    <!-- ENCABEZADO -->

    <div class="mb-8">

      <div class="flex items-center gap-3 mb-3">

        <div
          class="w-11 h-11 rounded-xl bg-cyan-100 flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-cyan-700">
            local_shipping
          </span>
        </div>

        <div>
          <p
            class="text-xs font-black uppercase tracking-widest text-cyan-600"
          >
            Paso 1 de 7
          </p>

          <h2 class="text-2xl font-black text-slate-800">
            Seleccionar vehículo
          </h2>
        </div>

      </div>

      <p class="text-sm text-slate-500">
        Selecciona el camión que vas a conducir durante este servicio.
      </p>

    </div>

    <!-- VEHÍCULOS -->

    <div class="space-y-4">

      <button
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        type="button"
        @click="selectedVehicle = String(vehicle.id)"
        class="w-full text-left bg-white rounded-2xl border-2 p-5 transition-all duration-200"
        :class="
          selectedVehicle === String(vehicle.id)
            ? 'border-cyan-500 bg-cyan-50/40 shadow-md'
            : 'border-slate-200 hover:border-cyan-300 hover:shadow-sm'
        "
      >

        <div class="flex items-center gap-4">

          <!-- ICONO -->

          <div
            class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            :class="
              selectedVehicle === String(vehicle.id)
                ? 'bg-cyan-100'
                : 'bg-slate-100'
            "
          >

            <span
              class="material-symbols-outlined text-3xl"
              :class="
                selectedVehicle === String(vehicle.id)
                  ? 'text-cyan-700'
                  : 'text-slate-500'
              "
            >
              local_shipping
            </span>

          </div>

          <!-- INFORMACIÓN -->

          <div class="flex-1 min-w-0">

            <div class="flex items-center gap-3 flex-wrap">

              <h3 class="text-lg font-black text-slate-800">
                {{ vehicle.code }}
              </h3>

              <span
                class="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"
              >
                {{ vehicle.status }}
              </span>

            </div>

            <p class="text-sm font-semibold text-slate-600 mt-1">
              {{ vehicle.model }}
            </p>

            <div
              class="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-slate-400"
            >

              <span>
                Placa: {{ vehicle.plate }}
              </span>

              <span>
                {{ vehicle.type }}
              </span>

            </div>

          </div>

          <!-- RADIO VISUAL -->

          <div
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            :class="
              selectedVehicle === String(vehicle.id)
                ? 'border-cyan-600'
                : 'border-slate-300'
            "
          >

            <div
              v-if="selectedVehicle === String(vehicle.id)"
              class="w-3 h-3 rounded-full bg-cyan-600"
            ></div>

          </div>

        </div>

      </button>

    </div>

    <!-- AVISO -->

    <div
      class="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3"
    >

      <span class="material-symbols-outlined text-blue-600">
        info
      </span>

      <div>

        <p class="text-sm font-bold text-blue-900">
          Verifica el vehículo antes de continuar
        </p>

        <p class="text-xs text-blue-700 mt-1">
          Asegúrate de que la unidad seleccionada corresponda al camión
          que vas a utilizar.
        </p>

      </div>

    </div>

    <!-- BOTÓN -->

    <div class="flex justify-end mt-8">

      <button
        type="button"
        @click="continuar"
        :disabled="!selectedVehicle"
        class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
        :class="
          selectedVehicle
            ? 'bg-cyan-600 hover:bg-cyan-700 shadow-md'
            : 'bg-slate-300 cursor-not-allowed'
        "
      >

        Continuar

        <span class="material-symbols-outlined text-lg">
          arrow_forward
        </span>

      </button>

    </div>

  </div>
</template>