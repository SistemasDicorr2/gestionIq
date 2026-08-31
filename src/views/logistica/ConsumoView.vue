<!-- src/views/logistica/ConsumoView.vue -->
<template>
  <div class="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-2.5 sm:p-4 lg:p-6 pb-20">
    <div class="max-w-xl mx-auto space-y-4">
      
      <!-- Encabezado Mobile-First -->
      <header class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-2xs flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-brand-navy/10 dark:bg-brand-cyan/15 text-brand-navy dark:text-brand-cyan flex items-center justify-center shrink-0">
            <ClipboardCheckIcon class="w-5.5 h-5.5" />
          </div>
          <div class="min-w-0">
            <h1 class="text-base font-black text-brand-navy dark:text-white tracking-tight truncate">
              Control de Consumo
            </h1>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Registro de estado de cajas y devoluciones
            </p>
          </div>
        </div>

        <!-- Tag de Rol / Estado -->
        <span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-brand-cyan/10 text-brand-cyan dark:bg-brand-cyan/20 dark:text-brand-cyan-light rounded-full shrink-0 border border-brand-cyan/20">
          Logística
        </span>
      </header>

      <!-- Selector de Pestañas (Segmented Control Táctil) -->
      <div class="bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl flex gap-1 select-none">
        <button 
          @click="activeTab = 'form'" 
          :class="[
            'flex-1 py-2.5 px-3 text-xs font-black rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'form' 
              ? 'bg-brand-navy text-white dark:bg-brand-cyan dark:text-white shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <SparklesIcon class="w-3.5 h-3.5" />
          <span>Registrar Control</span>
        </button>

        <button 
          @click="activeTab = 'history'" 
          :class="[
            'flex-1 py-2.5 px-3 text-xs font-black rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'history' 
              ? 'bg-brand-navy text-white dark:bg-brand-cyan dark:text-white shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <HistoryIcon class="w-3.5 h-3.5" />
          <span>Historial Reciente</span>
        </button>
      </div>

      <!-- TAB 1: FORMULARIO DE REGISTRO -->
      <div v-if="activeTab === 'form'" class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
        
        <!-- Paso 1: Selector de Cirugía -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            1. Seleccionar Cirugía *
          </label>
          <SurgerySelector @surgery-selected="handleSurgerySelection" ref="surgerySelectorRef" />
        </div>

        <!-- Alerta si ya existe un reporte registrado -->
        <Transition name="fade">
          <div v-if="existingControlWarning" class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5">
            <AlertTriangleIcon class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p class="text-xs text-amber-800 dark:text-amber-300 leading-normal">
              <span class="font-bold">Atención:</span> Ya existe un control para esta cirugía el {{ existingControlWarning }}.
            </p>
          </div>
        </Transition>

        <!-- Resumen de Cirugía Seleccionada -->
        <Transition name="fade">
          <div v-if="form.selectedSurgery" class="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
            <p class="text-xs font-extrabold text-brand-navy dark:text-brand-cyan-light flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-brand-cyan"></span>
              Cirugía Seleccionada:
            </p>
            <p class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {{ form.selectedSurgery.display_text }}
            </p>
          </div>
        </Transition>

        <!-- Paso 2: Fecha de Control -->
        <div class="space-y-1.5">
          <label for="fecha-control" class="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            2. Fecha del Registro *
          </label>
          <input 
            type="date" 
            id="fecha-control" 
            v-model="form.fecha" 
            class="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all min-h-[46px]"
          />
        </div>

        <!-- Paso 3: Estado General (Botones Grandes Táctiles) -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            3. Estado General de la Caja *
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            <!-- Opción OK -->
            <button 
              type="button"
              @click="form.estado = 'ok'"
              :class="[
                'p-3.5 rounded-xl border-2 transition-all duration-150 flex items-center sm:flex-col justify-between sm:justify-center text-left sm:text-center gap-2 cursor-pointer min-h-[52px]',
                form.estado === 'ok' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs' 
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <div class="flex items-center gap-2 sm:flex-col">
                <CheckCircle2Icon :class="['w-5 h-5 shrink-0', form.estado === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400']" />
                <div>
                  <span class="text-xs font-black block">Todo OK</span>
                  <span class="text-[10px] opacity-75 font-normal block">Caja completa</span>
                </div>
              </div>
            </button>

            <!-- Opción Revisión -->
            <button 
              type="button"
              @click="form.estado = 'revision'"
              :class="[
                'p-3.5 rounded-xl border-2 transition-all duration-150 flex items-center sm:flex-col justify-between sm:justify-center text-left sm:text-center gap-2 cursor-pointer min-h-[52px]',
                form.estado === 'revision' 
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs' 
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <div class="flex items-center gap-2 sm:flex-col">
                <AlertTriangleIcon :class="['w-5 h-5 shrink-0', form.estado === 'revision' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400']" />
                <div>
                  <span class="text-xs font-black block">Revisión</span>
                  <span class="text-[10px] opacity-75 font-normal block">Falta lavar/contar</span>
                </div>
              </div>
            </button>

            <!-- Opción Problemas -->
            <button 
              type="button"
              @click="form.estado = 'problemas'"
              :class="[
                'p-3.5 rounded-xl border-2 transition-all duration-150 flex items-center sm:flex-col justify-between sm:justify-center text-left sm:text-center gap-2 cursor-pointer min-h-[52px]',
                form.estado === 'problemas' 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 shadow-xs' 
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              ]"
            >
              <div class="flex items-center gap-2 sm:flex-col">
                <XCircleIcon :class="['w-5 h-5 shrink-0', form.estado === 'problemas' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400']" />
                <div>
                  <span class="text-xs font-black block">Problemas</span>
                  <span class="text-[10px] opacity-75 font-normal block">Faltantes o daños</span>
                </div>
              </div>
            </button>

          </div>
        </div>

        <!-- Paso 4: Observaciones con Chips de 1-Tap -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="observaciones" class="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              4. Observaciones / Consumo
            </label>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Opcional</span>
          </div>

          <!-- Chips de Respuesta Rápida (1-Tap sin escribir) -->
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Toque rápido para agregar:
            </span>
            <div class="flex flex-wrap gap-1.5">
              <button 
                v-for="chip in quickChips" 
                :key="chip"
                type="button"
                @click="addChipToObservations(chip)"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-navy hover:text-white dark:hover:bg-brand-cyan dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700 active:scale-95 select-none"
              >
                {{ chip }}
              </button>
            </div>
          </div>

          <textarea 
            id="observaciones"
            v-model="form.observaciones"
            placeholder="Ej: Se utilizó 1 tornillo de 4.5mm. Caja devuelta completa..."
            rows="3"
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all resize-none"
          ></textarea>
        </div>

        <!-- Paso 5: Evidencias Fotográficas -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            5. Adjuntar Fotos de Evidencia
          </label>
          <FileUpload 
            ref="fileUploaderRef"
            :owner-id="form.selectedSurgery ? String(form.selectedSurgery.id) : 'temp'"
          />
        </div>
        
        <!-- Paso 6: Botón de Guardado Prominente -->
        <div class="pt-2">
          <button 
            @click="saveControl" 
            :disabled="!isFormValid || isSaving"
            class="w-full py-3.5 px-4 bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-cyan text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
          >
            <CheckCircle2Icon class="w-4 h-4" />
            <span>{{ isSaving ? 'Guardando Control...' : 'Guardar Control de Consumo' }}</span>
          </button>
        </div>

      </div>

      <!-- TAB 2: HISTORIAL RECIENTE CON BUSCADOR Y WHATSAPP -->
      <div v-else-if="activeTab === 'history'" class="space-y-3">
        
        <!-- Buscador y Filtros -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl shadow-2xs space-y-2">
          <!-- Input de búsqueda -->
          <div class="relative">
            <SearchIcon class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              v-model="historySearchQuery"
              placeholder="Buscar por paciente, médico o ID..."
              class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
            />
          </div>

          <!-- Filtro por estado -->
          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 select-none">
            <button 
              v-for="filter in statusFilterOptions" 
              :key="filter.value"
              @click="historyStatusFilter = filter.value"
              :class="[
                'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer',
                historyStatusFilter === filter.value 
                  ? 'bg-brand-navy text-white dark:bg-brand-cyan dark:text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Estado Carga -->
        <div v-if="isHistoryLoading" class="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <RefreshCwIcon class="w-7 h-7 text-brand-cyan animate-spin mb-2" />
          <span class="text-xs font-bold uppercase tracking-wider">Cargando controles...</span>
        </div>

        <!-- Estado Error -->
        <div v-else-if="historyError" class="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-2xl border border-rose-200 dark:border-rose-900/40 text-center">
          {{ historyError }}
        </div>

        <!-- Estado Vacío -->
        <div v-else-if="filteredControls.length === 0" class="text-center py-10 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400">No se encontraron controles registrados.</p>
        </div>

        <!-- Lista de Tarjetas del Historial -->
        <div v-else class="space-y-3">
          <div 
            v-for="control in filteredControls" 
            :key="control.id" 
            class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
          >
            <!-- Cabecera de la Tarjeta -->
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  {{ control.reportes?.paciente || 'Paciente no especificado' }}
                </h3>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Dr. {{ control.reportes?.medico || 'N/A' }} • ID: {{ control.reportes?.id_cirugia || 'N/A' }}
                </p>
              </div>

              <!-- Badge de Estado -->
              <span :class="['px-2.5 py-1 text-[10px] font-black rounded-full uppercase border shrink-0', getEstadoBadgeClass(control.estado)]">
                {{ formatEstadoText(control.estado) }}
              </span>
            </div>

            <!-- Fechas -->
            <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
              <div>
                <span class="font-bold text-slate-400 dark:text-slate-500 block uppercase text-[9px]">Fecha Cirugía</span>
                <span class="font-mono font-extrabold">{{ control.reportes?.fecha_cirugia ? formatDate(control.reportes.fecha_cirugia) : 'N/A' }}</span>
              </div>
              <div>
                <span class="font-bold text-slate-400 dark:text-slate-500 block uppercase text-[9px]">Fecha Control</span>
                <span class="font-mono font-extrabold text-brand-navy dark:text-brand-cyan-light">{{ formatDate(control.fecha_retiro) }}</span>
              </div>
            </div>

            <!-- Observaciones -->
            <div v-if="control.observaciones" class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/30 p-2.5 rounded-xl border-l-3 border-brand-cyan">
              {{ control.observaciones }}
            </div>

            <!-- Previsualización de Fotos Evidencias -->
            <div v-if="control.photos && control.photos.length > 0" class="space-y-1.5">
              <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Evidencias ({{ control.photos.length }}):
              </span>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="(photo, photoIdx) in control.photos" 
                  :key="photo.id" 
                  @click="openLightbox(control.photos, photoIdx)"
                  class="w-13 h-13 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <img :src="photo.url" :alt="photo.file_name" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <!-- Botón WhatsApp 1-Tap -->
            <div class="pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                @click="shareViaWhatsApp(control)"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Share2Icon class="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- Lightbox de Vista Previa -->
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

