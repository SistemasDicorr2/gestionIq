<!-- src/components/ReportTable.vue -->
<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden select-none">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
        <thead class="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th scope="col" class="table-header">Paciente</th>
            <th scope="col" class="table-header !px-2 text-center w-28">Fecha Cirugía</th>
            <th scope="col" class="table-header">Médico</th>
            <th scope="col" class="table-header">Instrumentador</th>
            <th scope="col" class="table-header">Estado</th>
            <th scope="col" class="table-header">Fecha Generación</th>
            <th scope="col" class="table-header text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800 bg-white dark:bg-slate-900">
          <tr v-if="reportes.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              No se encontraron reportes con los filtros actuales.
            </td>
          </tr>
          <tr v-for="reporte in reportes" :key="reporte.id" 
              class="transition-all duration-150"
              :class="getRowClass(reporte)">
            <td class="table-cell">
              <div class="font-bold text-slate-900 dark:text-slate-100 max-w-[140px] lg:max-w-[170px] xl:max-w-[200px] 2xl:max-w-none truncate" :title="reporte.paciente">{{ reporte.paciente }}</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold mt-0.5">ID: {{ reporte.id_cirugia || 'N/A' }}</div>
              
              <!-- Mini-galería de Evidencias Cargadas (Vista Previa Rápida) -->
              <div v-if="reporte.evidencias && reporte.evidencias.length > 0" class="flex items-center gap-1.5 mt-2">
                <button 
                  v-for="(ev, imgIdx) in reporte.evidencias.slice(0, 3)" 
                  :key="ev.url"
                  @click="openQuickPreview(reporte.evidencias, imgIdx)"
                  class="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 hover:scale-110 active:scale-95 transition-all shadow-2xs cursor-pointer shrink-0"
                  title="Ver evidencia"
                >
                  <img 
                    :src="ev.thumbnailUrl || ev.url" 
                    :alt="ev.name" 
                    class="w-full h-full object-cover" 
                    @error="handleImageError($event, ev.url)"
                  />
                </button>
                <span 
                  v-if="reporte.evidencias.length > 3" 
                  class="text-[9px] font-black text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded-md"
                >
                  +{{ reporte.evidencias.length - 3 }}
                </span>
              </div>
            </td>
            <td class="table-cell !px-2 text-center font-bold text-slate-900 dark:text-slate-100">
              {{ formatDate(reporte.fecha_cirugia) }}
            </td>
            <td class="table-cell text-slate-800 dark:text-slate-200 font-medium">
              <div class="max-w-[85px] lg:max-w-[95px] xl:max-w-[110px] 2xl:max-w-none truncate" :title="reporte.medico">
                {{ reporte.medico }}
              </div>
            </td>
            <td class="table-cell text-slate-900 dark:text-slate-100 font-bold">
              <div class="max-w-[85px] lg:max-w-[95px] xl:max-w-[110px] 2xl:max-w-none truncate" :title="reporte.instrumentador_completado || 'No asignado'">
                {{ reporte.instrumentador_completado || 'No asignado' }}
              </div>
            </td>
            <td class="table-cell">
              <span :class="['px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border inline-flex items-center gap-1 shadow-2xs uppercase tracking-wider', getEstadoClass(reporte.estado)]">
                <span :class="['w-1.5 h-1.5 rounded-full shrink-0', getDotClass(reporte.estado)]"></span>
                {{ reporte.estado || 'Pendiente' }}
              </span>
            </td>
            <td class="table-cell">
              <div v-if="reporte.fecha_link_generado" class="flex flex-col gap-0.5">
                <span class="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  Creado: <span class="font-bold text-slate-900 dark:text-white">{{ formatDate(reporte.fecha_link_generado) }}</span>
                </span>
                <span class="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Ficha Activa
                </span>
              </div>
              <span v-else class="text-slate-400 dark:text-slate-500 text-xs italic font-medium">Sin generar</span>
            </td>
            <td class="table-cell text-right">
              <div class="inline-flex items-center gap-1.5 xl:gap-2">
                <button @click="$emit('open-link-modal', reporte)" class="action-btn-primary">Compartir</button>
                <button @click.prevent="$emit('open-drawer', reporte)" class="action-btn-secondary">Detalles</button>
                <button @click="$emit('export-summary', reporte)" title="Exportar Resumen de Paciente" class="action-icon-btn">
                  <DocumentTextIcon class="h-4.5 w-4.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Lightbox de Vista Previa Rápida -->
    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="lightboxImages"
      :index="activeLightboxIndex"
      @hide="isLightboxOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { DocumentTextIcon } from '@heroicons/vue/24/outline';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

// Props que el componente recibe del padre.
const props = defineProps({
  reportes: {
    type: Array,
    required: true
  },
  selectedReportes: {
    type: Set,
    required: true
  }
});

// Eventos que el componente emite hacia el padre.
const emit = defineEmits([
  'toggle-selection',
  'toggle-select-all',
  'open-drawer',
  'open-link-modal',
  'export-summary'
]);

// Lógica de selección que depende de las props.
const isReportSelected = (reporteId) => props.selectedReportes.has(reporteId);

const getRowClass = (reporte) => {
  if (isReportSelected(reporte.id)) {
    return 'bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30';
  }
  if (reporte.estado === 'Enviado') {
    return 'bg-emerald-50/10 dark:bg-emerald-950/10 hover:bg-emerald-50/25 dark:hover:bg-emerald-950/20';
  }
  if (reporte.estado === 'Pendiente') {
    return 'bg-amber-50/10 dark:bg-amber-950/10 hover:bg-amber-50/25 dark:hover:bg-amber-950/20';
  }
  return 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40';
};

const areAllOnPageSelected = computed(() => {
  const pageIds = props.reportes.map(r => r.id);
  return pageIds.length > 0 && pageIds.every(id => props.selectedReportes.has(id));
});

// Lógica del Lightbox de Vista Previa
const isLightboxOpen = ref(false);
const lightboxImages = ref([]);
const activeLightboxIndex = ref(0);

const openQuickPreview = (evidencias, index = 0) => {
  lightboxImages.value = evidencias.map(ev => ev.url);
  activeLightboxIndex.value = index;
  isLightboxOpen.value = true;
};

const handleImageError = (event, originalUrl) => {
  if (event.target.src !== originalUrl) {
    event.target.src = originalUrl;
  }
};

const getEstadoClass = (estado) => {
  if (estado === 'Enviado') {
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  }
  if (estado === 'Pendiente') {
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  }
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
};

const getDotClass = (estado) => {
  if (estado === 'Enviado') return 'bg-emerald-500 animate-pulse';
  if (estado === 'Pendiente') return 'bg-amber-500';
  return 'bg-slate-400';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
</script>

<style scoped>
.table-header {
  @apply px-2.5 py-3 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider dark:text-slate-200 lg:px-3 xl:px-4 2xl:px-6;
}

.table-cell {
  @apply px-2.5 py-3 whitespace-nowrap text-xs text-slate-800 dark:text-slate-200 lg:px-3 xl:px-4 2xl:px-6;
}

.action-btn-primary {
  @apply text-[11px] font-extrabold text-brand-cyan dark:text-brand-cyan-light hover:text-white bg-brand-cyan/15 dark:bg-brand-cyan/25 hover:bg-brand-cyan px-2.5 py-1 rounded-lg active:scale-95 transition-all duration-150 cursor-pointer shadow-sm;
}

.action-btn-secondary {
  @apply text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg active:scale-95 transition-all duration-150 cursor-pointer shadow-sm;
}

.action-icon-btn {
  @apply text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg active:scale-95 transition-all duration-150 cursor-pointer;
}
</style>