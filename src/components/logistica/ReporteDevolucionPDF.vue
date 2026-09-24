<!-- src/components/logistica/ReporteDevolucionPDF.vue -->
<template>
  <div class="w-full bg-white text-slate-900 font-sans print:w-full print:p-0">
    
    <!-- HOJA 1: ACTA FORMAL DE CONTROL DE DEVOLUCIÓN Y ESTADO DE CAJAS (COD: REG03-02-01-D) -->
    <div class="a4-page p-6 sm:p-8 space-y-4 border border-slate-300 rounded-2xl print:border-none print:p-0 print:rounded-none min-h-[280mm] print:min-h-0 flex flex-col justify-between shadow-sm bg-white">
      
      <div class="space-y-4">
        
        <!-- CABECERA INSTITUCIONAL CORPORATIVA COMPACTA -->
        <div class="border border-slate-900 rounded-lg overflow-hidden bg-white">
          <div class="flex items-center justify-between p-3 bg-slate-950 text-white">
            <div class="flex items-center gap-3">
              <div class="bg-white p-1.5 rounded shrink-0">
                <img src="/2.svg" alt="Districorr Logo" class="h-8 sm:h-10 w-auto object-contain" />
              </div>
              <div>
                <h1 class="text-sm sm:text-base font-black uppercase text-white leading-tight">
                  REPORTE DE CONTROL Y DEVOLUCIÓN DE INSTRUMENTAL
                </h1>
                <p class="text-[10px] font-bold text-slate-300 uppercase">
                  Trazabilidad Quirúrgica • Control de Cajas • Registro de Faltantes
                </p>
              </div>
            </div>

            <div class="text-right border-l border-slate-700 pl-3 space-y-0.5 shrink-0">
              <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-600 text-white block text-center">
                REG03-02-01-D
              </span>
              <div class="font-mono text-[11px] font-black block text-slate-200">
                <span>FECHA: </span>
                <input 
                  v-if="editable" 
                  v-model="controlData.fecha_control" 
                  type="date" 
                  class="bg-slate-800 text-white border border-slate-600 rounded px-1 text-xs focus:outline-none" 
                />
                <span v-else>{{ formatDate(controlData.fecha_control || controlData.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-100 px-3 py-1.5 flex items-center justify-between border-t border-slate-300 text-[11px] font-bold text-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-slate-500 uppercase text-[10px]">ESTADO DEVOLUCIÓN:</span>
              <select 
                v-if="editable" 
                v-model="controlData.estado"
                class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white border border-dashed border-blue-400 focus:outline-none cursor-pointer"
                :class="getStatusBadgeClass(controlData.estado)"
              >
                <option value="ok" class="bg-white text-emerald-900 font-bold">Todo OK / Completa</option>
                <option value="revision" class="bg-white text-amber-900 font-bold">En Revisión / Pendiente</option>
                <option value="problemas" class="bg-white text-rose-900 font-bold">Con Faltantes / Problemas</option>
              </select>
              <span 
                v-else
                class="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                :class="getStatusBadgeClass(controlData.estado)"
              >
                {{ getStatusLabel(controlData.estado) }}
              </span>
            </div>

            <div class="font-mono font-black text-slate-950 text-xs flex items-center gap-1">
              <span>ID REPORTE: </span>
              <input 
                v-if="editable" 
                v-model="controlData.report_id" 
                type="text" 
                class="bg-blue-50/80 border border-dashed border-blue-400 rounded px-1.5 font-mono font-black text-xs focus:outline-none focus:bg-white" 
              />
              <span v-else>#{{ controlData.report_id || controlData.cirugia_id || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- GRILLA FORMAL DE CAMPOS Y DATOS DE LA CIRUGÍA -->
        <div class="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs">
          <div class="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[10px] flex items-center justify-between">
            <span>DATOS PRINCIPALES DE LA CIRUGÍA Y CONTROL</span>
            <span class="text-[9px] text-slate-300 font-normal">DOCUMENTO OFICIAL DISTRICORR</span>
          </div>

          <div class="divide-y divide-slate-300 font-medium">
            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                PACIENTE
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="controlData.paciente" 
                  type="text" 
                  placeholder="Escribí el paciente..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ controlData.paciente || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                MÉDICO CIRUJANO
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="controlData.medico" 
                  type="text" 
                  placeholder="Escribí el médico cirujano..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ controlData.medico || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                SANATORIO / INSTITUCIÓN
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="controlData.institucion" 
                  type="text" 
                  placeholder="Escribí la institución o sanatorio..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ controlData.institucion || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                INSTRUMENTADOR/A ASIGNADO/A
              </div>
              <div class="sm:col-span-2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                <input 
                  v-if="editable" 
                  v-model="controlData.instrumentador" 
                  type="text" 
                  placeholder="Escribí el instrumentador..." 
                  class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <span v-else>{{ controlData.instrumentador || '-' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 divide-x divide-slate-300">
              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                  FECHA DE CX
                </div>
                <div class="w-1/2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                  <input 
                    v-if="editable" 
                    v-model="controlData.fecha_cx" 
                    type="date" 
                    class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold focus:outline-none" 
                  />
                  <span v-else>{{ formatDate(controlData.fecha_cx) }}</span>
                </div>
              </div>

              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                  FECHA DE CONTROL
                </div>
                <div class="w-1/2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                  <input 
                    v-if="editable" 
                    v-model="controlData.fecha_control" 
                    type="date" 
                    class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold focus:outline-none" 
                  />
                  <span v-else>{{ formatDate(controlData.fecha_control || controlData.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 divide-x divide-slate-300">
              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                  RESPONSABLE CONTROL
                </div>
                <div class="w-1/2 px-3 py-1.5 font-extrabold text-slate-950 bg-white text-xs">
                  <input 
                    v-if="editable" 
                    v-model="controlData.responsable" 
                    type="text" 
                    placeholder="Nombre responsable..." 
                    class="w-full bg-blue-50/60 hover:bg-blue-100/60 focus:bg-white border border-dashed border-blue-400 rounded px-2 py-1 font-extrabold focus:outline-none" 
                  />
                  <span v-else>{{ controlData.responsable || 'Logística Districorr' }}</span>
                </div>
              </div>

              <div class="flex">
                <div class="w-1/2 bg-slate-100/90 font-extrabold uppercase px-3 py-2 text-slate-800 border-r border-slate-300 text-[11px]">
                  FOTOS ADJUNTAS
                </div>
                <div class="w-1/2 px-3 py-1.5 font-mono font-extrabold text-slate-950 bg-white text-xs flex items-center gap-1">
                  <span>{{ imagenes.length }} fotografía(s)</span>
                  <span v-if="annotatedCount > 0" class="text-[10px] text-rose-600 font-bold">({{ annotatedCount }} con marcas)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- OBSERVACIONES Y DETALLE DE FALTANTES / DAÑOS (HOJA 1) -->
        <div class="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs">
          <div class="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[10px] flex items-center justify-between">
            <span>OBSERVACIONES DE LOGÍSTICA / DETALLE DE FALTANTES O DAÑOS</span>
            <span class="text-[9px] text-slate-300">HOJA 1</span>
          </div>
          <div class="p-3 font-semibold text-slate-900 bg-slate-50/80 min-h-[90px] leading-relaxed text-[11px]">
            <textarea 
              v-if="editable" 
              v-model="controlData.observaciones" 
              rows="4" 
              placeholder="Haz clic aquí para detallar observaciones, faltantes o estado general de la devolución..." 
              class="w-full p-2 bg-blue-50/40 hover:bg-blue-50 focus:bg-white border border-dashed border-blue-400 rounded font-semibold text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
            <div v-else class="whitespace-pre-line">
              {{ controlData.observaciones || 'La caja fue devuelta en condiciones operativas estándar sin observaciones críticas registradas.' }}
            </div>
          </div>
        </div>

        <!-- CUADRO DE AVISO AL INSTRUMENTADOR -->
        <div class="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs space-y-1">
          <p class="font-extrabold text-slate-900 text-[11px] flex items-center gap-1.5">
            <span>ℹ️</span>
            <span>Aviso de Devolución y Trazabilidad Operativa:</span>
          </p>
          <p class="text-slate-600 text-[10px] leading-relaxed">
            Este informe documenta el estado de recepción del instrumental en el sector de Logística y Lavado. En caso de detectarse faltantes o daños señalados en el anexo fotográfico, solicitamos al instrumentador verificar el material a la brevedad.
          </p>
        </div>

        <!-- ESPACIO PARA FIRMAS -->
        <div class="grid grid-cols-2 gap-6 pt-6 text-center text-[10px] font-bold text-slate-700">
          <div class="border-t border-slate-400 pt-2 space-y-0.5">
            <p class="font-extrabold text-slate-900">{{ controlData.responsable || 'Logística Districorr' }}</p>
            <p class="text-slate-500 text-[9px] uppercase">Control y Recepción Logística</p>
          </div>
          <div class="border-t border-slate-400 pt-2 space-y-0.5">
            <p class="font-extrabold text-slate-900">{{ controlData.instrumentador || 'Instrumentador Quirúrgico' }}</p>
            <p class="text-slate-500 text-[9px] uppercase">Firma / Aceptación Instrumentador</p>
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

    <!-- HOJAS 2+: ANEXO FOTOGRÁFICO DE INSTRUMENTAL Y FALTANTES MARCADOS -->
    <div 
      v-for="page in imagePages" 
      :key="page.pageIndex"
      class="a4-page page-break p-6 sm:p-8 flex flex-col justify-between min-h-[280mm] print:min-h-0 border border-slate-300 rounded-2xl mt-6 print:border-none print:p-0 print:mt-0 print:rounded-none shadow-sm bg-white"
    >
      <!-- Cabecera de foto -->
      <div class="flex items-center justify-between text-xs font-bold text-slate-800 border-b-2 border-slate-900 pb-2">
        <div class="flex items-center gap-2.5">
          <img src="/2.svg" alt="Districorr" class="h-5 w-auto" />
          <div>
            <span class="uppercase font-black text-slate-950 block text-[11px]">
              ANEXO FOTOGRÁFICO DE CONTROL DE DEVOLUCIÓN
            </span>
            <span class="text-[9px] text-slate-500 font-medium">
              Fotografías {{ page.items[0].globalIndex }} {{ page.items.length > 1 ? `y ${page.items[1].globalIndex}` : '' }} de {{ imagenes.length }}
            </span>
          </div>
        </div>
        <span class="font-mono text-[11px] font-black text-slate-950 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
          REPORTE: #{{ controlData.report_id || controlData.cirugia_id || '-' }}
        </span>
      </div>

      <!-- CONTENEDOR DE FOTOGRAFÍAS (2 POR HOJA A4) -->
      <div class="py-2 space-y-3 my-auto flex-1 flex flex-col justify-center">
        <div 
          v-for="img in page.items" 
          :key="img.id || img.globalIndex"
          class="border border-slate-300 rounded-lg bg-slate-50 relative shadow-2xs overflow-hidden flex flex-col items-center justify-center p-2 transition-all"
          :style="{
            height: img.size === 'compacto' ? '98mm' : '118mm',
            maxHeight: img.size === 'compacto' ? '98mm' : '118mm',
            boxSizing: 'border-box'
          }"
        >
          <!-- Barra interactiva visible solo en edición -->
          <div v-if="editable" class="absolute top-2 left-2 flex items-center gap-1.5 z-10">
            <span class="px-2 py-0.5 rounded bg-slate-950 text-white font-mono text-[9px] font-black shadow-xs">
              FOTO #{{ img.globalIndex }} DE {{ imagenes.length }}
            </span>

            <span 
              v-if="img.hasAnnotations" 
              class="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-black shadow-xs flex items-center gap-1"
            >
              <span>🔍</span>
              <span>MARCAS</span>
            </span>

            <!-- Botón interactivo de rotación -->
            <button 
              type="button" 
              @click="rotateImg(img)"
              class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-extrabold uppercase transition-all shadow-xs cursor-pointer"
              title="Girar foto 90°"
            >
              🔄 {{ img.rotation || 0 }}°
            </button>

            <!-- Botón interactivo de tamaño -->
            <button 
              type="button" 
              @click="toggleImgSize(img)"
              class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase transition-all shadow-xs cursor-pointer hover:scale-105"
              :class="img.size === 'compacto' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'"
              title="Alternar tamaño de imagen"
            >
              {{ img.size === 'compacto' ? '📦 Compacto' : '🔍 Grande (+15%)' }}
            </button>

            <!-- Botón para abrir anotador -->
            <button 
              type="button" 
              @click="$emit('annotate-image', img)"
              class="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-[9px] font-extrabold uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1"
              title="Marcar o editar anotaciones en esta foto"
            >
              <span>✏️ Anotar</span>
            </button>
          </div>

          <!-- Imagen con marcas SVG superpuestas (rotan juntas perfectamente) -->
          <div class="w-full h-full flex items-center justify-center pt-2 overflow-hidden">
            <div 
              class="relative inline-flex items-center justify-center max-w-full max-h-full transition-transform duration-200"
              :style="{
                transform: `rotate(${img.rotation || 0}deg)`,
                maxHeight: (img.rotation === 90 || img.rotation === 270) 
                  ? (img.size === 'compacto' ? '60mm' : '75mm') 
                  : (img.size === 'compacto' ? '82mm' : '106mm'),
                maxWidth: (img.rotation === 90 || img.rotation === 270) ? '70%' : '100%',
                width: 'auto',
                height: 'auto'
              }"
            >
              <img 
                :src="img.annotatedUrl || img.url" 
                :alt="`Fotografía de control ${img.globalIndex}`"
                class="rounded shadow-2xs block mx-auto my-auto cursor-pointer"
                @click="editable ? $emit('annotate-image', img) : null"
                :title="editable ? 'Haz clic para marcar o anotar faltantes en esta foto' : ''"
                style="max-width: 100%; max-height: 100%; object-fit: contain;"
              />

              <!-- Capa SVG de Anotaciones (actúa si la imagen no tiene dataUrl quemado) -->
              <svg 
                v-if="!img.annotatedUrl && img.annotations && img.annotations.length > 0"
                class="absolute inset-0 w-full h-full pointer-events-none"
                :viewBox="`0 0 ${img.naturalWidth || 1200} ${img.naturalHeight || 800}`"
                preserveAspectRatio="xMidYMid meet"
              >
                <template v-for="(s, sIdx) in img.annotations" :key="sIdx">
                  <!-- Círculo / Óvalo -->
                  <g v-if="s.type === 'circle'">
                    <ellipse 
                      :cx="s.centerX" 
                      :cy="s.centerY" 
                      :rx="s.radiusX" 
                      :ry="s.radiusY" 
                      :stroke="s.color" 
                      :stroke-width="s.strokeWidth * 2" 
                      fill="none" 
                    />
                    <ellipse 
                      :cx="s.centerX" 
                      :cy="s.centerY" 
                      :rx="s.radiusX" 
                      :ry="s.radiusY" 
                      :stroke="s.color === '#FFFFFF' ? '#000000' : '#FFFFFF'" 
                      :stroke-width="s.strokeWidth" 
                      stroke-dasharray="6,6"
                      fill="none" 
                    />
                  </g>

                  <!-- Flecha -->
                  <g v-else-if="s.type === 'arrow'">
                    <line 
                      :x1="s.startX" 
                      :y1="s.startY" 
                      :x2="s.endX" 
                      :y2="s.endY" 
                      :stroke="s.color" 
                      :stroke-width="s.strokeWidth * 2" 
                      stroke-linecap="round"
                    />
                    <polygon 
                      :points="getArrowHeadPoints(s)" 
                      :fill="s.color" 
                    />
                  </g>

                  <!-- Lápiz Libre -->
                  <path 
                    v-else-if="s.type === 'pencil'"
                    :d="getPencilPath(s.points)" 
                    :stroke="s.color" 
                    :stroke-width="s.strokeWidth * 2" 
                    fill="none" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                  />

                  <!-- Texto / Etiqueta -->
                  <g v-else-if="s.type === 'text'">
                    <rect 
                      :x="s.x - 6" 
                      :y="s.y - 6" 
                      :width="(s.text.length * (s.strokeWidth * 4.5 || 16)) + 16" 
                      :height="(s.strokeWidth * 5.5 || 24) + 12" 
                      rx="6" 
                      fill="rgba(15, 23, 42, 0.9)" 
                      :stroke="s.color" 
                      stroke-width="2" 
                    />
                    <text 
                      :x="s.x" 
                      :y="s.y + (s.strokeWidth * 4.5 || 18)" 
                      :fill="s.color" 
                      font-weight="bold" 
                      :font-size="Math.max(16, (s.strokeWidth || 4) * 4.5)" 
                      font-family="sans-serif"
                    >
                      {{ s.text }}
                    </text>
                  </g>
                </template>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN DE NOTA / OBSERVACIÓN ESPECÍFICA DE ESTA HOJA -->
      <div v-if="editable || getPageNote(page.pageIndex)" class="mb-2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs">
        <div class="flex items-center justify-between font-bold text-slate-900 text-[10px] uppercase mb-1">
          <span>NOTA / OBSERVACIÓN DE LA HOJA {{ page.pageIndex }}</span>
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
        <span class="font-black text-slate-900">DISTRICORR LOGÍSTICA — REG03-02-01-D</span>
        <span class="font-black text-slate-900">PÁGINA {{ page.pageIndex }} DE {{ totalPages }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  controlData: {
    type: Object,
    required: true
  },
  imagenes: {
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

const emit = defineEmits(['toggle-image-size', 'annotate-image', 'rotate-image']);

const toggleImgSize = (img) => {
  img.size = img.size === 'compacto' ? 'grande' : 'compacto';
  emit('toggle-image-size', img);
};

const rotateImg = (img) => {
  img.rotation = ((img.rotation || 0) + 90) % 360;
  console.log('[ReporteDevolucionPDF] Foto rotada a:', img.rotation, 'grados');
  emit('rotate-image', img);
};

const annotatedCount = computed(() => {
  return props.imagenes.filter(i => i.hasAnnotations).length;
});

const imagePages = computed(() => {
  const pages = [];
  const total = props.imagenes.length;
  for (let i = 0; i < total; i += 2) {
    const pageItems = props.imagenes.slice(i, i + 2).map((img, subIdx) => ({
      ...img,
      globalIndex: i + subIdx + 1
    }));
    pages.push({
      pageIndex: Math.floor(i / 2) + 2,
      items: pageItems
    });
  }
  return pages;
});

const totalPages = computed(() => 1 + imagePages.value.length);

const getPageNote = (pageIdx) => {
  return props.notasPaginas[pageIdx] || '';
};

const getArrowHeadPoints = (s) => {
  const headLen = Math.max(16, (s.strokeWidth || 4) * 4);
  const angle = Math.atan2(s.endY - s.startY, s.endX - s.startX);
  const p1x = s.endX - headLen * Math.cos(angle - Math.PI / 6);
  const p1y = s.endY - headLen * Math.sin(angle - Math.PI / 6);
  const p2x = s.endX - headLen * Math.cos(angle + Math.PI / 6);
  const p2y = s.endY - headLen * Math.sin(angle + Math.PI / 6);
  return `${s.endX},${s.endY} ${p1x},${p1y} ${p2x},${p2y}`;
};

const getPencilPath = (points) => {
  if (!points || points.length < 2) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

const getStatusLabel = (status) => {
  if (status === 'ok') return 'Todo OK / Completa';
  if (status === 'revision') return 'En Revisión / Pendiente';
  if (status === 'problemas') return 'Con Faltantes / Problemas';
  return 'Control Registrado';
};

const getStatusBadgeClass = (status) => {
  if (status === 'ok') return 'bg-emerald-100 text-emerald-900 border border-emerald-300';
  if (status === 'revision') return 'bg-amber-100 text-amber-900 border border-amber-300';
  if (status === 'problemas') return 'bg-rose-100 text-rose-900 border border-rose-300';
  return 'bg-slate-200 text-slate-800';
};
</script>

<style scoped>
@media print {
  body {
    background: white !important;
    color: black !important;
  }
  .page-break {
    page-break-before: always !important;
    break-before: page !important;
  }
  .a4-page {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 15mm !important;
    min-height: 100vh !important;
  }
}
</style>
