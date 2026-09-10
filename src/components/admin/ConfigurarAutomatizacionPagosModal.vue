<!-- src/components/admin/ConfigurarAutomatizacionPagosModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp text-slate-800 dark:text-slate-100"
        @click.stop
      >
        <!-- Encabezado Modal -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">DISTRICORR · GESTIÓN IQ</span>
              <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                AUTOMATIZACIÓN RESEND
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              Envío Automático del Reporte de Pagos
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Se enviará automáticamente el reporte PDF consolidado
              <span v-if="schedule.activo" class="font-bold text-blue-600 dark:text-blue-400">
                cada {{ getDayName(schedule.dia) }} a las {{ String(schedule.hora).padStart(2, '0') }}:{{ String(schedule.minuto).padStart(2, '0') }} hs (ART)
              </span>
              <span v-else class="font-bold text-amber-600 dark:text-amber-400">
                (Envío automático pausado)
              </span>.
            </p>
          </div>
          <button 
            type="button"
            @click="emit('close')" 
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Estado de Carga -->
        <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
          Cargando configuración...
        </div>

        <div v-else class="space-y-5">
          
          <!-- SECCIÓN 1: HORARIO Y DÍA DE ENVÍO AUTOMÁTICO -->
          <div class="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-900/60 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <span>⏰</span>
                <span>Programación del Envío (ART UTC-3)</span>
              </span>
              
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="schedule.activo" class="sr-only peer" />
                <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span class="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {{ schedule.activo ? 'Activo' : 'Pausado' }}
                </span>
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Día de la Semana
                </label>
                <select 
                  v-model.number="schedule.dia" 
                  :disabled="!schedule.activo"
                  class="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 disabled:opacity-50"
                >
                  <option :value="1">Lunes</option>
                  <option :value="2">Martes</option>
                  <option :value="3">Miércoles</option>
                  <option :value="4">Jueves</option>
                  <option :value="5">Viernes (Recomendado)</option>
                  <option :value="6">Sábado</option>
                  <option :value="0">Domingo</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hora (ART)
                </label>
                <select 
                  v-model.number="schedule.hora" 
                  :disabled="!schedule.activo"
                  class="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 disabled:opacity-50"
                >
                  <option v-for="h in hoursOptions" :key="h.value" :value="h.value">
                    {{ h.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Minuto
                </label>
                <select 
                  v-model.number="schedule.minuto" 
                  :disabled="!schedule.activo"
                  class="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 disabled:opacity-50"
                >
                  <option v-for="m in minutesOptions" :key="m.value" :value="m.value">
                    {{ m.label }}
                  </option>
                </select>
              </div>
            </div>

            <p class="text-[10px] text-blue-800 dark:text-blue-300 opacity-90 leading-tight">
              ℹ️ El reporte consolidará todas las órdenes de pago emitidas desde el sábado anterior a las 00:00 hs hasta el {{ getDayName(schedule.dia) }} a las {{ String(schedule.hora).padStart(2, '0') }}:{{ String(schedule.minuto).padStart(2, '0') }} hs y enviará el PDF adjunto.
            </p>
          </div>

          <!-- SECCIÓN 2: LISTA DE DESTINATARIOS -->
          <div class="space-y-3">
            <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
              ✉️ Destinatarios del Reporte Semanal
            </label>

            <form @submit.prevent="addEmail" class="flex gap-2">
              <input 
                v-model="newEmail" 
                type="email" 
                placeholder="ej: contable@districorr.com.ar" 
                class="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit" 
                :disabled="!newEmail.trim()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                + Añadir
              </button>
            </form>

            <!-- Lista de Emails Registrados -->
            <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
              <div 
                v-for="(email, idx) in emailList" 
                :key="idx" 
                class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div class="flex items-center gap-2 truncate">
                  <span class="text-slate-400 text-sm shrink-0">✉️</span>
                  <span class="truncate">{{ email }}</span>
                </div>
                <button 
                  type="button"
                  @click="removeEmail(idx)" 
                  class="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer shrink-0"
                >
                  Quitar
                </button>
              </div>

              <div v-if="emailList.length === 0" class="text-center py-4 text-xs text-slate-400 italic">
                No hay destinatarios registrados.
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones del Modal -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            @click="testReporteEmail" 
            :disabled="testing || loading"
            class="w-full sm:w-auto px-4 py-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 disabled:opacity-50 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span v-if="testing" class="animate-spin text-xs">🌀</span>
            <span v-else>🧪</span>
            <span>{{ testing ? 'Enviando prueba...' : 'Probar Envío Ahora' }}</span>
          </button>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button"
              @click="emit('close')" 
              class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="saveConfig" 
              :disabled="saving || loading"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
            >
              {{ saving ? 'Guardando...' : 'Guardar Configuración' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import { useReportePagosPDF } from '../../composables/useReportePagosPDF';
import { renderEmailReportePagosHtml } from '../../utils/reporteEmailTemplate';

const props = defineProps({
  show: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const { showSuccessToast, showErrorToast } = useToasts();
const { generarReporteListadoCompletoPagos } = useReportePagosPDF();

const loading = ref(false);
const saving = ref(false);
const testing = ref(false);
const newEmail = ref('');
const emailList = ref([]);

const schedule = reactive({
  dia: 5,      // 5 = Viernes por defecto
  hora: 17,    // 17:00 hs ART
  minuto: 0,
  activo: true
});

const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, '0')} hs${i === 17 ? ' (Recomendado)' : ''}`
}));

const minutesOptions = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, '0')} min`
}));

const getDayName = (dayNum) => {
  const map = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
  return map[dayNum] || 'Viernes';
};

const fetchConfig = async () => {
  try {
    loading.value = true;
    
    // 1. Obtener destinatarios de pagos
    const { data: emailsData, error: emailsErr } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_reporte_pagos')
      .single();

    if (emailsErr && emailsErr.code !== 'PGRST116') throw emailsErr;
    if (emailsData && Array.isArray(emailsData.value) && emailsData.value.length > 0) {
      emailList.value = [...emailsData.value];
    } else {
      emailList.value = ["contable@districorr.com.ar", "sistemas@districorr.com.ar"];
    }

    // 2. Obtener programación de pagos
    const { data: scheduleData } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'programacion_reporte_pagos')
      .single();

    if (scheduleData && scheduleData.value) {
      schedule.dia = scheduleData.value.dia ?? 5;
      schedule.hora = scheduleData.value.hora ?? 17;
      schedule.minuto = scheduleData.value.minuto ?? 0;
      schedule.activo = scheduleData.value.activo ?? true;
    }
  } catch (err) {
    console.error("Error al cargar configuración:", err);
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (val) => {
  if (val) fetchConfig();
});

onMounted(() => {
  if (props.show) fetchConfig();
});

const addEmail = () => {
  const email = newEmail.value.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    showErrorToast('Por favor ingresa un correo electrónico válido.');
    return;
  }
  if (emailList.value.includes(email)) {
    showErrorToast('El correo ya está registrado en la lista.');
    return;
  }
  emailList.value.push(email);
  newEmail.value = '';
};

