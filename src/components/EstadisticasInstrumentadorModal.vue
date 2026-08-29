<!-- src/components/EstadisticasInstrumentadorModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-hidden" @click.self="close">
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all border border-slate-100 dark:border-slate-700">
      
      <!-- Header del Modal (Fixed) -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
        <div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 mb-1">
            <ChartBarIcon class="w-3.5 h-3.5" />
            Rendimiento Operativo
          </span>
          <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">{{ capitalizeName(instrumentador?.nombre_completo) }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">DNI: {{ instrumentador?.dni || 'N/A' }} | Teléfono: {{ instrumentador?.telefono || 'No especificado' }}</p>
        </div>
        <button @click="close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Body Scrollable -->
      <div class="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
        <div v-if="loading" class="text-center py-12 space-y-3">
          <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Cargando análisis de rendimiento...</p>
        </div>
        <div v-else-if="error" class="text-center py-12 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p class="font-semibold">Error al cargar estadísticas</p>
          <p class="text-xs mt-1">{{ error }}</p>
        </div>
        <div v-else-if="stats" class="space-y-5">
          
          <!-- Enlace Permanente al Portal de Actividad -->
          <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-700/60 dark:to-slate-700/30 p-4 rounded-xl border border-indigo-100 dark:border-slate-600">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <LinkIcon class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Acceso Permanente al Portal
              </span>
              <span v-if="currentToken" class="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
                Activo
              </span>
            </div>
            
            <p class="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Permite al instrumentador consultar sus cirugías, liquidaciones y comprobantes personales sin usuario ni contraseña.
            </p>

            <div class="flex flex-wrap items-center gap-2">
              <button 
                @click="copyPortalLink"
                class="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <ClipboardDocumentIcon class="w-4 h-4" />
                <span>{{ copied ? '¡Enlace Copiado!' : 'Copiar Enlace' }}</span>
              </button>
              
              <button 
                @click="shareWhatsApp"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <ChatBubbleLeftEllipsisIcon class="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>

              <button 
                v-if="currentToken"
                @click="openPortal"
                class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ml-auto"
              >
                <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                <span>Abrir Portal</span>
              </button>
            </div>
          </div>

          <!-- Sección Principal: IVO y Categoría -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div class="text-center p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
              <p class="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Puntaje IVO (90 días)</p>
              <p class="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight my-1">{{ stats.ivo_total_90d.toFixed(2) }}</p>
              <p class="text-[11px] text-slate-400">Escala de 0.00 a 10.00</p>
            </div>
            <div v-if="instrumentadorCategoria" :class="instrumentadorCategoria.colorClasses" class="p-3.5 rounded-xl text-center h-full flex flex-col justify-center border">
              <strong class="block text-sm sm:text-base font-bold">{{ instrumentadorCategoria.nombre }}</strong>
              <p class="text-xs mt-1 leading-snug">{{ instrumentadorCategoria.descripcion }}</p>
            </div>
          </div>

          <!-- Sección de Intervenciones Clave -->
          <div v-if="stats.intervenciones_clave_count > 0" class="bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700/60 p-3.5 rounded-xl text-center">
            <p class="font-bold text-xs sm:text-sm">🟣 {{ stats.intervenciones_clave_count }} Intervención{{ stats.intervenciones_clave_count > 1 ? 'es' : '' }} Clave</p>
            <p class="text-xs mt-0.5">Este perfil resuelve problemas operativos complejos.</p>
            <p v-if="stats.ultima_intervencion_fecha" class="text-[11px] opacity-75 mt-1">Última: {{ new Date(stats.ultima_intervencion_fecha).toLocaleDateString('es-AR') }}</p>
          </div>

          <!-- Sección del Gráfico -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Composición del IVO Promedio / Cirugía</h4>
            <div class="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <Bar v-if="chartData" :data="chartData" :options="chartOptions" class="max-h-40 sm:max-h-48" />
            </div>
            <p class="text-[11px] text-center mt-1.5 text-slate-500 dark:text-slate-400">Promedio general de {{ stats.promedio_ivo_cirugia.toFixed(2) }} pts por cirugía.</p>
          </div>

          <!-- Sección de Estadísticas Detalladas -->
          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div class="stat-item">
              <p class="stat-value">{{ stats.cirugias_90d }}</p>
              <p class="stat-label">Cirugías (90d)</p>
            </div>
            <div class="stat-item">
              <p class="stat-value">{{ stats.incidencias_totales }}</p>
              <p class="stat-label">Incidencias (Histórico)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del Modal (Fixed) -->
      <div class="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700 text-right shrink-0">
        <button @click="close" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToasts } from '../composables/useToasts.js';
