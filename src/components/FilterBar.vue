<!-- src/components/FilterBar.vue (Adaptable a Móviles y Pantallas de 19 pulgadas) -->
<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-5 rounded-2xl shadow-sm mb-4 sm:mb-6 space-y-3 sm:space-y-4">
    
    <!-- FILA 1: Búsqueda por Paciente, Médico e Instrumentador -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
      <div class="space-y-1">
        <label for="paciente" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paciente</label>
        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <input type="text" v-model="filters.paciente" id="paciente" placeholder="Nombre del paciente..." class="form-input-premium" @keyup.enter="handleApply">
        </div>
      </div>
      
      <div class="space-y-1">
        <label for="medico" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Médico</label>
        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <input type="text" v-model="filters.medico" id="medico" placeholder="Nombre del médico..." class="form-input-premium" @keyup.enter="handleApply">
        </div>
      </div>
      
      <div class="space-y-1">
        <label for="instrumentador" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Instrumentador</label>
        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <input type="text" v-model="filters.instrumentador" id="instrumentador" placeholder="Nombre del instrumentador..." class="form-input-premium" @keyup.enter="handleApply">
        </div>
      </div>
    </div>

    <!-- FILA 2: Control de Rangos de Fechas -->
    <div class="grid grid-cols-2 sm:grid-cols-3 items-end gap-2 sm:gap-3">
      <div class="relative col-span-2 sm:col-span-1" ref="dateRangeMenu">
        <label class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Fichas Recibidas</label>
        <button @click="isDateRangeMenuOpen = !isDateRangeMenuOpen" class="btn-secondary w-full flex items-center justify-between shadow-2xs">
          <span>{{ selectedRangeLabel }}</span>
          <ChevronDownIcon class="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        </button>
        <Transition name="fade">
          <div v-if="isDateRangeMenuOpen" class="date-range-menu border border-slate-100 dark:border-slate-700/80">
            <button @click="setDateRange('today')" class="date-range-menu-item">Hoy</button>
            <button @click="setDateRange('week')" class="date-range-menu-item">Esta Semana</button>
            <button @click="setDateRange('month')" class="date-range-menu-item">Este Mes</button>
          </div>
        </Transition>
      </div>
      
      <div class="space-y-1">
        <label for="startDate" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Desde</label>
        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <input type="date" v-model="filters.startDate" id="startDate" class="form-input-premium">
        </div>
      </div>
      
      <div class="space-y-1">
        <label for="endDate" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hasta</label>
        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <input type="date" v-model="filters.endDate" id="endDate" class="form-input-premium">
        </div>
      </div>
    </div>

    <!-- FILA 3: Filtros de Estado / Puntualidad y Botones de Acción -->
    <div class="border-t border-slate-100 dark:border-slate-800/80 pt-3">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3">
        
        <!-- Selectores de Filtro -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 flex-grow">
          <div class="space-y-1">
            <label for="status" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estado</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
              <select v-model="filters.estado" id="status" class="form-input-select">
                <option value="todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Enviado">Enviado</option>
                <option value="Expirado">Expirado</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1">
            <label for="puntualidad" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Puntualidad ≤</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
              <select v-model.number="filters.rating_puntualidad_max" id="puntualidad" class="form-input-select">
                <option :value="null">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1">
            <label for="condiciones" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Condiciones ≤</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
              <select v-model.number="filters.rating_condiciones_max" id="condiciones" class="form-input-select">
                <option :value="null">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1">
            <label for="asesoramiento" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Asesoramiento ≤</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
              <select v-model.number="filters.rating_asesoramiento_max" id="asesoramiento" class="form-input-select">
                <option :value="null">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1 col-span-2 sm:col-span-1">
            <label for="general" class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">General ≤</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
              <select v-model.number="filters.rating_evaluacion_general_max" id="general" class="form-input-select">
                <option :value="null">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Botones de Acción -->
        <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
          <button @click="handleClear" class="btn-clear-large flex-1 sm:flex-none">Limpiar</button>
          <button @click="handleApply" class="btn-primary-large flex-1 sm:flex-none">Aplicar Filtros</button>
          
          <div class="relative" ref="exportMenu">
            <button @click="toggleExportMenu" class="btn-export-premium" :disabled="isExporting" title="Exportar reporte PDF">
              <ArrowDownTrayIcon class="h-4 w-4" />
            </button>
            <Transition name="fade">
              <div v-if="isExportMenuOpen" class="export-menu border border-slate-100 dark:border-slate-700/80">
                <button @click="exportAndClose('export-lista')" class="export-menu-item">
                  <ClipboardDocumentListIcon class="h-4 w-4 text-slate-500" />
                  <span>Exportar Lista</span>
                </button>
                <button @click="exportAndClose('export-trazabilidad')" class="export-menu-item">
                  <DocumentChartBarIcon class="h-4 w-4 text-slate-500" />
                  <span>Exportar Trazabilidad</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { onClickOutside } from '@vueuse/core';
