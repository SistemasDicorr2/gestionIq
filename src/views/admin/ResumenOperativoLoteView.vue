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

    <!-- Listado en Serie de Fichas Imprimibles Detalladas -->
    <main v-else class="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 print:p-0 print:m-0 print:max-w-none">
      <article 
        v-for="(ficha, index) in fichas" 
        :key="ficha.id"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black page-break-card flex flex-col justify-between"
        style="page-break-after: always; break-after: page; min-height: 1000px;"
      >
        <!-- Encabezado de la Ficha Institucional Oficial -->
        <header class="border-b-2 border-slate-200 pb-3 flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <img src="/2.svg" alt="Districorr Logo" class="h-12 sm:h-14 object-contain">
          </div>

          <div class="text-right space-y-0.5">
            <div class="flex items-center justify-end gap-2">
              <span v-if="ficha.tipo_logistica === 'con_logistica'" class="bg-red-100 text-red-750 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase border border-red-300 tracking-wider shadow-2xs">
                Posee Logística
              </span>
              <h2 class="text-lg sm:text-xl font-black text-[#1E3A8A] print:text-[#1E3A8A]">
                Reporte de Cirugía
              </h2>
            </div>
            <p class="text-xs text-slate-500 font-medium print:text-slate-600">
              Ficha de Identificación del Instrumentador Quirúrgico
            </p>
            <div class="text-[11px] text-slate-400 font-mono flex items-center justify-end gap-1.5 pt-0.5">
              <span><strong>ID Reporte:</strong> {{ ficha.id_cirugia || ('CX-' + ficha.id) }}</span>
              <span>|</span>
              <span><strong>Generado:</strong> {{ formatDateTime(ficha.fecha_envio || ficha.created_at) }}</span>
            </div>
          </div>
        </header>

        <!-- Datos Principales del Paciente y la Cirugía -->
        <section class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs print:bg-gray-50 print:border-gray-300 space-y-2">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Paciente</span>
              <span class="font-extrabold text-slate-900 dark:text-white print:text-black text-sm block mt-0.5">
                {{ ficha.paciente || 'Sin especificar' }}
              </span>
            </div>

            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Médico Cirujano</span>
              <span class="font-bold text-slate-800 dark:text-slate-200 print:text-black block mt-0.5">
                {{ ficha.medico || 'Sin especificar' }}
              </span>
            </div>

            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Tipo de Cirugía</span>
              <span class="font-bold text-slate-800 dark:text-slate-200 print:text-black block mt-0.5">
                {{ ficha.tipo_cirugia || 'General / Quirúrgica' }}
              </span>
            </div>

            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Fecha de Cirugía</span>
              <span class="font-bold text-slate-800 dark:text-slate-200 print:text-black block mt-0.5">
                {{ formatDate(ficha.fecha_cirugia) }}
              </span>
            </div>

            <div class="col-span-2">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Lugar / Institución</span>
              <span class="font-bold text-slate-800 dark:text-slate-200 print:text-black block mt-0.5">
                {{ ficha.lugar_cirugia || 'Sin especificar' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Datos del Instrumentador Responsable -->
        <section class="p-3 bg-blue-50/50 dark:bg-slate-800/30 rounded-xl border border-blue-100 dark:border-slate-700 text-xs flex items-center justify-between print:bg-gray-50 print:border-gray-300">
          <div>
            <span class="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase block">
              Completado por (Instrumentador / Técnico)
            </span>
            <span class="font-extrabold text-slate-900 dark:text-white print:text-black text-sm block mt-0.5">
              {{ ficha.instrumentador_completado || ficha.instrumentador || 'Sin especificar' }}
            </span>
          </div>
          <div class="text-right text-slate-600 dark:text-slate-300 font-mono space-y-0.5">
            <div><strong>DNI:</strong> {{ ficha.instrumentador_dni || 'Sin especificar' }}</div>
            <div class="text-[10px] text-slate-400"><strong>Ficha Completada:</strong> {{ formatDateTime(ficha.fecha_envio) }}</div>
          </div>
        </section>

        <!-- Cuestionario y Evaluación Técnica -->
        <section class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <!-- Cuestionario -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <h3 class="font-extrabold text-slate-900 dark:text-white border-l-4 border-[#1E3A8A] pl-2 text-xs uppercase tracking-wider">
              Cuestionario
            </h3>
            <div class="space-y-1.5 pt-1">
              <div class="flex justify-between items-center">
                <span class="text-slate-600 dark:text-slate-400 font-medium">Set completo recibido:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ formatBoolean(ficha.set_completo) }}</span>
              </div>
              <div v-if="ficha.set_completo === false" class="flex justify-between items-center">
                <span class="text-slate-600 dark:text-slate-400 font-medium">Faltantes informados a tiempo:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ formatBoolean(ficha.informe_faltante) }}</span>
              </div>
            </div>
          </div>

          <!-- Evaluación con Estrellas -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <h3 class="font-extrabold text-slate-900 dark:text-white border-l-4 border-[#1E3A8A] pl-2 text-xs uppercase tracking-wider">
              Evaluación del Servicio
            </h3>
            <div class="space-y-1 pt-0.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-slate-400 font-medium">Puntualidad:</span>
                <span class="font-bold font-mono">{{ formatRating(ficha.rating_puntualidad) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-slate-400 font-medium">Condiciones:</span>
                <span class="font-bold font-mono">{{ formatRating(ficha.rating_condiciones) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-slate-400 font-medium">Asesoramiento:</span>
                <span class="font-bold font-mono">{{ formatRating(ficha.rating_asesoramiento) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-slate-400 font-medium">General:</span>
                <span class="font-bold font-mono">{{ formatRating(ficha.rating_evaluacion_general) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Datos Adicionales (Consumo, Observaciones y Logística) -->
        <section class="space-y-3 text-xs">
          <h3 class="font-extrabold text-slate-900 dark:text-white border-l-4 border-[#1E3A8A] pl-2 text-xs uppercase tracking-wider">
            Datos Adicionales
          </h3>
          
          <div class="space-y-2">
            <div>
              <span class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Consumo Realizado</span>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap min-h-[40px]">
                {{ ficha.consumo_realizado || 'No especificado' }}
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Comentarios / Observaciones</span>
                <div class="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 whitespace-pre-wrap min-h-[40px]">
                  {{ ficha.observaciones || 'Sin comentarios.' }}
                </div>
              </div>

              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-lg space-y-1.5">
                <div class="flex justify-between">
                  <span class="text-slate-500 font-medium">Representante:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ ficha.representante_ventas || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500 font-medium">Duración Cirugía:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ ficha.duracion_cirugia || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500 font-medium">Logística:</span>
                  <span :class="['font-bold', ficha.tipo_logistica === 'con_logistica' ? 'text-red-600' : 'text-slate-800 dark:text-slate-200']">
                    {{ humanize(ficha.tipo_logistica) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500 font-medium">Transporte:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ ficha.transporte_utilizado || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Pie de Ficha con Firma y Conformidad Digital -->
        <footer class="pt-3 border-t-2 border-slate-200 space-y-2 mt-auto">
          <p class="text-center text-[10px] text-slate-400 italic">
            Declaro que la información contenida en este reporte es veraz y completa.
          </p>

          <div class="flex items-center justify-between gap-4">
            <!-- Recuadro de Firma Digital -->
            <div class="w-56 h-20 border border-slate-200 rounded-xl p-1.5 bg-slate-50 flex items-center justify-center print:border-gray-400">
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

            <div class="text-right space-y-1">
              <div class="border-t border-slate-400 pt-1">
                <span class="font-extrabold text-xs text-slate-900 dark:text-white print:text-black block">
                  {{ ficha.instrumentador_completado || ficha.instrumentador || 'Instrumentador Responsable' }}
                </span>
                <span class="text-[10px] text-slate-400 block">Firma y Aclaración Digital</span>
              </div>
              <div class="text-[9px] text-slate-400 font-mono">
                Documento registrado en Gestión IQ · Ficha #{{ index + 1 }} de {{ fichas.length }}
              </div>
            </div>
          </div>
        </footer>
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
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return 'N/A';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';
};

const formatBoolean = (val) => {
  if (val === null || val === undefined) return 'N/A';
  return val ? '✅ Sí' : '❌ No';
};

const humanize = (text) => {
  if (!text) return 'Sin logística';
  return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '⭐⭐⭐⭐⭐ (5/5)';
  const val = parseInt(rating, 10);
  if (isNaN(val) || val < 1 || val > 5) return '⭐⭐⭐⭐⭐ (5/5)';
  return '⭐'.repeat(val) + ` (${val}/5)`;
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

