<!-- src/views/logistica/LogisticaDetalleInformeView.vue -->
<template>
  <div class="space-y-5 text-slate-800 dark:text-slate-100 font-sans max-w-4xl mx-auto">
    <!-- Barra de Navegación e Impresión / Email HTML -->
    <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <router-link :to="{ name: 'LogisticaHistorial' }" class="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span>Volver al Historial</span>
      </router-link>

      <div class="flex items-center gap-2">
        <!-- BOTÓN EDITAR INFORME -->
        <router-link 
          v-if="informe"
          :to="{ name: 'LogisticaNuevoInforme', query: { id: informe.id } }"
          class="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
          title="Editar datos, movimientos u observaciones de este informe"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          <span>✏️ Editar Informe</span>
        </router-link>

        <button 
          type="button" 
          @click="showEmailModal = true"
          class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          title="Enviar por correo con destinatarios oficiales de Districorr o copiar emails/tabla"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>📧 Enviar por Correo</span>
        </button>

        <button 
          type="button" 
          @click="copyDirectToEmailClipboard"
          class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          title="Copiar directamente la tabla formateada para pegar en Outlook o Gmail"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          <span>📋 Copiar Tabla</span>
        </button>

        <button 
          type="button" 
          @click="printReport"
          class="px-3.5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          <span>🖨️ Imprimir / PDF</span>
        </button>
      </div>
    </div>

    <!-- Contenedor del Informe en Pantalla e Imprimible -->
    <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
      Cargando detalle del informe...
    </div>

    <div v-else-if="!informe" class="py-12 text-center text-xs text-slate-400">
      No se encontró el informe solicitado.
    </div>

    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
      
      <!-- ENCABEZADO DE IMPRESIÓN CON PRESENTACIÓN EJECUTIVA -->
      <div class="border-b-2 border-blue-600 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-black text-xl text-blue-600 dark:text-blue-400 tracking-tight">DISTRICORR — GESTIÓN IQ</span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 print:bg-gray-200 print:text-black">
              {{ informe.estado }}
            </span>
          </div>
          <h1 class="text-base font-extrabold text-slate-900 dark:text-white mt-1 print:text-black">
            Informe Diario de Logística Operativa
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 print:text-gray-600">
            Fecha de Jornada: <strong>{{ formatDate(informe.fecha) }}</strong> | Zona: <strong>{{ informe.zona || 'Formosa' }}</strong>
          </p>
        </div>

        <div class="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 space-y-0.5 print:text-gray-600">
          <p><strong>Responsable:</strong> {{ informe.responsable_nombre }}</p>
          <p v-if="informe.enviado_at"><strong>Enviado:</strong> {{ formatDateTime(informe.enviado_at) }}</p>
        </div>
      </div>

      <!-- Resumen de Contadores / Métricas Imprimibles -->
      <div class="grid grid-cols-4 gap-3 text-center print:border print:border-gray-300 print:rounded-lg print:p-2">
        <div class="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700 print:border-none">
          <span class="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-600">Movimientos</span>
          <span class="text-base font-extrabold text-slate-800 dark:text-slate-100 print:text-black">{{ movimientos.length }}</span>
        </div>

        <div class="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700 print:border-none">
          <span class="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-600">Cajas y Equipos</span>
          <span class="text-base font-extrabold text-slate-800 dark:text-slate-100 print:text-black">{{ totalCajas }}</span>
        </div>

        <div class="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700 print:border-none">
          <span class="text-[10px] text-slate-400 font-bold uppercase block print:text-gray-600">Contenedores</span>
          <span class="text-base font-extrabold text-slate-800 dark:text-slate-100 print:text-black">{{ totalBultos }}</span>
        </div>

        <div class="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 print:border-none">
          <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block print:text-amber-900">Pendientes</span>
          <span class="text-base font-extrabold text-amber-800 dark:text-amber-300 print:text-amber-900">{{ totalPendientes }}</span>
        </div>
      </div>

      <!-- Observación General -->
      <div v-if="informe.observacion_general" class="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1 print:border-gray-300">
        <span class="font-bold text-slate-700 dark:text-slate-300 block print:text-black">Observación General de la Jornada:</span>
        <p class="text-slate-600 dark:text-slate-400 italic print:text-gray-800">{{ informe.observacion_general }}</p>
      </div>

      <!-- Tabla Imprimible de Movimientos (Impresión Impecable) -->
      <div class="space-y-3 print:space-y-2">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-800">
          Detalle de Movimientos Registrados
        </h3>

        <!-- Formato Tabla Limpia para Impresión y Pantalla -->
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-700 print:border-gray-400">
            <thead>
              <tr class="bg-slate-900 text-white dark:bg-slate-800 print:bg-gray-200 print:text-black font-bold">
                <th class="p-2 border border-slate-700 print:border-gray-400 w-8 text-center">#</th>
                <th class="p-2 border border-slate-700 print:border-gray-400 w-32">Tipo / Cirugía</th>
                <th class="p-2 border border-slate-700 print:border-gray-400">Paciente / Cliente</th>
                <th class="p-2 border border-slate-700 print:border-gray-400">Institución / Médico</th>
                <th class="p-2 border border-slate-700 print:border-gray-400">Observaciones / Novedad</th>
                <th class="p-2 border border-slate-700 print:border-gray-400 w-12 text-center">Cajas</th>
                <th class="p-2 border border-slate-700 print:border-gray-400 w-12 text-center">Bultos</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(mov, idx) in movimientos" 
                :key="mov.id"
                :class="[idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/80 dark:bg-slate-800/50', 'print:bg-white']"
              >
                <td class="p-2 border border-slate-200 dark:border-slate-800 print:border-gray-300 text-center font-bold text-slate-400 print:text-black">
                  {{ idx + 1 }}
                </td>

                <td class="p-2 border border-slate-200 dark:border-slate-800 print:border-gray-300 vertical-top">
                  <span class="font-bold text-blue-600 dark:text-blue-400 block print:text-black">{{ mov.tipo_movimiento }}</span>
                  <span v-if="mov.id_cirugia_snapshot" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold inline-block mt-0.5 print:bg-gray-100 print:text-black">
                    {{ mov.id_cirugia_snapshot }}
                  </span>
                </td>

                <td class="p-2 border border-slate-200 dark:border-slate-800 print:border-gray-300 vertical-top">
                  <span class="font-bold text-slate-900 dark:text-white block print:text-black">{{ mov.paciente_snapshot || mov.destino || 'Sin especificar' }}</span>
                  <span v-if="mov.cliente_snapshot" class="text-[11px] text-slate-500 block mt-0.5 print:text-gray-600">🏢 {{ mov.cliente_snapshot }}</span>
                </td>

                <td class="p-2 border border-slate-200 dark:border-slate-800 print:border-gray-300 vertical-top text-slate-700 dark:text-slate-300 print:text-black">
                  <span v-if="mov.institucion_snapshot" class="font-semibold block">🏥 {{ mov.institucion_snapshot }}</span>
                  <span v-if="mov.medico_snapshot" class="text-slate-500 block mt-0.5 print:text-gray-600">👨‍⚕️ {{ mov.medico_snapshot }}</span>
                </td>

                <td class="p-2 border border-slate-200 dark:border-slate-800 print:border-gray-300 vertical-top">
                  <span v-if="mov.observaciones" class="italic text-slate-600 dark:text-slate-400 block print:text-gray-800">
                    💬 {{ mov.observaciones }}
                  </span>
                  <span v-else-if="!mov.tiene_pendiente" class="text-slate-400 italic text-[11px]">Sin notas</span>

                  <div v-if="mov.tiene_pendiente" class="mt-1 p-1 px-2 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-900/50 text-[11px] font-bold text-amber-900 dark:text-amber-300 print:bg-yellow-50 print:text-black">
                    ⚠️ Pendiente: {{ mov.detalle_pendiente }}
                  </div>
                </td>

                <td class="p-2 border border-slate-200 dark:border-slate-800 print:border-gray-300 text-center font-mono font-bold text-slate-900 dark:text-white print:text-black">
                  {{ mov.cantidad_cajas || 0 }}
                </td>

                <td class="p-2 border border-slate-200 dark:border-slate-800 print:border-gray-300 text-center font-mono font-bold text-slate-900 dark:text-white print:text-black">
                  {{ mov.cantidad_bultos || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pie de Página de Firma y Validación de Impresión -->
      <div class="pt-8 grid grid-cols-2 gap-8 border-t border-slate-200 dark:border-slate-700 print:border-gray-400">
        <div class="text-center space-y-1">
          <div class="border-b border-slate-400 w-48 mx-auto pb-8"></div>
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 block print:text-black">Firma Responsable de Logística</span>
          <span class="text-[10px] text-slate-400 block">{{ informe.responsable_nombre }}</span>
        </div>

        <div class="text-center space-y-1">
          <div class="border-b border-slate-400 w-48 mx-auto pb-8"></div>
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 block print:text-black">Firma Recepción / Administración</span>
          <span class="text-[10px] text-slate-400 block">Districorr — Gestión IQ</span>
        </div>
      </div>

      <!-- Pie legal -->
      <div class="text-[10px] text-slate-400 text-center print:text-gray-500">
        Documento interno oficial generado por el módulo de Logística de Gestión IQ — Districorr.
      </div>
    </div>

    <!-- Modal de Envió por Correo / Copiar Emails Oficiales -->
    <EmailReporteModal 
      :show="showEmailModal"
      :informe="informe"
      :stats="detailStats"
      :movimientos="movimientos"
      :htmlTableProvider="copyDirectToEmailClipboard"
      @close="showEmailModal = false"
      @copy-table="copyDirectToEmailClipboard"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import EmailReporteModal from '../../components/logistica/EmailReporteModal.vue';

const route = useRoute();
const toast = useToast();
const loading = ref(true);
const showEmailModal = ref(false);

const informe = ref(null);
const movimientos = ref([]);

const totalCajas = computed(() => movimientos.value.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0));
const totalBultos = computed(() => movimientos.value.reduce((sum, m) => sum + (m.cantidad_bultos || 0), 0));
const totalPendientes = computed(() => movimientos.value.filter(m => m.tiene_pendiente).length);

const detailStats = computed(() => ({
  totalMovimientos: movimientos.value.length,
  totalCajas: totalCajas.value,
  totalBultos: totalBultos.value,
  totalPendientes: totalPendientes.value
}));

const fetchInformeDetalle = async () => {
  try {
    loading.value = true;
    const informeId = route.params.id;

    const { data: inf, error: infErr } = await supabase
      .from('logistica_informes_diarios')
      .select('*')
      .eq('id', informeId)
      .single();

    if (infErr) throw infErr;
    informe.value = inf;

    const { data: movs, error: movsErr } = await supabase
      .from('logistica_informe_movimientos')
      .select('*')
      .eq('informe_id', informeId)
      .order('orden', { ascending: true });

    if (movsErr) throw movsErr;
    movimientos.value = movs || [];
  } catch (err) {
    toast.error('Error al cargar detalle del informe: ' + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInformeDetalle);

const printReport = () => {
  window.print();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const generateEmailTableHtml = (inf, movsList) => {
  const cajas = movsList.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0);
  const bultos = movsList.reduce((sum, m) => sum + (m.cantidad_bultos || 0), 0);
  const pendientes = movsList.filter(m => m.tiene_pendiente).length;

  const rows = movsList.map((mov, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const idCirugiaBadge = mov.id_cirugia_snapshot 
      ? `<span style="display: inline-block; margin-top: 3px; font-family: monospace; font-size: 9px; background-color: #e2e8f0; color: #1e293b; padding: 2px 4px; border-radius: 3px; font-weight: bold;">${mov.id_cirugia_snapshot}</span>` 
      : '';
    const clienteSpan = mov.cliente_snapshot ? `<span style="font-size: 9.5px; color: #64748b; display: block; margin-top: 2px;">🏢 ${mov.cliente_snapshot}</span>` : '';
    const instSpan = mov.institucion_snapshot ? `<span style="display: block; font-weight: bold; color: #0f172a; font-size: 10px;">🏥 ${mov.institucion_snapshot}</span>` : '';
    const medSpan = mov.medico_snapshot ? `<span style="display: block; color: #475569; margin-top: 2px; font-size: 9.5px;">👨‍⚕️ ${mov.medico_snapshot}</span>` : '';
    
    let obsHtml = mov.observaciones 
      ? `<span style="display: block; font-style: italic; color: #475569; font-size: 9.5px;">💬 ${mov.observaciones}</span>` 
      : (!mov.tiene_pendiente ? `<span style="color: #94a3b8; font-style: italic; font-size: 9px;">Sin notas</span>` : '');
    
    if (mov.tiene_pendiente) {
      obsHtml += `<div style="margin-top: 4px; background-color: #fef3c7; border: 1px solid #fcd34d; color: #92400e; padding: 3px 5px; border-radius: 3px; font-weight: bold; font-size: 9px;">⚠️ Pendiente: ${mov.detalle_pendiente || ''}</div>`;
    }

    return `
      <tr style="background-color: ${bg};">
        <td style="border: 1px solid #cbd5e1; padding: 6px 3px; text-align: center; font-weight: bold; color: #475569; font-size: 10px;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; word-break: break-word;">
          <strong style="color: #1d4ed8; font-size: 10.5px; display: block;">${mov.tipo_movimiento || ''}</strong>
          ${idCirugiaBadge}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; word-break: break-word;">
          <strong style="color: #0f172a; font-size: 10.5px; display: block;">${mov.paciente_snapshot || mov.destino || 'Sin especificar'}</strong>
          ${clienteSpan}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; color: #334155; word-break: break-word;">
          ${instSpan}
          ${medSpan}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; color: #334155; word-break: break-word;">
          ${obsHtml}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-weight: bold; font-family: monospace; font-size: 11px; color: #0f172a;">${mov.cantidad_cajas || 0}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-weight: bold; font-family: monospace; font-size: 11px; color: #0f172a;">${mov.cantidad_bultos || 0}</td>
      </tr>
    `;
  }).join('');

  const obsGenHtml = inf?.observacion_general 
    ? `<div style="background-color: #eff6ff; padding: 8px 10px; border-radius: 5px; border-left: 4px solid #2563eb; margin-bottom: 12px; font-family: Arial, sans-serif;">
        <strong style="color: #1e40af; font-size: 10.5px;">Observación General de la Jornada:</strong>
        <p style="margin: 2px 0 0 0; color: #334155; font-size: 10.5px; font-style: italic;">${inf.observacion_general}</p>
       </div>`
    : '';

  return `
    <div style="background-color: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: Arial, Helvetica, sans-serif; color: #1e293b; width: 660px; max-width: 660px; margin: 0 auto;">
      <table width="636" cellpadding="0" cellspacing="0" border="0" style="width: 636px; margin-bottom: 12px; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">
        <tr>
          <td valign="top">
            <span style="font-size: 15px; font-weight: bold; color: #2563eb; font-family: Arial, sans-serif;">DISTRICORR — GESTIÓN IQ</span><br/>
            <span style="font-size: 13px; font-weight: bold; color: #0f172a; font-family: Arial, sans-serif; display: block; margin-top: 1px;">Informe Diario de Logística</span>
            <span style="font-size: 10.5px; color: #64748b; font-family: Arial, sans-serif; display: block; margin-top: 3px;">
              Fecha: <strong style="color: #0f172a;">${formatDate(inf?.fecha)}</strong> &nbsp;|&nbsp; Zona: <strong style="color: #0f172a;">${inf?.zona || 'Formosa'}</strong> &nbsp;|&nbsp; Resp: <strong style="color: #0f172a;">${inf?.responsable_nombre || ''}</strong>
            </span>
          </td>
          <td align="right" valign="top" style="text-align: right;">
            <span style="background-color: #dcfce7; color: #166534; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 10px; border: 1px solid #86efac; font-family: Arial, sans-serif;">
              ENVIADO
            </span>
          </td>
        </tr>
      </table>

      <table width="636" cellpadding="6" cellspacing="0" border="1" style="width: 636px; margin-bottom: 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-collapse: collapse; text-align: center; font-family: Arial, sans-serif; font-size: 10px;">
        <tr style="background-color: #f1f5f9;">
          <td width="25%" style="border: 1px solid #cbd5e1; padding: 6px;">
            <span style="font-size: 9.5px; color: #475569; font-weight: bold; text-transform: uppercase;">MOVIMIENTOS</span><br/>
            <strong style="font-size: 14px; color: #0f172a;">${movsList.length}</strong>
          </td>
          <td width="25%" style="border: 1px solid #cbd5e1; padding: 6px;">
            <span style="font-size: 9.5px; color: #475569; font-weight: bold; text-transform: uppercase;">TOTAL CAJAS</span><br/>
            <strong style="font-size: 14px; color: #0f172a;">${cajas}</strong>
          </td>
          <td width="25%" style="border: 1px solid #cbd5e1; padding: 6px;">
            <span style="font-size: 9.5px; color: #475569; font-weight: bold; text-transform: uppercase;">TOTAL BULTOS</span><br/>
            <strong style="font-size: 14px; color: #0f172a;">${bultos}</strong>
          </td>
          <td width="25%" style="border: 1px solid #cbd5e1; padding: 6px; background-color: #fef3c7;">
            <span style="font-size: 9.5px; color: #92400e; font-weight: bold; text-transform: uppercase;">PENDIENTES</span><br/>
            <strong style="font-size: 14px; color: #b45309;">${pendientes}</strong>
          </td>
        </tr>
      </table>

      ${obsGenHtml}

      <table width="636" cellpadding="6" cellspacing="0" border="1" style="width: 636px; background-color: #ffffff; border: 1px solid #cbd5e1; font-size: 10.5px; border-collapse: collapse; font-family: Arial, sans-serif; table-layout: fixed;">
        <thead>
          <tr style="background-color: #1e293b; color: #ffffff; text-align: left;">
            <th width="24" style="border: 1px solid #0f172a; padding: 6px 3px; text-align: center; color: #ffffff; font-size: 10px;">#</th>
            <th width="125" style="border: 1px solid #0f172a; padding: 6px; color: #ffffff; font-size: 10px;">Tipo / Cirugía</th>
            <th width="140" style="border: 1px solid #0f172a; padding: 6px; color: #ffffff; font-size: 10px;">Paciente / Cliente</th>
            <th width="140" style="border: 1px solid #0f172a; padding: 6px; color: #ffffff; font-size: 10px;">Institución / Médico</th>
            <th width="135" style="border: 1px solid #0f172a; padding: 6px; color: #ffffff; font-size: 10px;">Observaciones / Novedad</th>
            <th width="36" style="border: 1px solid #0f172a; padding: 6px 2px; text-align: center; color: #ffffff; font-size: 9.5px;">Cajas</th>
            <th width="36" style="border: 1px solid #0f172a; padding: 6px 2px; text-align: center; color: #ffffff; font-size: 9.5px;">Bultos</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <p style="font-size: 9px; color: #94a3b8; margin-top: 12px; text-align: center; font-family: Arial, sans-serif;">
        Documento interno oficial generado por el módulo de Logística de Gestión IQ — Districorr.
      </p>
    </div>
  `;
};

const copyDirectToEmailClipboard = async () => {
  try {
    if (!informe.value) return;

    const htmlString = generateEmailTableHtml(informe.value, movimientos.value);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const plainText = tempDiv.innerText || tempDiv.textContent || '';

    const htmlBlob = new Blob([htmlString], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });

    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });

    await navigator.clipboard.write([item]);

    toast.success('📋 ¡Tabla copiada al portapapeles! Lista para pegar directamente en Outlook o Gmail.');
  } catch (err) {
    console.error(err);
    toast.error('No se pudo copiar la tabla: ' + err.message);
  }
};
</script>
