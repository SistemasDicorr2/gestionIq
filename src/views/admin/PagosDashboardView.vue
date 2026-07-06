<!-- src/views/admin/PagosDashboardView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950/10 min-h-screen">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Estación de Pagos Rápidos</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1.5 text-sm sm:text-base">
        Filtrá, ajustá y seleccioná cirugías para generar un lote de pago en una sola operación ágil.
      </p>
    </header>

    <section v-if="!isLoading && !error" class="mb-8 space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div v-if="activeKpiFilter" class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Filtro activo: {{ activeKpiLabel }}
          </span>
          <button type="button" @click="clearKpiFilter" class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-750 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 active:scale-95 transition-all duration-150 cursor-pointer">
            Limpiar filtro
          </button>
        </div>
        <div v-else class="hidden sm:block"></div>

        <label class="flex flex-col gap-1.5 sm:w-56">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Período de Análisis</span>
          <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
            <select v-model="selectedKpiPeriod" class="w-full px-3 py-2 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-0">
              <option v-for="option in kpiPeriodOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </label>
      </div>

      <!-- Cuadrícula de KPIs Modernizados -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <button
          v-for="stat in paymentKpis"
          :key="stat.label"
          type="button"
          @click="applyKpiFilter(stat.filter)"
          class="rounded-2xl border p-5 text-left shadow-sm transition-all duration-205 focus:outline-none cursor-pointer flex items-start justify-between gap-4"
          :class="[stat.cardClass, stat.isActive ? stat.activeClass : 'hover:-translate-y-0.5 hover:shadow-md border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/90']"
        >
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ stat.label }}</p>
            <p class="mt-2.5 break-words text-2xl font-bold leading-tight text-slate-900 dark:text-white">{{ stat.value }}</p>
            <p v-if="stat.subtitle" class="mt-1 text-xs leading-snug text-slate-400 dark:text-slate-500">{{ stat.subtitle }}</p>
            <span v-if="stat.isActive" class="inline-flex items-center gap-1 mt-3.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <span class="w-1 h-1 rounded-full bg-indigo-500"></span>
              Filtro Activo
            </span>
          </div>
          <div class="rounded-xl p-3 shrink-0" :class="stat.iconClass">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="stat.iconPath" />
            </svg>
          </div>
        </button>
      </div>
    </section>

    <div v-if="isLoading" class="text-center p-10">
      <p>Cargando todas las cirugías pendientes...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
      {{ error }}
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Columna Principal: Tabla de Cirugías -->
      <div class="lg:col-span-2">
        <!-- Panel de Filtros Modernizado -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <!-- Filtros Principales (Siempre Visibles) -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Buscar por Texto</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                <input 
                  type="text" 
                  v-model="filters.searchTerm"
                  placeholder="Paciente o instrumentador..."
                  class="form-input-premium-styled"
                />
              </div>
            </div>
            
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Instrumentador</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                <select v-model="filters.selectedInstrumentador" class="form-input-select-styled">
                  <option value="todos">Todos los profesionales</option>
                  <option v-for="inst in instrumentadorOptions" :key="inst.dni" :value="inst.dni">
                    {{ inst.nombre }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button @click="clearFilters" class="btn-clear flex-1" title="Restablecer filtros">
                Limpiar
              </button>
              <button 
                @click="showAdvancedFilters = !showAdvancedFilters" 
                class="btn-toggle-filters shrink-0" 
                :class="{'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/50': showAdvancedFilters}"
                title="Filtros avanzados"
              >
                <svg class="w-4 h-4 transition-transform duration-200" :class="{'rotate-180': showAdvancedFilters}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Filtros Avanzados Colapsables (Fechas y Montos) -->
          <Transition name="expand">
            <div v-show="showAdvancedFilters" class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Desde</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="date" v-model="filters.startDate" class="form-input-premium-styled text-xs" />
                </div>
              </div>
              
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hasta</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="date" v-model="filters.endDate" class="form-input-premium-styled text-xs" />
                </div>
              </div>
              
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto Mín.</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="number" v-model.number="filters.minAmount" placeholder="Ej: 5000" class="form-input-premium-styled text-xs" />
                </div>
              </div>
              
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto Máx.</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="number" v-model.number="filters.maxAmount" placeholder="Ej: 10000" class="form-input-premium-styled text-xs" />
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60">
              <thead class="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/60">
                <tr>
                  <th scope="col" class="p-4 w-12 text-center">
                    <input type="checkbox" @change="toggleSelectAll" :checked="areAllSelected" class="checkbox-lg-styled" />
                  </th>
                  <th scope="col" class="table-header">Paciente / Fecha</th>
                  <th scope="col" class="table-header">Instrumentador</th>
                  <th scope="col" class="table-header text-right">Monto a Pagar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                <tr v-if="filteredSurgeries.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">No se encontraron cirugías para los filtros aplicados.</td>
                </tr>
                <tr v-for="surgery in filteredSurgeries" :key="surgery.id" 
                    class="transition-all duration-150"
                    :class="{
                      'bg-indigo-50/30 dark:bg-indigo-950/10 border-l-2 border-indigo-500': selectedSurgeryIds.includes(surgery.id),
                      'opacity-50 text-slate-400 line-through bg-slate-50/40 dark:bg-slate-900/40': justPaidSurgeryIds.has(surgery.id)
                    }">
                  <td class="p-4 text-center">
                    <input 
                      type="checkbox" 
                      :value="surgery.id"
                      v-model="selectedSurgeryIds"
                      class="checkbox-lg-styled"
                      :disabled="justPaidSurgeryIds.has(surgery.id)"
                    />
                  </td>
                  <td class="table-cell">
                    <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ surgery.paciente }}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ formatDate(surgery.fecha_cirugia) }}</div>
                  </td>
                  <td class="table-cell text-slate-600 dark:text-slate-350">{{ surgery.instrumentador_nombre || 'No asignado' }}</td>
                  <td class="table-cell text-right">
                    <div class="inline-flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 px-2.5 py-0.5">
                      <span class="text-xs font-semibold text-slate-400">$</span>
                      <input 
                        type="number"
                        v-model.number="surgery.monto_a_pagar"
                        class="form-input-table-premium"
                        @focus="$event.target.select()"
                        :disabled="justPaidSurgeryIds.has(surgery.id)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-8">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-md p-6 space-y-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Resumen de Pago</h2>
            
            <div v-if="selectedSurgeryIds.length === 0" class="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-5 py-12 text-center text-slate-500 dark:text-slate-400 transition-all">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">No hay cirugías seleccionadas</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">Seleccioná una o más cirugías del listado para generar una orden de pago en lote.</p>
            </div>
            
            <div v-else class="space-y-6">
              <!-- Desglose por instrumentador en mini-cards -->
              <div class="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                <div v-for="inst in paymentSummary.instrumentadores" :key="inst.dni" class="p-3.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{{ inst.nombre }}</p>
                    <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">{{ inst.cirugias_count }} cirugía(s)</p>
                  </div>
                  <span class="text-sm font-bold text-slate-900 dark:text-slate-100 shrink-0">
                    {{ formatCurrency(inst.monto_total) }}
                  </span>
                </div>
              </div>

              <!-- Total consolidado -->
              <div class="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <div class="flex justify-between items-center text-slate-900 dark:text-slate-100">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total General</span>
                  <span class="text-xl font-extrabold">{{ formatCurrency(paymentSummary.monto_total_general) }}</span>
                </div>
              </div>

              <!-- Campos de Carga y Uploader -->
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notas del Lote (Opcional)</label>
                  <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                    <textarea v-model="paymentNotes" placeholder="Notas adicionales sobre este lote..." class="w-full p-3 bg-transparent border-none text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-0 h-20 resize-none"></textarea>
                  </div>
                </div>
                
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Comprobante de Transferencia</label>
                  <FileUpload 
                    v-if="showFileUploader"
                    ref="fileUploader" 
                    :owner-id="Date.now().toString()" 
                  />
                </div>
              </div>

              <!-- Botón Confirmar Orden -->
              <div class="pt-2">
                <button 
                  @click="registrarPago" 
                  :disabled="isSubmitting || !fileUploader?.hasFiles"
                  class="btn-primary-styled w-full"
                >
                  <span v-if="isSubmitting">Registrando Pago...</span>
                  <span v-else>Registrar Orden de Pago</span>
                </button>
                <p v-if="!fileUploader?.hasFiles" class="text-center mt-2.5 text-[11px] font-bold text-red-500 dark:text-red-400 tracking-wide uppercase">Se requiere un comprobante para registrar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <PostPagoModal 
      :show="isPostPagoModalVisible" 
      :payment-data="lastPaymentData"
      @close="handleClosePostPagoModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import FileUpload from '../../components/uploader/FileUpload.vue';
