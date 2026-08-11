<!-- src/components/logistica/GuiaEnvioPDF.vue -->
<template>
  <div id="guia-envio-document" class="w-full bg-white text-slate-900 font-sans print:w-full print:p-0">
    
    <!-- HOJA 1: ENCABEZADO Y FICHA DE DATOS (COD: REG03-01-01-C) -->
    <div class="a4-page p-6 sm:p-8 space-y-4 border border-slate-300 dark:border-slate-700 rounded-2xl print:border-none print:p-0 print:rounded-none min-h-[297mm] flex flex-col justify-between">
      
      <div class="space-y-4">
        <!-- CABECERA INSTITUCIONAL CON LOGO DISTRICORR -->
        <table class="w-full border-2 border-slate-900 border-collapse">
          <tbody>
            <tr>
              <!-- LOGO Y TÍTULO -->
              <td class="w-3/4 p-3 border-r-2 border-slate-900 bg-white">
                <div class="flex items-center gap-4 px-2">
                  <img src="/2.svg" alt="Districorr Logo" class="h-12 sm:h-14 w-auto object-contain shrink-0" />
                  <div class="text-left">
                    <h1 class="text-lg sm:text-xl font-black tracking-wide uppercase text-slate-950 leading-tight">
                      GUIA DE ENVIO
                    </h1>
                    <h2 class="text-base sm:text-lg font-black tracking-wide uppercase text-slate-900 leading-tight">
                      DE MATERIALES PARA LOGISTICA
                    </h2>
                  </div>
                </div>
                <p class="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mt-2 border-t border-slate-300 pt-1.5 text-center">
                  INSTRUMENTAL, IMPLANTES, DESCARTABLES, EQUIPOS MEDICOS.
                </p>
              </td>

              <!-- FECHA Y CÓDIGO REG03-01-01-C -->
              <td class="w-1/4 p-2 bg-slate-100/90 text-center align-middle whitespace-nowrap">
                <div class="py-1">
                  <span class="text-[9px] font-black uppercase text-slate-600 block">FECHA</span>
                  <span class="font-mono font-black text-sm text-slate-950 block mt-0.5">{{ formatDate(guia.fecha_envio) }}</span>
                </div>
                <div class="border-t border-slate-400 pt-1.5 pb-1">
                  <span class="text-[9px] font-mono font-black text-slate-600 block">COD:</span>
                  <span class="text-[11px] font-mono font-black text-slate-950 block tracking-tight">REG03-01-01-C</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- TABLA ESQUEMATIZADA DE CAMPOS -->
        <table class="w-full border-2 border-slate-900 border-collapse text-xs">
          <tbody>
            <tr class="border-b border-slate-900">
              <td class="w-1/3 p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                CLIENTE
              </td>
              <td class="w-2/3 p-3 font-black text-slate-950 bg-white text-sm">
                {{ guia.cliente || '-' }}
              </td>
            </tr>

            <tr class="border-b border-slate-900">
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                MEDICO
              </td>
              <td class="p-3 font-black text-slate-950 bg-white text-sm">
                {{ guia.medico || '-' }}
              </td>
            </tr>

            <tr class="border-b border-slate-900">
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                PACIENTE
              </td>
              <td class="p-3 font-black text-slate-950 bg-white text-sm">
                {{ guia.paciente || '-' }}
              </td>
            </tr>

            <tr class="border-b border-slate-900">
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                LUGAR DE ENTREGA
              </td>
              <td class="p-3 font-black text-slate-950 bg-white text-sm">
                {{ guia.lugar_entrega || '-' }}
              </td>
            </tr>

            <tr class="border-b border-slate-900">
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                FECHA DE CX:
              </td>
              <td class="p-3 font-black text-slate-950 bg-white text-sm">
                {{ formatDate(guia.fecha_cx) }}
              </td>
            </tr>

            <tr class="border-b border-slate-900">
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                FECHA DE ENVIO:
              </td>
              <td class="p-3 font-black text-slate-950 bg-white text-sm">
                {{ formatDate(guia.fecha_envio) }}
              </td>
            </tr>

            <tr class="border-b border-slate-900">
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                TRANSPORTE:
              </td>
              <td class="p-3 font-black text-slate-950 bg-white text-sm">
                {{ guia.transporte || '-' }}
              </td>
            </tr>

            <tr class="border-b border-slate-900">
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 tracking-wider">
                N° DE GUIA:
              </td>
              <td class="p-3 font-mono font-black text-slate-950 bg-white text-sm">
                {{ guia.numero_guia || '-' }}
              </td>
            </tr>

            <tr>
              <td class="p-3 font-black uppercase bg-slate-200/90 text-slate-950 border-r-2 border-slate-900 align-top tracking-wider">
                OBSERVACIÓNES:
              </td>
              <td class="p-3 font-bold text-slate-950 bg-white text-xs leading-relaxed min-h-[70px]">
                {{ guia.observaciones || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PIE DE HOJA 1 -->
      <div class="pt-4 flex items-center justify-between text-[10px] text-slate-600 font-mono border-t border-slate-300">
        <div class="flex items-center gap-2">
          <img src="/2.svg" alt="Districorr Logo" class="h-4 w-auto" />
          <span class="font-bold">DISTRICORR LOGÍSTICA — GESTIÓN IQ</span>
        </div>
        <span class="font-bold">PÁGINA 1 DE {{ 1 + imagenes.length }}</span>
      </div>
    </div>

    <!-- HOJAS 2+: FOTOGRAFÍAS DE INSTRUMENTAL (1 FOTO POR PÁGINA A4 SIN DEFORMACIÓN NI MARCOS innecesarios) -->
    <div 
      v-for="(img, idx) in imagenes" 
      :key="img.id || idx"
      class="a4-page page-break p-6 sm:p-8 flex flex-col justify-between min-h-[297mm] border border-slate-300 dark:border-slate-700 rounded-2xl mt-6 print:border-none print:p-0 print:mt-0 print:rounded-none"
    >
      <!-- Cabecera de foto -->
      <div class="flex items-center justify-between text-xs font-bold text-slate-700 border-b-2 border-slate-900 pb-2">
        <div class="flex items-center gap-2">
          <img src="/2.svg" alt="Districorr" class="h-5 w-auto" />
          <span class="uppercase tracking-wider font-black text-slate-950">
            ANEXO FOTOGRÁFICO DE INSTRUMENTAL / CAJA #{{ idx + 1 }}
          </span>
        </div>
        <span class="font-mono text-xs font-black text-slate-950">
          GUÍA: {{ guia.numero_guia || '-' }}
        </span>
      </div>

      <!-- Contenedor de la Imagen: Ajuste perfecto A4 (object-contain, sin deformación) -->
      <div class="flex-1 flex items-center justify-center p-2 my-auto min-h-[230mm]">
        <img 
          :src="img.url" 
          :alt="`Fotografía de instrumental ${idx + 1}`"
          class="max-w-full max-h-[240mm] w-auto h-auto object-contain mx-auto my-auto block rounded shadow-xs"
        />
      </div>

      <!-- Pie de foto -->
      <div class="pt-3 flex items-center justify-between text-[10px] text-slate-600 font-mono border-t border-slate-300">
        <span class="font-bold">DISTRICORR LOGÍSTICA — REG03-01-01-C</span>
        <span class="font-bold">PÁGINA {{ idx + 2 }} DE {{ 1 + imagenes.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  guia: {
    type: Object,
    required: true
  },
  imagenes: {
    type: Array,
    default: () => []
  }
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};
</script>

<style>
@media print {
  /* Ocultar Toasts, Headers de App y Elementos Fuera de Impresión */
  .Vue-Toastification__container,
  .toast,
  header,
  nav,
  aside,
  button,
  .print\:hidden {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .page-break {
    page-break-before: always !important;
    break-before: page !important;
  }

  .a4-page {
    min-height: 100vh !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 12mm !important;
  }
}
</style>
