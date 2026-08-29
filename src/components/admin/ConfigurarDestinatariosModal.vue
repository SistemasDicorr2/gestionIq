<!-- src/components/admin/ConfigurarDestinatariosModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
      
      <!-- Encabezado Modal -->
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span class="text-xs font-black uppercase text-blue-600 dark:text-blue-400">CONFIGURACIÓN AUTOMÁTICA</span>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">
            Destinatarios del Reporte Semanal (Jueves 15 hs)
          </h3>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xl font-bold">
          ✕
        </button>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        Las direcciones listadas a continuación recibirán automáticamente el reporte ejecutivo por correo con el enlace al lote inmutable de fichas cada jueves a las 15:00 hs.
      </p>

      <!-- Estado de Carga -->
      <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
        Cargando configuración de destinatarios...
      </div>

      <div v-else class="space-y-4">
        <!-- Agregar Nuevo Email -->
        <form @submit.prevent="addEmail" class="flex gap-2">
          <input 
            v-model="newEmail" 
            type="email" 
            placeholder="ejemplo@districorr.com.ar" 
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
        <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
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

      <!-- Acciones del Modal -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button 
          type="button" 
          @click="testReporteEmail" 
          :disabled="testing || loading"
          class="w-full sm:w-auto px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-50 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span v-if="testing" class="animate-spin text-xs">🌀</span>
          <span v-else>🧪</span>
          <span>{{ testing ? 'Enviando prueba...' : 'Probar reporte con el correo' }}</span>
        </button>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button @click="$emit('close')" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
            Cancelar
          </button>
          <button 
            @click="saveConfig" 
            :disabled="saving || loading"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
          >
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
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

