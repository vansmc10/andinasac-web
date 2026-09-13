<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()

// ═════════════════════════════════════════════
// SERVICIO ACTIVO
// ═════════════════════════════════════════════

const activeTrip = ref(null)

const loading = ref(true)
const showPanicModal = ref(false)
const showIncidentModal = ref(false)
const showFinishModal = ref(false)

const emergencyActive = ref(false)
const emergencyType = ref('')
const emergencyStatus = ref('')

// ═════════════════════════════════════════════
// AUDIO
// ═════════════════════════════════════════════

const isRecording = ref(false)
const recordingSeconds = ref(0)
const audioStatus = ref('')
const audioError = ref('')

let mediaRecorder = null
let audioChunks = []
let recordingTimer = null

// ═════════════════════════════════════════════
// INCIDENTE
// ═════════════════════════════════════════════

const incidentForm = ref({
  type: 'other',
  severity: 'medium',
  description: '',
  location: '',
})

// ═════════════════════════════════════════════
// TIPOS DE INCIDENTE
// ═════════════════════════════════════════════

const incidentTypes = [
  {
    value: 'robo',
    label: 'Intento de robo',
    icon: 'security',
  },
  {
    value: 'accident',
    label: 'Accidente',
    icon: 'car_crash',
  },
  {
    value: 'medical',
    label: 'Emergencia médica',
    icon: 'medical_services',
  },
  {
    value: 'mechanical',
    label: 'Falla mecánica',
    icon: 'build',
  },
  {
    value: 'route',
    label: 'Problema en ruta',
    icon: 'wrong_location',
  },
  {
    value: 'other',
    label: 'Otro',
    icon: 'warning',
  },
]

const severityOptions = [
  {
    value: 'low',
    label: 'Baja',
  },
  {
    value: 'medium',
    label: 'Media',
  },
  {
    value: 'high',
    label: 'Alta',
  },
  {
    value: 'critical',
    label: 'Crítica',
  },
]

// ═════════════════════════════════════════════
// USUARIO
// ═════════════════════════════════════════════

const storedUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
})

const driverName = computed(() => {
  return (
    storedUser.value?.name ||
    storedUser.value?.nombre ||
    storedUser.value?.email ||
    'Conductor'
  )
})

const driverEmail = computed(() => {
  return storedUser.value?.email || ''
})

// ═════════════════════════════════════════════
// DATOS DEL SERVICIO
// ═════════════════════════════════════════════

const vehicle = computed(() => {
  return activeTrip.value?.vehicle || null
})

const route = computed(() => {
  return activeTrip.value?.route || null
})

const cargo = computed(() => {
  return activeTrip.value?.cargo || null
})

const fuel = computed(() => {
  return activeTrip.value?.fuel || null
})

const inspection = computed(() => {
  return activeTrip.value?.inspection || null
})

const incidents = computed(() => {
  return activeTrip.value?.incidents || []
})

const vehicleCode = computed(() => {
  return (
    vehicle.value?.code ||
    vehicle.value?.plate ||
    vehicle.value?.placa ||
    'Sin placa'
  )
})

const vehicleModel = computed(() => {
  return (
    vehicle.value?.model ||
    vehicle.value?.modelo ||
    'Vehículo'
  )
})

const routeName = computed(() => {
  return (
    route.value?.name ||
    route.value?.route ||
    route.value?.description ||
    'Ruta asignada'
  )
})

const routeOrigin = computed(() => {
  return (
    route.value?.origin ||
    route.value?.origen ||
    route.value?.startPoint ||
    route.value?.start ||
    'Origen'
  )
})

const routeDestination = computed(() => {
  return (
    route.value?.destination ||
    route.value?.destino ||
    route.value?.endPoint ||
    route.value?.end ||
    'Destino'
  )
})

const fuelPercentage = computed(() => {
  return fuel.value?.percentage ?? 0
})

const fuelLiters = computed(() => {
  return fuel.value?.liters ?? 0
})

const odometer = computed(() => {
  return fuel.value?.odometer ?? 'No registrado'
})

const cargoDescription = computed(() => {
  return (
    cargo.value?.description ||
    cargo.value?.type ||
    cargo.value?.cargoType ||
    'Carga registrada'
  )
})

// ═════════════════════════════════════════════
// HORA DE INICIO
// ═════════════════════════════════════════════

const startedAt = computed(() => {
  return activeTrip.value?.startedAt || null
})