// Lucide Icons
import {
  ClipboardCheck as ClipboardCheckIcon,
  Sparkles as SparklesIcon,
  History as HistoryIcon,
  CheckCircle2 as CheckCircle2Icon,
  AlertTriangle as AlertTriangleIcon,
  XCircle as XCircleIcon,
  Search as SearchIcon,
  Share2 as Share2Icon,
  RefreshCw as RefreshCwIcon
} from 'lucide-vue-next';

import SurgerySelector from '../../components/shared/SurgerySelector.vue';
import FileUpload from '../../components/uploader/FileUpload.vue';

const { showSuccessToast, showErrorToast } = useToasts();

const activeTab = ref('form');
const recentControls = ref([]);
const isHistoryLoading = ref(false);
const historyError = ref(null);

const historySearchQuery = ref('');
const historyStatusFilter = ref('all');

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

// Chips de Respuesta Rápida de 1-Tap
const quickChips = [
  '✓ Caja Completa',
  '🧼 Falta Lavado',
  '🔩 Tornillos Consumidos',
  '⚠️ Faltante Instrumental',
  '🔒 Precinto Roto'
];

const statusFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'OK', value: 'ok' },
  { label: 'Revisión', value: 'revision' },
  { label: 'Problemas', value: 'problemas' },
];

