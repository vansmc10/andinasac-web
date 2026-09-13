<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function seleccionarRol(rol) {
  router.push({
    name: 'login',
    query: { role: rol }
  })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6"
    style="background:linear-gradient(135deg,#2d3d4e 0%,#1a2530 100%)">

    <div class="w-full max-w-5xl">

      <!-- Encabezado -->
      <div class="text-center mb-10">

        <div
          class="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
          style="background:rgba(255,255,255,0.15)"
        >
          <span
            class="material-symbols-outlined text-white text-4xl"
            style="font-variation-settings:'FILL' 1"
          >
            local_shipping
          </span>
        </div>

        <p class="text-white/60 text-xs font-black uppercase tracking-widest mb-2">
          Plataforma Empresarial
        </p>

        <h1 class="text-white text-4xl font-black tracking-tight mb-3">
          Andina Logística
        </h1>

        <p class="text-white/70 text-base">
          Seleccione su tipo de usuario para continuar
        </p>

      </div>

      <!-- Roles -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Administrador -->
        <button
          type="button"
          @click="seleccionarRol('admin')"
          class="group text-left bg-white rounded-2xl p-7 shadow-xl
                 hover:-translate-y-1 hover:shadow-2xl
                 transition-all duration-200"
        >

          <div
            class="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
            style="background:#e8eef5"
          >
            <span
              class="material-symbols-outlined text-3xl"
              style="color:#4f6073"
            >
              admin_panel_settings
            </span>
          </div>

          <h2 class="text-xl font-black text-slate-800 mb-2">
            Administrador
          </h2>

          <p class="text-sm text-slate-500 leading-relaxed">
            Gestiona usuarios, unidades, conductores,
            mantenimiento, consumo y configuración.
          </p>

          <div
            class="mt-6 text-sm font-bold"
            style="color:#4f6073"
          >
            Continuar →
          </div>

        </button>


        <!-- Chofer -->
        <button
          type="button"
          @click="seleccionarRol('conductor')"
          class="group text-left bg-white rounded-2xl p-7 shadow-xl
                 hover:-translate-y-1 hover:shadow-2xl
                 transition-all duration-200"
        >

          <div
            class="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
            style="background:#e6f6f8"
          >
            <span
              class="material-symbols-outlined text-3xl"
              style="color:#0891b2"
            >
              local_shipping
            </span>
          </div>

          <h2 class="text-xl font-black text-slate-800 mb-2">
            Chofer
          </h2>

          <p class="text-sm text-slate-500 leading-relaxed">
            Consulta tus rutas, vehículo asignado,
            recorrido e incidencias.
          </p>

          <div
            class="mt-6 text-sm font-bold"
            style="color:#0891b2"
          >
            Continuar →
          </div>

        </button>


        <!-- Controlador -->
        <button
          type="button"
          @click="seleccionarRol('controlador_rutas')"
          class="group text-left bg-white rounded-2xl p-7 shadow-xl
                 hover:-translate-y-1 hover:shadow-2xl
                 transition-all duration-200"
        >

          <div
            class="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
            style="background:#e8f7f1"
          >
            <span
              class="material-symbols-outlined text-3xl"
              style="color:#059669"
            >
              map
            </span>
          </div>

          <h2 class="text-xl font-black text-slate-800 mb-2">
            Controlador de rutas
          </h2>

          <p class="text-sm text-slate-500 leading-relaxed">
            Supervisa rutas, unidades, alertas e
            incidencias en tiempo real.
          </p>

          <div
            class="mt-6 text-sm font-bold"
            style="color:#059669"
          >
            Continuar →
          </div>

        </button>

      </div>

      <!-- Pie -->
      <p class="text-center text-white/40 text-xs mt-10">
        © 2025 Andina Logística
      </p>

    </div>
  </div>
</template>