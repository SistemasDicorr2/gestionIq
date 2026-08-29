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
          <!-- Indicador de Carga de Firmas e Imágenes -->
          <div v-if="!allLoaded && fichas.length > 0" class="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/80">
            <svg class="animate-spin h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando elementos ({{ loadedImagesCount }}/{{ totalImagesCount }})...</span>
          </div>

          <div v-else-if="allLoaded && fichas.length > 0" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
            ✓ Listo para imprimir
          </div>

          <!-- Botón de Impresión Masiva (Req 4 y 5) -->
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

    <!-- Listado en Serie de Fichas Imprimibles -->
    <main v-else class="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 print:p-0 print:m-0 print:max-w-none">
      <article 
        v-for="(ficha, index) in fichas" 
        :key="ficha.id"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black page-break-card"
        style="page-break-after: always; break-after: page;"
      >
        <!-- Encabezado de la Ficha Institucional -->
        <header class="border-b-2 border-blue-600 pb-4 flex items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-black text-blue-600 tracking-tight">DISTRICORR · GESTIÓN IQ</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                {{ ficha.estado || 'ENVIADO' }}
              </span>
            </div>
            <h2 class="text-base font-black text-slate-900 mt-1 print:text-black">
              Ficha Digital de Cobertura Quirúrgica
            </h2>
          </div>

          <div class="text-right text-xs text-slate-500 font-mono">
            <div><strong>ID Cirugía:</strong> {{ ficha.id_cirugia || ('FICHA-' + ficha.id) }}</div>
            <div><strong>Fecha Envío:</strong> {{ formatDateTime(ficha.fecha_envio) }}</div>
          </div>
        </header>

        <!-- Datos Principales de la Cirugía -->
        <section class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs print:bg-gray-50 print:border-gray-300">
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Paciente</span>
            <span class="font-extrabold text-slate-900 print:text-black block mt-0.5">{{ ficha.paciente || 'Sin especificar' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Médico Cirujano</span>
            <span class="font-bold text-slate-800 print:text-black block mt-0.5">{{ ficha.medico || 'Sin especificar' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Institución / Sanatorio</span>
            <span class="font-bold text-slate-800 print:text-black block mt-0.5">{{ ficha.lugar_cirugia || 'Sin especificar' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase block">Fecha de Cirugía</span>
            <span class="font-bold text-slate-800 print:text-black block mt-0.5">{{ formatDate(ficha.fecha_cirugia) }}</span>
          </div>
        </section>

        <!-- Instrumentador Responsable -->
        <section class="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs flex items-center justify-between print:bg-gray-50 print:border-gray-300">
          <div>
            <span class="text-[10px] text-blue-600 font-bold uppercase block">Instrumentador / Técnico Responsable</span>
            <span class="font-extrabold text-slate-900 text-sm block mt-0.5">{{ ficha.instrumentador || 'Sin especificar' }}</span>
          </div>
          <div v-if="ficha.instrumentador_dni" class="text-right text-slate-600 font-mono">
            <strong>DNI:</strong> {{ ficha.instrumentador_dni }}
          </div>
        </section>

        <!-- Firma Digital Registrada -->
        <section class="pt-4 border-t border-slate-200">
          <span class="text-[10px] text-slate-400 font-bold uppercase block mb-2">Firma y Conformidad Digital</span>
          <div class="flex items-center justify-between gap-6">
            <div class="w-64 h-24 border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center justify-center print:border-gray-400">
              <img 
                v-if="ficha.url_firma" 
                :src="ficha.url_firma" 
                alt="Firma Digital" 
                class="max-h-full max-w-full object-contain"
                @load="onImageLoad(ficha.id)"
                @error="onImageError(ficha.id)"
              />
              <span v-else class="text-xs text-slate-400 italic">Sin firma cargada</span>
            </div>

            <div class="text-right text-[10px] text-slate-400 space-y-1">
              <div>Documento firmado y registrado digitalmente en Gestión IQ.</div>
              <div>Ficha #{{ index + 1 }} de {{ fichas.length }} en este lote.</div>
            </div>
          </div>
        </section>
      </article>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../../services/supabase';

const route = useRoute();
const loading = ref(true);
const error = ref(null);

const lote = ref(null);
const fichas = ref([]);

const loadedImages = ref(new Set());
const totalImagesCount = computed(() => fichas.value.filter(f => Boolean(f.url_firma)).length);
const loadedImagesCount = computed(() => loadedImages.value.size);

const allLoaded = computed(() => {
  if (totalImagesCount.value === 0) return true;
  return loadedImagesCount.value >= totalImagesCount.value;
});

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
    fichas.value = data.fichas || [];

    // Si no hay imágenes con firmas, declarar allLoaded como true inmediatamente
    if (totalImagesCount.value === 0) {
      loadedImages.value = new Set();
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const onImageLoad = (id) => {
  loadedImages.value.add(id);
  // Trigger reactivity update
  loadedImages.value = new Set(loadedImages.value);
};

const onImageError = (id) => {
  console.warn(`[LoteView] No se pudo cargar la imagen de firma para la ficha ${id}`);
  loadedImages.value.add(id);
  loadedImages.value = new Set(loadedImages.value);
};

const handlePrint = () => {
  if (!allLoaded.value) return;
  window.print();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(fetchLote);
</script>

<style scoped>
@media print {
  .page-break-card {
    page-break-after: always !important;
    break-after: page !important;
  }
}
</style>
