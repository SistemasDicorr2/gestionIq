<!-- src/components/ReportCard.vue (Refactorizado, limpio y con acción de expirar) -->
<template>
  <div class="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 space-y-3">
    
    <!-- Encabezado con datos y estado -->
    <div class="flex justify-between items-start gap-2">
      <div class="min-w-0 flex-1">
        <p class="font-bold text-lg text-gray-800 dark:text-slate-100 break-words leading-tight">{{ reporte.paciente }}</p>
        <p class="text-sm text-gray-600 dark:text-slate-300 mt-0.5">{{ reporte.medico }}</p>
        <p v-if="reporte.instrumentador_completado" class="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">
          <span class="font-medium">Completado por:</span> {{ reporte.instrumentador_completado }}
        </p>
      </div>
      <div class="flex flex-col items-end space-y-2 shrink-0">
        <!-- Lógica de clases para el estado -->
        <span :class="['px-2 py-0.5 inline-flex text-xxs leading-5 font-semibold rounded-full whitespace-nowrap', {
          'bg-green-100 text-green-800': reporte.estado === 'Enviado',
          'bg-yellow-100 text-yellow-800': reporte.estado === 'Pendiente',
          'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200': reporte.estado === 'Expirado',
        }]">
          {{ reporte.estado || 'Pendiente' }}
        </span>

        <!-- Botón circular de copia rápida -->
        <button 
          @click="handleCopyOrOpen"
          :class="[
            'p-2 rounded-full border transition-all duration-150 active:scale-95 shadow-sm',
            reporte.short_code 
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50' 
              : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60'
          ]"
          :title="reporte.short_code ? 'Copiar enlace rápido' : 'Generar enlace'"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Acciones unificadas y con la nueva opción de expirar -->
    <div class="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center space-x-4">
      <button 
        @click="$emit('share', reporte)" 
        :disabled="isGenerating"
        class="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400"
      >
        {{ isGenerating ? '...' : 'Compartir' }}
      </button>

      <button 
        @click="$emit('details', reporte)" 
        class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
      >
        Detalles
      </button>

      <button 
        @click="$emit('expire', reporte)" 
        class="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        Expirar
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  reporte: {
    type: Object,
    required: true
  },
  isGenerating: Boolean,
});

const emit = defineEmits(['share', 'details', 'expire', 'copy-link']);

const handleCopyOrOpen = () => {
  if (props.reporte.short_code) {
    emit('copy-link', props.reporte);
  } else {
    emit('share', props.reporte);
  }
};
</script>

<style scoped>
.text-xxs {
  font-size: 0.7rem;
}
</style>