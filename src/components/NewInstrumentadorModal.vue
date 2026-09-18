<!-- src/components/NewInstrumentadorModal.vue -->
<template>
  <GlassModal
    :open="show"
    title="Nuevo Instrumentador"
    description="Registrar un nuevo perfil profesional en la base de datos de Gestión IQ."
    maxWidth="2xl"
    @close="$emit('close')"
  >
    <!-- Template del Título con Icono -->
    <template #title>
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shrink-0 border border-indigo-200 dark:border-indigo-800">
          <UserPlus class="w-5 h-5" />
        </div>
        <div>
          <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white block">Nuevo Instrumentador</span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-normal block">Alta de profesional y cuenta de liquidación</span>
        </div>
      </div>
    </template>

    <!-- Formulario Principal con GlowCards organizadas -->
    <form @submit.prevent="handleSubmit" id="new-instrumentador-form" class="space-y-4 pt-1">
      
      <!-- SECCIÓN 1: DATOS PERSONALES -->
      <GlowCard glowColor="indigo" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <User class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Datos Personales y Contacto
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div class="sm:col-span-2">
            <label for="new-nombre_completo" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo <span class="text-rose-500">*</span>
            </label>
            <input 
              v-model="formData.nombre_completo" 
              type="text" 
              id="new-nombre_completo" 
              required 
              placeholder="Ej: Perez Maria Laura"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div>
            <label for="new-dni" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              DNI <span class="text-rose-500">*</span>
            </label>
            <input 
              v-model="formData.dni" 
              type="text" 
              id="new-dni" 
              required 
              placeholder="Ej: 34511933"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal font-mono" 
            />
          </div>

          <div>
            <label for="new-cuil" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              CUIT / CUIL
            </label>
            <input 
              v-model="formData.cuil" 
              type="text" 
              id="new-cuil" 
              placeholder="Ej: 27345119334"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal font-mono" 
            />
          </div>

          <div>
            <label for="new-telefono" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Teléfono de Contacto
            </label>
            <input 
              v-model="formData.telefono" 
              type="tel" 
              id="new-telefono" 
              placeholder="Ej: 3794123456"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div>
            <label for="new-lugar_trabajo" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Lugar de Trabajo Habitual
            </label>
            <input 
              v-model="formData.lugar_trabajo" 
              type="text" 
              id="new-lugar_trabajo" 
              placeholder="Ej: Sanatorio Del Norte / Clínica San José"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>
        </div>
      </GlowCard>

      <!-- SECCIÓN 2: DATOS BANCARIOS -->
      <GlowCard glowColor="emerald" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <Wallet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Datos Bancarios para Liquidaciones
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label for="new-banco" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Entidad Bancaria
            </label>
            <input 
              v-model="formData.banco" 
              type="text" 
              id="new-banco" 
              placeholder="Ej: Banco Corrientes / Mercado Pago"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div>
            <label for="new-alias" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alias Bancario
            </label>
            <input 
              v-model="formData.alias" 
              type="text" 
              id="new-alias" 
              placeholder="Ej: MARIA.PAZ.MP"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal uppercase" 
            />
          </div>

          <div class="sm:col-span-2">
            <label for="new-cbu" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              CBU / CVU (22 dígitos)
            </label>
            <input 
              v-model="formData.cbu" 
              type="text" 
              id="new-cbu" 
              maxlength="22"
              placeholder="Ej: 0000003100084512345678"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal font-mono" 
            />
          </div>
        </div>
      </GlowCard>

      <!-- SECCIÓN 3: PROGRAMA IQ Y PUNTOS -->
      <GlowCard glowColor="amber" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <Award class="w-4 h-4 text-amber-500" />
          <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Programa IQ y Puntaje Inicial
          </h3>
        </div>

        <div class="text-xs">
          <label for="new-puntos_manuales" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Puntos Manuales Iniciales
          </label>
          <input 
            v-model.number="formData.puntos_manuales" 
            type="number" 
            id="new-puntos_manuales" 
            min="0"
            placeholder="0"
            class="w-full sm:w-1/2 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal font-mono" 
          />
        </div>
      </GlowCard>

    </form>

    <!-- Footer con Botones Shimmer -->
    <template #footer>
      <div class="flex items-center justify-end gap-2.5 w-full">
        <ShimmerButton 
          variant="glass" 
          size="sm"
          type="button" 
          @click="$emit('close')"
        >
          Cancelar
        </ShimmerButton>

        <ShimmerButton 
          variant="primary" 
          size="sm"
          :loading="isSubmitting" 
          @click="handleSubmit"
        >
          <Plus class="w-4 h-4 mr-1" />
          <span>{{ isSubmitting ? 'Creando...' : 'Crear Instrumentador' }}</span>
        </ShimmerButton>
      </div>
    </template>
  </GlassModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { User, UserPlus, Wallet, Award, Plus } from 'lucide-vue-next';
import { GlassModal, GlowCard, ShimmerButton } from './ui';

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
  banco: '',
  cbu: '',
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