<!-- src/components/uploader/FileUpload.vue (Exposición de reset/clear y Soporte Modo Oscuro) -->
<template>
  <div 
    class="uploader-container bg-slate-50 dark:bg-slate-950/70 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-6 transition-all"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    :class="{ 'is-dragging bg-blue-50 dark:bg-blue-950/40 border-blue-500': isDragging }"
  >
    <!-- Inputs ocultos -->
    <input type="file" @change="handleFileChange" ref="fileInputMultiple" :accept="acceptedFileTypes" hidden multiple />
    <input type="file" @change="handleFileChange" ref="fileInputCamera" :accept="acceptedFileTypes" capture="environment" hidden />

    <!-- Estado inicial o sin archivos -->
    <div v-if="selectedFiles.length === 0" class="text-center py-3">
      <p class="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
        {{ isDragging ? 'Soltá los archivos aquí' : 'Arrastrá fotos o elegí una opción para adjuntar' }}
      </p>
      <div class="flex flex-col sm:flex-row gap-2 justify-center">
        <button 
          type="button"
          @click="triggerFileInput('multiple')" 
          :disabled="isUploading"
          class="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
        >
          📁 Seleccionar Archivos
        </button>
        <button 
          type="button"
          v-if="enableCamera && isMobile" 
          @click="triggerFileInput('camera')" 
          :disabled="isUploading"
          class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm"
        >
          📷 Abrir Cámara
        </button>
        <button 
          type="button"
          v-if="enableCamera && !isMobile" 
          @click="isWebcamModalOpen = true" 
          :disabled="isUploading"
          class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm"
        >
          📷 Usar Webcam
        </button>
      </div>
    </div>

    <!-- Galería de previsualización -->
    <div v-else class="w-full space-y-3">
      <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
        <h4 class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Archivos listos ({{ selectedFiles.length }}):
        </h4>
        <button 
          type="button"
          @click="triggerFileInput('multiple')" 
          class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center hover:bg-blue-700 transition-all cursor-pointer shadow-sm" 
          :disabled="isUploading"
          title="Añadir más fotos"
        >
          +
        </button>
      </div>
      
      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        <div v-for="(file, index) in selectedFiles" :key="file.uniqueId" class="relative flex-shrink-0 w-24 group">
          <img v-if="file.type.startsWith('image/')" :src="file.previewUrl" class="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" alt="Previsualización" />
          <p class="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate mt-1 text-center" :title="file.name">{{ file.name }}</p>
          <button 
            type="button"
            @click="removeFile(index)" 
            class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm hover:scale-110 transition-transform" 
            :disabled="isUploading" 
            aria-label="Quitar archivo"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Progreso durante la subida -->
    <div v-if="isUploading" class="text-center space-y-1.5 pt-2">
      <p class="text-xs font-bold text-blue-600 dark:text-blue-400">Subiendo {{ uploadProgress.current }} de {{ uploadProgress.total }}...</p>
      <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }"></div>
      </div>
    </div>

    <!-- Modal de Webcam -->
    <WebcamCapture :show="isWebcamModalOpen" @close="isWebcamModalOpen = false" @photo-taken="addFiles" />
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue';
import { supabase } from '../../services/supabase';
import { useB2Upload } from './useB2Upload';
import { useDeviceDetection } from '../../composables/useDeviceDetection';
import { resizeImage } from '../../services/useImageResizer.js';
import WebcamCapture from '../capture/WebcamCapture.vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  area: { type: String, default: 'logistica' },
  ownerId: { type: String, required: true },
  acceptedFileTypes: { type: String, default: 'image/*' },
  enableCamera: { type: Boolean, default: true },
});

const toast = useToast();
const { isMobile } = useDeviceDetection();
const { uploadFile } = useB2Upload();

const fileInputMultiple = ref(null);
const fileInputCamera = ref(null);
const selectedFiles = ref([]);
const isUploading = ref(false);
const uploadProgress = ref({ current: 0, total: 0 });
const isWebcamModalOpen = ref(false);
const isChainShotActive = ref(false);
const isDragging = ref(false);

const hasFiles = computed(() => selectedFiles.value.length > 0);

