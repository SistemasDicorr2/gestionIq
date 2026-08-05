<!-- src/components/FormStepSignature.vue (Alto Contraste y Diseño Moderno) -->
<template>
  <div class="space-y-6 sm:space-y-8">
    <div>
      <h2 class="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">Firma y Confirmación</h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Por favor, provea su firma digital y acepte los términos para finalizar la ficha.</p>
    </div>

    <!-- Panel de Firma -->
    <div class="space-y-3">
      <label class="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
        Firma Digital <span class="text-rose-500">*</span>
      </label>
      
      <!-- Vista Previa de la Firma -->
      <div 
        v-if="signaturePreviewUrl" 
        class="relative p-3 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-inner bg-slate-50 dark:bg-slate-950/80"
      >
        <img :src="signaturePreviewUrl" alt="Firma guardada" class="h-36 sm:h-44 w-full object-contain">
        
        <div class="absolute top-3 right-3 flex gap-2">
          <button 
            type="button" 
            @click="$emit('open-signature-modal')" 
            class="action-button" 
            title="Cambiar firma"
          >
            <PencilIcon class="h-5 w-5" />
          </button>
          <button 
            type="button" 
            @click="$emit('clear-signature')" 
            class="action-button hover:text-rose-500 dark:hover:text-rose-400" 
            title="Limpiar firma"
          >
            <TrashIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <!-- Placeholder para la Firma -->
      <div 
        v-else 
        @click="$emit('open-signature-modal')"
        :class="[
          'h-44 sm:h-48 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-all',
          errors.signature 
            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 ring-2 ring-rose-500/20' 
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-950/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
        ]"
      >
        <div class="w-14 h-14 sm:w-16 sm:h-16 grid place-content-center bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3">
          <PencilSquareIcon 
            :class="['w-7 h-7 sm:w-8 sm:h-8', errors.signature ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400']" 
          />
        </div>
        <p class="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100">Presioná aquí para firmar</p>
        <p class="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">Se abrirá el panel táctil de firma digital</p>
      </div>
      <p v-if="errors.signature" class="text-xs text-rose-500 font-bold mt-1.5">{{ errors.signature }}</p>
    </div>
    
    <!-- Aceptación de Términos -->
    <div class="space-y-3 pt-5 border-t border-slate-200/80 dark:border-slate-800">
      <label for="acepta_terminos" class="flex items-start gap-3 cursor-pointer select-none">
        <input 
          type="checkbox" 
          id="acepta_terminos"
          :checked="formData.acepta_terminos"
          @change="$emit('update:form-data', { acepta_terminos: $event.target.checked })"
          class="h-5 w-5 text-blue-600 rounded-lg mt-0.5 border-slate-300 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 shrink-0 cursor-pointer"
        >
        <span class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-normal">
          He leído y acepto los 
          <a 
            :href="termsUrl" 
            target="_blank" 
            rel="noopener noreferrer" 
            @click.stop
            class="text-blue-600 dark:text-blue-400 font-black underline hover:text-blue-800 dark:hover:text-blue-300"
          >
            Términos y Condiciones
          </a> 
          sobre la devolución del material. <span class="text-rose-500">*</span>
        </span>
      </label>
      <p v-if="errors.acepta_terminos" class="text-xs text-rose-500 font-bold ml-8">{{ errors.acepta_terminos }}</p>
    </div>
  </div>
</template>

<script setup>
import { PencilIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  signaturePreviewUrl: { type: String, default: null },
});

const emit = defineEmits(['update:form-data', 'open-signature-modal', 'clear-signature']);

const termsUrl = "https://ugznvonyvtjfqskhubbi.supabase.co/storage/v1/object/public/documentos/Terminos%20y%20condiciones.pdf";
</script>

<style scoped>
.action-button {
  @apply p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all cursor-pointer;
}
</style>