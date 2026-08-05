<!-- src/components/SignatureModal.vue (Soporte Modo Oscuro / Claro) -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      
      <div class="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">Firma Digital del Instrumentador</h2>
        <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <div class="flex-grow p-3 bg-slate-100 dark:bg-slate-950">
        <canvas 
          ref="canvasRef" 
          class="w-full h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 cursor-crosshair shadow-inner"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="startDrawing"
          @touchmove.prevent="draw"
          @touchend="stopDrawing"
        ></canvas>
      </div>

      <div class="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
        <button @click="clearSignature" class="text-slate-600 dark:text-slate-300 font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs cursor-pointer">
          Limpiar Firma
        </button>
        <button @click="saveSignature" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer">
          Guardar Firma
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'save']);

const canvasRef = ref(null);
let ctx = null;
const isDrawing = ref(false);

watch(() => props.show, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      initializeCanvas();
    });
  }
});

const initializeCanvas = () => {
  const canvas = canvasRef.value;
  if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Determinar color del trazo según el tema
    const isDarkMode = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDarkMode ? '#3b82f6' : '#0f172a';
  }
};

const getCoordinates = (event) => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  if (event.touches && event.touches.length > 0) {
    return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
  }
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

const startDrawing = (event) => {
  if (!ctx) return;
  isDrawing.value = true;
  const { x, y } = getCoordinates(event);
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const draw = (event) => {
  if (!isDrawing.value || !ctx) return;
  const { x, y } = getCoordinates(event);
  ctx.lineTo(x, y);
  ctx.stroke();
};

const stopDrawing = () => {
  isDrawing.value = false;
};

const clearSignature = () => {
  const canvas = canvasRef.value;
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

const canvasToBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      return reject(new Error("El canvas no está disponible."));
    }
    canvas.toBlob(resolve, 'image/webp', 0.7);
  });
};

const saveSignature = async () => {
  try {
    if (!canvasRef.value) {
      console.error("Intento de guardar firma sin un canvas válido.");
      return;
    }
    const signatureBlob = await canvasToBlob(canvasRef.value);
    emit('save', signatureBlob);
    closeModal();
  } catch (error) {
    console.error("Error al guardar la firma:", error);
    alert("No se pudo guardar la firma. Por favor, inténtelo de nuevo.");
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>