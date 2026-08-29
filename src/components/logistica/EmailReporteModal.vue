<!-- src/components/logistica/EmailReporteModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-3xl max-h-[92vh] my-auto flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-sans">
      
      <!-- Header (Fijo) -->
      <div class="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              DISTRIBUCIÓN POR CORREO
            </span>
            <span v-if="informe" class="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
              {{ formatDate(informe.fecha) }}
            </span>
          </div>
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            Enviar Informe Diario de Logística
          </h3>
        </div>
        
        <button 
          type="button"
          @click="$emit('close')" 
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Selector de Modo: Envío Automático vs Vista previa vs Manual -->
      <div class="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1.5 shrink-0 text-xs flex-wrap">
        <button
          type="button"
          @click="activeTab = 'resend'"
          :class="[
            'flex-1 py-1.5 px-3 rounded-xl font-extrabold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 min-w-[140px]',
            activeTab === 'resend'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <span>⚡ Envío automático</span>
          <span v-if="activeTab === 'resend'" class="px-1.5 py-0.5 bg-blue-500 text-white text-[8px] rounded font-black uppercase">RECOMENDADO</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'preview'"
          :class="[
            'py-1.5 px-3 rounded-xl font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5',
            activeTab === 'preview'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <span>👁️ Vista previa</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'manual'"
          :class="[
            'py-1.5 px-3 rounded-xl font-bold transition-all text-center cursor-pointer',
            activeTab === 'manual'
              ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          Envío manual
        </button>
      </div>

      <!-- Body Contenido -->
      <div class="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1 min-h-0">
        
        <!-- 1. ENVÍO AUTOMÁTICO (RECOMENDADO) -->
        <template v-if="activeTab === 'resend'">
          
          <!-- Encabezado "Enviando como" -->
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
            <div class="space-y-0.5 min-w-0 flex-1">
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Enviando como
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-extrabold text-xs text-slate-900 dark:text-white">
                  {{ currentUserInfo?.senderName || 'DISTRICORR' }}
                </span>
                <span class="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  &lt;{{ currentUserInfo?.email || 'Obteniendo usuario...' }}&gt;
                </span>
              </div>
            </div>
            <div class="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-slate-200/70 dark:bg-slate-700/60 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 font-medium">
              <svg class="w-3 h-3 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>Validado por tu cuenta</span>
            </div>
          </div>

          <!-- Alerta si el usuario no tiene email_enabled -->
          <div v-if="currentUserInfo && !currentUserInfo.isResendReady" class="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 font-semibold space-y-1">
            <div class="font-bold flex items-center gap-1.5">
              <span>⚠️ Permiso de envío pendiente</span>
            </div>
            <p class="leading-relaxed text-[10px]">
              Tu usuario (<strong>{{ currentUserInfo.email }}</strong>) requiere habilitación para enviar correos directos por Resend (`email_enabled === true`).
            </p>
          </div>

          <!-- Bloque de Destinatarios (Grid en 2 columnas) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-extrabold text-slate-800 dark:text-slate-200">
                Destinatarios
              </span>
              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  @click="activeTab = 'preview'" 
                  class="font-bold text-blue-600 dark:text-blue-400 hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <span>👁️ Ver vista previa HTML</span>
                </button>
                <span class="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-extrabold text-[11px] rounded-full">
                  {{ selectedEmailsCount }} seleccionados
                </span>
              </div>
            </div>

            <!-- Lista de Destinatarios en Grid Responsive de 2 columnas -->
            <div class="border-y border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 py-2 max-h-[260px] sm:max-h-none overflow-y-auto">
              <label 
                v-for="item in emailList" 
                :key="item.email"
                class="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer group"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <input 
                    type="checkbox" 
                    v-model="item.selected" 
                    @change="handleRecipientsChange"
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer shrink-0" 
                  />
                  <span class="font-bold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {{ item.label }}
                  </span>
                </div>
                <span class="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate ml-1.5">
                  {{ item.email }}
                </span>
              </label>
            </div>

            <!-- Controles y Guardar como Predeterminado -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <button 
                type="button" 
                @click="toggleAllEmails" 
                class="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {{ allSelected ? 'Deseleccionar todos' : 'Seleccionar todos' }}
              </button>

              <label class="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                <input 
                  type="checkbox" 
                  v-model="saveAsDefault" 
                  @change="handleSaveDefaultToggle"
                  class="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <span>Usar estos destinatarios como predeterminados</span>
              </label>
            </div>
          </div>

          <!-- Recibir Copia en mi Correo (BCC) -->
          <div class="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-slate-200">
              <input 
                type="checkbox" 
                v-model="receiveCopy" 
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer" 
              />
              <span>Recibir una copia en mi correo</span>
            </label>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
              La recibirás en <strong class="font-mono text-slate-700 dark:text-slate-300">{{ currentUserInfo?.email || 'tu casilla' }}</strong> para conservar el correo y continuar la conversación desde tu cliente habitual.
            </p>
          </div>

          <!-- Advertencia y Botón CTA Principal de Envío con Doble Confirmación de Seguridad -->
          <div class="space-y-2 pt-1">
            <div class="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-xl border border-amber-200/70 dark:border-amber-900/60 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>Al continuar, el correo se enviará directamente a los destinatarios seleccionados.</span>
            </div>

            <button
              type="button"
              @click="handleSendButtonClick"
              :disabled="isSendingResend || selectedEmailsCount === 0 || (currentUserInfo && !currentUserInfo.isResendReady)"
              :class="[
                'w-full py-3.5 px-4 rounded-xl font-extrabold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer',
                isSendingResend 
                  ? 'bg-blue-600 opacity-80 cursor-wait'
                  : isConfirmingSend
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 ring-4 ring-amber-500/30 animate-pulse shadow-amber-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20'
              ]"
            >
              <svg v-if="isSendingResend" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="isSendingResend">Enviando informe...</span>
              <span v-else-if="isConfirmingSend">⚠️ Confirmar envío directo a {{ selectedEmailsCount }} destinatarios</span>
              <span v-else>Enviar informe ahora</span>
            </button>
          </div>

          <!-- Estado / Respuesta del Envío Automático -->
          <div v-if="resendResult" :class="[
            'p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn',
            resendResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
          ]">
            <div class="font-bold text-xs flex items-center justify-between">
              <span>{{ resendResult.success ? `✓ Informe enviado correctamente a ${lastSentCount} destinatarios` : '❌ Error al enviar informe' }}</span>
              <span v-if="resendResult.id" class="font-mono text-[9px] bg-emerald-200/60 dark:bg-emerald-900 px-1.5 py-0.5 rounded">
                ID: {{ resendResult.id }}
              </span>
            </div>
            <p class="font-mono text-[10px] break-all">
              {{ resendResult.message }}
            </p>
          </div>
        </template>

        <!-- 2. VISTA PREVIA INTERACTIVA DEL CORREO -->
        <template v-else-if="activeTab === 'preview'">
          <div class="space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="space-y-0.5">
                <h4 class="font-extrabold text-xs text-slate-900 dark:text-white">Vista previa del correo</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Así se verá el mensaje en la bandeja de entrada de los destinatarios.
                </p>
              </div>

              <!-- Conmutador de modo Escritorio vs Móvil -->
              <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px]">
                <button
                  type="button"
                  @click="previewDevice = 'desktop'"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1',
                    previewDevice === 'desktop' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500'
                  ]"
                >
                  <span>💻 Escritorio</span>
                </button>
                <button
                  type="button"
                  @click="previewDevice = 'mobile'"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1',
                    previewDevice === 'mobile' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500'
                  ]"
                >
                  <span>📱 Móvil</span>
                </button>
              </div>
            </div>

            <!-- iFrame de Renderizado HTML del Email -->
            <div class="flex justify-center bg-slate-200/70 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <iframe
                :srcdoc="computedEmailHtml"
                :style="{ width: previewDevice === 'mobile' ? '380px' : '100%', height: '480px' }"
                class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white transition-all shadow-sm"
                title="Vista previa del correo electrónico"
              ></iframe>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-slate-400 font-mono">
                Renderizado HTML dinámico oficial de DISTRICORR · Gestión IQ
              </span>
              <button
                type="button"
                @click="activeTab = 'resend'"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Volver al envío 🚀</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 3. ENVÍO MANUAL (SECUNDARIO) -->
        <template v-else>
          <div class="p-3 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
            <h4 class="font-extrabold text-xs text-slate-900 dark:text-white">Envío manual</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Copiá la tabla del informe y pegala en tu cliente de correo habitual.
            </p>
          </div>

          <!-- Paso 1: Copiar Tabla HTML -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              PASO 1: Copiar contenido del informe
            </span>
            
            <button 
              type="button" 
              @click="handleCopyTable" 
              :class="[
                'w-full py-2.5 px-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border',
                isTableCopied 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200'
              ]"
            >
              <svg v-if="isTableCopied" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              <svg v-else class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              <span>{{ isTableCopied ? '✓ Tabla copiada al portapapeles' : 'Copiar tabla HTML' }}</span>
            </button>
          </div>

          <!-- Paso 2: Abrir Aplicación de Correo -->
          <div class="space-y-1.5 pt-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              PASO 2: Abrir aplicación de correo
            </span>
            
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                @click="openEmailClient('outlook')" 
                :disabled="!isTableCopied || selectedEmailsCount === 0"
                class="py-2 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Outlook / Mail</span>
              </button>
              
              <button 
                type="button" 
                @click="openEmailClient('gmail')" 
                :disabled="!isTableCopied || selectedEmailsCount === 0"
                class="py-2 px-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Gmail Web</span>
              </button>
            </div>
            
            <p v-if="!isTableCopied" class="text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center pt-1">
              ⚠️ Copiá primero la tabla en el PASO 1 para habilitar los clientes de correo.
            </p>
          </div>

          <!-- Recibir Copia Checkbox en Modo Manual -->
          <div class="p-2.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1 mt-2">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-slate-200">
              <input 
                type="checkbox" 
                v-model="receiveCopy" 
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer" 
              />
              <span>Recibir una copia en mi correo</span>
            </label>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
              La recibirás en <strong class="font-mono text-slate-700 dark:text-slate-300">{{ currentUserInfo?.email || 'tu casilla' }}</strong>.
            </p>
          </div>
        </template>

        <!-- Ultra-Compact Summary Line -->
        <div v-if="informe" class="px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl text-[10px] text-slate-600 dark:text-slate-300 flex items-center justify-between flex-wrap gap-1 border border-slate-200/60 dark:border-slate-700/60 font-medium mt-1">
          <span>👤 <strong>{{ informe.responsable_nombre }}</strong> ({{ informe.zona || 'Formosa' }})</span>
          <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
            📦 {{ stats.totalMovimientos }} movs | {{ stats.totalCajas }} cajas/equipos
          </span>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Envío Exitoso -->
    <EmailEnvioExitosoModal 
      :show="showSuccessModal" 
      :details="successDetails" 
      @close="handleSuccessModalClose" 
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { supabase } from '../../services/supabase';
import { sendEmailWithResend, getCurrentResendUser } from '../../services/resendService';
import EmailEnvioExitosoModal from './EmailEnvioExitosoModal.vue';

