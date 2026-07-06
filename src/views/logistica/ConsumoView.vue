<!-- src/views/logistica/ConsumoView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950/10 min-h-screen flex items-center justify-center">
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl space-y-6">
      
      <header class="text-center">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Control de Consumo y Devolución</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Registrá el estado de la caja de cirugía y subí evidencias de devolución.</p>
      </header>

      <!-- Tabs de Navegación -->
      <div class="flex border-b border-slate-100 dark:border-slate-800/80">
        <button 
          @click="activeTab = 'form'" 
          :class="[
            'flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all cursor-pointer',
            activeTab === 'form' 
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350'
          ]"
        >
          Registrar Control
        </button>
        <button 
          @click="activeTab = 'history'" 
          :class="[
            'flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all cursor-pointer',
            activeTab === 'history' 
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350'
          ]"
        >
          Historial Reciente
        </button>
      </div>

      <!-- Tab 1: Formulario de Registro -->
      <div v-if="activeTab === 'form'" class="space-y-6">
        <!-- Paso 1: Selector de Cirugía -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seleccionar Cirugía</label>
          <SurgerySelector @surgery-selected="handleSurgerySelection" ref="surgerySelectorRef" />
        </div>

        <!-- Alerta de Reporte Existente -->
        <Transition name="fade">
          <div v-if="existingControlWarning" class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 rounded-xl flex items-start gap-2.5">
            <span class="text-amber-650 dark:text-amber-400 text-sm">⚠️</span>
            <p class="text-xs text-amber-700 dark:text-amber-300 leading-normal">
              <span class="font-bold">Atención:</span> Ya existe un control registrado para esta cirugía el {{ existingControlWarning }}.
            </p>
          </div>
        </Transition>

        <!-- Resumen de la cirugía seleccionada -->
        <Transition name="fade">
          <div v-if="form.selectedSurgery" class="p-4 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
            <p class="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Cirugía Seleccionada: <span class="font-normal text-slate-700 dark:text-slate-350 ml-1">{{ form.selectedSurgery.display_text }}</span>
            </p>
          </div>
        </Transition>

        <!-- Paso 2: Campos de Control (responsivos) -->
        <div class="grid grid-cols-1 gap-5">
          <div class="space-y-1.5">
            <label for="fecha-control" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha de Control</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
              <input type="date" id="fecha-control" v-model="form.fecha" class="form-input-premium" />
            </div>
          </div>
          
          <!-- Botones Interactivos para Estado General -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado General de la Caja</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                type="button"
                @click="form.estado = 'ok'"
                :class="[
                  'flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-150 text-left cursor-pointer focus:outline-none',
                  form.estado === 'ok' 
                    ? 'bg-emerald-50/60 border-emerald-500 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-500 dark:text-emerald-300 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                ]"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-bold">Todo OK</span>
                  <span class="text-[10px] opacity-80 mt-0.5">Caja devuelta completa</span>
                </div>
                <span class="text-xl">✅</span>
              </button>

              <button 
                type="button"
                @click="form.estado = 'revision'"
                :class="[
                  'flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-150 text-left cursor-pointer focus:outline-none',
                  form.estado === 'revision' 
                    ? 'bg-amber-50/60 border-amber-500 text-amber-900 dark:bg-amber-950/20 dark:border-amber-500 dark:text-amber-300 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                ]"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-bold">Revisión</span>
                  <span class="text-[10px] opacity-80 mt-0.5">Falta lavar o contar</span>
                </div>
                <span class="text-xl">⚠️</span>
              </button>

              <button 
                type="button"
                @click="form.estado = 'problemas'"
                :class="[
                  'flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-150 text-left cursor-pointer focus:outline-none',
                  form.estado === 'problemas' 
                    ? 'bg-red-50/60 border-red-500 text-red-900 dark:bg-red-950/20 dark:border-red-500 dark:text-red-300 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                ]"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-bold">Problemas</span>
                  <span class="text-[10px] opacity-80 mt-0.5">Faltantes graves o rotura</span>
                </div>
                <span class="text-xl">❌</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Paso 3: Observaciones / Consumo -->
        <div class="space-y-1.5">
          <label for="observaciones" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Observaciones / Consumo Detallado 
            <span class="text-slate-400 dark:text-slate-500 font-normal normal-case ml-1">(Opcional)</span>
          </label>
          <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
            <textarea 
              id="observaciones"
              v-model="form.observaciones"
              placeholder="Ej: Se utilizó 1 tornillo de 4.5mm. Caja devuelta completa..."
              rows="2"
              class="form-input-textarea"
            ></textarea>
          </div>
        </div>

        <!-- Paso 4: Carga de Múltiples Fotos -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Adjuntar Evidencia (Fotos)</label>
          <FileUpload 
            ref="fileUploaderRef"
            :owner-id="form.selectedSurgery ? String(form.selectedSurgery.id) : 'temp'"
          />
        </div>
        
        <!-- Paso 5: Botón de Guardar -->
        <div class="pt-2">
          <button 
            @click="saveControl" 
            :disabled="!isFormValid || isSaving"
            class="btn-primary-styled w-full"
          >
            {{ isSaving ? 'Guardando...' : 'Guardar Control' }}
          </button>
        </div>
      </div>

      <!-- Tab 2: Historial Reciente -->
      <div v-else-if="activeTab === 'history'" class="space-y-4">
        <div v-if="isHistoryLoading" class="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <svg class="animate-spin h-8 w-8 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs font-semibold uppercase tracking-wider">Cargando historial...</span>
        </div>

        <div v-else-if="historyError" class="p-4 bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200/50 dark:border-red-900/30 text-center">
          {{ historyError }}
        </div>

        <div v-else-if="recentControls.length === 0" class="text-center py-12 text-slate-400 dark:text-slate-500 text-sm font-medium">
          No se registraron controles de consumo recientemente.
        </div>

        <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div 
            v-for="control in recentControls" 
            :key="control.id" 
            class="p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3"
          >
            <!-- Cabecera del control -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {{ control.reportes?.paciente || 'Paciente no especificado' }}
                </h3>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Médico: {{ control.reportes?.medico || 'N/A' }} | ID: {{ control.reportes?.id_cirugia || 'N/A' }}
                </p>
              </div>
              <span :class="['px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase border inline-flex items-center gap-1 shrink-0 self-start sm:self-center', getEstadoBadgeClass(control.estado)]">
                {{ control.estado }}
              </span>
            </div>

            <!-- Tiempos -->
            <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/20 p-2 rounded-lg">
              <div>
                <span class="font-bold">Fecha Cirugía:</span> {{ control.reportes?.fecha_cirugia ? formatDate(control.reportes.fecha_cirugia) : 'N/A' }}
              </div>
              <div>
                <span class="font-bold">Fecha Control:</span> {{ formatDate(control.fecha_retiro) }}
              </div>
            </div>

            <!-- Notas -->
            <div v-if="control.observaciones" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l-2 border-slate-350 dark:border-slate-700 pl-2">
              {{ control.observaciones }}
            </div>

            <!-- Evidencias -->
            <div v-if="control.photos && control.photos.length > 0" class="space-y-1">
              <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Fotos Cargadas ({{ control.photos.length }}):</span>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="(photo, photoIdx) in control.photos" 
                  :key="photo.id" 
                  @click="openLightbox(control.photos, photoIdx)"
                  class="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <img :src="photo.url" :alt="photo.file_name" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox de Vista Previa para Historial -->
    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="lightboxImages"
      :index="activeLightboxIndex"
      @hide="isLightboxOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';