import PostPagoModal from '../../components/PostPagoModal.vue';

const { showSuccessToast, showErrorToast, showInfoToast, showLoadingToast, updateToast } = useToasts();

const isLoading = ref(true);
const error = ref(null);
const allPendingSurgeries = ref([]);
const selectedSurgeryIds = ref([]);
const paymentNotes = ref('');
const fileUploader = ref(null);
const isSubmitting = ref(false);
const isPostPagoModalVisible = ref(false);
const lastPaymentData = ref(null);
const showFileUploader = ref(true);
const justPaidSurgeryIds = ref(new Set());
const selectedKpiPeriod = ref('current-month');
const activeKpiFilter = ref(null);

const kpiPeriodOptions = [
  { value: 'current-month', label: 'Mes actual' },
  { value: 'last-30-days', label: 'Últimos 30 días' },
  { value: 'previous-month', label: 'Mes anterior' },
  { value: 'all', label: 'Todos' },
];

const filters = reactive({
  searchTerm: '',
  selectedInstrumentador: 'todos',
  startDate: '',
  endDate: '',
  minAmount: null,
  maxAmount: null,
});

const clearFilters = () => {
  filters.searchTerm = '';
  filters.selectedInstrumentador = 'todos';
  filters.startDate = '';
  filters.endDate = '';
  filters.minAmount = null;
  filters.maxAmount = null;
};

