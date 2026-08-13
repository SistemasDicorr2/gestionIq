<!-- src/components/admin/ModalRegularizacionAntiguos.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-200">
        
        <!-- Header del Modal -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
              🔒
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Regularización de Casos Antiguos
              </h3>
              <p class="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                Confirmación exclusiva de saldado sin comprobante
              </p>
            </div>
          </div>

          <button @click="handleClose" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Cuerpo del Modal -->
        <div class="p-6 space-y-4">
          <!-- Advertencia de seguridad -->
          <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1">
            <p class="font-bold flex items-center gap-1.5">
              ⚠️ Acción exclusiva para casos históricos
            </p>
            <p class="text-[11px] opacity-90">
              Esta opción permite saldar registros antiguos que fueron abonados previamente pero no cuentan con un comprobante de transferencia adjunto en el sistema.
            </p>
          </div>

          <!-- Resumen de cirugías a regularizar -->
          <div class="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cirugías a saldar</span>
              <span class="font-extrabold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                {{ count }} seleccionada(s)
              </span>
            </div>

            <div class="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <span class="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto Total Consolidado</span>
              <span class="text-base font-extrabold text-slate-900 dark:text-white">
                {{ formatCurrency(totalAmount) }}
              </span>
            </div>
          </div>

          <!-- Notas opcionales de auditoría -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Motivo o Nota de Regularización (Opcional)
            </label>
            <input 
              type="text" 
              v-model="auditNotes"
              placeholder="Ej: Regularización archivo histórico 2025..."
              class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <!-- Requisitos de Confirmación Exclusiva -->
          <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label class="flex items-start gap-2.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                v-model="isCheckboxConfirmed" 
                class="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500/20 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <span class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-tight">
                Entiendo que esta operación registrará una orden de pago sin comprobante y marcará las cirugías como <strong>Saldadas</strong>.
              </span>
            </label>

            <div class="space-y-1.5">
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Escribí <span class="text-amber-600 dark:text-amber-400 font-black">REGULARIZAR</span> para habilitar:
              </label>
              <input 
                type="text" 
                v-model="confirmationInput"
                placeholder="REGULARIZAR"
                class="w-full px-3 py-2 text-xs font-mono tracking-wider text-center uppercase rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-end gap-3">
          <button 
            type="button" 
            @click="handleClose" 
            class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button 
            type="button" 
            @click="handleConfirm" 
            :disabled="!isFormValid || isSubmitting"
            class="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span v-if="isSubmitting">Regularizando...</span>
            <span v-else>Confirmar Regularización</span>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  isSubmitting: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'confirm']);

const auditNotes = ref('');
const isCheckboxConfirmed = ref(false);
const confirmationInput = ref('');

watch(() => props.show, (newVal) => {
  if (newVal) {
    auditNotes.value = '';
    isCheckboxConfirmed.value = false;
    confirmationInput.value = '';
  }
});

const isFormValid = computed(() => {
  return isCheckboxConfirmed.value && confirmationInput.value.trim().toUpperCase() === 'REGULARIZAR' && props.count > 0;
});

const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val || 0);

const handleClose = () => {
  emit('close');
};

const handleConfirm = () => {
  if (!isFormValid.value || props.isSubmitting) return;
  emit('confirm', {
    notes: auditNotes.value.trim()
  });
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