const props = defineProps({
  show: Boolean,
  informe: Object,
  stats: Object,
  movimientos: Array,
  htmlTableProvider: Function,
  getHtmlContent: Function
});

const emit = defineEmits(['close', 'copy-table', 'email-sent']);
const toast = useToast();

const activeTab = ref('resend'); // 'resend' (Envío automático) | 'preview' | 'manual'
const previewDevice = ref('desktop'); // 'desktop' | 'mobile'
const isTableCopied = ref(false);

const currentUserInfo = ref(null);
const isSendingResend = ref(false);
const isConfirmingSend = ref(false);
const resendResult = ref(null);
const lastSentCount = ref(0);

const showSuccessModal = ref(false);
const successDetails = ref(null);

const saveAsDefault = ref(false);
const receiveCopy = ref(true);

const STORAGE_KEY_PREFIX = 'giq_default_recipients_';

const emailList = ref([
  { label: 'Compras Implantes', email: 'comprasimplantes@districorr.com.ar', selected: true },
  { label: 'Depósito Central', email: 'deposito@districorr.com.ar', selected: true },
  { label: 'Logística Formosa', email: 'logistica@districorr.com.ar', selected: true },
  { label: 'Logística Corrientes', email: 'log.corrientes@districorr.com.ar', selected: true },
  { label: 'Control de Calidad', email: 'controldecalidad@districorr.com.ar', selected: true },
  { label: 'F. Simonetto', email: 'fsimonetto@districorr.com.ar', selected: true },
  { label: 'A. Simonetto', email: 'asimonetto@districorr.com.ar', selected: true },
  { label: 'Contable', email: 'contable@districorr.com.ar', selected: true },
  { label: 'Sistemas', email: 'sistemas@districorr.com.ar', selected: true }
]);

