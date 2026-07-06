<!-- src/components/ReportPDF.vue (VERSIÓN FINAL Y DEFINITIVA) -->
<template>
  <div ref="pdfTemplateRef" class="bg-white text-black p-8 font-sans w-[794px] min-h-[1122px]">
    <div v-if="reporte" class="flex flex-col h-full text-sm">
      
      <header class="flex justify-between items-start border-b-2 border-slate-200 pb-2">
        <img src="/2.svg" alt="Districorr Logo" class="h-16">
        <div class="text-right">
          <div class="flex items-center justify-end gap-2 mt-1">
            <span v-if="reporte.tipo_logistica === 'con_logistica'" class="bg-red-100 text-red-750 font-extrabold px-2.5 py-0.5 rounded text-[10px] uppercase border border-red-300 tracking-wider shadow-sm mr-2">
              Posee Logística
            </span>
            <h1 class="text-xl font-bold text-[#1E3A8A]">Reporte de Cirugía</h1>
          </div>
          <p class="text-slate-600 text-sm font-medium">Ficha de Identificación del Instrumentador Quirúrgico</p>
          <div class="text-xs text-slate-500">
            <span>ID Reporte: {{ reporte.id_cirugia }}</span> |
            <span>Generado: {{ new Date().toLocaleString('es-ES') }}</span>
          </div>
        </div>
      </header>

      <main class="flex-grow space-y-2 mt-3">
        <section class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="flex flex-row flex-wrap justify-between">
            <InfoItem class="min-w-[33%] mb-1 pr-4" icon="UserIcon" label="Paciente" :value="reporte.paciente" is-bold />
            <InfoItem class="min-w-[33%] mb-1 pr-4" icon="ClipboardDocumentCheckIcon" label="Médico" :value="reporte.medico" />
            <InfoItem class="min-w-[33%] mb-1 pr-4" icon="DocumentTextIcon" label="Tipo de Cirugía" :value="reporte.tipo_cirugia" />
            <InfoItem class="min-w-[33%] mb-1 pr-4" icon="CalendarIcon" label="Fecha de Cirugía" :value="formatDate(reporte.fecha_cirugia)" />
            <InfoItem class="min-w-[66%] mb-1 pr-4" icon="MapPinIcon" label="Lugar / Institución" :value="reporte.lugar_cirugia" />
          </div>
        </section>

        <section>
          <div class="flex flex-row flex-wrap justify-between">
            <InfoItem class="min-w-[33%] pr-4" icon="UserCircleIcon" label="Completado por" :value="reporte.instrumentador_completado" />
            <InfoItem class="min-w-[33%] pr-4" icon="IdentificationIcon" label="DNI" :value="reporte.instrumentador_dni" />
            <InfoItem class="min-w-[33%] pr-4" icon="ClockIcon" label="Ficha Completada" :value="formatDateTime(reporte.fecha_envio)" />
          </div>
        </section>

        <section class="grid grid-cols-2 gap-x-6 pt-1">
          <div class="space-y-1">
            <h3 class="text-base font-bold text-slate-800 border-l-4 border-[#1E3A8A] pl-2">Cuestionario</h3>
            <InfoItem label="Set completo recibido" :value="formatBoolean(reporte.set_completo)" />
            <InfoItem v-if="reporte.set_completo === false" label="Faltantes informados a tiempo" :value="formatBoolean(reporte.informe_faltante)" />
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-slate-800 border-l-4 border-[#1E3A8A] pl-2">Evaluación</h3>
            <RatingStars label="Puntualidad" :rating="reporte.rating_puntualidad" />
            <RatingStars label="Condiciones" :rating="reporte.rating_condiciones" />
            <RatingStars label="Asesoramiento" :rating="reporte.rating_asesoramiento" />
            <RatingStars label="General" :rating="reporte.rating_evaluacion_general" />
          </div>
        </section>
        
        <section>
          <h2 class="text-lg font-bold text-slate-800 mb-1 border-l-4 border-[#1E3A8A] pl-2">Datos Adicionales</h2>
          <div class="space-y-2 mt-2">
            <InfoBlock label="Consumo Realizado" :value="reporte.consumo_realizado" is-highlighted />
            <div class="grid grid-cols-2 gap-x-6">
              <InfoBlock label="Comentarios / Observaciones" :value="reporte.observaciones" />
              <div class="space-y-1 border p-3 rounded-md bg-slate-50">
                <InfoItem label="Representante" :value="reporte.representante_ventas" />
                <InfoItem label="Duración Cirugía" :value="reporte.duracion_cirugia" />
                <InfoItem label="Logística" :value="humanize(reporte.tipo_logistica)" :is-red="reporte.tipo_logistica === 'con_logistica'" />
                <InfoItem label="Transporte" :value="reporte.transporte_utilizado" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- --- INICIO DEL FOOTER FINAL --- -->
      <footer class="mt-auto pt-4 border-t-2 border-slate-200">
        <div v-if="reporte.url_firma">
          <p class="text-center text-xs text-slate-500 italic mb-4">
            Declaro que la información contenida en este reporte es veraz y completa.
          </p>
          
          <div class="max-w-xs mx-auto text-center">
            <div class="w-full h-36 flex items-center justify-center mb-2">
              <img :src="reporte.url_firma" alt="Firma" class="max-w-full max-h-full object-contain">
            </div>

            <div>
              <p class="border-t-2 border-slate-400 pt-1 font-semibold text-base text-slate-800">
                {{ reporte.instrumentador_completado }}
              </p>
              <p class="text-xs text-slate-500">Firma y Aclaración</p>
            </div>
          </div>
        </div>
        
        <div class="text-center text-xs text-slate-400 pt-3 mt-4 border-t border-slate-100">
          Reporte generado automáticamente por Districorr – {{ new Date().toLocaleString('es-ES') }}<br>
          9 de julio 1251 -  DISTRICORR SRL
        </div>
      </footer>
      <!-- --- FIN DEL FOOTER FINAL --- -->
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue';
import { UserIcon, ClipboardDocumentCheckIcon, CalendarIcon, MapPinIcon, UserCircleIcon, IdentificationIcon, DocumentTextIcon, ClockIcon } from '@heroicons/vue/24/outline';

const props = defineProps({ reporte: Object });
const pdfTemplateRef = ref(null);
defineExpose({ pdfTemplateRef });

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  }) + ' hs';
};

