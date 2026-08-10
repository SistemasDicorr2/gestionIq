<!-- src/components/IdentificationWizard.vue (Diseño Responsive & Soporte Oscuro/Claro) -->
<template>
  <div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 sm:p-8 rounded-3xl shadow-2xl w-full max-w-lg mx-auto border border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
    
    <!-- Indicador de Pasos (Wizard Responsive) -->
    <div class="flex justify-between items-center mb-6 sm:mb-8 text-xs sm:text-sm">
      <div class="step active"><span>1</span> Identificación</div>
      <div class="step-separator"></div>
      <div class="step"><span>2</span> Ficha</div>
      <div class="step-separator"></div>
      <div class="step"><span>3</span> Confirmación</div>
    </div>

    <div class="text-center mb-6">
      <img src="/1.svg" alt="Logo Districorr" class="h-10 sm:h-12 mx-auto mb-3 opacity-90 dark:opacity-100">
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Identificación del Profesional</h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Por favor, ingrese su DNI para continuar.</p>
    </div>
    
    <div class="space-y-4">
      <div>
        <label for="dni" class="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">DNI</label>
        <div class="relative">
          <input 
            type="text" 
            id="dni" 
            v-model="dni" 
            placeholder="Ej: 28.584.730" 
            required 
            @keyup.enter="checkDni"
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-2xs text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            :class="{ 'border-rose-500 ring-2 ring-rose-500/20': dniError, 'border-emerald-500 ring-2 ring-emerald-500/20': instrumentadorFound }"
          >
          
          <div v-if="isCheckingDni || dniError || instrumentadorFound !== null" class="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
            <button v-if="instrumentadorFound !== null" @click="resetIdentification" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" title="Cambiar DNI">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <svg v-if="isCheckingDni" class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            <svg v-else-if="dniError" class="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
            <svg v-else-if="instrumentadorFound" class="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
          </div>
        </div>
        <p v-if="dniError" class="text-rose-500 text-xs font-extrabold mt-1.5 flex items-center gap-1">
          <span>⚠️</span> {{ dniError }}
        </p>
      </div>

      <button 
        v-if="instrumentadorFound === null" 
        @click="checkDni" 
        :disabled="isCheckingDni || dni.length < 7" 
        class="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-2xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <span>Identificar</span>
      </button>

      <Transition name="fade">
        <div v-if="instrumentadorFound !== null" class="space-y-5 pt-5 border-t border-slate-200 dark:border-slate-800">
          <!-- Caso: Instrumentador Nuevo -->
          <div v-if="!instrumentadorFound" class="space-y-4">
            <div>
              <label for="nombre" class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Nombre y Apellido</label>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Es tu primera vez en Gestión IQ. Registrá tu nombre completo para continuar.</p>
              <input 
                type="text" 
                id="nombre" 
                v-model="nombreCompleto" 
                placeholder="Ej: Juan Pérez" 
                required 
                class="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-base font-extrabold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              >
            </div>

            <button 
              @click="registerAndProceed" 
              :disabled="!nombreCompleto.trim() || isSaving" 
              class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-2xl text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Guardar y Continuar</span>
            </button>
          </div>
          
          <!-- Caso: Instrumentador Encontrado -->
          <div v-else class="space-y-5">
            <div class="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-center">
              <p class="text-base font-extrabold text-emerald-800 dark:text-emerald-300">¡Bienvenido/a, {{ instrumentador.nombre_completo }}! 👋</p>
            </div>

            <div class="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 text-center">Confirmación de Datos de Pago</h3>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 py-1.5"><span class="font-bold text-slate-500 dark:text-slate-400">CUIT / CUIL:</span><span class="font-mono font-bold text-slate-900 dark:text-white">{{ instrumentador.cuil || 'Dato pendiente' }}</span></div>
                <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 py-1.5"><span class="font-bold text-slate-500 dark:text-slate-400">CBU:</span><span class="font-mono font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{{ instrumentador.cbu || 'Dato pendiente' }}</span></div>
                <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 py-1.5"><span class="font-bold text-slate-500 dark:text-slate-400">Alias:</span><span class="font-mono font-bold text-slate-900 dark:text-white">{{ instrumentador.alias_bancario || 'Dato pendiente' }}</span></div>
                <div class="flex justify-between items-center py-1.5"><span class="font-bold text-slate-500 dark:text-slate-400">Banco:</span><span class="font-bold text-slate-900 dark:text-white">{{ instrumentador.banco || 'Dato pendiente' }}</span></div>
              </div>
            </div>

            <div class="text-center space-y-3">
              <p class="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">¿Estos datos son correctos?</p>
              <div class="flex flex-col sm:flex-row gap-2.5 justify-center">
                <button @click="proceed" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-5 rounded-2xl shadow-sm transition-all active:scale-98 cursor-pointer">
                  ✅ Sí, continuar
                </button>
                <button @click="requestUpdate" class="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-98 cursor-pointer">
                  📲 Solicitar actualización
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';