const getSurgeryDate = (surgery) => {
  if (!surgery?.fecha_cirugia) return null;
  const rawDate = String(surgery.fecha_cirugia);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? new Date(`${rawDate}T00:00:00`)
    : new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isCurrentMonthSurgery = (surgery) => {
  const surgeryDate = getSurgeryDate(surgery);
  if (!surgeryDate) return false;

  const today = new Date();
  return surgeryDate.getFullYear() === today.getFullYear() && surgeryDate.getMonth() === today.getMonth();
};

const isPreviousMonthSurgery = (surgery) => {
  const surgeryDate = getSurgeryDate(surgery);
  if (!surgeryDate) return false;

  const today = new Date();
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return surgeryDate.getFullYear() === previousMonth.getFullYear() && surgeryDate.getMonth() === previousMonth.getMonth();
};

const isLast30DaysSurgery = (surgery) => {
  const surgeryDate = getSurgeryDate(surgery);
  if (!surgeryDate) return false;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);
  startDate.setHours(0, 0, 0, 0);
  today.setHours(23, 59, 59, 999);

  return surgeryDate >= startDate && surgeryDate <= today;
};

const isInSelectedKpiPeriod = (surgery) => {
  if (selectedKpiPeriod.value === 'all') return true;
  if (selectedKpiPeriod.value === 'last-30-days') return isLast30DaysSurgery(surgery);
  if (selectedKpiPeriod.value === 'previous-month') return isPreviousMonthSurgery(surgery);
  return isCurrentMonthSurgery(surgery);
};

const getRealAmount = (surgery) => {
  const amount = Number(surgery?.monto_a_pagar);
  return Number.isFinite(amount) ? amount : null;
};

const hasAmountField = (surgery) => Object.prototype.hasOwnProperty.call(surgery || {}, 'monto_a_pagar');

const hasPositiveAmount = (surgery) => {
  const amount = getRealAmount(surgery);
  return amount !== null && amount > 0;
};

const hasMissingAmount = (surgery) => {
  if (!hasAmountField(surgery)) return false;
  return !hasPositiveAmount(surgery);
};

const instrumentadorOptions = computed(() => {
  if (!allPendingSurgeries.value) return [];
  const instrumentadores = allPendingSurgeries.value.reduce((acc, surgery) => {
    if (surgery.instrumentador_dni && !acc.some(i => i.dni === surgery.instrumentador_dni)) {
      acc.push({ dni: surgery.instrumentador_dni, nombre: surgery.instrumentador_nombre });
    }
    return acc;
  }, []);
  return instrumentadores.sort((a, b) => a.nombre.localeCompare(b.nombre));
});

const kpiPeriodSurgeries = computed(() => (
  allPendingSurgeries.value.filter(surgery => !justPaidSurgeryIds.value.has(surgery.id) && isInSelectedKpiPeriod(surgery))
));

