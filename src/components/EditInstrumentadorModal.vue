<!-- src/components/EditInstrumentadorModal.vue -->
<template>
  <GlassModal
    :open="show"
    title="Editar Instrumentador"
    description="Actualizar los datos personales, de contacto y bancarios del profesional."
    maxWidth="2xl"
    @close="$emit('close')"
  >
    <!-- Template del Título Personalizado -->
    <template #title>
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-11 h-11 text-sm font-black text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 rounded-2xl shadow-inner border border-indigo-200 dark:border-indigo-800 shrink-0">
          {{ iniciales }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-black text-slate-950 dark:text-white block">
              Editar Instrumentador
            </span>
            <AnimatedBadge variant="indigo" size="xs">
              DNI: {{ formData?.dni || 'N/A' }}
            </AnimatedBadge>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
            {{ formData?.nombre_completo || 'Cargando datos...' }}
          </span>
        </div>
      </div>
    </template>

    <!-- Formulario Principal con GlowCards organizadas -->
    <form v-if="formData" @submit.prevent="handleSubmit" id="edit-instrumentador-form" class="space-y-4 pt-1">
      
      <!-- SECCIÓN 1: DATOS PERSONALES Y CONTACTO -->
      <GlowCard glowColor="indigo" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <User class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Datos Personales y Contacto
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div class="sm:col-span-2">
            <label for="nombre_completo" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo <span class="text-rose-500">*</span>
            </label>
            <input 
              v-model="formData.nombre_completo" 
              type="text" 
              id="nombre_completo" 
              required 
              placeholder="Ej: Perez Maria Laura"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div>
            <label for="dni" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              DNI (Identificador Único)
            </label>
            <div class="relative">
              <input 
                :value="formData.dni" 
                type="text" 
                id="dni" 
                disabled 
                class="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed" 
              />
              <span class="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock class="w-3 h-3" /> Bloqueado
              </span>
            </div>
          </div>

          <div>
            <label for="cuil" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              CUIT / CUIL
            </label>
            <input 
              v-model="formData.cuil" 
              type="text" 
              id="cuil" 
              placeholder="Ej: 27345119334"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div>
            <label for="telefono" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Teléfono de Contacto
            </label>
            <input 
              v-model="formData.telefono" 
              type="tel" 
              id="telefono" 
              placeholder="Ej: 3794123456"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div>
            <label for="email" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico (Notificaciones)
            </label>
            <input 
              v-model="formData.email" 
              type="email" 
              id="email" 
              placeholder="Ej: profesional@correo.com"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div class="sm:col-span-2">
            <label for="lugar_trabajo" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Lugar de Trabajo Habitual
            </label>
            <input 
              v-model="formData.lugar_trabajo" 
              type="text" 
              id="lugar_trabajo" 
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
            <label for="banco" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Entidad Bancaria
            </label>
            <input 
              v-model="formData.banco" 
              type="text" 
              id="banco" 
              placeholder="Ej: Banco Corrientes / Mercado Pago"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" 
            />
          </div>

          <div>
            <label for="alias_bancario" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alias Bancario
            </label>
            <input 
              v-model="formData.alias_bancario" 
              type="text" 
              id="alias_bancario" 
              placeholder="Ej: MARIA.PAZ.MP"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal uppercase" 
            />
          </div>

          <div class="sm:col-span-2">
            <label for="cbu" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              CBU / CVU (22 dígitos)
            </label>
            <input 
              v-model="formData.cbu" 
              type="text" 
              id="cbu" 
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
            Ajustes de Programa IQ
          </h3>
        </div>

        <div class="text-xs">
          <label for="puntos_manuales" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Puntos Manuales Adicionales
          </label>
          <input 
            v-model.number="formData.puntos_manuales" 
            type="number" 
            id="puntos_manuales" 
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
          <Save class="w-4 h-4 mr-1" />
          <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}</span>
        </ShimmerButton>
      </div>
    </template>
  </GlassModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { User, Wallet, Award, Save, Lock } from 'lucide-vue-next';
import { GlassModal, GlowCard, ShimmerButton, AnimatedBadge } from './ui';

const props = defineProps({ show: Boolean, instrumentador: Object });
const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const isSubmitting = ref(false);
const formData = ref(null);

