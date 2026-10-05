import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─────────────────────────────────────────────────────────────
// Moneda de la aplicación
// ─────────────────────────────────────────────────────────────
// Por defecto el sistema trabaja en Soles (PEN), ya que la operación es en
// Perú. El usuario puede cambiarla desde Configuración → Sistema.
//
// IMPORTANTE: como todavía no hay un tipo de cambio real conectado a un
// backend, cambiar de moneda NO convierte los montos — solo cambia el
// símbolo/etiqueta con el que se muestran. Los montos se asumen ya
// expresados en la moneda elegida.
export const CURRENCIES = {
  PEN: { code: 'PEN', symbol: 'S/', name: 'Sol peruano',          locale: 'es-PE' },
  USD: { code: 'USD', symbol: '$',  name: 'Dólar estadounidense', locale: 'en-US' },
}

const DEFAULT_CURRENCY = 'PEN'
const STORAGE_KEY = 'app.currency'

function readStoredCurrency() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored && CURRENCIES[stored] ? stored : DEFAULT_CURRENCY
}

export const useSettingsStore = defineStore('settings', () => {
  const currencyCode = ref(readStoredCurrency())

  const currency = computed(() => CURRENCIES[currencyCode.value])

  function setCurrency(code) {
    if (!CURRENCIES[code]) return
    currencyCode.value = code
    localStorage.setItem(STORAGE_KEY, code)
  }

  /**
   * Formatea un monto numérico con el símbolo y separadores de la moneda activa.
   * Ej: formatCurrency(1234.5) → "S/ 1,234.50" (o "$ 1,234.50" en USD).
   */
  function formatCurrency(amount, { decimals = 2 } = {}) {
    const n = Number(amount)
    const safe = Number.isFinite(n) ? n : 0
    const formatted = safe.toLocaleString(currency.value.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    return `${currency.value.symbol} ${formatted}`
  }

  return { currencyCode, currency, setCurrency, formatCurrency }
})