const startedAtFormatted = computed(() => {
  if (!startedAt.value) {
    return 'No registrada'
  }

  try {
    return new Date(startedAt.value).toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return 'No registrada'
  }
})

// ═════════════════════════════════════════════
// ESTADO DE INSPECCIÓN
// ═════════════════════════════════════════════

const inspectionHasProblems = computed(() => {
  return Boolean(inspection.value?.hasProblems)
})

// ═════════════════════════════════════════════
// CARGAR SERVICIO
// ═════════════════════════════════════════════

function loadActiveTrip() {
  loading.value = true

  try {
    const storedTrip = localStorage.getItem('activeTrip')

    if (!storedTrip) {
      activeTrip.value = null
      return
    }

    activeTrip.value = JSON.parse(storedTrip)
  } catch (error) {
    console.error('Error al cargar el servicio activo:', error)
    activeTrip.value = null
  } finally {
    loading.value = false
  }
}

// ═════════════════════════════════════════════
// MAPA
// ═════════════════════════════════════════════

const mapUrl = computed(() => {
  const origin = encodeURIComponent(routeOrigin.value)
  const destination = encodeURIComponent(routeDestination.value)

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
})

function abrirMapa() {
  window.open(mapUrl.value, '_blank', 'noopener,noreferrer')
}

// ═════════════════════════════════════════════
// PANIC / EMERGENCIA
// ═════════════════════════════════════════════

function openPanicModal() {
  showPanicModal.value = true
}

function closePanicModal() {
  if (emergencyActive.value) {
    return
  }

  showPanicModal.value = false
}

function activateEmergency(type) {
  emergencyType.value = type
  emergencyActive.value = true
  emergencyStatus.value = 'Enviando alerta al controlador...'

  /*
   * DEMO:
   * Aquí posteriormente enviaremos la emergencia al backend/WebSocket.
   */

  setTimeout(() => {
    emergencyStatus.value =
      'Alerta enviada. El controlador ha sido notificado.'
  }, 1200)
}

function cancelEmergency() {
  emergencyActive.value = false
  emergencyType.value = ''
  emergencyStatus.value = ''
  showPanicModal.value = false
}

// ═════════════════════════════════════════════
// INCIDENTE
// ═════════════════════════════════════════════

function openIncidentModal() {
  incidentForm.value = {
    type: 'other',
    severity: 'medium',
    description: '',
    location: '',
  }

  showIncidentModal.value = true
}

function closeIncidentModal() {
  showIncidentModal.value = false
}

function saveIncident() {
  if (!incidentForm.value.description.trim()) {
    return
  }

  const newIncident = {
    id: Date.now(),
    type: incidentForm.value.type,
    severity: incidentForm.value.severity,
    description: incidentForm.value.description.trim(),
    location: incidentForm.value.location.trim(),
    registeredAt: new Date().toISOString(),
    requiresAssistance:
      incidentForm.value.severity === 'high' ||
      incidentForm.value.severity === 'critical',
  }

  if (!activeTrip.value.incidents) {
    activeTrip.value.incidents = []
  }

  activeTrip.value.incidents.push(newIncident)

  localStorage.setItem(
    'activeTrip',
    JSON.stringify(activeTrip.value)
  )

  showIncidentModal.value = false

  /*
   * Posteriormente:
   * enviar la incidencia al backend/controlador.
   */
}

// ═════════════════════════════════════════════
// AUDIO DE EMERGENCIA
// ═════════════════════════════════════════════

async function startAudioRecording() {
  audioError.value = ''
  audioStatus.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    audioError.value =
      'Este navegador no permite acceder al micrófono.'

    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    audioChunks = []

    mediaRecorder = new MediaRecorder(stream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop())

      const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder?.mimeType || 'audio/webm',
      })

      /*
       * DEMO:
       * El audio queda preparado como Blob.
       *
       * Posteriormente lo enviaremos al controlador
       * mediante API/WebSocket.
       */

      console.log('Audio grabado:', audioBlob)

      audioStatus.value =
        'Audio grabado. Preparado para enviar al controlador.'

      audioChunks = []
    }

    mediaRecorder.start()

    isRecording.value = true
    recordingSeconds.value = 0

    recordingTimer = setInterval(() => {
      recordingSeconds.value += 1
    }, 1000)
  } catch (error) {
    console.error('Error al acceder al micrófono:', error)

    audioError.value =
      'No se pudo acceder al micrófono. Verifica los permisos del navegador.'
  }
}

