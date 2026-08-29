<!-- src/components/InstrumentadoresFilters.vue -->
<template>
  <div class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/80 mb-6 transition-all">
    <div class="flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-between">
      
      <!-- Buscador Principal -->
      <div class="flex-1">
        <label for="search" class="filter-label flex items-center gap-1.5">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400" />
          <span>Buscar Instrumentador</span>
        </label>
        <div class="relative">
          <input 
            id="search" 
            type="text" 
            :value="modelValue.searchTerm" 
            @input="update('searchTerm', $event.target.value)" 
            placeholder="Buscar por Nombre Completo o DNI..." 
            class="filter-input pl-10 w-full"
          >
          <MagnifyingGlassIcon class="w-5 h-5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <button 
            v-if="modelValue.searchTerm" 
            @click="update('searchTerm', '')"
            class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Ordenamiento -->
      <div class="w-full md:w-48">
        <label for="sort-by" class="filter-label">Ordenar por</label>
        <select 
          id="sort-by" 
          :value="modelValue.sortBy" 
          @change="update('sortBy', $event.target.value)" 
          class="filter-input w-full cursor-pointer"
        >
          <option value="nombre_completo">👤 Nombre</option>
          <option value="ivo_score">⭐ Mejor IVO</option>
          <option value="fichas_enviadas">📋 Más Fichas</option>
        </select>
      </div>

      <!-- Dirección -->
      <div class="w-full md:w-36">
        <label class="filter-label">Dirección</label>
        <div class="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
          <button 
            @click="update('sortDir', 'desc')" 
            :class="['sort-button', { 'active': modelValue.sortDir === 'desc' }]"
            title="Mayor a Menor"
          >
            ▼ Desc
          </button>
          <button 
            @click="update('sortDir', 'asc')" 
            :class="['sort-button', { 'active': modelValue.sortDir === 'asc' }]"
            title="Menor a Mayor"
          >
            ▲ Asc
          </button>
        </div>
      </div>

      <!-- Acciones de Exportación -->
      <div class="flex items-end justify-end gap-2 pt-2 md:pt-0">
        <button 
          v-if="hasActiveFilters" 
          @click="clearFilters"
          class="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
        >
          <XMarkIcon class="w-4 h-4" />
          <span>Limpiar</span>
        </button>
        <button 
          @click="$emit('export')" 
          :disabled="exportDisabled"
          class="export-button"
        >
          <ArrowDownTrayIcon class="h-4 h-4 mr-1.5" />
          <span>Exportar Excel</span>
        </button>
      </div>
    </div>

    <!-- Filtros Avanzados (Colapsables o Rango IVO) -->
    <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-4 text-xs">
      <span class="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <FunnelIcon class="w-3.5 h-3.5" />
        Filtro IVO:
      </span>
      <div class="flex items-center gap-2">
        <input 
          id="min-ivo" 
          type="number" 
          step="0.5"
          :value="modelValue.minIvo" 
          @input="update('minIvo', $event.target.value)" 
          placeholder="Mín score" 
          class="filter-input-sm w-24"
        >
        <span class="text-slate-400">—</span>
        <input 
          id="max-ivo" 
          type="number" 
          step="0.5"
          :value="modelValue.maxIvo" 
          @input="update('maxIvo', $event.target.value)" 
          placeholder="Máx score" 
          class="filter-input-sm w-24"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  FunnelIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  exportDisabled: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue', 'export']);

const hasActiveFilters = computed(() => {
  return !!(
    props.modelValue.searchTerm || 
    props.modelValue.minIvo || 
    props.modelValue.maxIvo || 
    props.modelValue.sortBy !== 'nombre_completo' ||
    props.modelValue.sortDir !== 'asc'
  );
});

function update(key, value) {
  const newFilters = { ...props.modelValue };
  newFilters[key] = value;
  emit('update:modelValue', newFilters);
}

function clearFilters() {
  emit('update:modelValue', {
    searchTerm: '',
    sortBy: 'nombre_completo',
    sortDir: 'asc',
    minIvo: '',
    maxIvo: '',
  });
}
</script>

<style scoped>
.filter-label { @apply block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5; }
.filter-input { @apply px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm; }
.filter-input-sm { @apply px-2.5 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500; }
.sort-button { @apply flex-1 text-center px-2 py-1 text-xs font-medium rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 transition-all; }
.sort-button.active { @apply bg-blue-600 text-white shadow-sm hover:bg-blue-700; }
.export-button {
  @apply inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all;
}
</style>