<!-- src/components/logistica/EmailEnvioExitosoModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg my-auto flex flex-col overflow-hidden border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-100 font-sans">
      
      <!-- Header de Éxito -->
      <div class="p-5 bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-start gap-4">
        <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div class="space-y-1 flex-1 min-w-0">
          <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Confirmación de Envío
          </span>
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            ¡Informe enviado con éxito!
          </h3>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            El Informe Diario de Logística ha sido transmitido correctamente por correo electrónico.
          </p>
        </div>
      </div>

      <!-- Detalle del Registro de Envío -->
      <div class="p-5 space-y-4 text-xs overflow-y-auto">
        
        <!-- Tarjeta de ID de Transacción -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 font-mono">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-500 font-medium">ID de Transacción Resend:</span>
            <span class="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
              {{ details?.id || 'res_OK' }}
            </span>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-500 font-medium">Fecha y Hora:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">
              {{ details?.timestamp || formatNow() }}
            </span>
          </div>
        </div>

        <!-- Remitente Validado -->
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Remitente Validado (From / Reply-To)
          </span>
          <div class="p-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
            {{ details?.sender || 'DISTRICORR' }}
          </div>
        </div>

        <!-- Destinatarios (To y BCC) -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Destinatarios Notificados ({{ details?.recipients?.length || 0 }})
            </span>
            <span v-if="details?.bcc" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              ✓ Con copia BCC a tu correo
            </span>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 max-h-32 overflow-y-auto space-y-1 font-mono text-[11px]">
            <div v-for="email in details?.recipients" :key="email" class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span class="text-emerald-500">✓</span>
              <span>{{ email }}</span>
            </div>
          </div>
        </div>

        <!-- Confirmación de Historial -->
        <div class="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <span class="text-base">📋</span>
          <span>El evento de envío fue registrado correctamente en el historial del informe.</span>
        </div>
      </div>

      <!-- Footer CTA -->
      <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
        <button
          type="button"
          @click="$emit('close')"
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-500/20 cursor-pointer text-center"
        >
          Entendido / Cerrar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  details: Object
});

const emit = defineEmits(['close']);

const formatNow = () => {
  const date = new Date();
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.18s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>