const fetchConfig = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_destinatarios')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (data && Array.isArray(data.value)) {
      emailList.value = [...data.value];
    } else {
      emailList.value = ["sistemas@districorr.com.ar", "contable@districorr.com.ar", "auxiliardeposito@districorr.com.ar"];
    }
  } catch (err) {
    toast.error("Error al cargar destinatarios: " + err.message);
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
    const { error } = await supabase
      .from('resumen_operativo_config')
      .upsert({
        key: 'emails_destinatarios',
        value: emailList.value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    toast.success("Lista de destinatarios actualizada correctamente.");
    emit('close');
  } catch (err) {
    toast.error("Error al guardar destinatarios: " + err.message);
  } finally {
    saving.value = false;
  }
};

const testReporteEmail = async () => {
  try {
    testing.value = true;
    toast.info("Generando lote e invocando envío de prueba...");

    // 1. Guardar destinatarios actualizados
    await saveConfig();

    const targetEmails = emailList.value.length > 0 
      ? emailList.value 
      : ["sistemas@districorr.com.ar", "contable@districorr.com.ar", "auxiliardeposito@districorr.com.ar"];

    // 2. Calcular período del Sábado anterior hasta el momento actual
    const now = new Date();
    const artNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const currentDay = artNow.getUTCDay();
    const daysSinceSaturday = (currentDay + 1) % 7;
    const saturdayDate = new Date(artNow);
    saturdayDate.setUTCDate(artNow.getUTCDate() - daysSinceSaturday);
    saturdayDate.setUTCHours(0, 0, 0, 0);

    const desdeIso = new Date(saturdayDate.getTime() + 3 * 60 * 60 * 1000).toISOString();
    const hastaIso = now.toISOString();

    const year = saturdayDate.getUTCFullYear();
    const month = String(saturdayDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(saturdayDate.getUTCDate()).padStart(2, '0');
    const semanaKey = `TEST_${year}-${month}-${day}_${Date.now()}`;

    // 3. Generar lote inmutable en la base de datos vía RPC
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('generar_o_consultar_lote_semanal', {
      p_desde: desdeIso,
      p_hasta: hastaIso,
      p_semana_key: semanaKey
    });

    if (rpcErr) throw rpcErr;
    const token = rpcResult.token;

    // 4. Armar el HTML del correo e invocar el servicio unificado de Resend
    const appBaseUrl = window.location.origin;
    const printLoteUrl = `${appBaseUrl}/resumen-operativo/lote/${token}`;

    const { data: loteDetalle } = await supabase.rpc('obtener_lote_por_token', { p_token: token });
    const fichas = loteDetalle?.fichas || [];
    const stats = rpcResult.stats || {};

    const fechaDesdeStr = `${String(saturdayDate.getUTCDate()).padStart(2, '0')}/${String(saturdayDate.getUTCMonth() + 1).padStart(2, '0')}/${saturdayDate.getUTCFullYear()}`;
    const fechaHastaStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const fichasRowsHtml = fichas.map((f, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const num = String(idx + 1).padStart(2, '0');
      return `
        <tr bgcolor="${bg}">
          <td align="center" style="padding:10px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#94a3b8;font-weight:700;">${num}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#0f172a;">${f.paciente || 'Sin especificar'}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#334155;">${f.medico || '-'}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#334155;">${f.lugar_cirugia || '-'}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#475569;">${f.instrumentador || '-'}</td>
        </tr>
      `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Resumen Operativo Semanal</title></head>
      <body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2f7;padding:20px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dfe6ef;">
                <tr><td height="4" style="background:#2563eb;"></td></tr>
                <tr>
                  <td style="padding:24px 28px;border-bottom:1px solid #f1f5f9;">
                    <div style="font-size:12px;font-weight:800;color:#2563eb;letter-spacing:0.5px;">DISTRICORR · GESTIÓN IQ</div>
                    <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#0f172a;">Resumen Operativo Semanal de Fichas (Prueba)</h1>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">
                      Período: <strong>${fechaDesdeStr} 00:00 hs</strong> al <strong>${fechaHastaStr} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} hs</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 28px;background:#f8fafc;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="33%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:22px;font-weight:800;color:#2563eb;">${stats.total_fichas || 0}</div>
                          <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">FICHAS ENVIADAS</div>
                        </td>
                        <td width="5"></td>
                        <td width="33%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:22px;font-weight:800;color:#4f46e5;">${stats.total_instrumentadores || 0}</div>
                          <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">INSTRUMENTADORES</div>
                        </td>
                        <td width="5"></td>
                        <td width="33%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:22px;font-weight:800;color:#059669;">${stats.total_instituciones || 0}</div>
                          <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">INSTITUCIONES</div>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:20px;text-align:center;">
                      <a href="${printLoteUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background-color:#2563eb;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        📄 Abrir e Imprimir Todas las Fichas (PDF)
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 28px;">
                    <div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:10px;">Detalle de Fichas del Lote Inmutable</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                      <thead>
                        <tr bgcolor="#142033" style="color:#ffffff;font-size:9px;text-transform:uppercase;">
                          <th style="padding:8px 6px;text-align:center;">#</th>
                          <th style="padding:8px;text-align:left;">Paciente</th>
                          <th style="padding:8px;text-align:left;">Médico</th>
                          <th style="padding:8px;text-align:left;">Institución</th>
                          <th style="padding:8px;text-align:left;">Instrumentador</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${fichasRowsHtml || '<tr><td colspan="5" align="center" style="padding:15px;font-size:11px;color:#94a3b8;">No se registraron fichas enviadas en este período.</td></tr>'}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 28px;background:#0f172a;color:#94a3b8;font-size:10px;text-align:center;">
                    DISTRICORR · Gestión IQ — Reporte Automático Semanal.
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
      subject: `📋 Resumen Operativo Semanal (Prueba - ${fechaDesdeStr} al ${fechaHastaStr})`,
      html: emailHtml
    });

    if (!resendResp || (!resendResp.success && !resendResp.id)) {
      throw new Error(resendResp?.message || 'Error al enviar correo vía Resend.');
    }

    toast.success(`Prueba enviada con éxito. Token de lote: ${token}`);
  } catch (err) {
    console.error("Error al probar reporte por correo:", err);
    toast.error("Error en envío de prueba: " + err.message);
  } finally {
    testing.value = false;
  }
};
</script>
