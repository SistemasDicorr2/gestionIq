<!-- src/components/capture/WebcamCapture.vue -->
<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" @click.self="closeModal">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh]">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div class="flex items-center gap-2">
            <span class="text-xl">📷</span>
            <h3 class="text-sm sm:text-base font-extrabold text-white">Cámara Rápida (Multi-foto)</h3>
          </div>
          <button 
            type="button"
            @click="closeModal" 
            class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Contenedor principal de video -->
        <div class="relative bg-black flex-1 min-h-[280px] flex items-center justify-center overflow-hidden">
          <div v-if="errorMsg" class="p-6 text-center text-rose-400 space-y-2">
            <p class="font-bold text-sm sm:text-base">⚠️ {{ errorMsg }}</p>
            <p class="text-xs text-slate-400">Verificá los permisos de cámara en tu navegador.</p>
          </div>
          <div v-else-if="isLoading" class="p-8 text-center text-blue-400 animate-pulse font-bold text-sm">
            Iniciando cámara...
          </div>
          
          <video 
            ref="videoRef" 
            autoplay 
            playsinline 
            class="w-full h-full object-cover max-h-[55vh]"
            :class="{ '-scale-x-100': currentFacingMode === 'user' }"
          ></video>
          
          <canvas ref="canvasRef" class="hidden"></canvas>

          <!-- Flash de disparo -->
          <div v-if="photoCaptured" class="absolute inset-0 bg-white/70 animate-ping pointer-events-none"></div>

          <!-- Botón de cambio de cámara (Frontal/Trasera) -->
          <button 
            v-if="!isLoading && !errorMsg"
            type="button" 
            @click="toggleCamera"
            class="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white font-bold text-xs shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Cambiar Cámara"
          >
            🔄 {{ currentFacingMode === 'environment' ? 'Cámara Frontal' : 'Cámara Trasera' }}
          </button>
        </div>

        <!-- Tira de fotos capturadas en la sesión actual -->
        <div v-if="capturedPhotos.length > 0" class="px-4 py-2.5 bg-slate-950 border-t border-slate-800">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Capturadas en esta sesión ({{ capturedPhotos.length }}):
            </span>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <div v-for="(photo, idx) in capturedPhotos" :key="photo.id" class="relative flex-shrink-0 w-14 h-14 group rounded-xl overflow-hidden border border-slate-700">
              <img :src="photo.previewUrl" class="w-full h-full object-cover" alt="Captura" />
              <button 
                type="button" 
                @click="removeCapturedPhoto(idx)"
                class="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md hover:scale-110 cursor-pointer"
                title="Quitar esta foto"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Acciones del pie -->
        <div class="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button 
            type="button"
            @click="closeModal" 
            class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            {{ capturedPhotos.length > 0 ? 'Cancelar' : 'Cerrar' }}
          </button>

          <!-- Botón disparador principal estilo cámara -->
          <button 
            type="button"
            @click="capturePhoto" 
            :disabled="isLoading || !!errorMsg" 
            class="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 border-4 border-slate-900 outline outline-2 outline-rose-500 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Tomar Foto"
          >
            <div class="w-10 h-10 rounded-full bg-white/20"></div>
          </button>

          <button 
            type="button"
            @click="confirmPhotos" 
            :disabled="capturedPhotos.length === 0"
            class="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            ✓ Confirmar ({{ capturedPhotos.length }})
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'photo-taken', 'photos-confirmed']);

const videoRef = ref(null);
const canvasRef = ref(null);
const stream = ref(null);
const isLoading = ref(false);
const errorMsg = ref('');
const photoCaptured = ref(false);
const currentFacingMode = ref('environment'); // Por defecto cámara trasera para evidencias
const capturedPhotos = ref([]);

const startCamera = async () => {
  if (!props.show) return;

  stopCamera();
  isLoading.value = true;
  errorMsg.value = '';

  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: { ideal: currentFacingMode.value },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value;
    }
  } catch (err) {
    console.warn("[WebcamCapture] Fallo con facingMode ideal, intentando modo básico:", err);
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
      }
    } catch (fallbackErr) {
      console.error("[WebcamCapture] Error final al acceder a la cámara:", fallbackErr);
      errorMsg.value = "No se pudo acceder a la cámara. Revisa los permisos.";
    }
  } finally {
    isLoading.value = false;
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
};

const toggleCamera = () => {
  currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment';
  startCamera();
};

const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return;

  const video = videoRef.value;
  const canvas = canvasRef.value;
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;

  // Si es cámara frontal, invertimos horizontalmente el canvas para no guardar la imagen en espejo
  if (currentFacingMode.value === 'user') {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const photoFile = new File([blob], `camara-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(photoFile);
    
    capturedPhotos.value.push({
      id: crypto.randomUUID(),
      file: photoFile,
      previewUrl
    });

    // Feedback visual tipo flash
    photoCaptured.value = true;
    setTimeout(() => { photoCaptured.value = false; }, 300);

    // Emitir inmediatamente cada foto por separado
    emit('photo-taken', photoFile);

  }, 'image/jpeg', 0.92);
};

const removeCapturedPhoto = (idx) => {
  const item = capturedPhotos.value[idx];
  if (item?.previewUrl) {
    URL.revokeObjectURL(item.previewUrl);
  }
  capturedPhotos.value.splice(idx, 1);
};

const clearCapturedPhotos = () => {
  capturedPhotos.value.forEach(p => {
    if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
  });
  capturedPhotos.value = [];
};

const confirmPhotos = () => {
  emit('photos-confirmed', capturedPhotos.value.map(p => p.file));
  closeModal();
};

const closeModal = () => {
  emit('close');
};

watch(() => props.show, (newValue) => {
  if (newValue) {
    clearCapturedPhotos();
    startCamera();
  } else {
    stopCamera();
    clearCapturedPhotos();
  }
});

onUnmounted(() => {
  stopCamera();
  clearCapturedPhotos();
});
</script>