import { 
  ChartBarIcon, 
  XMarkIcon, 
  LinkIcon, 
  ClipboardDocumentIcon, 
  ChatBubbleLeftEllipsisIcon, 
  ArrowTopRightOnSquareIcon 
} from '@heroicons/vue/24/outline';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  show: Boolean,
  instrumentador: Object,
});
const emit = defineEmits(['close']);

const { showSuccessToast, showErrorToast } = useToasts();

const stats = ref(null);
const loading = ref(false);
const error = ref(null);
const copied = ref(false);
const activeToken = ref(null);

const currentToken = computed(() => activeToken.value || props.instrumentador?.activity_token || null);

watch(() => props.instrumentador, (newInst) => {
  if (newInst) {
    activeToken.value = newInst.activity_token || null;
  }
}, { immediate: true });

const capitalizeName = (name) => {
  if (!name) return '';
  return name.replace(/\b\w/g, char => char.toUpperCase());
};

const getOrCreateToken = async () => {
  if (currentToken.value) return currentToken.value;
  try {
    const { data: newToken, error: rpcError } = await supabase.rpc('generar_activity_token', { 
      p_instrumentador_dni: props.instrumentador.dni 
    });
    if (rpcError) throw rpcError;
    if (!newToken) throw new Error('No se pudo generar el token.');
    activeToken.value = newToken;
    return newToken;
  } catch (err) {
    showErrorToast(err, 'Error al generar el token permanente.');
    return null;
  }
};

const copyPortalLink = async () => {
  const token = await getOrCreateToken();
  if (!token) return;
  const url = `${window.location.origin}/resumen/${token}`;
  try {
    await navigator.clipboard.writeText(url);
    copied.value = true;
    showSuccessToast('¡Enlace del portal copiado al portapapeles!');
    setTimeout(() => { copied.value = false; }, 2500);
  } catch (err) {
    showErrorToast(err, 'No se pudo copiar el enlace.');
  }
};

const shareWhatsApp = async () => {
  const token = await getOrCreateToken();
  if (!token) return;
  const url = `${window.location.origin}/resumen/${token}`;
  const firstName = props.instrumentador?.nombre_completo ? props.instrumentador.nombre_completo.split(' ')[0] : '';
  const message = `Hola ${capitalizeName(firstName)}, te comparto tu enlace de acceso permanente al portal de Gestión IQ para consultar tus actividades, cirugías y liquidaciones:\n\n${url}`;
  
  let cleanPhone = (props.instrumentador?.telefono || '').replace(/\D/g, '');
  if (cleanPhone.length > 0 && !cleanPhone.startsWith('54')) {
    cleanPhone = '54' + cleanPhone;
  }
  
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
  window.open(waUrl, '_blank');
};

const openPortal = () => {
  if (!currentToken.value) return;
  const url = `${window.location.origin}/resumen/${currentToken.value}`;
  window.open(url, '_blank');
};

// Lógica de Categorización
const instrumentadorCategoria = computed(() => {
  if (!stats.value) return null;
  const score = stats.value.ivo_total_90d;
  if (score >= 8.0) return { nombre: '🟢 Destacado', descripcion: 'Este es el comportamiento que queremos replicar.', colorClasses: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' };
  if (score >= 5.0) return { nombre: '🔵 Correcto', descripcion: 'Funciona bien dentro del sistema.', colorClasses: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700' };
  if (score >= 3.0) return { nombre: '🟡 Inestable', descripcion: 'Hay que mirar qué pasa acá.', colorClasses: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700' };
  return { nombre: '🔴 Crítico', descripcion: 'No es un perfil para escalar.', colorClasses: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700' };
});

// Propiedad computada para los datos del gráfico
const chartData = computed(() => {
  if (!stats.value) return null;
  return {
    labels: ['Tiempo', 'Información', 'Evidencia'],
    datasets: [
      {
        label: 'Aporte Promedio al IVO',
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        data: [
          stats.value.promedio_tiempo,
          stats.value.promedio_informacion,
          stats.value.promedio_evidencia
        ],
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };
});

// Opciones de configuración para el gráfico
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `Aporte: ${context.raw.toFixed(2)} pts`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 0.5,
      ticks: {
        stepSize: 0.1
      }
    }
  }
});

async function fetchStats() {
  if (!props.instrumentador?.dni) return;
  loading.value = true;
  error.value = null;
  stats.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_estadisticas_instrumentador', {
      p_dni: props.instrumentador.dni
    });
    if (rpcError) throw rpcError;
    stats.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    fetchStats();
  }
});

const close = () => emit('close');
</script>

<style scoped>
.stat-item { @apply text-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60; }
.stat-value { @apply text-2xl font-bold text-slate-800 dark:text-slate-100; }
.stat-label { @apply text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium; }
</style>