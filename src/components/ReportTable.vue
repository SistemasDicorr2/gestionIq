<!-- src/components/ReportTable.vue -->
<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md rounded-2xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60">
        <thead class="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/60">
          <tr>
            <th scope="col" class="p-4 w-12 text-center">
              <input 
                type="checkbox" 
                class="checkbox-lg-styled"
                :checked="areAllOnPageSelected"
                @change="$emit('toggle-select-all')"
              />
            </th>
            <th scope="col" class="table-header">Paciente</th>
            <th scope="col" class="table-header !px-2 text-center w-28">Fecha Cirugía</th>
            <th scope="col" class="table-header">Médico</th>
            <th scope="col" class="table-header">Instrumentador</th>
            <th scope="col" class="table-header">Estado</th>
            <th scope="col" class="table-header">Fecha Generación</th>
            <th scope="col" class="table-header text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
          <tr v-if="reportes.length === 0">
            <td colspan="8" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              No se encontraron reportes con los filtros actuales.
            </td>
          </tr>
          <tr v-for="reporte in reportes" :key="reporte.id" 
              class="transition-all duration-150 hover:bg-slate-50/30 dark:hover:bg-slate-800/20"
              :class="{'bg-indigo-50/20 dark:bg-indigo-950/10': isReportSelected(reporte.id)}">
            <td class="p-4 w-12 text-center">
              <input 
                type="checkbox" 
                class="checkbox-lg-styled"
                :checked="isReportSelected(reporte.id)"
                @change="$emit('toggle-selection', reporte.id)"
              />
            </td>
            <td class="table-cell">
              <div class="font-semibold text-slate-900 dark:text-slate-100">{{ reporte.paciente }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ID: {{ reporte.id_cirugia || 'N/A' }}</div>
              
              <!-- Mini-galería de Evidencias Cargadas (Vista Previa Rápida) -->
              <div v-if="reporte.evidencias && reporte.evidencias.length > 0" class="flex items-center gap-1.5 mt-2">
                <button 
                  v-for="(ev, imgIdx) in reporte.evidencias.slice(0, 3)" 
                  :key="ev.url"
                  @click="openQuickPreview(reporte.evidencias, imgIdx)"
                  class="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
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
                  class="text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded-md"
                >
                  +{{ reporte.evidencias.length - 3 }}
                </span>
              </div>
            </td>
            <td class="table-cell !px-2 text-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              {{ formatDate(reporte.fecha_cirugia) }}
            </td>
            <td class="table-cell text-slate-700 dark:text-slate-300">{{ reporte.medico }}</td>
            <td class="table-cell text-slate-900 dark:text-white font-black text-sm">
              {{ reporte.instrumentador_completado || 'No asignado' }}
            </td>
            <td class="table-cell">
              <span :class="['px-3 py-1 text-xs font-black rounded-full border inline-flex items-center gap-1.5 shadow-sm uppercase tracking-wider', getEstadoClass(reporte.estado)]">
                <span :class="['w-1.5 h-1.5 rounded-full shrink-0', getDotClass(reporte.estado)]"></span>
                {{ reporte.estado || 'Pendiente' }}
              </span>
            </td>
            <td class="table-cell">
              <div v-if="reporte.fecha_link_generado" class="flex flex-col gap-0.5">
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Creado: <span class="font-bold">{{ formatDateTime(reporte.fecha_link_generado) }}</span>
                </span>
                <span class="text-[9px] font-black uppercase tracking-widest text-emerald-650 dark:text-emerald-450 mt-0.5">
                  Ficha Activa
                </span>
              </div>
              <span v-else class="text-slate-400 dark:text-slate-500 text-xs italic font-medium">Sin generar</span>
            </td>
            <td class="table-cell text-right">
              <div class="inline-flex items-center gap-3">
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

// ========= INICIO DE LA MEJORA: INTELIGENCIA DE PRESENTACIÓN MOVIDA AQUÍ =========
const getEstadoClass = (estado) => {
  if (estado === 'Enviado') {
    return 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-250 border-emerald-300/60 dark:border-emerald-800/80';
  }
  if (estado === 'Pendiente') {
    return 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-250 border-amber-300/60 dark:border-amber-800/80';
  }
  return 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-750';
};

const getDotClass = (estado) => {
  if (estado === 'Enviado') return 'bg-emerald-500 animate-pulse';
  if (estado === 'Pendiente') return 'bg-amber-500';
  return 'bg-slate-400';
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
// ========= FIN DE LA MEJORA =========
</script>

<style scoped>
.table-header {
  @apply px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300;
}

.checkbox-lg-styled {
  @apply h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-150 cursor-pointer;
}

.action-btn-primary {
  @apply text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all duration-150 cursor-pointer;
}

.action-btn-secondary {
  @apply text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all duration-150 cursor-pointer;
}

.action-icon-btn {
  @apply text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg active:scale-95 transition-all duration-150 cursor-pointer;
}
</style>