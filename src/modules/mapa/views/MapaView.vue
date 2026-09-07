<script setup>
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

// ── Estado de UI ──────────────────────────────────────────
const filtroActivo         = ref('todos')
const vehiculoSeleccionado = ref(null)
const mapContainer         = ref(null)
const map                  = shallowRef(null)
const rutaActivaId         = ref(null)
const reporteModalAbierto  = ref(false)
const reporteVehiculo      = ref(null)
const isMobile             = ref(false)

// markersMap: { [vehiculoId]: { marker, element } }
let markersMap           = {}
let infoWindow           = null
let polylineasMap        = {}
let waypointMarkers      = []
let PolylineClass        = null
let AMEClass             = null

// ── GPS Simulation ────────────────────────────────────────
let gpsInterval  = null
const gpsPos     = {}   // { [id]: { lat, lng } } posición actual simulada
const gpsStep    = 0.0004  // ~40m por tick

function checkMobile() { isMobile.value = window.innerWidth < 768 }

function tickGPS() {
  vehiculos.forEach(v => {
    if (v.estado !== 'movimiento') return
    const ruta = rutasData[v.id]
    if (!ruta) return
    const pos  = gpsPos[v.id]
    const dest = ruta.pathRestante[ruta.pathRestante.length - 1]
    const dLat = dest.lat - pos.lat
    const dLng = dest.lng - pos.lng
    const dist = Math.sqrt(dLat * dLat + dLng * dLng)
    if (dist < 0.0001) return          // ya llegó, no mover más
    const factor = gpsStep / dist
    pos.lat += dLat * factor
    pos.lng += dLng * factor
    if (markersMap[v.id]) {
      markersMap[v.id].marker.position = { lat: pos.lat, lng: pos.lng }
    }
  })
}

// ── Datos de flota ────────────────────────────────────────
const vehiculos = [
  {
    id: 'TK-8829', modelo: 'Volvo FH16',     conductor: 'Ricardo Morales',
    estado: 'movimiento', velocidad: 78, distancia: '12.4 km del destino',
    odometro: '42.1k', ruta: 'Lima → Arequipa',  progreso: 68, eta: '02:45 PM',
    nextStop: 'Base Logistic A-2',
    lat: -12.0464, lng: -77.0428,
  },
  {
    id: 'TK-4102', modelo: 'Scania R500',    conductor: 'Elena Suárez',
    estado: 'alerta',    velocidad: 0, distancia: 'Temperatura motor alta',
    odometro: '88.2k', ruta: 'Ruta Costa Sur',   progreso: 32, eta: '—',
    nextStop: 'Taller Urgente',
    lat: -12.1219, lng: -77.0282,
  },
  {
    id: 'TK-9931', modelo: 'Mercedes Actros', conductor: 'Jorge Ruiz',
    estado: 'detenido',  velocidad: 0, distancia: 'Detenido hace 45 min',
    odometro: '215.9k', ruta: 'Lima → Trujillo', progreso: 51, eta: '06:20 PM',
    nextStop: 'Centro Distribución Norte',
    lat: -11.9843, lng: -77.0958,
  },
  {
    id: 'TK-3314', modelo: 'MAN TGX',        conductor: 'Carmen López',
    estado: 'movimiento', velocidad: 65, distancia: '34.7 km del destino',
    odometro: '124.5k', ruta: 'Lima → Callao',   progreso: 85, eta: '01:10 PM',
    nextStop: 'Puerto Callao',
    lat: -12.0656, lng: -77.1168,
  },
]

