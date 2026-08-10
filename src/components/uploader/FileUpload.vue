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
        {{ isDragging ? 'Soltá los archivos aquí' : 'Arrastrá fotos/PDF o elegí una opción para adjuntar' }}
      </p>
      <div class="flex flex-col sm:flex-row gap-2 justify-center">
        <button 
          type="button"
          @click="triggerFileInput('multiple')" 
          :disabled="isUploading"
          class="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
        >
          📁 Seleccionar Archivos / Galería
        </button>
        <button 
          type="button"
          v-if="enableCamera" 
          @click="isWebcamModalOpen = true" 
          :disabled="isUploading"
          class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
        >
          📷 Tomar Fotos (Cámara Multi-Foto)
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
          title="Añadir más fotos/archivos"
        >
          +
        </button>
      </div>
      
      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        <div v-for="(file, index) in selectedFiles" :key="file.uniqueId" class="relative flex-shrink-0 w-24 group">
          <!-- Vista previa multimedia -->
          <img v-if="file.type.startsWith('image/')" :src="file.previewUrl" class="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" alt="Previsualización" />
          <div v-else-if="file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')" class="w-24 h-24 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-sm flex flex-col items-center justify-center p-2 text-rose-600 dark:text-rose-400">
            <svg class="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span class="text-[10px] font-extrabold uppercase tracking-wider">PDF</span>
          </div>
          <div v-else class="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center p-2 text-slate-500 dark:text-slate-400">
            <svg class="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5-3h7.5M12 3v4.5" />
            </svg>
            <span class="text-[10px] font-extrabold uppercase tracking-wider">Archivo</span>
          </div>

          <!-- Overlay animado durante la subida -->
          <div v-if="file.status === 'uploading'" class="absolute inset-0 bg-slate-900/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-white p-1 transition-all">
            <svg class="animate-spin h-6 w-6 text-blue-400 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-[10px] font-black text-blue-200 animate-pulse">{{ file.progress || 0 }}%</span>
          </div>

          <!-- Overlay éxito completado -->
          <div v-else-if="file.status === 'completed'" class="absolute inset-0 bg-emerald-950/70 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center text-emerald-400 p-1 transition-all">
            <div class="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md mb-0.5 animate-bounce">
              ✓
            </div>
            <span class="text-[9px] font-black uppercase text-emerald-200 tracking-wider">Subido</span>
          </div>

          <!-- Overlay error -->
          <div v-else-if="file.status === 'error'" class="absolute inset-0 bg-rose-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center text-rose-300 p-1 transition-all">
            <div class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md mb-0.5">
              !
            </div>
            <span class="text-[9px] font-bold text-rose-200 text-center leading-tight">Falló</span>
          </div>

          <p class="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate mt-1 text-center" :title="file.name">{{ file.name }}</p>
          <button 
            type="button"
            v-if="!isUploading"
            @click="removeFile(index)" 
            class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm hover:scale-110 transition-transform" 
            aria-label="Quitar archivo"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Progreso durante la subida -->
    <div v-if="isUploading" class="text-center space-y-2 pt-2">
      <div class="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
        <span class="flex items-center gap-1.5">
          <svg class="animate-spin h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Subiendo archivos ({{ uploadProgress.current }} de {{ uploadProgress.total }})...
        </span>
        <span class="font-mono text-[11px]">{{ Math.round((uploadProgress.current / uploadProgress.total) * 100) }}%</span>
      </div>
      <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-500 h-2.5 rounded-full transition-all duration-300 shadow-sm" :style="{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }"></div>
      </div>
    </div>

    <!-- Botón de reintento si existe algún fallo y terminó la subida -->
    <div v-if="hasUploadError && !isUploading" class="text-center pt-2">
      <button 
        type="button" 
        @click="startUpload" 
        class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
      >
        🔄 Reintentar subida de archivos fallidos
      </button>
    </div>

    <!-- Modal de Cámara Multi-foto -->
    <WebcamCapture 
      :show="isWebcamModalOpen" 
      @close="isWebcamModalOpen = false" 
      @photo-taken="(file) => addFiles([file])"
      @photos-confirmed="isWebcamModalOpen = false"
    />
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
  acceptedFileTypes: { type: String, default: 'image/*,application/pdf,.pdf' },
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
const hasUploadError = computed(() => selectedFiles.value.some(f => f.status === 'error'));

const addFiles = (files) => {
  const fileList = Array.from(files);
  for (const file of fileList) {
    file.previewUrl = URL.createObjectURL(file);
    file.uniqueId = crypto.randomUUID();
    file.status = 'idle';
    file.progress = 0;
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

  const uploadedFilesData = [];

  for (const originalFile of selectedFiles.value) {
    // Reutilizar archivos ya subidos exitosamente en reintentos previos
    if (originalFile.status === 'completed' && originalFile.uploadedData) {
      uploadedFilesData.push(originalFile.uploadedData);
      uploadProgress.value.current++;
      continue;
    }

    originalFile.status = 'uploading';
    originalFile.progress = 0;
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
      uploadPromises.push(uploadFile(originalPresigned.uploadUrl, originalFile, (pct) => {
        originalFile.progress = pct;
      }));
      if (thumbnailFile && thumbResponse) {
        const thumbPresigned = thumbResponse.data;
        uploadPromises.push(uploadFile(thumbPresigned.uploadUrl, thumbnailFile));
      }

      await Promise.all(uploadPromises);

      const fileResultData = {
        object_key: originalPresigned.objectKey,
        area: props.area,
        content_type: originalFile.type,
        size_bytes: originalFile.size,
        file_name: originalFile.name,
      };

      originalFile.status = 'completed';
      originalFile.progress = 100;
      originalFile.uploadedData = fileResultData;
      uploadedFilesData.push(fileResultData);

    } catch (error) {
      originalFile.status = 'error';
      originalFile.progress = 0;
      const errorMessage = error.message || 'Error desconocido durante la subida.';
      toast.error(`Error al subir ${originalFile.name}: ${errorMessage}`);
      console.error(`[FileUpload] Error detallado para ${originalFile.name}:`, error);
      isUploading.value = false;
      throw new Error(`Fallo en la subida del archivo ${originalFile.name}: ${errorMessage}`);
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