const hydrateFormData = async (inst) => {
  if (!inst) {
    formData.value = null;
    return;
  }
  const cleanDni = String(inst.dni || '').trim();
  formData.value = {
    dni: cleanDni,
    nombre_completo: inst.nombre_completo || '',
    cuil: inst.cuil || '',
    telefono: inst.telefono || '',
    email: inst.email || '',
    lugar_trabajo: inst.lugar_trabajo || '',
    banco: inst.banco || '',
    alias_bancario: inst.alias_bancario || inst.alias || '',
    alias: inst.alias || inst.alias_bancario || '',
    cbu: inst.cbu || '',
    puntos_manuales: Number(inst.puntos_manuales) || 0
  };

  // Cargar datos directos y completos desde la tabla para evitar desfaces si el objeto vino de una RPC agregada
  if (cleanDni) {
    try {
      const { data: directData, error: directErr } = await supabase
        .from('instrumentadores')
        .select('*')
        .eq('dni', cleanDni)
        .maybeSingle();

      if (!directErr && directData && formData.value && formData.value.dni === cleanDni) {
        formData.value = {
          ...formData.value,
          nombre_completo: directData.nombre_completo ?? formData.value.nombre_completo,
          cuil: directData.cuil ?? formData.value.cuil,
          telefono: directData.telefono ?? formData.value.telefono,
          email: directData.email ?? formData.value.email,
          lugar_trabajo: directData.lugar_trabajo ?? formData.value.lugar_trabajo,
          banco: directData.banco ?? formData.value.banco,
          alias_bancario: directData.alias_bancario || directData.alias || formData.value.alias_bancario,
          alias: directData.alias || directData.alias_bancario || formData.value.alias,
          cbu: directData.cbu ?? formData.value.cbu,
          puntos_manuales: directData.puntos_manuales !== undefined && directData.puntos_manuales !== null ? Number(directData.puntos_manuales) : formData.value.puntos_manuales
        };
      }
    } catch (e) {
      console.warn('No se pudo hidratar datos directos del instrumentador:', e);
    }
  }
};

watch(() => props.instrumentador, (newVal) => {
  if (newVal && props.show) {
    hydrateFormData(newVal);
  }
}, { immediate: true, deep: true });

watch(() => props.show, (isOpen) => {
  if (isOpen && props.instrumentador) {
    hydrateFormData(props.instrumentador);
  }
});

const iniciales = computed(() => {
  if (!formData.value?.nombre_completo) return 'IQ';
  const parts = formData.value.nombre_completo.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
});

const handleSubmit = async () => {
  if (!formData.value) return;

  const cleanDni = String(formData.value.dni || props.instrumentador?.dni || '').trim();
  if (!cleanDni) {
    toast.error('No se pudo identificar el DNI del instrumentador a actualizar.');
    return;
  }

  const nombreClean = String(formData.value.nombre_completo || '').trim();
  if (!nombreClean) {
    toast.error('El nombre completo es obligatorio.');
    return;
  }

  isSubmitting.value = true;
  try {
    const aliasValue = formData.value.alias_bancario
      ? String(formData.value.alias_bancario).trim().toUpperCase()
      : (formData.value.alias ? String(formData.value.alias).trim().toUpperCase() : null);

    const updatePayload = {
      nombre_completo: nombreClean,
      telefono: formData.value.telefono ? String(formData.value.telefono).trim() : null,
      lugar_trabajo: formData.value.lugar_trabajo ? String(formData.value.lugar_trabajo).trim() : null,
      cuil: formData.value.cuil ? String(formData.value.cuil).trim() : null,
      puntos_manuales: Number(formData.value.puntos_manuales) || 0,
      cbu: formData.value.cbu ? String(formData.value.cbu).trim() : null,
      alias_bancario: aliasValue,
      alias: aliasValue,
      banco: formData.value.banco ? String(formData.value.banco).trim() : null,
      email: formData.value.email ? String(formData.value.email).trim().toLowerCase() : null
    };

    let updateData = { ...updatePayload };
    let { data, error } = await supabase
      .from('instrumentadores')
      .update(updateData)
      .eq('dni', cleanDni)
      .select();

    // Fallback resiliente si alguna columna opcional no existe en el esquema cacheado
    if (error) {
      const errMsg = (error.message || '').toLowerCase();
      let hadColumnMismatch = false;

      if (errMsg.includes('alias_bancario')) {
        delete updateData.alias_bancario;
        hadColumnMismatch = true;
      }
      if (errMsg.includes('alias') && !errMsg.includes('alias_bancario')) {
        delete updateData.alias;
        hadColumnMismatch = true;
      }
      if (errMsg.includes('email')) {
        delete updateData.email;
        hadColumnMismatch = true;
      }

      if (hadColumnMismatch) {
        const retry = await supabase
          .from('instrumentadores')
          .update(updateData)
          .eq('dni', cleanDni)
          .select();
        error = retry.error;
        data = retry.data;
      }
    }

    if (error) throw error;

    toast.success('Instrumentador actualizado con éxito.');
    emit('updated');
    emit('close');

  } catch (err) {
    console.error('Error al actualizar instrumentador:', err);
    toast.error('Error al actualizar el instrumentador: ' + (err.message || 'Error desconocido'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>