// ── Datos de trazabilidad ─────────────────────────────────
const rutasData = {
  'TK-8829': {
    origen: 'Terminal Lima Norte', destino: 'Base Logística A-2',
    fechaInicio: '2025-05-14  06:30', fechaEta: '2025-05-14  14:45',
    distanciaTotal: 186, distanciaRecorrida: 126,
    combustibleUsado: 38.4, velPromedio: 72,
    pathCompletado: [
      { lat: -11.985, lng: -77.045 }, { lat: -12.010, lng: -77.044 },
      { lat: -12.032, lng: -77.041 }, { lat: -12.046, lng: -77.043 },
    ],
    pathRestante: [
      { lat: -12.046, lng: -77.043 }, { lat: -12.075, lng: -77.025 },
      { lat: -12.110, lng: -76.998 }, { lat: -12.150, lng: -76.965 },
    ],
    waypoints: [
      { lat: -11.985, lng: -77.045, label: 'Terminal Lima Norte',  tipo: 'origen',     hora: '06:30', estado: 'completado' },
      { lat: -12.010, lng: -77.044, label: 'Peaje Manchay',        tipo: 'peaje',      hora: '07:15', estado: 'completado' },
      { lat: -12.032, lng: -77.041, label: 'Descanso Km 45',       tipo: 'parada',     hora: '08:45', estado: 'completado' },
      { lat: -12.046, lng: -77.043, label: 'Posición Actual',      tipo: 'actual',     hora: '10:15', estado: 'actual'     },
      { lat: -12.110, lng: -76.998, label: 'Checkpoint Km 130',    tipo: 'checkpoint', hora: '12:30', estado: 'pendiente'  },
      { lat: -12.150, lng: -76.965, label: 'Base Logística A-2',   tipo: 'destino',    hora: '14:45', estado: 'pendiente'  },
    ],
  },
  'TK-4102': {
    origen: 'Almacén Surquillo', destino: 'Terminal Sur',
    fechaInicio: '2025-05-14  07:00', fechaEta: '—',
    distanciaTotal: 95, distanciaRecorrida: 30,
    combustibleUsado: 12.1, velPromedio: 58,
    pathCompletado: [
      { lat: -12.090, lng: -77.035 }, { lat: -12.105, lng: -77.032 },
      { lat: -12.122, lng: -77.028 },
    ],
    pathRestante: [
      { lat: -12.122, lng: -77.028 }, { lat: -12.155, lng: -77.010 },
      { lat: -12.190, lng: -76.990 },
    ],
    waypoints: [
      { lat: -12.090, lng: -77.035, label: 'Almacén Surquillo',   tipo: 'origen',  hora: '07:00', estado: 'completado' },
      { lat: -12.105, lng: -77.032, label: 'Punto Control A',     tipo: 'peaje',   hora: '07:40', estado: 'completado' },
      { lat: -12.122, lng: -77.028, label: 'DETENIDO — Alerta',   tipo: 'actual',  hora: '08:30', estado: 'alerta'     },
      { lat: -12.190, lng: -76.990, label: 'Taller Urgente',      tipo: 'destino', hora: '—',     estado: 'pendiente'  },
    ],
  },
  'TK-9931': {
    origen: 'Centro Distribución Lima', destino: 'Centro Distribución Norte',
    fechaInicio: '2025-05-14  05:15', fechaEta: '2025-05-14  18:20',
    distanciaTotal: 244, distanciaRecorrida: 124,
    combustibleUsado: 51.3, velPromedio: 65,
    pathCompletado: [
      { lat: -12.050, lng: -77.095 }, { lat: -12.025, lng: -77.095 },
      { lat: -11.998, lng: -77.095 }, { lat: -11.984, lng: -77.096 },
    ],
    pathRestante: [
      { lat: -11.984, lng: -77.096 }, { lat: -11.955, lng: -77.090 },
      { lat: -11.920, lng: -77.080 }, { lat: -11.890, lng: -77.060 },
    ],
    waypoints: [
      { lat: -12.050, lng: -77.095, label: 'Centro Distribución Lima',   tipo: 'origen',     hora: '05:15', estado: 'completado' },
      { lat: -12.025, lng: -77.095, label: 'Peaje Km 22',                tipo: 'peaje',      hora: '06:05', estado: 'completado' },
      { lat: -11.998, lng: -77.095, label: 'Parada Obligatoria',         tipo: 'parada',     hora: '07:30', estado: 'completado' },
      { lat: -11.984, lng: -77.096, label: 'Posición Actual (Parado)',   tipo: 'actual',     hora: '09:10', estado: 'detenido'   },
      { lat: -11.920, lng: -77.080, label: 'Control Vial Norte',         tipo: 'checkpoint', hora: '13:00', estado: 'pendiente'  },
      { lat: -11.890, lng: -77.060, label: 'Centro Distribución Norte',  tipo: 'destino',    hora: '18:20', estado: 'pendiente'  },
    ],
  },
  'TK-3314': {
    origen: 'Almacén Central Miraflores', destino: 'Puerto Callao',
    fechaInicio: '2025-05-14  09:00', fechaEta: '2025-05-14  13:10',
    distanciaTotal: 48, distanciaRecorrida: 41,
    combustibleUsado: 9.8, velPromedio: 60,
    pathCompletado: [
      { lat: -12.066, lng: -77.060 }, { lat: -12.066, lng: -77.080 },
      { lat: -12.066, lng: -77.100 }, { lat: -12.066, lng: -77.117 },
    ],
    pathRestante: [
      { lat: -12.066, lng: -77.117 }, { lat: -12.060, lng: -77.135 },
      { lat: -12.055, lng: -77.155 },
    ],
    waypoints: [
      { lat: -12.066, lng: -77.060, label: 'Almacén Central Miraflores', tipo: 'origen',     hora: '09:00', estado: 'completado' },
      { lat: -12.066, lng: -77.080, label: 'Puente Santa Rosa',          tipo: 'checkpoint', hora: '09:25', estado: 'completado' },
      { lat: -12.066, lng: -77.100, label: 'Terminal Av. Faucett',       tipo: 'parada',     hora: '09:55', estado: 'completado' },
      { lat: -12.066, lng: -77.117, label: 'Posición Actual',            tipo: 'actual',     hora: '10:30', estado: 'actual'     },
      { lat: -12.055, lng: -77.155, label: 'Puerto Callao',              tipo: 'destino',    hora: '13:10', estado: 'pendiente'  },
    ],
  },
}

// ── Config de estados ─────────────────────────────────────
const estadoConfig = {
  movimiento: { badge: 'bg-on-surface text-surface',  icon: 'moving',         label: 'MOVIMIENTO' },
  alerta:     { badge: 'bg-[#b91c1c] text-white',     icon: 'report_problem', label: 'ALERTA'     },
  detenido:   { badge: 'bg-outline text-surface',      icon: 'pause_circle',   label: 'DETENIDO'   },
}
const colorPorEstado = { movimiento: '#1e293b', alerta: '#b91c1c', detenido: '#94a3b8' }

