<!-- src/components/FormStepComments.vue (Con Contraste de Texto y Modo Oscuro Corregido) -->
<template>
  <div>
    <div class="space-y-6 sm:space-y-8">
      <!-- Título de la Sección -->
      <div>
        <h2 class="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">Consumo y Observaciones</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Detallá el material utilizado y cualquier otra información relevante.</p>
      </div>

      <!-- Campos de Texto -->
      <div class="space-y-5 sm:space-y-6">
        <div>
          <label for="consumo_realizado" class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Consumo realizado en la cirugía <span class="text-rose-500">*</span>
          </label>
          <textarea 
            id="consumo_realizado" 
            :value="formData.consumo_realizado"
            @input="updateFormData({ consumo_realizado: $event.target.value })"
            rows="4" 
            class="form-input mt-1.5"
            placeholder="Ej: 2 tornillos de 4.5mm, 1 placa de titanio..."
          ></textarea>
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Por favor, detallar cada ítem en una línea nueva. Ej: "1 x Placa de tibia proximal", "6 x Tornillos corticales 5mm".
          </p>
          <p v-if="errors.consumo_realizado" class="text-xs text-rose-500 font-bold mt-1">{{ errors.consumo_realizado }}</p>
        </div>
        
        <div>
          <label for="observaciones" class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            ¿Cómo podemos mejorar? Tu feedback es clave
          </label>
          <textarea 
            id="observaciones" 
            :value="formData.observaciones"
            @input="updateFormData({ observaciones: $event.target.value })"
            rows="4" 
            class="form-input mt-1.5"
            placeholder="Ej: El set de placas llegó sin la guía. / La caja de tornillos estaba abierta. / Sería útil tener una pinza adicional para..."
          ></textarea>
        </div>
      </div>

      <!-- Logística y Datos Adicionales -->
      <div class="space-y-5 sm:space-y-6 pt-5 border-t border-slate-200/70 dark:border-slate-800">
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Datos de Cierre</h3>
        
        <fieldset>
          <legend class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Logística <span class="text-rose-500">*</span>
          </legend>
          <div class="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <input type="radio" id="con_logistica" name="tipo_logistica" value="con_logistica" :checked="formData.tipo_logistica === 'con_logistica'" @change="updateFormData({ tipo_logistica: 'con_logistica' })" class="sr-only">
              <label for="con_logistica" class="segmented-button-large"><TruckIcon class="h-5 w-5 mr-2 shrink-0" />CON Logística</label>
            </div>
            <div>
              <input type="radio" id="sin_logistica" name="tipo_logistica" value="sin_logistica" :checked="formData.tipo_logistica === 'sin_logistica'" @change="updateFormData({ tipo_logistica: 'sin_logistica' })" class="sr-only">
              <label for="sin_logistica" class="segmented-button-large"><BuildingStorefrontIcon class="h-5 w-5 mr-2 shrink-0" />SIN Logística</label>
            </div>
          </div>
          <p v-if="errors.tipo_logistica" class="text-xs text-rose-500 font-bold mt-1">{{ errors.tipo_logistica }}</p>
        </fieldset>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="transporte" class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Transporte utilizado</label>
            <input type="text" id="transporte" :value="formData.transporte_utilizado" @input="updateFormData({ transporte_utilizado: $event.target.value })" class="form-input mt-1.5" placeholder="Ej: Moto, Correo Andreani, etc.">
          </div>
          <div>
            <label for="duracion_cirugia" class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Duración de la Cirugía</label>
            <input type="text" id="duracion_cirugia" :value="formData.duracion_cirugia" @input="updateFormData({ duracion_cirugia: $event.target.value })" class="form-input mt-1.5" placeholder="Ej: 2 horas 30 minutos">
          </div>
        </div>
        
        <div>
          <label for="representante" class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Representante de ventas</label>
          <button 
            type="button"
            id="representante"
            @click="isRepModalOpen = true"
            class="form-input mt-1.5 text-left w-full flex items-center justify-between cursor-pointer"
          >
            <span :class="formData.representante_ventas ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500'">
              {{ formData.representante_ventas || 'Seleccionar un representante...' }}
            </span>
            <ChevronUpDownIcon class="h-5 w-5 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>

    <SalesRepresentativeModal 
      :show="isRepModalOpen" 
      @close="isRepModalOpen = false"
      @select="handleRepresentativeSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { TruckIcon, BuildingStorefrontIcon, ChevronUpDownIcon } from '@heroicons/vue/24/outline';
import SalesRepresentativeModal from './SalesRepresentativeModal.vue';

const props = defineProps({
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:form-data']);

const updateFormData = (payload) => {
  emit('update:form-data', payload);
};

const isRepModalOpen = ref(false);

const handleRepresentativeSelect = (name) => {
  updateFormData({ representante_ventas: name });
  isRepModalOpen.value = false;
};
</script>

<style scoped>
.form-input {
  @apply block w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600;
}

textarea.form-input {
  @apply h-auto py-3;
}
.segmented-button-large {
  @apply w-full flex items-center justify-center h-12 px-4 rounded-2xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer;
  @apply border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800;
}
input[type="radio"]:checked + label.segmented-button-large {
  @apply bg-blue-600 text-white border-blue-600 shadow-sm;
}
input[type="radio"]:focus-visible + label.segmented-button-large {
  @apply ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>