import { 
  ArrowDownTrayIcon, 
  ClipboardDocumentListIcon, 
  DocumentChartBarIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  isExporting: { type: Boolean, default: false }
});
const emit = defineEmits(['update-filters', 'export-lista', 'export-trazabilidad']);

const filters = reactive({
  paciente: '',
  medico: '',
  instrumentador: '',
  estado: 'todos',
  startDate: '',
  endDate: '',
  dateFilterField: 'fecha_cirugia',
  rating_puntualidad_max: null,
  rating_condiciones_max: null,
  rating_asesoramiento_max: null,
  rating_evaluacion_general_max: null,
});

const handleApply = () => {
  emit('update-filters', { ...filters });
};

const clearFilters = () => {
  Object.assign(filters, {
    paciente: '',
    medico: '',
    instrumentador: '',
    estado: 'todos',
    startDate: '',
    endDate: '',
    dateFilterField: 'fecha_cirugia',
    rating_puntualidad_max: null,
    rating_condiciones_max: null,
    rating_asesoramiento_max: null,
    rating_evaluacion_general_max: null,
  });
};

const handleClear = () => {
  clearFilters();
  selectedRangeLabel.value = 'Personalizado';
  handleApply();
};

const formatDateForInput = (date) => format(date, 'yyyy-MM-dd');

const selectedRangeLabel = ref('Personalizado');
const isDateRangeMenuOpen = ref(false);
const dateRangeMenu = ref(null);
onClickOutside(dateRangeMenu, () => { isDateRangeMenuOpen.value = false; });

const setDateRange = (range) => {
  clearFilters();
  filters.estado = 'Enviado';
  filters.dateFilterField = 'fecha_envio';
  const now = new Date();
  
  if (range === 'today') {
    filters.startDate = formatDateForInput(startOfDay(now));
    filters.endDate = formatDateForInput(endOfDay(now));
    selectedRangeLabel.value = 'Hoy';
  } else if (range === 'week') {
    filters.startDate = formatDateForInput(startOfWeek(now, { weekStartsOn: 1 }));
    filters.endDate = formatDateForInput(endOfWeek(now, { weekStartsOn: 1 }));
    selectedRangeLabel.value = 'Esta Semana';
  } else if (range === 'month') {
    filters.startDate = formatDateForInput(startOfMonth(now));
    filters.endDate = formatDateForInput(endOfMonth(now));
    selectedRangeLabel.value = 'Este Mes';
  }
  
  isDateRangeMenuOpen.value = false;
  handleApply();
};

watch([() => filters.startDate, () => filters.endDate], () => {
  if (isDateRangeMenuOpen.value === false) {
    selectedRangeLabel.value = 'Personalizado';
    filters.dateFilterField = 'fecha_cirugia';
  }
});

const isExportMenuOpen = ref(false);
const exportMenu = ref(null);
const toggleExportMenu = () => { isExportMenuOpen.value = !isExportMenuOpen.value; };
onClickOutside(exportMenu, () => { isExportMenuOpen.value = false; });

const exportAndClose = (eventName) => {
  emit(eventName);
  isExportMenuOpen.value = false;
};
</script>

<style scoped>
.form-input-premium {
  @apply w-full px-2.5 py-1.5 bg-transparent border-none text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-0;
}

.form-input-select {
  @apply w-full px-2.5 py-1.5 bg-transparent border-none text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-0 cursor-pointer;
}

.btn-secondary {
  @apply bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-bold py-1.5 px-3 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-200 dark:hover:bg-slate-700;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-clear-large {
  @apply bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-extrabold py-1.5 px-3 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white;
  @apply active:scale-95 transition-all duration-150 cursor-pointer text-center;
}

.btn-primary-large {
  @apply bg-brand-navy text-white font-extrabold py-1.5 px-4 rounded-xl text-xs shadow-sm transition-all duration-150;
  @apply hover:bg-brand-navy-light hover:shadow-sm disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed;
  @apply active:scale-95 cursor-pointer text-center;
}

.btn-export-premium {
  @apply bg-emerald-600 text-white font-extrabold p-2 rounded-xl shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-wait;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center;
}

.export-menu, .date-range-menu {
  @apply absolute right-0 mt-1.5 w-48 origin-top-right rounded-2xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10 p-1.5;
}

.export-menu-item, .date-range-menu-item {
  @apply flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer font-bold;
}

.fade-enter-active, .fade-leave-active { @apply transition ease-out duration-100; }
.fade-enter-from, .fade-leave-to { @apply transform opacity-0 scale-95; }
.fade-enter-to, .fade-leave-from { @apply transform opacity-100 scale-100; }
</style>