<!-- src/components/PostPagoModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300">
        
        <!-- Encabezado Estilizado -->
        <header class="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Pago Registrado con Éxito</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Utilizá los siguientes textos para comunicar el pago por WhatsApp.</p>
            </div>
          </div>
        </header>

        <!-- Contenido principal -->
        <main class="p-6 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30">
          <!-- Sección de Resumen General -->
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resumen General del Lote</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/40 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200 shadow-sm">
              <textarea readonly :value="generalSummaryText" class="textarea-display"></textarea>
              <button @click="copyToClipboard(generalSummaryText, 'Resumen')" class="copy-button">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V16.5c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.375z" />
                </svg>
                Copiar
              </button>
            </div>
          </div>

          <!-- Separador Estético -->
          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div class="relative flex justify-center text-xs font-bold uppercase tracking-wider">
              <span class="bg-slate-50 dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500">Mensajes para WhatsApp</span>
            </div>
          </div>

          <!-- Sección de Mensajes de WhatsApp -->
          <div class="space-y-5">
            <div v-for="inst in paymentData.instrumentadores" :key="inst.dni" class="space-y-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                WhatsApp para <span class="font-bold text-slate-900 dark:text-slate-100">{{ inst.nombre }}</span>
              </label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/40 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200 shadow-sm">
                <textarea readonly :value="generateWhatsAppMessage(inst)" class="textarea-display h-32"></textarea>
                <button @click="copyToClipboard(generateWhatsAppMessage(inst), `Mensaje para ${inst.nombre.split(' ')[0]}`)" class="copy-button">
                  <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V16.5c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.375z" />
                  </svg>
                  Copiar!
                </button>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
          <button @click="$emit('close')" class="btn-close">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useToasts } from '../composables/useToasts';

const props = defineProps({
  show: Boolean,
  paymentData: {
    type: Object,
    default: () => ({ instrumentadores: [], monto_total_general: 0 })
  }
});

defineEmits(['close']);

const { showSuccessToast, showErrorToast } = useToasts();

const generalSummaryText = computed(() => {
  if (!props.paymentData || !props.paymentData.instrumentadores || props.paymentData.instrumentadores.length === 0) return '';
  
  let text = `RESUMEN DE PAGO\n`;
  text += `--------------------\n`;
  props.paymentData.instrumentadores.forEach(inst => {
    text += `Instrumentador: ${inst.nombre}\n`;
    text += `Monto: ${formatCurrency(inst.monto_total)}\n`;
    text += `Cirugías: ${inst.cirugias_count}\n\n`;
  });
  text += `--------------------\n`;
  text += `TOTAL GENERAL PAGADO: ${formatCurrency(props.paymentData.monto_total_general)}`;
  return text;
});

const generateWhatsAppMessage = (instrumentador) => {
  const nombrePila = instrumentador.nombre ? instrumentador.nombre.split(' ')[0] : 'colega';
  if (!instrumentador.activity_token) {
    return `¡Hola ${nombrePila}! Te informo que se cargaron tus nuevos comprobantes de pago. Sin embargo, no pudimos generar un enlace de acceso automático para tu perfil. Por favor, consultanos para que te ayudemos.`;
  }
  const accessLink = `${window.location.origin}/resumen/${instrumentador.activity_token}`;
  
  return `¡Hola ${nombrePila}! Te informo que ya se cargaron tus nuevos comprobantes de pago. Podés acceder a ver el detalle y descargarlos desde el siguiente enlace:\n${accessLink}\n\nAnte cualquier duda, no dudes en consultarnos. ¡Muchas gracias!`;
};

const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    showSuccessToast(`¡${label} copiado al portapapeles!`);
  } catch (err) {
    showErrorToast(err, 'No se pudo copiar el texto.');
  }
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.textarea-display {
  @apply w-full p-4 pr-24 bg-transparent border-none text-slate-700 dark:text-slate-200 text-sm font-mono leading-relaxed;
  resize: none;
  min-height: 110px;
  outline: none;
}

.textarea-display:focus {
  box-shadow: none;
  outline: none;
}

.copy-button {
  @apply absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold;
  @apply text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800;
  @apply border border-slate-200 dark:border-slate-700 shadow-sm;
  @apply hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-close {
  @apply px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm;
  @apply text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800;
  @apply border border-slate-200/40 dark:border-slate-700/60;
  @apply hover:bg-slate-200/80 dark:hover:bg-slate-700;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}
</style>