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
        <!-- BOTÓN EDITAR INFORME (Solo usuarios autenticados) -->
        <router-link 
          v-if="informe && !isPublicView"
          :to="{ name: 'LogisticaNuevoInforme', query: { id: informe.id } }"
          class="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
          title="Editar datos, movimientos u observaciones de este informe"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          <span>✏️ Editar Informe</span>
        </router-link>

        <button 
          v-if="!isPublicView"
          type="button" 
          @click="showEmailModal = true"
          class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          title="Enviar por correo con destinatarios oficiales de Districorr o copiar emails/tabla"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>📧 Enviar por Correo</span>
        </button>

        <button 
          v-if="!isPublicView"
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
          <span>🖨️ Imprimir</span>
        </button>

        <button 
          type="button" 
          @click="downloadDirectPDF"
          :disabled="isExportingPDF"
          class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          title="Descargar reporte en formato PDF listo para guardar o compartir"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>{{ isExportingPDF ? 'Generando PDF...' : '📥 Descargar PDF' }}</span>
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

    <div v-else ref="reportContentRef" class="bg-[#ffffff] dark:bg-slate-900 rounded-2xl border border-[#dfe6ef] dark:border-slate-800 overflow-hidden shadow-md font-sans text-[#172033] dark:text-slate-100 print:shadow-none print:border-none">
      <!-- ACENTO SUPERIOR -->
      <div class="h-1 bg-blue-600"></div>

      <!-- HEADER COMPACTO -->
      <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">DISTRICORR · GESTIÓN IQ</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider">
              {{ informe.estado || 'ENVIADO' }}
            </span>
          </div>
          <h2 class="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Informe Diario de Logística Operativa
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ formatDate(informe.fecha) }} · <strong class="text-slate-700 dark:text-slate-200">{{ informe.zona || 'Formosa Capital' }}</strong>
          </p>
        </div>

        <div class="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 space-y-0.5 font-sans">
          <div><strong class="text-slate-700 dark:text-slate-200">Responsable:</strong> {{ informe.responsable_nombre }}</div>
          <div><strong class="text-slate-700 dark:text-slate-200">Enviado:</strong> {{ informe.enviado_at ? formatDateTime(informe.enviado_at) : formatDateTime(new Date().toISOString()) }}</div>
        </div>
      </div>

      <!-- RESUMEN COMPACTO (4 KPI Cards) -->
      <div class="p-4 sm:p-5">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <!-- Movimientos -->
          <div class="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3L4 7L8 11M4 7H20M16 21L20 17L16 13M20 17H4"/></svg>
            </div>
            <div>
              <div class="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{{ movimientos.length }}</div>
              <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">MOVIMIENTOS</div>
            </div>
          </div>

          <!-- Cajas -->
          <div class="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 16V8C21 7.3 20.6 6.65 20 6.3L13 2.3C12.4 1.95 11.6 1.95 11 2.3L4 6.3C3.4 6.65 3 7.3 3 8V16C3 16.7 3.4 17.35 4 17.7L11 21.7C11.6 22.05 12.4 22.05 13 21.7L20 17.7C20.6 17.35 21 16.7 21 16Z"/></svg>
            </div>
            <div>
              <div class="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{{ totalCajas }}</div>
              <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">CAJAS / EQUIPOS</div>
            </div>
          </div>

          <!-- Bultos -->
          <div class="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.5 8.5L7 6L11.5 8.5L7 11L2.5 8.5Z"/></svg>
            </div>
            <div>
              <div class="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{{ totalBultos }}</div>
              <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">BULTOS</div>
            </div>
          </div>

          <!-- Pendientes -->
          <div class="p-2.5 sm:p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900/60 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 14" stroke="currentColor" stroke-width="2"/></svg>
            </div>
            <div>
              <div class="text-lg font-extrabold text-amber-900 dark:text-amber-300 leading-none">{{ totalPendientes }}</div>
              <div class="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-0.5">PENDIENTES</div>
            </div>
          </div>
        </div>

        <!-- Observación General -->
        <div v-if="informe.observacion_general" class="mt-3.5 p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border-l-4 border-blue-600 text-xs space-y-1">
          <span class="font-extrabold text-blue-900 dark:text-blue-300 block">Observación General de la Jornada:</span>
          <p class="text-slate-700 dark:text-slate-300 italic">{{ informe.observacion_general }}</p>
        </div>
      </div>

      <!-- SEPARADOR + TÍTULO TABLA -->
      <div class="px-4 sm:px-5 py-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-extrabold">
        <span class="text-slate-900 dark:text-white">Detalle de movimientos</span>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{{ movimientos.length }} registros</span>
      </div>

      <!-- TABLA DE MOVIMIENTOS DESKTOP -->
      <div class="hidden sm:block overflow-x-auto px-4 sm:px-5 pb-5">
        <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <thead>
            <tr class="bg-[#142033] text-white font-bold text-[10px] uppercase">
              <th class="p-2.5 text-center w-8">#</th>
              <th class="p-2.5 w-32">Movimiento</th>
              <th class="p-2.5">Paciente / Cliente</th>
              <th class="p-2.5">Institución / Médico</th>
              <th class="p-2.5">Observaciones / Novedad</th>
              <th class="p-2.5 text-center w-14">Cajas</th>
              <th class="p-2.5 text-center w-14">Bultos</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr 
              v-for="(mov, idx) in movimientos" 
              :key="mov.id"
              :class="idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-800/40'"
            >
              <td class="p-2.5 text-center font-bold text-slate-400 font-mono text-[11px]">{{ String(idx + 1).padStart(2, '0') }}</td>
              
              <td class="p-2.5 align-top">
                <span :class="['px-2.5 py-0.5 rounded-md border text-[10px] font-extrabold inline-block', getMovementDisplayInfo(mov).bgClass]">
                  {{ getMovementDisplayInfo(mov).displayTitle }}
                </span>
                <div v-if="mov.id_cirugia_snapshot" class="mt-1">
                  <span class="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold inline-block">
                    {{ mov.id_cirugia_snapshot }}
                  </span>
                </div>
              </td>

              <td class="p-2.5 align-top">
                <span class="font-extrabold text-slate-900 dark:text-white block">{{ mov.paciente_snapshot || mov.destino || 'Sin especificar' }}</span>
                <span v-if="mov.cliente_snapshot" class="text-[11px] text-slate-500 block mt-0.5">🏢 {{ mov.cliente_snapshot }}</span>
              </td>

              <td class="p-2.5 align-top text-slate-700 dark:text-slate-300">
                <span v-if="mov.institucion_snapshot" class="font-bold block text-slate-800 dark:text-slate-200">🏥 {{ mov.institucion_snapshot }}</span>
                <span v-if="mov.medico_snapshot" class="text-slate-500 block mt-0.5">👨‍⚕️ {{ mov.medico_snapshot }}</span>
              </td>

              <td class="p-2.5 align-top">
                <div v-if="getMovementDisplayInfo(mov).subDetail" class="mb-1.5 p-2 bg-purple-50/90 dark:bg-purple-950/40 rounded-lg border-l-3 border-purple-600 text-xs text-purple-950 dark:text-purple-200">
                  <span class="font-extrabold text-purple-800 dark:text-purple-300">Motivo / Gestión:</span> {{ getMovementDisplayInfo(mov).subDetail }}
                </div>

                <span v-if="getMovementDisplayInfo(mov).cleanObs" class="text-slate-700 dark:text-slate-300 block text-xs">
                  {{ getMovementDisplayInfo(mov).cleanObs }}
                </span>
                <span v-else-if="!getMovementDisplayInfo(mov).subDetail && !mov.tiene_pendiente" class="text-slate-400 italic text-[11px]">Sin notas</span>

                <div v-if="mov.tiene_pendiente" class="mt-1 p-1 px-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/50 text-[10px] font-bold text-amber-900 dark:text-amber-300">
                  ⚠️ Pendiente: {{ mov.detalle_pendiente }}
                </div>
              </td>

              <td class="p-2.5 text-center font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                {{ mov.cantidad_cajas || 0 }}
              </td>

              <td class="p-2.5 text-center font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                {{ mov.cantidad_bultos || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TARJETAS DE REGISTROS APILADAS MÓVIL (sm:hidden) -->
      <div class="sm:hidden px-4 pb-4 space-y-2.5">
        <div 
          v-for="(mov, idx) in movimientos" 
          :key="mov.id"
          class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-[10px] font-mono font-bold text-slate-400">
                {{ String(idx + 1).padStart(2, '0') }} {{ mov.id_cirugia_snapshot ? '· ' + mov.id_cirugia_snapshot : '' }}
              </div>
              <div class="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                {{ mov.paciente_snapshot || mov.destino || 'Sin especificar' }}
              </div>
              <div v-if="mov.cliente_snapshot" class="text-xs text-slate-500">
                🏢 {{ mov.cliente_snapshot }}
              </div>
            </div>
            <span :class="['px-2.5 py-0.5 rounded-md border text-[9px] font-extrabold inline-block shrink-0', getMovementDisplayInfo(mov).bgClass]">
              {{ getMovementDisplayInfo(mov).displayTitle }}
            </span>
          </div>

          <div class="h-px bg-slate-100 dark:bg-slate-800"></div>

          <div class="space-y-1 text-xs">
            <div class="font-bold text-slate-800 dark:text-slate-200">🏥 {{ mov.institucion_snapshot || 'Sin especificar' }}</div>
            <div v-if="mov.medico_snapshot" class="text-slate-500">👨‍⚕️ Médico · {{ mov.medico_snapshot }}</div>
          </div>

          <div class="space-y-1 text-xs pt-1">
            <div class="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
              {{ mov.tipo_movimiento }}
            </div>
            <div v-if="getMovementDisplayInfo(mov).subDetail" class="p-2 bg-purple-50/80 dark:bg-purple-950/40 rounded-lg border-l-3 border-purple-600 text-xs font-semibold text-purple-950 dark:text-purple-200">
              <span class="font-extrabold">Motivo:</span> {{ getMovementDisplayInfo(mov).subDetail }}
            </div>
            <div v-if="getMovementDisplayInfo(mov).cleanObs" class="text-slate-600 dark:text-slate-300">
              {{ getMovementDisplayInfo(mov).cleanObs }}
            </div>
            <div v-else-if="!getMovementDisplayInfo(mov).subDetail && !mov.tiene_pendiente" class="text-slate-400 italic text-xs">
              Sin notas
            </div>
            <div v-if="mov.tiene_pendiente" class="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 text-[10px] font-bold text-amber-800">
              ⚠️ Pendiente: {{ mov.detalle_pendiente }}
            </div>
          </div>

          <div class="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between text-xs font-mono font-bold">
            <span>Cajas: <strong>{{ mov.cantidad_cajas || 0 }}</strong></span>
            <span>Bultos: <strong>{{ mov.cantidad_bultos || 0 }}</strong></span>
          </div>
        </div>
      </div>

      <!-- FOOTER MÍNIMO INTERNO -->
      <div class="px-4 sm:px-5 py-2.5 bg-slate-900 text-white flex items-center justify-between text-[10px] font-sans">
        <div><strong class="text-white font-extrabold">DISTRICORR</strong> · Gestión IQ · Logística Operativa</div>
        <div class="text-slate-400 font-mono">Generado automáticamente</div>
      </div>

      <!-- BOTÓN DISCRETO AL PIE DEL REPORTE PARA DESCARGA DE PDF -->
      <div class="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div class="text-xs text-slate-600 dark:text-slate-300 font-medium">
          📄 ¿Deseás guardar una copia oficial en PDF de este reporte diario?
        </div>
        <button 
          type="button" 
          @click="downloadDirectPDF"
          :disabled="isExportingPDF"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>{{ isExportingPDF ? 'Generando PDF...' : '📥 Descargar PDF Oficial' }}</span>
        </button>
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
      :getPdfBase64="generatePdfBase64"
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
import { generateLogisticaInformePDF, getLogisticaInformePdfBase64 } from '../../services/logisticaPdfGenerator';

