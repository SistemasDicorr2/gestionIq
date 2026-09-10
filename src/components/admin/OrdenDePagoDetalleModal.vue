<!-- src/components/admin/OrdenDePagoDetalleModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm print:hidden" @click.self="closeModal">
      <div 
        class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150 text-slate-800 dark:text-slate-100"
        @click.stop
      >
        <!-- Header -->
        <header class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg shadow-xs">
              📑
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">DISTRICORR · GESTIÓN IQ</span>
                <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                  ORDEN #{{ ordenId }}
                </span>
              </div>
              <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                Detalle Oficial de la Orden de Pago
              </h2>
            </div>
          </div>
          <button 
            type="button"
            @click="closeModal" 
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            ✕
          </button>
        </header>

        <!-- Body -->
        <main class="p-6 overflow-y-auto flex-1 space-y-6">
          <div v-if="isLoading" class="text-center py-16">
            <div class="inline-block w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="text-slate-500 dark:text-slate-400 mt-3 text-xs font-semibold">Cargando detalle de la orden...</p>
          </div>

          <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 text-xs font-medium">
            Error al cargar el detalle: {{ error }}
          </div>

          <div v-else-if="detalle" class="space-y-6">
            <!-- Summary KPI Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span class="block text-[10px] font-bold text-slate-400 uppercase">Fecha de Emisión</span>
                <span class="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                  {{ formatDate(detalle.fecha_emision) }}
                </span>
              </div>

              <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span class="block text-[10px] font-bold text-slate-400 uppercase">Monto Total Liquidado</span>
                <span class="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {{ formatCurrency(detalle.monto_total_general || detalle.monto_total) }}
                </span>
              </div>

              <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
                <span class="block text-[10px] font-bold text-slate-400 uppercase">Comprobante Bancario</span>
                <div class="mt-1">
                  <a 
                    v-if="detalle.comprobante_object_key"
                    :href="getComprobanteUrl(detalle.comprobante_object_key)" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 transition-all"
                  >
                    <span>📎 Ver Comprobante</span>
                  </a>
                  <span 
                    v-else 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <span>⚪ Sin archivo adjunto</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Notas de la Orden si existen -->
            <div v-if="detalle.notas" class="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs">
              <span class="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">Notas de la Orden:</span>
              <p class="text-slate-600 dark:text-slate-300 m-0">{{ detalle.notas }}</p>
            </div>

            <!-- Desglose por Instrumentador -->
            <div 
              v-for="pago in (detalle.pagos_instrumentadores || detalle.pagos || [])" 
              :key="pago.instrumentador_dni" 
              class="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
            >
              <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
                    {{ pago.instrumentador_nombre }}
                  </h3>
                  <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    DNI: {{ pago.instrumentador_dni }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Instrumentador</span>
                  <span class="text-sm font-black text-blue-600 dark:text-blue-400">
                    {{ formatCurrency(pago.monto_total_instrumentador || pago.monto_total) }}
                  </span>
                </div>
              </div>

              <!-- Tabla de Cirugías -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <thead class="bg-slate-50/50 dark:bg-slate-900/50">
                    <tr>
                      <th class="px-4 py-2.5 text-left font-bold text-slate-400 uppercase tracking-wider text-[10px]">ID Cirugía</th>
                      <th class="px-4 py-2.5 text-left font-bold text-slate-400 uppercase tracking-wider text-[10px]">Fecha</th>
                      <th class="px-4 py-2.5 text-left font-bold text-slate-400 uppercase tracking-wider text-[10px]">Paciente</th>
                      <th class="px-4 py-2.5 text-right font-bold text-slate-400 uppercase tracking-wider text-[10px]">Monto Liquidado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    <tr 
                      v-for="reporte in (pago.cirugias || pago.reportes || [])" 
                      :key="reporte.id || reporte.id_cirugia"
                      class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td class="px-4 py-2 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {{ reporte.id_cirugia || ('CX-' + (1000 + (reporte.id || 0))) }}
                      </td>
                      <td class="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {{ formatDate(reporte.fecha_cirugia) }}
                      </td>
                      <td class="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200">
                        {{ reporte.paciente }}
                      </td>
                      <td class="px-4 py-2 text-right font-bold text-slate-900 dark:text-slate-100">
                        {{ formatCurrency(reporte.monto_final !== undefined ? reporte.monto_final : (reporte.monto_a_pagar || 0)) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>

        <!-- Footer -->
        <footer class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <button 
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
          
          <button 
            type="button"
            @click="descargarPDF" 
            :disabled="isLoading || !detalle || isGeneratingPdf"
            class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <div v-if="isGeneratingPdf" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ isGeneratingPdf ? 'Generando...' : 'Descargar Reporte PDF Ejecutivo' }}</span>
          </button>
        </footer>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useReportePagosPDF } from '../../composables/useReportePagosPDF';
import { useToasts } from '../../composables/useToasts';

const props = defineProps({
  ordenId: { type: Number, default: null },
  isVisible: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const { showSuccessToast, showErrorToast } = useToasts();
const { generarReporteDesdeDetalleOrden } = useReportePagosPDF();

const detalle = ref(null);
const isLoading = ref(false);
const error = ref(null);
const isGeneratingPdf = ref(false);
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

async function fetchDetalleOrden(id) {
  if (!id) return;
  isLoading.value = true;
  error.value = null;
  detalle.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: id });
    if (rpcError) throw rpcError;
    detalle.value = data;
  } catch (err) {
    console.error('Error al obtener detalle de la orden:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function getComprobanteUrl(objectKey) {
  if (!objectKey) return '#';
  return `${R2_PUBLIC_URL}/${objectKey}`;
}

function closeModal() {
  emit('close');
}

async function descargarPDF() {
  if (!detalle.value) return;
  isGeneratingPdf.value = true;
  try {
    generarReporteDesdeDetalleOrden(detalle.value);
    showSuccessToast(`Reporte oficial de Orden #${detalle.value.id} descargado en PDF.`);
  } catch (err) {
    console.error('Error al generar PDF:', err);
    showErrorToast(err, 'No se pudo generar el reporte PDF.');
  } finally {
    isGeneratingPdf.value = false;
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const parts = String(dateString).substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateString;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$ 0';
  return `$ ${Number(amount).toLocaleString('es-AR')}`;
};

watch(() => props.isVisible, (newValue) => {
  if (newValue && props.ordenId) {
    fetchDetalleOrden(props.ordenId);
  } else {
    detalle.value = null;
    error.value = null;
    isLoading.value = false;
  }
});
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