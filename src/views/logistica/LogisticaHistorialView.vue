<!-- src/views/logistica/LogisticaHistorialView.vue -->
<template>
  <div class="max-w-6xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-16 px-3 sm:px-4">
    
    <!-- HEADER HERO CON ACCIONES PRINCIPALES -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-2xs group cursor-pointer">
            <AnimatedHistoryIcon customClass="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Historial de Informes Diarios</span>
              <AnimatedBadge variant="info" size="xs">
                Logística IQ
              </AnimatedBadge>
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Trazabilidad cronológica de movimientos, cajas entregadas, retiros e incidencias.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          @click="fetchHistorial"
          :disabled="loading"
          class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          title="Recargar datos"
        >
          <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin text-blue-600' : '']" />
        </button>

        <router-link :to="{ name: 'LogisticaNuevoInforme', query: { mode: 'new' } }">
          <ShimmerButton variant="primary" size="sm" class="shadow-sm">
            <Plus class="w-4 h-4 mr-1.5" />
            <span>Nuevo Informe</span>
          </ShimmerButton>
        </router-link>
      </div>
    </div>

    <!-- KPI SUMMARY CARDS CON ANIMATED.UI (SLIDING NUMBER + GLOW CARDS) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      <!-- Total Informes -->
      <GlowCard glowColor="blue" padding="sm" class="border border-slate-200/80 dark:border-slate-800 group">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Informes
          </span>
          <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <AnimatedFileTextIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <SlidingNumber :value="stats.total" customClass="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white" />
          <span class="text-xs text-slate-400 font-medium">registrados</span>
        </div>
      </GlowCard>

      <!-- Informes Enviados -->
      <GlowCard glowColor="emerald" padding="sm" class="border border-slate-200/80 dark:border-slate-800 group">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Enviados
          </span>
          <AnimatedBadge variant="success" size="xs" dot>
            Oficiales
          </AnimatedBadge>
        </div>
        <div class="flex items-baseline gap-2">
          <SlidingNumber :value="stats.enviados" customClass="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400" />
          <span class="text-xs text-slate-400 font-medium">cerrados</span>
        </div>
      </GlowCard>

      <!-- Borradores Activos -->
      <GlowCard glowColor="amber" padding="sm" class="border border-slate-200/80 dark:border-slate-800 group">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Borradores
          </span>
          <AnimatedBadge v-if="stats.borradores > 0" variant="warning" size="xs" ping>
            En edición
          </AnimatedBadge>
          <AnimatedBadge v-else variant="neutral" size="xs">
            Al día
          </AnimatedBadge>
        </div>
        <div class="flex items-baseline gap-2">
          <SlidingNumber :value="stats.borradores" customClass="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400" />
          <span class="text-xs text-slate-400 font-medium">pendientes</span>
        </div>
      </GlowCard>

      <!-- Cajas Movilizadas -->
      <GlowCard glowColor="purple" padding="sm" class="border border-slate-200/80 dark:border-slate-800 group">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Cajas / Equipos
          </span>
          <div class="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <AnimatedPackageIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <SlidingNumber :value="stats.cajas" customClass="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400" />
          <span class="text-xs text-slate-400 font-medium">cajas totales</span>
        </div>
      </GlowCard>

    </div>

    <!-- PANEL DE FILTROS INTELIGENTES CON MORPHING TABS Y BUSCADOR -->
    <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      
      <!-- Fila Superior: Morphing Tabs de Estados + Filtro de Alcance Admin -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div class="flex items-center gap-2">
          <MorphingTabs 
            v-model="filterEstadoTab" 
            :tabs="estadoTabs" 
            size="sm"
            @change="handleEstadoTabChange"
          />
        </div>

        <!-- Selector de Alcance para Administradores -->
        <div v-if="isAdmin" class="flex items-center gap-2 self-start lg:self-auto">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alcance:</span>
          <div class="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              @click="setScope('all')"
              :class="[
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1',
                filterScope === 'all' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              ]"
            >
              <span>🌐 Todos</span>
            </button>
            <button
              type="button"
              @click="setScope('mine')"
              :class="[
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1',
                filterScope === 'mine' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              ]"
            >
              <span>👤 Mis Informes</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Fila Inferior: Buscador de Texto + Rango de Fechas + Botón Limpiar -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        
        <!-- Buscador general -->
        <div class="sm:col-span-6 lg:col-span-5 relative">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por responsable, zona, observación..."
            class="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium text-xs transition-all"
          />
          <button 
            v-if="searchQuery" 
            type="button" 
            @click="searchQuery = ''" 
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Fecha Desde -->
        <div class="sm:col-span-3 lg:col-span-3">
          <div class="relative">
            <input 
              v-model="filterFechaDesde" 
              type="date" 
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white font-medium text-xs cursor-pointer"
            />
          </div>
        </div>

        <!-- Fecha Hasta -->
        <div class="sm:col-span-3 lg:col-span-3">
          <div class="relative">
            <input 
              v-model="filterFechaHasta" 
              type="date" 
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white font-medium text-xs cursor-pointer"
            />
          </div>
        </div>

        <!-- Botón Reset -->
        <div class="sm:col-span-12 lg:col-span-1 flex items-center justify-end">
          <button 
            v-if="hasActiveFilters" 
            type="button" 
            @click="clearAllFilters" 
            class="w-full py-2 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Limpiar todos los filtros"
          >
            <X class="w-3.5 h-3.5" />
            <span class="lg:hidden">Limpiar</span>
          </button>
        </div>

      </div>

      <!-- Filtros rápidos de fecha -->
      <div class="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 overflow-x-auto no-scrollbar">
        <span class="font-bold shrink-0">Accesos rápidos:</span>
        <button 
          type="button" 
          @click="setQuickDate('today')" 
          class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors cursor-pointer shrink-0"
        >
          Hoy
        </button>
        <button 
          type="button" 
          @click="setQuickDate('week')" 
          class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors cursor-pointer shrink-0"
        >
          Últimos 7 días
        </button>
        <button 
          type="button" 
          @click="setQuickDate('month')" 
          class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors cursor-pointer shrink-0"
        >
          Este mes
        </button>
      </div>

    </div>

    <!-- LISTA DE INFORMES INTERACTIVA -->
    <div class="space-y-3">
      
      <!-- SKELETON LOADING -->
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse space-y-3">
          <div class="flex items-center justify-between">
            <div class="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div class="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
          <div class="flex gap-2">
            <div class="h-6 w-28 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
            <div class="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>
      </div>

      <!-- ESTADO VACÍO -->
      <div v-else-if="filteredInformes.length === 0" class="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-xs">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl">
          📦
        </div>
        <div class="max-w-md mx-auto space-y-1">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            No se encontraron informes
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            No hay registros que coincidan con los filtros de búsqueda o fechas aplicadas.
          </p>
        </div>
        <div class="pt-2 flex items-center justify-center gap-3">
          <button 
            v-if="hasActiveFilters" 
            type="button" 
            @click="clearAllFilters" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
          <router-link :to="{ name: 'LogisticaNuevoInforme', query: { mode: 'new' } }">
            <ShimmerButton variant="primary" size="sm">
              <Plus class="w-4 h-4 mr-1" />
              <span>Crear Informe</span>
            </ShimmerButton>
          </router-link>
        </div>
      </div>

      <!-- LISTA DE CARDS INTERACTIVAS -->
      <div v-else class="space-y-3">
        <div 
          v-for="inf in filteredInformes" 
          :key="inf.id"
          class="group transition-all duration-200"
        >
          <GlowCard 
            :glowColor="inf.estado === 'enviado' ? 'emerald' : inf.estado === 'borrador' ? 'amber' : 'blue'"
            padding="md"
            class="border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-3.5"
          >
            <!-- Cabecera de la Card: Fecha + Estado Badge -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div class="flex items-center gap-2.5">
                <div 
                  class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform"
                  :class="[
                    inf.estado === 'enviado' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' :
                    inf.estado === 'borrador' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' :
                    'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                  ]"
                >
                  <AnimatedCalendarIcon customClass="w-4 h-4" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                      Informe del {{ formatDateFull(inf.fecha) }}
                    </span>
                    <span v-if="isToday(inf.fecha)" class="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Hoy
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-400 font-medium block">
                    {{ formatRelativeTime(inf.updated_at || inf.created_at) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 self-start sm:self-auto">
                <AnimatedBadge 
                  v-if="inf.estado === 'enviado'" 
                  variant="success" 
                  size="sm" 
                  dot
                >
                  ✓ Enviado Formalmente
                </AnimatedBadge>
                
                <AnimatedBadge 
                  v-else-if="inf.estado === 'borrador'" 
                  variant="warning" 
                  size="sm" 
                  ping
                >
                  📝 Borrador en Edición
                </AnimatedBadge>

                <AnimatedBadge 
                  v-else 
                  variant="info" 
                  size="sm"
                >
                  {{ inf.estado }}
                </AnimatedBadge>
              </div>
            </div>

            <!-- Chips de Métricas Operativas del Informe -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60">
                <Layers class="w-3.5 h-3.5 text-blue-600" />
                <span>{{ inf.movimientos?.length || 0 }} {{ (inf.movimientos?.length || 0) === 1 ? 'movimiento' : 'movimientos' }}</span>
              </span>

              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                <AnimatedPackageIcon customClass="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>{{ getCajasTotal(inf) }} cajas/equipos</span>
              </span>

              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                <AnimatedBoxIcon customClass="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>{{ getBultosTotal(inf) }} contenedores</span>
              </span>

              <span 
                v-if="getPendientesTotal(inf) > 0" 
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60"
              >
                <AlertTriangle class="w-3.5 h-3.5 text-amber-600" />
                <span>{{ getPendientesTotal(inf) }} pendiente(s)</span>
              </span>
            </div>

            <!-- Observación General si existe -->
            <div v-if="inf.observacion_general" class="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic flex items-start gap-2">
              <span class="text-slate-400 select-none">💬</span>
              <span class="line-clamp-2">"{{ inf.observacion_general }}"</span>
            </div>

            <!-- Footer de la Card: Metadatos + Botón de Acción -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
              
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                <span class="flex items-center gap-1.5 font-medium">
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  <strong>{{ inf.responsable_nombre || 'Operador Logística' }}</strong>
                </span>

                <span class="flex items-center gap-1.5 font-medium">
                  <MapPin class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ inf.zona || 'Formosa' }}</span>
                </span>

                <span v-if="inf.enviado_at" class="flex items-center gap-1.5 text-slate-400">
                  <Clock class="w-3.5 h-3.5" />
                  <span>Enviado: {{ formatDateTime(inf.enviado_at) }}</span>
                </span>
              </div>

              <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <template v-if="inf.estado === 'borrador'">
                  <router-link 
                    :to="{ name: 'LogisticaNuevoInforme', query: { id: inf.id } }"
                    class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-2xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Continuar Edición</span>
                    <AnimatedArrowRightIcon customClass="w-3.5 h-3.5" />
                  </router-link>
                </template>

                <template v-else>
                  <router-link 
                    :to="{ name: 'LogisticaDetalleInforme', params: { id: inf.id } }"
                    class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                  >
                    <AnimatedEyeIcon customClass="w-3.5 h-3.5" />
                    <span>Ver Detalle</span>
                    <AnimatedArrowRightIcon customClass="w-3.5 h-3.5" />
                  </router-link>
                </template>
              </div>

            </div>

          </GlowCard>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import { 
  Search, 
  Plus, 
  Clock, 
  User, 
  MapPin, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  X 
} from 'lucide-vue-next';
import { 
  GlowCard, 
  AnimatedBadge, 
  SlidingNumber, 
  ShimmerButton, 
  MorphingTabs,
  AnimatedHistoryIcon,
  AnimatedPackageIcon,
  AnimatedCalendarIcon,
  AnimatedFileTextIcon,
  AnimatedEyeIcon,
  AnimatedBoxIcon,
  AnimatedArrowRightIcon
} from '../../components/ui';

