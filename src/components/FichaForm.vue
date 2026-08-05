<!-- src/components/FichaForm.vue (Sin Desfase Inferior + UX/UI Mejorada) -->
<template>
  <div class="w-full">
    <!-- Contenedor Principal Integrado -->
    <div class="max-w-3xl mx-auto px-3 sm:px-6">
      
      <!-- 1) Tarjeta de Encabezado, Stepper e Información -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xl transition-all">
        
        <header class="flex items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-3">
            <img src="/1.svg" class="h-8 sm:h-9 opacity-90 dark:opacity-100" alt="Districorr" />
            <h1 class="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">Ficha Post Cirugía</h1>
          </div>
          
          <button 
            type="button"
            class="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer" 
            @click="toggleDark()"
            title="Cambiar Modo Claro / Oscuro"
          >
            <SunIcon v-if="isDark" class="h-5 w-5 text-amber-400" />
            <MoonIcon v-else class="h-5 w-5 text-slate-600" />
          </button>
        </header>

        <!-- Stepper Responsive -->
        <nav class="mx-auto mt-2">
          <ol class="grid grid-cols-3 text-xs sm:text-sm font-extrabold text-slate-400 dark:text-slate-500">
            <li 
              v-for="(step, index) in steps" 
              :key="step.label" 
              class="relative text-center" 
              :class="{'text-blue-600 dark:text-blue-400': index === currentStep}"
            >
              <div class="absolute inset-0 flex items-center" aria-hidden="true" v-if="index > 0">
                <div class="h-0.5 w-full" :class="index <= currentStep ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'"></div>
              </div>
              
              <div 
                @click="currentStep = index" 
                class="relative w-8 h-8 sm:w-9 sm:h-9 mx-auto flex items-center justify-center rounded-full cursor-pointer transition-all shadow-2xs" 
                :class="index < currentStep ? 'bg-blue-600 text-white dark:bg-blue-500' : (index === currentStep ? 'border-2 border-blue-600 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400' : 'border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400')"
              >
                <span v-if="index < currentStep" class="text-white font-black text-xs">✓</span>
                <span v-else class="font-extrabold text-xs sm:text-sm">{{ index + 1 }}</span>
              </div>

              <p class="mt-2 text-[11px] sm:text-xs font-extrabold tracking-tight truncate">{{ step.label }}</p>
            </li>
          </ol>
        </nav>

        <!-- Tarjetas de Información del Caso -->
        <section class="mt-5">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <InfoCard label="Paciente" :value="reporte.paciente" :icon="UserIcon" />
            <InfoCard label="Médico" :value="reporte.medico" :icon="ClipboardDocumentCheckIcon" />
            <InfoCard label="Fecha" :value="formatDate(reporte.fecha_cirugia)" :icon="CalendarIcon" />
            <InfoCard label="Lugar" :value="reporte.lugar_cirugia" :icon="MapPinIcon" />
          </div>
        </section>
      </div>

      <!-- 2) Contenedor del Paso Activo con Navegación Unificada Integrada -->
      <main class="mt-4 sm:mt-6 pb-24 md:pb-6">
        <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-8 shadow-xl transition-all">
          
          <Transition name="fade-slide" mode="out-in">
            <component 
              :is="steps[currentStep].component"
              v-bind="currentStepProps"
              @update:form-data="updateFormData"
              @set-footer-action="setFooterAction"
              @open-signature-modal="openSignatureModal"
              @clear-signature="handleSignatureClear"
            />
          </Transition>

          <!-- Acciones de Navegación integradas en Escritorio (Evita el desfase inferior) -->
          <div class="hidden md:flex justify-between items-center pt-6 mt-8 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              @click="prevStep" 
              class="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer" 
              :class="currentStep > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              ← Atrás
            </button>
            
            <button 
              type="button" 
              v-if="footerAction" 
              @click="footerAction.action" 
              :disabled="isSubmitting" 
              :class="footerAction.class" 
              class="px-7 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-98"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ isSubmitting ? 'Enviando...' : footerAction.text }}</span>
            </button>
          </div>

        </div>
      </main>

    </div>

    <!-- 3) Barra Flotante Táctil Fija EXCLUSIVA para Móviles (< 768px) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 border-t border-slate-200/80 dark:border-slate-800 shadow-2xl">
      <div class="max-w-md mx-auto flex justify-between items-center px-1">
        <button 
          type="button" 
          @click="prevStep" 
          class="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 active:scale-95 transition-all cursor-pointer" 
          :class="currentStep > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >
          ← Atrás
        </button>
        
        <button 
          type="button" 
          v-if="footerAction" 
          @click="footerAction.action" 
          :disabled="isSubmitting" 
          :class="footerAction.class" 
          class="px-6 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
        >
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ isSubmitting ? 'Enviando...' : footerAction.text }}</span>
        </button>
      </div>
    </nav>

    <SignatureModal 
      :show="isSignatureModalVisible" 
      @close="closeSignatureModal" 
      @save="handleSignatureSave" 
      @clear="handleSignatureClear" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted, markRaw, watchEffect, defineComponent, h } from 'vue';
