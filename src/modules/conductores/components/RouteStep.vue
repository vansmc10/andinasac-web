<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  vehicle: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['next', 'back'])

// ============================================================
// CIUDADES DISPONIBLES
// ============================================================

const cities = [
  { name: 'Lima', lat: -12.0464, lng: -77.0428 },
  { name: 'Trujillo', lat: -8.1116, lng: -79.0287 },
  { name: 'Chiclayo', lat: -6.7714, lng: -79.8409 },
  { name: 'Piura', lat: -5.1945, lng: -80.6328 },
  { name: 'Chimbote', lat: -9.0745, lng: -78.5936 },
  { name: 'Huarmey', lat: -10.0681, lng: -78.1522 },
  { name: 'Barranca', lat: -10.7525, lng: -77.7592 },
  { name: 'Huaraz', lat: -9.528, lng: -77.5278 },
  { name: 'Ica', lat: -14.0678, lng: -75.7286 },
  { name: 'Nazca', lat: -14.8353, lng: -74.9328 },
  { name: 'Arequipa', lat: -16.409, lng: -71.5375 },
  { name: 'Camaná', lat: -16.6228, lng: -72.7111 },
  { name: 'Moquegua', lat: -17.1936, lng: -70.9357 },
  { name: 'Tacna', lat: -18.0147, lng: -70.2536 },
  { name: 'Cusco', lat: -13.5319, lng: -71.9675 },
  { name: 'Abancay', lat: -13.6339, lng: -72.8814 },
  { name: 'Huancayo', lat: -12.0651, lng: -75.2049 },
  { name: 'Ayacucho', lat: -13.1631, lng: -74.2236 },
  { name: 'Pucallpa', lat: -8.3791, lng: -74.5539 },
  { name: 'Tarapoto', lat: -6.4833, lng: -76.3667 },
  { name: 'Tumbes', lat: -3.5669, lng: -80.4515 },
  { name: 'Cajamarca', lat: -7.1617, lng: -78.5128 },
  { name: 'Chachapoyas', lat: -6.2317, lng: -77.8690 },
  { name: 'Huánuco', lat: -9.93, lng: -76.2422 },
  { name: 'Cerro de Pasco', lat: -10.6864, lng: -76.2567 },
  { name: 'Juliaca', lat: -15.4997, lng: -70.1333 },
  { name: 'Puno', lat: -15.8402, lng: -70.0219 },
  { name: 'Ilo', lat: -17.6394, lng: -71.3375 },
]

// ============================================================
// CONFIGURACIÓN DE LA ESTIMACIÓN
// ============================================================
//
// Estos valores NO representan una medición exacta.
//
// Se utilizan únicamente para obtener una referencia
// aproximada del tiempo de viaje.
//
// ============================================================

const AVERAGE_SPEED_KMH = 70

// La distancia entre dos coordenadas es una distancia
// geográfica. Para aproximarnos a una distancia por carretera
// utilizamos un factor estimativo.
//
// NO representa una distancia exacta de carretera.

const ROAD_FACTOR = 1.20

// ============================================================
// DATOS DEL FORMULARIO
// ============================================================

const origin = ref('')
const destination = ref('')

const departureTime = ref('')

const observations = ref('')

// ============================================================
// PARADAS
// ============================================================

const stops = ref([])
const newStop = ref('')

// ============================================================
// RESULTADO DEL CÁLCULO
// ============================================================

const selectedRouteData = ref(null)

// ============================================================
// NORMALIZAR TEXTO
// ============================================================

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// ============================================================
// BUSCAR CIUDAD
// ============================================================

function getCity(name) {
  return cities.find(
    (city) =>
      normalizeText(city.name) === normalizeText(name)
  )
}

// ============================================================
// CALCULAR DISTANCIA GEOGRÁFICA
// ============================================================
//
// Fórmula de Haversine.
//
// El resultado es una aproximación geográfica,
// NO una distancia exacta por carretera.
//
// ============================================================

function calculateGeographicalDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return R * c
}

// ============================================================
// REGLA DE TRES SIMPLE
// ============================================================
//
// Velocidad promedio → tiempo
//
// 70 km  → 1 hora
// X km   → ? horas
//
// X = distancia / 70
//
// El resultado es solamente ESTIMADO.
//
// ============================================================

function calculateTravelTime(distanceKm) {
  const totalHours =
    distanceKm / AVERAGE_SPEED_KMH

  const totalMinutes = Math.max(
    1,
    Math.round(totalHours * 60)
  )

  return {
    hours: Math.floor(totalMinutes / 60),

    minutes:
      totalMinutes % 60,

    totalMinutes,
  }
}