const toast = useToast();
const loading = ref(true);

const informes = ref([]);
const filterEstado = ref('');
const filterEstadoTab = ref('all');
const searchQuery = ref('');
const filterFechaDesde = ref('');
const filterFechaHasta = ref('');
const filterScope = ref('all'); // 'all' | 'mine'
const userRole = ref('logistica');

const isAdmin = computed(() => userRole.value === 'admin');

const estadoTabs = computed(() => {
  const allCount = informes.value.length;
  const envCount = informes.value.filter(i => i.estado === 'enviado').length;
  const borCount = informes.value.filter(i => i.estado === 'borrador').length;

  return [
    { id: 'all', label: 'Todos', badge: allCount },
    { id: 'enviado', label: 'Enviados', badge: envCount },
    { id: 'borrador', label: 'Borradores', badge: borCount }
  ];
});

const handleEstadoTabChange = (tabId) => {
  filterEstado.value = tabId === 'all' ? '' : tabId;
};

const stats = computed(() => {
  const total = informes.value.length;
  const enviados = informes.value.filter(i => i.estado === 'enviado').length;
  const borradores = informes.value.filter(i => i.estado === 'borrador').length;
  const cajas = informes.value.reduce((sum, inf) => sum + getCajasTotal(inf), 0);

  return { total, enviados, borradores, cajas };
});

