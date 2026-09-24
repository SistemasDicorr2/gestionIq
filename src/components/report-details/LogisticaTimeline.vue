<!-- src/components/report-details/LogisticaTimeline.vue -->
<template>
  <div class="logistica-timeline-container space-y-4">
    
    <!-- Barra Superior de Acciones de Devolución -->
    <div class="bg-white dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>🚚</span>
          <span>Controles de Logística Interna</span>
        </h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Registro de recepción, estado de cajas y evidencias fotográficas
        </p>
      </div>

      <!-- Botón Prominente: Generar Reporte de Devolución -->
      <button 
        type="button" 
        @click="openReporteModal(null)"
        class="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        title="Generar e imprimir Reporte de Devolución en PDF con fotos y marcas de faltantes"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span>📄 Generar Reporte de Devolución (PDF)</span>
      </button>
    </div>

    <!-- Estado de Carga -->
    <div v-if="isLoading" class="loading-state">Cargando controles de logística...</div>
    <!-- Estado de Error -->
    <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>
    
    <!-- Línea de Tiempo de Controles -->
    <ul v-else-if="logisticaControls.length > 0" class="timeline">
      <li v-for="control in logisticaControls" :key="control.id" class="timeline-item">
        <div class="timeline-dot" :class="getStatusColor(control.estado)"></div>
        <div class="timeline-content">
          <!-- Título, Fecha y Botón de Reporte del Control -->
          <div class="timeline-header flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p class="timeline-title">Control de Devolución - Estado: <span class="font-bold">{{ control.estado.toUpperCase() }}</span></p>
              <time class="timeline-time">{{ formatDateTime(control.created_at) }}</time>
            </div>

            <!-- Botón directo por control -->
            <button 
              type="button" 
              @click="openReporteModal(control)"
              class="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 dark:border-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              title="Generar PDF de este control"
            >
              <span>📄 Ver Reporte PDF</span>
            </button>
          </div>
          
          <div v-if="control.observaciones" class="observaciones-wrapper">
            <strong>Observaciones:</strong>
            <p class="observaciones-texto">
              {{ control.observaciones }}
            </p>
          </div>

          <!-- Visor de Evidencias -->
          <EvidenceViewer 
            v-if="control.photos && control.photos.length > 0"
            :files="control.photos" 
            :deletable="true"
            @file-deleted="(fileId) => handleFileDeleted(control.id, fileId)"
            class="mt-4"
          />
        </div>
      </li>
    </ul>

    <!-- Mensaje si no se encuentran controles -->
    <div v-else class="empty-state">
      <p>No se han registrado controles de logística para este reporte.</p>
    </div>

    <!-- Modal Orquestador de Reporte de Devolución -->
    <ReporteDevolucionModal 
      v-model="showReporteModal"
      :report-id="props.reportId"
      :control="selectedControlForReport"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';

// Importamos nuestros componentes reutilizables
import EvidenceViewer from '../shared/EvidenceViewer.vue';
import ReporteDevolucionModal from '../logistica/ReporteDevolucionModal.vue';

const props = defineProps({
  reportId: { type: [String, Number], required: true },
});

const isLoading = ref(true);
const errorMsg = ref(null);
const logisticaControls = ref([]);
const showReporteModal = ref(false);
const selectedControlForReport = ref(null);

const openReporteModal = (control = null) => {
  selectedControlForReport.value = control || (logisticaControls.value.length > 0 ? logisticaControls.value[0] : null);
  showReporteModal.value = true;
};

// COMENTARIO: Obtenemos la URL pública de R2 desde las variables de entorno.
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// COMENTARIO: Función para formatear la fecha y hora a un formato legible.
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires'
  }) + ' hs';
};

// COMENTARIO: Asigna un color al punto de la línea de tiempo según el estado.
const getStatusColor = (status) => {
  if (status === 'ok') return 'bg-green-500';
  if (status === 'revision') return 'bg-yellow-500';
  if (status === 'problemas') return 'bg-red-500';
  return 'bg-gray-400';
};

const handleFileDeleted = (controlId, fileId) => {
  const control = logisticaControls.value.find(c => c.id === controlId);
  if (control && control.photos) {
    control.photos = control.photos.filter(p => p.id !== fileId);
  }
};

// COMENTARIO: Función principal que carga los datos desde la vista de Supabase.
const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = null;

  try {
    // Llama a la vista 'logistica_controles_con_evidencias' que ya une los controles con sus fotos.
    const { data, error } = await supabase
      .from('logistica_controles_con_evidencias')
      .select('*')
      .eq('cirugia_id', props.reportId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Procesa los datos recibidos para construir las URLs completas de las imágenes.
    const processedData = (data || []).map(control => {
      const processedPhotos = (control.photos || []).map(photo => ({
        ...photo,
        url: `${R2_PUBLIC_URL}/${photo.object_key}`, // Construye la URL pública.
        caption: photo.file_name
      }));
      return { ...control, photos: processedPhotos };
    });

    logisticaControls.value = processedData;

  } catch (error) {
    console.error("Error cargando datos de logística:", error);
    errorMsg.value = "No se pudo cargar la información de logística.";
  } finally {
    isLoading.value = false;
  }
};

// COMENTARIO: Llama a fetchData() cuando el componente se monta en el DOM.
onMounted(fetchData);
</script>

<style scoped>
.loading-state, .error-state, .empty-state { text-align: center; padding: 2rem; color: #64748b; }
.error-state { color: #dc2626; }
.empty-state { font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px; }
.timeline { list-style: none; padding: 0; position: relative; }
.timeline::before { content: ''; position: absolute; top: 5px; left: 5px; bottom: 5px; width: 2px; background-color: #e2e8f0; }
.timeline-item { position: relative; padding-left: 2rem; margin-bottom: 2rem; }
.timeline-dot { position: absolute; left: 0; top: 5px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; }
.timeline-header { display: flex; justify-content: space-between; align-items: baseline; }
.timeline-title { font-weight: 600; color: #334155; }
.timeline-time { font-size: 0.75rem; color: #94a3b8; }
.bg-green-500 { background-color: #22c55e; }
.bg-yellow-500 { background-color: #f59e0b; }
.bg-red-500 { background-color: #ef4444; }
.bg-gray-400 { background-color: #9ca3af; }

/* COMENTARIO: INICIO DE NUEVOS ESTILOS */
.observaciones-wrapper {
  margin-top: 0.75rem; /* 12px */
  padding: 0.75rem; /* 12px */
  background-color: #f8fafc; /* bg-slate-50 */
  border-left: 3px solid #cbd5e1; /* border-slate-300 */
  border-radius: 4px;
}
.observaciones-wrapper strong {
  font-size: 0.875rem; /* 14px */
  color: #475569; /* text-slate-600 */
}
.observaciones-texto {
  font-size: 0.875rem; /* 14px */
  color: #64748b; /* text-slate-500 */
  margin-top: 0.25rem; /* 4px */
  white-space: pre-wrap; /* Respeta saltos de línea y espacios */
}
/* FIN DE NUEVOS ESTILOS */
</style>