<!-- src/views/logistica/LogisticaInformesView.vue -->
<template>
  <div class="max-w-4xl mx-auto space-y-5 text-slate-800 dark:text-slate-100 font-sans pb-10">
    
    <!-- Top Welcome Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="space-y-0.5">
        <h2 class="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>👋 Hola, {{ userName }}</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 capitalize">
          {{ formattedToday }}
        </p>
      </div>

      <div class="self-start sm:self-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs">
          <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Zona Formosa
        </span>
      </div>
    </div>

    <!-- Main Today's Control Card -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-5">
      
      <!-- Card Header -->
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
            📋
          </div>
          <div>
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Estado de la Jornada de Hoy
            </h3>
            <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {{ todayISO }}
            </span>
          </div>
        </div>

        <span 
          v-if="todayInforme"
          :class="[
            'px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-2xs',
            todayInforme.estado === 'borrador' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900' :
            todayInforme.estado === 'enviado' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' :
            'bg-slate-100 text-slate-700 border-slate-200'
          ]"
        >
          {{ todayInforme.estado }}
        </span>
        <span v-else class="px-3 py-1 rounded-full text-xs font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          Pendiente de Inicio
        </span>
      </div>

      <!-- KPI Summary Grid -->
      <div v-if="todayInforme" class="grid grid-cols-3 gap-3 text-center">
        <div class="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Movimientos</span>
          <span class="text-base font-extrabold font-mono text-slate-900 dark:text-white">{{ todayMovimientosCount }}</span>
        </div>

        <div class="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cajas</span>
          <span class="text-base font-extrabold font-mono text-slate-900 dark:text-white">{{ todayCajasCount }}</span>
        </div>

        <div class="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
          <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider block">Pendientes</span>
          <span class="text-base font-extrabold font-mono text-amber-900 dark:text-amber-300">{{ todayPendientesCount }}</span>
        </div>
      </div>

      <!-- Descriptive Status Banner -->
      <div v-if="!todayInforme" class="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
        <span class="text-base">🚀</span>
        <div>
          <strong class="font-bold">Comienza tu registro diario</strong>
          <p class="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
            Crea tu informe del día en 1 clic para ir agregando entregas, retiros e incidencias a medida que avanza tu jornada.
          </p>
        </div>
      </div>

      <div v-else-if="todayInforme.estado === 'borrador'" class="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
        <span class="font-medium">⚠️ Tienes un borrador en curso del día con {{ todayMovimientosCount }} movimientos.</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300">
          📝 Borrador
        </span>
      </div>

      <div v-else-if="todayInforme.estado === 'enviado'" class="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
        <span>✓</span>
        <span class="font-bold">El informe previo de hoy fue enviado a las {{ formatTime(todayInforme.enviado_at) }}. Puedes crear otro si lo necesitas.</span>
      </div>

      <!-- Main Action Callout -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <router-link 
          v-if="todayInforme && todayInforme.estado === 'borrador'"
          :to="{ name: 'LogisticaNuevoInforme', query: { id: todayInforme.id } }"
          class="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span>✏️</span>
          <span>Continuar Editando Borrador</span>
        </router-link>

        <router-link 
          v-else-if="todayInforme && todayInforme.estado === 'enviado'"
          :to="{ name: 'LogisticaDetalleInforme', params: { id: todayInforme.id } }"
          class="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <span>👁️</span>
          <span>Ver Informe Enviado de Hoy</span>
        </router-link>

        <router-link 
          :to="{ name: 'LogisticaNuevoInforme', query: { mode: 'new' } }"
          :class="[
            'py-3 px-4 font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98',
            (!todayInforme || todayInforme.estado === 'enviado') ? 'bg-blue-600 hover:bg-blue-700 text-white sm:col-span-2' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          <span>Crear Informe Diario Nuevo</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Reports Section -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Últimos Informes Enviados
        </h3>
        <router-link :to="{ name: 'LogisticaHistorial' }" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <span>Ver Historial</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </router-link>
      </div>

      <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
        Cargando historial reciente...
      </div>

      <div v-else-if="recentInformes.length === 0" class="py-8 text-center text-xs text-slate-400">
        No registras informes enviados previamente.
      </div>

      <div v-else class="space-y-2">
        <router-link 
          v-for="inf in recentInformes" 
          :key="inf.id"
          :to="{ name: 'LogisticaDetalleInforme', params: { id: inf.id } }"
          class="p-3.5 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between transition-all group"
        >
          <div class="space-y-0.5">
            <span class="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              📅 Informe del {{ formatDate(inf.fecha) }}
            </span>
            <span class="text-[11px] text-slate-400">
              Enviado el {{ formatDateTime(inf.enviado_at) }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              Enviado
            </span>
            <svg class="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';

const toast = useToast();
const userName = ref('Usuario Logística');
const loading = ref(true);

const todayISO = new Date().toISOString().split('T')[0];

const formattedToday = computed(() => {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const todayInforme = ref(null);
const todayMovimientos = ref([]);
const recentInformes = ref([]);

const todayMovimientosCount = computed(() => todayMovimientos.value.length);
const todayCajasCount = computed(() => todayMovimientos.value.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0));
const todayPendientesCount = computed(() => todayMovimientos.value.filter(m => m.tiene_pendiente).length);

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    userName.value = session.user.user_metadata?.nombre_completo 
      || session.user.user_metadata?.nombre 
      || session.user.email?.split('@')[0] 
      || 'Usuario Logística';

    const { data: infToday } = await supabase
      .from('logistica_informes_diarios')
      .select('*')
      .eq('responsable_user_id', session.user.id)
      .eq('fecha', todayISO)
      .maybeSingle();

    todayInforme.value = infToday;

    if (infToday) {
      const { data: movs } = await supabase
        .from('logistica_informe_movimientos')
        .select('*')
        .eq('informe_id', infToday.id);

      todayMovimientos.value = movs || [];
    }

    const { data: recents } = await supabase
      .from('logistica_informes_diarios')
      .select('*')
      .eq('responsable_user_id', session.user.id)
      .eq('estado', 'enviado')
      .order('fecha', { ascending: false })
      .limit(5);

    recentInformes.value = recents || [];
  } catch (err) {
    toast.error('Error al cargar dashboard: ' + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDashboardData);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};
</script>
