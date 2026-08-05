<!-- src/components/report-details/ReportEventsAndPdfs.vue (Con Informe Diario de Logística e Historial Integrado) -->
<template>
  <div class="w-full">
    <div v-if="isLoading" class="py-8 text-center text-xs text-slate-400">
      Cargando historial de eventos del reporte...
    </div>

    <div v-else-if="errorMsg" class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
      {{ errorMsg }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- COLUMNA 1: LÍNEA DE TIEMPO DE EVENTOS -->
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>⏱️</span>
            <span>Eventos y Trazabilidad del Reporte</span>
          </h3>
          <span class="text-[10px] font-extrabold text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {{ timelineEvents.length }} eventos
          </span>
        </div>

        <div v-if="timelineEvents.length > 0" class="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          <div 
            v-for="(event, index) in timelineEvents" 
            :key="index" 
            class="relative pl-4 space-y-1 text-xs"
          >
            <!-- Punto indicador -->
            <span 
              class="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs"
              :class="event.dotColor || 'bg-blue-600'"
            ></span>

            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                <span>{{ event.icon || '📌' }}</span>
                <span>{{ event.title }}</span>
              </span>
              <time class="text-[10px] text-slate-400 font-mono">{{ formatDateTime(event.timestamp) }}</time>
            </div>

            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
              {{ event.description }}
            </p>

            <!-- Enlace a Informe Diario de Logística si aplica -->
            <div v-if="event.informeLogisticaId" class="pt-1">
              <router-link 
                :to="{ name: 'LogisticaDetalleInforme', params: { id: event.informeLogisticaId } }"
                class="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
              >
                <span>🔍 Ver Informe Diario de Logística</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
          No hay eventos registrados para mostrar.
        </div>
      </div>

      <!-- COLUMNA 2: HISTORIAL DE PDFS GENERADOS -->
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>📄</span>
            <span>Historial de PDFs Generados</span>
          </h3>
          <span class="text-[10px] font-extrabold text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {{ pdfHistory.length }} PDFs
          </span>
        </div>

        <div v-if="pdfHistory.length > 0" class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="p-2.5">Versión</th>
                <th class="p-2.5">Fecha</th>
                <th class="p-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="pdf in pdfHistory" 
                :key="pdf.id" 
                class="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-950/40"
              >
                <td class="p-2.5 font-extrabold text-slate-900 dark:text-white">
                  Versión {{ pdf.version }}
                </td>
                <td class="p-2.5 text-slate-500 font-mono text-[11px]">
                  {{ formatDateTime(pdf.generated_at) }}
                </td>
                <td class="p-2.5 text-right">
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                    Generado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500 text-xs">
          <p class="font-medium">No se han generado archivos PDF para este reporte todavía.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';

const props = defineProps({
  reportId: { type: [String, Number], required: true },
});

const isLoading = ref(true);
const errorMsg = ref(null);
const reporteData = ref(null);
const logisticaData = ref(null);
const logisticaMovimientos = ref([]);
const pagoData = ref(null);
const pdfHistory = ref([]);

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Argentina/Buenos_Aires',
});

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return dateTimeFormatter.format(new Date(dateString)) + ' hs';
};

const timelineEvents = computed(() => {
  const events = [];
  if (!reporteData.value) return events;

  // 1. Reporte Creado
  events.push({
    title: 'Reporte Creado',
    icon: '📝',
    dotColor: 'bg-blue-500',
    description: 'Se registró la cirugía en Gestión IQ.',
    timestamp: reporteData.value.created_at,
  });

  // 2. Ficha Enviada por Instrumentador
  if (reporteData.value.fecha_envio) {
    events.push({
      title: 'Ficha Enviada',
      icon: '✅',
      dotColor: 'bg-emerald-500',
      description: `Ficha quirúrgica completada y enviada por ${reporteData.value.instrumentador_completado || 'el instrumentador'}.`,
      timestamp: reporteData.value.fecha_envio,
    });
  }

  // 3. Movimiento en Informe Diario de Logística Operativa (NUEVO)
  if (logisticaMovimientos.value && logisticaMovimientos.value.length > 0) {
    logisticaMovimientos.value.forEach(mov => {
      const inf = mov.informe || {};
      events.push({
        title: 'Informe Diario de Logística',
        icon: '🚚',
        dotColor: 'bg-amber-500',
        description: `Gestión registrada: ${mov.tipo_movimiento} (${mov.cantidad_cajas || 0} cajas, ${mov.cantidad_bultos || 0} bultos). Responsable: ${inf.responsable_nombre || 'Logística'}. Estado: ${inf.estado || 'Enviado'}.`,
        timestamp: mov.created_at || inf.enviado_at || inf.fecha,
        informeLogisticaId: mov.informe_id
      });
    });
  }

  // 4. Control de Logística previo (si existiera en logistica_controles)
  if (logisticaData.value) {
    events.push({
      title: 'Control de Logística (Devolución)',
      icon: '📦',
      dotColor: 'bg-indigo-500',
      description: `Se registró devolución en control de materiales. Estado: ${logisticaData.value.estado || 'OK'}.`,
      timestamp: logisticaData.value.created_at,
    });
  }

  // 5. Pago Realizado
  if (pagoData.value?.created_at) {
    events.push({
      title: 'Pago Abonado',
      icon: '💳',
      dotColor: 'bg-green-600',
      description: `Comprobante de pago procesado el ${formatDateTime(pagoData.value.created_at)}.`,
      timestamp: pagoData.value.created_at,
    });
  }

  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = null;
  pagoData.value = null;
  logisticaMovimientos.value = [];

  try {
    const [reporteRes, logisticaRes, pdfRes, logMovsRes] = await Promise.all([
      supabase.from('reportes').select('created_at, fecha_envio, instrumentador_completado, pago_id').eq('id', props.reportId).single(),
      supabase.from('logistica_controles').select('created_at, estado').eq('cirugia_id', props.reportId).limit(1).maybeSingle(),
      supabase.from('pdf_generation_log').select('id, version, generated_at').eq('reporte_id', props.reportId).order('version', { ascending: false }),
      supabase.from('logistica_informe_movimientos').select(`
        id,
        informe_id,
        tipo_movimiento,
        cantidad_cajas,
        cantidad_bultos,
        tiene_pendiente,
        detalle_pendiente,
        observaciones,
        created_at,
        informe:logistica_informes_diarios(id, fecha, responsable_nombre, estado, enviado_at)
      `).eq('reporte_id', props.reportId)
    ]);

    if (reporteRes.error) throw new Error(`Error al cargar el reporte: ${reporteRes.error.message}`);
    if (pdfRes.error) throw new Error(`Error al cargar historial de PDF: ${pdfRes.error.message}`);
    
    reporteData.value = reporteRes.data;
    logisticaData.value = logisticaRes.data;
    pdfHistory.value = pdfRes.data || [];
    logisticaMovimientos.value = logMovsRes.data || [];

    if (reporteRes.data?.pago_id) {
      const { data: pago } = await supabase
        .from('pagos')
        .select('created_at')
        .eq('id', reporteRes.data.pago_id)
        .maybeSingle();

      pagoData.value = pago;
    }
  } catch (error) {
    console.error('Error en fetchData:', error);
    errorMsg.value = 'No se pudo cargar la información del historial.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
</script>