function stopAudioRecording() {
  if (!mediaRecorder) {
    return
  }

  if (mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  isRecording.value = false

  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

function toggleAudioRecording() {
  if (isRecording.value) {
    stopAudioRecording()
  } else {
    startAudioRecording()
  }
}

const recordingTimeFormatted = computed(() => {
  const minutes = Math.floor(recordingSeconds.value / 60)
  const seconds = recordingSeconds.value % 60

  return `${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`
})

// ═════════════════════════════════════════════
// FINALIZAR SERVICIO
// ═════════════════════════════════════════════

function openFinishModal() {
  showFinishModal.value = true
}

function closeFinishModal() {
  showFinishModal.value = false
}

function finishService() {
  const finishedAt = new Date().toISOString()

  const completedTrip = {
    ...activeTrip.value,
    finishedAt,
    status: 'completed',
  }

  /*
   * DEMO:
   * Guardamos el último servicio.
   * Posteriormente se enviará al backend.
   */

  localStorage.setItem(
    'lastCompletedTrip',
    JSON.stringify(completedTrip)
  )

  localStorage.removeItem('activeTrip')

  showFinishModal.value = false

  router.push({
    name: 'dashboard-conductor',
  })
}

// ═════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════

function volverAlDashboard() {
  router.push({
    name: 'dashboard-conductor',
  })
}

// ═════════════════════════════════════════════
// CICLO DE VIDA
// ═════════════════════════════════════════════

onMounted(() => {
  loadActiveTrip()
})

onBeforeUnmount(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
})
</script>

<template>
  <AppLayout>

    <!-- ═══════════════════════════════════════ -->
    <!-- CARGANDO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      v-if="loading"
      class="min-h-[60vh] flex items-center justify-center"
    >
      <div class="text-center">

        <div
          class="w-14 h-14 mx-auto rounded-full border-4 border-slate-200 border-t-cyan-600 animate-spin"
        ></div>

        <p class="mt-4 text-sm font-bold text-slate-500">
          Cargando servicio...
        </p>

      </div>
    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- SIN SERVICIO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      v-else-if="!activeTrip"
      class="max-w-2xl mx-auto"
    >

      <div
        class="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center"
      >

        <div
          class="mx-auto w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-400">
            local_shipping
          </span>
        </div>

        <h2 class="mt-5 text-2xl font-black text-slate-800">
          No hay un servicio activo
        </h2>

        <p class="mt-2 text-sm text-slate-500">
          Debes iniciar un servicio antes de acceder a esta pantalla.
        </p>

        <button
          type="button"
          @click="volverAlDashboard"
          class="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-black hover:bg-cyan-700 transition"
        >

          <span class="material-symbols-outlined">
            dashboard
          </span>

          Volver al dashboard

        </button>

      </div>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- SERVICIO ACTIVO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      v-else
      class="max-w-7xl mx-auto pb-10"
    >

      <!-- ═══════════════════════════════════ -->
      <!-- ENCABEZADO -->
      <!-- ═══════════════════════════════════ -->

      <div class="mb-6">

        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <div class="flex items-center gap-3">

              <div
                class="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center"
              >
                <span class="material-symbols-outlined text-emerald-600 text-2xl">
                  navigation
                </span>
              </div>

              <div>

                <p
                  class="text-xs font-black uppercase tracking-widest text-emerald-600"
                >
                  Servicio activo
                </p>

                <h1 class="text-2xl md:text-3xl font-black text-slate-800">
                  En ruta
                </h1>

              </div>

            </div>

          </div>


          <!-- ESTADO -->

          <div
            class="flex items-center gap-3 self-start lg:self-auto"
          >

            <div
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700"
            >

              <span
                class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
              ></span>

              <span class="text-xs font-black uppercase">
                Servicio en curso
              </span>

            </div>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════ -->
      <!-- EMERGENCIA ACTIVA -->
      <!-- ═══════════════════════════════════ -->

      <div
        v-if="emergencyActive"
        class="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-5"
      >

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div class="flex items-start gap-4">

            <div
              class="w-12 h-12 shrink-0 rounded-xl bg-red-100 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-red-600 text-2xl">
                emergency
              </span>
            </div>

            <div>

              <p class="font-black text-red-800">
                ALERTA DE EMERGENCIA ACTIVA
              </p>

              <p class="mt-1 text-sm text-red-700">
                {{ emergencyStatus }}
              </p>

            </div>

          </div>

          <button
            type="button"
            @click="cancelEmergency"
            class="px-5 py-2.5 rounded-xl border border-red-300 bg-white text-red-700 text-sm font-black hover:bg-red-100 transition"
          >
            Cancelar alerta
          </button>

        </div>

      </div>


      <!-- ═══════════════════════════════════ -->
      <!-- DATOS DEL CONDUCTOR -->
      <!-- ═══════════════════════════════════ -->

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6"
      >

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

          <!-- CONDUCTOR -->

          <div class="flex items-center gap-3">

            <div
              class="w-11 h-11 rounded-xl bg-cyan-100 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-cyan-700">
                person
              </span>
            </div>

            <div>

              <p
                class="text-[10px] font-black uppercase tracking-widest text-slate-400"
              >
                Conductor
              </p>

              <p class="font-black text-slate-800">
                {{ driverName }}
              </p>

              <p
                v-if="driverEmail"
                class="text-xs text-slate-500"
              >
                {{ driverEmail }}
              </p>

            </div>

          </div>


          <!-- VEHÍCULO -->

          <div class="flex items-center gap-3">

            <div
              class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-blue-700">
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
                {{ vehicleCode }}
              </p>

              <p class="text-xs text-slate-500">
                {{ vehicleModel }}
              </p>

            </div>

          </div>


          <!-- INICIO -->

          <div class="flex items-center gap-3">

            <div
              class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-emerald-700">
                schedule
              </span>
            </div>

            <div>

              <p
                class="text-[10px] font-black uppercase tracking-widest text-slate-400"
              >
                Inicio del servicio
              </p>

              <p class="font-black text-slate-800">
                {{ startedAtFormatted }}
              </p>

            </div>

          </div>

        </div>

      </div>


      <!-- ═══════════════════════════════════ -->
      <!-- MAPA + PANEL LATERAL -->
      <!-- ═══════════════════════════════════ -->

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 mb-6">

        <!-- MAPA -->

        <section
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >

          <div
            class="px-5 py-4 border-b border-slate-200 flex items-center justify-between"
          >

            <div>

              <p
                class="text-[10px] font-black uppercase tracking-widest text-cyan-600"
              >
                Navegación
              </p>

              <h2 class="font-black text-slate-800">
                Mapa de la ruta
              </h2>

            </div>

            <button
              type="button"
              @click="abrirMapa"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-50 text-cyan-700 text-xs font-black hover:bg-cyan-100 transition"
            >

              <span class="material-symbols-outlined text-base">
                open_in_new
              </span>

              Abrir mapa

            </button>

          </div>


          <!-- MAPA VISUAL -->

          <div
            class="relative h-[420px] bg-slate-100 overflow-hidden"
          >

            <!-- FONDO DEL MAPA -->

            <div
              class="absolute inset-0 opacity-70"
              style="
                background-image:
                  linear-gradient(rgba(148,163,184,.18) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(148,163,184,.18) 1px, transparent 1px);
                background-size: 35px 35px;
              "
            ></div>


            <!-- RUTA VISUAL -->

            <svg
              class="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 500"
              preserveAspectRatio="none"
            >

              <path
                d="M 100 400 C 220 330, 260 170, 410 220 C 560 270, 590 100, 760 140 C 830 155, 870 100, 920 70"
                fill="none"
                stroke="white"
                stroke-width="18"
                stroke-linecap="round"
              />

              <path
                d="M 100 400 C 220 330, 260 170, 410 220 C 560 270, 590 100, 760 140 C 830 155, 870 100, 920 70"
                fill="none"
                stroke="currentColor"
                class="text-cyan-500"
                stroke-width="9"
                stroke-linecap="round"
                stroke-dasharray="18 10"
              />

            </svg>


            <!-- ORIGEN -->

            <div
              class="absolute left-[9%] bottom-[12%] flex flex-col items-center"
            >

              <div
                class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl ring-4 ring-white"
              >
                <span class="material-symbols-outlined">
                  trip_origin
                </span>
              </div>

              <div
                class="mt-2 px-3 py-1.5 rounded-lg bg-white shadow-md text-xs font-black text-slate-700"
              >
                {{ routeOrigin }}
              </div>

            </div>


            <!-- POSICIÓN ACTUAL -->

            <div
              class="absolute left-[57%] top-[36%] flex flex-col items-center"
            >

              <div
                class="relative w-14 h-14 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-xl ring-4 ring-white"
              >

                <span
                  class="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30"
                ></span>

                <span class="material-symbols-outlined relative text-2xl">
                  local_shipping
                </span>

              </div>

              <div
                class="mt-2 px-3 py-1.5 rounded-lg bg-cyan-700 text-white shadow-md text-xs font-black"
              >
                Tu posición
              </div>

            </div>


            <!-- DESTINO -->

            <div
              class="absolute right-[7%] top-[9%] flex flex-col items-center"
            >

              <div
                class="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl ring-4 ring-white"
              >
                <span class="material-symbols-outlined">
                  location_on
                </span>
              </div>

              <div
                class="mt-2 px-3 py-1.5 rounded-lg bg-white shadow-md text-xs font-black text-slate-700"
              >
                {{ routeDestination }}
              </div>

            </div>


            <!-- AVISO -->

            <div
              class="absolute left-4 bottom-4 rounded-xl bg-white/95 backdrop-blur px-4 py-3 shadow-lg"
            >

              <div class="flex items-center gap-2">

                <span class="material-symbols-outlined text-cyan-600">
                  navigation
                </span>

                <div>

                  <p class="text-[10px] font-black uppercase text-slate-400">
                    Ruta activa
                  </p>

                  <p class="text-xs font-black text-slate-800">
                    {{ routeName }}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        <!-- PANEL LATERAL -->

        <div class="space-y-6">

          <!-- COMBUSTIBLE -->

          <section
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          >

            <div class="flex items-center justify-between">

              <div class="flex items-center gap-3">

                <div
                  class="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center"
                >
                  <span class="material-symbols-outlined text-yellow-700">
                    local_gas_station
                  </span>
                </div>

                <div>

                  <p
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Combustible de salida
                  </p>

                  <p class="font-black text-slate-800">
                    Nivel inicial
                  </p>

                </div>

              </div>

              <span class="text-2xl font-black text-slate-800">
                {{ fuelPercentage }}%
              </span>

            </div>


            <!-- BARRA -->

            <div
              class="mt-5 h-4 rounded-full bg-slate-100 overflow-hidden"
            >

              <div
                class="h-full rounded-full bg-yellow-500 transition-all"
                :style="`width: ${Math.min(Math.max(fuelPercentage, 0), 100)}%`"
              ></div>

            </div>


            <div class="grid grid-cols-2 gap-3 mt-4">

              <div
                class="rounded-xl bg-slate-50 p-3"
              >

                <p class="text-[10px] font-black uppercase text-slate-400">
                  Litros
                </p>

                <p class="mt-1 text-lg font-black text-slate-800">
                  {{ fuelLiters }} L
                </p>

              </div>

              <div
                class="rounded-xl bg-slate-50 p-3"
              >

                <p class="text-[10px] font-black uppercase text-slate-400">
                  Odómetro
                </p>

                <p class="mt-1 text-lg font-black text-slate-800">
                  {{ odometer }}
                </p>

              </div>

            </div>

          </section>


          <!-- RUTA -->

          <section
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          >

            <div class="flex items-center gap-3">

              <div
                class="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center"
              >
                <span class="material-symbols-outlined text-purple-700">
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
                  {{ routeName }}
                </p>

              </div>

            </div>


            <div class="mt-5 space-y-4">

              <div class="flex items-start gap-3">

                <div
                  class="w-3 h-3 mt-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"
                ></div>

                <div>

                  <p class="text-[10px] font-black uppercase text-slate-400">
                    Origen
                  </p>

                  <p class="text-sm font-bold text-slate-700">
                    {{ routeOrigin }}
                  </p>

                </div>

              </div>


              <div class="ml-[5px] h-4 border-l-2 border-dashed border-slate-200"></div>


              <div class="flex items-start gap-3">

                <div
                  class="w-3 h-3 mt-1.5 rounded-full bg-red-500 ring-4 ring-red-50"
                ></div>

                <div>

                  <p class="text-[10px] font-black uppercase text-slate-400">
                    Destino
                  </p>

                  <p class="text-sm font-bold text-slate-700">
                    {{ routeDestination }}
                  </p>

                </div>

              </div>

            </div>

          </section>


          <!-- CARGA -->

          <section
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          >

            <div class="flex items-center gap-3">

              <div
                class="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center"
              >
                <span class="material-symbols-outlined text-orange-700">
                  inventory_2
                </span>
              </div>

              <div>

                <p
                  class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Carga
                </p>

                <p class="font-black text-slate-800">
                  {{ cargoDescription }}
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>


      <!-- ═══════════════════════════════════ -->
      <!-- ACCIONES DE EMERGENCIA -->
      <!-- ═══════════════════════════════════ -->

      <section
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6"
      >

        <div class="mb-5">

          <p
            class="text-[10px] font-black uppercase tracking-widest text-red-600"
          >
            Seguridad del conductor
          </p>

          <h2 class="mt-1 text-xl font-black text-slate-800">
            Acciones de emergencia
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Utiliza estas opciones si ocurre una situación que requiere
            atención del controlador.
          </p>

        </div>


        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- PÁNICO -->

          <button
            type="button"
            @click="openPanicModal"
            class="group rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-left hover:border-red-400 hover:bg-red-100 transition"
          >

            <div class="flex items-center justify-between">

              <div
                class="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-sm"
              >
                <span class="material-symbols-outlined text-3xl">
                  emergency
                </span>
              </div>

              <span
                class="material-symbols-outlined text-red-400 group-hover:text-red-600"
              >
                arrow_forward
              </span>

            </div>

            <h3 class="mt-4 text-lg font-black text-red-800">
              Botón de pánico
            </h3>

            <p class="mt-1 text-sm text-red-700">
              Envía una alerta inmediata al controlador.
            </p>

          </button>


          <!-- INCIDENTE -->

          <button
            type="button"
            @click="openIncidentModal"
            class="group rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-left hover:border-amber-400 hover:bg-amber-100 transition"
          >

            <div class="flex items-center justify-between">

              <div
                class="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm"
              >
                <span class="material-symbols-outlined text-3xl">
                  warning
                </span>
              </div>

              <span
                class="material-symbols-outlined text-amber-400 group-hover:text-amber-600"
              >
                arrow_forward
              </span>

            </div>

            <h3 class="mt-4 text-lg font-black text-amber-800">
              Reportar incidente
            </h3>

            <p class="mt-1 text-sm text-amber-700">
              Registra una incidencia ocurrida durante el recorrido.
            </p>

          </button>


          <!-- AUDIO -->

          <button
            type="button"
            @click="toggleAudioRecording"
            class="group rounded-2xl border-2 p-5 text-left transition"
            :class="
              isRecording
                ? 'border-red-300 bg-red-50 hover:bg-red-100'
                : 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
            "
          >

            <div class="flex items-center justify-between">

              <div
                class="w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-sm"
                :class="
                  isRecording
                    ? 'bg-red-600'
                    : 'bg-blue-600'
                "
              >

                <span
                  class="material-symbols-outlined text-3xl"
                >
                  {{ isRecording ? 'stop_circle' : 'mic' }}
                </span>

              </div>

              <span
                class="material-symbols-outlined"
                :class="
                  isRecording
                    ? 'text-red-400'
                    : 'text-blue-400'
                "
              >
                arrow_forward
              </span>

            </div>

            <h3
              class="mt-4 text-lg font-black"
              :class="
                isRecording
                  ? 'text-red-800'
                  : 'text-blue-800'
              "
            >
              {{
                isRecording
                  ? 'Detener audio'
                  : 'Enviar audio'
              }}
            </h3>

            <p
              class="mt-1 text-sm"
              :class="
                isRecording
                  ? 'text-red-700'
                  : 'text-blue-700'
              "
            >
              {{
                isRecording
                  ? `Grabando ${recordingTimeFormatted}`
                  : 'Comunícate con el controlador mediante audio.'
              }}
            </p>

          </button>

        </div>


        <!-- AUDIO STATUS -->

        <div
          v-if="audioStatus || audioError"
          class="mt-4 rounded-xl p-4"
          :class="
            audioError
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          "
        >

          <div class="flex items-start gap-3">

            <span
              class="material-symbols-outlined"
              :class="
                audioError
                  ? 'text-red-600'
                  : 'text-blue-600'
              "
            >
              {{ audioError ? 'error' : 'info' }}
            </span>

            <p
              class="text-sm font-medium"
              :class="
                audioError
                  ? 'text-red-700'
                  : 'text-blue-700'
              "
            >
              {{ audioError || audioStatus }}
            </p>

          </div>

        </div>

      </section>


      <!-- ═══════════════════════════════════ -->
      <!-- RESUMEN DE SEGURIDAD -->
      <!-- ═══════════════════════════════════ -->

      <section
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6"
      >

        <div class="flex items-center justify-between mb-5">

          <div>

            <p
              class="text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Estado operativo
            </p>

            <h2 class="mt-1 text-xl font-black text-slate-800">
              Información del servicio
            </h2>

          </div>

          <span
            class="material-symbols-outlined text-emerald-500 text-3xl"
          >
            verified
          </span>

        </div>


        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">

          <div class="rounded-xl bg-slate-50 p-4">

            <p class="text-[10px] font-black uppercase text-slate-400">
              Incidencias
            </p>

            <p class="mt-1 text-xl font-black text-slate-800">
              {{ incidents.length }}
            </p>

          </div>


          <div class="rounded-xl bg-slate-50 p-4">

            <p class="text-[10px] font-black uppercase text-slate-400">
              Inspección
            </p>

            <p
              class="mt-1 text-sm font-black"
              :class="
                inspectionHasProblems
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              "
            >
              {{
                inspectionHasProblems
                  ? 'Con observaciones'
                  : 'Conforme'
              }}
            </p>

          </div>


          <div class="rounded-xl bg-slate-50 p-4">

            <p class="text-[10px] font-black uppercase text-slate-400">
              Combustible
            </p>

            <p class="mt-1 text-xl font-black text-slate-800">
              {{ fuelPercentage }}%
            </p>

          </div>


          <div class="rounded-xl bg-slate-50 p-4">

            <p class="text-[10px] font-black uppercase text-slate-400">
              Estado
            </p>

            <p class="mt-1 text-sm font-black text-emerald-600">
              En curso
            </p>

          </div>

        </div>

      </section>


      <!-- ═══════════════════════════════════ -->
      <!-- FINALIZAR -->
      <!-- ═══════════════════════════════════ -->

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-200 pt-6"
      >

        <button
          type="button"
          @click="volverAlDashboard"
          class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
        >

          <span class="material-symbols-outlined">
            dashboard
          </span>

          Dashboard

        </button>


        <button
          type="button"
          @click="openFinishModal"
          class="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-slate-800 text-white text-sm font-black hover:bg-slate-900 transition"
        >

          <span class="material-symbols-outlined">
            flag
          </span>

          Finalizar servicio

        </button>

      </div>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- MODAL PÁNICO -->
    <!-- ═══════════════════════════════════════ -->

    <div
      v-if="showPanicModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
    >

      <div
        class="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden"
      >

        <!-- CABECERA -->

        <div class="bg-red-600 px-6 py-6 text-white">

          <div class="flex items-center gap-4">

            <div
              class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-3xl">
                emergency
              </span>
            </div>

            <div>

              <p class="text-xs font-black uppercase tracking-widest text-red-100">
                Emergencia
              </p>

              <h2 class="text-2xl font-black">
                Botón de pánico
              </h2>

            </div>

          </div>

        </div>


        <div class="p-6">

          <div
            v-if="!emergencyActive"
          >

            <p class="text-sm text-slate-600">
              Selecciona el tipo de emergencia. El controlador recibirá una
              alerta prioritaria con la información del servicio.
            </p>


            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

              <button
                type="button"
                @click="activateEmergency('robo')"
                class="p-4 rounded-xl border-2 border-red-100 bg-red-50 text-left hover:border-red-300 hover:bg-red-100 transition"
              >

                <span class="material-symbols-outlined text-red-600">
                  security
                </span>

                <p class="mt-2 font-black text-red-800">
                  Intento de robo
                </p>

              </button>


              <button
                type="button"
                @click="activateEmergency('medical')"
                class="p-4 rounded-xl border-2 border-red-100 bg-red-50 text-left hover:border-red-300 hover:bg-red-100 transition"
              >

                <span class="material-symbols-outlined text-red-600">
                  medical_services
                </span>

                <p class="mt-2 font-black text-red-800">
                  Emergencia médica
                </p>

              </button>


              <button
                type="button"
                @click="activateEmergency('accident')"
                class="p-4 rounded-xl border-2 border-red-100 bg-red-50 text-left hover:border-red-300 hover:bg-red-100 transition"
              >

                <span class="material-symbols-outlined text-red-600">
                  car_crash
                </span>

                <p class="mt-2 font-black text-red-800">
                  Accidente
                </p>

              </button>


              <button
                type="button"
                @click="activateEmergency('other')"
                class="p-4 rounded-xl border-2 border-red-100 bg-red-50 text-left hover:border-red-300 hover:bg-red-100 transition"
              >

                <span class="material-symbols-outlined text-red-600">
                  sos
                </span>

                <p class="mt-2 font-black text-red-800">
                  Otra emergencia
                </p>

              </button>

            </div>


            <button
              type="button"
              @click="closePanicModal"
              class="mt-5 w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>

          </div>


          <!-- ALERTA ENVIADA -->

          <div
            v-else
            class="text-center"
          >

            <div
              class="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"
            >

              <span
                class="material-symbols-outlined text-red-600 text-5xl animate-pulse"
              >
                emergency
              </span>

            </div>

            <h3 class="mt-5 text-xl font-black text-slate-800">
              Alerta activada
            </h3>

            <p class="mt-2 text-sm text-slate-500">
              {{ emergencyStatus }}
            </p>

            <button
              type="button"
              @click="cancelEmergency"
              class="mt-6 w-full px-5 py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-700"
            >
              Cerrar
            </button>

          </div>

        </div>

      </div>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- MODAL INCIDENTE -->
    <!-- ═══════════════════════════════════════ -->

    <div
      v-if="showIncidentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
    >

      <div
        class="w-full max-w-lg rounded-3xl bg-white shadow-2xl my-8"
      >

        <div class="px-6 py-5 border-b border-slate-200">

          <div class="flex items-center justify-between">

            <div>

              <p
                class="text-xs font-black uppercase tracking-widest text-amber-600"
              >
                Registro operativo
              </p>

              <h2 class="text-xl font-black text-slate-800">
                Reportar incidente
              </h2>

            </div>

            <button
              type="button"
              @click="closeIncidentModal"
              class="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            >

              <span class="material-symbols-outlined text-slate-500">
                close
              </span>

            </button>

          </div>

        </div>


        <div class="p-6 space-y-5">

          <!-- TIPO -->

          <div>

            <label class="block text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
              Tipo de incidente
            </label>

            <select
              v-model="incidentForm.type"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none"
            >

              <option
                v-for="type in incidentTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>

            </select>

          </div>


          <!-- SEVERIDAD -->

          <div>

            <label class="block text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
              Severidad
            </label>

            <select
              v-model="incidentForm.severity"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none"
            >

              <option
                v-for="severity in severityOptions"
                :key="severity.value"
                :value="severity.value"
              >
                {{ severity.label }}
              </option>

            </select>

          </div>


          <!-- UBICACIÓN -->

          <div>

            <label class="block text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
              Ubicación
            </label>

            <input
              v-model="incidentForm.location"
              type="text"
              placeholder="Ej. Km 45 de la carretera"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
            />

          </div>


          <!-- DESCRIPCIÓN -->

          <div>

            <label class="block text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
              Descripción
            </label>

            <textarea
              v-model="incidentForm.description"
              rows="4"
              placeholder="Describe lo ocurrido..."
              class="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
            ></textarea>

          </div>


          <!-- BOTONES -->

          <div class="flex gap-3 pt-2">

            <button
              type="button"
              @click="closeIncidentModal"
              class="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              @click="saveIncident"
              :disabled="!incidentForm.description.trim()"
              class="flex-1 px-5 py-3 rounded-xl bg-amber-500 text-white text-sm font-black hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Registrar
            </button>

          </div>

        </div>

      </div>

    </div>


    <!-- ═══════════════════════════════════════ -->
    <!-- MODAL FINALIZAR -->
    <!-- ═══════════════════════════════════════ -->

    <div
      v-if="showFinishModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
    >

      <div
        class="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6"
      >

        <div class="text-center">

          <div
            class="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-slate-700 text-3xl">
              flag
            </span>
          </div>

          <h2 class="mt-5 text-xl font-black text-slate-800">
            ¿Finalizar servicio?
          </h2>

          <p class="mt-2 text-sm text-slate-500">
            El servicio quedará registrado como completado y dejará de
            aparecer como servicio activo.
          </p>

        </div>


        <div class="flex gap-3 mt-6">

          <button
            type="button"
            @click="closeFinishModal"
            class="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="finishService"
            class="flex-1 px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-black hover:bg-slate-900"
          >
            Sí, finalizar
          </button>

        </div>

      </div>

    </div>

  </AppLayout>
</template>