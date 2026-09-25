<!-- src/components/ReportePagosModal.vue -->
<template>
  <GlassModal 
    :show="show" 
    max-width="md" 
    @close="$emit('close')"
  >
    <!-- Header del Modal -->
    <template #title>
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
          <FileDown class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-tight">Descargar Reporte PDF</h3>
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Informe consolidado de pagos por período</p>
        </div>
      </div>
    </template>

    <!-- Cuerpo del Formulario -->
    <div class="p-3.5 sm:p-5 space-y-3.5 text-slate-900 dark:text-slate-100">
      <!-- Selección de Período Simplificada -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Seleccionar Período
        </label>
        <select 
          v-model="selectedPeriod"
          class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="mes-actual">Mes Actual</option>
          <option value="custom">Rango Personalizado</option>
        </select>
      </div>

      <!-- Rango Personalizado de Fechas -->
      <div v-if="selectedPeriod === 'custom'" class="grid grid-cols-2 gap-2.5 pt-1">
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Fecha Desde</label>
          <input 
            type="date" 
            v-model="startDate"
            class="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Fecha Hasta</label>
          <input 
            type="date" 
            v-model="endDate"
            class="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Resumen de items incluidos -->
      <div class="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
        <span class="font-medium">Pagos incluidos en el reporte:</span>
        <span class="font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 font-mono">
          {{ filteredLiquidaciones.length }}
        </span>
      </div>
    </div>

    <!-- Footer Acciones -->
    <template #footer>
      <div class="flex items-center justify-between sm:justify-end gap-2 w-full">
        <button 
          type="button" 
          @click="$emit('close')"
          class="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-center"
        >
          Cancelar
        </button>
        <ShimmerButton 
          type="button" 
          @click="handleGenerar"
          :disabled="filteredLiquidaciones.length === 0"
          class="flex-1 sm:flex-initial px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700"
        >
          <FileDown class="w-3.5 h-3.5 mr-1" />
          <span>Descargar PDF</span>
        </ShimmerButton>
      </div>
    </template>
  </GlassModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useReportePagosPDF } from '../composables/useReportePagosPDF';
import { GlassModal, ShimmerButton } from './ui';
import { FileDown } from 'lucide-vue-next';

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

const handleGenerar = () => {
  let periodLabel = 'Mes Actual';
  if (selectedPeriod.value === 'custom') {
    periodLabel = `${startDate.value || 'Inicio'} al ${endDate.value || 'Hoy'}`;
  }

  generarReportePagos({
    instrumentador: props.instrumentador,
    liquidaciones: filteredLiquidaciones.value,
    periodoLabel: periodLabel
  });

  emit('close');
};
</script>
