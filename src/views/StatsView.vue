<!-- src/views/StatsView.vue -->
<template>
  <div class="p-4 sm:p-5 lg:p-6 2xl:p-8 bg-slate-50/30 dark:bg-slate-950/10 min-h-screen text-slate-900 dark:text-slate-100">
    
    <!-- Encabezado de la página -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center space-x-3">
        <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Estadísticas de Calidad</h1>
      </div>
      <router-link 
        to="/admin" 
        class="bg-white border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl shadow-sm hover:bg-slate-50 flex items-center space-x-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="text-xs">Volver al Panel</span>
      </router-link>
    </div>

    <!-- Panel de Filtros -->
    <section class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm space-y-4">
      
      <!-- Fila 1: Filtros de Fecha -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-[180px_180px_auto]">
          <label class="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-350">
            <span>Fecha Desde</span>
            <input v-model="filters.from" type="date" class="form-input" @change="fetchStats" />
          </label>
          <label class="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-355">
            <span>Fecha Hasta</span>
            <input v-model="filters.to" type="date" class="form-input" @change="fetchStats" />
          </label>
        </div>
        
        <!-- Botones rápidos de rango temporal -->
        <div class="flex flex-wrap gap-2">
          <button @click="setPeriod('this-month')" :class="['btn-period', activePeriod === 'this-month' ? 'active' : '']">
            Este Mes
          </button>
          <button @click="setPeriod('last-month')" :class="['btn-period', activePeriod === 'last-month' ? 'active' : '']">
            Mes Anterior
          </button>
          <button @click="setPeriod('last-90-days')" :class="['btn-period', activePeriod === 'last-90-days' ? 'active' : '']">
            Últimos 90 días
          </button>
          <button @click="setPeriod('all-time')" :class="['btn-period', activePeriod === 'all-time' ? 'active' : '']">
            Todo el Histórico
          </button>
        </div>
      </div>

      <!-- Fila 2: Filtros Avanzados -->
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <label class="flex flex-col gap-1 text-sm font-semibold text-slate-705 dark:text-slate-300">
          <span>Filtrar por Médico</span>
          <select v-model="filters.medico" class="form-select">
            <option value="">Todos los médicos</option>
            <option v-for="med in uniqueMedicos" :key="med" :value="med">{{ med }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1 text-sm font-semibold text-slate-705 dark:text-slate-300">
          <span>Filtrar por Técnico</span>
          <select v-model="filters.instrumentador" class="form-select">
            <option value="">Todos los técnicos</option>
            <option v-for="inst in uniqueInstrumentadores" :key="inst" :value="inst">{{ inst }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1 text-sm font-semibold text-slate-705 dark:text-slate-300">
          <span>Filtrar por Clínica / Institución</span>
          <input 
            v-model="filters.lugar_cirugia" 
            type="text" 
            placeholder="Buscar por institución..." 
            class="form-input"
          />
        </label>
      </div>
    </section>

    <!-- Cargando / Error -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">Procesando métricas estadísticas...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 dark:bg-red-950/20 dark:border-red-900/60 dark:text-red-300" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <div v-else class="space-y-6">
      
      <!-- Grid de KPIs (Bento-grid) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Fichas" :value="totalFichas" :icon="DocumentChartBarIcon" icon-bg-color="bg-blue-500" />
        <StatCard title="Prom. Puntualidad" :value="avgPuntualidad" :icon="ClockIcon" icon-bg-color="bg-yellow-500" />
        <StatCard title="Prom. Condiciones" :value="avgCondiciones" :icon="SparklesIcon" icon-bg-color="bg-lime-500" />
        <StatCard title="Prom. Asesoramiento" :value="avgAsesoramiento" :icon="UserGroupIcon" icon-bg-color="bg-purple-500" />
        <StatCard title="Prom. General" :value="avgGeneral" :icon="StarIcon" icon-bg-color="bg-emerald-500" />
      </div>

      <!-- Fila de Productividad y Tendencia de Calidad -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Tarjeta de Productividad (Fichas por día/semana) -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div class="flex items-center space-x-2">
            <span class="text-blue-500 font-bold text-lg">📈</span>
            <h3 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Rendimiento y Productividad</h3>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Promedio Diario -->
            <div class="relative overflow-hidden p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-955/20">
              <span class="text-xxs font-bold text-slate-400 uppercase tracking-wider">Promedio Diario</span>
              <p class="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">{{ avgCompletadasPorDia }}</p>
              <span class="text-[10px] text-slate-400 block mt-1">fichas completadas / día</span>
              <div class="absolute bottom-0 inset-x-0 h-1 bg-blue-500/10 dark:bg-blue-500/5"></div>
            </div>
            
            <!-- Promedio Semanal -->
            <div class="relative overflow-hidden p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-955/20">
              <span class="text-xxs font-bold text-slate-400 uppercase tracking-wider">Promedio Semanal</span>
              <p class="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">{{ avgCompletadasPorSemana }}</p>
              <span class="text-[10px] text-slate-400 block mt-1">fichas completadas / sem</span>
              <div class="absolute bottom-0 inset-x-0 h-1 bg-emerald-500/10 dark:bg-emerald-500/5"></div>
            </div>
          </div>
          
          <p class="text-xxs text-slate-400 italic">Calculado en base a los {{ daysInRange }} días del período activo.</p>
        </div>

        <!-- Tarjeta de Tendencia de Calidad (Semana vs Mes vs Mes Anterior) -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-amber-500 font-bold text-lg">⭐️</span>
              <h3 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tendencia de Calidad</h3>
            </div>
            <!-- Spinner para carga de tendencias -->
            <svg v-if="trendLoading" class="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-if="!trendLoading" class="flex items-center justify-between gap-4 py-1 text-center">
            
            <!-- Columna 1: Esta Semana -->
            <div class="flex-1">
              <span class="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Esta Semana</span>
              <div class="inline-flex items-baseline space-x-0.5">
                <span class="text-2xl font-black text-slate-800 dark:text-slate-100">{{ weeklyAvgRating.toFixed(2) }}</span>
                <span class="text-[10px] text-amber-500 font-bold">★</span>
              </div>
            </div>

            <!-- Desviación: Semana vs Mes -->
            <div class="flex flex-col items-center justify-center">
              <div v-if="trendVsMonth" :class="[
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-0.5 border shadow-sm whitespace-nowrap',
                trendVsMonth.positive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/60' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/60'
              ]" :title="`Esta semana vs Este mes: ${trendVsMonth.positive ? '+' : ''}${trendVsMonth.diff}`">
                <span>{{ trendVsMonth.positive ? '▲' : '▼' }}</span>
                <span>{{ trendVsMonth.percent }}%</span>
              </div>
            </div>

            <!-- Columna 2: Este Mes -->
            <div class="flex-1">
              <span class="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Este Mes</span>
              <div class="inline-flex items-baseline space-x-0.5">
                <span class="text-2xl font-black text-slate-800 dark:text-slate-100">{{ monthlyAvgRating.toFixed(2) }}</span>
                <span class="text-[10px] text-amber-500 font-bold">★</span>
              </div>
            </div>

            <!-- Desviación: Mes vs Mes Anterior -->
            <div class="flex flex-col items-center justify-center">
              <div v-if="trendVsLastMonth" :class="[
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-0.5 border shadow-sm whitespace-nowrap',
                trendVsLastMonth.positive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/60' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/60'
              ]" :title="`Este mes vs Mes anterior: ${trendVsLastMonth.positive ? '+' : ''}${trendVsLastMonth.diff}`">
                <span>{{ trendVsLastMonth.positive ? '▲' : '▼' }}</span>
                <span>{{ trendVsLastMonth.percent }}%</span>
              </div>
            </div>

            <!-- Columna 3: Mes Anterior -->
            <div class="flex-1">
              <span class="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mes Anterior</span>
              <div class="inline-flex items-baseline space-x-0.5">
                <span class="text-2xl font-black text-slate-800 dark:text-slate-100">{{ lastMonthAvgRating.toFixed(2) }}</span>
                <span class="text-[10px] text-amber-500 font-bold">★</span>
              </div>
            </div>

          </div>
          
          <div v-else class="h-14 flex items-center justify-center">
            <span class="text-xs text-slate-400 italic">Procesando tendencias de calidad...</span>
          </div>

          <p class="text-xxs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            Compara la calificación de la semana actual con el mes en curso y la media cerrada del mes anterior.
          </p>
        </div>

      </div>

      <!-- Sección de Gráficos de Distribución con Pestañas -->
      <section class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <!-- Pestañas de Gráficos -->
        <div class="border-b border-slate-200 dark:border-slate-800 flex flex-wrap bg-slate-50/50 dark:bg-slate-900/30">
          <button 
            @click="activeChartTab = 'rating_puntualidad'" 
            :class="['tab-btn', activeChartTab === 'rating_puntualidad' ? 'active' : '']"
          >
            Puntualidad
          </button>
          <button 
            @click="activeChartTab = 'rating_condiciones'" 
            :class="['tab-btn', activeChartTab === 'rating_condiciones' ? 'active' : '']"
          >
            Condiciones
          </button>
          <button 
            @click="activeChartTab = 'rating_asesoramiento'" 
            :class="['tab-btn', activeChartTab === 'rating_asesoramiento' ? 'active' : '']"
          >
            Asesoramiento
          </button>
          <button 
            @click="activeChartTab = 'rating_evaluacion_general'" 
            :class="['tab-btn', activeChartTab === 'rating_evaluacion_general' ? 'active' : '']"
          >
            Evaluación General
          </button>
        </div>

        <!-- Gráfico Activo -->
        <div class="p-6">
          <Transition name="fade" mode="out-in">
            <div v-if="filteredReportes.length > 0" :key="activeChartTab">
              <RatingChart 
                :title="chartTitleMap[activeChartTab]" 
                :reports="filteredReportes" 
                :field="activeChartTab" 
              />
            </div>
            <div v-else class="py-16 text-center text-slate-400 dark:text-slate-500">
              <svg class="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              <p class="text-sm font-medium">No hay suficientes evaluaciones para este filtro.</p>
            </div>
          </Transition>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import StatCard from '../components/StatCard.vue';
