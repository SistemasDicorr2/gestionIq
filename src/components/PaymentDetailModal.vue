<!-- src/components/PaymentDetailModal.vue -->
<template>
  <GlassModal 
    :show="show" 
    max-width="max-w-2xl" 
    @close="close"
  >
    <div class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            <Receipt class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-950 dark:text-white">Detalle de Liquidación</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Información de cirugías incluidas y comprobante asociado.</p>
          </div>
        </div>

        <button 
          @click="close" 
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body scrolleable -->
      <div v-if="liquidacion" class="flex-1 p-6 space-y-6 overflow-y-auto">
        
        <!-- Encabezado General -->
        <GlowCard class="p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(37, 99, 235, 0.1)">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h4 class="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Hash class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {{ liquidacion.orden_de_pago_id ? 'Orden de Pago #' + liquidacion.orden_de_pago_id : 'Liquidación Registrada' }}
            </h4>

            <AnimatedBadge v-if="liquidacion.is_pendiente" variant="warning" dot pulse>
              Pendiente de liquidación
            </AnimatedBadge>
            <AnimatedBadge v-else-if="liquidacion.comprobante_object_key" variant="success" dot>
              Comprobante cargado
            </AnimatedBadge>
            <AnimatedBadge v-else variant="neutral">
              Comprobante pendiente
            </AnimatedBadge>
          </div>
          
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div class="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800">
              <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Estado de pago</p>
              <p class="mt-1 font-black text-slate-950 dark:text-white">
                {{ liquidacion.is_pendiente ? 'Pendiente de cobro' : 'Abonado por Districorr' }}
              </p>
            </div>
            <div class="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800" v-if="!liquidacion.is_pendiente">
              <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                {{ liquidacion.comprobante_object_key ? 'Comprobante subido el' : 'Fecha de liquidación' }}
              </p>
              <p class="mt-1 font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-slate-500" />
                {{ formatDate(liquidacion.fecha_pago) }}
              </p>
            </div>
          </div>
        </GlowCard>

        <!-- Pacientes / Cirugías -->
        <div>
          <h4 class="mb-3 text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
            <UserCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Pacientes y cirugías incluidas
          </h4>
          
          <div class="space-y-3">
            <div 
              v-for="(cirugia, idx) in liquidacion.cirugias" 
              :key="idx" 
              class="p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs"
            >
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                <div>
                  <p class="font-black text-slate-950 dark:text-white text-sm">{{ cirugia.paciente || 'No especificado' }}</p>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-bold">
                    <Calendar class="w-3.5 h-3.5 text-slate-500" />
                    Cirugía: <span class="font-black text-slate-900 dark:text-slate-200">{{ formatDate(cirugia.fecha_cirugia) }}</span>
                  </p>
                </div>
                <AnimatedBadge :variant="liquidacion.is_pendiente ? 'warning' : 'info'">
                  {{ liquidacion.is_pendiente ? 'Pendiente' : 'Liquidada' }}
                </AnimatedBadge>
              </div>

              <div class="grid grid-cols-1 gap-2 pt-2.5 mt-2.5 border-t sm:grid-cols-2 border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                    {{ cirugia.tipo_cirugia ? 'Tipo de cirugía' : 'Patología' }}
                  </p>
                  <p class="mt-0.5 font-bold text-slate-900 dark:text-slate-100">
                    {{ cirugia.tipo_cirugia || cirugia.patologia || 'Tipo no especificado' }}
                  </p>
                </div>
                <div v-if="getMonto(cirugia) > 0">
                  <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Monto liquidado</p>
                  <p class="mt-0.5 font-black text-slate-950 dark:text-white font-mono">
                    {{ formatCurrency(getMonto(cirugia)) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Liquidación -->
        <div v-if="liquidacion.has_monto" class="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-300 dark:border-slate-800 shadow-inner">
          <span class="font-black text-slate-800 dark:text-slate-200 text-sm">Total de liquidación</span>
          <span class="text-lg sm:text-xl font-black text-slate-950 dark:text-white font-mono">{{ formatCurrency(liquidacion.monto_total) }}</span>
        </div>
        
      </div>

      <!-- Footer Fijo -->
      <div class="flex flex-wrap-reverse justify-end gap-2.5 px-6 py-4 border-t shrink-0 bg-slate-50/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800">
        <button 
          @click="close" 
          class="px-5 py-2.5 text-xs font-bold rounded-xl text-slate-700 bg-white border border-slate-300 shadow-xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          Cerrar
        </button>
        <a 
          v-if="liquidacion?.comprobante_object_key" 
          :href="getComprobanteUrl(liquidacion.comprobante_object_key)" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          <span>Ver comprobante</span>
        </a>
      </div>
    </div>
  </GlassModal>
</template>

<script setup>
import { 
  GlassModal, 
  GlowCard, 
  AnimatedBadge 
} from './ui';
import { 
  Receipt, 
  X, 
  Hash, 
  Calendar, 
  UserCheck, 
  ExternalLink 
} from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  liquidacion: Object,
});
const emit = defineEmits(['close']);

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const close = () => emit('close');

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const getMonto = (cirugia) => {
  const num = parseFloat(cirugia.monto_a_pagar || cirugia.monto || cirugia.monto_liquidado || cirugia.honorarios);
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return 'Monto no especificado';
  return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

const getComprobanteUrl = (objectKey) => {
  return `${R2_PUBLIC_URL}/${objectKey}`;
};
</script>