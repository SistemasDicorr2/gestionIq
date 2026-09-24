<!-- src/components/logistica/ReporteDevolucionModal.vue -->
<template>
  <div>
    <!-- MODAL PRINCIPAL DE VISTA PREVIA Y EDICIÓN A4 -->
    <div 
      v-if="visible" 
      class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 print:p-0 print:bg-white print:static"
    >
      <!-- BARRA SUPERIOR DE ACCIONES STICKY Y ELEGANTE -->
      <div class="w-full max-w-5xl bg-slate-900/95 border border-slate-800 text-white rounded-2xl p-2.5 px-4 mb-3 flex flex-wrap items-center justify-between gap-2.5 shadow-2xl shrink-0 print:hidden sticky top-2 z-40 backdrop-blur-md">
        
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider">
            REG03-02-01-D
          </span>
          <div class="hidden sm:block">
            <h3 class="text-xs font-black text-white flex items-center gap-1.5">
              <span>Reporte de Devolución e Instrumental</span>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-blue-300">
                Zoom: {{ Math.round(effectiveScale * 100) }}%
              </span>
            </h3>
          </div>
        </div>

        <!-- CONTROLES DE ZOOM -->
        <div class="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <span class="text-[10px] text-slate-400 pl-1 hidden sm:inline">🔍 Zoom:</span>
          
          <button 
            type="button"
            @click="zoomOption = 'fit-width'"
            class="px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[10px]"
            :class="zoomOption === 'fit-width' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-400 hover:text-white'"
            title="Ajustar ancho para lectura óptima"
          >
            📐 Ancho Cómodo
          </button>

          <button 
            v-for="z in ['0.75', '0.85', '1.0']" 
            :key="z"
            type="button"
            @click="zoomOption = z"
            class="px-2 py-1 rounded-lg transition-all cursor-pointer text-[10px]"
            :class="zoomOption === z ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-white'"
          >
            {{ Math.round(parseFloat(z) * 100) }}%
          </button>
        </div>

        <!-- BOTONES DE ACCIÓN PRINCIPALES -->
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          
          <!-- DESCARGAR PDF DIRECTO -->
          <button 
            type="button" 
            @click="downloadDirectPDF" 
            :disabled="isExportingPDF || isLoading"
            class="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>{{ isExportingPDF ? 'Generando PDF...' : '📥 Descargar PDF' }}</span>
          </button>

          <!-- IMPRIMIR NATIVO -->
          <button 
            type="button" 
            @click="triggerPrint" 
            :disabled="isLoading"
            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>🖨️ Imprimir</span>
          </button>

          <!-- TOGGLE EDICIÓN DIRECTA EN HOJA -->
          <button 
            type="button" 
            @click="isEditableInPreview = !isEditableInPreview" 
            class="px-2.5 py-1.5 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
            :class="isEditableInPreview ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
            :title="isEditableInPreview ? 'Desactivar edición en hoja' : 'Activar edición haciendo clic directo en el documento A4'"
          >
            <span>✏️ Edición {{ isEditableInPreview ? 'ON' : 'OFF' }}</span>
          </button>

          <!-- WHATSAPP AL INSTRUMENTADOR -->
          <button 
            type="button" 
            @click="shareViaWhatsApp"
            class="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            title="Enviar mensaje de faltantes por WhatsApp al instrumentador"
          >
            <span>💬 WhatsApp</span>
          </button>

          <!-- CERRAR -->
          <button 
            type="button" 
            @click="closeModal" 
            class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      <!-- ESTADO DE CARGA -->
      <div v-if="isLoading" class="p-12 text-center text-white space-y-2">
        <div class="animate-spin text-2xl">⏳</div>
        <p class="text-xs text-slate-400 font-bold">Cargando datos y evidencias de logística...</p>
      </div>

      <!-- CONTENEDOR DEL DOCUMENTO FORMATO HOJA A4 -->
      <div v-else class="w-full max-w-5xl flex justify-center items-start overflow-x-auto pb-16 pt-1 print:p-0">
        <div 
          class="relative transition-all duration-200 flex justify-center origin-top shrink-0"
          :style="{
            width: `${Math.round(210 * effectiveScale)}mm`,
            maxWidth: '100%'
          }"
        >
          <div 
            class="origin-top bg-white rounded-2xl shadow-2xl print:shadow-none print:transform-none print:w-full print:max-w-none transition-transform duration-200 shrink-0"
            :style="{ 
              transform: `scale(${effectiveScale})`, 
              transformOrigin: 'top center',
              width: '210mm'
            }"
          >
            <ReporteDevolucionPDF 
              :control-data="controlFormData" 
              :imagenes="imagenesList" 
              :notas-paginas="notasPaginas" 
              :editable="isEditableInPreview"
              @annotate-image="openAnnotatorForImage"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- DOCUMENTO OCULTO PARA IMPRESIÓN DIRECTA -->
    <div v-if="visible" class="hidden print:block w-full">
      <ReporteDevolucionPDF 
        :control-data="controlFormData" 
        :imagenes="imagenesList" 
        :notas-paginas="notasPaginas" 
      />
    </div>

    <!-- MODAL DE ANOTACIÓN SOBRE FOTOS (FLECHAS, CÍRCULOS, LÁPIZ, TEXTO) -->
    <ImageAnnotationModal 
      v-if="selectedImageForAnnotation"
      :image="selectedImageForAnnotation"
      @close="selectedImageForAnnotation = null"
      @save="handleAnnotationSaved"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ReporteDevolucionPDF from './ReporteDevolucionPDF.vue';
