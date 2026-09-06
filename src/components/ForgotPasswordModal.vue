<!-- src/components/ForgotPasswordModal.vue -->
<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in select-none"
      @click.self="closeModal"
    >
      <div class="relative w-full max-w-md bg-[#0A1628] border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100 p-6 sm:p-7">
        
        <!-- Acento superior -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

        <!-- Botón cerrar -->
        <button 
          @click="closeModal" 
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Cabecera -->
        <div class="text-center mb-5">
          <div class="mb-3 flex items-center justify-center">
            <img 
              src="/ISologo  (1).svg" 
              alt="Districorr" 
              class="h-10 w-auto object-contain"
            />
          </div>
          <h2 class="text-xl font-bold text-white tracking-tight">Recuperar Contraseña</h2>
          <p class="mt-1 text-xs text-slate-400">
            Ingresá tu correo electrónico institucional para recibir las instrucciones de restablecimiento.
          </p>
        </div>

        <!-- Mensaje de Éxito -->
        <div v-if="successMessage" class="mb-4 p-3.5 bg-cyan-950/60 border border-cyan-800/60 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
          <svg class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <div class="space-y-1">
            <p class="font-semibold text-white">¡Enlace enviado!</p>
            <p>{{ successMessage }}</p>
          </div>
        </div>

        <!-- Alerta de Error -->
        <div v-if="errorMessage" class="mb-4 p-3 text-xs text-red-200 bg-red-950/60 border border-red-800/40 rounded-xl flex items-center gap-2">
          <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Formulario -->
        <form v-if="!successMessage" @submit.prevent="handleResetPassword" class="space-y-4">
          <div>
            <label for="recovery-email" class="block text-xs font-medium text-slate-300 mb-1.5">
              Correo electrónico registrado
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <input 
                v-model="emailInput" 
                id="recovery-email" 
                type="email" 
                required 
                placeholder="usuario@districorr.com.ar"
                class="w-full pl-10 pr-3.5 py-2.5 bg-[#061121] border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="loading" 
              class="px-5 py-2.5 bg-gradient-to-r from-[#086F92] to-[#0CA0D2] hover:from-[#075f7d] hover:to-[#098ec0] text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-950/40 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <svg v-if="loading" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ loading ? 'Enviando...' : 'Enviar enlace' }}</span>
            </button>
          </div>
        </form>

        <!-- Asistencia alternativa / Soporte Districorr -->
        <div class="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <p class="text-[11px] text-slate-400 mb-1">
            ¿Necesitás ayuda adicional o blanqueo inmediato?
          </p>
          <a 
            href="https://wa.me/5491100000000?text=Hola%2C%20necesito%20asistencia%20para%20restablecer%20mi%20cuenta%20en%20Gesti%C3%B3n%20IQ." 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981z"/></svg>
            <span>Contactar al Soporte de Districorr</span>
          </a>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../services/supabase';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialEmail: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const emailInput = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    emailInput.value = props.initialEmail || '';
    errorMessage.value = '';
    successMessage.value = '';
    loading.value = false;
  }
});

const closeModal = () => {
  emit('close');
};

const handleResetPassword = async () => {
  if (!emailInput.value) return;
  try {
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const redirectUrl = `${window.location.origin}/login`;
    const { error } = await supabase.auth.resetPasswordForEmail(emailInput.value, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;

    successMessage.value = `Se envió un correo a ${emailInput.value} con las instrucciones para recuperar tu contraseña. Revisá tu casilla de correo y la carpeta de correo no deseado (Spam).`;
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo enviar el correo de recuperación. Verificá la dirección ingresada.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
