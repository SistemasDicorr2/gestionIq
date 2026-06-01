<!-- src/views/admin/PagosDashboardView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Estación de Pagos Rápidos</h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Filtrá, ajustá y seleccioná cirugías para generar un lote de pago en una sola operación.
      </p>
    </header>

    <section v-if="!isLoading && !error" class="mb-6 space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div v-if="activeKpiFilter" class="flex flex-wrap items-center gap-2">
          <span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/30 dark:text-blue-200">
            Filtro activo: {{ activeKpiLabel }}
          </span>
          <button type="button" @click="clearKpiFilter" class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            Limpiar filtro
          </button>
        </div>
        <div v-else class="hidden sm:block"></div>

        <label class="flex flex-col gap-1 sm:w-56">
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Período</span>
          <select v-model="selectedKpiPeriod" class="form-input">
            <option v-for="option in kpiPeriodOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <button
        v-for="stat in paymentKpis"
        :key="stat.label"
        type="button"
        @click="applyKpiFilter(stat.filter)"
        class="rounded-xl border p-4 text-left shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        :class="[stat.cardClass, stat.isActive ? stat.activeClass : 'hover:-translate-y-0.5 hover:shadow-md']"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ stat.label }}</p>
            <p class="mt-2 break-words text-2xl font-bold leading-tight text-slate-900 dark:text-white">{{ stat.value }}</p>
            <p v-if="stat.subtitle" class="mt-1 text-xs leading-snug text-slate-500 dark:text-slate-400">{{ stat.subtitle }}</p>
            <p v-if="stat.isActive" class="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-300">Filtro activo</p>
          </div>
          <div class="rounded-full p-2.5" :class="stat.iconClass">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="stat.iconPath" />
            </svg>
          </div>
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
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-2">
              <label class="filter-label">Buscar</label>
              <input 
                type="text" 
                v-model="filters.searchTerm"
                placeholder="Paciente o instrumentador..."
                class="form-input"
              />
            </div>
            <div>
              <label class="filter-label">Instrumentador</label>
              <select v-model="filters.selectedInstrumentador" class="form-input">
                <option value="todos">Todos</option>
                <option v-for="inst in instrumentadorOptions" :key="inst.dni" :value="inst.dni">
                  {{ inst.nombre }}
                </option>
              </select>
            </div>
            <div class="self-end">
              <button @click="clearFilters" class="btn-secondary w-full">Limpiar Filtros</button>
            </div>
            <div>
              <label class="filter-label">Desde</label>
              <input type="date" v-model="filters.startDate" class="form-input" />
            </div>
            <div>
              <label class="filter-label">Hasta</label>
              <input type="date" v-model="filters.endDate" class="form-input" />
            </div>
            <div>
              <label class="filter-label">Monto Mín.</label>
              <input type="number" v-model.number="filters.minAmount" placeholder="Ej: 5000" class="form-input" />
            </div>
            <div>
              <label class="filter-label">Monto Máx.</label>
              <input type="number" v-model.number="filters.maxAmount" placeholder="Ej: 10000" class="form-input" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead class="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" class="p-4"><input type="checkbox" @change="toggleSelectAll" :checked="areAllSelected" class="checkbox-lg" /></th>
                  <th scope="col" class="table-header">Paciente / Fecha</th>
                  <th scope="col" class="table-header">Instrumentador</th>
                  <th scope="col" class="table-header text-right">Monto a Pagar</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                <tr v-if="filteredSurgeries.length === 0">
                  <td colspan="4" class="px-6 py-10 text-center text-gray-500 dark:text-slate-400">No se encontraron cirugías para los filtros aplicados.</td>
                </tr>
                <tr v-for="surgery in filteredSurgeries" :key="surgery.id" 
                    :class="{'bg-blue-50 dark:bg-blue-900/20': selectedSurgeryIds.includes(surgery.id),
                      'opacity-50 text-slate-400 line-through': justPaidSurgeryIds.has(surgery.id)}">
                  <td class="p-4">
                    <input 
                      type="checkbox" 
                      :value="surgery.id"
                      v-model="selectedSurgeryIds"
                      class="checkbox-lg"
                      :disabled="justPaidSurgeryIds.has(surgery.id)"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ surgery.paciente }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(surgery.fecha_cirugia) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{{ surgery.instrumentador_nombre || 'No asignado' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <input 
                      type="number"
                      v-model.number="surgery.monto_a_pagar"
                      class="form-input-table"
                      @focus="$event.target.select()"
                      :disabled="justPaidSurgeryIds.has(surgery.id)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-8">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <h2 class="text-xl font-bold mb-4">Resumen de Pago</h2>
            <div v-if="selectedSurgeryIds.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              <div class="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Seleccioná una o más cirugías para generar una orden de pago.</p>
            </div>
            <div v-else>
              <div class="space-y-3 mb-4">
                <div v-for="inst in paymentSummary.instrumentadores" :key="inst.dni" class="text-sm">
                  <div class="flex justify-between font-medium">
                    <span>{{ inst.nombre }}</span>
                    <span>{{ formatCurrency(inst.monto_total) }}</span>
                  </div>
                  <div class="text-xs text-slate-500">{{ inst.cirugias_count }} cirugía(s)</div>
                </div>
              </div>

              <div class="border-t border-slate-200 dark:border-slate-700 pt-4 mb-6">
                <div class="flex justify-between items-center text-lg font-bold">
                  <span>TOTAL GENERAL</span>
                  <span>{{ formatCurrency(paymentSummary.monto_total_general) }}</span>
                </div>
              </div>

              <div class="space-y-4">
                <textarea v-model="paymentNotes" placeholder="Notas adicionales (opcional)..." class="form-input h-20"></textarea>
                <FileUpload 
                  v-if="showFileUploader"
                  ref="fileUploader" 
                  :owner-id="Date.now().toString()" 
                />
              </div>

              <div class="mt-6">
                <button 
                  @click="registrarPago" 
                  :disabled="isSubmitting || !fileUploader?.hasFiles"
                  class="btn-primary w-full"
                >
                  <span v-if="isSubmitting">Registrando Pago...</span>
                  <span v-else>Registrar Orden de Pago</span>
                </button>
                <p v-if="!fileUploader?.hasFiles" class="text-xs text-center mt-2 text-red-500">Se requiere un comprobante para continuar.</p>
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
import { useToast } from 'vue-toastification';
import FileUpload from '../../components/uploader/FileUpload.vue';
import PostPagoModal from '../../components/PostPagoModal.vue';

const toast = useToast();

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
    toast.info('No hay cirugías seleccionadas.');
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
    toast.error(err.message);
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
    surgeries = surgeries.filter(surgery => new Date(surgery.fecha_cirugia) >= new Date(filters.startDate));
  }

  if (filters.endDate) {
    surgeries = surgeries.filter(surgery => new Date(surgery.fecha_cirugia) <= new Date(filters.endDate));
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
  const toastId = toast.info("Subiendo comprobante...", { timeout: false });

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

    toast.update(toastId, { content: "Comprobante subido. Registrando orden de pago..." });

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

    toast.update(toastId, { content: "¡Orden de pago registrada con éxito!", options: { type: 'success', timeout: 3000 } });
    
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
    toast.update(toastId, { content: `Error: ${err.message}`, options: { type: 'error', timeout: 5000 } });
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
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600; }
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400; }
.checkbox-lg { @apply h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600; }
.filter-label { @apply block text-xs font-medium text-slate-500 mb-1; }
.form-input-table {
  @apply w-28 text-right bg-slate-50 dark:bg-slate-700 border border-transparent rounded-md px-2 py-1;
  @apply focus:bg-white focus:dark:bg-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500;
}
</style>
