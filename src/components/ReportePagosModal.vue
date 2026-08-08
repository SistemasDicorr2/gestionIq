<!-- src/components/ReportePagosModal.vue -->
<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
        
        <!-- Header del Modal -->
        <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              📄
            </div>
            <div>
              <h3 class="text-lg font-extrabold tracking-tight">Descargar Reporte de Pagos</h3>
              <p class="text-xs text-slate-300">Generá tu informe en PDF por período</p>
            </div>
          </div>
          <button 
            type="button" 
            @click="$emit('close')"
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Cuerpo del Formulario -->
        <div class="p-6 space-y-4">
          <!-- Selección de Período Simplificada: Mes Actual o Personalizado -->
          <div class="space-y-1.5">
            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Seleccionar Período
            </label>
            <select 
              v-model="selectedPeriod"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="mes-actual">Mes Actual</option>
              <option value="custom">Rango Personalizado</option>
            </select>
          </div>

          <!-- Rango Personalizado de Fechas -->
          <div v-if="selectedPeriod === 'custom'" class="grid grid-cols-2 gap-3 pt-1">
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400">Fecha Desde</label>
              <input 
                type="date" 
                v-model="startDate"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400">Fecha Hasta</label>
              <input 
                type="date" 
                v-model="endDate"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <!-- Resumen de items incluidos -->
          <div class="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <span class="font-medium">Pagos incluidos en el reporte:</span>
            <span class="font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100">
              {{ filteredLiquidaciones.length }}
            </span>
          </div>
        </div>

        <!-- Footer Acciones -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            @click="handleGenerar"
            :disabled="filteredLiquidaciones.length === 0"
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Descargar PDF</span>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useReportePagosPDF } from '../composables/useReportePagosPDF';

const props = defineProps({
  show: { type: Boolean, default: false },
  instrumentador: { type: Object, default: () => ({}) },
  liquidaciones: { type: Array, default: () => [] }
});

const emit = defineEmits(['close']);

const { generarReportePagos } = useReportePagosPDF();

const selectedPeriod = ref('mes-actual');
const startDate = ref('');
const endDate = ref('');

const filteredLiquidaciones = computed(() => {
  if (!props.liquidaciones) return [];
  const now = new Date();

  if (selectedPeriod.value === 'mes-actual') {
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();
    return props.liquidaciones.filter(l => {
      if (!l.fecha_pago) return false;
      const d = new Date(l.fecha_pago);
      return d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
    });
  }

  if (selectedPeriod.value === 'custom') {
    return props.liquidaciones.filter(l => {
      if (!l.fecha_pago) return false;
      const d = l.fecha_pago.split('T')[0];
      if (startDate.value && d < startDate.value) return false;
      if (endDate.value && d > endDate.value) return false;
      return true;
    });
  }

  return props.liquidaciones;
});

const periodoLabel = computed(() => {
  if (selectedPeriod.value === 'mes-actual') return 'Mes actual';
  if (selectedPeriod.value === 'custom') return `Período personalizado (${startDate.value || 'inicio'} a ${endDate.value || 'actualidad'})`;
  return 'Mes actual';
});

const handleGenerar = () => {
  generarReportePagos({
    instrumentador: props.instrumentador,
    liquidaciones: filteredLiquidaciones.value,
    periodoLabel: periodoLabel.value
  });
  emit('close');
};
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
