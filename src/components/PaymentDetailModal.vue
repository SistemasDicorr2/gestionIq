<!-- src/components/PaymentDetailModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="close">
      <div class="flex flex-col w-full max-w-2xl overflow-hidden bg-white border shadow-xl max-h-[90vh] dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
        
        <!-- Header Fijo -->
        <div class="p-5 border-b shrink-0 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 class="text-xl font-bold text-slate-950 dark:text-white">Detalle de liquidación</h3>
        </div>

        <!-- Body scrolleable -->
        <div v-if="liquidacion" class="flex-1 p-6 space-y-8 overflow-y-auto">
          
          <!-- Encabezado General -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-slate-900 dark:text-slate-100">
              {{ liquidacion.orden_de_pago_id ? 'Orden de pago #' + liquidacion.orden_de_pago_id : 'Liquidación registrada' }}
            </h4>
            
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800">
                <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Estado de liquidación</p>
                <p class="mt-1 font-semibold text-sky-600 dark:text-sky-400">
                  {{ liquidacion.is_pendiente ? 'Pendiente de liquidación' : 'Incluida en liquidación' }}
                </p>
              </div>
              <div class="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800" v-if="!liquidacion.is_pendiente">
                <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Estado del comprobante</p>
                <div class="mt-1">
                  <span v-if="liquidacion.comprobante_object_key" class="inline-flex items-center px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                    Comprobante cargado
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-full dark:bg-slate-900/50 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    Comprobante pendiente de carga
                  </span>
                </div>
              </div>
              <div class="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800" v-if="!liquidacion.is_pendiente">
                <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  {{ liquidacion.comprobante_object_key ? 'Comprobante subido el' : 'Fecha de liquidación' }}
                </p>
                <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">
                  {{ formatDate(liquidacion.fecha_pago) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Pacientes / Cirugías -->
          <div class="space-y-4">
            <h4 class="pb-2 text-base font-bold border-b text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
              Pacientes incluidos
            </h4>
            
            <div class="space-y-3">
              <div v-for="(cirugia, idx) in liquidacion.cirugias" :key="idx" class="p-4 transition-all duration-200 bg-white border shadow-sm rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md">
                <div class="flex flex-col gap-4 mb-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="font-bold text-slate-950 dark:text-white">{{ cirugia.paciente || 'No especificado' }}</p>
                    <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Fecha de cirugía: <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatDate(cirugia.fecha_cirugia) }}</span></p>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-1 text-xs font-medium border rounded-lg bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    {{ liquidacion.is_pendiente ? 'Pendiente' : 'Incluida en liquidación' }}
                  </span>
                </div>
                <div class="grid grid-cols-1 gap-3 pt-3 mt-3 border-t sm:grid-cols-2 border-slate-100 dark:border-slate-800">
                  <div>
                    <p class="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                      {{ cirugia.tipo_cirugia ? 'Tipo de cirugía' : 'Patología' }}
                    </p>
                    <p class="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {{ cirugia.tipo_cirugia || cirugia.patologia || 'Tipo no especificado' }}
                    </p>
                  </div>
                  <div v-if="getMonto(cirugia) > 0">
                    <p class="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">Monto liquidado</p>
                    <p class="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {{ formatCurrency(getMonto(cirugia)) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Liquidación -->
          <div v-if="liquidacion.has_monto" class="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
            <span class="font-bold text-slate-700 dark:text-slate-300">Total de liquidación</span>
            <span class="text-lg font-extrabold text-slate-950 dark:text-white">{{ formatCurrency(liquidacion.monto_total) }}</span>
          </div>
          
        </div>

        <!-- Footer Fijo -->
        <div class="flex flex-wrap-reverse justify-end gap-3 px-6 py-4 border-t shrink-0 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800">
          <button @click="close" class="px-5 py-2.5 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all duration-200 hover:-translate-y-0.5">Cerrar</button>
          <a v-if="liquidacion?.comprobante_object_key" :href="getComprobanteUrl(liquidacion.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="action-link">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            Ver comprobante
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.action-link { @apply inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:-translate-y-0.5; }
</style>