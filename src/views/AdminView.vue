<!-- src/views/AdminView.vue -->
<template>
  <div class="p-2 sm:p-4 lg:p-6 2xl:p-8 min-h-screen">
    <FilterBar 
      @update-filters="applyFilters" 
      @export-lista="exportarListaPDF"
      @export-trazabilidad="exportarTrazabilidadPDF"
      :is-exporting="isExporting"
    />

    <div v-if="loading" class="space-y-4">
      <SkeletonLoader v-for="n in 5" :key="`skel-${n}`" />
    </div>
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>
    <div v-else>
      <div class="hidden sm:block">
        <ReportTable
          :reportes="reportes"
          :selected-reportes="selectedReportes"
          @open-drawer="openDrawer"
          @open-link-modal="openGenerateLinkModal"
          @export-summary="exportarResumenPacientePDF"
        />
        <PaginationControls v-if="totalReportes > itemsPerPage" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>

      <div class="sm:hidden space-y-4">
        <p v-if="reportes.length === 0" class="text-center text-slate-500 py-10 text-sm font-medium">No se encontraron reportes.</p>
        <ReportCard 
          v-for="reporte in reportes" 
          :key="reporte.id" 
          :reporte="reporte" 
          @share="openGenerateLinkModal(reporte)" 
          @details="openDrawer"
          @copy-link="copyLinkFromCard"
        />
        <PaginationControls v-if="totalReportes > itemsPerPage" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>
    </div>
    
    <NewSurgeryModal :show="isNewSurgeryModalVisible" @close="closeNewSurgeryModal" @surgery-created="handleSurgeryCreated"/>
    <ReportDrawer 
      :show="isDrawerVisible" 
      :reporte="selectedReporte" 
      @close="closeDrawer"
      @updated="fetchReportes"
    />
    <GenerateLinkModal 
      :show="isGenerateLinkModalVisible"
      :reporte="selectedReporteForLink"
      @close="closeGenerateLinkModal"
      @link-generated="handleLinkGenerated"
      @link-expired="handleLinkExpired"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, h, markRaw, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import FilterBar from '../components/FilterBar.vue';
import PaginationControls from '../components/PaginationControls.vue';
import NewSurgeryModal from '../components/NewSurgeryModal.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import ReportCard from '../components/ReportCard.vue';
import GenerateLinkModal from '../components/GenerateLinkModal.vue';
import { DocumentTextIcon } from '@heroicons/vue/24/outline';
import ReportTable from '../components/ReportTable.vue';

const headerConfig = inject('header-config');
const openNewSurgeryModal = () => { isNewSurgeryModalVisible.value = true; };

onMounted(() => {
  headerConfig.value = {
    title: 'Panel de Cirugías',
    buttons: [
      {
        text: 'Nueva Cirugía',
        action: openNewSurgeryModal,
        class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2',
        icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' }) ]) })
      }
    ]
  };
  fetchReportes();
});

onUnmounted(() => {
  headerConfig.value = { title: '', buttons: [] };
});

const toast = useToast();
const activeFilters = ref({});
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalReportes = ref(0);
const reportes = ref([]);
const loading = ref(true);
const error = ref(null);
const isNewSurgeryModalVisible = ref(false);
const isDrawerVisible = ref(false);
const selectedReporte = ref(null);
const isGenerateLinkModalVisible = ref(false);
const selectedReporteForLink = ref(null);
const isExporting = ref(false);
const selectedReportes = ref(new Set());

const toggleSelection = (reporteId) => {
  if (selectedReportes.value.has(reporteId)) {
    selectedReportes.value.delete(reporteId);
  } else {
    selectedReportes.value.add(reporteId);
  }
};

const toggleSelectAll = () => {
  const pageIds = reportes.value.map(r => r.id);
  if (reportes.value.length > 0 && pageIds.every(id => selectedReportes.value.has(id))) {
    pageIds.forEach(id => selectedReportes.value.delete(id));
  } else {
    pageIds.forEach(id => selectedReportes.value.add(id));
  }
};

