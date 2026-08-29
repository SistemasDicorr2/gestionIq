<!-- src/components/EditInstrumentadorModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-hidden" @click.self="$emit('close')">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all border border-slate-100 dark:border-slate-700">
        
        <!-- Header del Modal (Fixed) -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Editar Instrumentador</h2>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
            &times;
          </button>
        </div>

        <!-- Body Scrollable -->
        <form v-if="formData" @submit.prevent="handleSubmit" id="edit-instrumentador-form" class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/80 pb-2">
              Datos Personales
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label for="nombre_completo" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Nombre Completo</label>
                <input v-model="formData.nombre_completo" type="text" id="nombre_completo" required class="form-input" />
              </div>
              <div>
                <label for="dni" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">DNI (No editable)</label>
                <input :value="formData.dni" type="text" id="dni" disabled class="form-input bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label for="cuil" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">CUIT / CUIL</label>
                <input v-model="formData.cuil" type="text" id="cuil" class="form-input" />
              </div>
              <div>
                <label for="telefono" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Teléfono</label>
                <input v-model="formData.telefono" type="tel" id="telefono" class="form-input" />
              </div>
              <div>
                <label for="lugar_trabajo" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Lugar de Trabajo</label>
                <input v-model="formData.lugar_trabajo" type="text" id="lugar_trabajo" class="form-input" />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/80 pb-2">
              Datos Bancarios
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="banco" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Banco</label>
                <input v-model="formData.banco" type="text" id="banco" class="form-input" />
              </div>
              <div>
                <label for="cbu" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">CBU</label>
                <input v-model="formData.cbu" type="text" id="cbu" class="form-input" />
              </div>
              <div class="sm:col-span-2">
                <label for="alias_bancario" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Alias Bancario</label>
                <input v-model="formData.alias_bancario" type="text" id="alias_bancario" class="form-input" />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/80 pb-2">
              Programa IQ
            </h3>
            <div>
              <label for="puntos_manuales" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Puntos Manuales</label>
              <input v-model.number="formData.puntos_manuales" type="number" id="puntos_manuales" class="form-input sm:w-1/2" />
            </div>
          </div>
        </form>
        
        <!-- Footer del Modal (Fixed) -->
        <div class="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3 shrink-0">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
            Cancelar
          </button>
          <button @click="handleSubmit" :disabled="isSubmitting" class="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50">
            {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

const props = defineProps({ show: Boolean, instrumentador: Object });
const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const isSubmitting = ref(false);
const formData = ref(null);

watch(() => props.instrumentador, (newInstrumentador) => {
  if (newInstrumentador) {
    formData.value = { ...newInstrumentador };
  } else {
    formData.value = null;
  }
}, { immediate: true, deep: true });

const handleSubmit = async () => {
  if (!formData.value) return;
  isSubmitting.value = true;
  try {
    const updateData = {
      nombre_completo: formData.value.nombre_completo,
      alias: formData.value.alias,
      telefono: formData.value.telefono,
      lugar_trabajo: formData.value.lugar_trabajo,
      cuil: formData.value.cuil,
      puntos_manuales: formData.value.puntos_manuales,
      cbu: formData.value.cbu,
      alias_bancario: formData.value.alias_bancario,
      banco: formData.value.banco
    };

    const { error } = await supabase
      .from('instrumentadores')
      .update(updateData)
      .eq('dni', formData.value.dni);
    
    if (error) throw error;

    toast.success('Instrumentador actualizado con éxito.');
    emit('updated');
    emit('close');

  } catch (err) {
    toast.error('Error al actualizar el instrumentador: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
input, select {
  @apply border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white;
}
button {
  @apply bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500;
}
button.bg-blue-600 {
  @apply text-white border-transparent;
}
</style>