const removeEmail = (index) => {
  emailList.value.splice(index, 1);
};

const saveConfig = async () => {
  try {
    saving.value = true;

    // 1. Guardar lista de destinatarios
    const { error: emailsErr } = await supabase
      .from('resumen_operativo_config')
      .upsert({
        key: 'emails_reporte_pagos',
        value: emailList.value,
        updated_at: new Date().toISOString()
      });

    if (emailsErr) throw emailsErr;

    // 2. Intentar invocar la RPC de pg_cron si está disponible
    try {
      const { error: rpcErr } = await supabase.rpc('actualizar_programacion_reporte_pagos_semanal', {
        p_dia: schedule.dia,
        p_hora: schedule.hora,
        p_minuto: schedule.minuto,
        p_activo: schedule.activo
      });

      if (rpcErr) {
        console.warn("RPC actualizar_programacion_reporte_pagos_semanal no disponible aún:", rpcErr.message);
        // Fallback: Guardar directamente en la tabla
        await supabase
          .from('resumen_operativo_config')
          .upsert({
            key: 'programacion_reporte_pagos',
            value: {
              dia: schedule.dia,
              hora: schedule.hora,
              minuto: schedule.minuto,
              activo: schedule.activo
            },
            updated_at: new Date().toISOString()
          });
      }
    } catch (dbErr) {
      console.warn("Respaldo directo de configuración de horario:", dbErr);
    }

    showSuccessToast('Configuración de envío automático guardada correctamente.');
    emit('close');
  } catch (err) {
    showErrorToast(err, 'No se pudo guardar la configuración.');
  } finally {
    saving.value = false;
  }
};

