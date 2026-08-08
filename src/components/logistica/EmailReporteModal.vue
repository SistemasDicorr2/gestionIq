<!-- src/components/logistica/EmailReporteModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-sans">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="space-y-0.5">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Distribución por Correo
          </span>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
            Enviar Informe Diario de Logística
          </h3>
        </div>
        
        <button 
          type="button"
          @click="$emit('close')" 
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
        
        <!-- Intro Notice -->
        <div class="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-950 dark:text-blue-300 space-y-1">
          <p class="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-200">
            <span>💡 Envío rápido e integrado</span>
          </p>
          <p class="leading-relaxed">
            Puedes abrir tu cliente de correo (Outlook, Gmail, etc.) pre-llenado con las direcciones oficiales de Districorr, o copiar la tabla formateada del informe para pegarla directamente.
          </p>
        </div>

        <!-- Destinatarios Oficiales Selection -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Destinatarios Oficiales Districorr
            </span>

            <button 
              type="button" 
              @click="toggleAllEmails" 
              class="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {{ allSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos' }}
            </button>
          </div>

          <div class="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div 
              v-for="item in emailList" 
              :key="item.email"
              class="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
            >
              <label class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="item.selected" 
                  class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer" 
                />
                <div class="min-w-0 flex-1">
                  <span class="font-extrabold text-slate-900 dark:text-white block truncate text-xs">{{ item.label }}</span>
                  <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 block truncate">{{ item.email }}</span>
                </div>
              </label>

              <button 
                type="button" 
                @click="copySingleEmail(item.email)" 
                class="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors min-w-[32px] flex items-center justify-center cursor-pointer"
                :title="`Copiar ${item.email}`"
              >
                <span v-if="copiedEmail === item.email" class="text-emerald-500 text-[10px] font-bold">✓ Copiado</span>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Resumen del Informe a Enviar -->
        <div v-if="informe" class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
          <div class="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
            <span>📅 Fecha: {{ formatDate(informe.fecha) }}</span>
            <span>📍 Zona: {{ informe.zona || 'Formosa' }}</span>
          </div>
          <div class="text-slate-600 dark:text-slate-400">
            👤 Responsable: <strong>{{ informe.responsable_nombre }}</strong>
          </div>
          <div class="text-slate-500 font-mono text-[10px]">
            Movimientos: {{ stats.totalMovimientos }} | Cajas: {{ stats.totalCajas }} | Bultos: {{ stats.totalBultos }} | Pendientes: {{ stats.totalPendientes }}
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 space-y-2">
        <!-- Main Primary Mailto Action -->
        <button 
          type="button" 
          @click="openMailtoApp" 
          :disabled="selectedEmailsCount === 0"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98 min-h-[44px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>🚀 Abrir Correo con Destinatarios ({{ selectedEmailsCount }})</span>
        </button>

        <!-- Secondary Action Buttons Grid -->
        <div class="grid grid-cols-2 gap-2">
          <button 
            type="button" 
            @click="copySelectedEmailsText" 
            :disabled="selectedEmailsCount === 0"
            class="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            <span>📋 Copiar Emails</span>
          </button>

          <button 
            type="button" 
            @click="$emit('copy-table')" 
            class="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>📋 Copiar Tabla HTML</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
  informe: Object,
  stats: Object,
  movimientos: Array,
  htmlTableProvider: Function
});

const emit = defineEmits(['close', 'copy-table']);
const toast = useToast();

const copiedEmail = ref(null);

const emailList = ref([
  { label: 'Compras Implantes', email: 'comprasimplantes@districorr.com.ar', selected: true },
  { label: 'Depósito Central', email: 'deposito@districorr.com.ar', selected: true },
  { label: 'Logística Formosa', email: 'logistica@districorr.com.ar', selected: true },
  { label: 'Logística Corrientes', email: 'log.corrientes@districorr.com.ar', selected: true },
  { label: 'Control de Calidad', email: 'controldecalidad@districorr.com.ar', selected: true }
]);

const selectedEmails = computed(() => {
  return emailList.value.filter(item => item.selected).map(item => item.email);
});

const selectedEmailsCount = computed(() => selectedEmails.value.length);

const allSelected = computed(() => {
  return emailList.value.every(item => item.selected);
});

const toggleAllEmails = () => {
  const targetState = !allSelected.value;
  emailList.value.forEach(item => {
    item.selected = targetState;
  });
};

const copySingleEmail = async (emailStr) => {
  try {
    await navigator.clipboard.writeText(emailStr);
    copiedEmail.value = emailStr;
    toast.success(`Copiado: ${emailStr}`);
    setTimeout(() => {
      if (copiedEmail.value === emailStr) {
        copiedEmail.value = null;
      }
    }, 2000);
  } catch (err) {
    toast.error('No se pudo copiar el correo: ' + err.message);
  }
};

const copySelectedEmailsText = async () => {
  if (selectedEmails.value.length === 0) return;
  try {
    const textToCopy = selectedEmails.value.join(', ');
    await navigator.clipboard.writeText(textToCopy);
    toast.success(`📋 Copiados ${selectedEmails.value.length} correos al portapapeles.`);
  } catch (err) {
    toast.error('Error al copiar correos: ' + err.message);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const openMailtoApp = async () => {
  if (!props.informe || selectedEmails.value.length === 0) return;

  try {
    // 1. Trigger copy HTML table if provider exists
    if (props.htmlTableProvider) {
      await props.htmlTableProvider();
    }

    const recipients = selectedEmails.value.join(',');
    const subjectStr = `Informe Diario de Logística - ${formatDate(props.informe.fecha)} - ${props.informe.responsable_nombre} (${props.informe.zona || 'Formosa'})`;
    
    let bodyText = `Hola,\n\nAdjunto el resumen del Informe Diario de Logística Operativa.\n\n`;
    bodyText += `• Fecha: ${formatDate(props.informe.fecha)}\n`;
    bodyText += `• Responsable: ${props.informe.responsable_nombre}\n`;
    bodyText += `• Zona: ${props.informe.zona || 'Formosa'}\n`;
    bodyText += `• Movimientos: ${props.stats?.totalMovimientos || 0}\n`;
    bodyText += `• Total Cajas: ${props.stats?.totalCajas || 0}\n`;
    bodyText += `• Total Bultos: ${props.stats?.totalBultos || 0}\n`;
    bodyText += `• Pendientes Declarados: ${props.stats?.totalPendientes || 0}\n\n`;

    if (props.informe.observacion_general) {
      bodyText += `Observación General: ${props.informe.observacion_general}\n\n`;
    }

    bodyText += `--------------------------------------------------\n`;
    bodyText += `Nota: La tabla formateada del informe ha sido copiada automáticamente a tu portapapeles.\n`;
    bodyText += `Solo presiona PEGAR (Ctrl + V) en el cuerpo del correo para insertar el cuadro detallado.\n\n`;
    bodyText += `Gestión IQ — Districorr.`;

    const mailtoUrl = `mailto:${recipients}?subject=${encodeURIComponent(subjectStr)}&body=${encodeURIComponent(bodyText)}`;

    window.open(mailtoUrl, '_blank');
    emit('close');
  } catch (err) {
    toast.error('Error al abrir la aplicación de correo: ' + err.message);
  }
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
