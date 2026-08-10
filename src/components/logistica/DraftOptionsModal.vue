<!-- src/components/logistica/DraftOptionsModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="space-y-0.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            Borrador Detectado
          </span>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
            Tienes un informe en edición
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

      <!-- Content Body -->
      <div class="p-5 space-y-4 text-xs">
        <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
          Existe un borrador anterior guardado. Puedes continuar completándolo o descartar la edición actual para empezar un informe diario limpio.
        </p>

        <!-- Draft Card Summary -->
        <div class="p-4 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-amber-900/60">
            <span class="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Jornada: {{ formatDate(draft?.fecha) || 'Hoy' }}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
              Zona: {{ draft?.zona || 'Formosa' }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Movimientos Cargados</span>
              <span class="text-sm font-black font-mono text-slate-800 dark:text-slate-100">
                {{ movimientosCount ?? (draft?.movimientos_count || 0) }}
              </span>
            </div>

            <div class="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Último Guardado</span>
              <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">
                {{ formatTime(draft?.updated_at || draft?.created_at) || 'Reciente' }}
              </span>
            </div>
          </div>

          <div v-if="draft?.observacion_general" class="text-[11px] text-slate-700 dark:text-slate-300 italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-amber-200/40 dark:border-amber-900/30">
            <span class="font-bold text-[10px] not-italic text-slate-500 block uppercase tracking-wider mb-0.5">Observación ingresada:</span>
            "{{ draft.observacion_general }}"
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <button 
          type="button" 
          @click="$emit('start-new')" 
          class="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95 text-center min-h-[40px]"
        >
          Empezar Nuevo Informe
        </button>

        <button 
          type="button" 
          @click="$emit('continue')" 
          class="w-full sm:w-auto px-4 py-2.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[40px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          <span>Continuar con Borrador</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  draft: {
    type: Object,
    default: () => ({})
  },
  movimientosCount: {
    type: Number,
    default: 0
  }
});

defineEmits(['close', 'continue', 'start-new']);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};
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
