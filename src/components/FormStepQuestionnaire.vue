<!-- src/components/FormStepQuestionnaire.vue (Diseño Adaptado con Alto Contraste y Responsive) -->
<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Título de la Sección -->
    <div>
      <h2 class="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">Cuestionario de Calidad</h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Responda las siguientes preguntas sobre el servicio.</p>
    </div>

    <!-- Controles Segmentados (Sí/No) -->
    <div class="space-y-5">
      <!-- Pregunta 1: Set Completo -->
      <div>
        <label class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">1. ¿Recibió el set de Instrumental/Implantes completo? <span class="text-rose-500">*</span></label>
        <div class="mt-2.5 inline-flex gap-2.5">
          <button 
            type="button"
            @click="updateFormData({ set_completo: true })"
            :class="['segmented-button', { 'active': formData.set_completo === true }]"
            :aria-pressed="formData.set_completo === true"
          >
            Sí
          </button>
          <button 
            type="button"
            @click="updateFormData({ set_completo: false })"
            :class="['segmented-button', { 'active': formData.set_completo === false }]"
            :aria-pressed="formData.set_completo === false"
          >
            No
          </button>
        </div>
        <p v-if="errors.set_completo" class="text-xs text-rose-500 font-bold mt-1.5">{{ errors.set_completo }}</p>
      </div>

      <!-- Pregunta 2: Informó Faltante (condicional) -->
      <Transition name="fade-slide">
        <div v-if="formData.set_completo === false">
          <label class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">2. Si fue negativa, ¿se le informó a tiempo sobre la falta? <span class="text-rose-500">*</span></label>
          <div class="mt-2.5 inline-flex gap-2.5">
            <button 
              type="button"
              @click="updateFormData({ informe_faltante: true })"
              :class="['segmented-button', { 'active': formData.informe_faltante === true }]"
              :aria-pressed="formData.informe_faltante === true"
            >
              Sí
            </button>
            <button 
              type="button"
              @click="updateFormData({ informe_faltante: false })"
              :class="['segmented-button', { 'active': formData.informe_faltante === false }]"
              :aria-pressed="formData.informe_faltante === false"
            >
              No
            </button>
          </div>
          <p v-if="errors.informe_faltante" class="text-xs text-rose-500 font-bold mt-1.5">{{ errors.informe_faltante }}</p>
        </div>
      </Transition>
    </div>

    <!-- Chips de Rating (1-5) -->
    <div class="space-y-5 pt-5 border-t border-slate-200/80 dark:border-slate-800">
      <div>
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Evaluación del Servicio</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Califique de 1 (Malo) a 5 (Excelente).</p>
      </div>
      
      <div v-for="rating in ratings" :key="rating.key" class="space-y-2">
        <label class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{{ rating.label }} <span class="text-rose-500">*</span></label>
        <div class="flex items-center gap-2">
          <button 
            v-for="value in 5" 
            :key="value"
            type="button"
            @click="updateFormData({ [rating.key]: value })"
            class="rating-chip cursor-pointer"
            :class="[
              formData[rating.key] === value ? `ring-2 ring-blue-500 scale-105 ${ratingColors[value-1].active}` : ratingColors[value-1].inactive
            ]"
          >
            {{ value }}
          </button>
        </div>
        <p v-if="errors[rating.key]" class="text-xs text-rose-500 font-bold mt-1">{{ errors[rating.key] }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['update:form-data']);

const updateFormData = (payload) => {
  emit('update:form-data', payload);
};

const ratings = [
  { key: 'rating_puntualidad', label: 'Puntualidad de entrega' },
  { key: 'rating_condiciones', label: 'Condiciones del instrumental' },
  { key: 'rating_asesoramiento', label: 'Asesoramiento del técnico' },
  { key: 'rating_evaluacion_general', label: 'Evaluación general' },
];

const ratingColors = [
  { inactive: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50', active: 'bg-rose-600 text-white shadow-sm' },
  { inactive: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50', active: 'bg-amber-600 text-white shadow-sm' },
  { inactive: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900/50', active: 'bg-yellow-600 text-white shadow-sm' },
  { inactive: 'bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-300 border border-lime-200 dark:border-lime-900/50', active: 'bg-lime-600 text-white shadow-sm' },
  { inactive: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50', active: 'bg-emerald-600 text-white shadow-sm' },
];
</script>

<style scoped>
.segmented-button {
  @apply rounded-2xl px-5 py-2 text-xs sm:text-sm font-extrabold border transition-all cursor-pointer;
  @apply border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800;
}
.segmented-button.active {
  @apply bg-blue-600 text-white border-blue-600 shadow-sm;
}
.rating-chip {
  @apply h-9 w-9 sm:h-11 sm:w-11 grid place-content-center rounded-2xl font-black text-sm sm:text-base transition-all duration-150 transform hover:scale-110 active:scale-95;
}
</style>