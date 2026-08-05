<!-- src/components/logistica/ResumenEnvioModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">
          Revisión Antes de Enviar
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Cuerpo del Resumen -->
      <div class="p-5 space-y-4 text-xs">
        <div class="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <p class="font-bold text-blue-900 dark:text-blue-200 text-sm mb-1">
            Resumen de Actividad del Día
          </p>
          <p class="text-[11px] text-blue-700 dark:text-blue-300">
            Revisa los totales antes del envío definitivo. Una vez enviado, el informe pasa a modo lectura inmutable.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Movimientos</span>
            <span class="text-base font-extrabold text-slate-900 dark:text-white">{{ stats.totalMovimientos }}</span>
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Cajas Informadas</span>
            <span class="text-base font-extrabold text-slate-900 dark:text-white">{{ stats.totalCajas }}</span>
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Bultos Totales</span>
            <span class="text-base font-extrabold text-slate-900 dark:text-white">{{ stats.totalBultos }}</span>
          </div>

          <div class="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <span class="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold block">Pendientes Declarados</span>
            <span class="text-base font-extrabold text-amber-900 dark:text-amber-300">{{ stats.totalPendientes }}</span>
          </div>
        </div>

        <div v-if="observacion" class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span class="font-bold text-slate-700 dark:text-slate-300 block">Observación General:</span>
          <p class="text-slate-600 dark:text-slate-400 italic">{{ observacion }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
        <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
          Volver a Editar
        </button>

        <button 
          type="button" 
          @click="$emit('confirm')" 
          :disabled="isSending"
          class="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg v-if="isSending" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ isSending ? 'Enviando...' : 'Confirmar y Enviar' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  stats: Object,
  observacion: String,
  isSending: Boolean
});

defineEmits(['close', 'confirm']);
</script>
