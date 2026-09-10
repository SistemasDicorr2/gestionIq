<!-- src/components/admin/corrections/CorrectionWorkspace.vue -->
<template>
  <div class="correction-workspace p-3 sm:p-5 lg:p-6 max-w-5xl mx-auto space-y-6">
    
    <!-- Fase de Búsqueda: se muestra si no hay ninguna orden seleccionada -->
    <div v-if="!selectedOrder" class="search-phase space-y-5">
      <header class="text-center max-w-xl mx-auto">
        <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Herramientas de Corrección
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
          Seleccioná o buscá la orden de pago que necesitás corregir o vincular comprobante.
        </p>
      </header>

      <!-- BANNER CTA: AUTO-MATCHER MASIVO SI HAY ÓRDENES SIN COMPROBANTE -->
      <div 
        v-if="missingReceiptsCount > 0" 
        class="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
            🧲
          </div>
          <div>
            <h3 class="text-sm font-black">
              Hay {{ missingReceiptsCount }} {{ missingReceiptsCount === 1 ? 'orden' : 'órdenes' }} sin comprobante adjunto
            </h3>
            <p class="text-xs text-indigo-100 font-medium">
              Podés arrastrar todos los comprobantes juntos para que el sistema los vincule automáticamente.
            </p>
          </div>
        </div>

        <button 
          @click="$emit('open-auto-matcher')" 
          class="px-4 py-2 bg-white text-indigo-900 font-black text-xs rounded-xl shadow-md hover:bg-indigo-50 transition cursor-pointer self-end sm:self-auto shrink-0 active:scale-95"
        >
          ⚡ Auto-Vincular en Lote ➔
        </button>
      </div>

      <!-- BUSCADOR PRINCIPAL -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label for="searchOrder" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Buscar Orden de Pago
          </label>
          
          <!-- Pestañas de Filtro Rápido -->
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            <button 
              @click="quickFilter = 'todas'" 
              :class="[
                'px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer',
                quickFilter === 'todas' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              ]"
            >
              Todas ({{ allOrders.length }})
            </button>
            <button 
              @click="quickFilter = 'sin_comprobante'" 
              :class="[
                'px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1',
                quickFilter === 'sin_comprobante' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              ]"
            >
              <span>🔴 Sin Comprobante</span>
              <span v-if="missingReceiptsCount > 0" class="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded-full text-[10px] font-mono">
                {{ missingReceiptsCount }}
              </span>
            </button>
            <button 
              @click="quickFilter = 'ultimo_lote'" 
              :class="[
                'px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer',
                quickFilter === 'ultimo_lote' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              ]"
            >
              📦 Última Conciliación
            </button>
          </div>
        </div>

        <div class="relative">
          <input 
            id="searchOrder"
            type="text" 
            v-model="searchTerm"
            placeholder="🔍 Buscar por ID (#142), DNI o nombre del instrumentador..."
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
          <button 
            v-if="searchTerm" 
            @click="searchTerm = ''" 
            class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div v-if="isLoading" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold py-3 text-center animate-pulse">
          🌀 Cargando órdenes de pago desde Supabase...
        </div>

        <!-- LISTADO DE ÓRDENES EN TARJETAS CON SELECCIÓN EN 1 CLIC -->
        <div v-else class="pt-2">
          <div v-if="displayOrders.length === 0" class="text-center py-8 text-xs text-slate-500 font-semibold italic">
            No se encontraron órdenes que coincidan con el filtro aplicado.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            <div 
              v-for="order in displayOrders" 
              :key="order.id" 
              @click="selectOrder(order)"
              class="p-3.5 bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50/80 dark:hover:bg-indigo-955/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 rounded-2xl cursor-pointer transition-all duration-150 space-y-2 group shadow-2xs"
            >
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  #{{ order.id }}
                </span>

                <span 
                  v-if="order.comprobante_object_key" 
                  class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  ✓ Con Comprobante
                </span>
                <span 
                  v-else 
                  class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-955 dark:text-rose-200 border border-rose-200 dark:border-rose-900 animate-pulse"
                >
                  ⚠️ Sin Comprobante
                </span>
              </div>

              <div>
                <div class="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" :title="formatInstrumentadoresNombres(order.instrumentadores_nombres)">
                  {{ formatInstrumentadoresNombres(order.instrumentadores_nombres) }}
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                  <span>{{ formatDate(order.fecha_emision) }}</span>
                  <span class="font-black text-slate-900 dark:text-slate-100 text-xs">
                    {{ formatCurrency(order.monto_total_general || order.monto_total) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fase de Trabajo: se muestra cuando se ha seleccionado una orden -->
    <div v-else class="workspace-phase space-y-6">
      <!-- Cabecera con los detalles de la orden y botón para cambiar -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Orden Seleccionada</span>
              <span 
                v-if="selectedOrder.comprobante_object_key" 
                class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                ✓ Con Comprobante Digital
              </span>
              <span 
                v-else 
                class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-955 dark:text-rose-200"
              >
                ⚠️ Sin Comprobante Adjunto
              </span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white font-mono">
              #{{ selectedOrder?.id }}
            </h2>
            <p class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              {{ formatInstrumentadoresNombres(selectedOrder?.instrumentadores_nombres) }} · <span class="font-mono font-black text-indigo-600 dark:text-indigo-400">{{ formatCurrency(selectedOrder?.monto_total_general || selectedOrder?.monto_total) }}</span>
            </p>
          </div>
          <button 
            @click="resetWorkspace" 
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition cursor-pointer self-start sm:self-center"
          >
            ← Buscar otra Orden
          </button>
        </div>
      </div>

      <!-- Menú de Selección de Herramienta (Vista Principal) -->
      <div v-if="!activeTool" class="space-y-4">
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Seleccioná la acción de corrección
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tarjeta 1: Modificar montos y notas -->
          <div @click="activeTool = 'modificar'" class="action-card">
            <div class="card-icon bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h4 class="card-title">Ajustar Montos y Notas</h4>
              <p class="card-description">Modificá los importes de las cirugías individuales y edita las observaciones del lote.</p>
            </div>
          </div>

          <!-- Tarjeta 2: Agregar Cirugía -->
          <div @click="activeTool = 'agregar'" class="action-card">
            <div class="card-icon bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h4 class="card-title">Agregar Cirugía (Cx)</h4>
              <p class="card-description">Asociá una cirugía que haya quedado pendiente directamente a esta orden de pago.</p>
            </div>
          </div>

          <!-- Tarjeta 3: Cambiar / Adjuntar Comprobante -->
          <div @click="activeTool = 'comprobante'" class="action-card border-indigo-200 dark:border-indigo-800 bg-indigo-50/20">
            <div class="card-icon bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h4 class="card-title text-indigo-900 dark:text-indigo-200">
                {{ selectedOrder.comprobante_object_key ? 'Reemplazar Comprobante' : '📎 Adjuntar Comprobante' }}
              </h4>
              <p class="card-description">
                {{ selectedOrder.comprobante_object_key ? 'Actualiza el archivo de comprobante de transferencia asignado a este lote.' : 'Sube el archivo PDF o foto de la transferencia para saldar este comprobante.' }}
              </p>
            </div>
          </div>

          <!-- Tarjeta 4: Anular Pago -->
          <div @click="activeTool = 'anular'" class="action-card border-rose-100 hover:border-rose-300 dark:border-rose-955/40 dark:hover:border-rose-900/50">
            <div class="card-icon bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h4 class="card-title text-rose-700 dark:text-rose-400">Anular Orden de Pago</h4>
              <p class="card-description">Dá de baja la liquidación. Todas las cirugías volverán a estar pendientes de pago.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de la Herramienta Seleccionada -->
      <div v-else class="space-y-4">
        <button 
          @click="activeTool = null" 
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition"
        >
          ← Volver a Herramientas
        </button>

        <ToolModificarMontosNotas
          v-if="activeTool === 'modificar'"
          :key="selectedOrder?.id"
          :order-id="selectedOrder?.id"
          @action-completed="handleActionCompleted"
        />

        <ToolAgregarCirugia
          v-else-if="activeTool === 'agregar'"
          :key="selectedOrder?.id"
          :order-id="selectedOrder?.id"
          @action-completed="handleActionCompleted"
        />

        <ToolCambiarComprobante 
          v-else-if="activeTool === 'comprobante'"
          :order-id="selectedOrder?.id"
          @action-completed="handleActionCompleted"
        />
        
        <ToolAnularPago 
          v-else-if="activeTool === 'anular'"
          :order-id="selectedOrder?.id" 
          @action-completed="handleActionCompleted" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../services/supabase';
import { useToast } from 'vue-toastification';

import ToolCambiarComprobante from './ToolCambiarComprobante.vue';
import ToolAnularPago from './ToolAnularPago.vue';
import ToolModificarMontosNotas from './ToolModificarMontosNotas.vue';
import ToolAgregarCirugia from './ToolAgregarCirugia.vue';

const emit = defineEmits(['open-auto-matcher', 'updated']);
const toast = useToast();

const isLoading = ref(true);
const allOrders = ref([]);
const searchTerm = ref('');
const selectedOrder = ref(null);
const activeTool = ref(null);
const quickFilter = ref('todas'); // 'todas' | 'sin_comprobante' | 'ultimo_lote'

const missingReceiptsCount = computed(() => {
  return allOrders.value.filter(o => !o.comprobante_object_key).length;
});

const latestBatchOrders = computed(() => {
  if (allOrders.value.length === 0) return [];
  const latestDate = allOrders.value[0]?.fecha_emision ? String(allOrders.value[0].fecha_emision).slice(0, 10) : '';
  if (!latestDate) return allOrders.value.slice(0, 10);
  return allOrders.value.filter(o => o.fecha_emision && String(o.fecha_emision).slice(0, 10) === latestDate);
});

const displayOrders = computed(() => {
  let list = allOrders.value;

  if (quickFilter.value === 'sin_comprobante') {
    list = list.filter(o => !o.comprobante_object_key);
  } else if (quickFilter.value === 'ultimo_lote') {
    list = latestBatchOrders.value;
  }

  if (searchTerm.value.trim()) {
    const q = searchTerm.value.toLowerCase().trim().replace(/^#/, '');
    list = list.filter(order => {
      const matchId = String(order.id).includes(q);
      const namesStr = formatInstrumentadoresNombres(order.instrumentadores_nombres).toLowerCase();
      const matchName = namesStr.includes(q);
      const matchDnis = order.instrumentadores_dnis && Array.isArray(order.instrumentadores_dnis) 
        ? order.instrumentadores_dnis.some(d => String(d).includes(q))
        : String(order.instrumentadores_dnis || '').includes(q);

      return matchId || matchName || matchDnis;
    });
  }

  return list.slice(0, 30);
});

const formatInstrumentadoresNombres = (val) => {
  if (Array.isArray(val)) return val.join(', ') || 'Profesional no especificado';
  return val || 'Profesional no especificado';
};

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (error) throw error;
    
    const list = data || [];
    list.sort((a, b) => new Date(b.fecha_emision || 0) - new Date(a.fecha_emision || 0) || (b.id - a.id));
    allOrders.value = list;
  } catch (err) {
    toast.error("No se pudo cargar el historial de órdenes.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrders);

const selectOrder = (order) => {
  selectedOrder.value = order;
  searchTerm.value = '';
  activeTool.value = null;
};

const resetWorkspace = () => {
  selectedOrder.value = null;
  activeTool.value = null;
};

const handleActionCompleted = () => {
  fetchOrders();
  resetWorkspace();
  emit('updated');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = String(dateString).slice(0, 10).split('-');
  if (d.length === 3) return `${d[2]}/${d[1]}/${d[0]}`;
  return dateString;
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);

defineExpose({
  fetchOrders,
  selectOrder
});
</script>

<style scoped>
.action-card {
  @apply flex items-center gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200;
}
.card-icon {
  @apply flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 font-bold;
}
.card-title {
  @apply text-sm sm:text-base font-black text-slate-900 dark:text-slate-100;
}
.card-description {
  @apply text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed;
}
</style>