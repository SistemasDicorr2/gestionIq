<!-- src/views/admin/ResumenOperativoLoteView.vue -->
<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:min-h-0">
    
    <!-- Barra Superior Flotante de Acciones (Oculta al imprimir) -->
    <header class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm print:hidden">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase">DISTRICORR · GESTIÓN IQ</span>
            <span v-if="lote" class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold">
              LOTE INMUTABLE
            </span>
          </div>
          <h1 class="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            Impresión Unificada de Fichas de Cirugía
          </h1>
          <p v-if="lote" class="text-xs text-slate-500 dark:text-slate-400">
            Período: <strong>{{ formatDate(lote.periodo_desde) }}</strong> al <strong>{{ formatDate(lote.periodo_hasta) }}</strong> · {{ fichas.length }} Ficha(s)
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Indicador de Carga de Fuentes, Imágenes y Firmas -->
          <div v-if="!allLoaded && fichas.length > 0" class="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/80">
            <svg class="animate-spin h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando recursos e imágenes...</span>
          </div>

          <div v-else-if="allLoaded && fichas.length > 0" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
            ✓ Listo para imprimir
          </div>

          <!-- Botón de Impresión Masiva -->
          <button 
            @click="handlePrint" 
            :disabled="!allLoaded || loading"
            :class="[
              'px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer',
              allLoaded && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir todas las fichas</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Estado de Carga Inicial -->
    <div v-if="loading" class="py-24 text-center space-y-3 print:hidden">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="text-sm font-medium text-slate-500">Cargando fichas del lote inmutable...</p>
    </div>

    <!-- Error al cargar lote -->
    <div v-else-if="error" class="max-w-xl mx-auto my-12 p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-3 print:hidden">
      <div class="text-2xl">⚠️</div>
      <h2 class="text-base font-bold text-red-800 dark:text-red-300">Error al cargar el lote</h2>
      <p class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Sin Fichas -->
    <div v-else-if="fichas.length === 0" class="max-w-xl mx-auto my-12 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 print:hidden">
      <p class="text-sm text-slate-500">Este lote no contiene fichas enviadas registradas.</p>
    </div>

    <!-- Reutilización directa del componente canónico ReportPDF.vue (Fuente Única de Verdad Visual y de Datos) -->
    <main v-else class="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 print:space-y-0 print:p-0 print:m-0 print:max-w-none flex flex-col items-center print:block">
      <div 
        v-for="(ficha, index) in fichas" 
        :key="ficha.id || index"
        :class="['shadow-sm rounded-xl overflow-hidden print:shadow-none print:rounded-none', { 'page-break-card': index < fichas.length - 1 }]"
      >
        <ReportPDF :reporte="ficha" />
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../../services/supabase';
import ReportPDF from '../../components/ReportPDF.vue';
import { normalizeReport, formatDate } from '../../utils/reportMapper.js';

const route = useRoute();
const loading = ref(true);
const error = ref(null);

const lote = ref(null);
const fichas = ref([]);
const assetsLoaded = ref(false);

const allLoaded = computed(() => !loading.value && assetsLoaded.value);

const preloadAssets = async () => {
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const imageUrls = ['/2.svg'];
    fichas.value.forEach(f => {
      if (f.url_firma) imageUrls.push(f.url_firma);
      if (Array.isArray(f.evidencias)) {
        f.evidencias.forEach(ev => {
          if (ev.url) imageUrls.push(ev.url);
          if (ev.thumbnailUrl) imageUrls.push(ev.thumbnailUrl);
        });
      }
    });

    const uniqueUrls = Array.from(new Set(imageUrls));
    await Promise.all(uniqueUrls.map(url => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
      });
    }));

    assetsLoaded.value = true;
  } catch (err) {
    console.warn('[LoteView] Error al precargar imágenes/fuentes:', err);
    assetsLoaded.value = true;
  }
};

const fetchLote = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = route.params.token;
    if (!token) throw new Error("Token de lote no especificado.");

    const { data, error: rpcErr } = await supabase.rpc('obtener_lote_por_token', { p_token: token });

    if (rpcErr) throw rpcErr;
    if (!data.success) throw new Error(data.error || "No se pudo recuperar el lote especificado.");

    lote.value = data.lote;
    
    // Normalizar la lista de fichas usando el mapper único
    const rawFichas = data.fichas || [];
    fichas.value = rawFichas.map(f => normalizeReport(f));

    await preloadAssets();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handlePrint = () => {
  if (!allLoaded.value) return;
  window.print();
};

onMounted(fetchLote);
</script>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    margin: 0;
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page-break-card {
    break-after: page !important;
    page-break-after: always !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
</style>