import RatingChart from '../components/RatingChart.vue';
import { DocumentChartBarIcon, ClockIcon, SparklesIcon, UserGroupIcon, StarIcon } from '@heroicons/vue/24/outline';

const loading = ref(true);
const error = ref(null);
const rawStats = ref([]);

// Métricas de Tendencia (Semana vs Mes vs Mes Anterior)
const weeklyAvgRating = ref(0);
const monthlyAvgRating = ref(0);
const lastMonthAvgRating = ref(0);
const trendLoading = ref(true);

const filters = ref({
  from: '',
  to: '',
  medico: '',
  instrumentador: '',
  lugar_cirugia: ''
});

const activePeriod = ref('last-90-days');
const activeChartTab = ref('rating_evaluacion_general');

const chartTitleMap = {
  rating_puntualidad: 'Distribución de Puntualidad',
  rating_condiciones: 'Distribución de Condiciones',
  rating_asesoramiento: 'Distribución de Asesoramiento',
  rating_evaluacion_general: 'Distribución de Evaluación General'
};

// Conversor fecha a string yyyy-mm-dd
const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Configurar períodos temporales
const setPeriod = (period) => {
  activePeriod.value = period;
  const today = new Date();

  if (period === 'this-month') {
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    filters.value.from = toInputDate(fromDate);
    filters.value.to = toInputDate(toDate);
  } else if (period === 'last-month') {
    const fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    filters.value.from = toInputDate(fromDate);
    filters.value.to = toInputDate(toDate);
  } else if (period === 'last-90-days') {
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 90);
    filters.value.from = toInputDate(fromDate);
    filters.value.to = toInputDate(today);
  } else if (period === 'all-time') {
    filters.value.from = '';
    filters.value.to = '';
  } else {
    activePeriod.value = 'custom';
  }
  
  fetchStats();
};