import ImageAnnotationModal from './ImageAnnotationModal.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  reportId: {
    type: [String, Number],
    required: true
  },
  control: {
    type: Object,
    default: null
  },
  surgeryData: {
    type: Object,
    default: null
  },
  photos: {
    type: Array,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'closed']);

const toast = useToast();
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isLoading = ref(false);
const isExportingPDF = ref(false);
const isEditableInPreview = ref(true);
const zoomOption = ref('fit-width');
const selectedImageForAnnotation = ref(null);

const windowWidth = ref(window.innerWidth);
const updateWindowDimensions = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowDimensions);
});

const effectiveScale = computed(() => {
  if (zoomOption.value === 'fit-width') {
    const availableW = Math.min(windowWidth.value - 40, 960);
    const scaleW = availableW / 800;
    return Math.max(0.75, Math.min(0.85, parseFloat(scaleW.toFixed(2))));
  }
  return parseFloat(zoomOption.value);
});

// Datos del formulario de devolución
const controlFormData = reactive({
  report_id: '',
  cirugia_id: '',
  paciente: '',
  medico: '',
  institucion: '',
  instrumentador: '',
  fecha_cx: '',
  fecha_control: '',
  estado: 'problemas', // 'ok', 'revision', 'problemas'
  observaciones: '',
  responsable: 'Logística Districorr'
});

const imagenesList = ref([]);
const notasPaginas = reactive({});

// Watcher para abrir y cargar datos
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    await initReportData();
  }
});

const initReportData = async () => {
  isLoading.value = true;
  try {
    controlFormData.report_id = String(props.reportId || '');
    controlFormData.cirugia_id = String(props.reportId || '');

    // 1. Cargar datos de la cirugía si no vienen completos
    if (props.surgeryData) {
      populateSurgeryData(props.surgeryData);
    } else if (props.reportId) {
      const { data: surgery, error: sErr } = await supabase
        .from('reportes')
        .select('*')
        .eq('id', props.reportId)
        .maybeSingle();

      if (!sErr && surgery) {
        populateSurgeryData(surgery);
      }
    }

    // 2. Cargar datos del control y fotos
    if (props.control) {
      populateControlData(props.control);
    } else if (props.reportId) {
      const { data: controls, error: cErr } = await supabase
        .from('logistica_controles_con_evidencias')
        .select('*')
        .eq('cirugia_id', props.reportId)
        .order('created_at', { ascending: false });

      if (!cErr && controls && controls.length > 0) {
        populateControlData(controls[0]);
      }
    }

    // 3. Procesar fotos si no fueron asignadas
    if (props.photos && props.photos.length > 0 && imagenesList.value.length === 0) {
      imagenesList.value = props.photos.map((p, idx) => ({
        id: p.id || idx,
        url: p.url || (p.object_key ? `${R2_PUBLIC_URL}/${p.object_key}` : ''),
        originalUrl: p.url || (p.object_key ? `${R2_PUBLIC_URL}/${p.object_key}` : ''),
        annotatedUrl: null,
        annotations: [],
        hasAnnotations: false,
        size: 'grande',
        rotation: 0
      }));
    }

  } catch (err) {
    console.error("Error al inicializar Reporte de Devolución:", err);
    toast.error("No se pudieron cargar todos los datos de logística.");
  } finally {
    isLoading.value = false;
  }
};