onMounted(() => {
  form.fecha = format(new Date(), 'yyyy-MM-dd');
  fetchHistory();
});

const addChipToObservations = (chipText) => {
  if (!form.observaciones) {
    form.observaciones = chipText;
  } else if (!form.observaciones.includes(chipText)) {
    form.observaciones += ` | ${chipText}`;
  }
};

const isFormValid = computed(() => {
  return form.selectedSurgery && form.fecha && form.estado;
});

const filteredControls = computed(() => {
  return recentControls.value.filter(control => {
    const query = historySearchQuery.value.toLowerCase().trim();
    const matchesQuery = !query || 
      (control.reportes?.paciente || '').toLowerCase().includes(query) ||
      (control.reportes?.medico || '').toLowerCase().includes(query) ||
      (control.reportes?.id_cirugia || '').toLowerCase().includes(query);

    const matchesStatus = historyStatusFilter.value === 'all' || control.estado === historyStatusFilter.value;

    return matchesQuery && matchesStatus;
  });
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
      .maybeSingle();
    if (error) throw error;
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
      .limit(30);
    
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
    showErrorToast('Por favor, complete los campos obligatorios.');
    return;
  }

  isSaving.value = true;

  try {
    const uploadedEvidences = await fileUploaderRef.value.startUpload();

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

    const { error } = await supabase.rpc('create_logistica_control_with_evidences', params);
    if (error) throw error;

    showSuccessToast('¡Control de consumo registrado con éxito!');
    resetForm();
    await fetchHistory();

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
    fileUploaderRef.value.reset();
  }
};

