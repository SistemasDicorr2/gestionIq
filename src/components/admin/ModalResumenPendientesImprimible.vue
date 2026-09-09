<!-- src/components/admin/ModalResumenPendientesImprimible.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div class="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        <!-- Header del Modal (Oculto al imprimir) -->
        <div class="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 flex items-center justify-center text-lg font-bold">
              📋
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                Reporte Ejecutivo de Pagos y Control de Logística
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Formato institucional de verificación de estado para liquidación de cirugías
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="imprimir"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <span>🖨️</span>
              <span>Imprimir Fichas</span>
            </button>

            <button
              type="button"
              @click="$emit('close')"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Cuerpo Imprimible (Diseño Estilo Email Ejecutivo) -->
        <div class="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible flex-1 space-y-6">
          
          <!-- Franja de Marca -->
          <div class="border-t-4 border-indigo-600 rounded-t-lg pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div class="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              DISTRICORR · GESTIÓN IQ
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Reporte Semanal de Pagos Pendientes
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Período evaluado: <strong>{{ periodTitle }}</strong> · Emitido el {{ fechaHoyStr }}
            </p>
          </div>

          <!-- Metricas de Resumen (Tarjetas Ejecutivas) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div class="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{{ totalSurgeries }}</span>
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">TOTAL ENVIADAS</span>
            </div>
            <div class="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
              <span class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{{ totalListasParaPago }}</span>
              <span class="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">LISTAS PARA PAGO</span>
            </div>
            <div class="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border" :class="totalProblemas > 0 ? 'border-red-200 dark:border-red-900/50 bg-red-50/30' : 'border-amber-200 dark:border-amber-900/50'">
              <div class="text-center">
                <span class="text-2xl font-extrabold font-mono" :class="totalProblemas > 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">
                  {{ totalProblemas > 0 ? totalProblemas : totalFaltaControl }}
                </span>
                <span class="block text-[10px] font-bold uppercase tracking-wider mt-1" :class="totalProblemas > 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">
                  {{ totalProblemas > 0 ? 'CON PROBLEMAS' : 'FALTA CONTROL' }}
                </span>
              </div>
            </div>
            <div class="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span class="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">{{ totalInstrumentadores }}</span>
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">PROFESIONALES</span>
            </div>
          </div>

          <!-- Tabla Detallada -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Detalle de Cirugías Enviadas Pendientes de Pago</span>
              <span class="text-slate-400 font-normal">Ordenadas por prioridad de control y antigüedad</span>
            </div>

            <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                    <th class="p-2.5 text-center w-8">#</th>
                    <th class="p-2.5">Paciente / Fecha Cx</th>
                    <th class="p-2.5">Instrumentador</th>
                    <th class="p-2.5">📦 Control Devolución</th>
                    <th class="p-2.5 text-center">Antigüedad</th>
                    <th class="p-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  <tr v-if="surgeries.length === 0">
                    <td colspan="6" class="p-6 text-center text-slate-400 italic">
                      No hay cirugías en estado enviado pendientes de pago en este período.
                    </td>
                  </tr>
                  <tr v-for="(s, idx) in sortedSurgeries" :key="s.id || idx" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td class="p-2.5 text-center font-bold text-slate-400 text-[10px]">{{ String(idx + 1).padStart(2, '0') }}</td>
                    <td class="p-2.5">
                      <div class="font-bold text-slate-900 dark:text-slate-100">{{ s.paciente || 'Sin especificar' }}</div>
                      <div class="text-[10px] text-slate-400 mt-0.5">Cx: {{ formatDate(s.fecha_cirugia) }}</div>
                    </td>
                    <td class="p-2.5 font-semibold text-slate-700 dark:text-slate-200">
                      {{ s.instrumentador_nombre || s.instrumentador || '-' }}
                    </td>
                    <td class="p-2.5">
                      <!-- Control OK -->
                      <div v-if="s.es_ok">
                        <span class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                          🟢 OK (Devolución)
                        </span>
                        <div v-if="s.control_fecha" class="text-[9px] text-slate-400">
                          {{ formatDateTime(s.control_fecha) }}
                        </div>
                      </div>
                      
                      <!-- Control Con Problemas -->
                      <div v-else-if="s.tiene_problemas">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                          🔴 Con Problemas
                        </span>
                        <div v-if="s.control_observaciones" class="text-[10px] font-bold text-red-600 dark:text-red-400 mt-0.5 max-w-xs">
                          Obs: {{ s.control_observaciones }}
                        </div>
                        <div v-if="s.control_fecha" class="text-[9px] text-slate-400">
                          {{ formatDateTime(s.control_fecha) }}
                        </div>
                      </div>

                      <!-- Control En Revisión -->
                      <div v-else-if="s.necesita_revision">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                          ⚠️ En Revisión
                        </span>
                        <div v-if="s.control_observaciones" class="text-[10px] font-medium text-amber-700 dark:text-amber-400 mt-0.5 max-w-xs">
                          Obs: {{ s.control_observaciones }}
                        </div>
                        <div v-if="s.control_fecha" class="text-[9px] text-slate-400">
                          {{ formatDateTime(s.control_fecha) }}
                        </div>
                      </div>

                      <!-- Sin Control -->
                      <div v-else>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          ⏳ Falta control
                        </span>
                      </div>
                    </td>
                    <td class="p-2.5 text-center font-bold">
                      <span :class="getAgingBadgeClass(s.dias_antiguedad)">
                        {{ s.dias_antiguedad !== null && s.dias_antiguedad !== undefined ? `${s.dias_antiguedad}d` : '-' }}
                      </span>
                    </td>
                    <td class="p-2.5 text-center font-bold">
                      <span v-if="s.es_ok || s.tiene_problemas || s.necesita_revision" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                        ✅ Listo para pago
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                        ⏳ Falta control
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pie de Pagina del Reporte -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
            DISTRICORR · Gestión IQ — Reporte Informativo de Cirugías Enviadas Pendientes de Pago.
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  surgeries: {
    type: Array,
    default: () => []
  },
  periodTitle: {
    type: String,
    default: 'Últimos 2 Meses'
  }
});

