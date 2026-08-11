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

      <router-link :to="{ name: 'LogisticaNuevoInforme', query: { mode: 'new' } }" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto">
        <span>+ Nuevo Informe</span>
      </router-link>
    </div>

    <!-- Barra de Filtros -->
    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
      <div :class="['grid gap-3 text-xs', isAdmin ? 'grid-cols-1 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3']">
        <div v-if="isAdmin">
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alcance de Informes</label>
          <select v-model="filterScope" @change="fetchHistorial" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-bold cursor-pointer">
            <option value="all">🌐 Todos los Operarios</option>
            <option value="mine">👤 Solo mis Informes</option>
          </select>
        </div>

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
          :to="inf.estado === 'borrador' ? { name: 'LogisticaNuevoInforme', query: { id: inf.id } } : { name: 'LogisticaDetalleInforme', params: { id: inf.id } }"
          class="p-4 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 block transition-colors space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📅</span>
              <span class="text-xs font-black text-slate-900 dark:text-white">
                Informe del {{ formatDate(inf.fecha) }}
              </span>
            </div>

            <span 
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shadow-2xs"
              :class="[
                inf.estado === 'borrador' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                inf.estado === 'enviado' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                'bg-blue-100 text-blue-800 border-blue-300'
              ]"
            >
              {{ inf.estado === 'borrador' ? '📝 Borrador en Edición' : inf.estado === 'enviado' ? '✓ Enviado Formalmente' : inf.estado }}
            </span>
          </div>

          <!-- Indicadores de Contenido -->
          <div class="flex items-center gap-2 text-[11px] font-mono font-bold flex-wrap">
            <span class="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60">
              📦 {{ inf.movimientos?.length || 0 }} {{ (inf.movimientos?.length || 0) === 1 ? 'movimiento' : 'movimientos' }}
            </span>
            <span class="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              🧰 {{ getCajasTotal(inf) }} cajas/equipos
            </span>
            <span class="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              💼 {{ getBultosTotal(inf) }} contenedores
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/50">
            <span>👤 Responsable: <strong>{{ inf.responsable_nombre }}</strong></span>
            <span>📍 Zona: <strong>{{ inf.zona || 'Formosa' }}</strong></span>
            <span v-if="inf.enviado_at">🕒 {{ formatDateTime(inf.enviado_at) }}</span>
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
const filterScope = ref('all'); // 'all' | 'mine'
const userRole = ref('logistica');

const isAdmin = computed(() => userRole.value === 'admin');

const fetchHistorial = async () => {
  try {
    loading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    userRole.value = session.user.app_metadata?.role || session.user.user_metadata?.role || 'logistica';

    let query = supabase
      .from('logistica_informes_diarios')
      .select('*, movimientos:logistica_informe_movimientos(id, cantidad_cajas, cantidad_bultos, tiene_pendiente)')
      .order('fecha', { ascending: false });

    // Si no es admin o si seleccionó "Solo mis informes", filtra por el usuario logueado
    if (!isAdmin.value || filterScope.value === 'mine') {
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

const getCajasTotal = (inf) => {
  if (!inf.movimientos || !Array.isArray(inf.movimientos)) return 0;
  return inf.movimientos.reduce((sum, m) => sum + (Number(m.cantidad_cajas) || 0), 0);
};

const getBultosTotal = (inf) => {
  if (!inf.movimientos || !Array.isArray(inf.movimientos)) return 0;
  return inf.movimientos.reduce((sum, m) => sum + (Number(m.cantidad_bultos) || 0), 0);
};

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