const fetchReportes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      p_paciente: activeFilters.value.paciente || null,
      p_medico: activeFilters.value.medico || null,
      p_instrumentador: activeFilters.value.instrumentador || null,
      p_estado: activeFilters.value.estado || 'todos',
      p_start_date: activeFilters.value.startDate || null,
      p_end_date: activeFilters.value.endDate || null,
      p_date_filter_field: activeFilters.value.dateFilterField || 'fecha_cirugia',
      p_rating_puntualidad_max: activeFilters.value.rating_puntualidad_max || null,
      p_rating_condiciones_max: activeFilters.value.rating_condiciones_max || null,
      p_rating_asesoramiento_max: activeFilters.value.rating_asesoramiento_max || null,
      p_rating_evaluacion_general_max: activeFilters.value.rating_evaluacion_general_max || null,
      p_page: currentPage.value,
      p_items_per_page: itemsPerPage.value
    };
    
    const { data, error: rpcError } = await supabase.rpc('search_reportes_avanzado', params);
    
    if (rpcError) throw rpcError;
    
    if (data && data.length > 0) {
      reportes.value = data;
      totalReportes.value = data[0].total_count;

      // Consultar links cortos y evidencias cargadas en paralelo para optimizar rendimiento
      const ids = data.map(r => r.id);

      const [linksResult, evidenciasResult] = await Promise.all([
        supabase
          .from('short_links')
          .select('reporte_id, created_at, short_code')
          .in('reporte_id', ids),
        supabase
          .from('reporte_evidencias')
          .select('reporte_id, object_key, file_name, content_type')
          .in('reporte_id', ids)
          .like('content_type', 'image/%')
      ]);

      const linksData = linksResult.data;
      const linksError = linksResult.error;
      const evidenciasData = evidenciasResult.data;
      const evidenciasError = evidenciasResult.error;

      const linksMap = {};
      if (!linksError && linksData) {
        linksData.forEach(link => {
          linksMap[link.reporte_id] = link;
        });
      }

      const evidenciasMap = {};
      if (!evidenciasError && evidenciasData) {
        const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
        
        const getThumbnailUrl = (objectKey, contentType) => {
          if (!objectKey) return '';
          const lowerKey = objectKey.toLowerCase();
          const isJpg = (contentType && contentType.startsWith('image/jpeg')) ||
                        (lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg'));
          if (!isJpg) {
            return `${R2_PUBLIC_URL}/${objectKey}`;
          }
          const lastDot = objectKey.lastIndexOf('.');
          if (lastDot === -1) return `${R2_PUBLIC_URL}/${objectKey}`;
          const base = objectKey.substring(0, lastDot);
          return `${R2_PUBLIC_URL}/${base}_thumb.webp`;
        };

        evidenciasData.forEach(ev => {
          if (!evidenciasMap[ev.reporte_id]) {
            evidenciasMap[ev.reporte_id] = [];
          }
          evidenciasMap[ev.reporte_id].push({
            url: `${R2_PUBLIC_URL}/${ev.object_key}`,
            thumbnailUrl: getThumbnailUrl(ev.object_key, ev.content_type),
            name: ev.file_name || 'Evidencia'
          });
        });
      }

      reportes.value = reportes.value.map(r => ({
        ...r,
        short_code: linksMap[r.id]?.short_code || null,
        fecha_link_generado: linksMap[r.id]?.created_at || null,
        evidencias: evidenciasMap[r.id] || []
      }));
    } else {
      reportes.value = [];
      totalReportes.value = 0;
    }
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los reportes: " + err.message);
  } finally {
    loading.value = false;
  }
};

const applyFilters = (newFilters) => {
  activeFilters.value = newFilters;
  currentPage.value = 1;
  fetchReportes();
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchReportes();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getAllFilteredReportes = async () => {
  const params = {
      p_paciente: activeFilters.value.paciente || null,
      p_medico: activeFilters.value.medico || null,
      p_instrumentador: activeFilters.value.instrumentador || null,
      p_estado: activeFilters.value.estado || 'todos',
      p_start_date: activeFilters.value.startDate || null,
      p_end_date: activeFilters.value.endDate || null,
      p_date_filter_field: activeFilters.value.dateFilterField || 'fecha_cirugia',
      p_rating_puntualidad_max: activeFilters.value.rating_puntualidad_max || null,
      p_rating_condiciones_max: activeFilters.value.rating_condiciones_max || null,
      p_rating_asesoramiento_max: activeFilters.value.rating_asesoramiento_max || null,
      p_rating_evaluacion_general_max: activeFilters.value.rating_evaluacion_general_max || null,
      p_page: 1,
      p_items_per_page: 9999
  };
  const { data, error } = await supabase.rpc('search_reportes_avanzado', params);
  if (error) throw error;
  return data;
};

const exportarListaPDF = async () => {
  isExporting.value = true;
  toast.info("Generando lista de reportes...");
  try {
    const allReportes = await getAllFilteredReportes();
    const doc = new jsPDF();
    doc.text("Lista de Reportes Filtrados", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [['Fecha', 'Paciente', 'Médico', 'Instrumentador', 'Estado']],
      body: allReportes.map(r => [
        formatDate(r.fecha_cirugia),
        r.paciente,
        r.medico,
        r.instrumentador_completado,
        r.estado
      ]),
    });
    doc.save(`Lista_Reportes_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("Lista exportada con éxito.");
  } catch (err) {
    toast.error("Error al exportar la lista: " + err.message);
  } finally {
    isExporting.value = false;
  }
};

const exportarTrazabilidadPDF = async () => {
  isExporting.value = true;
  toast.info("Generando reporte de trazabilidad...");
  try {
    const allReportes = await getAllFilteredReportes();
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageHeight = doc.internal.pageSize.height;
    let y = 40;

    doc.setFontSize(18);
    doc.text("Reporte de Trazabilidad", 40, y);
    y += 20;

    allReportes.forEach(reporte => {
      const blockHeight = 80; 
      if (y + blockHeight > pageHeight - 40) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${formatDate(reporte.fecha_cirugia)} - ${reporte.paciente}`, 40, y);
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID Cirugía: ${reporte.id_cirugia}`, 40, y);
      y += 15;
      doc.text(`Médico: ${reporte.medico}`, 40, y);
      y += 15;
      doc.text(`Instrumentador: ${reporte.instrumentador_completado}`, 40, y);
      y += 25;
    });

    doc.save(`Trazabilidad_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("Reporte de trazabilidad exportado.");
  } catch (err) {
    toast.error("Error al exportar trazabilidad: " + err.message);
  } finally {
    isExporting.value = false;
  }
};