const currentMonthAmount = computed(() => {
  const surgeries = kpiPeriodSurgeries.value;
  if (surgeries.length === 0) {
    return {
      status: 'empty',
      value: 'Sin pendientes',
      subtitle: '',
    };
  }

  if (!surgeries.some(hasAmountField)) {
    return {
      status: 'unavailable',
      value: 'Dato pendiente',
      subtitle: '',
    };
  }

  const amounts = surgeries.map(getRealAmount);
  const positiveAmounts = amounts.filter(amount => amount > 0);

  if (positiveAmounts.length === 0) {
    return {
      status: 'missing',
      value: 'Sin montos cargados',
      subtitle: 'Click para ver pendientes sin importe',
    };
  }

  return {
    status: 'ready',
    value: formatCurrency(positiveAmounts.reduce((sum, amount) => sum + amount, 0)),
    subtitle: '',
  };
});

const kpiPeriodInstrumentadoresCount = computed(() => {
  const instrumentadores = new Set();

  kpiPeriodSurgeries.value.forEach(surgery => {
    const key = surgery.instrumentador_dni || surgery.instrumentador_nombre;
    if (key) instrumentadores.add(key);
  });

  return instrumentadores.size;
});

const selectedKpiPeriodLabel = computed(() => (
  kpiPeriodOptions.find(option => option.value === selectedKpiPeriod.value)?.label || 'Mes actual'
));

const pendingKpiLabel = computed(() => {
  if (selectedKpiPeriod.value === 'last-30-days') return 'Pendientes últimos 30 días';
  if (selectedKpiPeriod.value === 'previous-month') return 'Pendientes mes anterior';
  if (selectedKpiPeriod.value === 'all') return 'Pendientes totales';
  return 'Pendientes del mes';
});

const amountKpiFilterMode = computed(() => (
  currentMonthAmount.value.status === 'ready' ? 'with-amount' : 'missing-amount'
));

const activeKpiLabel = computed(() => {
  const active = paymentKpis.value.find(stat => stat.filter === activeKpiFilter.value);
  return active?.label || '';
});

