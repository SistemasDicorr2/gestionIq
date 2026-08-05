<!-- src/components/report-details/PhotosGallery.vue (Diseño Compacto Minimalist-UI) -->
<template>
  <div class="w-full">
    <!-- Encabezado de la Galería -->
    <div v-if="!compact" class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{{ title }}</h3>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {{ photos.length }} fotos
        </span>
      </div>
      <PhotoUploader v-if="showUploader" @photos-uploaded="handlePhotosUploaded" />
    </div>

    <!-- Mensaje de carga -->
    <div v-if="isLoading" class="py-8 text-center text-xs text-slate-400">Cargando fotos...</div>
    
    <!-- Grilla de fotos -->
    <div v-else-if="photos.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <PhotoCard
        v-for="(photo, index) in photos"
        :key="photo.id"
        :photo="photo"
        @view="openLightbox(index)"
        @delete="requestDeletePhoto"
      />
    </div>
    
    <!-- Mensaje si no hay fotos (Compacto con Borde Discreto) -->
    <div v-else class="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500 text-xs">
      <p class="font-medium">No hay fotos registradas en esta galería todavía.</p>
      <PhotoUploader v-if="showUploader" @photos-uploaded="handlePhotosUploaded" class="mt-3" />
    </div>

    <!-- Visor de Fotos Interactivo (Lightbox) -->
    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="lightboxImages"
      :index="activePhotoIndex"
      @hide="closeLightbox"
    />

    <!-- Modal de confirmación de eliminación -->
    <Transition name="modal-fade">
      <div v-if="photoPendingDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs" @click.self="cancelDeletePhoto">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4" role="dialog">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center font-bold text-lg">⚠️</span>
            <div>
              <h4 class="text-sm font-extrabold text-slate-900 dark:text-white">Eliminar evidencia</h4>
              <p class="text-xs text-slate-500">Se eliminará {{ photoPendingDelete.caption }}.</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" @click="cancelDeletePhoto">
              Cancelar
            </button>
            <button
              type="button"
              class="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
              :disabled="deleteCountdown > 0"
              @click="confirmDeletePhoto"
            >
              {{ deleteCountdown > 0 ? `Eliminar (${deleteCountdown}s)` : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import PhotoCard from './PhotoCard.vue';
import PhotoUploader from './PhotoUploader.vue';

import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

const props = defineProps({
  reportId: { type: [String, Number], required: true },
  area: { type: String, required: true },
  logisticaControlId: { type: [String, Number], default: null },
  showUploader: { type: Boolean, default: true },
  title: { type: String, default: '' },
  compact: { type: Boolean, default: false },
});

const { showSuccessToast, showErrorToast } = useToasts();
const isLoading = ref(true);
const photos = ref([]); 
const isLightboxOpen = ref(false);
const activePhotoIndex = ref(0);
const photoPendingDelete = ref(null);
const deleteCountdown = ref(0);
let deleteTimer = null;
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const lightboxImages = computed(() => photos.value.map(p => p.url));

const fetchPhotos = async () => {
  isLoading.value = true;
  try {
    let query = supabase
      .from('reporte_evidencias')
      .select('id, object_key, file_name, created_at, content_type')
      .eq('reporte_id', props.reportId)
      .eq('area', props.area)
      .like('content_type', 'image/%');

    if (props.logisticaControlId) {
      query = query.eq('logistica_control_id', props.logisticaControlId);
    }

    const { data, error } = await query;
    if (error) throw error;

    photos.value = data.map(file => ({
      id: file.id,
      url: `${R2_PUBLIC_URL}/${file.object_key}`, 
      caption: file.file_name || 'Evidencia', 
      date: new Date(file.created_at).toLocaleDateString('es-ES'),
    }));
  } catch (error) {
    console.error(`Error al cargar las fotos del área ${props.area}:`, error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPhotos);
onUnmounted(() => {
  clearDeleteTimer();
});

const openLightbox = (index) => {
  activePhotoIndex.value = index;
  isLightboxOpen.value = true;
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
};

const handlePhotosUploaded = (newPhotos) => {
  console.log(`Nuevas fotos recibidas para el área ${props.area}:`, newPhotos);
};

const clearDeleteTimer = () => {
  if (deleteTimer) {
    clearInterval(deleteTimer);
    deleteTimer = null;
  }
};

const requestDeletePhoto = (photoId) => {
  const selectedPhoto = photos.value.find(p => p.id === photoId);
  if (!selectedPhoto) return;

  clearDeleteTimer();
  photoPendingDelete.value = selectedPhoto;
  deleteCountdown.value = 2;

  deleteTimer = setInterval(() => {
    if (deleteCountdown.value <= 1) {
      deleteCountdown.value = 0;
      clearDeleteTimer();
      return;
    }
    deleteCountdown.value -= 1;
  }, 1000);
};

const cancelDeletePhoto = () => {
  clearDeleteTimer();
  photoPendingDelete.value = null;
  deleteCountdown.value = 0;
};

const confirmDeletePhoto = () => {
  if (!photoPendingDelete.value || deleteCountdown.value > 0) return;
  handleDeletePhoto(photoPendingDelete.value.id);
  cancelDeletePhoto();
};

const handleDeletePhoto = async (photoId) => {
  try {
    const { error } = await supabase
      .from('reporte_evidencias')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    photos.value = photos.value.filter(p => p.id !== photoId);
    showSuccessToast('Evidencia eliminada correctamente.');
  } catch (error) {
    showErrorToast(error, 'Error al eliminar la evidencia.');
  }
};
</script>
