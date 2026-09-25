<!-- src/components/PaymentDetailModal.vue -->
<template>
  <GlassModal 
    :show="show" 
    max-width="2xl" 
    @close="close"
  >
    <!-- Template del Título con Icono -->
    <template #title>
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
          <Receipt class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-tight">
            Detalle de Liquidación
          </h3>
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            Información de cirugías y comprobante.
          </p>
        </div>
      </div>
    </template>

    <!-- Body Principal -->
    <div v-if="liquidacion" class="p-3.5 sm:p-5 space-y-4 text-slate-900 dark:text-slate-100">
      
      <!-- Encabezado General -->
      <GlowCard class="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-xs" glow-color="rgba(37, 99, 235, 0.08)">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h4 class="text-xs sm:text-sm font-black text-slate-950 dark:text-white flex items-center gap-1.5">
            <Hash class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{{ liquidacion.orden_de_pago_id ? 'Orden de Pago #' + liquidacion.orden_de_pago_id : 'Liquidación Registrada' }}</span>
          </h4>

          <AnimatedBadge v-if="liquidacion.is_pendiente" variant="warning" dot pulse size="xs">
            Pendiente de liquidación
          </AnimatedBadge>
          <AnimatedBadge v-else-if="liquidacion.comprobante_object_key" variant="success" dot size="xs">
            Comprobante cargado
          </AnimatedBadge>
          <AnimatedBadge v-else variant="neutral" size="xs">
            Comprobante pendiente
          </AnimatedBadge>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 sm:p-3 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Estado de pago</p>
            <p class="mt-0.5 font-black text-slate-950 dark:text-white">
              {{ liquidacion.is_pendiente ? 'Pendiente de cobro' : 'Abonado por Districorr' }}
            </p>
          </div>
          <div class="p-2.5 sm:p-3 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800" v-if="!liquidacion.is_pendiente">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
              {{ liquidacion.comprobante_object_key ? 'Comprobante subido el' : 'Fecha de liquidación' }}
            </p>
            <p class="mt-0.5 font-black text-slate-950 dark:text-white flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-slate-500" />
              {{ formatDate(liquidacion.fecha_pago) }}
            </p>
          </div>
        </div>
      </GlowCard>

      <!-- Pacientes / Cirugías -->
      <div>
        <h4 class="mb-2 text-xs sm:text-sm font-black text-slate-950 dark:text-white flex items-center gap-1.5">
          <UserCheck class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Pacientes y cirugías incluidas</span>
        </h4>
        
        <div class="space-y-2.5">
          <div 
            v-for="(cirugia, idx) in liquidacion.cirugias" 
            :key="idx" 
            class="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs"
          >
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="min-w-0 flex-1">
                <p class="font-black text-slate-950 dark:text-white text-xs sm:text-sm truncate">{{ cirugia.paciente || 'No especificado' }}</p>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-bold">
                  <Calendar class="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Cirugía:</span> <span class="font-black text-slate-900 dark:text-slate-200">{{ formatDate(cirugia.fecha_cirugia) }}</span>
                </p>
              </div>
              <AnimatedBadge :variant="liquidacion.is_pendiente ? 'warning' : 'info'" size="xs" class="shrink-0">
                {{ liquidacion.is_pendiente ? 'Pendiente' : 'Liquidada' }}
              </AnimatedBadge>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <p class="text-[9px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                  {{ cirugia.tipo_cirugia ? 'Tipo de cirugía' : 'Patología' }}
                </p>
                <p class="mt-0.5 font-bold text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs">
                  {{ cirugia.tipo_cirugia || cirugia.patologia || 'Tipo no especificado' }}
                </p>
              </div>
              <div v-if="getMonto(cirugia) > 0">
                <p class="text-[9px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Monto liquidado</p>
                <p class="mt-0.5 font-black text-slate-950 dark:text-white font-mono text-xs sm:text-sm">
                  {{ formatCurrency(getMonto(cirugia)) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Liquidación -->
      <div v-if="liquidacion.has_monto" class="flex items-center justify-between p-3 sm:p-3.5 border rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-300 dark:border-slate-800 shadow-inner">
        <span class="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm">Total de liquidación</span>
        <span class="text-sm sm:text-base font-black text-slate-950 dark:text-white font-mono">{{ formatCurrency(liquidacion.monto_total) }}</span>
      </div>
      
    </div>

    <!-- Footer Fijo -->
    <template #footer>
      <div class="flex items-center justify-between sm:justify-end gap-2 w-full">
        <button 
          type="button"
          @click="close" 
          class="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl text-slate-700 bg-white border border-slate-300 shadow-xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition cursor-pointer text-center"
        >
          Cerrar
        </button>
        <a 
          v-if="liquidacion?.comprobante_object_key" 
          :href="getComprobanteUrl(liquidacion.comprobante_object_key)" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 transition text-center"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          <span>Ver comprobante</span>
        </a>
      </div>
    </template>
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