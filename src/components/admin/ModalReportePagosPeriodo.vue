<!-- src/components/admin/ModalReportePagosPeriodo.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm print:hidden">
      <div 
        class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in duration-150"
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
          
          <!-- Selector de Filtros -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Selector de Período Preset -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Período a Consultar:
              </label>
              <select 
                v-model="periodoPreset" 
                @change="onPeriodoChange"
                class="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="esta-semana">Esta semana (Lunes a Domingo)</option>
                <option value="semana-pasada">Semana anterior cerrada</option>
                <option value="ultimos-30-dias">Últimos 30 días</option>
                <option value="mes-actual">Mes actual</option>
                <option value="mes-anterior">Mes anterior</option>
                <option value="todos">Todo el historial (inicio a actualidad)</option>
                <option value="personalizado">Personalizado (rango de fechas)</option>
              </select>
            </div>

            <!-- Selector de Instrumentador -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Instrumentador Quirúrgico:
              </label>
              <select 
                v-model="selectedDni" 
                class="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="todos">Todos los instrumentadores</option>
                <option v-for="inst in availableInstrumentadores" :key="inst.dni" :value="inst.dni">
                  {{ inst.nombre }} (DNI: {{ inst.dni }})
                </option>
              </select>
            </div>

          </div>

          <!-- Rango Personalizado (si se seleccionó "personalizado") -->
          <div v-if="periodoPreset === 'personalizado'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Fecha Desde:</label>
              <input 
                type="date" 
                v-model="customStartDate" 
                class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Fecha Hasta:</label>
              <input 
                type="date" 
                v-model="customEndDate" 
                class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none"
              />
            </div>
          </div>

          <!-- Tarjetas KPI de Resumen Previas a la Descarga -->
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

          <!-- Previsualización de Órdenes a Incluir -->
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
              No hay pagos u órdenes registradas en el período seleccionado.
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
                    {{ orden.instrumentadores_nombres || 'Instrumentador no especificado' }}
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

const { generarReportePagos } = useReportePagosPDF();
const { showSuccessToast, showErrorToast } = useToasts();

const periodoPreset = ref('esta-semana');
const selectedDni = ref('todos');
const customStartDate = ref('');
const customEndDate = ref('');
const isGenerating = ref(false);

