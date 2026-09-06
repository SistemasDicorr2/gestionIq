<!-- src/views/LoginView.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] w-full relative overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-[#06101E] text-slate-100 font-sans select-none">
    
    <!-- FONDO AMBIENTAL DE ALTA CALIDAD (ESTILO EMIL KOWALSKI / LINEAR) -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0E2849] via-[#06101E] to-[#030810] pointer-events-none"></div>

    <!-- Malla sutil de baja opacidad para textura -->
    <div class="absolute inset-0 opacity-[0.07] pointer-events-none bg-subtle-grid"></div>

    <!-- Resplandor ambiental superior difuminado -->
    <div class="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- CONTENEDOR PRINCIPAL DE LOGIN -->
    <div 
      :class="[
        'relative z-10 w-full max-w-[380px] sm:max-w-md px-5 py-6 sm:p-8 bg-[#0A1628]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 my-auto',
        { 'animate-shake': cardShake }
      ]"
    >
      
      <!-- Línea de acento superior minimalista -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

      <!-- CABECERA INSTITUCIONAL: DISTRICORR - GESTIÓN IQ -->
      <div class="text-center mb-6">
        <!-- Badge Institucional -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium tracking-wide text-slate-300 shadow-inner">
          <span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
          <span>Acceso Institucional</span>
        </div>

        <!-- Isologo Oficial Districorr en su estado original -->
        <div class="mb-3 flex items-center justify-center">
          <img 
            src="/ISologo  (1).svg" 
            alt="Districorr" 
            class="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        <!-- Título y Descripción Real del Sistema -->
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Gestión <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">IQ</span>
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-slate-400 font-normal">
          Trazabilidad & Gestión Quirúrgica
        </p>
      </div>

      <!-- ALERTA DE ERROR / BLOQUEO POR INTENTOS -->
      <div v-if="errorMessage" class="mb-4 p-3 text-xs font-medium text-red-200 bg-red-950/50 rounded-xl border border-red-800/40 flex items-center gap-2.5" role="alert">
        <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="lockoutTimeLeft > 0" class="mb-4 p-3 text-xs font-medium text-amber-200 bg-amber-950/50 rounded-xl border border-amber-800/40 flex items-center gap-2.5" role="alert">
        <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Demasiados intentos fallidos. Esperá {{ lockoutTimeLeft }}s para reintentar.</span>
      </div>

      <!-- FORMULARIO DE INICIO DE SESIÓN -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        
        <!-- CAMPO: CORREO ELECTRÓNICO -->
        <div>
          <label for="email" class="block text-xs font-medium text-slate-300 mb-1.5">
            Correo electrónico
          </label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input 
              v-model="email" 
              id="email" 
              type="email" 
              autocomplete="email" 
              required 
              placeholder="usuario@districorr.com.ar"
              class="w-full pl-10 pr-3.5 py-2.5 bg-[#061121] border border-slate-800 rounded-xl text-xs sm:text-sm font-normal text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200" 
            />
          </div>
        </div>

        <!-- CAMPO: CONTRASEÑA -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="password" class="block text-xs font-medium text-slate-300">
              Contraseña
            </label>
            <button 
              type="button" 
              @click="isForgotPasswordOpen = true" 
              class="text-xs font-normal text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input 
              v-model="password" 
              id="password" 
              :type="passwordVisible ? 'text' : 'password'" 
              autocomplete="current-password" 
              required 
              placeholder="••••••••••••"
              @keyup="checkCapsLock"
              @keydown="checkCapsLock"
              class="w-full pl-10 pr-10 py-2.5 bg-[#061121] border border-slate-800 rounded-xl text-xs sm:text-sm font-normal text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200" 
            />
            <button 
              type="button" 
              @click="togglePasswordVisibility" 
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
              :title="passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="!passwordVisible" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.973 8.973 0 013.682-.792c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243m4.242 4.242L3 3m18 18l-3.875-3.875" /></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
          </div>

          <!-- AVISO DE CAPS LOCK (MAYÚSCULAS ACTIVADAS) -->
          <div v-if="isCapsLockOn" class="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Bloqueo de mayúsculas activado</span>
          </div>
        </div>

        <!-- RECORDAR CORREO -->
        <div class="flex items-center justify-between text-xs pt-0.5">
          <label class="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input 
              v-model="rememberMe" 
              type="checkbox" 
              class="w-3.5 h-3.5 rounded border-slate-700 bg-[#061121] text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 cursor-pointer"
            />
            <span>Recordar mi correo</span>
          </label>
        </div>

        <!-- BOTÓN PRINCIPAL DE INGRESAR -->
        <div class="pt-2">
          <button 
            type="submit" 
            :disabled="loading || lockoutTimeLeft > 0" 
            class="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-gradient-to-r from-[#086F92] to-[#0CA0D2] hover:from-[#075f7d] hover:to-[#098ec0] text-white font-semibold text-xs sm:text-sm shadow-md shadow-cyan-950/40 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg v-if="loading" class="w-4 h-4 text-white animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Iniciando sesión...' : (lockoutTimeLeft > 0 ? `Bloqueado (${lockoutTimeLeft}s)` : 'Iniciar sesión') }}</span>
            <svg v-if="!loading && lockoutTimeLeft === 0" class="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
          </button>
        </div>
      </form>

      <!-- FOOTER: DISTRICORR DEBAJO -->
      <div class="mt-6 pt-4 border-t border-slate-800/80 text-center">
        <p class="text-[11px] text-slate-400 mb-2">
          Districorr • Trazabilidad Quirúrgica
        </p>
        <a 
          href="https://www.districorr.com.ar" 
          target="_blank" 
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 group focus:outline-none"
          title="Sitio web de Districorr"
        >
          <img 
            src="/2.svg" 
            alt="Districorr" 
            class="h-7 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200 filter brightness-0 invert"
          />
        </a>
      </div>

    </div>

    <!-- MODAL DE RECUPERACIÓN DE CONTRASEÑA -->
    <ForgotPasswordModal 
      :is-open="isForgotPasswordOpen" 
      :initial-email="email" 
      @close="isForgotPasswordOpen = false" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../services/supabase';
