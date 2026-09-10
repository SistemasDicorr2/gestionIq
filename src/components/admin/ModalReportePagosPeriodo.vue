<!-- src/components/admin/ModalReportePagosPeriodo.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm print:hidden">
      <div 
        class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in duration-150"
        @click.stop
      >
        <!-- Encabezado del Modal -->
        <header class="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg shadow-xs">
              📄
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">DISTRICORR · GESTIÓN IQ</span>
                <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                  REPORTE OFICIAL
                </span>
              </div>
              <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                Reporte Ejecutivo de Pagos por Período
              </h2>
            </div>
          </div>
          <button 
            type="button"
            @click="emit('close')" 
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            ✕
          </button>
        </header>

        <!-- Cuerpo del Modal: Layout 2 Columnas (Filtros a la izquierda, Desglose a la derecha) -->
        <main class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-y-auto lg:overflow-hidden text-slate-700 dark:text-slate-300">
          
          <!-- COLUMNA IZQUIERDA (5 cols): Configuración de Período e Instrumentador -->
          <div class="lg:col-span-5 flex flex-col space-y-4">
            
            <!-- 1. Período -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  1. Período:
                </label>
                <span class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[200px]" :title="periodoLabelFinal">
                  {{ periodoLabelFinal }}
                </span>
              </div>

              <!-- Píldoras de Presets -->
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="setPeriodoPreset('semana-en-curso')"
                  :class="[
                    'p-2 rounded-xl text-left border transition-all text-xs cursor-pointer',
                    periodoPreset === 'semana-en-curso'
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  ]"
                >
                  <div class="text-[11px] font-bold">Semana en Curso</div>
                  <div class="text-[10px] text-slate-400">Sábado a Hoy</div>
                </button>

                <button
                  type="button"
                  @click="setPeriodoPreset('semana-anterior')"
                  :class="[
                    'p-2 rounded-xl text-left border transition-all text-xs cursor-pointer',
                    periodoPreset === 'semana-anterior'
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  ]"
                >
                  <div class="text-[11px] font-bold">Semana Anterior</div>
                  <div class="text-[10px] text-slate-400">Sábado a Viernes</div>
                </button>

                <button
                  type="button"
                  @click="setPeriodoPreset('por-mes')"
                  :class="[
                    'p-2 rounded-xl text-left border transition-all text-xs cursor-pointer',
                    periodoPreset === 'por-mes'
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  ]"
                >
                  <div class="text-[11px] font-bold">Por Mes</div>
                  <div class="text-[10px] text-slate-400">Mes calendario</div>
                </button>

                <button
                  type="button"
                  @click="setPeriodoPreset('personalizado')"
                  :class="[
                    'p-2 rounded-xl text-left border transition-all text-xs cursor-pointer',
                    periodoPreset === 'personalizado'
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  ]"
                >
                  <div class="text-[11px] font-bold">Personalizado</div>
                  <div class="text-[10px] text-slate-400">Rango libre</div>
                </button>
              </div>

              <!-- Sub-panel Mes -->
              <div v-if="periodoPreset === 'por-mes'" class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase">Mes:</label>
                  <select v-model="selectedMonth" @change="updateMonthRange" class="w-full mt-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium">
                    <option v-for="(m, idx) in monthsList" :key="idx" :value="idx">{{ m }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase">Año:</label>
                  <select v-model="selectedYear" @change="updateMonthRange" class="w-full mt-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium">
                    <option :value="2025">2025</option>
                    <option :value="2026">2026</option>
                    <option :value="2027">2027</option>
                  </select>
                </div>
              </div>

              <!-- Sub-panel Personalizado -->
              <div v-if="periodoPreset === 'personalizado'" class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase">Desde:</label>
                  <input type="date" v-model="customStartDate" class="w-full mt-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase">Hasta:</label>
                  <input type="date" v-model="customEndDate" class="w-full mt-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium" />
                </div>
              </div>
            </div>

            <!-- 2. Instrumentador Quirúrgico (Selector Compacto / Buscador) -->
            <div class="space-y-2 flex-1 flex flex-col">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  2. Instrumentador:
                </label>
                <button 
                  v-if="selectedDni !== 'todos'" 
                  @click="selectedDni = 'todos'" 
                  class="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Ver Todos
                </button>
              </div>

              <div class="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-2.5 space-y-2 shadow-xs flex-1 flex flex-col">
                <!-- Buscador rápido -->
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">🔍</span>
                  <input 
                    type="text" 
                    v-model="searchInstrumentador"
                    placeholder="Buscar por nombre o DNI..."
                    class="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                  <button v-if="searchInstrumentador" @click="searchInstrumentador = ''" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs">✕</button>
                </div>

                <!-- Lista compacta con scroll integrado -->
                <div class="max-h-48 overflow-y-auto space-y-1 pr-1 flex-1">
                  <!-- Opción Todos -->
                  <button
                    type="button"
                    @click="selectedDni = 'todos'"
                    :class="[
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer',
                      selectedDni === 'todos'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    ]"
                  >
                    <div class="flex items-center gap-1.5">
                      <span class="text-[11px]">👥</span>
                      <span class="font-bold">Todos los instrumentadores</span>
                    </div>
                    <span class="text-[10px] opacity-80">({{ availableInstrumentadores.length }})</span>
                  </button>

                  <!-- Cada Instrumentador -->
                  <button
                    v-for="inst in filteredInstrumentadores"
                    :key="inst.dni"
                    type="button"
                    @click="selectedDni = inst.dni"
                    :class="[
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer',
                      selectedDni === inst.dni
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    ]"
                  >
                    <div class="flex items-center gap-2 truncate pr-2">
                      <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" :class="selectedDni === inst.dni ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'">
                        {{ inst.iniciales }}
                      </span>
                      <span class="truncate">{{ inst.nombre }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0 text-[10px]">
                      <span :class="selectedDni === inst.dni ? 'text-blue-100' : 'text-slate-400'">DNI: {{ inst.dni }}</span>
                      <span v-if="inst.ordenesEnPeriodo > 0" class="px-1.5 py-0.2 rounded-full text-[9px] font-bold" :class="selectedDni === inst.dni ? 'bg-blue-800 text-blue-100' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'">
                        {{ inst.ordenesEnPeriodo }}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Email Automatizado (Resend) Toggle / Info -->
            <div class="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/70 dark:border-blue-900/50 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                <span>📧</span>
                <span class="font-medium text-[11px]">Envío automático a administración disponible</span>
              </div>
              <button 
                type="button" 
                @click="isEmailModalOpen = !isEmailModalOpen"
                class="text-[11px] font-bold text-blue-700 dark:text-blue-300 underline cursor-pointer"
              >
                {{ isEmailModalOpen ? 'Ocultar' : 'Configurar Correo' }}
              </button>
            </div>

            <!-- Formulario de envío por Email (si está desplegado) -->
            <div v-if="isEmailModalOpen" class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in text-xs">
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Enviar PDF a:</label>
              <input 
                type="email" 
                v-model="destinatarioEmail" 
                placeholder="ej: contable@districorr.com.ar" 
                class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium outline-none text-xs"
              />
              <button
                type="button"
                @click="enviarReportePorEmail"
                :disabled="isSendingEmail || matchingOrders.length === 0"
                class="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{{ isSendingEmail ? 'Enviando por Resend...' : 'Enviar Reporte Oficial por Email' }}</span>
              </button>
            </div>

          </div>

          <!-- COLUMNA DERECHA (7 cols): Métricas y Desglose de Órdenes a Pantalla Completa -->
          <div class="lg:col-span-7 flex flex-col space-y-4 h-full">
            
            <!-- 3 Tarjetas KPI Compactas -->
            <div class="grid grid-cols-3 gap-2 shrink-0">
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center">
                <span class="block text-[9px] font-bold text-slate-400 uppercase">Órdenes / Pagos</span>
                <span class="text-base font-black text-slate-900 dark:text-white block mt-0.5">{{ matchingOrders.length }}</span>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center">
                <span class="block text-[9px] font-bold text-slate-400 uppercase">Cirugías</span>
                <span class="text-base font-black text-slate-900 dark:text-white block mt-0.5">{{ totalCirugiasCount }}</span>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center">
                <span class="block text-[9px] font-bold text-slate-400 uppercase">Monto Total</span>
                <span class="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">{{ formatCurrency(totalMontoLiquidado) }}</span>
              </div>
            </div>

            <!-- Desglose de Órdenes con Altura Completa y Scroll Único -->
            <div class="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 flex flex-col overflow-hidden shadow-xs">
              <div class="p-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <h3 class="font-bold text-slate-700 dark:text-slate-200">
                  Desglose de Órdenes a Incluir en el Reporte ({{ matchingOrders.length }})
                </h3>
                <span class="text-[10px] text-slate-400 font-medium">
                  {{ selectedDni === 'todos' ? 'Consolidado General' : 'Filtrado' }}
                </span>
              </div>

              <!-- Lista con scroll limpio -->
              <div class="p-3 overflow-y-auto space-y-2 flex-1 max-h-[380px]">
                <div v-if="matchingOrders.length === 0" class="py-12 text-center text-slate-400 text-xs">
                  No hay órdenes de pago para el período y filtros seleccionados.
                </div>

                <div 
                  v-for="orden in matchingOrders" 
                  :key="orden.id"
                  class="p-3 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-xs"
                >
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-blue-700 dark:text-blue-400">Orden #{{ orden.id }}</span>
                      <span class="text-slate-300 dark:text-slate-600">·</span>
                      <span class="text-slate-500 dark:text-slate-400 text-[11px]">{{ formatDate(orden.fecha_emision) }}</span>
                    </div>
                    <div class="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                      {{ getNombreInstrumentadorClean(orden) }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="font-black text-slate-900 dark:text-white">
                      {{ formatCurrency(orden.monto_total_general || orden.monto_total || 0) }}
                    </div>
                    <div class="text-[10px] text-slate-400">
                      {{ orden.cantidad_cirugias || orden.cirugias?.length || 1 }} cx
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>

        <!-- Pie del Modal con Acciones -->
        <footer class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <button 
            type="button" 
            @click="emit('close')"
            class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>

          <div class="flex items-center gap-3">
            <button 
              type="button" 
              @click="ejecutarDescargaPDF"
              :disabled="matchingOrders.length === 0 || isGenerating"
              class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg v-if="isGenerating" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{{ isGenerating ? 'Generando PDF...' : 'Descargar Reporte PDF Ejecutivo' }}</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useReportePagosPDF } from '../../composables/useReportePagosPDF';