const populateSurgeryData = (s) => {
  controlFormData.paciente = s.paciente || controlFormData.paciente || '';
  controlFormData.medico = s.medico || controlFormData.medico || '';
  controlFormData.institucion = s.institucion || controlFormData.institucion || '';
  controlFormData.instrumentador = s.instrumentador_nombre || s.instrumentador || controlFormData.instrumentador || '';
  controlFormData.fecha_cx = s.fecha_cirugia || s.fecha || controlFormData.fecha_cx || '';
};

const populateControlData = (c) => {
  controlFormData.estado = c.estado || controlFormData.estado || 'problemas';
  controlFormData.observaciones = c.observaciones || controlFormData.observaciones || '';
  controlFormData.fecha_control = c.fecha_retiro || (c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);

  if (c.photos && Array.isArray(c.photos)) {
    imagenesList.value = c.photos.map((p, idx) => ({
      id: p.id || idx,
      url: p.url || (p.object_key ? `${R2_PUBLIC_URL}/${p.object_key}` : ''),
      originalUrl: p.url || (p.object_key ? `${R2_PUBLIC_URL}/${p.object_key}` : ''),
      annotatedUrl: null,
      annotations: [],
      hasAnnotations: false,
      size: 'grande',
      rotation: 0
    }));
  }
};

// --- ANOTACIÓN DE IMÁGENES ---
const openAnnotatorForImage = (img) => {
  selectedImageForAnnotation.value = img;
};

const handleAnnotationSaved = ({ originalUrl, annotatedUrl, annotations, hasAnnotations }) => {
  if (!selectedImageForAnnotation.value) return;
  
  selectedImageForAnnotation.value.annotatedUrl = annotatedUrl;
  selectedImageForAnnotation.value.annotations = annotations;
  selectedImageForAnnotation.value.hasAnnotations = hasAnnotations;
  
  toast.success(hasAnnotations ? "Anotaciones guardadas en la foto." : "Anotaciones limpiadas.");
  selectedImageForAnnotation.value = null;
};

// --- DESCARGA DIRECTA PDF ---
const downloadDirectPDF = async () => {
  isExportingPDF.value = true;
  try {
    const container = document.getElementById('reporte-devolucion-document');
    if (!container) throw new Error("No se encontró el contenedor del documento para generar el PDF.");

    const pages = container.querySelectorAll('.a4-page');
    if (!pages || pages.length === 0) throw new Error("No se encontraron páginas en el documento.");

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      if (i > 0) pdf.addPage('a4', 'p');

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    const cleanId = (controlFormData.report_id || 'Cirugia').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Reporte_Devolucion_Cx_${cleanId}.pdf`;
    pdf.save(filename);
    toast.success(`PDF ${filename} descargado exitosamente.`);

  } catch (err) {
    console.error("Error al exportar PDF de devolución:", err);
    toast.error("Ocurrió un error al generar el PDF. Podés usar la opción 'Imprimir'.");
  } finally {
    isExportingPDF.value = false;
  }
};

// --- IMPRESIÓN NATIVO ---
const triggerPrint = () => {
  window.print();
};

// --- COMPARTIR POR WHATSAPP AL INSTRUMENTADOR ---
const shareViaWhatsApp = () => {
  const msg = 
    `*DISTRICORR LOGÍSTICA — REPORTE DE DEVOLUCIÓN DE CAJA*\n\n` +
    `📋 *Cirugía:* #${controlFormData.report_id} - ${controlFormData.paciente}\n` +
    `👨‍⚕️ *Médico:* ${controlFormData.medico || '-'}\n` +
    `🏥 *Institución:* ${controlFormData.institucion || '-'}\n` +
    `⚠️ *Estado:* ${controlFormData.estado.toUpperCase()}\n` +
    `📝 *Detalle:* ${controlFormData.observaciones || 'Se verificó la caja con observaciones.'}\n\n` +
    `_Por favor verificar el instrumental faltante/dañado señalado en el reporte fotográfico._`;

  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};

const closeModal = () => {
  visible.value = false;
  emit('closed');
};
</script>