// Config de waypoints
const waypointCfg = {
  completado: { color: '#22c55e',  icon: 'check_circle',        class: 'text-emerald-600' },
  actual:     { color: '#f59e0b',  icon: 'my_location',         class: 'text-amber-500'   },
  detenido:   { color: '#94a3b8',  icon: 'pause_circle',        class: 'text-slate-500'   },
  alerta:     { color: '#ef4444',  icon: 'warning',             class: 'text-red-600'     },
  pendiente:  { color: '#cbd5e1',  icon: 'radio_button_unchecked', class: 'text-slate-400' },
}
const waypointTipoIcon = {
  origen: 'flag', destino: 'sports_score', parada: 'local_parking',
  peaje: 'toll', checkpoint: 'verified', actual: 'my_location',
}

const vehiculosFiltrados = ref(vehiculos)

// ── Helper: color waypoint para marcador en mapa ─────────
function wpColor(wp) {
  return (waypointCfg[wp.estado] || waypointCfg.pendiente).color
}

// ── Crear elemento HTML del marcador de vehículo ─────────
function crearElementoMarker(v, isSelected = false) {
  const color   = colorPorEstado[v.estado]
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `position:relative;cursor:pointer;transition:transform .2s;transform:${isSelected ? 'scale(1.5)' : 'scale(1)'};`
  if (v.estado === 'movimiento') {
    const pulse = document.createElement('div')
    pulse.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;background:${color};opacity:.18;animation:gm-pulse 2s ease-in-out infinite;pointer-events:none;`
    wrapper.appendChild(pulse)
  }
  const circle = document.createElement('div')
  circle.style.cssText = `width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 10px rgba(0,0,0,.32);position:relative;z-index:1;outline:${isSelected ? `3px solid ${color}` : 'none'};outline-offset:2px;`
  wrapper.appendChild(circle)
  return wrapper
}

// ── Crear elemento para marcador de waypoint ──────────────
function crearElementoWaypoint(wp) {
  const color = wpColor(wp)
  const el    = document.createElement('div')
  el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);`
  return el
}

// ── HTML del popup ────────────────────────────────────────
function popupHTML(v) {
  const color = colorPorEstado[v.estado]
  return `
    <div style="font-family:Inter,sans-serif;padding:4px 2px;min-width:210px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <strong style="font-size:14px;color:#1e293b;font-weight:900;">${v.id}</strong>
        <span style="background:${v.estado==='alerta'?'#fee2e2':v.estado==='movimiento'?'#f1f5f9':'#f8fafc'};color:${color};font-size:9px;font-weight:900;padding:2px 8px;border-radius:999px;letter-spacing:.06em;text-transform:uppercase;">${estadoConfig[v.estado].label}</span>
      </div>
      <p style="font-size:12px;color:#475569;margin:0 0 4px;">${v.modelo}</p>
      <p style="font-size:12px;color:#64748b;margin:0 0 8px;">👤 ${v.conductor}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;"/>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">🗺 ${v.ruta}</p>
      ${v.velocidad > 0
        ? `<p style="font-size:12px;font-weight:700;color:#1e293b;margin:4px 0 0;">${v.velocidad} km/h · ${v.distancia}</p>`
        : `<p style="font-size:12px;font-weight:700;color:${color};margin:4px 0 0;">${v.distancia}</p>`}
    </div>`
}

// ── Trazabilidad: dibujar ruta en mapa ───────────────────
function mostrarRutaEnMapa(v) {
  if (!map.value || !PolylineClass || !AMEClass) return
  const ruta = rutasData[v.id]
  if (!ruta) return

  ocultarTodasRutas()

  // Tramo completado — sólido
  const lineaA = new PolylineClass({
    path:           ruta.pathCompletado,
    geodesic:       true,
    strokeColor:    '#4f6073',
    strokeOpacity:  1,
    strokeWeight:   5,
    map:            map.value,
  })

  // Tramo restante — punteado
  const lineaB = new PolylineClass({
    path:          ruta.pathRestante,
    geodesic:      true,
    strokeColor:   '#94a3b8',
    strokeOpacity: 0,
    strokeWeight:  4,
    icons: [{
      icon:   { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#94a3b8', scale: 3 },
      offset: '0',
      repeat: '18px',
    }],
    map: map.value,
  })

  polylineasMap[v.id] = [lineaA, lineaB]

  // Marcadores de waypoints
  ruta.waypoints.forEach(wp => {
    const m = new AMEClass({
      map:      map.value,
      position: { lat: wp.lat, lng: wp.lng },
      content:  crearElementoWaypoint(wp),
      title:    wp.label,
    })
    waypointMarkers.push(m)
  })

  rutaActivaId.value = v.id
}

function ocultarTodasRutas() {
  Object.values(polylineasMap).forEach(lines => lines.forEach(l => l.setMap(null)))
  polylineasMap = {}
  waypointMarkers.forEach(m => { m.map = null })
  waypointMarkers      = []
  rutaActivaId.value   = null
}

function toggleRuta(v) {
  if (rutaActivaId.value === v.id) ocultarTodasRutas()
  else mostrarRutaEnMapa(v)
}

// ── Acciones ──────────────────────────────────────────────
function seleccionar(v) {
  vehiculoSeleccionado.value = v
  if (!map.value) return
  map.value.panTo({ lat: v.lat, lng: v.lng })
  map.value.setZoom(Math.max(map.value.getZoom(), 13))
  Object.entries(markersMap).forEach(([id, { element }]) => {
    const sel = id === v.id
    element.style.transform = sel ? 'scale(1.5)' : 'scale(1)'
    element.style.zIndex    = sel ? '10' : '1'
  })
  if (infoWindow && markersMap[v.id]) {
    infoWindow.setContent(popupHTML(v))
    infoWindow.open({ map: map.value, anchor: markersMap[v.id].marker })
  }
}

function filtrar(tipo) {
  filtroActivo.value = tipo
  vehiculosFiltrados.value = tipo === 'todos' ? vehiculos : vehiculos.filter(v => v.estado === tipo)
  vehiculos.forEach(v => {
    const entry = markersMap[v.id]
    if (!entry) return
    entry.marker.map = (tipo === 'todos' || v.estado === tipo) ? map.value : null
  })
  if (vehiculoSeleccionado.value && !vehiculosFiltrados.value.find(v => v.id === vehiculoSeleccionado.value.id)) {
    vehiculoSeleccionado.value = null
    infoWindow?.close()
    ocultarTodasRutas()
  }
}

// ── Reporte ───────────────────────────────────────────────
function abrirReporte(v) {
  reporteVehiculo.value     = v
  reporteModalAbierto.value = true
}
function cerrarReporte() {
  reporteModalAbierto.value = false
  reporteVehiculo.value     = null
}

async function exportarExcel(v) {
  const XLSX = await import('xlsx')
  const ruta = rutasData[v.id]
  const aoa  = [
    ['REPORTE DE TRAZABILIDAD — FLEET ARCHITECT'],
    [],
    ['Vehículo',  v.id,              'Modelo',    v.modelo],
    ['Conductor', v.conductor,        'Ruta',      v.ruta],
    ['Origen',    ruta.origen,        'Destino',   ruta.destino],
    ['Inicio',    ruta.fechaInicio,   'ETA',       ruta.fechaEta],
    [],
    ['RESUMEN'],
    ['Distancia total (km)',      ruta.distanciaTotal],
    ['Distancia recorrida (km)',  ruta.distanciaRecorrida],
    ['Combustible usado (gal)',   ruta.combustibleUsado],
    ['Velocidad promedio (km/h)', ruta.velPromedio],
    ['Progreso (%)',              v.progreso],
    [],
    ['WAYPOINTS'],
    ['Hora', 'Punto', 'Tipo', 'Estado'],
    ...ruta.waypoints.map(wp => [wp.hora, wp.label, wp.tipo, wp.estado]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Trazabilidad')
  XLSX.writeFile(wb, `reporte_${v.id}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

// ── Zoom ──────────────────────────────────────────────────
function zoomIn()  { if (map.value) map.value.setZoom((map.value.getZoom() ?? 11) + 1) }
function zoomOut() { if (map.value) map.value.setZoom((map.value.getZoom() ?? 11) - 1) }

// ── Inicializar Google Maps ───────────────────────────────
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  await new Promise(r => setTimeout(r, 80))
  if (!mapContainer.value) return

  const deadline = Date.now() + 8000
  while (!window.google?.maps?.importLibrary && Date.now() < deadline)
    await new Promise(r => setTimeout(r, 100))
  if (!window.google?.maps?.importLibrary) {
    console.error('[MapaView] Google Maps no disponible'); return
  }

  const { Map, InfoWindow, Polyline } = await window.google.maps.importLibrary('maps')
  const { AdvancedMarkerElement }     = await window.google.maps.importLibrary('marker')

  PolylineClass = Polyline
  AMEClass      = AdvancedMarkerElement

  map.value = new Map(mapContainer.value, {
    center: { lat: -12.046, lng: -77.043 }, zoom: 11,
    mapId: 'DEMO_MAP_ID', disableDefaultUI: true,
    gestureHandling: 'greedy', clickableIcons: false,
  })

  infoWindow = new InfoWindow({ maxWidth: 290 })

  // Inicializar posiciones GPS y crear marcadores
  vehiculos.forEach(v => {
    gpsPos[v.id] = { lat: v.lat, lng: v.lng }
    const element = crearElementoMarker(v)
    const marker  = new AdvancedMarkerElement({
      map: map.value, position: { lat: v.lat, lng: v.lng },
      content: element, title: `${v.id} — ${v.conductor}`,
    })
    markersMap[v.id] = { marker, element }
    marker.addListener('click', () => seleccionar(v))
  })

  map.value.addListener('click', () => {
    infoWindow?.close()
    vehiculoSeleccionado.value = null
    Object.values(markersMap).forEach(({ element }) => {
      element.style.transform = 'scale(1)'
      element.style.zIndex    = '1'
    })
  })

  // Iniciar simulación GPS cada 2 segundos
  gpsInterval = setInterval(tickGPS, 2000)
})

onUnmounted(() => {
  clearInterval(gpsInterval)
  window.removeEventListener('resize', checkMobile)
  ocultarTodasRutas()
  infoWindow?.close()
  markersMap = {}
  map.value  = null
})
</script>

<template>
  <div class="bg-surface text-on-surface antialiased">
    <AppLayout>
      <template #default></template>
    </AppLayout>

    <!-- ═══ Contenedor FIXED del mapa ═══ -->
    <div
      class="transition-all duration-300"
      :style="{ position:'fixed', left: isMobile ? '0' : '16rem', top:'5rem', right:'0', bottom:'0', zIndex:'1' }"
    >

      <!-- Google Maps -->
      <div ref="mapContainer" class="absolute inset-0 z-0" aria-label="Mapa de flota en tiempo real"></div>

      <!-- ═══ PANEL IZQUIERDO — Lista de vehículos ═══ -->
      <section
        aria-label="Lista de Vehículos"
        class="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-md rounded-xl z-10 shadow-2xl overflow-hidden flex flex-col border border-surface-container-high"
      >
        <div class="p-5 pb-3 border-b border-surface-container-low">
          <div class="flex justify-between items-end mb-4">
            <h2 class="text-xl font-black tracking-tight text-on-surface font-headline">Flota Activa</h2>
            <span class="text-[10px] font-black text-on-surface uppercase tracking-widest">{{ vehiculos.length }} En Línea</span>
          </div>
          <div class="flex space-x-2" role="group" aria-label="Filtrar flota">
            <button
              v-for="[tipo, label] in [['todos','Todos'],['movimiento','Movimiento'],['alerta','Alertas']]"
              :key="tipo"
              @click="filtrar(tipo)"
              :aria-pressed="filtroActivo === tipo"
              class="flex-1 text-[11px] font-black py-2 rounded uppercase border transition-colors"
              :class="filtroActivo === tipo
                ? 'bg-on-surface text-surface border-on-surface'
                : 'bg-surface-container text-on-surface border-surface-container-high hover:border-on-surface'"
            >{{ label }}</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <article
            v-for="v in vehiculosFiltrados"
            :key="v.id"
            tabindex="0"
            @keyup.enter="seleccionar(v)"
            class="rounded-xl border transition-all cursor-pointer overflow-hidden"
            :class="vehiculoSeleccionado?.id === v.id
              ? 'bg-surface-container-low border-on-surface ring-2 ring-on-surface ring-offset-1'
              : v.estado === 'alerta'
                ? 'bg-white border-surface-container-high hover:border-[#b91c1c]'
                : 'bg-white border-surface-container-high hover:border-on-surface'"
          >
            <!-- Cuerpo clickeable -->
            <div class="p-4 pb-3" @click="seleccionar(v)">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-xs font-black text-on-surface">{{ v.id }} | {{ v.modelo }}</h3>
                <span
                  class="flex items-center text-[9px] font-black px-2 py-0.5 rounded gap-0.5"
                  :class="estadoConfig[v.estado].badge"
                >
                  <span class="material-symbols-outlined text-[12px]">{{ estadoConfig[v.estado].icon }}</span>
                  {{ estadoConfig[v.estado].label }}
                </span>
              </div>
              <p class="flex items-center text-xs text-on-surface font-semibold mb-1 gap-1">
                <span class="material-symbols-outlined text-sm">person</span>{{ v.conductor }}
              </p>
              <p
                class="flex items-center text-[10px] font-bold gap-1"
                :class="v.estado === 'alerta' ? 'text-[#b91c1c]' : 'text-on-surface-variant'"
              >
                <span class="material-symbols-outlined text-sm">
                  {{ v.estado === 'movimiento' ? 'speed' : v.estado === 'alerta' ? 'warning' : 'schedule' }}
                </span>
                {{ v.estado === 'movimiento' ? `${v.velocidad} km/h · ${v.distancia}` : v.distancia }}
              </p>
            </div>

            <!-- Acciones rápidas -->
            <div class="flex border-t border-surface-container-high">
              <button
                @click.stop="seleccionar(v); toggleRuta(v)"
                :aria-pressed="rutaActivaId === v.id"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-wide transition-colors"
                :class="rutaActivaId === v.id
                  ? 'bg-[#4f6073] text-white'
                  : 'bg-surface-container text-on-surface-variant hover:bg-[#4f6073] hover:text-white'"
              >
                <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">route</span>
                {{ rutaActivaId === v.id ? 'Ocultar' : 'Ver Ruta' }}
              </button>
              <div class="w-px bg-surface-container-high"></div>
              <button
                @click.stop="seleccionar(v); abrirReporte(v)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-wide bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span class="material-symbols-outlined text-sm">summarize</span>
                Reporte
              </button>
            </div>
          </article>
        </div>

        <!-- Footer stats -->
        <div class="p-5 bg-on-surface text-surface border-t border-outline">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <p class="text-[10px] font-black text-outline uppercase tracking-wider">Combustible Prom.</p>
              <p class="text-xl font-headline font-black">84%</p>
            </div>
            <div class="text-center">
              <p class="text-[10px] font-black text-outline uppercase tracking-wider">Eficiencia</p>
              <p class="text-xl font-headline font-black">9.2</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ PANEL DERECHO — Detalle del vehículo ═══ -->
      <Transition name="slide-fade">
        <section
          v-if="vehiculoSeleccionado"
          aria-label="Detalles del Vehículo"
          class="absolute right-4 top-4 bottom-4 w-96 bg-white/97 backdrop-blur-lg rounded-xl z-10 shadow-2xl border border-surface-container-high overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 shrink-0"
            style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)"
          >
            <div>
              <h2 class="text-base font-black text-white font-headline tracking-tight">{{ vehiculoSeleccionado.id }}</h2>
              <p class="text-[10px] text-white/70 font-semibold uppercase tracking-widest">{{ vehiculoSeleccionado.ruta }}</p>
            </div>
            <button
              @click="vehiculoSeleccionado = null; infoWindow?.close()"
              aria-label="Cerrar panel"
              class="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Contenido scrollable -->
          <div class="flex-1 overflow-y-auto p-5 space-y-4">

            <!-- KPIs -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-surface-container rounded-xl p-4 border border-surface-container-high">
                <span class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">Velocidad</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-headline font-black text-on-surface">{{ vehiculoSeleccionado.velocidad }}</span>
                  <span class="text-xs font-bold text-on-surface-variant">km/h</span>
                </div>
              </div>
              <div class="bg-surface-container rounded-xl p-4 border border-surface-container-high">
                <span class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">Odómetro</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-headline font-black text-on-surface">{{ vehiculoSeleccionado.odometro }}</span>
                  <span class="text-xs font-bold text-on-surface-variant">km</span>
                </div>
              </div>
            </div>

            <!-- Progreso de ruta -->
            <div>
              <div class="flex justify-between mb-1.5">
                <span class="text-[10px] font-black text-on-surface uppercase tracking-widest">Progreso de Ruta</span>
                <span class="text-xs font-black text-on-surface">{{ vehiculoSeleccionado.progreso }}%</span>
              </div>
              <div class="h-3 bg-surface-container-high rounded-full overflow-hidden"
                role="progressbar" :aria-valuenow="vehiculoSeleccionado.progreso" aria-valuemin="0" aria-valuemax="100">
                <div class="h-full rounded-full transition-all duration-700"
                  style="background: linear-gradient(90deg, #4f6073, #3a4a5c)"
                  :style="`width:${vehiculoSeleccionado.progreso}%`"></div>
              </div>
            </div>

            <!-- Próxima parada -->
            <div class="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-surface-container-high">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style="background:#4f6073">
                  <span class="material-symbols-outlined text-white text-lg">route</span>
                </div>
                <div>
                  <p class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Próx. Parada</p>
                  <p class="text-xs font-bold text-on-surface">{{ vehiculoSeleccionado.nextStop }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-black text-on-surface">{{ vehiculoSeleccionado.eta }}</p>
                <p class="text-[10px] font-bold text-on-surface-variant">ETA</p>
              </div>
            </div>

            <!-- ═ TRAZABILIDAD ═ -->
            <div v-if="rutaActivaId === vehiculoSeleccionado.id && rutasData[vehiculoSeleccionado.id]">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-black text-on-surface uppercase tracking-widest flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm" style="color:#4f6073;font-variation-settings:'FILL' 1">route</span>
                  Trazabilidad
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-on-surface-variant">
                    {{ rutasData[vehiculoSeleccionado.id].distanciaRecorrida }} /
                    {{ rutasData[vehiculoSeleccionado.id].distanciaTotal }} km
                  </span>
                </div>
              </div>

              <!-- Timeline -->
              <div class="relative pl-5 space-y-0">
                <div
                  v-for="(wp, i) in rutasData[vehiculoSeleccionado.id].waypoints"
                  :key="i"
                  class="relative pb-3 last:pb-0"
                >
                  <!-- Línea vertical conectora -->
                  <div v-if="i < rutasData[vehiculoSeleccionado.id].waypoints.length - 1"
                    class="absolute left-[-13px] top-4 bottom-0 w-0.5"
                    :class="wp.estado === 'pendiente' ? 'bg-slate-200' : 'bg-emerald-200'"
                  ></div>

                  <!-- Dot -->
                  <div
                    class="absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    :style="`background:${(waypointCfg[wp.estado] || waypointCfg.pendiente).color}`"
                  ></div>

                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-[11px] font-bold text-on-surface leading-tight truncate">{{ wp.label }}</p>
                      <p class="text-[10px] text-on-surface-variant font-medium flex items-center gap-0.5 mt-0.5">
                        <span class="material-symbols-outlined text-[11px]">{{ waypointTipoIcon[wp.tipo] || 'location_on' }}</span>
                        {{ wp.tipo }}
                      </p>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="text-[11px] font-black text-on-surface">{{ wp.hora }}</p>
                      <span
                        class="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide"
                        :class="{
                          'bg-emerald-50 text-emerald-700': wp.estado === 'completado',
                          'bg-amber-50 text-amber-600':     wp.estado === 'actual',
                          'bg-slate-100 text-slate-500':    wp.estado === 'pendiente',
                          'bg-red-50 text-red-600':         wp.estado === 'alerta',
                          'bg-gray-100 text-gray-500':      wp.estado === 'detenido',
                        }"
                      >{{ wp.estado }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex gap-2 pt-1">
              <!-- Ruta toggle -->
              <button
                @click="toggleRuta(vehiculoSeleccionado)"
                :aria-pressed="rutaActivaId === vehiculoSeleccionado.id"
                class="flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all"
                :class="rutaActivaId === vehiculoSeleccionado.id
                  ? 'bg-[#4f6073] text-white border-[#4f6073]'
                  : 'bg-white text-[#4f6073] border-[#4f6073] hover:bg-[#4f6073] hover:text-white'"
              >
                <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">route</span>
                {{ rutaActivaId === vehiculoSeleccionado.id ? 'Ocultar Ruta' : 'Ver Ruta' }}
              </button>

              <!-- Reporte -->
              <button
                @click="abrirReporte(vehiculoSeleccionado)"
                class="flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm text-white"
                style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)"
              >
                <span class="material-symbols-outlined text-base">summarize</span>Reporte
              </button>

              <!-- Chat -->
              <button aria-label="Chat con conductor"
                class="bg-surface-container text-on-surface border border-surface-container-high p-2.5 rounded-lg hover:bg-surface-container-high transition-all">
                <span class="material-symbols-outlined text-base">chat</span>
              </button>
            </div>
          </div>
        </section>
      </Transition>

      <!-- Controles de zoom -->
      <nav aria-label="Controles de mapa" class="absolute bottom-8 right-8 flex flex-col gap-3 z-10">
        <div class="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-xl border border-surface-container-high flex flex-col gap-1">
          <button @click="zoomIn"  aria-label="Aumentar zoom" class="p-3 hover:bg-surface-container rounded-lg transition-all">
            <span class="material-symbols-outlined font-black text-on-surface">add</span>
          </button>
          <div class="h-px bg-surface-container-high mx-2" aria-hidden="true"></div>
          <button @click="zoomOut" aria-label="Reducir zoom"  class="p-3 hover:bg-surface-container rounded-lg transition-all">
            <span class="material-symbols-outlined font-black text-on-surface">remove</span>
          </button>
        </div>
      </nav>

      <!-- Barra de estado inferior -->
      <div
        aria-label="Estado del sistema"
        class="absolute bottom-8 left-[340px] px-6 py-3.5 rounded-full z-10 shadow-xl flex items-center gap-6 text-surface"
        style="background:rgba(30,41,59,0.92);backdrop-filter:blur(8px);"
      >
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          <span class="text-[11px] font-black uppercase tracking-widest text-slate-400">Sistema Operativo</span>
        </div>
        <div class="h-5 w-px bg-slate-600" aria-hidden="true"></div>
        <div class="flex gap-6">
          <div class="flex items-baseline gap-1.5">
            <span class="text-base font-black">148</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase">Vehículos</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-base font-black text-emerald-400">132</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase">Movimiento</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-base font-black text-red-400">3</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase">Críticos</span>
          </div>
          <!-- Indicador de ruta activa -->
          <Transition name="fade">
            <div v-if="rutaActivaId" class="flex items-baseline gap-1.5 border-l border-slate-600 pl-6">
              <span class="material-symbols-outlined text-sm text-[#7fa8c8]" style="font-variation-settings:'FILL' 1">route</span>
              <span class="text-[10px] font-bold text-[#7fa8c8] uppercase">Ruta {{ rutaActivaId }}</span>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL DE REPORTE ═══ -->
    <Transition name="modal-fade">
      <div
        v-if="reporteModalAbierto && reporteVehiculo"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="`Reporte de trazabilidad — ${reporteVehiculo.id}`"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cerrarReporte"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          <!-- Header del modal -->
          <div
            class="px-6 py-5 flex items-center justify-between shrink-0"
            style="background: linear-gradient(135deg, #4f6073 0%, #3a4a5c 100%)"
          >
            <div>
              <div class="flex items-center gap-3 mb-1">
                <div class="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-lg" style="font-variation-settings:'FILL' 1">summarize</span>
                </div>
                <h2 class="text-lg font-black text-white font-headline">Reporte de Trazabilidad</h2>
              </div>
              <p class="text-white/70 text-xs font-semibold">
                {{ reporteVehiculo.id }} · {{ reporteVehiculo.modelo }} · {{ reporteVehiculo.conductor }}
              </p>
            </div>
            <button
              @click="cerrarReporte"
              aria-label="Cerrar reporte"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Contenido scrollable -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Info de ruta -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Origen</p>
                <p class="font-bold text-slate-800 flex items-center gap-1">
                  <span class="material-symbols-outlined text-emerald-500 text-sm" style="font-variation-settings:'FILL' 1">flag</span>
                  {{ rutasData[reporteVehiculo.id]?.origen }}
                </p>
                <p class="text-xs text-slate-500 mt-1">{{ rutasData[reporteVehiculo.id]?.fechaInicio }}</p>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Destino</p>
                <p class="font-bold text-slate-800 flex items-center gap-1">
                  <span class="material-symbols-outlined text-red-500 text-sm" style="font-variation-settings:'FILL' 1">sports_score</span>
                  {{ rutasData[reporteVehiculo.id]?.destino }}
                </p>
                <p class="text-xs text-slate-500 mt-1">ETA: {{ rutasData[reporteVehiculo.id]?.fechaEta }}</p>
              </div>
            </div>

            <!-- KPIs del reporte -->
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="kpi in [
                  { label:'Dist. Total',    value: rutasData[reporteVehiculo.id]?.distanciaTotal,    unit:'km',  icon:'straighten',   color:'#4f6073' },
                  { label:'Recorrido',      value: rutasData[reporteVehiculo.id]?.distanciaRecorrida, unit:'km',  icon:'route',        color:'#0891b2' },
                  { label:'Combustible',    value: rutasData[reporteVehiculo.id]?.combustibleUsado,  unit:'gal', icon:'local_gas_station', color:'#d97706' },
                  { label:'Vel. Promedio',  value: rutasData[reporteVehiculo.id]?.velPromedio,       unit:'km/h',icon:'speed',        color:'#059669' },
                ]"
                :key="kpi.label"
                class="rounded-xl p-3 border border-slate-100 text-center"
                :style="`background:${kpi.color}10`"
              >
                <span class="material-symbols-outlined text-lg mb-1 block" :style="`color:${kpi.color};font-variation-settings:'FILL' 1`">{{ kpi.icon }}</span>
                <p class="text-lg font-black text-slate-800">{{ kpi.value }}</p>
                <p class="text-[10px] font-bold text-slate-500 uppercase">{{ kpi.unit }}</p>
                <p class="text-[9px] text-slate-400 font-semibold mt-0.5">{{ kpi.label }}</p>
              </div>
            </div>

            <!-- Progreso -->
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-xs font-black text-slate-700 uppercase tracking-widest">Progreso de Ruta</span>
                <span class="text-xs font-black text-slate-700">{{ reporteVehiculo.progreso }}%</span>
              </div>
              <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full" style="background:linear-gradient(90deg,#4f6073,#3a4a5c)" :style="`width:${reporteVehiculo.progreso}%`"></div>
              </div>
            </div>

            <!-- Tabla de waypoints -->
            <div>
              <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Registro de Waypoints</h3>
              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr style="background:linear-gradient(90deg,#4f6073,#3a4a5c)">
                      <th class="text-left px-4 py-3 text-[11px] font-black text-white uppercase tracking-widest">Hora</th>
                      <th class="text-left px-4 py-3 text-[11px] font-black text-white uppercase tracking-widest">Punto</th>
                      <th class="text-left px-4 py-3 text-[11px] font-black text-white uppercase tracking-widest hidden sm:table-cell">Tipo</th>
                      <th class="text-center px-4 py-3 text-[11px] font-black text-white uppercase tracking-widest">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(wp, i) in rutasData[reporteVehiculo.id]?.waypoints"
                      :key="i"
                      class="border-t border-slate-100"
                      :class="i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'"
                    >
                      <td class="px-4 py-3 font-black text-slate-700 text-xs">{{ wp.hora }}</td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm text-slate-500">{{ waypointTipoIcon[wp.tipo] || 'location_on' }}</span>
                          <span class="text-xs font-semibold text-slate-700">{{ wp.label }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 hidden sm:table-cell">
                        <span class="text-[11px] font-bold text-slate-500 capitalize">{{ wp.tipo }}</span>
                      </td>
                      <td class="px-4 py-3 text-center">
                        <span
                          class="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border capitalize"
                          :class="{
                            'bg-emerald-50 text-emerald-700 border-emerald-200': wp.estado === 'completado',
                            'bg-amber-50 text-amber-600 border-amber-200':       wp.estado === 'actual',
                            'bg-slate-100 text-slate-500 border-slate-200':      wp.estado === 'pendiente',
                            'bg-red-50 text-red-600 border-red-200':             wp.estado === 'alerta',
                            'bg-gray-100 text-gray-500 border-gray-200':         wp.estado === 'detenido',
                          }"
                        >
                          <span class="material-symbols-outlined text-[11px]" style="font-variation-settings:'FILL' 1">
                            {{ (waypointCfg[wp.estado] || waypointCfg.pendiente).icon }}
                          </span>
                          {{ wp.estado }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer del modal -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <p class="text-[10px] text-slate-400 font-semibold">
              Generado el {{ new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' }) }}
            </p>
            <div class="flex gap-2">
              <button
                @click="cerrarReporte"
                class="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors uppercase tracking-wide"
              >
                Cerrar
              </button>
              <button
                @click="exportarExcel(reporteVehiculo)"
                class="px-5 py-2 text-xs font-black text-white rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm uppercase tracking-wide"
                style="background:linear-gradient(135deg,#4f6073,#3a4a5c)"
              >
                <span class="material-symbols-outlined text-base">download</span>
                Exportar Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.25s ease; }
.slide-fade-enter-from, .slide-fade-leave-to       { opacity: 0; transform: translateX(20px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; transform: scale(0.96); }
</style>

<style>
@keyframes gm-pulse {
  0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.18; }
  50%  { transform: translate(-50%,-50%) scale(2.2); opacity: 0.05; }
  100% { transform: translate(-50%,-50%) scale(1);   opacity: 0.18; }
}
.gm-style .gm-style-iw-c {
  border-radius: 14px !important; padding: 14px 16px !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
  font-family: Inter,'Helvetica Neue',Arial,sans-serif !important;
}
.gm-style .gm-style-iw-d { overflow: hidden !important; }
.gm-style .gm-ui-hover-effect { top: 4px !important; right: 4px !important; }
</style>
