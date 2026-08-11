<!-- src/components/logistica/GuiaEnvioPDF.vue -->
<template>
  <div id="guia-envio-document" class="w-full bg-white text-slate-900 font-sans print:w-full print:p-0">
    
    <!-- HOJA 1: FICHA DE DATOS COMPACTA Y FORMAL (COD: REG03-01-01-C) -->
    <div class="a4-page p-6 sm:p-8 space-y-4 border border-slate-300 dark:border-slate-800 rounded-2xl print:border-none print:p-0 print:rounded-none min-h-[280mm] print:min-h-0 flex flex-col justify-between shadow-sm bg-white">
      
      <div class="space-y-4">
        
        <!-- CABECERA INSTITUCIONAL CORPORATIVA COMPACTA -->
        <div class="border border-slate-900 rounded-lg overflow-hidden bg-white">
          <div class="flex items-center justify-between p-3 bg-slate-950 text-white">
            <div class="flex items-center gap-3">
              <div class="bg-white p-1.5 rounded shrink-0">
                <img src="/2.svg" alt="Districorr Logo" class="h-8 sm:h-10 w-auto object-contain" />
              </div>
              <div>
                <h1 class="text-sm sm:text-base font-black tracking-wider uppercase text-white leading-tight">
                  GUÍA DE DESPACHO Y ENVÍO DE MATERIALES
                </h1>
                <p class="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                  Instrumental Quirúrgico • Implantes • Equipos Médicos
                </p>
              </div>
            </div>

            <div class="text-right border-l border-slate-700 pl-3 space-y-0.5 shrink-0">
              <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white block text-center">
                REG03-01-01-C
              </span>
              <span class="font-mono text-[11px] font-black block text-slate-200">
                FECHA: {{ formatDate(guia.fecha_envio) }}
              </span>
            </div>
          </div>

          <div class="bg-slate-100 px-3 py-1.5 flex items-center justify-between border-t border-slate-300 text-[11px] font-bold text-slate-800">
            <span>SISTEMA DE TRAZABILIDAD Y LOGÍSTICA DE SALUD</span>
            <span class="font-mono font-black text-slate-950 text-xs">N° GUÍA: {{ guia.numero_guia || '-' }}</span>
          </div>
        </div>

        <!-- GRILLA FORMAL DE CAMPOS Y DATOS DE DESPACHO (COMPACTADA) -->
        <div class="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs">
          <div class="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[10px] tracking-wider flex items-center justify-between">
            <span>📋 DATOS PRINCIPALES DE LA GUÍA DE DESPACHO</span>
            <span class="text-[9px] text-slate-300 font-normal">DOCUMENTO OFICIAL DISTRICORR</span>
          </div>

          <div class="divide-y divide-slate-300 font-medium">
            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                CLIENTE / INSTITUCIÓN
              </div>
              <div class="sm:col-span-2 px-3 py-2 font-extrabold text-slate-950 bg-white text-xs">
                {{ guia.cliente || '-' }}
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                MÉDICO CIRUJANO
              </div>
              <div class="sm:col-span-2 px-3 py-2 font-extrabold text-slate-950 bg-white text-xs">
                {{ guia.medico || '-' }}
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                PACIENTE
              </div>
              <div class="sm:col-span-2 px-3 py-2 font-extrabold text-slate-950 bg-white text-xs">
                {{ guia.paciente || '-' }}
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                LUGAR DE ENTREGA
              </div>
              <div class="sm:col-span-2 px-3 py-2 font-extrabold text-slate-950 bg-white text-xs">
                {{ guia.lugar_entrega || '-' }}
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 divide-x divide-slate-300">
              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  FECHA DE CX
                </div>
                <div class="w-1/2 px-3 py-2 font-extrabold text-slate-950 bg-white text-xs">
                  {{ formatDate(guia.fecha_cx) }}
                </div>
              </div>

              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  FECHA DE ENVÍO
                </div>
                <div class="w-1/2 px-3 py-2 font-extrabold text-slate-950 bg-white text-xs">
                  {{ formatDate(guia.fecha_envio) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 divide-x divide-slate-300">
              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  TRANSPORTE
                </div>
                <div class="w-1/2 px-3 py-2 font-extrabold text-slate-950 bg-white text-xs">
                  {{ guia.transporte || '-' }}
                </div>
              </div>

              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  N° DE GUÍA
                </div>
                <div class="w-1/2 px-3 py-2 font-mono font-extrabold text-slate-950 bg-white text-xs">
                  {{ guia.numero_guia || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- OBSERVACIONES Y ESPECIFICACIONES -->
        <div class="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs">
          <div class="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[10px] tracking-wider">
            📝 OBSERVACIONES Y NOTAS DE LOGÍSTICA
          </div>
          <div class="p-3 font-semibold text-slate-900 bg-slate-50/80 min-h-[50px] leading-relaxed text-[11px]">
            {{ guia.observaciones || 'Sin observaciones adicionales registradas para este despacho.' }}
          </div>
        </div>

      </div>

      <!-- PIE DE HOJA 1 -->
      <div class="pt-2 flex items-center justify-between text-[9px] text-slate-600 font-mono border-t border-slate-300">
        <div class="flex items-center gap-2">
          <img src="/2.svg" alt="Districorr Logo" class="h-3.5 w-auto" />
          <span class="font-black text-slate-900">DISTRICORR LOGÍSTICA SALUD — GESTIÓN IQ</span>
        </div>
        <span class="font-black text-slate-900">PÁGINA 1 DE {{ totalPages }}</span>
      </div>
    </div>

    <!-- HOJAS 2+: ANEXO FOTOGRÁFICO DE INSTRUMENTAL (2 FOTOS POR HOJA A4 CON AJUSTE ESTRICTO DE ALTURA) -->
    <div 
      v-for="page in imagePages" 
      :key="page.pageIndex"
      class="a4-page page-break p-6 sm:p-8 flex flex-col justify-between min-h-[280mm] print:min-h-0 border border-slate-300 dark:border-slate-800 rounded-2xl mt-6 print:border-none print:p-0 print:mt-0 print:rounded-none shadow-sm bg-white"
    >
      <!-- Cabecera de foto -->
      <div class="flex items-center justify-between text-xs font-bold text-slate-800 border-b-2 border-slate-900 pb-2">
        <div class="flex items-center gap-2.5">
          <img src="/2.svg" alt="Districorr" class="h-5 w-auto" />
          <div>
            <span class="uppercase tracking-wider font-black text-slate-950 block text-[11px]">
              ANEXO FOTOGRÁFICO DE INSTRUMENTAL Y CAJAS
            </span>
            <span class="text-[9px] text-slate-500 font-medium">
              Fotografías {{ page.items[0].globalIndex }} {{ page.items.length > 1 ? `y ${page.items[1].globalIndex}` : '' }} de {{ imagenes.length }}
            </span>
          </div>
        </div>
        <span class="font-mono text-[11px] font-black text-slate-950 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
          GUÍA: {{ guia.numero_guia || '-' }}
        </span>
      </div>

      <!-- CONTENEDOR DE FOTOGRAFÍAS (2 POR HOJA A4 CON ALTURA ESTRICTA EN INLINE CSS) -->
      <div class="py-2 space-y-3 my-auto flex-1 flex flex-col justify-center">
        <div 
          v-for="img in page.items" 
          :key="img.id || img.globalIndex"
          class="border border-slate-300 rounded-lg bg-slate-50/90 relative shadow-2xs overflow-hidden flex flex-col items-center justify-center p-2"
          style="height: 108mm; max-height: 108mm; box-sizing: border-box;"
        >
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950 text-white font-mono text-[9px] font-black z-10 shadow-xs">
            FOTOGRAFÍA #{{ img.globalIndex }} DE {{ imagenes.length }}
          </span>

          <div class="w-full h-full flex items-center justify-center">
            <img 
              :src="img.url" 
              :alt="`Fotografía de instrumental ${img.globalIndex}`"
              class="rounded shadow-2xs block mx-auto my-auto"
              style="max-height: 92mm; max-width: 100%; width: auto; height: auto; object-fit: contain;"
            />
          </div>
        </div>
      </div>

      <!-- Pie de foto -->
      <div class="pt-2 flex items-center justify-between text-[9px] text-slate-600 font-mono border-t border-slate-300">
        <span class="font-black text-slate-900">DISTRICORR LOGÍSTICA — REG03-01-01-C</span>
        <span class="font-black text-slate-900">PÁGINA {{ page.pageIndex }} DE {{ totalPages }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  guia: {
    type: Object,
    required: true
  },
  imagenes: {
    type: Array,
    default: () => []
  }
});

// Agrupa las imágenes en parejas de máximo 2 por página A4
const imagePages = computed(() => {
  const pages = [];
  const list = props.imagenes || [];
  for (let i = 0; i < list.length; i += 2) {
    pages.push({
      pageIndex: Math.floor(i / 2) + 2,
      items: [
        { ...list[i], globalIndex: i + 1 },
        ...(list[i + 1] ? [{ ...list[i + 1], globalIndex: i + 2 }] : [])
      ]
    });
  }
  return pages;
});

const totalPages = computed(() => 1 + imagePages.value.length);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};
</script>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  html, body {
    background: white !important;
    color: black !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }

  /* Ocultar Toasts, Headers de App, Modales y Elementos Fuera de Impresión */
  .Vue-Toastification__container,
  .toast,
  header,
  nav,
  aside,
  button,
  .print\:hidden {
    display: none !important;
  }

  .page-break {
    page-break-before: always !important;
    break-before: page !important;
  }

  .a4-page {
    min-height: 0 !important;
    height: auto !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  #guia-envio-document {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>

