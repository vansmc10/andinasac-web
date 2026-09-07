<script setup>
import { ref, watch, onMounted } from 'vue'

const expanded = ref(false)
const fontSize = ref(100)   // RF-INC-01
const altoContraste = ref(false) // RF-INC-02
const daltonismo = ref('none')   // RF-INC-03 (Miguel: deuteranopía)
const lectorActivo = ref(false)  // RF-INC-04 (Carlos: NVDA)

const STORAGE_KEY = 'andina-a11y'

function aplicarFontSize() {
  document.documentElement.style.fontSize = `${fontSize.value}%`
}

function aplicarContraste() {
  document.documentElement.classList.toggle('high-contrast', altoContraste.value)
}

function aplicarDaltonismo() {
  document.documentElement.dataset.colorblind = daltonismo.value
}

function leer(texto) {
  if (!lectorActivo.value || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = 'es-PE'
  window.speechSynthesis.speak(u)
}

function subirFuente() { // RF-INC-01: A+
  if (fontSize.value < 150) { fontSize.value += 10; aplicarFontSize(); guardar(); leer(`Tamaño de fuente ${fontSize.value} por ciento`) }
}
function bajarFuente() { // RF-INC-01: A-
  if (fontSize.value > 80) { fontSize.value -= 10; aplicarFontSize(); guardar(); leer(`Tamaño de fuente ${fontSize.value} por ciento`) }
}
function resetFuente() {
  fontSize.value = 100; aplicarFontSize(); guardar()
}

function toggleContraste() {
  altoContraste.value = !altoContraste.value
  aplicarContraste()
  guardar()
  leer(altoContraste.value ? 'Alto contraste activado' : 'Alto contraste desactivado')
}

function toggleLector() {
  lectorActivo.value = !lectorActivo.value
  guardar()
  leer(lectorActivo.value ? 'Narración activada' : 'Narración desactivada')
}

function guardar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize: fontSize.value, altoContraste: altoContraste.value, daltonismo: daltonismo.value, lectorActivo: lectorActivo.value }))
}

watch(daltonismo, (val) => { aplicarDaltonismo(); guardar(); leer(`Filtro de color: ${val}`) })

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (saved.fontSize)      { fontSize.value = saved.fontSize; aplicarFontSize() }
    if (saved.altoContraste) { altoContraste.value = true; aplicarContraste() }
    if (saved.daltonismo)    { daltonismo.value = saved.daltonismo; aplicarDaltonismo() }
    if (saved.lectorActivo)  { lectorActivo.value = saved.lectorActivo }
  } catch {}
})
</script>

<template>
  <!-- RF-INC-01..06: Barra de Accesibilidad Universal — WCAG 2.1 AA -->
  <div
    id="accessibility-bar"
    role="region"
    aria-label="Opciones de accesibilidad"
    class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
  >
    <!-- Collapsed pill trigger -->
    <transition name="fade">
      <button
        v-if="!expanded"
        @click="expanded = true"
        aria-expanded="false"
        aria-controls="a11y-panel"
        class="flex items-center gap-2 bg-on-surface/90 text-surface px-5 py-2.5 rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-surface"
      >
        <span class="material-symbols-outlined text-base">accessibility_new</span>
        Accesibilidad
      </button>
    </transition>

    <!-- Expanded panel -->
    <transition name="slide-up">
      <div
        v-if="expanded"
        id="a11y-panel"
        role="toolbar"
        aria-label="Herramientas de accesibilidad"
        class="bg-on-surface/95 text-surface rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-md p-4 flex items-center gap-4 flex-wrap"
      >
        <!-- RF-INC-01: Tamaño de fuente -->
        <div class="flex items-center gap-2" role="group" aria-label="Tamaño de fuente">
          <span class="text-[10px] font-black text-outline uppercase tracking-widest hidden sm:block">Fuente</span>
          <button
            @click="bajarFuente"
            aria-label="Reducir tamaño de fuente"
            :disabled="fontSize <= 80"
            class="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-black text-sm disabled:opacity-40 transition-all focus-visible:outline-2 focus-visible:outline-white"
          >A-</button>
          <span class="text-xs font-black w-10 text-center" aria-live="polite" aria-label="Tamaño de fuente actual">{{ fontSize }}%</span>
          <button
            @click="subirFuente"
            aria-label="Aumentar tamaño de fuente"
            :disabled="fontSize >= 150"
            class="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-black text-sm disabled:opacity-40 transition-all focus-visible:outline-2 focus-visible:outline-white"
          >A+</button>
          <button
            @click="resetFuente"
            aria-label="Restablecer tamaño de fuente"
            class="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-white"
          >
            <span class="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>

        <div class="w-px h-8 bg-white/20 hidden sm:block" aria-hidden="true"></div>

        <!-- RF-INC-02: Alto Contraste -->
        <button
          @click="toggleContraste"
          :aria-pressed="altoContraste"
          aria-label="Alto contraste"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-white"
          :class="altoContraste ? 'bg-white text-on-surface' : 'bg-white/10 hover:bg-white/20'"
        >
          <span class="material-symbols-outlined text-base">contrast</span>
          <span class="hidden sm:inline">Contraste</span>
        </button>

        <!-- RF-INC-03: Filtro daltonismo (Miguel) -->
        <div class="flex items-center gap-2" role="group" aria-label="Filtro de daltonismo">
          <span class="material-symbols-outlined text-base text-outline">palette</span>
          <select
            v-model="daltonismo"
            aria-label="Seleccionar tipo de daltonismo"
            class="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs font-bold text-surface focus:outline-none focus:border-white transition-colors"
          >
            <option value="none">Color normal</option>
            <option value="deuteranopia">Deuteranopía</option>
            <option value="protanopia">Protanopía</option>
            <option value="tritanopia">Tritanopía</option>
          </select>
        </div>

        <div class="w-px h-8 bg-white/20 hidden sm:block" aria-hidden="true"></div>

        <!-- RF-INC-04: Narración (Carlos) -->
        <button
          @click="toggleLector"
          :aria-pressed="lectorActivo"
          aria-label="Activar narración de voz"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-white"
          :class="lectorActivo ? 'bg-white text-on-surface' : 'bg-white/10 hover:bg-white/20'"
        >
          <span class="material-symbols-outlined text-base">record_voice_over</span>
          <span class="hidden sm:inline">Narración</span>
        </button>

        <!-- Close -->
        <div class="w-px h-8 bg-white/20" aria-hidden="true"></div>
        <button
          @click="expanded = false"
          aria-label="Cerrar panel de accesibilidad"
          aria-expanded="true"
          aria-controls="a11y-panel"
          class="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-white"
        >
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
