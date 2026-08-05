<!-- src/views/logistica/LogisticaHistorialView.vue -->
<template>
  <div class="space-y-5 text-slate-800 dark:text-slate-100">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">
          Historial de Informes Diarios
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Consulta los informes anteriores y realiza búsquedas por fecha o estado.
        </p>
      </div>

      <router-link :to="{ name: 'LogisticaNuevoInforme' }" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto">
        <span>+ Nuevo Informe</span>
      </router-link>
    </div>

    <!-- Barra de Filtros -->
    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filtrar por Estado</label>
          <select v-model="filterEstado" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white">
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="corregido">Corregido</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha Desde</label>
          <input v-model="filterFechaDesde" type="date" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha Hasta</label>
          <input v-model="filterFechaHasta" type="date" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white" />
        </div>
      </div>
    </div>

    <!-- Lista de Informes -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-3">
      <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
        Cargando historial de informes...
      </div>

      <div v-else-if="filteredInformes.length === 0" class="py-12 text-center text-xs text-slate-400">
        No se encontraron informes con los filtros seleccionados.
      </div>

      <div v-else class="space-y-3">
        <router-link 
          v-for="inf in filteredInformes" 
          :key="inf.id"
          :to="inf.estado === 'borrador' ? { name: 'LogisticaNuevoInforme' } : { name: 'LogisticaDetalleInforme', params: { id: inf.id } }"
          class="p-4 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 block transition-colors space-y-2"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📅</span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                Informe del {{ formatDate(inf.fecha) }}
              </span>
            </div>

            <span 
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
              :class="[
                inf.estado === 'borrador' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                inf.estado === 'enviado' ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300' :
                'bg-blue-100 text-blue-800'
              ]"
            >
              {{ inf.estado }}
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
            <span>👤 Responsable: {{ inf.responsable_nombre }}</span>
            <span>📍 Zona: {{ inf.zona || 'Formosa' }}</span>
            <span v-if="inf.enviado_at">🕒 Enviado: {{ formatDateTime(inf.enviado_at) }}</span>
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
const loading = ref(true);

const informes = ref([]);
const filterEstado = ref('');
const filterFechaDesde = ref('');
const filterFechaHasta = ref('');

const fetchHistorial = async () => {
  try {
    loading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    let query = supabase
      .from('logistica_informes_diarios')
      .select('*')
      .order('fecha', { ascending: false });

    // Si el usuario no es admin, filtra por sus propios informes
    if (session.user.app_metadata?.role !== 'admin') {
      query = query.eq('responsable_user_id', session.user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    informes.value = data || [];
  } catch (err) {
    toast.error('Error al cargar historial: ' + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchHistorial);

const filteredInformes = computed(() => {
  return informes.value.filter(inf => {
    if (filterEstado.value && inf.estado !== filterEstado.value) return false;
    if (filterFechaDesde.value && inf.fecha < filterFechaDesde.value) return false;
    if (filterFechaHasta.value && inf.fecha > filterFechaHasta.value) return false;
    return true;
  });
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};
</script>
