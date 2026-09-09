<!-- src/components/EditInstrumentadorModal.vue -->
<template>
  <Transition name="fade">
    <div 
      v-if="show" 
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      @click.self="$emit('close')"
    >
      <div class="relative w-full max-w-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-3xl my-auto transform transition-all">
        
        <!-- Header del Modal -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 shrink-0">
          <div class="flex items-center gap-3.5">
            <div class="flex items-center justify-center w-11 h-11 text-sm font-black text-blue-700 bg-blue-100 rounded-2xl shadow-inner dark:bg-blue-950/80 dark:text-blue-200 border border-blue-200/60 dark:border-blue-900/50">
              {{ iniciales }}
            </div>
            <div>
              <h2 class="text-lg sm:text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Editar Instrumentador
              </h2>
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                DNI: <span class="font-mono text-slate-700 dark:text-slate-300 font-bold">{{ formData?.dni || 'N/A' }}</span>
              </p>
            </div>
          </div>

          <button 
            @click="$emit('close')" 
            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            title="Cerrar ventana"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Body Scrollable del Formulario -->
        <form 
          v-if="formData" 
          @submit.prevent="handleSubmit" 
          id="edit-instrumentador-form" 
          class="p-6 space-y-6 max-h-[75vh] overflow-y-auto"
        >
          <!-- SECCIÓN 1: DATOS PERSONALES -->
          <div class="p-5 border rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Datos Personales y Contacto
              </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label for="nombre_completo" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre Completo <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="formData.nombre_completo" 
                  type="text" 
                  id="nombre_completo" 
                  required 
                  placeholder="Ej: Perez Maria Laura"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
                />
              </div>

              <div>
                <label for="dni" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  DNI (No editable)
                </label>
                <div class="relative">
                  <input 
                    :value="formData.dni" 
                    type="text" 
                    id="dni" 
                    disabled 
                    class="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                  />
                  <span class="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">Bloqueado</span>
                </div>
              </div>

              <div>
                <label for="cuil" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  CUIT / CUIL
                </label>
                <input 
                  v-model="formData.cuil" 
                  type="text" 
                  id="cuil" 
                  placeholder="Ej: 27345119334"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
                />
              </div>

              <div>
                <label for="telefono" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Teléfono de Contacto
                </label>
                <input 
                  v-model="formData.telefono" 
                  type="tel" 
                  id="telefono" 
                  placeholder="Ej: 3794123456"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
                />
              </div>

              <div>
                <label for="lugar_trabajo" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Lugar de Trabajo Habitual
                </label>
                <input 
                  v-model="formData.lugar_trabajo" 
                  type="text" 
                  id="lugar_trabajo" 
                  placeholder="Ej: Sanatorio Del Norte / Clínica San José"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
                />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: DATOS BANCARIOS -->
          <div class="p-5 border rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Datos Bancarios para Liquidaciones
              </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="banco" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Entidad Bancaria
                </label>
                <input 
                  v-model="formData.banco" 
                  type="text" 
                  id="banco" 
                  placeholder="Ej: Banco Corrientes / Mercado Pago"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
                />
              </div>

              <div>
                <label for="alias_bancario" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alias Bancario
                </label>
                <input 
                  v-model="formData.alias_bancario" 
                  type="text" 
                  id="alias_bancario" 
                  placeholder="Ej: MARIA.PAZ.MP"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal uppercase" 
                />
              </div>

              <div class="sm:col-span-2">
                <label for="cbu" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  CBU / CVU (22 dígitos)
                </label>
                <input 
                  v-model="formData.cbu" 
                  type="text" 
                  id="cbu" 
                  maxlength="22"
                  placeholder="Ej: 0000003100084512345678"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal font-mono" 
                />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: PROGRAMA IQ Y PUNTOS -->
          <div class="p-5 border rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
                Ajustes de Programa IQ
              </h3>
            </div>

            <div>
              <label for="puntos_manuales" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Puntos Manuales Adicionales
              </label>
              <input 
                v-model.number="formData.puntos_manuales" 
                type="number" 
                id="puntos_manuales" 
                min="0"
                placeholder="0"
                class="w-full sm:w-1/2 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
              />
            </div>
          </div>
        </form>
        
        <!-- Footer del Modal -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 shrink-0">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-5 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            Cancelar
          </button>
          
          <button 
            @click="handleSubmit" 
            :disabled="isSubmitting" 
            class="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isSubmitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>{{ isSubmitting ? 'Guardando Cambios...' : 'Guardar Cambios' }}</span>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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

const iniciales = computed(() => {
  if (!formData.value?.nombre_completo) return 'IQ';
  const parts = formData.value.nombre_completo.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
});

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