const computedEmailHtml = computed(() => {
  if (props.getHtmlContent) {
    return props.getHtmlContent();
  }
  return `<div style="padding: 20px; font-family: Arial, sans-serif;">Generando contenido de correo...</div>`;
});

const selectedEmails = computed(() => {
  return emailList.value.filter(item => item.selected).map(item => item.email);
});

const selectedEmailsCount = computed(() => selectedEmails.value.length);

const allSelected = computed(() => {
  return emailList.value.every(item => item.selected);
});

const getStorageKey = () => {
  const userId = currentUserInfo.value?.id || 'default';
  const zona = (props.informe?.zona || 'general').toLowerCase();
  return `${STORAGE_KEY_PREFIX}${userId}_${zona}`;
};

const loadDefaultRecipients = () => {
  try {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      const savedEmails = JSON.parse(saved);
      if (Array.isArray(savedEmails) && savedEmails.length > 0) {
        emailList.value.forEach(item => {
          item.selected = savedEmails.includes(item.email);
        });
        saveAsDefault.value = true;
      }
    }
  } catch (err) {
    console.warn('Error cargando destinatarios predeterminados:', err);
  }
};

const saveCurrentRecipientsToStorage = () => {
  try {
    const selected = selectedEmails.value;
    localStorage.setItem(getStorageKey(), JSON.stringify(selected));
  } catch (e) {}
};

