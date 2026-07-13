<!-- src/components/admin/corrections/CorrectionWorkspace.vue -->
<template>
  <div class="correction-workspace p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
    
    <!-- Fase de Búsqueda: se muestra si no hay ninguna orden seleccionada -->
    <div v-if="!selectedOrder" class="search-phase">
      <header class="mb-8 text-center">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Herramientas de Corrección</h2>
        <p class="text-slate-600 dark:text-slate-400 mt-1">
          Comenzá buscando la orden de pago que necesitás modificar.
        </p>
      </header>
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border border-slate-100 dark:border-slate-800/80">
        <label for="searchOrder" class="form-label">Buscar Orden de Pago</label>
        <input 
          id="searchOrder"
          type="text" 
          v-model="searchTerm"
          placeholder="Buscar por ID de orden, DNI o nombre de instrumentador..."
          class="form-input"
        />
        <div v-if="isLoading" class="text-sm text-slate-500 mt-2">Cargando historial de órdenes...</div>
        <div v-else-if="searchTerm && filteredOrders.length > 0" class="mt-2 border border-slate-200 dark:border-slate-700 rounded-md max-h-60 overflow-y-auto">
          <ul>
            <li v-for="order in filteredOrders" :key="order.id" @click="selectOrder(order)" class="search-result-item">
              <span class="font-bold">#{{ order.id }}</span>
              <span class="text-sm">{{ order.instrumentadores_nombres }}</span>
              <span class="text-xs text-slate-500">{{ formatDate(order.fecha_emision) }}</span>
            </li>
          </ul>
        </div>
         <p v-else-if="searchTerm" class="text-sm text-slate-500 mt-2">No se encontraron órdenes que coincidan con la búsqueda.</p>
      </div>
    </div>

    <!-- Fase de Trabajo: se muestra cuando se ha seleccionado una orden -->
    <div v-else class="workspace-phase">
      <!-- Cabecera con los detalles de la orden y botón para cambiar -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6 mb-6 border border-slate-100 dark:border-slate-800/80">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Orden de Pago Seleccionada</p>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">#{{ selectedOrder?.id }}</h2>
            <p class="text-slate-600 dark:text-slate-300">{{ selectedOrder?.instrumentadores_nombres }} - {{ formatCurrency(selectedOrder?.monto_total_general) }}</p>
          </div>
          <button @click="resetWorkspace" class="btn-secondary text-sm">Buscar otra Orden</button>
        </div>
      </div>

      <!-- Menú de Selección de Herramienta (Vista Principal) -->
      <div v-if="!activeTool" class="space-y-6">
        <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b pb-2 dark:border-slate-700">Seleccioná una Herramienta</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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

          <!-- Tarjeta 2: Agregar Cirugía (NUEVA) -->
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

          <!-- Tarjeta 3: Cambiar Comprobante -->
          <div @click="activeTool = 'comprobante'" class="action-card">
            <div class="card-icon bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h4 class="card-title">Cambiar Comprobante</h4>
              <p class="card-description">Reemplaza el archivo del comprobante de transferencia asignado a este lote.</p>
            </div>
          </div>

          <!-- Tarjeta 4: Anular Pago (Warning style) -->
          <div @click="activeTool = 'anular'" class="action-card border-red-100 hover:border-red-300 dark:border-red-950/40 dark:hover:border-red-900/50">
            <div class="card-icon bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h4 class="card-title text-red-700 dark:text-red-400">Anular Orden de Pago</h4>
              <p class="card-description">Dá de baja la liquidación. Todas las cirugías volverán a estar pendientes de pago.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de la Herramienta Seleccionada -->
      <div v-else class="space-y-4">
        <button @click="activeTool = null" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 rounded-xl cursor-pointer transition-all duration-150">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Herramientas
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

const toast = useToast();

const isLoading = ref(true);
const allOrders = ref([]);
const searchTerm = ref('');
const selectedOrder = ref(null);
const activeTool = ref(null);

const filteredOrders = computed(() => {
  if (!searchTerm.value || allOrders.value.length === 0) {
    return [];
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return allOrders.value.filter(order => 
    String(order.id).includes(lowerCaseSearch) ||
    (order.instrumentadores_nombres && order.instrumentadores_nombres.toLowerCase().includes(lowerCaseSearch)) ||
    (order.instrumentadores_dnis && order.instrumentadores_dnis.some(dni => dni.includes(lowerCaseSearch)))
  ).slice(0, 10);
});

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (error) throw error;
    allOrders.value = data || [];
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
  // Refrescamos la lista de órdenes para que el resumen muestre los datos actualizados.
  fetchOrders();
  // Volvemos al buscador para iniciar un nuevo flujo de corrección.
  resetWorkspace();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
.form-input { @apply px-4 py-2.5 border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 transition-all duration-150; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors duration-150 cursor-pointer; }
.search-result-item { @apply flex justify-between items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150; }

/* Tarjetas de acción */
.action-card {
  @apply flex gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-2xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200;
}
.card-icon {
  @apply flex items-center justify-center w-12 h-12 rounded-xl shrink-0;
}
.card-title {
  @apply text-base font-bold text-slate-800 dark:text-slate-100;
}
.card-description {
  @apply text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed;
}
</style>