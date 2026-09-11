<!-- src/components/admin/ConfigurarReporteCajasDevueltasModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
      
      <!-- Encabezado Modal -->
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span class="text-xs font-black uppercase text-purple-600 dark:text-purple-400">TRAZABILIDAD LOGÍSTICA</span>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">
            Programación y Destinatarios: Cajas Devueltas sin Ficha
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configura qué destinatarios recibirán la alerta de cirugías con retorno de cajas pero sin ficha completada.
          </p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xl font-bold cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Estado de Carga -->
      <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
        Cargando configuración...
      </div>

      <div v-else class="space-y-5">
        
        <!-- SECCIÓN 1: HORARIO Y DÍA DE ENVÍO AUTOMÁTICO -->
        <div class="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200/80 dark:border-purple-900/60 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
              <span>⏰</span>
              <span>Horario de Alerta Automática (ART UTC-3)</span>
            </span>
            
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="schedule.activo" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
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
                <option :value="5">Viernes (Recomendado 18:00 hs)</option>
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

          <p class="text-[10px] text-purple-800 dark:text-purple-300 opacity-90 leading-tight">
            ℹ️ Este reporte alerta sobre cirugías que registraron retorno físico a central pero aún no tienen ficha digital finalizada o instrumentador confirmado.
          </p>
        </div>

        <!-- SECCIÓN 2: LISTA DE DESTINATARIOS -->
        <div class="space-y-3">
          <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
            ✉️ Destinatarios de la Alerta (Supervisión / Logística)
          </label>

          <form @submit.prevent="addEmail" class="flex gap-2">
            <input 
              v-model="newEmail" 
              type="email" 
              placeholder="logistica@districorr.com.ar" 
              class="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              type="submit" 
              :disabled="!newEmail.trim()"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              + Añadir
            </button>
          </form>

          <!-- Lista de Emails Registrados -->
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div 
              v-for="(email, idx) in emailList" 
              :key="idx" 
              class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <div class="flex items-center gap-2">
                <span class="text-slate-400 text-sm">✉️</span>
                <span>{{ email }}</span>
              </div>
              <button 
                @click="removeEmail(idx)" 
                class="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
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
          class="w-full sm:w-auto px-4 py-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 disabled:opacity-50 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span v-if="testing" class="animate-spin text-xs">🌀</span>
          <span v-else>🧪</span>
          <span>{{ testing ? 'Enviando prueba...' : 'Probar reporte por correo' }}</span>
        </button>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button @click="$emit('close')" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
            Cancelar
          </button>
          <button 
            @click="saveConfig" 
            :disabled="saving || loading"
            class="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
          >
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import { sendEmailWithResend } from '../../services/resendService';