const handleRecipientsChange = () => {
  isConfirmingSend.value = false;
  if (saveAsDefault.value) {
    saveCurrentRecipientsToStorage();
  }
};

const handleSaveDefaultToggle = () => {
  if (saveAsDefault.value) {
    saveCurrentRecipientsToStorage();
    toast.info('Destinatarios guardados como predeterminados para esta zona.');
  } else {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (e) {}
  }
};

const toggleAllEmails = () => {
  isConfirmingSend.value = false;
  const targetState = !allSelected.value;
  emailList.value.forEach(item => {
    item.selected = targetState;
  });
  if (saveAsDefault.value) {
    saveCurrentRecipientsToStorage();
  }
};

const loadAuthUserInfo = async () => {
  try {
    const uInfo = await getCurrentResendUser();
    currentUserInfo.value = uInfo;
    loadDefaultRecipients();
  } catch (err) {
    console.warn('Error obteniendo usuario autenticado:', err);
  }
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown) {
      isConfirmingSend.value = false;
      showSuccessModal.value = false;
      loadAuthUserInfo();
    } else {
      resendResult.value = null;
      isTableCopied.value = false;
      isConfirmingSend.value = false;
      showSuccessModal.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => [props.movimientos, props.informe?.id, activeTab.value],
  () => {
    isTableCopied.value = false;
    resendResult.value = null;
    isConfirmingSend.value = false;
  },
  { deep: true }
);