const exportarResumenPacientePDF = (reporte) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Resumen para ${reporte.paciente}`, 14, 22);
  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(reporte.fecha_cirugia)}`, 14, 30);
  doc.text(`Médico: ${reporte.medico}`, 14, 36);
  doc.text(`Consumo: ${reporte.consumo_realizado || 'No reportado'}`, 14, 42);
  doc.save(`Resumen_${reporte.paciente}.pdf`);
};

const exportarSeleccionPDF = async () => {
  if (selectedReportes.value.size === 0) {
    toast.info("No hay reportes seleccionados para exportar.");
    return;
  }
  isExporting.value = true;
  toast.info(`Exportando ${selectedReportes.value.size} resúmenes...`);

  try {
    const idsToFetch = Array.from(selectedReportes.value);
    const { data: reportesSeleccionados, error } = await supabase
      .from('reportes')
      .select('paciente, tipo_cirugia, observaciones, instrumentador_completado')
      .in('id', idsToFetch);

    if (error) throw error;

    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    doc.setFontSize(16);
    doc.text("Resumen de Cirugías Seleccionadas", pageWidth / 2, y, { align: 'center' });
    y += 15;

    reportesSeleccionados.forEach((reporte, index) => {
      const observaciones = reporte.observaciones || 'Sin observaciones.';
      doc.setFontSize(9);
      const obsLines = doc.splitTextToSize(observaciones, contentWidth);
      const blockHeight = 25 + (obsLines.length * 4) + 10;

      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(reporte.paciente || 'Paciente no especificado', margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(reporte.tipo_cirugia || 'N/A', margin, y);
      y += 5;

      doc.setFont('helvetica', 'italic');
      doc.text(reporte.instrumentador_completado || 'Instrumentador no asignado', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      y += 8;

      doc.setFontSize(9);
      doc.text(obsLines, margin, y);
      y += obsLines.length * 4 + 10;

      if (index < reportesSeleccionados.length - 1) {
        doc.setDrawColor(220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      }
    });

    doc.save(`Resumen_Seleccion_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("Exportación completada.");
    selectedReportes.value.clear();

  } catch (err) {
    console.error("Error al exportar selección:", err);
    toast.error("No se pudo generar el PDF: " + err.message);
  } finally {
    isExporting.value = false;
  }
};

const closeNewSurgeryModal = () => { isNewSurgeryModalVisible.value = false; };
const openDrawer = (reporte) => {
  selectedReporte.value = reporte;
  isDrawerVisible.value = true;
};
const closeDrawer = () => {
  isDrawerVisible.value = false;
};
const handleSurgeryCreated = () => {
  toast.success("¡Cirugía creada con éxito!");
  fetchReportes();
};
const openGenerateLinkModal = (reporte) => {
  selectedReporteForLink.value = reporte;
  isGenerateLinkModalVisible.value = true;
};
const closeGenerateLinkModal = () => {
  isGenerateLinkModalVisible.value = false;
  selectedReporteForLink.value = null;
};
const copyLinkFromCard = async (reporte) => {
  if (!reporte.short_code) return;
  const fullLink = `${window.location.origin}/f/${reporte.short_code}`;
  try {
    await navigator.clipboard.writeText(fullLink);
    toast.success(`¡Enlace copiado para ${reporte.paciente}!`);
  } catch (err) {
    toast.error('No se pudo copiar el enlace.');
  }
};
const handleLinkGenerated = ({ reporteId, short_code, created_at }) => {
  const idx = reportes.value.findIndex(r => r.id === reporteId);
  if (idx !== -1) {
    reportes.value[idx].short_code = short_code;
    reportes.value[idx].fecha_link_generado = created_at || new Date().toISOString();
  }
};
const handleLinkExpired = ({ reporteId }) => {
  const reporteIndex = reportes.value.findIndex(r => r.id === reporteId);
  if (reporteIndex !== -1) {
    reportes.value[reporteIndex].estado = 'Expirado';
    reportes.value[reporteIndex].short_code = null;
    reportes.value[reporteIndex].fecha_link_generado = null;
  }
};
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>