const shareViaWhatsApp = (control) => {
  const paciente = control.reportes?.paciente || 'Paciente no especificado';
  const medico = control.reportes?.medico || 'N/A';
  const idCirugia = control.reportes?.id_cirugia || 'N/A';
  const fechaCtrl = formatDate(control.fecha_retiro);
  const estadoText = control.estado === 'ok' ? '✅ Todo OK' : control.estado === 'revision' ? '⚠️ En Revisión' : '❌ Con Problemas';
  const obs = control.observaciones ? `\n📝 *Obs:* ${control.observaciones}` : '';
  
  const message = `📋 *CONTROL DE CONSUMO - GESTIÓN IQ*\n\n` +
    `👤 *Paciente:* ${paciente}\n` +
    `👨‍⚕️ *Médico:* ${medico}\n` +
    `🆔 *ID Cirugía:* ${idCirugia}\n` +
    `📅 *Fecha Control:* ${fechaCtrl}\n` +
    `📌 *Estado:* ${estadoText}${obs}\n\n` +
    `_Districorr · Logística_`;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
};

const formatEstadoText = (estado) => {
  if (estado === 'ok') return 'Todo OK';
  if (estado === 'revision') return 'Revisión';
  return 'Problemas';
};

const getEstadoBadgeClass = (estado) => {
  if (estado === 'ok') {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
  }
  if (estado === 'revision') {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50';
  }
  return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50';
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>