const setScope = (scope) => {
  filterScope.value = scope;
  fetchHistorial();
};

const setQuickDate = (type) => {
  const today = new Date();
  const formatISO = (d) => d.toISOString().split('T')[0];

  if (type === 'today') {
    filterFechaDesde.value = formatISO(today);
    filterFechaHasta.value = formatISO(today);
  } else if (type === 'week') {
    const pastWeek = new Date();
    pastWeek.setDate(pastWeek.getDate() - 7);
    filterFechaDesde.value = formatISO(pastWeek);
    filterFechaHasta.value = formatISO(today);
  } else if (type === 'month') {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    filterFechaDesde.value = formatISO(firstDay);
    filterFechaHasta.value = formatISO(today);
  }
};

const hasActiveFilters = computed(() => {
  return Boolean(
    filterEstado.value || 
    searchQuery.value || 
    filterFechaDesde.value || 
    filterFechaHasta.value || 
    filterEstadoTab.value !== 'all'
  );
});

const clearAllFilters = () => {
  filterEstado.value = '';
  filterEstadoTab.value = 'all';
  searchQuery.value = '';
  filterFechaDesde.value = '';
  filterFechaHasta.value = '';
};

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

const getPendientesTotal = (inf) => {
  if (!inf.movimientos || !Array.isArray(inf.movimientos)) return 0;
  return inf.movimientos.filter(m => m.tiene_pendiente).length;
};

const filteredInformes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  return informes.value.filter(inf => {
    // Filtro de Estado
    if (filterEstado.value && inf.estado !== filterEstado.value) return false;
    
    // Filtro de Fechas
    if (filterFechaDesde.value && inf.fecha < filterFechaDesde.value) return false;
    if (filterFechaHasta.value && inf.fecha > filterFechaHasta.value) return false;

    // Filtro de Búsqueda de Texto
    if (q) {
      const matchResp = (inf.responsable_nombre || '').toLowerCase().includes(q);
      const matchZona = (inf.zona || '').toLowerCase().includes(q);
      const matchObs = (inf.observacion_general || '').toLowerCase().includes(q);
      const matchFecha = (inf.fecha || '').toLowerCase().includes(q);
      if (!matchResp && !matchZona && !matchObs && !matchFecha) return false;
    }

    return true;
  });
});

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

const formatDateFull = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  return dateObj.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Modificado recién';
  if (diffMinutes < 60) return `Modificado hace ${diffMinutes} min`;
  if (diffHours < 24) return `Modificado hace ${diffHours} h`;
  if (diffDays === 1) return 'Modificado ayer';
  return `Modificado el ${date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`;
};
</script>