import { useToasts } from '../../composables/useToasts';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

import SurgerySelector from '../../components/shared/SurgerySelector.vue';
import FileUpload from '../../components/uploader/FileUpload.vue';

const { showSuccessToast, showErrorToast } = useToasts();

const activeTab = ref('form');
const recentControls = ref([]);
const isHistoryLoading = ref(false);
const historyError = ref(null);

const isLightboxOpen = ref(false);
const lightboxImages = ref([]);
const activeLightboxIndex = ref(0);

const form = reactive({
  selectedSurgery: null,
  fecha: '',
  estado: '',
  observaciones: '',
});

const isSaving = ref(false);
const existingControlWarning = ref(null);

const surgerySelectorRef = ref(null);
const fileUploaderRef = ref(null);

onMounted(() => {
  form.fecha = format(new Date(), 'yyyy-MM-dd');
  fetchHistory();
});

// Observaciones es opcional.
const isFormValid = computed(() => {
  return form.selectedSurgery && form.fecha && form.estado;
});

const handleSurgerySelection = async (surgery) => {
  form.selectedSurgery = surgery;
  existingControlWarning.value = null;
  try {
    const { data, error } = await supabase
      .from('logistica_controles')
      .select('fecha_retiro')
      .eq('cirugia_id', surgery.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      existingControlWarning.value = new Date(data.fecha_retiro).toLocaleDateString('es-ES');
    }
  } catch (err) {
    showErrorToast(err, "Error al verificar controles existentes.");
  }
};

