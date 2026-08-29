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

    <!-- Modal de Envió por Correo / Copiar Emails Oficiales / Prueba Resend -->
    <EmailReporteModal 
      :show="showEmailModal"
      :informe="informe"
      :stats="detailStats"
      :movimientos="movimientos"
      :htmlTableProvider="copyDirectToEmailClipboard"
      :getHtmlContent="() => generateEmailTableHtml(informe, movimientos)"
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
  const fechaStr = formatDate(inf?.fecha);
  const zonaStr = inf?.zona || 'Formosa Capital';
  const responsableStr = inf?.responsable_nombre || 'Logística';
  const enviadoTimeStr = inf?.enviado_at ? formatDateTime(inf.enviado_at) : formatDateTime(new Date().toISOString());

  const desktopRows = movsList.map((mov, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const numIdx = String(idx + 1).padStart(2, '0');
    const idCirugiaBadge = mov.id_cirugia_snapshot 
      ? `<div style="margin-top:5px;"><span style="display:inline-block;padding:3px 6px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:5px;font-family:Consolas,monospace;font-size:8px;line-height:10px;font-weight:700;color:#475569;">${mov.id_cirugia_snapshot}</span></div>` 
      : '';
    const clienteSpan = mov.cliente_snapshot ? `<div style="margin-top:4px;font-size:9px;line-height:13px;color:#64748b;">${mov.cliente_snapshot}</div>` : '';
    const instSpan = mov.institucion_snapshot ? `<div style="font-size:10px;line-height:14px;font-weight:700;color:#334155;">${mov.institucion_snapshot}</div>` : '';
    const medSpan = mov.medico_snapshot ? `<div style="margin-top:5px;font-size:9px;line-height:13px;color:#64748b;">Médico · ${mov.medico_snapshot}</div>` : '';
    
    let obsCopy = mov.observaciones || (!mov.tiene_pendiente ? 'Sin notas' : '');
    let pendHtml = mov.tiene_pendiente 
      ? `<div style="margin-top:4px;background-color:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:3px 5px;border-radius:4px;font-weight:bold;font-size:9px;">⚠️ Pendiente: ${mov.detalle_pendiente || ''}</div>` 
      : '';

    return `
      <tr bgcolor="${bg}">
        <td align="center" valign="top" style="padding:12px 7px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#94a3b8;font-weight:700;">${numIdx}</td>
        <td valign="top" style="padding:12px 9px;border-bottom:1px solid #e2e8f0;">
          <div style="font-size:11px;line-height:15px;color:#2563eb;font-weight:700;">${mov.tipo_movimiento || ''}</div>
          ${idCirugiaBadge}
        </td>
        <td valign="top" style="padding:12px 9px;border-bottom:1px solid #e2e8f0;">
          <div style="font-size:11px;line-height:15px;font-weight:800;color:#0f172a;">${mov.paciente_snapshot || mov.destino || 'Sin especificar'}</div>
          ${clienteSpan}
        </td>
        <td valign="top" style="padding:12px 9px;border-bottom:1px solid #e2e8f0;">
          ${instSpan}
          ${medSpan}
        </td>
        <td valign="top" style="padding:12px 9px;border-bottom:1px solid #e2e8f0;">
          <div style="font-size:8px;line-height:11px;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.3px;">${mov.tipo_movimiento || ''}</div>
          <div style="margin-top:4px;font-size:10px;line-height:15px;color:#475569;">${obsCopy}</div>
          ${pendHtml}
        </td>
        <td align="center" valign="middle" style="padding:12px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#0f172a;">${mov.cantidad_cajas || 0}</td>
        <td align="center" valign="middle" style="padding:12px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#0f172a;">${mov.cantidad_bultos || 0}</td>
      </tr>
    `;
  }).join('');

  const mobileCards = movsList.map((mov, idx) => {
    const numIdx = String(idx + 1).padStart(2, '0');
    const idCirugiaPart = mov.id_cirugia_snapshot ? ` · ${mov.id_cirugia_snapshot}` : '';
    let obsCopy = mov.observaciones || (!mov.tiene_pendiente ? 'Sin notas' : '');
    let pendHtml = mov.tiene_pendiente 
      ? `<div style="margin-top:4px;background-color:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:3px 5px;border-radius:4px;font-weight:bold;font-size:9px;">⚠️ Pendiente: ${mov.detalle_pendiente || ''}</div>` 
      : '';

    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
             class="mobile-only mobile-record"
             style="border:1px solid #dbe3ee;border-radius:9px;background:#fff;margin-bottom:10px;">
        <tr>
          <td style="padding:12px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td valign="top">
                  <div style="font-size:9px;line-height:12px;color:#94a3b8;font-weight:700;">${numIdx}${idCirugiaPart}</div>
                  <div class="mobile-title" style="margin-top:2px;font-size:13px;line-height:17px;font-weight:800;color:#0f172a;">${mov.paciente_snapshot || mov.destino || 'Sin especificar'}</div>
                  ${mov.cliente_snapshot ? `<div style="margin-top:2px;font-size:10px;line-height:14px;color:#64748b;">${mov.cliente_snapshot}</div>` : ''}
                </td>
                <td align="right" valign="top">
                  <span style="display:inline-block;padding:4px 7px;border-radius:999px;background:#eff6ff;color:#2563eb;font-size:9px;line-height:11px;font-weight:700;">
                    ${mov.tipo_movimiento || ''}
                  </span>
                </td>
              </tr>
            </table>

            <div style="height:1px;background:#e2e8f0;margin:10px 0;"></div>

            <div style="font-size:10px;line-height:14px;font-weight:700;color:#334155;">${mov.institucion_snapshot || 'Sin especificar'}</div>
            ${mov.medico_snapshot ? `<div style="margin-top:2px;font-size:10px;line-height:14px;color:#64748b;">Médico · ${mov.medico_snapshot}</div>` : ''}

            <div style="margin-top:10px;font-size:9px;line-height:12px;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.3px;">
              ${mov.tipo_movimiento || ''}
            </div>
            <div class="mobile-copy" style="margin-top:3px;font-size:11px;line-height:16px;color:#475569;">
              ${obsCopy}
              ${pendHtml}
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                   style="margin-top:10px;background:#f8fafc;border-radius:7px;">
              <tr>
                <td style="padding:7px 9px;font-size:10px;color:#64748b;">Cajas <strong style="color:#0f172a;">${mov.cantidad_cajas || 0}</strong></td>
                <td align="right" style="padding:7px 9px;font-size:10px;color:#64748b;">Bultos <strong style="color:#0f172a;">${mov.cantidad_bultos || 0}</strong></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }).join('');

  const obsGenHtml = inf?.observacion_general 
    ? `
      <tr>
        <td class="px" style="padding:0 20px 12px 20px;">
          <div style="background-color:#eff6ff;padding:10px 12px;border-radius:8px;border-left:4px solid #2563eb;">
            <strong style="color:#1e40af;font-size:11px;">Observación General de la Jornada:</strong>
            <p style="margin:3px 0 0 0;color:#334155;font-size:11px;font-style:italic;">${inf.observacion_general}</p>
          </div>
        </td>
      </tr>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe Diario de Logística - DISTRICORR</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background: #eef2f7;
      font-family: Arial, Helvetica, sans-serif;
      color: #172033;
    }

    table { border-collapse: collapse; }

    .mobile-only { display: none; max-height: 0; overflow: hidden; mso-hide: all; }

    @media only screen and (max-width: 680px) {
      .email-shell {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }

      .px {
        padding-left: 14px !important;
        padding-right: 14px !important;
      }

      .header-left,
      .header-right {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
      }

      .header-right {
        padding-top: 8px !important;
      }

      .kpi-wrap {
        display: block !important;
        width: 100% !important;
      }

      .kpi-cell {
        width: 50% !important;
        display: inline-block !important;
        box-sizing: border-box !important;
        vertical-align: top !important;
        padding: 3px !important;
      }

      .desktop-table {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
      }

      .mobile-only {
        display: table !important;
        width: 100% !important;
        max-height: none !important;
        overflow: visible !important;
      }

      .mobile-record {
        width: 100% !important;
        margin-bottom: 10px !important;
      }

      .mobile-title {
        font-size: 14px !important;
        line-height: 18px !important;
      }

      .mobile-copy {
        font-size: 12px !important;
        line-height: 17px !important;
      }
    }
  </style>
</head>

<body>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#eef2f7">
  <tr>
    <td align="center" style="padding:18px 8px;">

      <table role="presentation"
             width="940"
             class="email-shell"
             cellspacing="0"
             cellpadding="0"
             border="0"
             bgcolor="#ffffff"
             style="
               width:940px;
               max-width:940px;
               background:#ffffff;
               border:1px solid #dfe6ef;
               border-radius:12px;
               overflow:hidden;
             ">

        <!-- ACENTO SUPERIOR -->
        <tr>
          <td style="height:4px;background:#2563eb;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- HEADER COMPACTO -->
        <tr>
          <td class="px" style="padding:16px 20px 12px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td valign="top" class="header-left" style="width:72%;">

                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="
                        font-size:16px;
                        line-height:18px;
                        font-weight:800;
                        color:#2563eb;
                        letter-spacing:-0.1px;
                      ">
                        DISTRICORR · GESTIÓN IQ
                      </td>
                      <td style="padding-left:8px;">
                        <span style="
                          display:inline-block;
                          padding:3px 7px;
                          border-radius:999px;
                          background:#dcfce7;
                          color:#166534;
                          font-size:9px;
                          line-height:11px;
                          font-weight:800;
                          letter-spacing:.35px;
                        ">
                          ENVIADO
                        </span>
                      </td>
                    </tr>
                  </table>

                  <div style="
                    margin-top:5px;
                    font-size:18px;
                    line-height:22px;
                    font-weight:800;
                    color:#0f172a;
                  ">
                    Informe Diario de Logística Operativa
                  </div>

                  <div style="
                    margin-top:4px;
                    font-size:11px;
                    line-height:16px;
                    color:#64748b;
                  ">
                    ${fechaStr} · <strong style="color:#334155;">${zonaStr}</strong>
                  </div>
                </td>

                <td valign="top"
                    align="right"
                    class="header-right"
                    style="width:28%;font-size:10px;line-height:15px;color:#64748b;">
                  <strong style="color:#334155;">Responsable:</strong> ${responsableStr}<br>
                  <strong style="color:#334155;">Enviado:</strong> ${enviadoTimeStr}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- RESUMEN COMPACTO -->
        <tr>
          <td class="px" style="padding:0 20px 12px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="kpi-wrap">
              <tr>

                <!-- Movimientos -->
                <td class="kpi-cell" width="25%" style="padding-right:4px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                    <tr>
                      <td style="padding:9px 10px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td valign="middle" style="padding-right:7px;">
                              <!-- Lucide: ArrowLeftRight -->
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M8 3L4 7L8 11" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M4 7H20" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
                                <path d="M16 21L20 17L16 13" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M20 17H4" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                            </td>
                            <td valign="middle">
                              <div style="font-size:18px;line-height:20px;font-weight:800;color:#0f172a;">${movsList.length}</div>
                              <div style="font-size:9px;line-height:11px;font-weight:700;color:#64748b;letter-spacing:.3px;">MOVIMIENTOS</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Cajas -->
                <td class="kpi-cell" width="25%" style="padding-left:2px;padding-right:2px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                    <tr>
                      <td style="padding:9px 10px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td valign="middle" style="padding-right:7px;">
                              <!-- Lucide: Package -->
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M21 16V8C21 7.3 20.6 6.65 20 6.3L13 2.3C12.4 1.95 11.6 1.95 11 2.3L4 6.3C3.4 6.65 3 7.3 3 8V16C3 16.7 3.4 17.35 4 17.7L11 21.7C11.6 22.05 12.4 22.05 13 21.7L20 17.7C20.6 17.35 21 16.7 21 16Z"
                                      stroke="#4f46e5" stroke-width="2" stroke-linejoin="round"/>
                                <path d="M3.3 7L12 12L20.7 7" stroke="#4f46e5" stroke-width="2" stroke-linejoin="round"/>
                                <path d="M12 22V12" stroke="#4f46e5" stroke-width="2"/>
                              </svg>
                            </td>
                            <td valign="middle">
                              <div style="font-size:18px;line-height:20px;font-weight:800;color:#0f172a;">${cajas}</div>
                              <div style="font-size:9px;line-height:11px;font-weight:700;color:#64748b;letter-spacing:.3px;">CAJAS / EQUIPOS</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Contenedores/Bultos -->
                <td class="kpi-cell" width="25%" style="padding-left:2px;padding-right:2px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                    <tr>
                      <td style="padding:9px 10px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td valign="middle" style="padding-right:7px;">
                              <!-- Lucide: Boxes -->
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M2.5 8.5L7 6L11.5 8.5L7 11L2.5 8.5Z" stroke="#0891b2" stroke-width="2" stroke-linejoin="round"/>
                                <path d="M7 11V16" stroke="#0891b2" stroke-width="2"/>
                                <path d="M2.5 8.5V13.5L7 16L11.5 13.5V8.5" stroke="#0891b2" stroke-width="2" stroke-linejoin="round"/>
                                <path d="M12.5 13.5L17 11L21.5 13.5L17 16L12.5 13.5Z" stroke="#0891b2" stroke-width="2" stroke-linejoin="round"/>
                                <path d="M17 16V21" stroke="#0891b2" stroke-width="2"/>
                                <path d="M12.5 13.5V18.5L17 21L21.5 18.5V13.5" stroke="#0891b2" stroke-width="2" stroke-linejoin="round"/>
                              </svg>
                            </td>
                            <td valign="middle">
                              <div style="font-size:18px;line-height:20px;font-weight:800;color:#0f172a;">${bultos}</div>
                              <div style="font-size:9px;line-height:11px;font-weight:700;color:#64748b;letter-spacing:.3px;">BULTOS</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Pendientes -->
                <td class="kpi-cell" width="25%" style="padding-left:4px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#fffaf0;border:1px solid #fde68a;border-radius:8px;">
                    <tr>
                      <td style="padding:9px 10px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td valign="middle" style="padding-right:7px;">
                              <!-- Lucide: ClockAlert -->
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" stroke="#b45309" stroke-width="2"/>
                                <path d="M12 7V12L15 14" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M19 5L21 3" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                            </td>
                            <td valign="middle">
                              <div style="font-size:18px;line-height:20px;font-weight:800;color:#b45309;">${pendientes}</div>
                              <div style="font-size:9px;line-height:11px;font-weight:700;color:#b45309;letter-spacing:.3px;">PENDIENTES</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>

              </tr>
            </table>
          </td>
        </tr>

        ${obsGenHtml}

        <!-- SEPARADOR + TITULO TABLA -->
        <tr>
          <td class="px" style="padding:8px 20px 8px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="font-size:13px;line-height:17px;font-weight:800;color:#0f172a;">
                  Detalle de movimientos
                </td>
                <td align="right" style="font-size:9px;line-height:12px;color:#64748b;">
                  ${movsList.length} registros
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ======================================================
             TABLA DESKTOP
             ====================================================== -->
        <tr class="desktop-table">
          <td class="px" style="padding:0 20px 20px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                   style="width:100%;border:1px solid #dbe3ee;border-radius:8px;overflow:hidden;">

              <tr bgcolor="#142033">
                <th align="center" style="width:4%;padding:9px 7px;font-size:9px;color:#fff;">#</th>
                <th align="left" style="width:14%;padding:9px 9px;font-size:9px;color:#fff;">MOVIMIENTO</th>
                <th align="left" style="width:17%;padding:9px 9px;font-size:9px;color:#fff;">PACIENTE / CLIENTE</th>
                <th align="left" style="width:22%;padding:9px 9px;font-size:9px;color:#fff;">INSTITUCIÓN / MÉDICO</th>
                <th align="left" style="width:33%;padding:9px 9px;font-size:9px;color:#fff;">OBSERVACIONES / NOVEDAD</th>
                <th align="center" style="width:5%;padding:9px 5px;font-size:9px;color:#fff;">CAJAS</th>
                <th align="center" style="width:5%;padding:9px 5px;font-size:9px;color:#fff;">BULTOS</th>
              </tr>

              ${desktopRows}

            </table>
          </td>
        </tr>

        <!-- ======================================================
             MOVIL: REGISTROS APILADOS
             ====================================================== -->
        <tr>
          <td class="px" style="padding:0 14px 16px 14px;">
            ${mobileCards}
          </td>
        </tr>

        <!-- FOOTER MINIMO -->
        <tr>
          <td class="px" style="padding:11px 20px;background:#0f172a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="font-size:9px;line-height:13px;color:#cbd5e1;">
                  <strong style="color:#ffffff;">DISTRICORR</strong> · Gestión IQ · Logística Operativa
                </td>
                <td align="right" style="font-size:8px;line-height:12px;color:#64748b;">
                  Generado automáticamente
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
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