const addFiles = (files) => {
  const fileList = Array.from(files);
  for (const file of fileList) {
    file.previewUrl = URL.createObjectURL(file);
    file.uniqueId = crypto.randomUUID();
    selectedFiles.value.push(file);
  }
};

const triggerFileInput = (mode) => {
  isChainShotActive.value = (mode === 'camera');
  if (mode === 'multiple') fileInputMultiple.value?.click();
  else if (mode === 'camera') fileInputCamera.value?.click();
};

const handleFileChange = (event) => {
  const newFiles = event.target.files;
  if (newFiles.length > 0) {
    addFiles(newFiles);
    if (isChainShotActive.value) {
      setTimeout(() => triggerFileInput('camera'), 100);
      return;
    }
  } else {
    isChainShotActive.value = false;
  }
  event.target.value = '';
};

const handleDrop = (event) => {
  isDragging.value = false;
  addFiles(event.dataTransfer.files);
};

const removeFile = (index) => {
  const fileToRemove = selectedFiles.value[index];
  if (fileToRemove?.previewUrl) {
    URL.revokeObjectURL(fileToRemove.previewUrl);
  }
  selectedFiles.value.splice(index, 1);
};

const startUpload = async () => {
  if (selectedFiles.value.length === 0) return [];

  isUploading.value = true;
  uploadProgress.value = { current: 0, total: selectedFiles.value.length };
  toast.info(`Iniciando subida de ${selectedFiles.value.length} archivos...`);

  const uploadedFilesData = [];

  for (const originalFile of selectedFiles.value) {
    uploadProgress.value.current++;
    try {
      const baseName = crypto.randomUUID();
      const fileExtension = originalFile.name.split('.').pop() || 'tmp';
      const thumbnailFile = await resizeImage(originalFile);

      const getPresignedUrl = (file, ext, isThumb = false) => {
        return supabase.functions.invoke('b2-presigned-url', {
          body: {
            area: props.area,
            owner: props.ownerId,
            contentType: file.type,
            extension: ext,
            isThumb: isThumb,
            baseName: baseName
          }
        });
      };
      
      const presignedUrlPromises = [];
      presignedUrlPromises.push(getPresignedUrl(originalFile, fileExtension, false));
      if (thumbnailFile) {
        presignedUrlPromises.push(getPresignedUrl(thumbnailFile, 'webp', true));
      }

      const responses = await Promise.all(presignedUrlPromises);
      const originalResponse = responses[0];
      const thumbResponse = responses.length > 1 ? responses[1] : null;

      if (originalResponse.error) throw originalResponse.error;
      if (thumbResponse && thumbResponse.error) throw thumbResponse.error;

      const originalPresigned = originalResponse.data;
      
      const uploadPromises = [];
      uploadPromises.push(uploadFile(originalPresigned.uploadUrl, originalFile));
      if (thumbnailFile && thumbResponse) {
        const thumbPresigned = thumbResponse.data;
        uploadPromises.push(uploadFile(thumbPresigned.uploadUrl, thumbnailFile));
      }

      await Promise.all(uploadPromises);

      uploadedFilesData.push({
        object_key: originalPresigned.objectKey,
        area: props.area,
        content_type: originalFile.type,
        size_bytes: originalFile.size,
        file_name: originalFile.name,
      });

    } catch (error) {
      const errorMessage = error.message || 'Error desconocido durante la subida.';
      toast.error(`Fallo crítico en la subida de ${originalFile.name}: ${errorMessage}`);
      console.error(`[FileUpload] Error detallado para ${originalFile.name}:`, error);
      isUploading.value = false;
      throw new Error(`Fallo en la subida del archivo: ${errorMessage}`);
    }
  }

  toast.success('Todos los archivos se subieron correctamente.');
  isUploading.value = false;
  return uploadedFilesData;
};

// Función de limpieza expuesta tanto como reset() y clear() para compatibilidad completa
const reset = () => {
  selectedFiles.value.forEach(file => {
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
  });
  selectedFiles.value = [];
};

const clear = reset;

onUnmounted(reset);

defineExpose({
  startUpload,
  reset,
  clear,
  hasFiles,
  selectedFiles
});
</script>