const availableInstrumentadores = computed(() => {
  const map = new Map();
  props.historial.forEach(orden => {
    let dnis = orden.instrumentadores_dnis || [];
    let nombres = orden.instrumentadores_nombres || '';

    if (!Array.isArray(dnis) && dnis) dnis = [dnis];
    if (Array.isArray(nombres)) nombres = nombres.join(', ');

    dnis.forEach(dni => {
      const dniStr = String(dni).trim();
      if (dniStr && !map.has(dniStr)) {
        map.set(dniStr, {
          dni: dniStr,
          nombre: nombres || `Instrumentador (${dniStr})`
        });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
});

const onPeriodoChange = () => {
  const now = new Date();
  if (periodoPreset.value === 'esta-semana') {
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    customStartDate.value = monday.toISOString().split('T')[0];
    customEndDate.value = sunday.toISOString().split('T')[0];
  } else if (periodoPreset.value === 'semana-pasada') {
    const day = now.getDay() || 7;
    const prevMonday = new Date(now);
    prevMonday.setDate(now.getDate() - day - 6);
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    customStartDate.value = prevMonday.toISOString().split('T')[0];
    customEndDate.value = prevSunday.toISOString().split('T')[0];
  } else if (periodoPreset.value === 'mes-actual') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    customStartDate.value = start.toISOString().split('T')[0];
    customEndDate.value = end.toISOString().split('T')[0];
  } else if (periodoPreset.value === 'mes-anterior') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    customStartDate.value = start.toISOString().split('T')[0];
    customEndDate.value = end.toISOString().split('T')[0];
  } else if (periodoPreset.value === 'ultimos-30-dias') {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    customStartDate.value = start.toISOString().split('T')[0];
    customEndDate.value = now.toISOString().split('T')[0];
  } else if (periodoPreset.value === 'todos') {
    customStartDate.value = '';
    customEndDate.value = '';
  }
};

onMounted(onPeriodoChange);

watch(() => props.show, (val) => {
  if (val) {
    onPeriodoChange();
  }
});

const matchingOrders = computed(() => {
  let list = props.historial || [];

  // 1. Filtrar por rango de fecha de emisión
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

  // 2. Filtrar por instrumentador
  if (selectedDni.value !== 'todos') {
    list = list.filter(o => {
      let dnis = o.instrumentadores_dnis || [];
      if (!Array.isArray(dnis)) dnis = [dnis];
      return dnis.some(d => String(d).trim() === String(selectedDni.value).trim());
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
  if (periodoPreset.value === 'esta-semana') return 'Esta semana';
  if (periodoPreset.value === 'semana-pasada') return 'Semana anterior cerrada';
  if (periodoPreset.value === 'mes-actual') return 'Mes actual';
  if (periodoPreset.value === 'mes-anterior') return 'Mes anterior';
  if (periodoPreset.value === 'todos') return 'Período personalizado (inicio a actualidad)';
  if (customStartDate.value && customEndDate.value) {
    return `Período personalizado (${formatDate(customStartDate.value)} al ${formatDate(customEndDate.value)})`;
  }
  return 'Período personalizado';
});

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

    // 2. Si se seleccionó un Instrumentador específico
    if (selectedDni.value !== 'todos') {
      const instObj = availableInstrumentadores.value.find(i => String(i.dni) === String(selectedDni.value));
      const targetNombre = instObj?.nombre || 'Instrumentador Quirúrgico';

      // Construir liquidaciones para este instrumentador
      const liquidaciones = [];
      detailedOrders.forEach(det => {
        const pagos = det.pagos_instrumentadores || det.pagos || [];
        const pagoInst = pagos.find(p => String(p.instrumentador_dni) === String(selectedDni.value));
        if (pagoInst) {
          liquidaciones.push({
            orden_de_pago_id: det.id,
            fecha_pago: det.fecha_emision,
            monto_total: pagoInst.monto_total_instrumentador,
            cirugias: (pagoInst.cirugias || pagoInst.reportes || []).map(c => ({
              paciente: c.paciente,
              fecha_cirugia: c.fecha_cirugia,
              monto: c.monto_final !== undefined ? c.monto_final : (c.monto_a_pagar || 0)
            }))
          });
        }
      });

      generarReportePagos({
        instrumentador: {
          nombre_completo: targetNombre,
          dni: selectedDni.value
        },
        liquidaciones,
        periodoLabel: periodoLabelFinal.value
      });

      showSuccessToast(`Reporte PDF generado para ${targetNombre}.`);
    } else {
      // 3. Si seleccionó "Todos los instrumentadores", agrupar por cada instrumentador o consolidado
      const instMap = new Map();
      detailedOrders.forEach(det => {
        const pagos = det.pagos_instrumentadores || det.pagos || [];
        pagos.forEach(p => {
          const dniStr = String(p.instrumentador_dni).trim();
          if (!instMap.has(dniStr)) {
            instMap.set(dniStr, {
              instrumentador: {
                nombre_completo: p.instrumentador_nombre,
                dni: dniStr
              },
              liquidaciones: []
            });
          }
          instMap.get(dniStr).liquidaciones.push({
            orden_de_pago_id: det.id,
            fecha_pago: det.fecha_emision,
            monto_total: p.monto_total_instrumentador,
            cirugias: (p.cirugias || p.reportes || []).map(c => ({
              paciente: c.paciente,
              fecha_cirugia: c.fecha_cirugia,
              monto: c.monto_final !== undefined ? c.monto_final : (c.monto_a_pagar || 0)
            }))
          });
        });
      });

      const allGroups = Array.from(instMap.values());
      if (allGroups.length === 0) {
        throw new Error('No se encontraron detalles de liquidaciones en las órdenes seleccionadas.');
      }

      // Descargar el reporte para cada instrumentador activo en el período
      for (const group of allGroups) {
        generarReportePagos({
          instrumentador: group.instrumentador,
          liquidaciones: group.liquidaciones,
          periodoLabel: periodoLabelFinal.value
        });
      }

      showSuccessToast(`Se descargaron ${allGroups.length} reportes de pagos correspondientes al período.`);
    }

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
