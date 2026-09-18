<!-- src/components/admin/OrdenDePagoDetalleModal.vue -->
<template>
  <GlassModal 
    :show="isOpen" 
    max-width="max-w-3xl" 
    @close="closeModal"
  >
    <div class="flex flex-col max-h-[88vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/90">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg shadow-xs border border-blue-200 dark:border-blue-800">
            <Receipt class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">DISTRICORR · GESTIÓN IQ</span>
              <AnimatedBadge variant="blue" size="xs">
                ORDEN #{{ ordenId }}
              </AnimatedBadge>
            </div>
            <h2 class="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-0.5">
              Detalle Oficial de la Orden de Pago
            </h2>
          </div>
        </div>
        <button 
          type="button"
          @click="closeModal" 
          class="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <main class="p-6 overflow-y-auto flex-1 space-y-6">
        <div v-if="isLoading" class="text-center py-16">
          <div class="inline-block w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"></div>
          <p class="text-slate-600 dark:text-slate-400 mt-3 text-xs font-bold">Cargando detalle de la orden...</p>
        </div>

        <div v-else-if="error" class="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>Error al cargar el detalle: {{ error }}</span>
        </div>

        <div v-else-if="detalle" class="space-y-6">
          <!-- Summary KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <GlowCard class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm" glow-color="rgba(37, 99, 235, 0.1)">
              <span class="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha de Emisión</span>
              <span class="text-sm font-black text-slate-950 dark:text-white block mt-1 flex items-center gap-1.5">
                <Calendar class="w-4 h-4 text-slate-500" />
                {{ formatDate(detalle.fecha_emision) }}
              </span>
            </GlowCard>

            <GlowCard class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm" glow-color="rgba(16, 185, 129, 0.12)">
              <span class="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Monto Total Liquidado</span>
              <span class="text-base font-black text-emerald-700 dark:text-emerald-400 block mt-1">
                {{ formatCurrency(detalle.monto_total_general || detalle.monto_total) }}
              </span>
            </GlowCard>

            <GlowCard class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col justify-between" glow-color="rgba(37, 99, 235, 0.1)">
              <span class="block text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Comprobante Bancario</span>
              <div class="mt-1">
                <a 
                  v-if="detalle.comprobante_object_key"
                  :href="getComprobanteUrl(detalle.comprobante_object_key)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-all shadow-xs"
                >
                  <Paperclip class="w-3.5 h-3.5" />
                  <span>Ver Comprobante</span>
                </a>
                <span 
                  v-else 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                >
                  <span>⚪ Sin archivo adjunto</span>
                </span>
              </div>
            </GlowCard>
          </div>

          <!-- Notas de la Orden si existen -->
          <div v-if="detalle.notas" class="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs">
            <span class="font-black text-blue-950 dark:text-blue-200 block mb-0.5">Notas de la Orden:</span>
            <p class="text-slate-800 dark:text-slate-300 m-0 font-medium">{{ detalle.notas }}</p>
          </div>

          <!-- Desglose por Instrumentador -->
          <div 
            v-for="pago in (detalle.pagos_instrumentadores || detalle.pagos || [])" 
            :key="pago.instrumentador_dni" 
            class="border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          >
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-black text-slate-950 dark:text-white">
                  {{ pago.instrumentador_nombre }}
                </h3>
                <span class="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  DNI: {{ pago.instrumentador_dni }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold block">Total Instrumentador</span>
                <span class="text-sm font-black text-blue-700 dark:text-blue-400">
                  {{ formatCurrency(pago.monto_total_instrumentador || pago.monto_total) }}
                </span>
              </div>
            </div>

            <!-- Tabla de Cirugías -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <thead class="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th class="px-4 py-2.5 text-left font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">ID Cirugía</th>
                    <th class="px-4 py-2.5 text-left font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Fecha</th>
                    <th class="px-4 py-2.5 text-left font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Paciente</th>
                    <th class="px-4 py-2.5 text-right font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Monto Liquidado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  <tr 
                    v-for="reporte in (pago.cirugias || pago.reportes || [])" 
                    :key="reporte.id || reporte.id_cirugia"
                    class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td class="px-4 py-2 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {{ reporte.id_cirugia || ('CX-' + (1000 + (reporte.id || 0))) }}
                    </td>
                    <td class="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium">
                      {{ formatDate(reporte.fecha_cirugia) }}
                    </td>
                    <td class="px-4 py-2 font-bold text-slate-900 dark:text-slate-100">
                      {{ reporte.paciente }}
                    </td>
                    <td class="px-4 py-2 text-right font-black text-slate-950 dark:text-white">
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
      <footer class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
        <button 
          type="button"
          @click="closeModal"
          class="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-300 dark:border-slate-700"
        >
          Cerrar
        </button>
        
        <ShimmerButton 
          type="button"
          @click="descargarPDF" 
          :disabled="isLoading || !detalle || isGeneratingPdf"
          class="px-5 py-2.5 text-xs font-black"
        >
          <span v-if="isGeneratingPdf" class="flex items-center gap-2">
            <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generando...</span>
          </span>
          <span v-else class="flex items-center gap-2">
            <FileDown class="w-4 h-4" />
            <span>Descargar Reporte PDF Ejecutivo</span>
          </span>
        </ShimmerButton>
      </footer>
    </div>
  </GlassModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { supabase } from '../../services/supabase';
import { useReportePagosPDF } from '../../composables/useReportePagosPDF';
import { useToasts } from '../../composables/useToasts';
import { GlassModal, GlowCard, AnimatedBadge, ShimmerButton } from '../ui';
import { 
  Receipt, 
  X, 
  AlertCircle, 
  Calendar, 
  Paperclip, 
  FileDown 
} from 'lucide-vue-next';

const props = defineProps({
  ordenId: { type: [Number, String], default: null },
  isVisible: { type: Boolean, default: false },
  show: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const { showSuccessToast, showErrorToast } = useToasts();
const { generarReporteDesdeDetalleOrden } = useReportePagosPDF();

const isOpen = computed(() => props.isVisible || props.show);
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
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: Number(id) });
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

watch(isOpen, (newValue) => {
  if (newValue && props.ordenId) {
    fetchDetalleOrden(props.ordenId);
  } else {
    detalle.value = null;
    error.value = null;
    isLoading.value = false;
  }
});

watch(() => props.ordenId, (newId) => {
  if (isOpen.value && newId) {
    fetchDetalleOrden(newId);
  }
});
</script>