import { useToasts } from '../../composables/useToasts';
import { renderEmailReportePagosHtml } from '../../utils/reporteEmailTemplate';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  historial: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

const { generarReporteListadoCompletoPagos } = useReportePagosPDF();
const { showSuccessToast, showErrorToast } = useToasts();

const periodoPreset = ref('semana-en-curso');
const selectedDni = ref('todos');
const searchInstrumentador = ref('');
const customStartDate = ref('');
const customEndDate = ref('');
const isGenerating = ref(false);

const isEmailModalOpen = ref(false);
const destinatarioEmail = ref('contable@districorr.com.ar');
const isSendingEmail = ref(false);

const monthsList = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());

// Helpers para parsear arreglos o cadenas delimitadas por comas
const parseDnis = (dnisVal) => {
  if (!dnisVal) return [];
  if (Array.isArray(dnisVal)) {
    return dnisVal.flatMap(d => typeof d === 'string' ? d.split(',') : [String(d)])
      .map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof dnisVal === 'string') {
    return dnisVal.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [String(dnisVal).trim()].filter(Boolean);
};

const parseNombres = (nombresVal) => {
  if (!nombresVal) return [];
  if (Array.isArray(nombresVal)) {
    return nombresVal.flatMap(n => typeof n === 'string' ? n.split(',') : [String(n)])
      .map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof nombresVal === 'string') {
    return nombresVal.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [String(nombresVal).trim()].filter(Boolean);
};

// Catálogo limpio de instrumentadores desde la base de datos
const dbInstrumentadoresMap = ref(new Map());

const fetchInstrumentadoresDb = async () => {
  try {
    const { data, error } = await supabase
      .from('instrumentadores')
      .select('dni, nombre_completo, nombre');

    if (!error && data) {
      const map = new Map();
      data.forEach(item => {
        const dniClean = String(item.dni || '').trim();
        const nameClean = (item.nombre_completo || item.nombre || '').trim();
        if (dniClean && nameClean) {
          map.set(dniClean, nameClean);
        }
      });
      dbInstrumentadoresMap.value = map;
    }
  } catch (e) {
    console.error('Error al cargar catalogo de instrumentadores:', e);
  }
};

onMounted(() => {
  fetchInstrumentadoresDb();
  setPeriodoPreset('semana-en-curso');
});

watch(() => props.show, (val) => {
  if (val) {
    fetchInstrumentadoresDb();
    setPeriodoPreset(periodoPreset.value || 'semana-en-curso');
  }
});

// Obtener lista limpia de instrumentadores disponibles emparejando por índice
const availableInstrumentadores = computed(() => {
  const map = new Map();

  props.historial.forEach(orden => {
    const dnis = parseDnis(orden.instrumentadores_dnis);
    const nombres = parseNombres(orden.instrumentadores_nombres);

    dnis.forEach((dniStr, idx) => {
      if (dniStr && !map.has(dniStr)) {
        let cleanName = dbInstrumentadoresMap.value.get(dniStr);
        if (!cleanName && nombres[idx]) {
          cleanName = nombres[idx];
        }
        if (!cleanName) {
          cleanName = `Instrumentador (${dniStr})`;
        }

        const initials = cleanName
          .split(' ')
          .filter(Boolean)
          .map(w => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'IQ';

        map.set(dniStr, {
          dni: dniStr,
          nombre: cleanName,
          iniciales: initials,
          ordenesEnPeriodo: 0
        });
      } else if (dniStr && map.has(dniStr)) {
        const existing = map.get(dniStr);
        if (existing.nombre.startsWith('Instrumentador (') && nombres[idx]) {
          existing.nombre = nombres[idx];
          existing.iniciales = nombres[idx]
            .split(' ')
            .filter(Boolean)
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'IQ';
        }
      }
    });
  });

  // Calcular cantidad de órdenes en el período para cada uno
  const result = Array.from(map.values());
  result.forEach(inst => {
    inst.ordenesEnPeriodo = matchingOrdersBase.value.filter(o => {
      const dnis = parseDnis(o.instrumentadores_dnis);
      return dnis.includes(inst.dni);
    }).length;
  });

  return result.sort((a, b) => a.nombre.localeCompare(b.nombre));
});

// Nombre del instrumentador seleccionado actualmente
const selectedInstrumentadorName = computed(() => {
  if (selectedDni.value === 'todos') return 'Todos los instrumentadores';
  const inst = availableInstrumentadores.value.find(i => i.dni === selectedDni.value);
  return inst?.nombre || dbInstrumentadoresMap.value.get(selectedDni.value) || selectedDni.value;
});

// Filtrar instrumentadores en el buscador del modal
const filteredInstrumentadores = computed(() => {
  const q = searchInstrumentador.value.trim().toLowerCase();
  if (!q) return availableInstrumentadores.value;
  return availableInstrumentadores.value.filter(i => 
    i.nombre.toLowerCase().includes(q) || String(i.dni).includes(q)
  );
});

// Función de preset de períodos
const setPeriodoPreset = (type) => {
  periodoPreset.value = type;
  const now = new Date();

  if (type === 'semana-en-curso') {
    const currentDay = now.getDay(); // 0 Dom, 1 Lun, ..., 6 Sab
    const daysSinceSaturday = (currentDay + 1) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() - daysSinceSaturday);

    customStartDate.value = saturday.toISOString().split('T')[0];
    customEndDate.value = now.toISOString().split('T')[0];
  } else if (type === 'semana-anterior') {
    const currentDay = now.getDay();
    const daysSinceSaturday = (currentDay + 1) % 7;
    const currentSaturday = new Date(now);
    currentSaturday.setDate(now.getDate() - daysSinceSaturday);

    const prevSaturday = new Date(currentSaturday);
    prevSaturday.setDate(currentSaturday.getDate() - 7);

    const prevFriday = new Date(currentSaturday);
    prevFriday.setDate(currentSaturday.getDate() - 1);

    customStartDate.value = prevSaturday.toISOString().split('T')[0];
    customEndDate.value = prevFriday.toISOString().split('T')[0];
  } else if (type === 'por-mes') {
    updateMonthRange();
  } else if (type === 'personalizado') {
    if (!customStartDate.value || !customEndDate.value) {
      updateMonthRange();
    }
  }
};

const updateMonthRange = () => {
  const start = new Date(selectedYear.value, selectedMonth.value, 1);
  const end = new Date(selectedYear.value, selectedMonth.value + 1, 0);
  customStartDate.value = start.toISOString().split('T')[0];
  customEndDate.value = end.toISOString().split('T')[0];
};

// Filtrado de órdenes por período únicamente (para métricas base)
const matchingOrdersBase = computed(() => {
  let list = props.historial || [];

  if (customStartDate.value) {
    list = list.filter(o => {
      const d = (o.fecha_emision || '').substring(0, 10);
      return d >= customStartDate.value;
    });
  }
  if (customEndDate.value) {
    list = list.filter(o => {
      const d = (o.fecha_emision || '').substring(0, 10);
      return d <= customEndDate.value;
    });
  }

  return list;
});

// Filtrado de órdenes por período y por instrumentador seleccionado
const matchingOrders = computed(() => {
  let list = matchingOrdersBase.value;

  if (selectedDni.value !== 'todos') {
    list = list.filter(o => {
      const dnis = parseDnis(o.instrumentadores_dnis);
      return dnis.includes(String(selectedDni.value).trim());
    });
  }

  return list;
});

const totalCirugiasCount = computed(() => {
  return matchingOrders.value.reduce((acc, o) => {
    return acc + (o.cantidad_cirugias || o.cirugias?.length || 1);
  }, 0);
});

const totalMontoLiquidado = computed(() => {
  return matchingOrders.value.reduce((sum, o) => {
    const val = parseFloat(o.monto_total_general || o.monto_total || 0);
    return sum + (!isNaN(val) ? val : 0);
  }, 0);
});

const periodoLabelFinal = computed(() => {
  if (periodoPreset.value === 'semana-en-curso') {
    return `Semana en curso (${formatDate(customStartDate.value)} al ${formatDate(customEndDate.value)})`;
  }
  if (periodoPreset.value === 'semana-anterior') {
    return `Semana anterior (${formatDate(customStartDate.value)} al ${formatDate(customEndDate.value)})`;
  }
  if (periodoPreset.value === 'por-mes') {
    return `${monthsList[selectedMonth.value]} ${selectedYear.value} (${formatDate(customStartDate.value)} al ${formatDate(customEndDate.value)})`;
  }
  if (customStartDate.value && customEndDate.value) {
    return `Rango personalizado (${formatDate(customStartDate.value)} al ${formatDate(customEndDate.value)})`;
  }
  return 'Período personalizado';
});

const getNombreInstrumentadorClean = (orden) => {
  if (selectedDni.value !== 'todos') {
    const instObj = availableInstrumentadores.value.find(i => i.dni === selectedDni.value);
    return instObj?.nombre || dbInstrumentadoresMap.value.get(selectedDni.value) || `Instrumentador (${selectedDni.value})`;
  }
  const dnis = parseDnis(orden.instrumentadores_dnis);
  const nombres = parseNombres(orden.instrumentadores_nombres);
  const names = dnis.map((d, idx) => {
    return dbInstrumentadoresMap.value.get(d) || nombres[idx] || d;
  }).filter(Boolean);
  return names.length > 0 ? names.join(', ') : 'Instrumentador';
};

const formatDate = (val) => {
  if (!val) return '-';
  const parts = String(val).substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return val;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$ 0';
  return `$ ${Number(amount).toLocaleString('es-AR')}`;
};

const ejecutarDescargaPDF = async () => {
  if (matchingOrders.value.length === 0) return;
  isGenerating.value = true;

  try {
    const orderDetailsPromises = matchingOrders.value.map(async (o) => {
      const { data } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: o.id });
      return data || o;
    });

    const detailedOrders = await Promise.all(orderDetailsPromises);

    let instFiltro = null;
    if (selectedDni.value !== 'todos') {
      const instObj = availableInstrumentadores.value.find(i => String(i.dni) === String(selectedDni.value));
      instFiltro = {
        dni: selectedDni.value,
        nombre: instObj?.nombre || 'Instrumentador Quirúrgico'
      };
    }

    generarReporteListadoCompletoPagos({
      ordenesDetalladas: detailedOrders,
      periodoLabel: periodoLabelFinal.value,
      instrumentadorFiltro: instFiltro
    });

    showSuccessToast('Listado oficial de pagos descargado exitosamente en PDF.');
    emit('close');
  } catch (err) {
    console.error('Error al generar reporte de período:', err);
    showErrorToast(err, 'No se pudo generar el reporte PDF.');
  } finally {
    isGenerating.value = false;
  }
};