const props = defineProps({
  show: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const testing = ref(false);
const newEmail = ref('');
const emailList = ref([]);

const schedule = reactive({
  dia: 5,      // 5 = Viernes
  hora: 18,    // 18:00 hs ART
  minuto: 0,
  activo: true
});

const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, '0')} hs`
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
    
    // 1. Obtener destinatarios específicos
    const { data: emailsData, error: emailsErr } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_destinatarios_cajas_sin_ficha')
      .maybeSingle();

    if (emailsErr && emailsErr.code !== 'PGRST116') throw emailsErr;
    if (emailsData && Array.isArray(emailsData.value)) {
      emailList.value = [...emailsData.value];
    } else {
      emailList.value = ["sistemas@districorr.com.ar", "logistica@districorr.com.ar", "auxiliardeposito@districorr.com.ar"];
    }

    // 2. Obtener programación del envío
    const { data: scheduleData } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'programacion_cajas_sin_ficha')
      .maybeSingle();

    if (scheduleData && scheduleData.value) {
      schedule.dia = scheduleData.value.dia ?? 5;
      schedule.hora = scheduleData.value.hora ?? 18;
      schedule.minuto = scheduleData.value.minuto ?? 0;
      schedule.activo = scheduleData.value.activo ?? true;
    }
  } catch (err) {
    toast.error("Error al cargar configuración: " + err.message);
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (val) => {
  if (val) fetchConfig();
});

const addEmail = () => {
  const email = newEmail.value.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    toast.error("Ingresá un correo electrónico válido.");
    return;
  }
  if (emailList.value.includes(email)) {
    toast.error("El correo ya está en la lista.");
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
        key: 'emails_destinatarios_cajas_sin_ficha',
        value: emailList.value,
        updated_at: new Date().toISOString()
      });

    if (emailsErr) throw emailsErr;

    // 2. Guardar programación
    const { error: schedErr } = await supabase
      .from('resumen_operativo_config')
      .upsert({
        key: 'programacion_cajas_sin_ficha',
        value: {
          dia: schedule.dia,
          hora: schedule.hora,
          minuto: schedule.minuto,
          activo: schedule.activo
        },
        updated_at: new Date().toISOString()
      });

    if (schedErr) throw schedErr;

    toast.success("Configuración de alerta de cajas devueltas guardada.");
    emit('close');
  } catch (err) {
    toast.error("Error al guardar configuración: " + err.message);
  } finally {
    saving.value = false;
  }
};

const testReporteEmail = async () => {
  try {
    testing.value = true;
    toast.info("Generando reporte de prueba...");

    await saveConfig();

    const targetEmails = emailList.value.length > 0 
      ? emailList.value 
      : ["sistemas@districorr.com.ar", "logistica@districorr.com.ar", "auxiliardeposito@districorr.com.ar"];

    const today = new Date();
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    // Consultar cirugías pendientes de los últimos 60 días
    const { data: pendingFichasRaw } = await supabase
      .from('reportes')
      .select('id, id_cirugia, paciente, medico, lugar_cirugia, fecha_cirugia, estado, instrumentador, instrumentador_completado')
      .eq('estado', 'Pendiente')
      .gte('fecha_cirugia', sixtyDaysAgo.toISOString().split('T')[0])
      .order('fecha_cirugia', { ascending: false });

    const pendingFichas = pendingFichasRaw || [];
    const pendingIds = pendingFichas.map(s => s.id).filter(Boolean);

    let anomalias = [];
    if (pendingIds.length > 0) {
      const [controlesRes, movimientosRes] = await Promise.all([
        supabase
          .from('logistica_controles')
          .select('cirugia_id, estado, observaciones, created_at, fecha_retiro')
          .in('cirugia_id', pendingIds),
        supabase
          .from('logistica_informe_movimientos')
          .select('reporte_id, tipo_movimiento, cantidad_cajas, cantidad_bultos, destino, observaciones')
          .in('reporte_id', pendingIds)
      ]);

      const ctrlMap = new Map();
      if (controlesRes.data) {
        controlesRes.data.forEach(c => ctrlMap.set(String(c.cirugia_id), c));
      }

      const movMap = new Map();
      if (movimientosRes.data) {
        movimientosRes.data.forEach(m => {
          if (!movMap.has(String(m.reporte_id))) {
            movMap.set(String(m.reporte_id), []);
          }
          movMap.get(String(m.reporte_id)).push(m);
        });
      }

      anomalias = pendingFichas
        .filter(s => {
          const hasCtrl = ctrlMap.has(String(s.id));
          const movs = movMap.get(String(s.id)) || [];
          const hasEntrega = movs.some(m => m.tipo_movimiento === 'Entrega de cajas');
          const hasRetiro = movs.some(m => ['Retiro de cajas', 'Traslado a Central'].includes(m.tipo_movimiento));
          return hasCtrl || (hasEntrega && hasRetiro);
        })
        .map(s => {
          const ctrl = ctrlMap.get(String(s.id));
          const rawEst = (ctrl?.estado || '').toLowerCase().trim();
          const d = new Date(`${String(s.fecha_cirugia).split('T')[0]}T00:00:00`);
          const dias = !isNaN(d.getTime())
            ? Math.max(0, Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

          return {
            ...s,
            dias_antiguedad: dias,
            tiene_control: Boolean(ctrl),
            control_estado: rawEst || (ctrl ? 'ok' : 'retiro_chofer'),
            control_observaciones: ctrl?.observaciones || ''
          };
        });
    }

    const formatDateOnly = (dateStr) => {
      if (!dateStr) return '-';
      const clean = String(dateStr).split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    };

    const fechaHoyStr = formatDateOnly(today.toISOString());
    const appBaseUrl = window.location.origin;
    const resumenOperativoUrl = `${appBaseUrl}/admin/resumen-operativo`;

    const rowsHtml = anomalias.map((s, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#faf5ff';
      const num = String(idx + 1).padStart(2, '0');
      const fechaCx = formatDateOnly(s.fecha_cirugia);
      const nombreInst = s.instrumentador || s.instrumentador_completado;

      let badgeControl = '';
      if (s.control_estado === 'ok') {
        badgeControl = `<div><strong style="color:#059669;font-size:11px;">🟢 Control OK (Devolución)</strong></div>`;
      } else if (s.control_estado === 'problemas') {
        badgeControl = `<div><span style="color:#dc2626;font-weight:800;background:#fee2e2;padding:2px 6px;border-radius:4px;font-size:10px;">🔴 Con Problemas</span></div>`;
      } else if (s.control_estado === 'revision') {
        badgeControl = `<div><span style="color:#b45309;font-weight:800;background:#fef3c7;padding:2px 6px;border-radius:4px;font-size:10px;">⚠️ En Revisión</span></div>`;
      } else {
        badgeControl = `<div><span style="color:#2563eb;font-weight:700;background:#eff6ff;padding:2px 6px;border-radius:4px;font-size:10px;">📦 Retirada por Chofer</span></div>`;
      }

      if (s.control_observaciones) {
        badgeControl += `<div style="font-size:9px;color:#7e22ce;margin-top:2px;">Obs: ${s.control_observaciones}</div>`;
      }

      const badgeTecnico = nombreInst
        ? `<div><strong style="color:#334155;font-size:11px;">${nombreInst}</strong></div><div style="font-size:9px;color:#d97706;font-weight:700;">⚠️ Ficha no completada</div>`
        : `<span style="color:#7e22ce;font-weight:800;background:#f3e8ff;padding:2px 6px;border-radius:4px;font-size:10px;">❓ No identificado</span>`;

      return `
        <tr bgcolor="${bg}">
          <td align="center" style="padding:10px 6px;border-bottom:1px solid #f3e8ff;font-size:10px;color:#a855f7;font-weight:700;">${num}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            <div style="font-size:11px;font-weight:800;color:#0f172a;">${s.paciente || 'Sin especificar'}</div>
            <div style="font-size:10px;color:#64748b;margin-top:1px;">Cx: ${fechaCx} · ${s.lugar_cirugia || 'Sanatorio sin especificar'}</div>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;font-size:11px;color:#334155;font-weight:600;">
            ${s.medico || '—'}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            ${badgeControl}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            ${badgeTecnico}
          </td>
          <td align="center" style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            <a href="${resumenOperativoUrl}" target="_blank" style="display:inline-block;padding:6px 12px;background:#7e22ce;color:#ffffff;font-size:10px;font-weight:800;text-decoration:none;border-radius:6px;">
              Resolver ➔
            </a>
          </td>
        </tr>
      `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Cajas Devueltas sin Ficha (Prueba)</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f5f3ff;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f3ff;padding:20px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e9d5ff;">
                <tr><td height="4" style="background:#7e22ce;"></td></tr>
                
                <!-- Header -->
                <tr>
                  <td style="padding:24px 28px;border-bottom:1px solid #f3e8ff;">
                    <div style="font-size:12px;font-weight:800;color:#7e22ce;letter-spacing:0.5px;">DISTRICORR · GESTIÓN IQ · TRAZABILIDAD LOGÍSTICA</div>
                    <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#581c87;">Reporte de Cajas Devueltas sin Ficha (Prueba)</h1>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#6b21a8;">
                      Cirugías con ciclo logístico completado pero en estado <strong>Pendiente</strong> · Emitido el ${fechaHoyStr}
                    </p>
                  </td>
                </tr>

                <!-- Tarjetas de Resumen -->
                <tr>
                  <td style="padding:20px 28px;background:#faf5ff;border-bottom:1px solid #e9d5ff;">
                    <div style="text-align:center;">
                      <span style="font-size:24px;font-weight:900;color:#7e22ce;">${anomalias.length}</span>
                      <span style="font-size:12px;font-weight:700;color:#581c87;margin-left:6px;">Cirugías detectadas con cajas devueltas sin ficha</span>
                    </div>

                    <div style="margin-top:16px;text-align:center;">
                      <a href="${resumenOperativoUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#7e22ce;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 12px rgba(126,34,206,0.25);">
                        📦 Abrir Resumen Operativo para Identificar y Regularizar
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- TABLA -->
                <tr>
                  <td style="padding:20px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e9d5ff;border-radius:8px;overflow:hidden;">
                      <thead>
                        <tr bgcolor="#581c87" style="color:#ffffff;font-size:9px;text-transform:uppercase;">
                          <th style="padding:8px 6px;text-align:center;">#</th>
                          <th style="padding:8px;text-align:left;">Paciente / Sanatorio</th>
                          <th style="padding:8px;text-align:left;">Médico</th>
                          <th style="padding:8px;text-align:left;">📦 Control Devolución</th>
                          <th style="padding:8px;text-align:left;">Técnico / Ficha</th>
                          <th style="padding:8px;text-align:center;">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rowsHtml || '<tr><td colspan="6" align="center" style="padding:15px;font-size:11px;color:#94a3b8;">¡Excelente! No hay cirugías con cajas devueltas pendientes de ficha.</td></tr>'}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:14px 28px;background:#1e1b4b;color:#c7d2fe;font-size:10px;text-align:center;">
                    DISTRICORR · Gestión IQ — Reporte Automático de Trazabilidad Logística (Prueba).
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const resendResp = await sendEmailWithResend({
      to: targetEmails,
      subject: `📦 Reporte de Cajas Devueltas sin Ficha (Prueba - ${fechaHoyStr}) · ${anomalias.length} detectadas`,
      html: emailHtml
    });

    if (!resendResp || (!resendResp.success && !resendResp.id)) {
      throw new Error(resendResp?.message || 'Error al enviar correo vía Resend.');
    }

    toast.success("Prueba de alerta de cajas devueltas enviada con éxito.");
  } catch (err) {
    console.error("Error al probar reporte de cajas devueltas:", err);
    toast.error("Error en envío de prueba: " + err.message);
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
</style>
