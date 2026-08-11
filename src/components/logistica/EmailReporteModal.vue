<!-- src/components/logistica/EmailReporteModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] my-auto flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-sans">
      
      <!-- Compact Header (Fijo) -->
      <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Distribución por Correo
            </span>
            <span v-if="informe" class="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {{ formatDate(informe.fecha) }}
            </span>
          </div>
          <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
            Enviar Informe Diario de Logística
          </h3>
        </div>
        
        <button 
          type="button"
          @click="$emit('close')" 
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Compact Content Body (Scrollable interno si sobrepasa pantalla) -->
      <div class="p-3 sm:p-4 space-y-3 text-xs overflow-y-auto flex-1 min-h-0">
        
        <!-- Header Selector Bar -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Destinatarios Districorr ({{ selectedEmailsCount }}/{{ emailList.length }})
          </span>

          <button 
            type="button" 
            @click="toggleAllEmails" 
            class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {{ allSelected ? 'Deseleccionar todos' : 'Seleccionar todos' }}
          </button>
        </div>

        <!-- Compact Email List Grid (2-column layout or tight rows) -->
        <div class="grid grid-cols-1 gap-1.5">
          <div 
            v-for="item in emailList" 
            :key="item.email"
            :class="[
              'flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border transition-all',
              item.selected 
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60' 
                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
            ]"
          >
            <label class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="item.selected" 
                class="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer" 
              />
              <div class="min-w-0 flex-1 flex items-baseline justify-between gap-1">
                <span class="font-bold text-slate-900 dark:text-white truncate text-[11px]">{{ item.label }}</span>
                <span class="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ item.email }}</span>
              </div>
            </label>

            <button 
              type="button" 
              @click="copySingleEmail(item.email)" 
              class="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors flex items-center justify-center cursor-pointer min-w-[24px]"
              :title="`Copiar ${item.email}`"
            >
              <span v-if="copiedEmail === item.email" class="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">✓ Copiado</span>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            </button>
          </div>
        </div>

        <!-- Ultra-Compact Summary Line -->
        <div v-if="informe" class="px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl text-[10px] text-slate-600 dark:text-slate-300 flex items-center justify-between flex-wrap gap-1 border border-slate-200/60 dark:border-slate-700/60 font-medium">
          <span>👤 <strong>{{ informe.responsable_nombre }}</strong> ({{ informe.zona || 'Formosa' }})</span>
          <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
            📦 {{ stats.totalMovimientos }} movs | {{ stats.totalCajas }} cajas/equipos | {{ stats.totalBultos }} contenedores
          </span>
        </div>
      </div>

      <!-- Compact Footer Actions (Fijo al pie del modal) -->
      <div class="px-3.5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 space-y-3 shrink-0">
        
        <!-- PASO 1: COPIAR TABLA -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PASO 1: Copiá la tabla del informe
            </span>
            <span v-if="isTableCopied" class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              ✓ Tabla copiada
            </span>
          </div>

          <button 
            type="button" 
            @click="handleCopyTable" 
            class="w-full py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 min-h-[40px]"
          >
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>{{ isTableCopied ? '✓ Tabla Copiada (Volver a copiar)' : '📋 Copiar Tabla HTML' }}</span>
          </button>
        </div>

        <div class="border-t border-slate-200/60 dark:border-slate-800"></div>

        <!-- PASO 2: ABRIR CORREO -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PASO 2: Pegala en tu correo
            </span>
            <span v-if="!isTableCopied" class="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
              🔒 Primero copiá la tabla
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              @click="openEmailClient('outlook')" 
              :disabled="!isTableCopied || selectedEmailsCount === 0"
              :class="[
                'py-2.5 px-3 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 min-h-[40px]',
                isTableCopied && selectedEmailsCount > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
              ]"
            >
              <span>{{ isTableCopied ? '🚀 Abrir Outlook' : 'Outlook 🔒' }}</span>
            </button>

            <button 
              type="button" 
              @click="openEmailClient('gmail')" 
              :disabled="!isTableCopied || selectedEmailsCount === 0"
              :class="[
                'py-2.5 px-3 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 min-h-[40px]',
                isTableCopied && selectedEmailsCount > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
              ]"
            >
              <span>{{ isTableCopied ? '🚀 Abrir Gmail' : 'Gmail 🔒' }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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
const isTableCopied = ref(false);

// Resetear isTableCopied cuando cambie el informe o la cantidad de movimientos
watch(
  () => [props.movimientos, props.informe?.id],
  () => {
    isTableCopied.value = false;
  },
  { deep: true }
);

const emailList = ref([
  { label: 'Compras Implantes', email: 'comprasimplantes@districorr.com.ar', selected: true },
  { label: 'Depósito Central', email: 'deposito@districorr.com.ar', selected: true },
  { label: 'Logística Formosa', email: 'logistica@districorr.com.ar', selected: true },
  { label: 'Logística Corrientes', email: 'log.corrientes@districorr.com.ar', selected: true },
  { label: 'Control de Calidad', email: 'controldecalidad@districorr.com.ar', selected: true },
  { label: 'F. Simonetto', email: 'fsimonetto@districorr.com.ar', selected: true },
  { label: 'Contable', email: 'contable@districorr.com.ar', selected: true }
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
    }, 1800);
  } catch (err) {
    toast.error('No se pudo copiar: ' + err.message);
  }
};

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

const openEmailClient = async (provider = 'outlook') => {
  if (!props.informe || selectedEmails.value.length === 0 || !isTableCopied.value) return;

  try {
    const recipients = selectedEmails.value.join(',');
    const subjectStr = `Informe Diario de Logística - ${formatDate(props.informe.fecha)} - ${props.informe.responsable_nombre} (${props.informe.zona || 'Formosa'})`;
    
    // Cuerpo del correo 100% limpio sin texto molesto
    const bodyText = `Hola,\n\nAdjunto el Informe Diario de Logística correspondiente a la jornada.\n`;

    const bccEmail = 'sistemas@districorr.com.ar';

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