const route = useRoute();
const toast = useToast();
const loading = ref(true);
const showEmailModal = ref(false);
const reportContentRef = ref(null);
const isExportingPDF = ref(false);

const isPublicView = computed(() => route.name === 'LogisticaInformePublico' || route.meta?.requiresAuth === false);

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

const downloadDirectPDF = async () => {
  if (!informe.value) {
    toast.error('No se pudo encontrar el contenido del reporte para exportar.');
    return;
  }

  isExportingPDF.value = true;
  toast.info('Generando documento PDF vectorial...');

  try {
    generateLogisticaInformePDF(informe.value, movimientos.value);
    const dateClean = (informe.value?.fecha || '').replace(/-/g, '_');
    toast.success(`Documento PDF "Informe_Logistica_${dateClean || 'districorr'}.pdf" descargado con éxito.`);
  } catch (err) {
    console.error('Error al exportar PDF:', err);
    toast.error('Error al generar PDF: ' + err.message);
  } finally {
    isExportingPDF.value = false;
  }
};

const generatePdfBase64 = async () => {
  if (!informe.value) return null;
  try {
    return getLogisticaInformePdfBase64(informe.value, movimientos.value);
  } catch (err) {
    console.error('Error generando PDF base64 para email:', err);
    return null;
  }
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

const getMovementDisplayInfo = (mov) => {
  let rawTipo = (mov?.tipo_movimiento || '').trim();
  let obs = (mov?.observaciones || '').trim();
  let tagTitle = '';
  let subDetail = '';
  let cleanObs = obs;

  const match = obs.match(/^\[(.*?):?\s*(.*?)\]\s*(.*)/s);
  if (match) {
    const bracketHeader = match[1].trim();
    const bracketSub = match[2].trim();
    const restText = match[3].trim();

    if (bracketSub) {
      subDetail = bracketSub;
    }

    if (bracketHeader && bracketHeader.toLowerCase() !== 'otra gestión' && bracketHeader.toLowerCase() !== 'otra gestion') {
      tagTitle = bracketHeader;
    }

    if (restText) {
      cleanObs = restText;
    } else {
      cleanObs = '';
    }
  }

  let displayTitle = tagTitle || rawTipo || 'Otra gestión';
  const tLower = displayTitle.toLowerCase();
  
  if (rawTipo === 'Otra gestión' || tLower.includes('otra gestión') || tLower.includes('otra gestion') || displayTitle.length > 25) {
    displayTitle = 'Otra gestión';
  }

  const t = displayTitle.toLowerCase();

  // Estilos por defecto para "Otra gestión": Morado/Púrpura elegante en formato rectangular badge
  let bgClass = 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800 rounded-md font-extrabold';
  let inlineHtml = 'padding:3px 8px;border-radius:5px;background:#f3e8ff;color:#6b21a8;font-size:10px;line-height:13px;font-weight:800;border:1px solid #d8b4fe;display:inline-block;white-space:nowrap;';

  if (t.includes('entrega')) {
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#eff6ff;color:#2563eb;font-size:10px;line-height:13px;font-weight:800;border:1px solid #bfdbfe;display:inline-block;white-space:nowrap;';
  } else if (t.includes('retiro')) {
    bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#eef2ff;color:#4f46e5;font-size:10px;line-height:13px;font-weight:800;border:1px solid #c7d2fe;display:inline-block;white-space:nowrap;';
  } else if (t.includes('esterili')) {
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#ecfdf5;color:#047857;font-size:10px;line-height:13px;font-weight:800;border:1px solid #a7f3d0;display:inline-block;white-space:nowrap;';
  } else if (t.includes('docu')) {
    bgClass = 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 dark:border-fuchsia-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#fdf4ff;color:#a21caf;font-size:10px;line-height:13px;font-weight:800;border:1px solid #f5d0fe;display:inline-block;white-space:nowrap;';
  } else if (t.includes('despacho') || t.includes('envío') || t.includes('envio')) {
    bgClass = 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#f0f9ff;color:#0369a1;font-size:10px;line-height:13px;font-weight:800;border:1px solid #bae6fd;display:inline-block;white-space:nowrap;';
  } else if (t.includes('inciden')) {
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#fff1f2;color:#be123c;font-size:10px;line-height:13px;font-weight:800;border:1px solid #fecdd3;display:inline-block;white-space:nowrap;';
  } else if (t.includes('control') || t.includes('devolu')) {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#fffbeb;color:#b45309;font-size:10px;line-height:13px;font-weight:800;border:1px solid #fde68a;display:inline-block;white-space:nowrap;';
  }

  return { displayTitle, cleanObs, subDetail, bgClass, inlineHtml };
};

const generateEmailTableHtml = (inf, movsList) => {
  const cajas = movsList.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0);
  const bultos = movsList.reduce((sum, m) => sum + (m.cantidad_bultos || 0), 0);
  const pendientes = movsList.filter(m => m.tiene_pendiente).length;
  const fechaStr = formatDate(inf?.fecha);
  const zonaStr = inf?.zona || 'Formosa Capital';
  const responsableStr = inf?.responsable_nombre || 'Logística';
  const enviadoTimeStr = inf?.enviado_at ? formatDateTime(inf.enviado_at) : formatDateTime(new Date().toISOString());
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gestioniq.districorr.com.ar';
  const reportWebUrl = inf?.id ? `${baseUrl}/logistica/informes/publico/${inf.id}` : '#';

  const desktopRows = movsList.map((mov, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const numIdx = String(idx + 1).padStart(2, '0');
    const info = getMovementDisplayInfo(mov);
    const idCirugiaBadge = mov.id_cirugia_snapshot 
      ? `<div style="margin-top:5px;"><span style="display:inline-block;padding:3px 6px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:5px;font-family:Consolas,monospace;font-size:8px;line-height:10px;font-weight:700;color:#475569;">${mov.id_cirugia_snapshot}</span></div>` 
      : '';
    const clienteSpan = mov.cliente_snapshot ? `<div style="margin-top:4px;font-size:9px;line-height:13px;color:#64748b;">${mov.cliente_snapshot}</div>` : '';
    const instSpan = mov.institucion_snapshot ? `<div style="font-size:10px;line-height:14px;font-weight:700;color:#334155;">${mov.institucion_snapshot}</div>` : '';
    const medSpan = mov.medico_snapshot ? `<div style="margin-top:5px;font-size:9px;line-height:13px;color:#64748b;">Médico · ${mov.medico_snapshot}</div>` : '';
    
    let subDetailHtml = info.subDetail 
      ? `<div style="margin-bottom:5px;padding:6px 9px;background:#f3e8ff;border-left:3px solid #7e22ce;border-radius:4px;font-size:10px;line-height:14px;color:#581c87;"><strong>Motivo:</strong> ${info.subDetail}</div>` 
      : '';

    let pendHtml = mov.tiene_pendiente 
      ? `<div style="margin-top:4px;background-color:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:3px 5px;border-radius:4px;font-weight:bold;font-size:9px;">⚠️ Pendiente: ${mov.detalle_pendiente || ''}</div>` 
      : '';

    return `
      <tr bgcolor="${bg}">
        <td align="center" valign="top" style="padding:12px 7px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#94a3b8;font-weight:700;">${numIdx}</td>
        <td valign="top" style="padding:12px 9px;border-bottom:1px solid #e2e8f0;">
          <span style="${info.inlineHtml}">${info.displayTitle}</span>
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
          ${subDetailHtml}
          <div style="font-size:10px;line-height:15px;color:#475569;">${info.cleanObs || (!info.subDetail ? 'Sin notas' : '')}</div>
          ${pendHtml}
        </td>
        <td align="center" valign="middle" style="padding:12px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#0f172a;">${mov.cantidad_cajas || 0}</td>
        <td align="center" valign="middle" style="padding:12px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#0f172a;">${mov.cantidad_bultos || 0}</td>
      </tr>
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
             TABLA PRINCIPAL
             ====================================================== -->
        <tr>
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

        <!-- FOOTER CALLOUT EN EMAIL -->
        <tr>
          <td class="px" style="padding:14px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <div style="font-size:11px;color:#334155;font-weight:bold;margin-bottom:6px;">
              📄 ¿Deseás descargar la versión oficial en PDF de este informe diario?
            </div>
            <a href="${reportWebUrl}" target="_blank" style="display:inline-block;padding:8px 18px;background:#0284c7;color:#ffffff;font-size:11px;font-weight:800;border-radius:6px;text-decoration:none;box-shadow:0 1px 3px rgba(0,0,0,0.15);">
              📥 Abrir en Gestión IQ y Descargar PDF Oficial ➔
            </a>
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