import ForgotPasswordModal from '../components/ForgotPasswordModal.vue';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const passwordVisible = ref(false);
const rememberMe = ref(false);
const isCapsLockOn = ref(false);
const cardShake = ref(false);
const isForgotPasswordOpen = ref(false);
const failedAttempts = ref(0);
const lockoutTimeLeft = ref(0);
let lockoutInterval = null;
const router = useRouter();

onMounted(() => {
  const savedEmail = localStorage.getItem('gestion_iq_remember_email');
  if (savedEmail) {
    email.value = savedEmail;
    rememberMe.value = true;
  }
});

const checkCapsLock = (event) => {
  if (event && typeof event.getModifierState === 'function') {
    isCapsLockOn.value = event.getModifierState('CapsLock');
  }
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const triggerShake = () => {
  cardShake.value = true;
  setTimeout(() => {
    cardShake.value = false;
  }, 500);
};

const startLockout = () => {
  lockoutTimeLeft.value = 30;
  if (lockoutInterval) clearInterval(lockoutInterval);
  lockoutInterval = setInterval(() => {
    lockoutTimeLeft.value -= 1;
    if (lockoutTimeLeft.value <= 0) {
      clearInterval(lockoutInterval);
      failedAttempts.value = 0;
    }
  }, 1000);
};

const handleLogin = async () => {
  if (lockoutTimeLeft.value > 0) return;
  try {
    loading.value = true;
    errorMessage.value = '';
    
    // Sanitización de correo (trim + a minúsculas)
    const sanitizedEmail = email.value.trim().toLowerCase();
    email.value = sanitizedEmail;

    // Guardar o remover correo recordado
    if (rememberMe.value && sanitizedEmail) {
      localStorage.setItem('gestion_iq_remember_email', sanitizedEmail);
    } else {
      localStorage.removeItem('gestion_iq_remember_email');
    }

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password.value,
    });
    if (error) throw error;

    // Reiniciar contador de intentos tras login exitoso
    failedAttempts.value = 0;

    // Redirección robusta con fallback si app_metadata.role no estuviera cargado
    const userRole = session?.user?.app_metadata?.role || session?.user?.user_metadata?.role || 'admin';
    if (userRole === 'logistica') {
      router.push('/logistica/informes');
    } else {
      router.push('/admin');
    }
  } catch (error) {
    failedAttempts.value += 1;
    if (failedAttempts.value >= 5) {
      startLockout();
      errorMessage.value = '';
    } else {
      errorMessage.value = error.message || 'Email o contraseña incorrectos.';
    }
    triggerShake();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Textura de malla sutil de baja opacidad */
.bg-subtle-grid {
  background-size: 32px 32px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
}

/* Manejo seguro de autofill de navegador */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #061121 inset !important;
  -webkit-text-fill-color: #ffffff !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Animación de agitación ante error */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>