const handleCopyTable = async () => {
  try {
    emit('copy-table');
    isTableCopied.value = true;
    toast.success('📋 Tabla formateada copiada al portapapeles. ¡Ahora podés abrir tu correo!');
  } catch (err) {
    toast.error('Error al copiar tabla: ' + err.message);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatNowDateTime = () => {
  const date = new Date();
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const openEmailClient = async (provider = 'outlook') => {
  if (!props.informe || selectedEmails.value.length === 0 || !isTableCopied.value) return;

  try {
    const recipients = selectedEmails.value.join(',');
    const subjectStr = `Informe Diario de Logística - ${formatDate(props.informe.fecha)} - ${props.informe.responsable_nombre} (${props.informe.zona || 'Formosa'})`;
    
    const bodyText = `Hola,\n\nAdjunto el Informe Diario de Logística correspondiente a la jornada.\n`;

    const bccEmail = receiveCopy.value && currentUserInfo.value?.email ? currentUserInfo.value.email : 'sistemas@districorr.com.ar';

    if (provider === 'gmail') {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipients)}&bcc=${encodeURIComponent(bccEmail)}&su=${encodeURIComponent(subjectStr)}&body=${encodeURIComponent(bodyText)}`;
      window.open(gmailUrl, '_blank');
    } else {
      const mailtoUrl = `mailto:${recipients}?bcc=${encodeURIComponent(bccEmail)}&subject=${encodeURIComponent(subjectStr)}&body=${encodeURIComponent(bodyText)}`;
      window.open(mailtoUrl, '_blank');
    }

    emit('close');
  } catch (err) {
    toast.error('Error al abrir aplicación de correo: ' + err.message);
  }
};

const handleSendButtonClick = () => {
  if (!isConfirmingSend.value) {
    isConfirmingSend.value = true;
    toast.info('⚠️ Presioná el botón de nuevo para confirmar el envío definitivo.');
    return;
  }
  handleSendResend();
};

const handleSuccessModalClose = () => {
  showSuccessModal.value = false;
  emit('email-sent', successDetails.value);
  emit('close');
};

const handleSendResend = async () => {
  if (!props.informe || selectedEmails.value.length === 0) {
    toast.error('Debes seleccionar al menos un destinatario.');
    return;
  }

  if (!currentUserInfo.value || !currentUserInfo.value.isResendReady) {
    toast.error('Tu cuenta de usuario requiere autorización para enviar correos (email_enabled === true).');
    return;
  }

  isSendingResend.value = true;
  isConfirmingSend.value = false;
  resendResult.value = null;

  try {
    const subjectStr = `Informe Diario de Logística - ${formatDate(props.informe.fecha)} - ${props.informe.responsable_nombre} (${props.informe.zona || 'Formosa'})`;
    
    let htmlContent = '';
    if (props.getHtmlContent) {
      htmlContent = props.getHtmlContent();
    } else {
      htmlContent = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Informe Diario de Logística — Districorr</h2>
        <p><strong>Fecha:</strong> ${formatDate(props.informe.fecha)}</p>
        <p><strong>Responsable:</strong> ${props.informe.responsable_nombre}</p>
        <p><strong>Zona:</strong> ${props.informe.zona || 'Formosa'}</p>
        <p><strong>Movimientos:</strong> ${props.movimientos?.length || 0}</p>
      </div>`;
    }

    const bccRecipient = receiveCopy.value && currentUserInfo.value?.email ? currentUserInfo.value.email : undefined;
    const targetCount = selectedEmails.value.length;

    const res = await sendEmailWithResend({
      to: selectedEmails.value,
      bcc: bccRecipient,
      subject: subjectStr,
      html: htmlContent
    });

    lastSentCount.value = targetCount;
    const nowIso = new Date().toISOString();

    // 1. Actualizar estado y fecha en Supabase Database
    try {
      if (props.informe?.id) {
        await supabase
          .from('logistica_informes_diarios')
          .update({
            estado: 'enviado',
            enviado_at: nowIso
          })
          .eq('id', props.informe.id);
      }
    } catch (dbErr) {
      console.warn('[EmailReporteModal] Advertencia actualizando enviado_at en Supabase:', dbErr);
    }

    // 2. Guardar registro del evento de correo en localStorage para trazabilidad del historial
    const logPayload = {
      id: res.id,
      timestamp: nowIso,
      formattedTimestamp: formatNowDateTime(),
      sender: res.sender || currentUserInfo.value?.from,
      recipients: [...selectedEmails.value],
      bcc: bccRecipient,
      status: 'enviado'
    };

    try {
      if (props.informe?.id) {
        const historyKey = `giq_email_logs_${props.informe.id}`;
        const existingLogs = JSON.parse(localStorage.getItem(historyKey) || '[]');
        existingLogs.unshift(logPayload);
        localStorage.setItem(historyKey, JSON.stringify(existingLogs));
      }
    } catch (e) {}

    resendResult.value = {
      success: true,
      id: res.id,
      sender: res.sender || currentUserInfo.value?.from,
      message: `Enviado a ${targetCount} destinatarios ${receiveCopy.value ? '(con copia a tu correo)' : ''}`
    };

    // 3. Abrir Modal de Confirmación de Éxito para el usuario
    successDetails.value = logPayload;
    showSuccessModal.value = true;

    toast.success(`🚀 ¡Informe enviado exitosamente a ${targetCount} destinatarios!`);
  } catch (err) {
    console.error('Error enviando informe:', err);
    resendResult.value = {
      success: false,
      message: err.message
    };
    toast.error(`Error de envío: ${err.message}`);
  } finally {
    isSendingResend.value = false;
  }
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.18s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>
