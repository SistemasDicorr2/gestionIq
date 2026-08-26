<!-- src/components/logistica/ReporteConsolidadoModal.vue -->
<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
  >
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
      
      <!-- CABECERA DE LA MODAL -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
              REG03-LOG-CONS
            </span>
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Gestión IQ Logística
            </span>
          </div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>📦 Reporte Consolidado de Envíos y Transportes</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Análisis consolidado de bultos, modalidades y zonas concurridas (destino modal más frecuente por empresa).
          </p>
        </div>

        <button 
          type="button" 
          @click="closeModal" 
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
          title="Cerrar modal"
        >
          ✕
        </button>
      </div>

      <!-- BOTONES DE EXPORTACIÓN Y FILTROS -->
      <div class="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>📊 Exportar Reporte PDF:</span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button 
            type="button" 
            @click="exportarPDF('encomiendas')"
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>📄 Solo Encomiendas</span>
          </button>

          <button 
            type="button" 
            @click="exportarPDF('proveedores')"
            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>🚚 Solo Proveedores</span>
          </button>

          <button 
            type="button" 
            @click="exportarPDF('consolidado')"
            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>📊 Consolidado Completo</span>
          </button>
        </div>
      </div>

      <!-- METRICAS / KPIS PRINCIPALES -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-1">
          <span class="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300 tracking-wider">Total Bultos / Envíos</span>
          <div class="text-xl font-black text-blue-950 dark:text-white font-mono">
            {{ totalBultos }} <span class="text-xs font-normal text-blue-600">registros</span>
          </div>
        </div>

        <div class="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl space-y-1">
          <span class="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-300 tracking-wider">Empresas / Proveedores</span>
          <div class="text-xl font-black text-indigo-950 dark:text-white font-mono">
            {{ consolidadoList.length }} <span class="text-xs font-normal text-indigo-600">empresas</span>
          </div>
        </div>

        <div class="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl space-y-1">
          <span class="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">Zona Concurrida Lider</span>
          <div class="text-xs font-black text-emerald-950 dark:text-white truncate" :title="topZonaConcurrida">
            📍 {{ topZonaConcurrida }}
          </div>
        </div>
      </div>

      <!-- TABLA CONSOLIDADA INTERACTIVA -->
      <div class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto max-h-96">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider sticky top-0 z-10">
                <th class="py-3 px-3.5">Empresa / Proveedor</th>
                <th class="py-3 px-3.5">📍 Zona Concurrida (Destino Más Frecuente)</th>
                <th class="py-3 px-3.5 text-center">Bultos</th>
                <th class="py-3 px-3.5 text-center">% Participación</th>
                <th class="py-3 px-3.5 text-center">Cuenta Corriente</th>
                <th class="py-3 px-3.5 text-center">Pago Directo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr v-if="consolidadoList.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 italic">
                  No hay datos registrados para procesar el reporte consolidado.
                </td>
              </tr>

              <tr 
                v-for="(item, idx) in consolidadoList" 
                :key="idx" 
                class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                :class="item.proveedor === 'LOGISTICA CIRUGIA' ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''"
              >
                <td class="py-3 px-3.5 font-extrabold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2">
                    <span 
                      class="px-2 py-0.5 text-[10px] font-mono font-black rounded"
                      :class="item.proveedor === 'LOGISTICA CIRUGIA' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'"
                    >
                      {{ normalizeProveedor(item.proveedor) }}
                    </span>
                  </div>
                </td>

                <td class="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-200">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-xs">
                    📍 {{ item.zonaConcurrida }}
                  </span>
                </td>

                <td class="py-3 px-3.5 text-center font-mono font-black text-slate-900 dark:text-white text-sm">
                  {{ item.bultos }}
                </td>

                <td class="py-3 px-3.5 text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden max-w-[80px] mx-auto mb-1">
                    <div class="bg-blue-600 h-full rounded-full" :style="{ width: `${Math.min(100, item.porcentaje)}%` }"></div>
                  </div>
                  {{ item.porcentaje }}%
                </td>

                <td class="py-3 px-3.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                  {{ item.cuentaCorriente }}
                </td>

                <td class="py-3 px-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {{ item.pagoDirecto }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BOTÓN CERRAR -->
      <div class="flex justify-end pt-2">
        <button 
          type="button" 
          @click="closeModal" 
          class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          ✕ Cerrar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getMostFrequentDestination, normalizeProveedor } from '../../utils/logisticaHelpers';
import { useReporteConsolidadoPDF } from '../../composables/useReporteConsolidadoPDF';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  records: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

const { generateConsolidadoPDF } = useReporteConsolidadoPDF();

const closeModal = () => {
  emit('close');
};

const consolidadoList = computed(() => {
  return getMostFrequentDestination(props.records || []);
});

const totalBultos = computed(() => {
  return consolidadoList.value.reduce((acc, curr) => acc + curr.bultos, 0);
});

const topZonaConcurrida = computed(() => {
  if (consolidadoList.value.length === 0) return 'Sin datos';
  return consolidadoList.value[0].zonaConcurrida || 'Sin especificar';
});

const exportarPDF = (modo) => {
  generateConsolidadoPDF(consolidadoList.value, modo, 'Período Completo Registrado');
};
</script>
