<!-- src/components/logistica/ImageAnnotationModal.vue -->
<template>
  <div class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
    <div class="relative max-w-5xl w-full h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
      
      <!-- BARRA SUPERIOR DE HERRAMIENTAS -->
      <div class="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-white shrink-0">
        
        <!-- Título y Estado -->
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-sm font-black">
            ✏️
          </span>
          <div>
            <h3 class="text-xs sm:text-sm font-black text-white leading-tight">
              Anotar / Marcar Faltantes en Foto
            </h3>
            <p class="text-[10px] text-slate-400">
              Dibujá círculos, flechas o texto para señalar piezas faltantes o daños
            </p>
          </div>
        </div>

        <!-- ACCIONES RÁPIDAS (DESHACER / LIMPIAR / CERRAR) -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button 
            type="button" 
            @click="undoLastShape" 
            :disabled="shapes.length === 0"
            class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            title="Deshacer última marca"
          >
            <span>↩️ Deshacer</span>
            <span v-if="shapes.length > 0" class="text-[10px] font-mono text-slate-400">({{ shapes.length }})</span>
          </button>

          <button 
            type="button" 
            @click="clearAllShapes" 
            :disabled="shapes.length === 0"
            class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            title="Borrar todas las anotaciones"
          >
            <span>🗑️ Limpiar</span>
          </button>

          <button 
            type="button" 
            @click="$emit('close')" 
            class="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Cerrar sin guardar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

      </div>

      <!-- BARRA DE HERRAMIENTAS DE DIBUJO (PALETA + FORMAS + GROSOR) -->
      <div class="p-2 sm:px-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        
        <!-- SELECTOR DE HERRAMIENTA -->
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            type="button"
            v-for="tool in tools"
            :key="tool.id"
            @click="currentTool = tool.id"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
              currentTool === tool.id 
                ? 'bg-blue-600 text-white shadow-xs font-black' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            ]"
            :title="tool.description"
          >
            <span>{{ tool.icon }}</span>
            <span class="hidden sm:inline">{{ tool.label }}</span>
          </button>
        </div>

        <!-- SELECTOR DE COLOR -->
        <div class="flex items-center gap-1.5 bg-slate-950 p-1 px-2 rounded-xl border border-slate-800">
          <span class="text-[10px] text-slate-400 font-bold hidden sm:inline">Color:</span>
          <button 
            v-for="c in colorPalette" 
            :key="c.hex"
            type="button"
            @click="currentColor = c.hex"
            class="w-6 h-6 rounded-lg transition-transform cursor-pointer flex items-center justify-center"
            :class="currentColor === c.hex ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'"
            :style="{ backgroundColor: c.hex }"
            :title="c.name"
          >
            <span v-if="currentColor === c.hex" class="text-[10px]" :class="c.hex === '#FFFFFF' ? 'text-slate-900' : 'text-white'">✓</span>
          </button>
        </div>

        <!-- SELECTOR DE GROSOR -->
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span class="text-[10px] text-slate-400 font-bold pl-1 hidden sm:inline">Trazo:</span>
          <button 
            v-for="st in strokeOptions" 
            :key="st.val"
            type="button"
            @click="currentStroke = st.val"
            :class="[
              'px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer',
              currentStroke === st.val 
                ? 'bg-blue-600 text-white font-black' 
                : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ st.label }}
          </button>
        </div>

      </div>

      <!-- ÁREA CENTRAL DE EDICIÓN CON CAPA DE IMAGEN + CANVAS SUPERPUESTO (CORS FREE) -->
      <div class="flex-1 relative flex items-center justify-center overflow-hidden p-2 sm:p-4 bg-slate-950/70">
        
        <div v-if="isLoadingImage" class="text-xs text-blue-400 font-bold animate-pulse flex items-center gap-2">
          <span>⏳ Cargando imagen...</span>
        </div>

        <div 
          v-show="!isLoadingImage"
          ref="canvasContainerRef"
          class="relative inline-flex items-center justify-center select-none rounded-xl overflow-hidden shadow-2xl border border-slate-800 max-w-full max-h-[62vh]"
        >
          <!-- Imagen base cargada de forma nativa sin CORS restrictivo -->
          <img 
            ref="imgElementRef"
            :src="getCorsSafeImageUrl(image.url || image.originalUrl)"
            @load="onImageLoaded"
            @error="onImageError"
            alt="Foto instrumental"
            class="block max-w-full max-h-[62vh] object-contain pointer-events-none select-none"
            :style="{ transform: `rotate(${image.rotation || 0}deg)` }"
          />

          <!-- Canvas transparente superpuesto para trazo y marcas -->
          <canvas 
            ref="drawingCanvasRef"
            @mousedown="handlePointerDown"
            @mousemove="handlePointerMove"
            @mouseup="handlePointerUp"
            @mouseleave="handlePointerUp"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            class="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          ></canvas>
        </div>

        <!-- Prompt flotante para ingresar texto cuando la herramienta es 'text' -->
        <div 
          v-if="textPromptVisible" 
          class="absolute z-20 bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl max-w-xs w-full space-y-2.5"
          :style="{ left: `${textPromptPos.x}px`, top: `${textPromptPos.y}px` }"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-white">Etiqueta de Faltante:</span>
            <button type="button" @click="cancelTextPrompt" class="text-slate-400 hover:text-white text-xs">✕</button>
          </div>

          <!-- Chips sugeridos rápidos -->
          <div class="flex flex-wrap gap-1">
            <button 
              v-for="chip in quickTextChips" 
              :key="chip"
              type="button" 
              @click="currentTextInput = chip"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
            >
              {{ chip }}
            </button>
          </div>

          <input 
            v-model="currentTextInput"
            ref="textInputRef"
            type="text" 
            placeholder="Ej: Falta pinza Kocher..."
            @keyup.enter="commitTextPrompt"
            class="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div class="flex justify-end gap-1.5 pt-1">
            <button 
              type="button" 
              @click="cancelTextPrompt" 
              class="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              @click="commitTextPrompt" 
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-xs"
            >
              Insertar
            </button>
          </div>
        </div>

      </div>

      <!-- BARRA INFERIOR DE CONFIRMACIÓN -->
      <div class="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-slate-400 text-[11px]">
            Marcas activas: <strong class="text-white">{{ shapes.length }}</strong>
          </span>
          <span v-if="shapes.length > 0" class="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            ✓ Lista para el PDF
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button 
            type="button" 
            @click="saveAndApplyAnnotations" 
            :disabled="isLoadingImage"
            class="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <span>💾 Aplicar y Guardar en Reporte</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { getCorsSafeImageUrl } from '../../utils/imageCorsHelper';