const testReporteEmail = async () => {
  try {
    testing.value = true;
    showSuccessToast('Generando reporte y enviando correo de prueba con PDF adjunto...');

    // 1. Guardar configuración actual
    await saveConfig();

    const targetEmails = emailList.value.length > 0 
      ? emailList.value 
      : ["contable@districorr.com.ar", "sistemas@districorr.com.ar"];

    // 2. Calcular período de la semana en curso (Sábado anterior a hoy)
    const now = new Date();
    const currentDay = now.getDay();
    const daysSinceSaturday = (currentDay + 1) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() - daysSinceSaturday);

    const startDateStr = saturday.toISOString().split('T')[0];
    const endDateStr = now.toISOString().split('T')[0];

    // 3. Consultar órdenes del período
    const { data: ordenesData, error: ordenesError } = await supabase
      .from('ordenes_de_pago')
      .select('id, fecha_emision')
      .gte('fecha_emision', startDateStr)
      .lte('fecha_emision', `${endDateStr}T23:59:59`)
      .order('id', { ascending: false });

    if (ordenesError) throw ordenesError;

    const detailedOrders = await Promise.all(
      (ordenesData || []).map(async (o) => {
        const { data } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: o.id });
        return data || o;
      })
    );

    const periodoLabel = `Semana en curso (${startDateStr} al ${endDateStr})`;

    // 4. Generar el PDF consolidado en Base64
    const pdfResult = generarReporteListadoCompletoPagos({
      ordenesDetalladas: detailedOrders,
      periodoLabel,
      download: false
    });

    const base64Content = pdfResult?.base64 || '';
    const pdfFilename = `Reporte_Pagos_Consolidado_Semana_en_curso.pdf`;

    const totalMonto = detailedOrders.reduce((sum, o) => {
      const val = parseFloat(o.monto_total_general || o.monto_total || 0);
      return sum + (!isNaN(val) ? val : 0);
    }, 0);

    const totalMontoFormatted = `$ ${totalMonto.toLocaleString('es-AR')}`;

    const emailHtml = renderEmailReportePagosHtml({
      periodoLabel,
      montoTotalStr: totalMontoFormatted,
      totalOrdenes: detailedOrders.length,
      totalCirugias: detailedOrders.reduce((acc, o) => acc + (o.cantidad_cirugias || o.cirugias?.length || 1), 0),
      filename: pdfFilename
    });

    // 5. Enviar a través de la Edge Function send-email con adjunto
    const { error: sendError } = await supabase.functions.invoke('send-email', {
      body: {
        to: targetEmails,
        subject: `Prueba de Reporte de Pagos · Districorr (${totalMontoFormatted})`,
        html: emailHtml,
        attachments: base64Content ? [
          {
            filename: pdfFilename,
            content: base64Content
          }
        ] : []
      }
    });

    if (sendError) throw sendError;

    showSuccessToast(`Prueba enviada con éxito a ${targetEmails.join(', ')} con el PDF adjunto.`);
  } catch (err) {
    console.error("Error al probar reporte por correo:", err);
    showErrorToast(err, 'Error en el envío de prueba.');
  } finally {
    testing.value = false;
  }
};
</script>

<style scoped>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scaleUp {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
