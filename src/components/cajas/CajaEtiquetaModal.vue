<!-- src/components/cajas/CajaEtiquetaModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col transition-all">
      
      <!-- Header -->
      <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan">
            <TagIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white">Etiqueta & Cotas Oficiales de Rotulado</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Diagrama acotado en 12cm x 3cm (Open Sans High-Res)</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6 flex-grow flex flex-col items-center justify-center">

        <!-- Contenedor Visual de la Etiqueta con Cotas Integradas (12cm x 3cm) -->
        <div class="relative p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 w-full flex flex-col items-center justify-center shadow-inner overflow-hidden">
          
          <!-- Canvas Renderizado Completo con Cotas e Imagen Diagrama (Visible y Alta Resolución) -->
          <canvas ref="labelCanvas" class="w-full max-w-[540px] h-auto border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"></canvas>

          <div class="mt-3 text-center">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block font-open-sans">
              {{ item?.nombre || 'Caja / Set Quirúrgico' }}
            </span>
          </div>

        </div>

        <!-- Botones de Acción -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
          <!-- Descargar PNG con Cotas -->
          <button 
            @click="downloadImage"
            type="button"
            class="px-4 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <DownloadIcon class="w-4 h-4 text-brand-cyan-light" />
            <span>Descargar PNG con Cotas</span>
          </button>

          <!-- Copiar al Portapapeles -->
          <button 
            @click="copyImageToClipboard"
            type="button"
            class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CopyIcon class="w-4 h-4 text-slate-500" />
            <span>Copiar Imagen</span>
          </button>

          <!-- Imprimir -->
          <button 
            @click="printLabel"
            type="button"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PrinterIcon class="w-4 h-4 text-emerald-200" />
            <span>Imprimir Etiqueta</span>
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useToasts } from '../../composables/useToasts';
import { Tag as TagIcon, X as XIcon, Download as DownloadIcon, Copy as CopyIcon, Printer as PrinterIcon } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  item: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['close']);
const { showSuccessToast, showErrorToast } = useToasts();

const labelCanvas = ref(null);

const formattedCode = computed(() => {
  if (!props.item || !props.item.codigo) return 'RC-X00DMI-001';
  return props.item.codigo.toUpperCase();
});

// Dibuja una punta de flecha en Canvas
const drawArrowHead = (ctx, x, y, angle, size = 18) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size / 2.2);
  ctx.lineTo(-size, size / 2.2);
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.restore();
};

// Genera la imagen completa del diagrama con el rótulo negro y las cotas de 12CM y 3 CM
const renderDiagramCanvas = async () => {
  const canvas = labelCanvas.value;
  if (!canvas) return;

  // Cargar Open Sans
  if (document.fonts) {
    await document.fonts.load('800 88px "Open Sans"').catch(() => {});
  }

  const ctx = canvas.getContext('2d');
  
  // Tamaño del canvas del diagrama completo: 1600 x 520 px
  canvas.width = 1600;
  canvas.height = 520;

  // 1. Fondo blanco limpio para las cotas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Rectángulo negro de la etiqueta (12cm x 3cm en proporción)
  const rectX = 50;
  const rectY = 40;
  const rectW = 1360;
  const rectH = 340;

  ctx.fillStyle = '#000000';
  ctx.fillRect(rectX, rectY, rectW, rectH);

  // 3. Código en blanco con Open Sans Bold
  const codeText = formattedCode.value;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fontSize = codeText.length > 15 ? 74 : 88;
  ctx.font = `800 ${fontSize}px "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '10px';
  }
  ctx.fillText(codeText, rectX + rectW / 2, rectY + rectH / 2 - 25);

  // 4. Marca DISTRICORR en gris claro
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 42px "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '14px';
  }
  ctx.fillText('DISTRICORR', rectX + rectW / 2, rectY + rectH / 2 + 80);

  // 5. COTA HORIZONTAL (12CM) DEBAJO DEL RÓTULO
  const lineY = rectY + rectH + 60;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(rectX, lineY);
  ctx.lineTo(rectX + rectW, lineY);
  ctx.stroke();

  // Puntas de flecha horizontal (izquierda y derecha)
  drawArrowHead(ctx, rectX, lineY, 0);               // Izquierda
  drawArrowHead(ctx, rectX + rectW, lineY, Math.PI); // Derecha

  // Texto 12CM en el centro con espacio en blanco recortado
  ctx.font = 'bold 36px "Open Sans", sans-serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text12 = '12CM';
  const w12 = ctx.measureText(text12).width;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(rectX + rectW / 2 - w12 / 2 - 12, lineY - 22, w12 + 24, 44);

  ctx.fillStyle = '#000000';
  ctx.fillText(text12, rectX + rectW / 2, lineY);

  // 6. COTA VERTICAL (3 CM) A LA DERECHA DEL RÓTULO
  const lineX = rectX + rectW + 70;
  ctx.beginPath();
  ctx.moveTo(lineX, rectY);
  ctx.lineTo(lineX, rectY + rectH);
  ctx.stroke();

  // Puntas de flecha vertical (arriba y abajo)
  drawArrowHead(ctx, lineX, rectY, Math.PI / 2);          // Arriba
  drawArrowHead(ctx, lineX, rectY + rectH, -Math.PI / 2); // Abajo

  // Texto 3 CM rotado 90 grados con recorte de fondo blanco
  ctx.save();
  ctx.translate(lineX, rectY + rectH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.font = 'bold 32px "Open Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text3 = '3 CM';
  const w3 = ctx.measureText(text3).width;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-w3 / 2 - 10, -20, w3 + 20, 40);

  ctx.fillStyle = '#000000';
  ctx.fillText(text3, 0, 0);
  ctx.restore();
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    nextTick(() => {
      renderDiagramCanvas();
    });
  }
});

// Descargar Imagen PNG con las Cotas
const downloadImage = async () => {
  await renderDiagramCanvas();
  const link = document.createElement('a');
  link.download = `Etiqueta_Diagrama_${formattedCode.value}.png`;
  link.href = labelCanvas.value.toDataURL('image/png');
  link.click();
  showSuccessToast('Imagen con cotas descargada como PNG (12cm x 3cm).');
};

// Copiar Imagen al Portapapeles
const copyImageToClipboard = async () => {
  await renderDiagramCanvas();
  try {
    labelCanvas.value.toBlob(async (blob) => {
      if (!blob) throw new Error('No se pudo generar la imagen.');
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      showSuccessToast('Imagen con cotas copiada al portapapeles.');
    });
  } catch (err) {
    console.error('Error al copiar imagen:', err);
    showErrorToast('Tu navegador no permite copiar imágenes directamente. Usá "Descargar PNG".');
  }
};

// Imprimir Etiqueta con Cotas
const printLabel = async () => {
  await renderDiagramCanvas();
  const dataUrl = labelCanvas.value.toDataURL('image/png');

  const printWindow = window.open('', '_blank', 'width=700,height=500');
  if (!printWindow) {
    showErrorToast('El navegador bloqueó la ventana emergente de impresión.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Imprimir Etiqueta con Cotas - ${formattedCode.value}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@700;800&display=swap');
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            height: 100vh;
            font-family: 'Open Sans', sans-serif;
          }
          img {
            max-width: 100%;
            height: auto;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@600;700;800&display=swap');

.font-open-sans {
  font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