const paymentKpis = computed(() => [
  {
    filter: 'pending',
    label: pendingKpiLabel.value,
    value: kpiPeriodSurgeries.value.length,
    subtitle: selectedKpiPeriodLabel.value,
    isActive: activeKpiFilter.value === 'pending',
    iconPath: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    cardClass: 'border-amber-200 bg-white dark:border-amber-900/50 dark:bg-slate-800',
    activeClass: 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-500 dark:bg-amber-950/30 dark:ring-amber-900/70',
    iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    filter: 'amount',
    label: 'Monto pendiente',
    value: currentMonthAmount.value.value,
    subtitle: currentMonthAmount.value.subtitle || selectedKpiPeriodLabel.value,
    isActive: activeKpiFilter.value === 'amount',
    iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6',
    cardClass: currentMonthAmount.value.status === 'missing'
      ? 'border-amber-200 bg-white dark:border-amber-900/50 dark:bg-slate-800'
      : 'border-emerald-200 bg-white dark:border-emerald-900/50 dark:bg-slate-800',
    activeClass: currentMonthAmount.value.status === 'missing'
      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-500 dark:bg-amber-950/30 dark:ring-amber-900/70'
      : 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/30 dark:ring-emerald-900/70',
    iconClass: currentMonthAmount.value.status === 'missing'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    filter: 'instrumentadores',
    label: 'Instrumentadores',
    value: kpiPeriodInstrumentadoresCount.value,
    subtitle: 'Con pendientes',
    isActive: activeKpiFilter.value === 'instrumentadores',
    iconPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    cardClass: 'border-violet-200 bg-white dark:border-violet-900/50 dark:bg-slate-800',
    activeClass: 'border-violet-400 bg-violet-50 ring-2 ring-violet-200 dark:border-violet-500 dark:bg-violet-950/30 dark:ring-violet-900/70',
    iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  {
    filter: 'selected',
    label: 'Seleccionadas',
    value: selectedSurgeryIds.value.length,
    subtitle: 'Para lote actual',
    isActive: activeKpiFilter.value === 'selected',
    iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    cardClass: 'border-blue-200 bg-white dark:border-blue-900/50 dark:bg-slate-800',
    activeClass: 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 dark:border-blue-500 dark:bg-blue-950/30 dark:ring-blue-900/70',
    iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
]);

const applyKpiFilter = (filter) => {
  if (filter === 'selected' && selectedSurgeryIds.value.length === 0) {
    showInfoToast('No hay cirugías seleccionadas.');
    return;
  }

  activeKpiFilter.value = activeKpiFilter.value === filter ? null : filter;
};

const clearKpiFilter = () => {
  activeKpiFilter.value = null;
};

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('get_todas_cirugias_pendientes');
    if (rpcError) throw rpcError;
    allPendingSurgeries.value = data || [];
  } catch (err) {
    error.value = "No se pudo cargar la lista de cirugías pendientes.";
    showErrorToast(err, error.value);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const filteredSurgeries = computed(() => {
  let surgeries = [...allPendingSurgeries.value];

  if (filters.searchTerm) {
    const lowerCaseSearch = filters.searchTerm.toLowerCase();
    surgeries = surgeries.filter(surgery => {
      const pacienteMatch = surgery.paciente ? surgery.paciente.toLowerCase().includes(lowerCaseSearch) : false;
      const instrumentadorMatch = surgery.instrumentador_nombre ? surgery.instrumentador_nombre.toLowerCase().includes(lowerCaseSearch) : false;
      return pacienteMatch || instrumentadorMatch;
    });
  }

  if (filters.selectedInstrumentador !== 'todos') {
    surgeries = surgeries.filter(surgery => surgery.instrumentador_dni === filters.selectedInstrumentador);
  }

  if (filters.startDate) {
    surgeries = surgeries.filter(surgery => surgery.fecha_cirugia >= filters.startDate);
  }

  if (filters.endDate) {
    surgeries = surgeries.filter(surgery => surgery.fecha_cirugia <= filters.endDate);
  }

  if (filters.minAmount !== null && filters.minAmount > 0) {
    surgeries = surgeries.filter(surgery => surgery.monto_a_pagar >= filters.minAmount);
  }

  if (filters.maxAmount !== null && filters.maxAmount > 0) {
    surgeries = surgeries.filter(surgery => surgery.monto_a_pagar <= filters.maxAmount);
  }

  if (activeKpiFilter.value === 'pending') {
    surgeries = surgeries.filter(surgery => !justPaidSurgeryIds.value.has(surgery.id) && isInSelectedKpiPeriod(surgery));
  }

  if (activeKpiFilter.value === 'amount') {
    surgeries = surgeries.filter(surgery => {
      if (justPaidSurgeryIds.value.has(surgery.id) || !isInSelectedKpiPeriod(surgery)) return false;
      return amountKpiFilterMode.value === 'with-amount' ? hasPositiveAmount(surgery) : hasMissingAmount(surgery);
    });
  }

  if (activeKpiFilter.value === 'instrumentadores') {
    surgeries = surgeries
      .filter(surgery => !justPaidSurgeryIds.value.has(surgery.id) && isInSelectedKpiPeriod(surgery) && (surgery.instrumentador_dni || surgery.instrumentador_nombre))
      .sort((a, b) => (a.instrumentador_nombre || '').localeCompare(b.instrumentador_nombre || ''));
  }

  if (activeKpiFilter.value === 'selected') {
    surgeries = surgeries.filter(surgery => selectedSurgeryIds.value.includes(surgery.id));
  }

  return surgeries;
});

const areAllSelected = computed(() => 
  filteredSurgeries.value.length > 0 && 
  filteredSurgeries.value.every(s => selectedSurgeryIds.value.includes(s.id) || justPaidSurgeryIds.value.has(s.id))
);

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    const idsToSelect = filteredSurgeries.value
      .filter(s => !justPaidSurgeryIds.value.has(s.id))
      .map(s => s.id);
    selectedSurgeryIds.value = [...new Set([...selectedSurgeryIds.value, ...idsToSelect])];
  } else {
    const idsToUnselect = filteredSurgeries.value.map(s => s.id);
    selectedSurgeryIds.value = selectedSurgeryIds.value.filter(id => !idsToUnselect.includes(id));
  }
};