defineEmits(['close']);

const fechaHoyStr = computed(() => {
  const d = new Date();
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
});

const sortedSurgeries = computed(() => {
  return [...props.surgeries].sort((a, b) => {
    const score = (item) => item.es_ok ? 3 : (item.tiene_problemas || item.necesita_revision) ? 2 : 1;
    if (score(b) !== score(a)) return score(b) - score(a);
    return (b.dias_antiguedad || 0) - (a.dias_antiguedad || 0);
  });
});

const totalSurgeries = computed(() => props.surgeries.length);

const totalListasParaPago = computed(() => {
  return props.surgeries.filter(s => s.es_ok).length;
});

const totalProblemas = computed(() => {
  return props.surgeries.filter(s => s.tiene_problemas).length;
});

const totalFaltaControl = computed(() => {
  return props.surgeries.filter(s => !s.tiene_control).length;
});

const totalInstrumentadores = computed(() => {
  const set = new Set();
  props.surgeries.forEach(s => {
    const name = s.instrumentador_nombre || s.instrumentador;
    if (name) set.add(name);
  });
  return set.size;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const cleanStr = String(dateStr).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const formatDateTime = (isoStr) => {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' hs';
  } catch {
    return isoStr;
  }
};

const getAgingBadgeClass = (days) => {
  if (days === null || days === undefined) return 'text-slate-500';
  if (days >= 21) return 'px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-extrabold';
  if (days >= 14) return 'px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold';
  return 'px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium';
};

const imprimir = () => {
  window.print();
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
@media print {
  body * {
    visibility: hidden;
  }
  .print\:static, .print\:static * {
    visibility: visible;
  }
}
</style>