const formatBoolean = (value) => (value === null || value === undefined) ? 'N/A' : (value ? '✅ Sí' : '❌ No');
const humanize = (text) => {
  if (!text) return 'N/A';
  return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const InfoItem = defineComponent({
  props: ['label', 'value', 'icon', 'isBold', 'isRed'],
  setup(props) {
    const icons = { UserIcon, ClipboardDocumentCheckIcon, CalendarIcon, MapPinIcon, UserCircleIcon, IdentificationIcon, DocumentTextIcon, ClockIcon };
    return () => h('div', { class: 'grid grid-cols-[auto_1fr] gap-x-2 items-start' }, [
      h('div', { class: 'flex items-center col-start-1 flex-shrink-0' }, [
        props.icon ? h(icons[props.icon], { class: 'h-5 w-5 mr-2 text-[#1E3A8A]' }) : null,
        h('span', { class: 'font-semibold text-slate-800 whitespace-nowrap' }, props.label + ':')
      ]),
      h('span', { 
        class: [
          'col-start-2 break-words', 
          props.isRed ? 'text-red-600 font-bold' : 'text-slate-800',
          { 'font-bold': props.isBold, 'font-medium': !props.isBold && !props.isRed }
        ] 
      }, props.value || 'N/A')
    ]);
  }
});

const InfoBlock = defineComponent({
  props: ['label', 'value', 'isHighlighted'],
  setup(props) {
    const defaultValue = props.label === 'Comentarios / Observaciones' ? 'Sin comentarios.' : 'N/A';
    return () => h('div', {}, [
      h('strong', { class: 'block font-bold text-slate-800 mb-1' }, props.label),
      h('p', {
        class: [
          'p-3 bg-slate-100 border border-slate-200 rounded whitespace-pre-wrap text-sm min-h-[50px]',
          props.isHighlighted ? 'font-bold text-slate-900' : 'text-slate-700'
        ]
      }, props.value || defaultValue)
    ]);
  }
});

const RatingStars = defineComponent({
  props: ['label', 'rating'],
  setup(props) {
    const ratingColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-emerald-500'];
    
    return () => {
      const ratingVal = (props.rating !== null && props.rating !== undefined) ? parseInt(props.rating, 10) : null;
      const isValid = !isNaN(ratingVal) && ratingVal >= 1 && ratingVal <= 5;
      
      const stars = Array.from({ length: 5 }, (_, i) => {
        const isActive = isValid && i < ratingVal;
        const colorClass = isActive ? (ratingColors[ratingVal - 1] || 'text-yellow-500') : 'text-slate-300';
        return h('span', { class: colorClass }, '★');
      });
      
      const labelText = props.label ? props.label + ':' : '';
      const scoreText = isValid ? `${ratingVal}/5` : 'N/A';
      
      return h('div', { class: 'flex items-center' }, [
        h('span', { class: 'font-semibold text-slate-800 mr-2 w-28' }, labelText),
        h('div', { class: 'flex text-lg mr-2' }, stars),
        h('span', { class: 'text-xs text-slate-500 font-medium' }, `(${scoreText})`)
      ]);
    };
  }
});
</script>