<!-- src/components/AccessHistoryModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
    <div class="relative w-full max-w-lg overflow-hidden bg-white border shadow-2xl border-slate-200/90 dark:bg-slate-900 dark:border-slate-800 rounded-3xl">
      
      <!-- Header del Modal -->
      <div class="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-950 dark:text-white tracking-tight">Historial de Ingresos</h3>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Registro de accesos a tu portal personal</p>
          </div>
        </div>

        <button 
          @click="$emit('close')" 
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          title="Cerrar modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Cuerpo del Modal -->
      <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        
        <!-- Indicadores rápidos -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 border rounded-2xl bg-blue-50/50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40">
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total accesos</p>
            <p class="mt-1 text-2xl font-black text-slate-900 dark:text-white">{{ logs.length }}</p>
          </div>
          <div class="p-3.5 border rounded-2xl bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40">
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Estado de sesión</p>
            <p class="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">Activo / Verificado</p>
          </div>
        </div>

        <!-- Lista de ingresos -->
        <div v-if="isLoading" class="py-8 text-center text-xs font-semibold text-slate-400 flex flex-col items-center justify-center gap-2">
          <svg class="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>Cargando registro de accesos...</span>
        </div>

        <div v-else-if="logs.length > 0" class="space-y-2.5">
          <div 
            v-for="(log, idx) in logs" 
            :key="log.id || idx" 
            class="flex items-center justify-between p-3.5 border rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-850"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl" :class="idx === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p class="text-xs font-extrabold text-slate-900 dark:text-white">
                  {{ formatDateTime(log.accessed_at) }}
                </p>
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[260px]">
                  {{ parseUserAgent(log.user_agent) }}
                </p>
              </div>
            </div>

            <span v-if="idx === 0" class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Actual
            </span>
            <span v-else class="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              #{{ logs.length - idx }}
            </span>
          </div>
        </div>

        <div v-else class="py-8 text-center text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          No hay registros de ingreso anteriores.
        </div>
      </div>

      <!-- Footer del Modal -->
      <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-right">
        <button 
          @click="$emit('close')" 
          class="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          Cerrar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../services/supabase';

const props = defineProps({
  show: { type: Boolean, default: false },
  token: { type: String, required: true },
  dni: { type: String, required: true }
});

defineEmits(['close']);

const logs = ref([]);
const isLoading = ref(false);

const fetchLogs = async () => {
  if (!props.token || !props.dni) return;
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('ficha_access_logs')
      .select('*')
      .eq('dni', props.dni)
      .eq('token', props.token)
      .order('accessed_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      logs.value = data;
    }
  } catch (e) {
    console.warn("Error al cargar historial de ingresos:", e);
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchLogs();
  }
});

const formatDateTime = (isoString) => {
  if (!isoString) return 'Fecha no disponible';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Fecha no disponible';
  const fecha = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${fecha} a las ${hora} hs`;
};

const parseUserAgent = (ua) => {
  if (!ua) return 'Dispositivo no especificado';
  if (ua.includes('iPhone') || ua.includes('iPad')) return '📱 Apple iOS (Móvil)';
  if (ua.includes('Android')) return '📱 Dispositivo Android';
  if (ua.includes('Windows')) return '💻 Computadora Windows';
  if (ua.includes('Macintosh')) return '💻 Mac OS';
  if (ua.includes('Linux')) return '💻 Linux';
  return 'Navegador Web';
};
</script>
