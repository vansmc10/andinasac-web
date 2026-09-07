<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true }, // [{ value, label, icon? }]
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Seleccionar…' },
  searchable: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // sm | md | lg
  variant: { type: String, default: 'default' }, // default | inline | ghost
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const abierto = ref(false)
const query = ref('')
const indiceFocused = ref(-1)
const trigger = ref(null)
const panel = ref(null)
const searchInput = ref(null)

const opcionesFiltradas = computed(() =>
  query.value.trim()
    ? props.options.filter(o => o.label.toLowerCase().includes(query.value.toLowerCase()))
    : props.options
)

const seleccionada = computed(() =>
  props.options.find(o => o.value === props.modelValue) || null
)

function abrir() {
  if (props.disabled) return
  abierto.value = true
  indiceFocused.value = props.options.findIndex(o => o.value === props.modelValue)
  if (props.searchable) nextTick(() => searchInput.value?.focus())
}

function cerrar() {
  abierto.value = false
  query.value = ''
  indiceFocused.value = -1
}

function elegir(op) {
  emit('update:modelValue', op.value)
  cerrar()
  trigger.value?.focus()
}

function toggle() {
  abierto.value ? cerrar() : abrir()
}

function moverFoco(dir) {
  const max = opcionesFiltradas.value.length - 1
  indiceFocused.value = Math.max(0, Math.min(max, indiceFocused.value + dir))
  nextTick(() => {
    panel.value?.querySelectorAll('[role="option"]')[indiceFocused.value]?.scrollIntoView({ block: 'nearest' })
  })
}

function confirmarFoco() {
  if (indiceFocused.value >= 0 && opcionesFiltradas.value[indiceFocused.value]) {
    elegir(opcionesFiltradas.value[indiceFocused.value])
  }
}

function clickFuera(e) {
  if (!trigger.value?.contains(e.target) && !panel.value?.contains(e.target)) cerrar()
}

onMounted(() => document.addEventListener('mousedown', clickFuera))
onUnmounted(() => document.removeEventListener('mousedown', clickFuera))

watch(query, () => { indiceFocused.value = 0 })

// Tamaños
const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}
// Variantes
const variants = {
  default: 'bg-surface-container border border-surface-container-highest hover:border-primary rounded-lg',
  inline:  'bg-transparent border-none p-0 rounded-none',
  ghost:   'bg-surface-container/50 border border-dashed border-surface-container-highest rounded-lg hover:bg-surface-container',
}
</script>

<template>
  <div class="relative w-full" :class="{ 'opacity-50 pointer-events-none': disabled }">
    <!-- Label -->
    <span v-if="label" class="block text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5">
      {{ label }}
    </span>

    <!-- Trigger button -->
    <button
      ref="trigger"
      type="button"
      :aria-haspopup="'listbox'"
      :aria-expanded="abierto"
      :aria-label="label || placeholder"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="abrir"
      @keydown.arrow-down.prevent="abierto ? moverFoco(1) : abrir()"
      @keydown.arrow-up.prevent="abierto ? moverFoco(-1) : abrir()"
      @keydown.escape="cerrar"
      class="w-full flex items-center justify-between gap-2 font-bold text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
      :class="[sizes[size], variants[variant]]"
    >
      <span class="flex items-center gap-2 truncate">
        <span v-if="seleccionada?.icon" class="material-symbols-outlined text-base text-primary shrink-0">{{ seleccionada.icon }}</span>
        <span :class="seleccionada ? 'text-on-surface' : 'text-on-surface-variant'">
          {{ seleccionada?.label ?? placeholder }}
        </span>
      </span>
      <span
        class="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200"
        :class="abierto ? 'rotate-180' : ''"
        style="font-size:18px"
        aria-hidden="true"
      >keyboard_arrow_down</span>
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-[0.98]"
    >
      <div
        v-if="abierto"
        ref="panel"
        role="listbox"
        :aria-label="label || placeholder"
        class="absolute z-50 mt-1.5 w-full min-w-[180px] bg-surface rounded-xl shadow-2xl border border-surface-container-highest overflow-hidden"
        style="max-height: 280px; overflow-y: auto;"
        @keydown.arrow-down.prevent="moverFoco(1)"
        @keydown.arrow-up.prevent="moverFoco(-1)"
        @keydown.enter.prevent="confirmarFoco"
        @keydown.escape="cerrar"
      >
        <!-- Search -->
        <div v-if="searchable" class="p-2 border-b border-surface-container-low sticky top-0 bg-surface z-10">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" style="font-size:16px">search</span>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="Buscar…"
              class="w-full pl-8 pr-3 py-2 text-sm bg-surface-container rounded-lg"
              @keydown.stop
            />
          </div>
        </div>

        <!-- Options -->
        <div class="py-1">
          <button
            v-for="(op, i) in opcionesFiltradas"
            :key="op.value"
            role="option"
            :aria-selected="op.value === modelValue"
            type="button"
            @click="elegir(op)"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors text-left"
            :class="[
              op.value === modelValue
                ? 'bg-primary/10 text-primary font-black'
                : indiceFocused === i
                  ? 'bg-surface-container text-on-surface'
                  : 'text-on-surface hover:bg-surface-container'
            ]"
          >
            <span v-if="op.icon" class="material-symbols-outlined text-base shrink-0" :class="op.value === modelValue ? 'text-primary' : 'text-on-surface-variant'">{{ op.icon }}</span>
            <span class="truncate flex-1">{{ op.label }}</span>
            <span v-if="op.value === modelValue" class="material-symbols-outlined text-primary ml-auto shrink-0" style="font-size:16px">check</span>
          </button>
          <p v-if="opcionesFiltradas.length === 0" class="px-4 py-3 text-xs text-on-surface-variant text-center">Sin resultados</p>
        </div>
      </div>
    </Transition>
  </div>
</template>