const paymentSummary = computed(() => {
  const summary = {
    instrumentadores: {},
    monto_total_general: 0,
  };
  const selected = allPendingSurgeries.value.filter(s => selectedSurgeryIds.value.includes(s.id));
  selected.forEach(surgery => {
    const dni = surgery.instrumentador_dni || 'sin-asignar';
    const nombre = surgery.instrumentador_nombre || 'No Asignado';
    const token = surgery.activity_token;

    if (!summary.instrumentadores[dni]) {
      summary.instrumentadores[dni] = {
        dni: dni,
        nombre: nombre,
        monto_total: 0,
        cirugias: [],
        cirugias_count: 0,
        activity_token: token,
      };
    }
    const inst = summary.instrumentadores[dni];
    const monto = Number(surgery.monto_a_pagar) || 0;
    inst.monto_total += monto;
    inst.cirugias.push({ id: surgery.id, monto: monto });
    inst.cirugias_count++;
    summary.monto_total_general += monto;
  });
  summary.instrumentadores = Object.values(summary.instrumentadores);
  return summary;
});

const registrarPago = async () => {
  if (isSubmitting.value || !fileUploader.value?.hasFiles) return;

  isSubmitting.value = true;
  const toastId = showLoadingToast("Subiendo comprobante...");

  try {
    const uploadResult = await fileUploader.value.startUpload('comprobantes-pago');
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se corrige la extracción de la clave del objeto para que coincida con la estructura real.
    if (!uploadResult || !Array.isArray(uploadResult) || uploadResult.length === 0 || !uploadResult[0].object_key) {
      console.error('[DEBUG] Estructura de uploadResult inesperada:', uploadResult);
      throw new Error("La subida del archivo no devolvió la clave del objeto esperada.");
    }
    
    const objectKey = uploadResult[0].object_key; // Se usa object_key con guion bajo.
    // --- FIN DE LA MODIFICACIÓN ---

    updateToast(toastId, "Comprobante subido. Registrando orden de pago...", 'info');

    const ordenDePago = {
      monto_total_general: paymentSummary.value.monto_total_general,
      comprobante_object_key: objectKey,
      notas: paymentNotes.value,
      pagos: paymentSummary.value.instrumentadores
        .filter(inst => inst.dni !== 'sin-asignar')
        .map(inst => ({
          instrumentador_dni: inst.dni,
          monto_total_instrumentador: inst.monto_total,
          cirugias: inst.cirugias.map(c => ({ id: c.id, monto: c.monto }))
      }))
    };

    if (ordenDePago.pagos.length === 0) {
      throw new Error("No hay pagos válidos para registrar (verifique asignación de instrumentadores).");
    }

    const { error: rpcError } = await supabase.rpc('registrar_orden_de_pago', { p_orden: ordenDePago });
    if (rpcError) throw rpcError;

    updateToast(toastId, "¡Orden de pago registrada con éxito!", 'success');
    
    lastPaymentData.value = JSON.parse(JSON.stringify(paymentSummary.value));
    
    selectedSurgeryIds.value.forEach(id => justPaidSurgeryIds.value.add(id));

    selectedSurgeryIds.value = [];
    paymentNotes.value = '';
    
    showFileUploader.value = false;
    await nextTick();
    showFileUploader.value = true;
    
    isPostPagoModalVisible.value = true;
    
  } catch (err) {
    console.error("Error al registrar el pago:", err);
    updateToast(toastId, `Error: ${err.message}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleClosePostPagoModal = () => {
  isPostPagoModalVisible.value = false;
  justPaidSurgeryIds.value.clear();
  fetchData();
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
</script>

<style scoped>
.form-input-premium-styled {
  @apply w-full px-4 py-3 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-0;
}

.form-input-select-styled {
  @apply w-full px-4 py-3 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-0 cursor-pointer;
}

.table-header {
  @apply px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200;
}

.checkbox-lg-styled {
  @apply h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-150 cursor-pointer;
}

.btn-clear {
  @apply bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-toggle-filters {
  @apply p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 shadow-sm;
  @apply hover:bg-slate-50 dark:hover:bg-slate-800;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center;
}

.form-input-table-premium {
  @apply w-24 text-right bg-transparent border-none px-1 py-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0;
}

.btn-primary-styled {
  @apply bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-sm transition-all duration-150;
  @apply hover:bg-indigo-700 hover:shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none;
  @apply active:scale-95 cursor-pointer;
}

/* Animaciones para expansión de filtros */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 150px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  border-top-color: transparent !important;
  overflow: hidden;
}
</style>
