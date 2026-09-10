<!-- src/components/admin/ModalReportePagosPeriodo.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm print:hidden">
      <div 
        class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in duration-150"
        @click.stop
      >
        <!-- Encabezado del Modal -->
        <header class="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
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

        <!-- Cuerpo del Modal -->
        <main class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          
          <!-- SECCIÓN 1: Selección de Período -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                1. Período a Consultar:
              </label>
              <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {{ periodoLabelFinal }}
              </span>
            </div>

            <!-- Botones / Píldoras de Presets Rápidos -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                @click="setPeriodoPreset('semana-en-curso')"
                :class="[
                  'p-2.5 rounded-xl text-left border transition-all text-xs font-medium cursor-pointer',
                  periodoPreset === 'semana-en-curso'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                <div class="text-[11px] font-bold">Semana en Curso</div>
                <div class="text-[10px] text-slate-400 mt-0.5">Sábado pasado a Hoy</div>
              </button>

              <button
                type="button"
                @click="setPeriodoPreset('semana-anterior')"
                :class="[
                  'p-2.5 rounded-xl text-left border transition-all text-xs font-medium cursor-pointer',
                  periodoPreset === 'semana-anterior'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                <div class="text-[11px] font-bold">Semana Anterior</div>
                <div class="text-[10px] text-slate-400 mt-0.5">Sábado a Viernes</div>
              </button>

              <button
                type="button"
                @click="setPeriodoPreset('por-mes')"
                :class="[
                  'p-2.5 rounded-xl text-left border transition-all text-xs font-medium cursor-pointer',
                  periodoPreset === 'por-mes'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                <div class="text-[11px] font-bold">Por Mes</div>
                <div class="text-[10px] text-slate-400 mt-0.5">Mes calendario</div>
              </button>

              <button
                type="button"
                @click="setPeriodoPreset('personalizado')"
                :class="[
                  'p-2.5 rounded-xl text-left border transition-all text-xs font-medium cursor-pointer',
                  periodoPreset === 'personalizado'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                <div class="text-[11px] font-bold">Personalizado</div>
                <div class="text-[10px] text-slate-400 mt-0.5">Rango de fechas</div>
              </button>
            </div>

            <!-- Sub-panel según modo de período -->
            <!-- Modo: Por Mes -->
            <div v-if="periodoPreset === 'por-mes'" class="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
              <div class="flex-1 min-w-[140px] space-y-1">
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Mes:</label>
                <select 
                  v-model="selectedMonth" 
                  @change="updateMonthRange"
                  class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none"
                >
                  <option v-for="(m, idx) in monthsList" :key="idx" :value="idx">
                    {{ m }}
                  </option>
                </select>
              </div>

              <div class="w-28 space-y-1">
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Año:</label>
                <select 
                  v-model="selectedYear" 
                  @change="updateMonthRange"
                  class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none"
                >
                  <option :value="2025">2025</option>
                  <option :value="2026">2026</option>
                  <option :value="2027">2027</option>
                </select>
              </div>

              <div class="text-xs text-slate-500 dark:text-slate-400 pt-3">
                Comprende desde el <strong class="text-slate-800 dark:text-white">{{ formatDate(customStartDate) }}</strong> hasta el <strong class="text-slate-800 dark:text-white">{{ formatDate(customEndDate) }}</strong>
              </div>
            </div>

            <!-- Modo: Personalizado (Desde / Hasta) -->
            <div v-if="periodoPreset === 'personalizado'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
              <div class="space-y-1">
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Fecha Desde:</label>
                <input 
                  type="date" 
                  v-model="customStartDate" 
                  class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Fecha Hasta:</label>
                <input 
                  type="date" 
                  v-model="customEndDate" 
                  class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none"
                />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: Selección y Búsqueda de Instrumentadores -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                2. Instrumentador Quirúrgico:
              </label>
              <div v-if="selectedDni !== 'todos'" class="flex items-center gap-2">
                <span class="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center gap-1.5 shadow-xs">
                  <span>Filtrando por: <strong>{{ selectedInstrumentadorName }}</strong></span>
                  <button @click="selectedDni = 'todos'" class="text-[11px] hover:text-red-500 font-bold ml-1 cursor-pointer" title="Quitar filtro">✕</button>
                </span>
              </div>
            </div>

            <!-- Buscador y Selector Refinado de Instrumentadores -->
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-3 space-y-2 shadow-xs">
              <!-- Input de búsqueda con botón de limpiar -->
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">🔍</span>
                <input 
                  type="text" 
                  v-model="searchInstrumentador"
                  placeholder="Buscar instrumentador por nombre o DNI..."
                  class="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  v-if="searchInstrumentador"
                  @click="searchInstrumentador = ''"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <!-- Lista de opciones seleccionables -->
              <div class="max-h-44 overflow-y-auto space-y-1 pr-1">
                <!-- Opción Todos -->
                <button
                  type="button"
                  @click="selectedDni = 'todos'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer',
                    selectedDni === 'todos'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="selectedDni === 'todos' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'">👥</span>
                    <span>Todos los instrumentadores</span>
                  </div>
                  <span class="text-[10px] opacity-80">({{ availableInstrumentadores.length }} profesionales)</span>
                </button>

                <!-- Listado filtrado de cada instrumentador -->
                <button
                  v-for="inst in filteredInstrumentadores"
                  :key="inst.dni"
                  type="button"
                  @click="selectedDni = inst.dni"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer',
                    selectedDni === inst.dni
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  ]"
                >
                  <div class="flex items-center gap-2 truncate pr-2">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" :class="selectedDni === inst.dni ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'">
                      {{ inst.iniciales }}
                    </span>
                    <span class="truncate font-semibold">{{ inst.nombre }}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0 text-[10px]">
                    <span :class="selectedDni === inst.dni ? 'text-blue-100' : 'text-slate-400'">DNI: {{ inst.dni }}</span>
                    <span v-if="inst.ordenesEnPeriodo > 0" class="px-1.5 py-0.5 rounded-full text-[9px] font-bold" :class="selectedDni === inst.dni ? 'bg-blue-800 text-blue-100' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'">
                      {{ inst.ordenesEnPeriodo }} {{ inst.ordenesEnPeriodo === 1 ? 'pago' : 'pagos' }}
                    </span>
                  </div>
                </button>

                <div v-if="filteredInstrumentadores.length === 0" class="p-3 text-center text-xs text-slate-400">
                  No se encontraron instrumentadores que coincidan con "{{ searchInstrumentador }}".
                </div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: Tarjetas KPI Previas a la Descarga -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center">
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Órdenes / Pagos</span>
              <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                {{ matchingOrders.length }}
              </span>
            </div>

            <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center">
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cirugías Abonadas</span>
              <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                {{ totalCirugiasCount }}
              </span>
            </div>

            <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center">
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monto Total</span>
              <span class="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {{ formatCurrency(totalMontoLiquidado) }}
              </span>
            </div>
          </div>

          <!-- SECCIÓN 4: Previsualización de Órdenes a Incluir -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Desglose de Órdenes de Pago ({{ matchingOrders.length }})
              </h3>
              <span class="text-[11px] text-slate-400 font-medium">
                {{ periodoLabelFinal }}
              </span>
            </div>

            <div v-if="matchingOrders.length === 0" class="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
              No hay pagos u órdenes registradas para los filtros seleccionados.
            </div>

            <div v-else class="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              <div 
                v-for="orden in matchingOrders" 
                :key="orden.id"
                class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-blue-700 dark:text-blue-400">
                      Orden #{{ orden.id }}
                    </span>
                    <span class="text-slate-400">·</span>
                    <span class="text-slate-500 dark:text-slate-400 font-medium">
                      {{ formatDate(orden.fecha_emision) }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    {{ getNombreInstrumentadorClean(orden) }}
                  </div>
                </div>

                <div class="text-right font-black text-slate-900 dark:text-white">
                  {{ formatCurrency(orden.monto_total_general || orden.monto_total || 0) }}
                </div>
              </div>
            </div>
          </div>

        </main>

        <!-- Pie del Modal con Acciones -->
        <footer class="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
          <button 
            type="button" 
            @click="emit('close')"
            class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>

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
        // 1. Buscar en DB map
        let cleanName = dbInstrumentadoresMap.value.get(dniStr);
        // 2. Si no está en DB map, usar el nombre parseado correspondiente del historial
        if (!cleanName && nombres[idx]) {
          cleanName = nombres[idx];
        }
        // 3. Fallback limpio
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
        // Si antes tenía fallback y ahora encontramos el nombre real, actualizar
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
  if (selectedDni.value === 'todos') return 'Todos';
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
    // Sábado pasado hasta hoy
    const currentDay = now.getDay(); // 0 Dom, 1 Lun, ..., 6 Sab
    const daysSinceSaturday = (currentDay + 1) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() - daysSinceSaturday);

    customStartDate.value = saturday.toISOString().split('T')[0];
    customEndDate.value = now.toISOString().split('T')[0];
  } else if (type === 'semana-anterior') {
    // Sábado de la semana anterior hasta el viernes pasado
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
    // 1. Obtener detalles de cada orden de pago incluida
    const orderDetailsPromises = matchingOrders.value.map(async (o) => {
      const { data } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: o.id });
      return data || o;
    });

    const detailedOrders = await Promise.all(orderDetailsPromises);

    // 2. Determinar si hay filtro de instrumentador específico
    let instFiltro = null;
    if (selectedDni.value !== 'todos') {
      const instObj = availableInstrumentadores.value.find(i => String(i.dni) === String(selectedDni.value));
      instFiltro = {
        dni: selectedDni.value,
        nombre: instObj?.nombre || 'Instrumentador Quirúrgico'
      };
    }

    // 3. Generar UN SOLO PDF con el listado consolidado completo
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