// ============================================================
// FORMATEAR DURACIÓN
// ============================================================

function formatDuration(totalMinutes) {
  const hours =
    Math.floor(totalMinutes / 60)

  const minutes =
    totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min aprox.`
  }

  if (minutes === 0) {
    return `${hours} h aprox.`
  }

  return `${hours} h ${minutes} min aprox.`
}

// ============================================================
// FORMATEAR DISTANCIA
// ============================================================

function formatDistance(distanceKm) {
  return `${Math.round(distanceKm).toLocaleString('es-PE')} km aprox.`
}

// ============================================================
// FORMATEAR HORA
// ============================================================
//
// IMPORTANTE:
//
// Se utiliza type="text" en el HTML.
//
// No utilizamos type="time".
//
// Por lo tanto:
// - No aparecen segundos.
// - No aparece "12:00 --".
// - Solo manejamos HH:MM.
//
// ============================================================

function formatTime(value) {
  let clean = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 4)

  if (clean.length >= 3) {
    clean =
      clean.slice(0, 2) +
      ':' +
      clean.slice(2)
  }

  departureTime.value = clean
}

// ============================================================
// VALIDAR HORA
// ============================================================

function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    value
  )
}

// ============================================================
// SUMAR MINUTOS A UNA HORA
// ============================================================

function addMinutesToTime(
  time,
  minutesToAdd
) {
  const [hours, minutes] =
    time.split(':').map(Number)

  const totalMinutes =
    hours * 60 +
    minutes +
    minutesToAdd

  const minutesInDay =
    24 * 60

  const normalized =
    ((totalMinutes % minutesInDay) +
      minutesInDay) %
    minutesInDay

  const resultHours =
    Math.floor(normalized / 60)

  const resultMinutes =
    normalized % 60

  return (
    String(resultHours).padStart(2, '0') +
    ':' +
    String(resultMinutes).padStart(2, '0')
  )
}

// ============================================================
// CALCULAR RUTA AUTOMÁTICAMENTE
// ============================================================

function calculateRoute() {
  selectedRouteData.value = null

  stops.value = []

  const originCity =
    getCity(origin.value)

  const destinationCity =
    getCity(destination.value)

  if (!originCity || !destinationCity) {
    return
  }

  // No se permite salir y llegar a la misma ciudad.

  if (
    normalizeText(originCity.name) ===
    normalizeText(destinationCity.name)
  ) {
    return
  }

  // ----------------------------------------------------------
  // 1. DISTANCIA GEOGRÁFICA
  // ----------------------------------------------------------

  const geographicalDistance =
    calculateGeographicalDistance(
      originCity.lat,
      originCity.lng,
      destinationCity.lat,
      destinationCity.lng
    )

  // ----------------------------------------------------------
  // 2. DISTANCIA ESTIMADA POR CARRETERA
  // ----------------------------------------------------------

  const estimatedRoadDistance =
    geographicalDistance *
    ROAD_FACTOR

  // ----------------------------------------------------------
  // 3. TIEMPO ESTIMADO
  // ----------------------------------------------------------

  const travelTime =
    calculateTravelTime(
      estimatedRoadDistance
    )

  // ----------------------------------------------------------
  // 4. GUARDAR RESULTADO
  // ----------------------------------------------------------

  selectedRouteData.value = {
    id:
      `${normalizeText(originCity.name)}-${normalizeText(destinationCity.name)}`,

    name:
      `${originCity.name} → ${destinationCity.name}`,

    origin:
      originCity.name,

    destination:
      destinationCity.name,

    geographicalDistanceKm:
      Number(
        geographicalDistance.toFixed(1)
      ),

    distanceKm:
      Number(
        estimatedRoadDistance.toFixed(1)
      ),

    distance:
      formatDistance(
        estimatedRoadDistance
      ),

    durationMinutes:
      travelTime.totalMinutes,

    duration:
      formatDuration(
        travelTime.totalMinutes
      ),

    averageSpeedKmh:
      AVERAGE_SPEED_KMH,

    roadFactor:
      ROAD_FACTOR,

    calculationMethod:
      'Estimación mediante distancia geográfica y regla de tres simple',
  }

  updateEstimatedArrival()
}

// ============================================================
// CAMBIO DE ORIGEN
// ============================================================

watch(origin, () => {
  destination.value = ''

  selectedRouteData.value = null

  stops.value = []
})

// ============================================================
// CAMBIO DE DESTINO
// ============================================================

watch(destination, () => {
  calculateRoute()
})

// ============================================================
// LLEGADA ESTIMADA
// ============================================================

const estimatedArrival = computed(() => {
  if (!selectedRouteData.value) {
    return ''
  }

  if (!isValidTime(departureTime.value)) {
    return ''
  }

  return addMinutesToTime(
    departureTime.value,
    selectedRouteData.value
      .durationMinutes
  )
})

function updateEstimatedArrival() {
  // La llegada se calcula automáticamente
  // mediante el computed estimatedArrival.
}

// ============================================================
// VALIDACIÓN
// ============================================================

const canContinue = computed(() => {
  return (
    !!origin.value &&
    !!destination.value &&
    !!selectedRouteData.value &&
    isValidTime(departureTime.value) &&
    !!estimatedArrival.value
  )
})

// ============================================================
// AGREGAR PARADA
// ============================================================

function agregarParada() {
  const stop =
    newStop.value.trim()

  if (!stop) {
    return
  }

  stops.value.push(stop)

  newStop.value = ''
}

// ============================================================
// ELIMINAR PARADA
// ============================================================

function eliminarParada(index) {
  stops.value.splice(index, 1)
}

// ============================================================
// CONTINUAR
// ============================================================

function continuar() {
  if (!canContinue.value) {
    return
  }

  const routeData = {
    // --------------------------------------------------------
    // TRAYECTO
    // --------------------------------------------------------

    origin:
      origin.value,

    destination:
      destination.value,

    // --------------------------------------------------------
    // HORARIO
    // --------------------------------------------------------

    departureTime:
      departureTime.value,

    estimatedArrival:
      estimatedArrival.value,

    // --------------------------------------------------------
    // RUTA ESTIMADA
    // --------------------------------------------------------

    routeId:
      selectedRouteData.value.id,

    routeName:
      selectedRouteData.value.name,

    // --------------------------------------------------------
    // DISTANCIA
    // --------------------------------------------------------

    distance:
      selectedRouteData.value.distance,

    distanceKm:
      selectedRouteData.value.distanceKm,

    // --------------------------------------------------------
    // TIEMPO
    // --------------------------------------------------------

    duration:
      selectedRouteData.value.duration,

    durationMinutes:
      selectedRouteData.value
        .durationMinutes,

    // --------------------------------------------------------
    // PARÁMETROS DEL CÁLCULO
    // --------------------------------------------------------

    averageSpeedKmh:
      selectedRouteData.value
        .averageSpeedKmh,

    roadFactor:
      selectedRouteData.value
        .roadFactor,

    calculationMethod:
      selectedRouteData.value
        .calculationMethod,

    // --------------------------------------------------------
    // PARADAS
    // --------------------------------------------------------

    stops:
      [...stops.value],

    // --------------------------------------------------------
    // OBSERVACIONES
    // OPCIONAL
    // --------------------------------------------------------

    observations:
      observations.value.trim(),

    // --------------------------------------------------------
    // VEHÍCULO
    // --------------------------------------------------------

    vehicle:
      props.vehicle || null,

    // --------------------------------------------------------
    // FECHA DE CÁLCULO
    // --------------------------------------------------------

    calculatedAt:
      new Date().toISOString(),
  }

  emit('next', routeData)
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
          class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"
        >
          <span
            class="material-symbols-outlined text-blue-700"
          >
            route
          </span>
        </div>

        <div>

          <p
            class="text-xs font-black uppercase tracking-widest text-blue-600"
          >
            Paso 2 de 7
          </p>

          <h2
            class="text-2xl font-black text-slate-800"
          >
            Registrar ruta
          </h2>

        </div>

      </div>

      <p class="text-sm text-slate-500">
        Selecciona la ciudad de salida y llegada.
        El sistema calculará automáticamente una
        distancia, tiempo y hora de llegada estimados.
      </p>

    </div>


    <!-- ====================================================== -->
    <!-- VEHÍCULO -->
    <!-- ====================================================== -->

    <div
      v-if="vehicle"
      class="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4"
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
            class="text-[10px] font-black uppercase tracking-widest text-slate-400"
          >
            Vehículo seleccionado
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


    <!-- ====================================================== -->
    <!-- TRAYECTO -->
    <!-- ====================================================== -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <div class="flex items-center gap-2 mb-5">

        <span
          class="material-symbols-outlined text-slate-500"
        >
          location_on
        </span>

        <div>

          <h3
            class="font-black text-slate-800"
          >
            Trayecto
          </h3>

          <p
            class="text-xs text-slate-400"
          >
            Selecciona las ciudades para calcular
            la ruta estimada.
          </p>

        </div>

      </div>


      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-5"
      >

        <!-- ================================================== -->
        <!-- ORIGEN -->
        <!-- ================================================== -->

        <div>

          <label
            for="origin"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Punto de origen
          </label>

          <div class="relative">

            <span
              class="material-symbols-outlined absolute left-3.5 top-3 text-emerald-600 pointer-events-none"
            >
              trip_origin
            </span>

            <select
              id="origin"
              v-model="origin"
              class="w-full h-12 pl-11 pr-10 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition appearance-none cursor-pointer"
            >

              <option
                value=""
                disabled
              >
                Selecciona ciudad de salida
              </option>

              <option
                v-for="city in cities"
                :key="`origin-${city.name}`"
                :value="city.name"
              >
                {{ city.name }}
              </option>

            </select>

            <span
              class="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none"
            >
              expand_more
            </span>

          </div>

        </div>


        <!-- ================================================== -->
        <!-- DESTINO -->
        <!-- ================================================== -->

        <div>

          <label
            for="destination"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Punto de destino
          </label>

          <div class="relative">

            <span
              class="material-symbols-outlined absolute left-3.5 top-3 text-red-500 pointer-events-none"
            >
              location_on
            </span>

            <select
              id="destination"
              v-model="destination"
              :disabled="!origin"
              class="w-full h-12 pl-11 pr-10 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >

              <option
                value=""
                disabled
              >
                {{
                  origin
                    ? 'Selecciona ciudad de llegada'
                    : 'Primero selecciona origen'
                }}
              </option>

              <option
                v-for="city in cities"
                :key="`destination-${city.name}`"
                :value="city.name"
                :disabled="city.name === origin"
              >
                {{ city.name }}
              </option>

            </select>

            <span
              class="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none"
            >
              expand_more
            </span>

          </div>

        </div>

      </div>


      <!-- ================================================== -->
      <!-- RESULTADO DEL CÁLCULO -->
      <!-- ================================================== -->

      <div
        v-if="selectedRouteData"
        class="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-5"
      >

        <div
          class="flex items-start gap-4"
        >

          <div
            class="w-11 h-11 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center"
          >

            <span
              class="material-symbols-outlined text-emerald-600"
            >
              check_circle
            </span>

          </div>


          <div class="flex-1">

            <p
              class="text-xs font-black uppercase tracking-wider text-emerald-600"
            >
              Trayecto estimado
            </p>

            <h4
              class="text-lg font-black text-slate-800 mt-1"
            >
              {{ selectedRouteData.name }}
            </h4>


            <!-- RESULTADOS -->

            <div
              class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4"
            >

              <!-- DISTANCIA -->

              <div
                class="bg-white rounded-xl p-3 border border-emerald-100"
              >

                <p
                  class="text-[10px] font-bold uppercase text-slate-400"
                >
                  Distancia estimada
                </p>

                <p
                  class="font-black text-slate-800 mt-1"
                >
                  {{ selectedRouteData.distance }}
                </p>

              </div>


              <!-- TIEMPO -->

              <div
                class="bg-white rounded-xl p-3 border border-emerald-100"
              >

                <p
                  class="text-[10px] font-bold uppercase text-slate-400"
                >
                  Tiempo estimado
                </p>

                <p
                  class="font-black text-slate-800 mt-1"
                >
                  {{ selectedRouteData.duration }}
                </p>

              </div>


              <!-- VELOCIDAD -->

              <div
                class="bg-white rounded-xl p-3 border border-emerald-100"
              >

                <p
                  class="text-[10px] font-bold uppercase text-slate-400"
                >
                  Velocidad promedio
                </p>

                <p
                  class="font-black text-slate-800 mt-1"
                >
                  {{ selectedRouteData.averageSpeedKmh }}
                  km/h
                </p>

              </div>

            </div>


            <!-- ACLARACIÓN -->

            <div
              class="mt-4 p-3 rounded-lg bg-emerald-100/60"
            >

              <div
                class="flex items-start gap-2"
              >

                <span
                  class="material-symbols-outlined text-emerald-700 text-lg"
                >
                  info
                </span>

                <p
                  class="text-[11px] leading-relaxed text-emerald-800"
                >
                  Los valores son
                  <strong>estimaciones operativas</strong>
                  y pueden variar según la ruta,
                  condiciones de carretera,
                  tráfico y paradas.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      <!-- ================================================== -->
      <!-- MISMA CIUDAD -->
      <!-- ================================================== -->

      <div
        v-else-if="
          origin &&
          destination &&
          origin === destination
        "
        class="mt-5 rounded-xl bg-red-50 border border-red-200 p-4"
      >

        <div
          class="flex items-start gap-3"
        >

          <span
            class="material-symbols-outlined text-red-600"
          >
            error
          </span>

          <div>

            <p
              class="font-bold text-sm text-red-800"
            >
              Origen y destino no pueden ser iguales.
            </p>

          </div>

        </div>

      </div>

    </div>


    <!-- ====================================================== -->
    <!-- HORARIO -->
    <!-- ====================================================== -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <div class="mb-5">

        <h3
          class="font-black text-slate-800"
        >
          Horario del servicio
        </h3>

        <p
          class="text-xs text-slate-400 mt-1"
        >
          Registra únicamente la hora de salida.
          La llegada será calculada automáticamente.
        </p>

      </div>


      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-5"
      >

        <!-- ================================================== -->
        <!-- HORA DE SALIDA -->
        <!-- ================================================== -->

        <div>

          <label
            for="departureTime"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Hora de salida
          </label>

          <div class="relative">

            <span
              class="material-symbols-outlined absolute left-3.5 top-3 text-blue-600 pointer-events-none"
            >
              schedule
            </span>

            <input
              id="departureTime"
              :value="departureTime"
              type="text"
              inputmode="numeric"
              maxlength="5"
              placeholder="12:00"
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
            class="text-[11px] text-slate-400 mt-1"
          >
            Formato HH:MM. No se utilizan segundos.
          </p>

        </div>


        <!-- ================================================== -->
        <!-- LLEGADA ESTIMADA -->
        <!-- ================================================== -->

        <div>

          <label
            for="estimatedArrival"
            class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Llegada estimada
          </label>

          <div class="relative">

            <span
              class="material-symbols-outlined absolute left-3.5 top-3 text-emerald-600 pointer-events-none"
            >
              flag
            </span>

            <input
              id="estimatedArrival"
              :value="
                estimatedArrival || '--:--'
              "
              type="text"
              readonly
              class="w-full h-12 pl-11 pr-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-800 font-black cursor-default"
            />

          </div>

          <p
            class="text-[11px] text-emerald-600 mt-1"
          >
            Se calcula automáticamente como una estimación.
          </p>

        </div>

      </div>

    </div>


    <!-- ====================================================== -->
    <!-- PARADAS -->
    <!-- ====================================================== -->

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
    >

      <div class="mb-5">

        <h3
          class="font-black text-slate-800"
        >
          Paradas del recorrido
        </h3>

        <p
          class="text-xs text-slate-400 mt-1"
        >
          Las paradas son opcionales.
        </p>

      </div>


      <!-- PARADAS -->

      <div
        v-if="stops.length"
        class="space-y-3 mb-5"
      >

        <div
          v-for="(stop, index) in stops"
          :key="`${stop}-${index}`"
          class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
        >

          <div
            class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"
          >

            <span
              class="material-symbols-outlined text-blue-600 text-lg"
            >
              location_on
            </span>

          </div>

          <div class="flex-1">

            <p
              class="text-xs font-black text-slate-400 uppercase"
            >
              Parada {{ index + 1 }}
            </p>

            <p
              class="font-bold text-slate-700"
            >
              {{ stop }}
            </p>

          </div>

          <button
            type="button"
            @click="eliminarParada(index)"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
            title="Eliminar parada"
          >

            <span
              class="material-symbols-outlined"
            >
              delete
            </span>

          </button>

        </div>

      </div>


      <!-- AGREGAR PARADA -->

      <div
        class="flex flex-col sm:flex-row gap-3"
      >

        <input
          v-model="newStop"
          type="text"
          placeholder="Ej. Chimbote"
          autocomplete="off"
          @keyup.enter="agregarParada"
          class="flex-1 h-11 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
        />

        <button
          type="button"
          @click="agregarParada"
          class="h-11 px-5 rounded-xl border border-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
        >

          <span
            class="material-symbols-outlined"
          >
            add
          </span>

          Agregar parada

        </button>

      </div>

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
          for="routeObservations"
          class="block text-xs font-bold text-slate-600 uppercase tracking-wider"
        >
          Observaciones de la ruta
        </label>

        <span
          class="text-[10px] font-bold text-slate-400 uppercase"
        >
          Opcional
        </span>

      </div>


      <textarea
        id="routeObservations"
        v-model="observations"
        rows="3"
        placeholder="Indica alguna condición especial del recorrido..."
        class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:bg-white transition"
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
        Selecciona origen, destino y registra
        una hora de salida válida.
      </p>

    </div>

  </div>
</template>