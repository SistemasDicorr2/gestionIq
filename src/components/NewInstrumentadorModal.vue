<!-- src/components/NewInstrumentadorModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-hidden" @click.self="$emit('close')">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all border border-slate-100 dark:border-slate-700">
        
        <!-- Header del Modal (Fixed) -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Nuevo Instrumentador</h2>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg class="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body Scrollable -->
        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-5 sm:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div class="space-y-4">
              <div>
                <label for="new-nombre_completo" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Nombre Completo</label>
                <input v-model="formData.nombre_completo" type="text" id="new-nombre_completo" required class="form-input" />
              </div>
              <div>
                <label for="new-dni" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">DNI</label>
                <input v-model="formData.dni" type="text" id="new-dni" required class="form-input" />
              </div>
              <div>
                <label for="new-cuil" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">CUIL</label>
                <input v-model="formData.cuil" type="text" id="new-cuil" class="form-input" />
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label for="new-alias" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Alias</label>
                <input v-model="formData.alias" type="text" id="new-alias" class="form-input" />
              </div>
              <div>
                <label for="new-telefono" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Teléfono</label>
                <input v-model="formData.telefono" type="tel" id="new-telefono" class="form-input" />
              </div>
              <div>
                <label for="new-lugar_trabajo" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Lugar de Trabajo</label>
                <input v-model="formData.lugar_trabajo" type="text" id="new-lugar_trabajo" class="form-input" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="new-puntos_manuales" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Puntos Manuales (Inicial)</label>
              <input v-model.number="formData.puntos_manuales" type="number" id="new-puntos_manuales" class="form-input" />
            </div>

          </div>
        </form>
        
        <!-- Footer del Modal (Fixed) -->
        <div class="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3 shrink-0">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
            Cancelar
          </button>
          <button @click="handleSubmit" :disabled="isSubmitting" class="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50">
            {{ isSubmitting ? 'Creando...' : 'Crear Instrumentador' }}
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

const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(['close', 'created']);

const toast = useToast();
const isSubmitting = ref(false);

const initialFormData = {
  nombre_completo: '',
  dni: '',
  cuil: '',
  alias: '',
  telefono: '',
  lugar_trabajo: '',
  puntos_manuales: 0,
};
const formData = ref({ ...initialFormData });

const handleSubmit = async () => {
  if (!formData.value.nombre_completo || !formData.value.dni) {
    toast.error('El Nombre Completo y el DNI son obligatorios.');
    return;
  }

  isSubmitting.value = true;
  try {
    const { error } = await supabase
      .from('instrumentadores')
      .insert([formData.value]);
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('El DNI ingresado ya existe.');
      }
      throw error;
    }

    toast.success('Instrumentador creado con éxito.');
    emit('created');
    emit('close');

  } catch (err) {
    toast.error('Error al crear el instrumentador: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    formData.value = { ...initialFormData };
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>