const fetchHistory = async () => {
  isHistoryLoading.value = true;
  historyError.value = null;
  try {
    const { data, error } = await supabase
      .from('logistica_controles_con_evidencias')
      .select('*, reportes:cirugia_id(paciente, medico, id_cirugia, fecha_cirugia)')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    recentControls.value = (data || []).map(control => {
      const processedPhotos = (control.photos || []).map(photo => ({
        ...photo,
        url: `${import.meta.env.VITE_R2_PUBLIC_URL}/${photo.object_key}`,
        caption: photo.file_name
      }));
      return { ...control, photos: processedPhotos };
    });
  } catch (err) {
    console.error("Error al cargar historial:", err);
    historyError.value = "No se pudo cargar el historial de controles.";
  } finally {
    isHistoryLoading.value = false;
  }
};

const saveControl = async () => {
  if (!isFormValid.value) {
    showErrorToast('Por favor, complete todos los campos requeridos.');
    return;
  }

  isSaving.value = true;

  try {
    // PASO 1: Orquestar la subida de archivos a R2.
    const uploadedEvidences = await fileUploaderRef.value.startUpload();

    // PASO 2: Preparar los parámetros para la RPC.
    const params = {
      p_cirugia_id: form.selectedSurgery.id,
      p_fecha_retiro: form.fecha,
      p_estado: form.estado,
      p_observaciones: form.observaciones ? form.observaciones.trim() : '',
      p_evidences: uploadedEvidences.map(ev => ({
        object_key: ev.object_key,
        file_name: ev.file_name,
        content_type: ev.content_type,
        size_bytes: ev.size_bytes,
      })),
    };

    // PASO 3: Ejecutar la transacción en la BD vía RPC.
    const { error } = await supabase.rpc('create_logistica_control_with_evidences', params);
    if (error) throw error;

    showSuccessToast('¡Control de consumo guardado con éxito!');
    resetForm();
    await fetchHistory(); // Actualizar el historial después de guardar con éxito

  } catch (error) {
    console.error("Error al guardar el control:", error);
    showErrorToast(error, 'Error al guardar el control de consumo.');
  } finally {
    isSaving.value = false;
  }
};

const resetForm = () => {
  form.selectedSurgery = null;
  form.estado = '';
  form.observaciones = '';
  form.fecha = format(new Date(), 'yyyy-MM-dd');
  existingControlWarning.value = null;
  
  if (surgerySelectorRef.value) {
    surgerySelectorRef.value.clear();
  }
  if (fileUploaderRef.value) {
    fileUploaderRef.value.reset(); // Llama a la función reset expuesta por FileUpload.vue
  }
};

// Helpers de presentación para el historial
const getEstadoBadgeClass = (estado) => {
  if (estado === 'ok') {
    return 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/35';
  }
  if (estado === 'revision') {
    return 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/35';
  }
  return 'bg-red-50/80 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-900/35';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const openLightbox = (photos, index = 0) => {
  lightboxImages.value = photos.map(p => p.url);
  activeLightboxIndex.value = index;
  isLightboxOpen.value = true;
};
</script>

<style scoped>
.form-input-premium {
  @apply w-full px-4 py-3 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-0;
}

.form-input-textarea {
  @apply w-full p-4 bg-transparent border-none text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-0 resize-none;
}

.btn-primary-styled {
  @apply bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-sm transition-all duration-150;
  @apply hover:bg-indigo-700 hover:shadow-md disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed;
  @apply active:scale-95 cursor-pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>