const fetchStats = async () => {
  loading.value = true;
  error.value = null;

  try {
    let query = supabase
      .from('reportes')
      .select('id, medico, instrumentador, instrumentador_completado, lugar_cirugia, fecha_cirugia, rating_puntualidad, rating_condiciones, rating_asesoramiento, rating_evaluacion_general')
      .eq('estado', 'Enviado');

    if (filters.value.from) {
      query = query.gte('fecha_cirugia', filters.value.from);
    }
    if (filters.value.to) {
      query = query.lte('fecha_cirugia', filters.value.to);
    }

    const { data, error: fetchError } = await query.order('fecha_cirugia', { ascending: false });

    if (fetchError) throw fetchError;
    rawStats.value = data || [];
  } catch (err) {
    console.error("Error al cargar estadísticas:", err);
    error.value = 'No se pudieron cargar los datos de estadísticas. Por favor, intente de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Carga independiente de datos para el widget de tendencia (Semana vs Mes vs Mes Anterior)
const fetchTrendMetrics = async () => {
  trendLoading.value = true;
  try {
    const today = new Date();
    
    // Inicio de la semana actual (lunes)
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const fromWeeklyStr = toInputDate(monday);
    
    // Inicio del mes actual (día 1)
    const fromMonthlyStr = toInputDate(new Date(today.getFullYear(), today.getMonth(), 1));

    // Rango del Mes Anterior (primer día al último día)
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const fromLastMonthStr = toInputDate(firstDayLastMonth);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const toLastMonthStr = toInputDate(lastDayLastMonth);

    // Traemos los reportes calificados desde el mes anterior hasta hoy
    const { data, error: trendError } = await supabase
      .from('reportes')
      .select('fecha_cirugia, rating_evaluacion_general')
      .eq('estado', 'Enviado')
      .gte('fecha_cirugia', fromLastMonthStr);

    if (trendError) throw trendError;

    if (data && data.length > 0) {
      // 1. Promedio Mes Anterior
      const dataLastMonth = data.filter(r => r.fecha_cirugia >= fromLastMonthStr && r.fecha_cirugia <= toLastMonthStr);
      const validLastMonth = dataLastMonth.filter(r => typeof r.rating_evaluacion_general === 'number' && r.rating_evaluacion_general > 0);
      if (validLastMonth.length > 0) {
        const sumLastMonth = validLastMonth.reduce((acc, r) => acc + r.rating_evaluacion_general, 0);
        lastMonthAvgRating.value = sumLastMonth / validLastMonth.length;
      } else {
        lastMonthAvgRating.value = 0;
      }

      // 2. Promedio Mes Actual
      const dataMonthly = data.filter(r => r.fecha_cirugia >= fromMonthlyStr);
      const validMonthly = dataMonthly.filter(r => typeof r.rating_evaluacion_general === 'number' && r.rating_evaluacion_general > 0);
      if (validMonthly.length > 0) {
        const sumMonthly = validMonthly.reduce((acc, r) => acc + r.rating_evaluacion_general, 0);
        monthlyAvgRating.value = sumMonthly / validMonthly.length;
      } else {
        monthlyAvgRating.value = 0;
      }

      // 3. Promedio Semana Actual
      const dataWeekly = data.filter(r => r.fecha_cirugia >= fromWeeklyStr);
      const validWeekly = dataWeekly.filter(r => typeof r.rating_evaluacion_general === 'number' && r.rating_evaluacion_general > 0);
      if (validWeekly.length > 0) {
        const sumWeekly = validWeekly.reduce((acc, r) => acc + r.rating_evaluacion_general, 0);
        weeklyAvgRating.value = sumWeekly / validWeekly.length;
      } else {
        weeklyAvgRating.value = 0;
      }
    } else {
      weeklyAvgRating.value = 0;
      monthlyAvgRating.value = 0;
      lastMonthAvgRating.value = 0;
    }
  } catch (err) {
    console.error("Error al cargar métricas de tendencia:", err);
  } finally {
    trendLoading.value = false;
  }
};

// Días transcurridos en el rango seleccionado
const daysInRange = computed(() => {
  let fromDateStr = filters.value.from;
  let toDateStr = filters.value.to;

  if (!fromDateStr || !toDateStr) {
    if (rawStats.value.length === 0) return 1;
    const dates = rawStats.value.map(r => new Date(r.fecha_cirugia).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    fromDateStr = toInputDate(minDate);
    toDateStr = toInputDate(maxDate);
  }

  const start = new Date(`${fromDateStr}T00:00:00`);
  const end = new Date(`${toDateStr}T00:00:00`);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays || 1;
});

// Promedios cuantitativos
const avgCompletadasPorDia = computed(() => {
  if (daysInRange.value === 0) return '0.00';
  const total = filteredReportes.value.length;
  return (total / daysInRange.value).toFixed(2);
});

const avgCompletadasPorSemana = computed(() => {
  const weeks = daysInRange.value / 7;
  if (weeks === 0) return '0.00';
  const total = filteredReportes.value.length;
  return (total / weeks).toFixed(2);
});

// Tendencia: Semana vs Mes
const trendVsMonth = computed(() => {
  if (weeklyAvgRating.value === 0 || monthlyAvgRating.value === 0) return null;
  const diff = weeklyAvgRating.value - monthlyAvgRating.value;
  const percent = (diff / monthlyAvgRating.value) * 100;
  return {
    diff: diff.toFixed(2),
    percent: Math.abs(percent).toFixed(1),
    positive: diff >= 0
  };
});

// Tendencia: Mes vs Mes Anterior
const trendVsLastMonth = computed(() => {
  if (monthlyAvgRating.value === 0 || lastMonthAvgRating.value === 0) return null;
  const diff = monthlyAvgRating.value - lastMonthAvgRating.value;
  const percent = (diff / lastMonthAvgRating.value) * 100;
  return {
    diff: diff.toFixed(2),
    percent: Math.abs(percent).toFixed(1),
    positive: diff >= 0
  };
});

// Listas de filtros dinámicos (Únicos del período)
const uniqueMedicos = computed(() => {
  const list = rawStats.value
    .map(r => r.medico)
    .filter(Boolean)
    .map(m => m.trim().toUpperCase());
  return Array.from(new Set(list)).sort();
});

const uniqueInstrumentadores = computed(() => {
  const list = rawStats.value
    .map(r => r.instrumentador_completado || r.instrumentador)
    .filter(Boolean)
    .map(i => i.trim());
  return Array.from(new Set(list)).sort();
});

// Reportes Filtrados en Frontend
const filteredReportes = computed(() => {
  return rawStats.value.filter(r => {
    if (filters.value.medico) {
      const matchMedico = (r.medico || '').trim().toUpperCase() === filters.value.medico;
      if (!matchMedico) return false;
    }
    if (filters.value.instrumentador) {
      const currentInst = r.instrumentador_completado || r.instrumentador || '';
      const matchInst = currentInst.trim() === filters.value.instrumentador;
      if (!matchInst) return false;
    }
    if (filters.value.lugar_cirugia) {
      const search = filters.value.lugar_cirugia.trim().toLowerCase();
      const currentClinic = (r.lugar_cirugia || '').trim().toLowerCase();
      if (!currentClinic.includes(search)) return false;
    }
    return true;
  });
});

// KPIs Computados Dinámicos
const totalFichas = computed(() => filteredReportes.value.length);

const calculateAverage = (field) => {
  if (filteredReportes.value.length === 0) return '0.00';
  const validReports = filteredReportes.value.filter(r => typeof r[field] === 'number' && r[field] > 0);
  if (validReports.length === 0) return '0.00';

  const sum = validReports.reduce((acc, r) => acc + r[field], 0);
  const average = sum / validReports.length;
  return average.toFixed(2);
};

const avgPuntualidad = computed(() => calculateAverage('rating_puntualidad'));
const avgCondiciones = computed(() => calculateAverage('rating_condiciones'));
const avgAsesoramiento = computed(() => calculateAverage('rating_asesoramiento'));
const avgGeneral = computed(() => calculateAverage('rating_evaluacion_general'));

onMounted(() => {
  setPeriod('last-90-days');
  fetchTrendMetrics();
});
</script>

<style scoped>
.form-input, .form-select {
  @apply rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-950/40 w-full;
}

.btn-period {
  @apply rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition shadow-sm hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer;
}

.btn-period.active {
  @apply border-blue-600 bg-blue-50/50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 font-bold;
}

.kpi-card {
  @apply flex flex-col justify-center p-5 rounded-2xl border shadow-sm min-h-[90px];
}

.kpi-label {
  @apply text-xs font-bold text-slate-400 uppercase tracking-widest;
  font-size: 0.68rem;
}

.kpi-value {
  @apply text-2xl font-black mt-1 leading-none;
}

.tab-btn {
  @apply flex-1 py-4 px-4 text-center font-bold text-xs md:text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition border-b-2 border-transparent flex items-center justify-center cursor-pointer whitespace-nowrap;
}

.tab-btn.active {
  @apply border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>