import { useStorage } from '@vueuse/core';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import SignatureModal from './SignatureModal.vue';
import FormStepQuestionnaire from './FormStepQuestionnaire.vue';
import FormStepComments from './FormStepComments.vue';
import FormStepSignature from './FormStepSignature.vue';
import { SunIcon, MoonIcon, UserIcon, ClipboardDocumentCheckIcon, CalendarIcon, MapPinIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  reporte: { type: Object, required: true },
  instrumentador: { type: Object, required: true }
});
const emit = defineEmits(['submit-success']);

const toast = useToast();

const isDark = useStorage('iq-dark-mode', true);
watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value);
});
const toggleDark = () => (isDark.value = !isDark.value);

const currentStep = ref(0);
const steps = computed(() => [
  { label: 'Cuestionario', component: markRaw(FormStepQuestionnaire) },
  { label: 'Comentarios', component: markRaw(FormStepComments) },
  { label: 'Firma', component: markRaw(FormStepSignature) },
]);

const formData = reactive({
  instrumentador_dni: props.instrumentador.dni,
  instrumentador_completado: props.instrumentador.nombre_completo,
  set_completo: null,
  informe_faltante: null,
  rating_puntualidad: 0,
  rating_condiciones: 0,
  rating_asesoramiento: 0,
  rating_evaluacion_general: 0,
  consumo_realizado: '',
  representante_ventas: '',
  observaciones: '',
  tipo_logistica: null,
  transporte_utilizado: '',
  acepta_terminos: false,
  duracion_cirugia: '',
});

const errors = reactive({});
const isSubmitting = ref(false);
const signatureBlob = ref(null);
const signaturePreviewUrl = ref(null);
const isSignatureModalVisible = ref(false);

const currentStepProps = computed(() => {
  const commonProps = {
    formData: formData,
    errors: errors,
  };

  if (currentStep.value === 2) {
    return {
      ...commonProps,
      signaturePreviewUrl: signaturePreviewUrl.value,
    };
  }

  return commonProps;
});

const updateFormData = (payload) => {
  Object.assign(formData, payload);
};

const nextStep = () => { if (currentStep.value < steps.value.length - 1) currentStep.value++; };
const prevStep = () => { if (currentStep.value > 0) currentStep.value--; };

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (formData.set_completo === null) errors.set_completo = 'Este campo es requerido.';
  if (formData.set_completo === false && !formData.informe_faltante) errors.informe_faltante = 'Este campo es requerido.';
  const ratingKeys = ['rating_puntualidad', 'rating_condiciones', 'rating_asesoramiento', 'rating_evaluacion_general'];
  ratingKeys.forEach(key => { if (!formData[key] || formData[key] === 0) errors[key] = 'Debe seleccionar una puntuación.'; });
  
  if (!formData.consumo_realizado.trim()) errors.consumo_realizado = 'El consumo realizado es un campo requerido.';
  if (!formData.tipo_logistica) errors.tipo_logistica = 'Debe seleccionar una opción de logística.';
  
  if (!signatureBlob.value) errors.signature = 'La firma es requerida.';
  if (!formData.acepta_terminos) errors.acepta_terminos = 'Debe aceptar los términos para continuar.';
  
  if (Object.keys(errors).length > 0) {
    toast.error("Por favor, complete todos los campos requeridos.");
    return false;
  }
  return true;
};

