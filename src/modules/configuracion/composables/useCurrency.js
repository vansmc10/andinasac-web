import { storeToRefs } from 'pinia'
import { CURRENCIES, useSettingsStore } from '../store/settingsStore.js'

/**
 * Moneda activa de la aplicación (por defecto Soles/PEN) y utilidades para
 * mostrarla. Usar en cualquier vista que muestre montos en dinero
 * (Consumo, Mantenimiento, Reportes, …) para que respeten lo elegido en
 * Configuración → Sistema.
 */
export function useCurrency() {
  const store = useSettingsStore()
  const { currency, currencyCode } = storeToRefs(store)

  return {
    currency,           // { code, symbol, name, locale }
    currencyCode,        // 'PEN' | 'USD'
    currencies: CURRENCIES,
    setCurrency: store.setCurrency,
    formatCurrency: store.formatCurrency,
  }
}