const props = defineProps({
  image: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

const drawingCanvasRef = ref(null);
const canvasContainerRef = ref(null);
const imgElementRef = ref(null);
const textInputRef = ref(null);

const isLoadingImage = ref(true);
const currentTool = ref('circle'); // 'circle', 'arrow', 'pencil', 'text'
const currentColor = ref('#EF4444'); // Rojo faltante
const currentStroke = ref(4);

const naturalWidth = ref(1200);
const naturalHeight = ref(800);

const tools = [
  { id: 'circle', label: 'Círculo / Óvalo', icon: '⭕', description: 'Rodear instrumental faltante o dañado' },
  { id: 'arrow', label: 'Flecha', icon: '➡️', description: 'Señalar exactamente la ranura o instrumento' },
  { id: 'pencil', label: 'Lápiz Libre', icon: '✏️', description: 'Dibujo a mano alzada' },
  { id: 'text', label: 'Texto / Etiqueta', icon: '🔤', description: 'Insertar nota o texto sobre la imagen' }
];

const colorPalette = [
  { hex: '#EF4444', name: 'Rojo Faltante' },
  { hex: '#EAB308', name: 'Amarillo Alerta' },
  { hex: '#3B82F6', name: 'Azul' },
  { hex: '#22C55E', name: 'Verde' },
  { hex: '#FFFFFF', name: 'Blanco' },
  { hex: '#000000', name: 'Negro' }
];

const strokeOptions = [
  { val: 2, label: 'Fino' },
  { val: 4, label: 'Medio' },
  { val: 7, label: 'Grueso' }
];

const quickTextChips = [
  'FALTA PIEZA',
  'DAÑADO / ROTO',
  'NO DEVUELTO',
  'CONSUMIDO',
  'SUCIO / SIN LAVAR',
  'REVISAR'
];

const shapes = ref([]);
const isDrawing = ref(false);
let startPoint = { x: 0, y: 0 };
let currentPencilPoints = [];

const textPromptVisible = ref(false);
const textPromptPos = reactive({ x: 50, y: 50 });
const currentTextInput = ref('');
let pendingTextCoords = { x: 0, y: 0 };

onMounted(() => {
  if (props.image.annotations && Array.isArray(props.image.annotations)) {
    shapes.value = JSON.parse(JSON.stringify(props.image.annotations));
  }
});

const onImageLoaded = (e) => {
  const img = e.target;
  naturalWidth.value = img.naturalWidth || 1200;
  naturalHeight.value = img.naturalHeight || 800;

  const canvas = drawingCanvasRef.value;
  if (canvas) {
    canvas.width = naturalWidth.value;
    canvas.height = naturalHeight.value;
    redrawAll();
  }
  isLoadingImage.value = false;
};

const onImageError = () => {
  isLoadingImage.value = false;
};

// Conversión de coordenadas de puntero al espacio nativo de la imagen
const getCanvasCoords = (e) => {
  const canvas = drawingCanvasRef.value;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
};

// --- MANEJADORES DE PUNTERO ---
const handlePointerDown = (e) => {
  if (textPromptVisible.value) return;
  const coords = getCanvasCoords(e);
  startPoint = coords;

  if (currentTool.value === 'text') {
    const container = canvasContainerRef.value;
    const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    textPromptPos.x = Math.max(10, clientX - rect.left - 100);
    textPromptPos.y = Math.max(10, clientY - rect.top - 80);
    pendingTextCoords = coords;
    currentTextInput.value = 'FALTA PIEZA';
    textPromptVisible.value = true;
    nextTick(() => {
      if (textInputRef.value) textInputRef.value.focus();
    });
    return;
  }

  isDrawing.value = true;

  if (currentTool.value === 'pencil') {
    currentPencilPoints = [coords];
  }
};

const handlePointerMove = (e) => {
  if (!isDrawing.value) return;
  const coords = getCanvasCoords(e);

  if (currentTool.value === 'pencil') {
    currentPencilPoints.push(coords);
    redrawAll();
    drawPencilPreview(currentPencilPoints, currentColor.value, currentStroke.value);
  } else if (currentTool.value === 'circle') {
    redrawAll();
    drawCirclePreview(startPoint, coords, currentColor.value, currentStroke.value);
  } else if (currentTool.value === 'arrow') {
    redrawAll();
    drawArrowPreview(startPoint, coords, currentColor.value, currentStroke.value);
  }
};

const handlePointerUp = (e) => {
  if (!isDrawing.value) return;
  isDrawing.value = false;

  let endCoords = startPoint;
  if (e && (e.clientX || e.changedTouches)) {
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const canvas = drawingCanvasRef.value;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      endCoords = {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }
  }

  if (currentTool.value === 'pencil') {
    if (currentPencilPoints.length > 1) {
      shapes.value.push({
        type: 'pencil',
        points: [...currentPencilPoints],
        color: currentColor.value,
        strokeWidth: currentStroke.value
      });
    }
    currentPencilPoints = [];
  } else if (currentTool.value === 'circle') {
    const radiusX = Math.abs(endCoords.x - startPoint.x) / 2;
    const radiusY = Math.abs(endCoords.y - startPoint.y) / 2;
    const centerX = Math.min(startPoint.x, endCoords.x) + radiusX;
    const centerY = Math.min(startPoint.y, endCoords.y) + radiusY;

    if (radiusX > 5 || radiusY > 5) {
      shapes.value.push({
        type: 'circle',
        centerX,
        centerY,
        radiusX,
        radiusY,
        color: currentColor.value,
        strokeWidth: currentStroke.value
      });
    }
  } else if (currentTool.value === 'arrow') {
    const dist = Math.hypot(endCoords.x - startPoint.x, endCoords.y - startPoint.y);
    if (dist > 10) {
      shapes.value.push({
        type: 'arrow',
        startX: startPoint.x,
        startY: startPoint.y,
        endX: endCoords.x,
        endY: endCoords.y,
        color: currentColor.value,
        strokeWidth: currentStroke.value
      });
    }
  }

  redrawAll();
};

const handleTouchStart = (e) => handlePointerDown(e);
const handleTouchMove = (e) => handlePointerMove(e);
const handleTouchEnd = (e) => handlePointerUp(e);

const undoLastShape = () => {
  if (shapes.value.length > 0) {
    shapes.value.pop();
    redrawAll();
  }
};

const clearAllShapes = () => {
  shapes.value = [];
  redrawAll();
};

const cancelTextPrompt = () => {
  textPromptVisible.value = false;
  currentTextInput.value = '';
};

const commitTextPrompt = () => {
  if (!currentTextInput.value.trim()) {
    cancelTextPrompt();
    return;
  }

  shapes.value.push({
    type: 'text',
    x: pendingTextCoords.x,
    y: pendingTextCoords.y,
    text: currentTextInput.value.trim().toUpperCase(),
    color: currentColor.value,
    strokeWidth: currentStroke.value
  });

  textPromptVisible.value = false;
  currentTextInput.value = '';
  redrawAll();
};

// --- DIBUJO EN CAPA TRANSPARENTE ---
const redrawAll = () => {
  const canvas = drawingCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const s of shapes.value) {
    if (s.type === 'circle') {
      drawCircle(ctx, s.centerX, s.centerY, s.radiusX, s.radiusY, s.color, s.strokeWidth);
    } else if (s.type === 'arrow') {
      drawArrow(ctx, s.startX, s.startY, s.endX, s.endY, s.color, s.strokeWidth);
    } else if (s.type === 'pencil') {
      drawPencil(ctx, s.points, s.color, s.strokeWidth);
    } else if (s.type === 'text') {
      drawText(ctx, s.x, s.y, s.text, s.color, s.strokeWidth);
    }
  }
};

const drawCirclePreview = (start, current, color, strokeWidth) => {
  const canvas = drawingCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const radiusX = Math.abs(current.x - start.x) / 2;
  const radiusY = Math.abs(current.y - start.y) / 2;
  const centerX = Math.min(start.x, current.x) + radiusX;
  const centerY = Math.min(start.y, current.y) + radiusY;
  drawCircle(ctx, centerX, centerY, radiusX, radiusY, color, strokeWidth);
};

const drawCircle = (ctx, cx, cy, rx, ry, color, strokeWidth) => {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth * 2;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.stroke();

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
  ctx.lineWidth = Math.max(1, strokeWidth);
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.restore();
};

const drawArrowPreview = (start, end, color, strokeWidth) => {
  const canvas = drawingCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  drawArrow(ctx, start.x, start.y, end.x, end.y, color, strokeWidth);
};

const drawArrow = (ctx, x1, y1, x2, y2, color, strokeWidth) => {
  const headLen = Math.max(16, strokeWidth * 4);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth * 2;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawPencilPreview = (points, color, strokeWidth) => {
  const canvas = drawingCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  drawPencil(ctx, points, color, strokeWidth);
};

const drawPencil = (ctx, points, color, strokeWidth) => {
  if (!points || points.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.stroke();
  ctx.restore();
};

const drawText = (ctx, x, y, text, color, strokeWidth) => {
  ctx.save();
  const fontSize = Math.max(16, strokeWidth * 6);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';

  const padding = 6;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - padding, y - padding, textWidth + padding * 2, textHeight + padding * 2, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
};

// --- GUARDAR ---
const saveAndApplyAnnotations = () => {
  emit('save', {
    originalUrl: props.image.originalUrl || props.image.url,
    annotations: JSON.parse(JSON.stringify(shapes.value)),
    hasAnnotations: shapes.value.length > 0,
    naturalWidth: naturalWidth.value,
    naturalHeight: naturalHeight.value
  });
  emit('close');
};
</script>

<style scoped>
canvas {
  touch-action: none;
}
</style>