const emit = defineEmits(['identification-complete', 'request-update']);

const dni = ref('');
const nombreCompleto = ref('');
const instrumentador = ref(null);
const instrumentadorFound = ref(null);
const isCheckingDni = ref(false);
const isSaving = ref(false);
const dniError = ref('');

const DNI_STORAGE_KEY = 'gestion-iq-dni';

onMounted(() => {
  const savedDni = localStorage.getItem(DNI_STORAGE_KEY);
  if (savedDni) {
    dni.value = savedDni;
  }
});

const saveDniToStorage = (dniToSave) => {
  localStorage.setItem(DNI_STORAGE_KEY, dniToSave);
};

const resetIdentification = () => {
  dni.value = '';
  instrumentador.value = null;
  instrumentadorFound.value = null;
  dniError.value = '';
  localStorage.removeItem(DNI_STORAGE_KEY);
};

watch(dni, (newValue, oldValue) => {
  const digits = newValue.replace(/\D/g, '');
  if (digits.length > 8) {
    dni.value = oldValue;
    return;
  }
  let formatted = '';
  if (digits.length > 2) {
    formatted += digits.substring(0, 2) + '.';
    if (digits.length > 5) {
      formatted += digits.substring(2, 5) + '.' + digits.substring(5, 8);
    } else {
      formatted += digits.substring(2);
    }
  } else {
    formatted = digits;
  }
  if (newValue !== formatted) {
    dni.value = formatted;
  }
});

const checkDni = async () => {
  dniError.value = '';
  instrumentadorFound.value = null;
  const cleanDni = dni.value.replace(/\D/g, '');
  if (cleanDni.length < 7) {
    dniError.value = 'Por favor, ingrese un DNI válido.';
    return;
  }
  isCheckingDni.value = true;
  try {
    const { data, error } = await supabase.from('instrumentadores').select('*').eq('dni', cleanDni).maybeSingle();
    if (error) throw error;
    if (data) {
      instrumentador.value = data;
      instrumentadorFound.value = true;
      saveDniToStorage(dni.value);
    } else {
      instrumentadorFound.value = false;
    }
  } catch (err) {
    dniError.value = 'Error al verificar DNI. Intente de nuevo.';
  } finally {
    isCheckingDni.value = false;
  }
};

const registerAndProceed = async () => {
  isSaving.value = true;
  try {
    const cleanDni = dni.value.replace(/\D/g, '');
    const newInstrumentador = { dni: cleanDni, nombre_completo: nombreCompleto.value.trim() };
    const { data, error } = await supabase.from('instrumentadores').insert(newInstrumentador).select().single();
    if (error) throw error;
    saveDniToStorage(dni.value);
    emit('identification-complete', data);
  } catch (err) {
    dniError.value = 'No se pudo registrar. Inténtelo de nuevo.';
  } finally {
    isSaving.value = false;
  }
};

const proceed = () => {
  emit('identification-complete', instrumentador.value);
};

const requestUpdate = () => {
  emit('request-update');
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }

.step { @apply flex items-center text-slate-400 dark:text-slate-500 transition-colors duration-300 font-semibold; }
.step.active { @apply font-extrabold text-blue-600 dark:text-blue-400; }
.step span { @apply h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold mr-1.5 transition-colors duration-300; }
.step.active span { @apply bg-blue-600 text-white dark:bg-blue-500; }
.step-separator { @apply flex-grow h-px bg-slate-200 dark:bg-slate-800 mx-2 sm:mx-4; }
</style>