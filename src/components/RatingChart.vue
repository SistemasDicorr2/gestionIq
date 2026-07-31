<!-- src/components/RatingChart.vue -->
<template>
  <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
    <h3 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{{ title }}</h3>
    
    <div class="relative h-64">
      <Bar v-if="hasData" :key="field" :data="chartData" :options="chartOptions" />
      <div v-else class="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-500">
        <svg class="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
        <p class="text-xs">No hay datos suficientes para graficar.</p>
      </div>
    </div>

    <!-- Desglose de votos detallado (Kowalski / Bento Style) -->
    <div v-if="hasData" class="mt-6 grid grid-cols-5 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
      <div v-for="(count, idx) in countsList.slice().reverse()" :key="idx" class="p-2 rounded-xl bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-900/40">
        <span class="text-xxs font-bold text-slate-400 block">{{ 5 - idx }} ★</span>
        <p class="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">{{ count }}</p>
        <span class="text-[10px] text-slate-400 font-medium block mt-0.5">{{ getPercentage(count) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  title: { type: String, required: true },
  reports: { type: Array, required: true },
  field: { type: String, required: true }
});

const countsList = computed(() => {
  const counts = [0, 0, 0, 0, 0];
  for (const report of props.reports) {
    const rating = report[props.field];
    if (rating >= 1 && rating <= 5) {
      counts[rating - 1]++;
    }
  }
  return counts;
});

const totalVotes = computed(() => {
  return countsList.value.reduce((acc, c) => acc + c, 0);
});

const hasData = computed(() => {
  return totalVotes.value > 0;
});

const getPercentage = (count) => {
  if (totalVotes.value === 0) return '0.0';
  return ((count / totalVotes.value) * 100).toFixed(1);
};

const chartData = computed(() => {
  return {
    labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
    datasets: [{
      label: 'Evaluaciones',
      // Paleta pastel curada
      backgroundColor: ['#fca5a5', '#fdba74', '#fef08a', '#a3e635', '#34d399'],
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 6, // Esquinas redondeadas premium
      borderSkipped: false,
      data: countsList.value,
      maxBarThickness: 45
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#fff',
      bodyColor: '#e2e8f0',
      padding: 10,
      cornerRadius: 12,
      displayColors: false,
      font: {
        family: 'Inter, system-ui, -apple-system, sans-serif'
      },
      callbacks: {
        title: () => '',
        label: (context) => ` ${context.raw} valoración${context.raw !== 1 ? 'es' : ''}`,
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#94a3b8',
        font: {
          family: 'Inter, system-ui, -apple-system, sans-serif',
          size: 11,
          weight: '500'
        }
      }
    },
    y: {
      beginAtZero: true,
      ticks: { 
        precision: 0,
        color: '#94a3b8',
        font: {
          family: 'Inter, system-ui, -apple-system, sans-serif',
          size: 10
        }
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.08)', // Grilla horizontal punteada muy suave
        borderDash: [5, 5],
        drawBorder: false
      }
    }
  }
};
</script>

<style scoped>
.text-xxs {
  font-size: 0.68rem;
}
</style>