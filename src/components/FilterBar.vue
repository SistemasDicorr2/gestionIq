<!-- src/components/FilterBar.vue (Adaptable a Móviles y Pantallas de 19 pulgadas) -->
<template>
  <div class="bg-gradient-to-br from-[#132E50] via-[#183962] to-[#132E50] dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-slate-600/80 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-md mb-3 sm:mb-4 space-y-2.5 sm:space-y-3.5 select-none text-white relative overflow-hidden">
    
    <!-- FILA 1: Búsqueda por Paciente, Médico e Instrumentador -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
      <div class="space-y-1">
        <label for="paciente" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Paciente</label>
        <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 focus-within:border-brand-cyan focus-within:ring-2 focus-within:ring-brand-cyan/20 transition-all shadow-inner">
          <input type="text" v-model="filters.paciente" id="paciente" placeholder="Nombre del paciente..." class="form-input-premium" @keyup.enter="handleApply">
        </div>
      </div>
      
      <div class="space-y-1">
        <label for="medico" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Médico</label>
        <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 focus-within:border-brand-cyan focus-within:ring-2 focus-within:ring-brand-cyan/20 transition-all shadow-inner">
          <input type="text" v-model="filters.medico" id="medico" placeholder="Nombre del médico..." class="form-input-premium" @keyup.enter="handleApply">
        </div>
      </div>
      
      <div class="space-y-1">
        <label for="instrumentador" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Instrumentador</label>
        <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 focus-within:border-brand-cyan focus-within:ring-2 focus-within:ring-brand-cyan/20 transition-all shadow-inner">
          <input type="text" v-model="filters.instrumentador" id="instrumentador" placeholder="Nombre del instrumentador..." class="form-input-premium" @keyup.enter="handleApply">
        </div>
      </div>
    </div>

    <!-- FILA 2: Control de Rangos de Fechas -->
    <div class="grid grid-cols-2 sm:grid-cols-3 items-end gap-2 sm:gap-3">
      <div class="relative col-span-2 sm:col-span-1" ref="dateRangeMenu">
        <label class="block text-[10px] font-extrabold text-white uppercase tracking-wider mb-1">Fichas Recibidas</label>
        <button @click="isDateRangeMenuOpen = !isDateRangeMenuOpen" class="btn-secondary w-full flex items-center justify-between shadow-sm">
          <span>{{ selectedRangeLabel }}</span>
          <ChevronDownIcon class="h-3.5 w-3.5 text-slate-300 dark:text-slate-400" />
        </button>
        <Transition name="fade">
          <div v-if="isDateRangeMenuOpen" class="date-range-menu border border-slate-600">
            <button @click="setDateRange('today')" class="date-range-menu-item">Hoy</button>
            <button @click="setDateRange('week')" class="date-range-menu-item">Esta Semana</button>
            <button @click="setDateRange('month')" class="date-range-menu-item">Este Mes</button>
          </div>
        </Transition>
      </div>
      
      <div class="space-y-1">
        <label for="startDate" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Desde</label>
        <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 focus-within:border-brand-cyan focus-within:ring-2 focus-within:ring-brand-cyan/20 transition-all shadow-inner">
          <input type="date" v-model="filters.startDate" id="startDate" class="form-input-premium">
        </div>
      </div>
      
      <div class="space-y-1">
        <label for="endDate" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Hasta</label>
        <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 focus-within:border-brand-cyan focus-within:ring-2 focus-within:ring-brand-cyan/20 transition-all shadow-inner">
          <input type="date" v-model="filters.endDate" id="endDate" class="form-input-premium">
        </div>
      </div>
    </div>

    <!-- FILA 3: Filtros de Estado / Puntualidad y Botones de Acción -->
    <div class="border-t border-slate-600/50 dark:border-slate-800 pt-2.5">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3">
        
        <!-- Selectores de Filtro -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 flex-grow">
          <div class="space-y-1">
            <label for="status" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Estado</label>
            <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 shadow-inner">
              <select v-model="filters.estado" id="status" class="form-input-select">
                <option value="todos" class="bg-slate-900 text-white">Todos</option>
                <option value="Pendiente" class="bg-slate-900 text-white">Pendiente</option>
                <option value="Enviado" class="bg-slate-900 text-white">Enviado</option>
                <option value="Expirado" class="bg-slate-900 text-white">Expirado</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1">
            <label for="puntualidad" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Puntualidad ≤</label>
            <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 shadow-inner">
              <select v-model.number="filters.rating_puntualidad_max" id="puntualidad" class="form-input-select">
                <option :value="null" class="bg-slate-900 text-white">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n" class="bg-slate-900 text-white">{{ n }} ★</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1">
            <label for="condiciones" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Condiciones ≤</label>
            <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 shadow-inner">
              <select v-model.number="filters.rating_condiciones_max" id="condiciones" class="form-input-select">
                <option :value="null" class="bg-slate-900 text-white">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n" class="bg-slate-900 text-white">{{ n }} ★</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1">
            <label for="asesoramiento" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">Asesoramiento ≤</label>
            <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 shadow-inner">
              <select v-model.number="filters.rating_asesoramiento_max" id="asesoramiento" class="form-input-select">
                <option :value="null" class="bg-slate-900 text-white">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n" class="bg-slate-900 text-white">{{ n }} ★</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-1 col-span-2 sm:col-span-1">
            <label for="general" class="block text-[10px] font-extrabold text-white uppercase tracking-wider">General ≤</label>
            <div class="relative rounded-xl border border-slate-600/80 dark:border-slate-700 overflow-hidden bg-slate-900/60 dark:bg-slate-950/80 shadow-inner">
              <select v-model.number="filters.rating_evaluacion_general_max" id="general" class="form-input-select">
                <option :value="null" class="bg-slate-900 text-white">Cualquiera</option>
                <option v-for="n in 4" :key="n" :value="n" class="bg-slate-900 text-white">{{ n }} ★</option>
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
              <div v-if="isExportMenuOpen" class="export-menu border border-slate-700">
                <button @click="exportAndClose('export-lista')" class="export-menu-item">
                  <ClipboardDocumentListIcon class="h-4 w-4 text-cyan-400" />
                  <span>Exportar Lista</span>
                </button>
                <button @click="exportAndClose('export-trazabilidad')" class="export-menu-item">
                  <DocumentChartBarIcon class="h-4 w-4 text-cyan-400" />
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
import { ref, reactive, watch, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { 
  ChevronDownIcon, 
  ArrowDownTrayIcon, 
  ClipboardDocumentListIcon, 
  DocumentChartBarIcon 
} from '@heroicons/vue/24/outline';

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  isExporting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update-filters', 'export-lista', 'export-trazabilidad']);

const filters = reactive({
  paciente: '',
  medico: '',
  instrumentador: '',
  startDate: '',
  endDate: '',
  estado: 'todos',
  rating_puntualidad_max: null,
  rating_condiciones_max: null,
  rating_asesoramiento_max: null,
  rating_evaluacion_general_max: null,
  ...props.initialFilters
});

const isDateRangeMenuOpen = ref(false);
const dateRangeMenu = ref(null);
const selectedRangeLabel = ref('Personalizado');

onClickOutside(dateRangeMenu, () => { isDateRangeMenuOpen.value = false; });

const setDateRange = (type) => {
  const today = new Date();
  let start = new Date();

  if (type === 'today') {
    start = today;
    selectedRangeLabel.value = 'Hoy';
  } else if (type === 'week') {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(today.setDate(diff));
    selectedRangeLabel.value = 'Esta Semana';
  } else if (type === 'month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedRangeLabel.value = 'Este Mes';
  }

  filters.startDate = start.toISOString().split('T')[0];
  filters.endDate = new Date().toISOString().split('T')[0];
  isDateRangeMenuOpen.value = false;
  handleApply();
};

const handleApply = () => {
  emit('update-filters', { ...filters });
};

const handleClear = () => {
  filters.paciente = '';
  filters.medico = '';
  filters.instrumentador = '';
  filters.startDate = '';
  filters.endDate = '';
  filters.estado = 'todos';
  filters.rating_puntualidad_max = null;
  filters.rating_condiciones_max = null;
  filters.rating_asesoramiento_max = null;
  filters.rating_evaluacion_general_max = null;
  selectedRangeLabel.value = 'Personalizado';
  emit('update-filters', { ...filters });
};

watch(() => props.initialFilters, (newVal) => {
  Object.assign(filters, newVal);
}, { deep: true });

onMounted(() => {
  if (props.initialFilters) {
    Object.assign(filters, props.initialFilters);
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
  @apply w-full px-2.5 py-1.5 bg-transparent border-none text-slate-100 text-xs placeholder-slate-400 focus:outline-none focus:ring-0 font-medium;
}

.form-input-select {
  @apply w-full px-2.5 py-1.5 bg-transparent border-none text-slate-100 text-xs focus:outline-none focus:ring-0 cursor-pointer font-medium;
}

.btn-secondary {
  @apply bg-slate-900/80 dark:bg-slate-950 border border-slate-700 text-slate-200 font-bold py-1.5 px-3 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-800 dark:hover:bg-slate-900;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-clear-large {
  @apply bg-slate-800/90 dark:bg-slate-950 border border-slate-700 text-slate-200 font-extrabold py-1.5 px-3.5 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-700 hover:text-white dark:hover:bg-slate-800;
  @apply active:scale-95 transition-all duration-150 cursor-pointer text-center;
}

.btn-primary-large {
  @apply bg-brand-cyan hover:bg-cyan-600 text-white font-extrabold py-1.5 px-5 rounded-xl text-xs shadow-md transition-all duration-150;
  @apply disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed;
  @apply active:scale-95 cursor-pointer text-center;
}

.btn-export-premium {
  @apply bg-emerald-600 text-white font-extrabold p-2 rounded-xl shadow-md hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-wait;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center;
}

.export-menu, .date-range-menu {
  @apply absolute right-0 mt-1.5 w-48 origin-top-right rounded-2xl bg-[#0B213C] dark:bg-slate-900 border border-slate-700 shadow-2xl ring-1 ring-black/20 focus:outline-none z-30 p-1.5;
}

.export-menu-item, .date-range-menu-item {
  @apply flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs rounded-xl text-slate-100 hover:bg-slate-800/80 dark:hover:bg-slate-800 transition-colors cursor-pointer font-bold;
}

.fade-enter-active, .fade-leave-active { @apply transition ease-out duration-100; }
.fade-enter-from, .fade-leave-to { @apply transform opacity-0 scale-95; }
.fade-enter-to, .fade-leave-from { @apply transform opacity-100 scale-100; }
</style>