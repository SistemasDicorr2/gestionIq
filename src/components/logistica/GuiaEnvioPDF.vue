<!-- src/components/logistica/GuiaEnvioPDF.vue -->
<template>
  <div id="guia-envio-document" class="w-full bg-white text-slate-900 font-sans print:w-full print:p-0">
    
    <!-- HOJA 1: ENCABEZADO Y FICHA DE DATOS (COD: REG03-01-01-C) -->
    <div class="a4-page p-6 sm:p-8 space-y-4 border border-slate-300 dark:border-slate-700 rounded-2xl print:border-none print:p-0 print:rounded-none min-h-[297mm]">
      
      <!-- ENCABEZADO OFICIAL -->
      <table class="w-full border-2 border-slate-900 border-collapse text-center">
        <tbody>
          <tr>
            <td class="w-3/4 p-3 border-r-2 border-slate-900 bg-slate-100/80">
              <h1 class="text-xl sm:text-2xl font-black tracking-wider uppercase text-slate-900">
                GUIA DE ENVIO
              </h1>
              <h2 class="text-lg sm:text-xl font-black tracking-wide uppercase text-slate-900 mt-0.5">
                DE MATERIALES PARA LOGISTICA
              </h2>
              <p class="text-[11px] font-bold text-slate-700 uppercase tracking-widest mt-1 border-t border-slate-400 pt-1">
                INSTRUMENTAL, IMPLANTES, DESCARTABLES, EQUIPOS MEDICOS.
              </p>
            </td>

            <td class="w-1/4 p-2 bg-slate-50 flex flex-col justify-between h-full text-xs">
              <div class="py-1">
                <span class="text-[10px] font-black uppercase text-slate-500 block">FECHA</span>
                <span class="font-mono font-extrabold text-sm text-slate-900 block mt-0.5">{{ formatDate(guia.fecha_envio) }}</span>
              </div>
              <div class="border-t border-slate-300 pt-1.5 pb-1">
                <span class="text-[9px] font-mono font-black text-slate-600 block">COD:</span>
                <span class="text-[11px] font-mono font-extrabold text-slate-900 block">REG03-01-01-C</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- TABLA ESQUEMATIZADA DE CAMPOS -->
      <table class="w-full border-2 border-slate-900 border-collapse text-xs">
        <tbody>
          <tr class="border-b border-slate-900">
            <td class="w-1/3 p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              CLIENTE
            </td>
            <td class="w-2/3 p-2.5 font-extrabold text-slate-900 bg-white">
              {{ guia.cliente || '-' }}
            </td>
          </tr>

          <tr class="border-b border-slate-900">
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              MEDICO
            </td>
            <td class="p-2.5 font-extrabold text-slate-900 bg-white">
              {{ guia.medico || '-' }}
            </td>
          </tr>

          <tr class="border-b border-slate-900">
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              PACIENTE
            </td>
            <td class="p-2.5 font-extrabold text-slate-900 bg-white">
              {{ guia.paciente || '-' }}
            </td>
          </tr>

          <tr class="border-b border-slate-900">
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              LUGAR DE ENTREGA
            </td>
            <td class="p-2.5 font-extrabold text-slate-900 bg-white">
              {{ guia.lugar_entrega || '-' }}
            </td>
          </tr>

          <tr class="border-b border-slate-900">
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              FECHA DE CX:
            </td>
            <td class="p-2.5 font-extrabold text-slate-900 bg-white">
              {{ formatDate(guia.fecha_cx) }}
            </td>
          </tr>

          <tr class="border-b border-slate-900">
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              FECHA DE ENVIO:
            </td>
            <td class="p-2.5 font-extrabold text-slate-900 bg-white">
              {{ formatDate(guia.fecha_envio) }}
            </td>
          </tr>

          <tr class="border-b border-slate-900">
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              TRANSPORTE:
            </td>
            <td class="p-2.5 font-extrabold text-slate-900 bg-white">
              {{ guia.transporte || '-' }}
            </td>
          </tr>

          <tr class="border-b border-slate-900">
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900">
              N° DE GUIA:
            </td>
            <td class="p-2.5 font-mono font-extrabold text-slate-900 bg-white">
              {{ guia.numero_guia || '-' }}
            </td>
          </tr>

          <tr>
            <td class="p-2.5 font-black uppercase bg-slate-200/90 text-slate-900 border-r-2 border-slate-900 align-top">
              OBSERVACIÓNES:
            </td>
            <td class="p-2.5 font-bold text-slate-900 bg-white leading-relaxed min-h-[60px]">
              {{ guia.observaciones || '-' }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- PIE DE HOJA 1 -->
      <div class="pt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200">
        <span>DISTRICORR LOGÍSTICA — GESTIÓN IQ</span>
        <span>PÁGINA 1 DE {{ 1 + imagenes.length }}</span>
      </div>
    </div>

    <!-- HOJAS 2+: FOTOGRAFÍAS DE INSTRUMENTAL (1 FOTO POR PÁGINA A4 SIN DEFORMACIÓN) -->
    <div 
      v-for="(img, idx) in imagenes" 
      :key="img.id || idx"
      class="a4-page page-break p-6 sm:p-8 flex flex-col justify-between min-h-[297mm] border border-slate-300 dark:border-slate-700 rounded-2xl mt-6 print:border-none print:p-0 print:mt-0 print:rounded-none"
    >
      <!-- Cabecera de foto -->
      <div class="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-300 pb-2">
        <span class="uppercase tracking-wider font-extrabold text-slate-900">
          ANEXO FOTOGRÁFICO DE INSTRUMENTAL / CAJA #{{ idx + 1 }}
        </span>
        <span class="font-mono text-[11px] text-slate-500">
          GUÍA: {{ guia.numero_guia || '-' }}
        </span>
      </div>

      <!-- Contenedor de la Imagen con Respeto Estricto de Aspect Ratio (object-contain) -->
      <div class="flex-1 flex items-center justify-center p-2 my-auto min-h-[220mm]">
        <img 
          :src="img.url" 
          :alt="`Fotografía de instrumental ${idx + 1}`"
          class="max-w-full max-h-[230mm] object-contain mx-auto my-auto block rounded border border-slate-200 shadow-2xs"
        />
      </div>

      <!-- Pie de foto -->
      <div class="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200">
        <span>DISTRICORR LOGÍSTICA — REG03-01-01-C</span>
        <span>PÁGINA {{ idx + 2 }} DE {{ 1 + imagenes.length }}</span>
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

<style scoped>
@media print {
  .page-break {
    page-break-before: always;
    break-before: page;
  }
  .a4-page {
    min-height: 100vh;
  }
}
</style>