const enviarReportePorEmail = async () => {
  if (!destinatarioEmail.value) {
    showErrorToast('Por favor ingresa un correo electrónico de destino.');
    return;
  }
  isSendingEmail.value = true;
  try {
    // 1. Obtener detalles de órdenes
    const orderDetailsPromises = matchingOrders.value.map(async (o) => {
      const { data } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: o.id });
      return data || o;
    });
    const detailedOrders = await Promise.all(orderDetailsPromises);

    let instFiltro = null;
    if (selectedDni.value !== 'todos') {
      const instObj = availableInstrumentadores.value.find(i => String(i.dni) === String(selectedDni.value));
      instFiltro = {
        dni: selectedDni.value,
        nombre: instObj?.nombre || 'Instrumentador Quirúrgico'
      };
    }

    // 2. Generar el documento PDF en Base64 sin disparar descarga en el navegador
    const pdfResult = generarReporteListadoCompletoPagos({
      ordenesDetalladas: detailedOrders,
      periodoLabel: periodoLabelFinal.value,
      instrumentadorFiltro: instFiltro,
      download: false
    });

    const base64Content = pdfResult?.base64 || '';
    const pdfFilename = pdfResult?.filename || `Reporte_Pagos_Consolidado_${periodoLabelFinal.value.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const emailHtml = renderEmailReportePagosHtml({
      periodoLabel: periodoLabelFinal.value,
      montoTotalStr: formatCurrency(totalMontoLiquidado.value),
      totalOrdenes: matchingOrders.value.length,
      totalCirugias: totalCirugiasCount.value,
      filename: pdfFilename,
      alcanceLabel: selectedInstrumentadorName.value
    });

    const emailPayload = {
      to: destinatarioEmail.value,
      subject: `Reporte de Pagos · Districorr (${formatCurrency(totalMontoLiquidado.value)})`,
      html: emailHtml,
      attachments: base64Content ? [
        {
          filename: pdfFilename,
          content: base64Content
        }
      ] : []
    };

    const { error: sendError } = await supabase.functions.invoke('send-email', {
      body: emailPayload
    });

    if (sendError) throw sendError;

    showSuccessToast(`Reporte oficial enviado con PDF adjunto a ${destinatarioEmail.value}.`);
    isEmailModalOpen.value = false;
  } catch (err) {
    console.error('Error al enviar email:', err);
    showErrorToast(err, 'No se pudo enviar el correo con el reporte adjunto.');
  } finally {
    isSendingEmail.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
