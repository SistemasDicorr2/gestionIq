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
              <div class="font-mono text-[11px] font-black block text-slate-200">
                <span>FECHA: </span>
                <input 
                  v-if="editable" 
                  v-model="guia.fecha_envio" 
                  type="date" 
                  class="bg-slate-800 text-white border border-slate-600 rounded px-1 text-xs focus:outline-none" 
                />
                <span v-else>{{ formatDate(guia.fecha_envio) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-100 px-3 py-1.5 flex items-center justify-end border-t border-slate-300 text-[11px] font-bold text-slate-800">
            <div class="font-mono font-black text-slate-950 text-xs flex items-center gap-1">
              <span>N° GUÍA: </span>
              <input 
                v-if="editable" 
                v-model="guia.numero_guia" 
                type="text" 
                class="bg-blue-50/80 border border-dashed border-blue-400 rounded px-1.5 font-mono font-black text-xs focus:outline-none focus:bg-white" 
              />
              <span v-else>{{ guia.numero_guia || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- GRILLA FORMAL DE CAMPOS Y DATOS DE DESPACHO (SINGLE O MULTI-PACIENTE) -->
        <div v-if="pacientesList.length <= 1" class="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs">
          <div class="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[10px] tracking-wider flex items-center justify-between">
            <span>📋 DATOS PRINCIPALES DE LA GUÍA DE DESPACHO</span>
            <span class="text-[9px] text-slate-300 font-normal">DOCUMENTO OFICIAL DISTRICORR</span>
          </div>

          <div class="divide-y divide-slate-300 font-medium">
            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                CLIENTE / INSTITUCIÓN
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="guia.cliente" 
                  type="text" 
                  placeholder="Escribí el cliente..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ guia.cliente || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                MÉDICO CIRUJANO
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="guia.medico" 
                  type="text" 
                  placeholder="Escribí el médico cirujano..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ guia.medico || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                PACIENTE
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="guia.paciente" 
                  type="text" 
                  placeholder="Escribí el nombre del paciente..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ guia.paciente || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                LUGAR DE ENTREGA
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="guia.lugar_entrega" 
                  type="text" 
                  placeholder="Escribí el lugar de entrega / sanatorio..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ guia.lugar_entrega || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 divide-x divide-slate-300">
              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  FECHA DE CX
                </div>
                <div class="w-1/2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                  <input 
                    v-if="editable" 
                    v-model="guia.fecha_cx" 
                    type="date" 
                    class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold focus:outline-none" 
                  />
                  <span v-else>{{ formatDate(guia.fecha_cx) }}</span>
                </div>
              </div>

              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  FECHA DE ENVÍO
                </div>
                <div class="w-1/2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                  <input 
                    v-if="editable" 
                    v-model="guia.fecha_envio" 
                    type="date" 
                    class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold focus:outline-none" 
                  />
                  <span v-else>{{ formatDate(guia.fecha_envio) }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 divide-x divide-slate-300">
              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  TRANSPORTE
                </div>
                <div class="w-1/2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                  <input 
                    v-if="editable" 
                    v-model="guia.transporte" 
                    type="text" 
                    placeholder="Transporte..." 
                    class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold focus:outline-none" 
                  />
                  <span v-else>{{ displayTransporte }}</span>
                </div>
              </div>

              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 tracking-wider text-[11px]">
                  N° DE GUÍA
                </div>
                <div class="w-1/2 px-3 py-1.5 font-mono font-extrabold text-slate-950 bg-white text-xs">
                  <input 
                    v-if="editable" 
                    v-model="guia.numero_guia" 
                    type="text" 
                    class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-mono font-extrabold focus:outline-none" 
                  />
                  <span v-else>{{ guia.numero_guia || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABLA DE MULTI-PACIENTE CUANDO HAY MÁS DE 1 PACIENTE REGISTRADO -->
        <div v-else class="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs space-y-0">
          <div class="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[10px] tracking-wider flex items-center justify-between">
            <span>👥 PACIENTES Y CIRUGÍAS INCLUIDAS EN ESTE ENVÍO ({{ pacientesList.length }})</span>
            <span class="text-[9px] text-slate-300 font-normal">DESPACHO CONSOLIDADO</span>
          </div>

          <div class="p-2.5 bg-slate-100/90 border-b border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold">
            <div>
              <span class="text-slate-500 text-[10px] block">CLIENTE:</span> 
              <input v-if="editable" v-model="guia.cliente" class="w-full bg-white border border-dashed border-blue-400 rounded px-1 text-xs font-bold" />
              <span v-else>{{ guia.cliente }}</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">TRANSPORTE:</span> 
              <input v-if="editable" v-model="guia.transporte" class="w-full bg-white border border-dashed border-blue-400 rounded px-1 text-xs font-bold" />
              <span v-else>{{ displayTransporte }}</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">FECHA ENVÍO:</span> 
              <input v-if="editable" v-model="guia.fecha_envio" type="date" class="w-full bg-white border border-dashed border-blue-400 rounded px-1 text-xs font-bold" />
              <span v-else>{{ formatDate(guia.fecha_envio) }}</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">N° GUÍA:</span> 
              <input v-if="editable" v-model="guia.numero_guia" class="w-full bg-white border border-dashed border-blue-400 rounded px-1 text-xs font-mono font-black" />
              <span v-else class="font-mono text-blue-900 font-black">{{ guia.numero_guia }}</span>
            </div>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-200/80 border-b border-slate-300 text-[10px] uppercase font-black text-slate-800">
                <th class="py-1.5 px-2.5 border-r border-slate-300 w-7 text-center">#</th>
                <th class="py-1.5 px-2.5 border-r border-slate-300">Paciente</th>
                <th class="py-1.5 px-2.5 border-r border-slate-300">Médico Cirujano</th>
                <th class="py-1.5 px-2.5 border-r border-slate-300">Fecha CX</th>
                <th class="py-1.5 px-2.5">Lugar de Entrega</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-300 font-medium text-[11px]">
              <tr v-for="(p, idx) in pacientesList" :key="idx" class="hover:bg-slate-50">
                <td class="py-2 px-2.5 border-r border-slate-300 font-mono font-bold text-center bg-slate-100/60">{{ idx + 1 }}</td>
                <td class="py-1.5 px-2.5 border-r border-slate-300 font-extrabold text-slate-950">
                  <input v-if="editable" v-model="p.paciente" placeholder="Nombre paciente..." class="w-full bg-blue-50/40 focus:bg-white border border-dashed border-blue-400 rounded px-1.5 py-0.5 font-extrabold" />
                  <span v-else>{{ p.paciente || '-' }}</span>
                </td>
                <td class="py-1.5 px-2.5 border-r border-slate-300 font-bold text-slate-800">
                  <input v-if="editable" v-model="p.medico" placeholder="Médico..." class="w-full bg-blue-50/40 focus:bg-white border border-dashed border-blue-400 rounded px-1.5 py-0.5 font-bold" />
                  <span v-else>{{ p.medico || '-' }}</span>
                </td>
                <td class="py-1.5 px-2.5 border-r border-slate-300 font-mono text-slate-800">
                  <input v-if="editable" v-model="p.fecha_cx" type="date" class="w-full bg-blue-50/40 focus:bg-white border border-dashed border-blue-400 rounded px-1.5 py-0.5 font-mono" />
                  <span v-else>{{ formatDate(p.fecha_cx) }}</span>
                </td>
                <td class="py-1.5 px-2.5 font-semibold text-slate-800">
                  <input v-if="editable" v-model="p.lugar_entrega" placeholder="Lugar..." class="w-full bg-blue-50/40 focus:bg-white border border-dashed border-blue-400 rounded px-1.5 py-0.5 font-semibold" />
                  <span v-else>{{ p.lugar_entrega || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- OBSERVACIONES Y ESPECIFICACIONES (HOJA 1) -->
        <div class="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs">
          <div class="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[10px] tracking-wider flex items-center justify-between">
            <span>📝 OBSERVACIONES Y NOTAS DE LOGÍSTICA</span>
            <span class="text-[9px] text-slate-300">HOJA 1</span>
          </div>
          <div class="p-2.5 font-semibold text-slate-900 bg-slate-50/80 min-h-[50px] leading-relaxed text-[11px]">
            <textarea 
              v-if="editable" 
              v-model="guia.observaciones" 
              rows="2" 
              placeholder="Haz clic aquí para redactar las observaciones de la Hoja 1..." 
              class="w-full p-2 bg-blue-50/40 hover:bg-blue-50 focus:bg-white border border-dashed border-blue-400 rounded font-semibold text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
            <div v-else class="whitespace-pre-line">
              {{ getPageNote(1) || guia.observaciones || 'Sin observaciones adicionales registradas para este despacho.' }}
            </div>
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

    <!-- HOJAS 2+: ANEXO FOTOGRÁFICO DE INSTRUMENTAL CON CONFIGURACIÓN DE TAMAÑOS Y NOTAS -->
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

      <!-- CONTENEDOR DE FOTOGRAFÍAS (2 POR HOJA A4 CON ALTURA INCREMENTADA +15% / CONFIGURABLE DIRECTAMENTE EN HOJA) -->
      <div class="py-2 space-y-3 my-auto flex-1 flex flex-col justify-center">
        <div 
          v-for="img in page.items" 
          :key="img.id || img.globalIndex"
          class="border border-slate-300 rounded-lg bg-slate-50/90 relative shadow-2xs overflow-hidden flex flex-col items-center justify-center p-2 transition-all"
          :style="{
            height: img.size === 'compacto' ? '98mm' : '118mm',
            maxHeight: img.size === 'compacto' ? '98mm' : '118mm',
            boxSizing: 'border-box'
          }"
        >
          <div class="absolute top-2 left-2 flex items-center gap-1 z-10">
            <span class="px-2 py-0.5 rounded bg-slate-950 text-white font-mono text-[9px] font-black z-10 shadow-xs">
              FOTOGRAFÍA #{{ img.globalIndex }} DE {{ imagenes.length }}
            </span>

            <!-- Badge interactivo de tamaño clickeable directamente en vista previa -->
            <button 
              type="button" 
              @click="toggleImgSize(img)"
              class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider transition-all shadow-xs cursor-pointer hover:scale-105"
              :class="img.size === 'compacto' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700'"
              title="Haz clic para alternar entre Tamaño Grande (+15%) y Compacto"
            >
              {{ img.size === 'compacto' ? '📦 Compacto' : '🔍 Grande (+15%)' }}
            </button>
          </div>

          <div class="w-full h-full flex items-center justify-center pt-4 overflow-hidden">
            <img 
              :src="img.url" 
              :alt="`Fotografía de instrumental ${img.globalIndex}`"
              class="rounded shadow-2xs block mx-auto my-auto cursor-pointer transition-all duration-200"
              @click="toggleImgSize(img)"
              :title="editable ? 'Haz clic en la foto para cambiar de tamaño (Grande / Compacto)' : ''"
              :style="{
                transform: `rotate(${img.rotation || 0}deg)`,
                maxHeight: (img.rotation === 90 || img.rotation === 270) 
                  ? (img.size === 'compacto' ? '60mm' : '75mm') 
                  : (img.size === 'compacto' ? '82mm' : '106mm'),
                maxWidth: (img.rotation === 90 || img.rotation === 270) ? '70%' : '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }"
            />
          </div>
        </div>
      </div>

      <!-- SECCIÓN DE NOTA / OBSERVACIÓN ESPECÍFICA DE ESTA HOJA -->
      <div v-if="editable || getPageNote(page.pageIndex)" class="mb-2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs">
        <div class="flex items-center justify-between font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-1">
          <span>📝 NOTA / OBSERVACIÓN DE LA HOJA {{ page.pageIndex }}</span>
          <span v-if="editable" class="text-[9px] font-normal text-blue-600">(Clic para escribir nota de esta hoja)</span>
        </div>
        <textarea 
          v-if="editable" 
          v-model="notasPaginas[page.pageIndex]" 
          rows="2" 
          placeholder="Escribí una nota u observación específica para esta hoja de fotografías..." 
          class="w-full p-2 bg-blue-50/40 hover:bg-blue-50 focus:bg-white border border-dashed border-blue-400 rounded font-medium text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
        ></textarea>
        <p v-else class="text-slate-800 font-medium whitespace-pre-line text-[11px] leading-relaxed">
          {{ getPageNote(page.pageIndex) }}
        </p>
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
import { normalizeProveedor } from '../../utils/logisticaHelpers';

const displayTransporte = computed(() => normalizeProveedor(props.guia?.transporte));

const props = defineProps({
  guia: {
    type: Object,
    required: true
  },
  imagenes: {
    type: Array,
    default: () => []
  },
  pacientes: {
    type: Array,
    default: () => []
  },
  notasPaginas: {
    type: Object,
    default: () => ({})
  },
  editable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-image-size']);

const toggleImgSize = (img) => {
  if (!props.editable) return;
  img.size = img.size === 'compacto' ? 'grande' : 'compacto';
  emit('toggle-image-size', img);
};

// Resuelve la lista completa de pacientes
const pacientesList = computed(() => {
  if (props.pacientes && props.pacientes.length > 0) {
    return props.pacientes;
  }
  if (props.guia.paciente || props.guia.medico) {
    return [{
      paciente: props.guia.paciente,
      medico: props.guia.medico,
      fecha_cx: props.guia.fecha_cx,
      lugar_entrega: props.guia.lugar_entrega
    }];
  }
  return [];
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

const getPageNote = (pageNumber) => {
  if (!props.notasPaginas) return '';
  return props.notasPaginas[pageNumber] || props.notasPaginas[String(pageNumber)] || '';
};

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

  /* Remueve bordes punteados de edición durante la impresión */
  input, textarea {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    resize: none !important;
    outline: none !important;
    box-shadow: none !important;
    appearance: none !important;
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
