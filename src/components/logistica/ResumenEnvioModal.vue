<!-- src/components/logistica/ResumenEnvioModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="space-y-0.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Confirmación Final
          </span>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
            Revisión Antes de Enviar Informe
          </h3>
        </div>
        
        <button 
          type="button"
          @click="$emit('close')" 
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Cuerpo del Resumen -->
      <div class="p-5 space-y-4 text-xs">
        <div class="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-1">
          <p class="font-bold text-blue-950 dark:text-blue-200 text-xs">
            Resumen de la Jornada
          </p>
          <p class="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            Una vez enviado, el informe quedará registrado formalmente en el sistema y cambiará a modo inmutable.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Movimientos</span>
            <span class="text-lg font-black font-mono text-slate-900 dark:text-white">{{ stats.totalMovimientos }}</span>
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Cajas Informadas</span>
            <span class="text-lg font-black font-mono text-slate-900 dark:text-white">{{ stats.totalCajas }}</span>
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Bultos Totales</span>
            <span class="text-lg font-black font-mono text-slate-900 dark:text-white">{{ stats.totalBultos }}</span>
          </div>

          <div class="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider block">Pendientes Declarados</span>
            <span class="text-lg font-black font-mono text-amber-900 dark:text-amber-300">{{ stats.totalPendientes }}</span>
          </div>
        </div>

        <div v-if="observacion" class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span class="font-extrabold text-slate-700 dark:text-slate-300 block text-[11px]">Observación General:</span>
          <p class="text-slate-600 dark:text-slate-300 italic text-[11px]">{{ observacion }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2">
        <button 
          type="button" 
          @click="$emit('close')" 
          class="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          Volver a Editar
        </button>

        <button 
          type="button" 
          @click="$emit('confirm')" 
          :disabled="isSending"
          class="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <svg v-if="isSending" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ isSending ? 'Enviando...' : 'Confirmar y Enviar Informe' }}</span>
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

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