const findFirstInvalidStep = () => {
  const step1ErrorKeys = ['set_completo', 'informe_faltante', 'rating_puntualidad', 'rating_condiciones', 'rating_asesoramiento', 'rating_evaluacion_general'];
  const step2ErrorKeys = ['consumo_realizado', 'tipo_logistica'];
  const errorKeys = Object.keys(errors);
  
  if (errorKeys.some(key => step1ErrorKeys.includes(key))) return 0;
  if (errorKeys.some(key => step2ErrorKeys.includes(key))) return 1;
  
  return 2;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    currentStep.value = findFirstInvalidStep();
    return;
  }
  
  isSubmitting.value = true;
  try {
    const filePath = `firma-${props.reporte.id}-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage.from('firmas').upload(filePath, signatureBlob.value, {
      contentType: 'image/webp'
    });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('firmas').getPublicUrl(filePath);

    const updates = { 
      ...formData, 
      url_firma: urlData.publicUrl, 
      estado: 'Enviado',
      fecha_envio: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase.from('reportes').update(updates).eq('id', props.reporte.id);
    if (updateError) throw updateError;
    
    emit('submit-success', props.reporte.id);

  } catch (error) {
    console.error('Submission failed with error:', error);
    toast.error(`Error al enviar el formulario: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const openSignatureModal = () => {
  isSignatureModalVisible.value = true;
};

const closeSignatureModal = () => {
  isSignatureModalVisible.value = false;
};

const handleSignatureSave = (blob) => {
  signatureBlob.value = blob;
  if (signaturePreviewUrl.value) URL.revokeObjectURL(signaturePreviewUrl.value);
  signaturePreviewUrl.value = URL.createObjectURL(blob);
  closeSignatureModal();
};

const handleSignatureClear = () => {
  signatureBlob.value = null;
  if (signaturePreviewUrl.value) {
    URL.revokeObjectURL(signaturePreviewUrl.value);
    signaturePreviewUrl.value = null;
  }
};

onUnmounted(() => {
  if (signaturePreviewUrl.value) URL.revokeObjectURL(signaturePreviewUrl.value);
});

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const footerAction = ref(null);
const setFooterAction = (action) => {
  if (action) {
    footerAction.value = action;
  } else {
    if (currentStep.value < steps.value.length - 1) {
      footerAction.value = { text: 'Siguiente →', action: nextStep, class: 'bg-blue-600 hover:bg-blue-700 text-white' };
    } else {
      footerAction.value = { text: 'Enviar Ficha ✅', action: handleSubmit, class: 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-400' };
    }
  }
};
watchEffect(() => setFooterAction(null));

const InfoCard = defineComponent({
  props: { label: String, value: String, icon: [Object, Function] },
  setup(props) {
    const iconComponent = props.icon ? h(props.icon, { class: 'h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5' }) : null;
    return () => h('div', { class: 'card-info flex items-start gap-2 sm:gap-2.5' }, [
      iconComponent,
      h('div', { class: 'min-w-0 flex-1' }, [
        h('span', { class: 'block text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider' }, props.label),
        h('strong', { class: 'text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate block leading-tight mt-0.5' }, props.value || '—')
      ])
    ]);
  }
});
</script>

<style scoped>
.card-info { 
  @apply rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3; 
}
.fade-slide-enter-active, .fade-slide-leave-active { 
  transition: all .2s ease; 
}
.fade-slide-enter-from { 
  opacity: 0; 
  transform: translateY(6px); 
}
.fade-slide-leave-to { 
  opacity: 0; 
  transform: translateY(-6px); 
}
</style>