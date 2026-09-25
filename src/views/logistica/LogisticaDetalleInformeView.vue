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
        <!-- BOTÓN EDITAR / REABRIR INFORME (Solo usuarios autenticados) -->
        <template v-if="informe && !isPublicView">
          <router-link 
            v-if="informe.estado === 'borrador'"
            :to="{ name: 'LogisticaNuevoInforme', query: { id: informe.id } }"
            class="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
            title="Continuar editando este borrador"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>✏️ Continuar Editando</span>
          </router-link>

          <button 
            v-else
            type="button" 
            @click="showReopenModal = true"
            class="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
            title="Reabrir esta jornada para agregar o corregir movimientos"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
            <span>🔓 Reabrir para Editar</span>
          </button>
        </template>

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

      <!-- RESUMEN OPERATIVO SUPERIOR (Prioridad Visual: Entregas, Retiros, Pendientes) -->
      <div class="p-4 sm:p-5 space-y-3">
        <!-- Tarjetas Principales Prioritarias -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <!-- Entregas -->
          <div class="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 flex items-center gap-3 shadow-2xs">
            <div class="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
              🚚
            </div>
            <div>
              <div class="text-xl font-extrabold text-blue-950 dark:text-blue-200 leading-none">{{ stats.totalEntregas }}</div>
              <div class="text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mt-1">ENTREGAS</div>
            </div>
          </div>

          <!-- Retiros -->
          <div class="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 flex items-center gap-3 shadow-2xs">
            <div class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
              📦
            </div>
            <div>
              <div class="text-xl font-extrabold text-indigo-950 dark:text-indigo-200 leading-none">{{ stats.totalRetiros }}</div>
              <div class="text-[9px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mt-1">RETIROS</div>
            </div>
          </div>

          <!-- Pendientes -->
          <div class="p-3 bg-amber-50/90 dark:bg-amber-950/50 rounded-xl border border-amber-300/80 dark:border-amber-900/70 flex items-center gap-3 shadow-2xs col-span-2 sm:col-span-1">
            <div class="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
              ⚠️
            </div>
            <div>
              <div class="text-xl font-extrabold text-amber-950 dark:text-amber-200 leading-none">{{ stats.totalPendientes }}</div>
              <div class="text-[9px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mt-1">PENDIENTES</div>
            </div>
          </div>
        </div>

        <!-- Tarjetas Secundarias: Movimientos Totales, Cajas y Bultos -->
        <div class="grid grid-cols-3 gap-2.5">
          <!-- Movimientos (Total) -->
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-xs">
              📊
            </div>
            <div>
              <div class="text-base font-extrabold text-slate-900 dark:text-white leading-none">{{ stats.totalMovimientos }}</div>
              <div class="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">MOVIMIENTOS</div>
            </div>
          </div>

          <!-- Cajas / Equipos -->
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-xs">
              💼
            </div>
            <div>
              <div class="text-base font-extrabold text-slate-900 dark:text-white leading-none">{{ stats.totalCajas }}</div>
              <div class="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">CAJAS / EQUIPOS</div>
            </div>
          </div>

          <!-- Bultos -->
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-xs">
              🛍️
            </div>
            <div>
              <div class="text-base font-extrabold text-slate-900 dark:text-white leading-none">{{ stats.totalBultos }}</div>
              <div class="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">BULTOS</div>
            </div>
          </div>
        </div>

        <!-- Observación General -->
        <div v-if="informe.observacion_general" class="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border-l-4 border-blue-600 text-xs space-y-1">
          <span class="font-extrabold text-blue-900 dark:text-blue-300 block">Observación General de la Jornada:</span>
          <p class="text-slate-700 dark:text-slate-300 italic">{{ informe.observacion_general }}</p>
        </div>
      </div>

      <!-- SECCIÓN: DETALLE DE MOVIMIENTOS AGRUPADOS POR INSTITUCIÓN -->
      <div class="px-4 sm:px-5 py-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-extrabold">
        <span class="text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>📋</span> Detalle de movimientos por institución
        </span>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{{ movimientos.length }} registros en total</span>
      </div>

      <!-- CONTENEDOR AGRUPADO POR ENTIDAD (Desktop y Mobile) -->
      <div class="px-4 sm:px-5 pb-3 space-y-4">
        <div 
          v-for="group in entityGroups" 
          :key="group.entidad"
          class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/60 shadow-2xs"
        >
          <!-- Header de Institución / Entidad -->
          <div class="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-sm">🏥</span>
              <span class="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-tight">
                {{ group.entidad }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-[10px] font-bold font-mono">
              <span class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {{ group.entregas }} ent.
              </span>
              <span class="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                {{ group.retiros }} ret.
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {{ group.cajas }} cajas | {{ group.bultos }} bultos
              </span>
              <span v-if="group.pendientes > 0" class="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black">
                ⚠️ {{ group.pendientes }} pend.
              </span>
            </div>
          </div>

          <!-- TABLA DE MOVIMIENTOS DESKTOP DE LA ENTIDAD -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase border-b border-slate-200 dark:border-slate-700">
                  <th class="p-2 text-center w-8">#</th>
                  <th class="p-2 w-36">Movimiento</th>
                  <th class="p-2 w-44">Paciente / Cliente</th>
                  <th class="p-2 w-36">Médico / Destino</th>
                  <th class="p-2">Observaciones / Novedad</th>
                  <th class="p-2 text-center w-14">Cajas</th>
                  <th class="p-2 text-center w-14">Bultos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr 
                  v-for="(mov, idx) in group.movimientos" 
                  :key="mov.id || idx"
                  class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td class="p-2 text-center font-bold text-slate-400 font-mono text-[10px]">
                    {{ String(idx + 1).padStart(2, '0') }}
                  </td>
                  
                  <td class="p-2 align-top space-y-1">
                    <span :class="['px-2 py-0.5 rounded text-[10px] font-extrabold inline-block', getMovementDisplayInfo(mov).bgClass]">
                      {{ getMovementDisplayInfo(mov).displayTitle }}
                    </span>

                    <!-- Horario Real y Badge Fuera de Corte (Si existe dato confiable) -->
                    <div v-if="getMovementDisplayInfo(mov).horaInfo" class="flex items-center gap-1 flex-wrap">
                      <span class="font-mono text-[9px] text-slate-500 font-bold">
                        ⏰ {{ getMovementDisplayInfo(mov).horaInfo.hora }}
                      </span>
                      <span 
                        v-if="getMovementDisplayInfo(mov).horaInfo.isFueraDeCorte" 
                        class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                        title="Salida realizada después del horario de corte de las 15:00"
                      >
                        FUERA DE CORTE
                      </span>
                    </div>

                    <div v-if="mov.id_cirugia_snapshot">
                      <span class="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold inline-block">
                        {{ mov.id_cirugia_snapshot }}
                      </span>
                    </div>
                  </td>

                  <td class="p-2 align-top">
                    <span class="font-extrabold text-slate-900 dark:text-white block">{{ mov.paciente_snapshot || mov.destino || 'Sin especificar' }}</span>
                    <span v-if="mov.cliente_snapshot" class="text-[10px] text-slate-500 block mt-0.5">🏢 {{ mov.cliente_snapshot }}</span>
                  </td>

                  <td class="p-2 align-top text-slate-700 dark:text-slate-300">
                    <span v-if="mov.medico_snapshot" class="font-bold block text-slate-800 dark:text-slate-200">👨‍⚕️ {{ mov.medico_snapshot }}</span>
                    <span v-else-if="mov.destino" class="text-slate-500 block">📍 {{ mov.destino }}</span>
                    <span v-else class="text-slate-400 italic text-[10px]">-</span>
                  </td>

                  <td class="p-2 align-top">
                    <div v-if="getMovementDisplayInfo(mov).subDetail" class="mb-1 p-1.5 bg-purple-50/90 dark:bg-purple-950/40 rounded border-l-2 border-purple-600 text-[11px] text-purple-950 dark:text-purple-200">
                      <span class="font-extrabold text-purple-800 dark:text-purple-300">Motivo:</span> {{ getMovementDisplayInfo(mov).subDetail }}
                    </div>

                    <span v-if="getMovementDisplayInfo(mov).cleanObs" class="text-slate-700 dark:text-slate-300 block text-xs">
                      {{ getMovementDisplayInfo(mov).cleanObs }}
                    </span>
                    <span v-else-if="!getMovementDisplayInfo(mov).subDetail && !mov.tiene_pendiente" class="text-slate-400 italic text-[10px]">Sin notas</span>

                    <div v-if="mov.tiene_pendiente" class="mt-1 p-1 px-2 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-900/50 text-[10px] font-bold text-amber-900 dark:text-amber-300">
                      ⚠️ Pendiente: {{ mov.detalle_pendiente }}
                    </div>
                  </td>

                  <td class="p-2 text-center font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                    {{ mov.cantidad_cajas || 0 }}
                  </td>

                  <td class="p-2 text-center font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                    {{ mov.cantidad_bultos || 0 }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TARJETAS DE REGISTROS APILADAS MÓVIL (sm:hidden) -->
          <div class="sm:hidden p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
            <div 
              v-for="(mov, idx) in group.movimientos" 
              :key="mov.id || idx"
              class="pt-2.5 first:pt-0 space-y-2"
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
                <div class="flex flex-col items-end gap-1">
                  <span :class="['px-2 py-0.5 rounded text-[9px] font-extrabold inline-block', getMovementDisplayInfo(mov).bgClass]">
                    {{ getMovementDisplayInfo(mov).displayTitle }}
                  </span>
                  <span 
                    v-if="getMovementDisplayInfo(mov).horaInfo?.isFueraDeCorte" 
                    class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300"
                  >
                    FUERA DE CORTE
                  </span>
                </div>
              </div>

              <div v-if="mov.medico_snapshot" class="text-xs text-slate-600 dark:text-slate-300">
                👨‍⚕️ Médico · <strong>{{ mov.medico_snapshot }}</strong>
              </div>

              <div class="space-y-1 text-xs">
                <div v-if="getMovementDisplayInfo(mov).subDetail" class="p-1.5 bg-purple-50/80 dark:bg-purple-950/40 rounded border-l-2 border-purple-600 text-xs font-semibold text-purple-950 dark:text-purple-200">
                  <span class="font-extrabold">Motivo:</span> {{ getMovementDisplayInfo(mov).subDetail }}
                </div>
                <div v-if="getMovementDisplayInfo(mov).cleanObs" class="text-slate-600 dark:text-slate-300">
                  {{ getMovementDisplayInfo(mov).cleanObs }}
                </div>
                <div v-if="mov.tiene_pendiente" class="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 text-[10px] font-bold text-amber-800">
                  ⚠️ Pendiente: {{ mov.detalle_pendiente }}
                </div>
              </div>

              <div class="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded flex items-center justify-between text-[11px] font-mono font-bold">
                <span v-if="getMovementDisplayInfo(mov).horaInfo">⏰ {{ getMovementDisplayInfo(mov).horaInfo.hora }}</span>
                <span>Cajas: <strong>{{ mov.cantidad_cajas || 0 }}</strong></span>
                <span>Bultos: <strong>{{ mov.cantidad_bultos || 0 }}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: RESUMEN POR ENTIDAD / INSTITUCIÓN (Colocada al final del detalle) -->
      <div class="px-4 sm:px-5 py-4 space-y-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30">
        <div class="flex items-center justify-between text-xs font-extrabold">
          <span class="text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>🏥</span> Resumen de actividad por institución
          </span>
          <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{{ entityGroups.length }} instituciones</span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider">
                <th class="p-2.5">Entidad / Institución</th>
                <th class="p-2.5 text-center w-20 text-blue-300">Entregas</th>
                <th class="p-2.5 text-center w-20 text-indigo-300">Retiros</th>
                <th class="p-2.5 text-center w-24">Cajas/Equipos</th>
                <th class="p-2.5 text-center w-20">Bultos</th>
                <th class="p-2.5 text-center w-24 text-amber-300">Pendientes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr 
                v-for="(group, gIdx) in entityGroups" 
                :key="group.entidad"
                :class="gIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-800/40'"
              >
                <td class="p-2.5 font-extrabold text-slate-900 dark:text-white">
                  {{ group.entidad }}
                </td>
                <td class="p-2.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                  {{ group.entregas }}
                </td>
                <td class="p-2.5 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {{ group.retiros }}
                </td>
                <td class="p-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ group.cajas }}
                </td>
                <td class="p-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ group.bultos }}
                </td>
                <td class="p-2.5 text-center font-mono font-bold">
                  <span v-if="group.pendientes > 0" class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold">
                    ⚠️ {{ group.pendientes }}
                  </span>
                  <span v-else class="text-slate-400">0</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-100 dark:bg-slate-800 font-extrabold text-[11px] border-t-2 border-slate-300 dark:border-slate-700">
                <td class="p-2.5 text-slate-900 dark:text-white uppercase">TOTAL GENERAL</td>
                <td class="p-2.5 text-center font-mono text-blue-700 dark:text-blue-400">{{ stats.totalEntregas }}</td>
                <td class="p-2.5 text-center font-mono text-indigo-700 dark:text-indigo-400">{{ stats.totalRetiros }}</td>
                <td class="p-2.5 text-center font-mono text-slate-900 dark:text-white">{{ stats.totalCajas }}</td>
                <td class="p-2.5 text-center font-mono text-slate-900 dark:text-white">{{ stats.totalBultos }}</td>
                <td class="p-2.5 text-center font-mono text-amber-700 dark:text-amber-400">
                  <span v-if="stats.totalPendientes > 0">⚠️ {{ stats.totalPendientes }}</span>
                  <span v-else>0</span>
                </td>
              </tr>
            </tfoot>
          </table>
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

    <!-- Modal de Envío por Correo / Copiar Emails Oficiales / Prueba Resend -->
    <EmailReporteModal 
      :show="showEmailModal"
      :informe="informe"
      :stats="stats"
      :movimientos="movimientos"
      :htmlTableProvider="copyDirectToEmailClipboard"
      :getHtmlContent="() => generateEmailTableHtml(informe, movimientos)"
      :getPdfBase64="generatePdfBase64"
      @close="showEmailModal = false"
      @copy-table="copyDirectToEmailClipboard"
    />

    <!-- Modal Confirmación de Reapertura de Jornada -->
    <div 
      v-if="showReopenModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0 font-bold text-lg">
            🔓
          </div>
          <div>
            <h3 class="text-sm font-black text-slate-900 dark:text-white">
              ¿Reabrir esta jornada para edición?
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              El informe del <strong>{{ formatDate(informe?.fecha) }}</strong> volverá a estado <strong>borrador</strong> para que puedas agregar o modificar movimientos. Podrás reenviarlo formalmente cuando finalices.
            </p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Motivo de reapertura (Opcional):
          </label>
          <input 
            v-model="reopenReason"
            type="text"
            placeholder="Ej: Nuevas entregas de guardia / Corrección de cajas..."
            class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none dark:text-white"
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            @click="showReopenModal = false"
            :disabled="isReopening"
            class="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            @click="handleReopenInforme"
            :disabled="isReopening"
            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <span>{{ isReopening ? 'Reabriendo...' : '✓ Confirmar Reapertura' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import EmailReporteModal from '../../components/logistica/EmailReporteModal.vue';
import { generateLogisticaInformePDF, getLogisticaInformePdfBase64 } from '../../services/logisticaPdfGenerator';
import {
  formatDate,
  formatDateTime,
  getMovementDisplayInfo,
  computeLogisticaStats,
  groupMovimientosByEntidad
} from '../../services/logisticaReportHelpers';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const showEmailModal = ref(false);
const showReopenModal = ref(false);
const isReopening = ref(false);
const reopenReason = ref('');
const reportContentRef = ref(null);
const isExportingPDF = ref(false);

const isPublicView = computed(() => route.name === 'LogisticaInformePublico' || route.meta?.requiresAuth === false);

const informe = ref(null);
const movimientos = ref([]);

const stats = computed(() => computeLogisticaStats(movimientos.value));
const entityGroups = computed(() => groupMovimientosByEntidad(movimientos.value));

const fetchInformeDetalle = async () => {
  try {
    loading.value = true;
    const informeId = route.params.id;

    // 1. Intentar recuperación mediante RPC pública SECURITY DEFINER (para acceso vía link de correo sin sesión)
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('obtener_informe_logistica_publico', {
        p_informe_id: informeId
      });

      if (!rpcErr && rpcData && rpcData.success && rpcData.informe) {
        informe.value = rpcData.informe;
        movimientos.value = rpcData.movimientos || [];
        return;
      }
    } catch (e) {
      console.warn('[LogisticaDetalleInformeView] RPC pública no disponible, ejecutando consulta de fallback:', e);
    }

    // 2. Fallback de consulta directa para usuarios autenticados
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

const generateEmailTableHtml = (inf, movsList) => {
  const emailStats = computeLogisticaStats(movsList);
  const emailGroups = groupMovimientosByEntidad(movsList);

  const fechaStr = formatDate(inf?.fecha);
  const zonaStr = inf?.zona || 'Formosa Capital';
  const responsableStr = inf?.responsable_nombre || 'Logística';
  const enviadoTimeStr = inf?.enviado_at ? formatDateTime(inf.enviado_at) : formatDateTime(new Date().toISOString());
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gestioniq.districorr.com.ar';
  const reportWebUrl = inf?.id ? `${baseUrl}/logistica/informes/publico/${inf.id}` : '#';

  // --- FILAS DE LA TABLA RESUMEN POR ENTIDAD EN EMAIL ---
  const entitySummaryRows = emailGroups.map((g, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const pendBadge = g.pendientes > 0 
      ? `<span style="display:inline-block;padding:2px 6px;background:#fef3c7;color:#92400e;border-radius:4px;font-weight:800;font-size:9px;">⚠️ ${g.pendientes}</span>`
      : `<span style="color:#94a3b8;">0</span>`;

    return `
      <tr bgcolor="${bg}">
        <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#0f172a;">${g.entidad}</td>
        <td align="center" style="padding:7px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#2563eb;">${g.entregas}</td>
        <td align="center" style="padding:7px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#4f46e5;">${g.retiros}</td>
        <td align="center" style="padding:7px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#334155;">${g.cajas}</td>
        <td align="center" style="padding:7px 5px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#334155;">${g.bultos}</td>
        <td align="center" style="padding:7px 5px;border-bottom:1px solid #e2e8f0;">${pendBadge}</td>
      </tr>
    `;
  }).join('');

  // --- TABLA DETALLE AGRUPADA POR ENTIDAD EN EMAIL ---
  let globalEmailIndex = 1;
  const groupedDetailHtml = emailGroups.map(group => {
    const groupHeader = `
      <tr bgcolor="#f1f5f9">
        <td colspan="7" style="padding:8px 10px;border-top:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;">
                🏥 ${group.entidad}
              </td>
              <td align="right" style="font-size:9px;font-weight:700;color:#475569;">
                <span style="display:inline-block;padding:2px 6px;background:#eff6ff;color:#2563eb;border-radius:3px;margin-right:4px;">${group.entregas} ent.</span>
                <span style="display:inline-block;padding:2px 6px;background:#eef2ff;color:#4f46e5;border-radius:3px;margin-right:4px;">${group.retiros} ret.</span>
                <span style="display:inline-block;padding:2px 6px;background:#e2e8f0;color:#334155;border-radius:3px;">${group.cajas} cajas · ${group.bultos} bultos</span>
                ${group.pendientes > 0 ? `<span style="display:inline-block;padding:2px 6px;background:#fef3c7;color:#92400e;border-radius:3px;margin-left:4px;">⚠️ ${group.pendientes} pend.</span>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;

    const movRows = group.movimientos.map((mov, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
      const numIdx = String(globalEmailIndex++).padStart(2, '0');
      const info = getMovementDisplayInfo(mov);

      const idCirugiaBadge = mov.id_cirugia_snapshot 
        ? `<div style="margin-top:4px;"><span style="display:inline-block;padding:2px 5px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;font-family:Consolas,monospace;font-size:8px;font-weight:700;color:#475569;">${mov.id_cirugia_snapshot}</span></div>` 
        : '';
      
      const horaBadge = info.horaInfo 
        ? `<div style="margin-top:4px;font-size:9px;color:#64748b;font-weight:700;">⏰ ${info.horaInfo.hora} ${info.horaInfo.isFueraDeCorte ? '<span style="display:inline-block;padding:1px 4px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:3px;font-size:8px;font-weight:800;">FUERA DE CORTE</span>' : ''}</div>`
        : '';

      const clienteSpan = mov.cliente_snapshot ? `<div style="margin-top:3px;font-size:9px;line-height:12px;color:#64748b;">🏢 ${mov.cliente_snapshot}</div>` : '';
      const medSpan = mov.medico_snapshot ? `<div style="font-size:10px;line-height:13px;font-weight:700;color:#334155;">👨‍⚕️ ${mov.medico_snapshot}</div>` : `<div style="font-size:9px;color:#94a3b8;">${mov.destino || '-'}</div>`;
      
      let subDetailHtml = info.subDetail 
        ? `<div style="margin-bottom:4px;padding:5px 8px;background:#f3e8ff;border-left:3px solid #7e22ce;border-radius:3px;font-size:10px;line-height:13px;color:#581c87;"><strong>Motivo:</strong> ${info.subDetail}</div>` 
        : '';

      let pendHtml = mov.tiene_pendiente 
        ? `<div style="margin-top:4px;background-color:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:3px 5px;border-radius:4px;font-weight:bold;font-size:9px;">⚠️ Pendiente: ${mov.detalle_pendiente || ''}</div>` 
        : '';

      return `
        <tr bgcolor="${bg}">
          <td align="center" valign="top" style="padding:10px 6px;border-bottom:1px solid #f1f5f9;font-size:10px;color:#94a3b8;font-weight:700;">${numIdx}</td>
          <td valign="top" style="padding:10px 8px;border-bottom:1px solid #f1f5f9;">
            <span style="${info.inlineHtml}">${info.displayTitle}</span>
            ${horaBadge}
            ${idCirugiaBadge}
          </td>
          <td valign="top" style="padding:10px 8px;border-bottom:1px solid #f1f5f9;">
            <div style="font-size:11px;line-height:14px;font-weight:800;color:#0f172a;">${mov.paciente_snapshot || mov.destino || 'Sin especificar'}</div>
            ${clienteSpan}
          </td>
          <td valign="top" style="padding:10px 8px;border-bottom:1px solid #f1f5f9;">
            ${medSpan}
          </td>
          <td valign="top" style="padding:10px 8px;border-bottom:1px solid #f1f5f9;">
            ${subDetailHtml}
            <div style="font-size:10px;line-height:14px;color:#475569;">${info.cleanObs || (!info.subDetail ? '<span style="color:#94a3b8;font-style:italic;">Sin notas</span>' : '')}</div>
            ${pendHtml}
          </td>
          <td align="center" valign="middle" style="padding:10px 4px;border-bottom:1px solid #f1f5f9;font-size:11px;font-weight:800;color:#0f172a;">${mov.cantidad_cajas || 0}</td>
          <td align="center" valign="middle" style="padding:10px 4px;border-bottom:1px solid #f1f5f9;font-size:11px;font-weight:800;color:#0f172a;">${mov.cantidad_bultos || 0}</td>
        </tr>
      `;
    }).join('');

    return groupHeader + movRows;
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
    @media only screen and (max-width: 680px) {
      .email-shell { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .px { padding-left: 12px !important; padding-right: 12px !important; }
      .kpi-wrap { display: block !important; width: 100% !important; }
      .kpi-cell { width: 33.33% !important; display: inline-block !important; box-sizing: border-box !important; vertical-align: top !important; padding: 2px !important; }
    }
  </style>
</head>

<body>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#eef2f7">
  <tr>
    <td align="center" style="padding:16px 6px;">

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
                <td valign="top" style="width:70%;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="font-size:16px;line-height:18px;font-weight:800;color:#2563eb;letter-spacing:-0.1px;">
                        DISTRICORR · GESTIÓN IQ
                      </td>
                      <td style="padding-left:8px;">
                        <span style="display:inline-block;padding:3px 7px;border-radius:999px;background:#dcfce7;color:#166534;font-size:9px;line-height:11px;font-weight:800;letter-spacing:.35px;">
                          ENVIADO
                        </span>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top:5px;font-size:17px;line-height:21px;font-weight:800;color:#0f172a;">
                    Informe Diario de Logística Operativa
                  </div>

                  <div style="margin-top:4px;font-size:11px;line-height:16px;color:#64748b;">
                    ${fechaStr} · <strong style="color:#334155;">${zonaStr}</strong>
                  </div>
                </td>

                <td valign="top" align="right" style="width:30%;font-size:10px;line-height:15px;color:#64748b;">
                  <strong style="color:#334155;">Responsable:</strong> ${responsableStr}<br>
                  <strong style="color:#334155;">Enviado:</strong> ${enviadoTimeStr}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- RESUMEN OPERATIVO SUPERIOR (Prioridad Visual: Entregas, Retiros, Pendientes) -->
        <tr>
          <td class="px" style="padding:0 20px 12px 20px;">
            
            <!-- FILA 1: PRIORIDAD OPERATIVA -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:6px;">
              <tr>
                <!-- Entregas -->
                <td class="kpi-cell" width="33.33%" style="padding-right:4px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
                    <tr>
                      <td style="padding:8px 10px;">
                        <div style="font-size:18px;line-height:20px;font-weight:800;color:#1d4ed8;">${emailStats.totalEntregas}</div>
                        <div style="font-size:9px;line-height:11px;font-weight:800;color:#2563eb;letter-spacing:.3px;">ENTREGAS</div>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Retiros -->
                <td class="kpi-cell" width="33.33%" style="padding-left:2px;padding-right:2px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;">
                    <tr>
                      <td style="padding:8px 10px;">
                        <div style="font-size:18px;line-height:20px;font-weight:800;color:#4338ca;">${emailStats.totalRetiros}</div>
                        <div style="font-size:9px;line-height:11px;font-weight:800;color:#4f46e5;letter-spacing:.3px;">RETIROS</div>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Pendientes -->
                <td class="kpi-cell" width="33.33%" style="padding-left:4px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
                    <tr>
                      <td style="padding:8px 10px;">
                        <div style="font-size:18px;line-height:20px;font-weight:800;color:#b45309;">${emailStats.totalPendientes}</div>
                        <div style="font-size:9px;line-height:11px;font-weight:800;color:#b45309;letter-spacing:.3px;">PENDIENTES</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- FILA 2: TOTALES Y CARGA -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <!-- Total Movs -->
                <td class="kpi-cell" width="33.33%" style="padding-right:4px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                    <tr>
                      <td style="padding:7px 10px;">
                        <span style="font-size:14px;font-weight:800;color:#0f172a;">${emailStats.totalMovimientos}</span>
                        <span style="font-size:9px;font-weight:700;color:#64748b;margin-left:4px;">MOVIMIENTOS</span>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Cajas -->
                <td class="kpi-cell" width="33.33%" style="padding-left:2px;padding-right:2px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                    <tr>
                      <td style="padding:7px 10px;">
                        <span style="font-size:14px;font-weight:800;color:#0f172a;">${emailStats.totalCajas}</span>
                        <span style="font-size:9px;font-weight:700;color:#64748b;margin-left:4px;">CAJAS / EQUIPOS</span>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Bultos -->
                <td class="kpi-cell" width="33.33%" style="padding-left:4px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                         style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                    <tr>
                      <td style="padding:7px 10px;">
                        <span style="font-size:14px;font-weight:800;color:#0f172a;">${emailStats.totalBultos}</span>
                        <span style="font-size:9px;font-weight:700;color:#64748b;margin-left:4px;">BULTOS</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        ${obsGenHtml}

        <!-- SEPARADOR + TÍTULO TABLA DETALLE -->
        <tr>
          <td class="px" style="padding:4px 20px 6px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="font-size:12px;line-height:16px;font-weight:800;color:#0f172a;">
                  📋 Detalle de movimientos agrupados por institución
                </td>
                <td align="right" style="font-size:9px;line-height:12px;color:#64748b;">
                  ${movsList.length} registros
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TABLA DETALLE AGRUPADA -->
        <tr>
          <td class="px" style="padding:0 20px 14px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                   style="width:100%;border:1px solid #dbe3ee;border-radius:8px;overflow:hidden;">

              <tr bgcolor="#142033">
                <th align="center" style="width:4%;padding:8px 6px;font-size:9px;color:#fff;">#</th>
                <th align="left" style="width:18%;padding:8px 8px;font-size:9px;color:#fff;">MOVIMIENTO</th>
                <th align="left" style="width:20%;padding:8px 8px;font-size:9px;color:#fff;">PACIENTE / CLIENTE</th>
                <th align="left" style="width:18%;padding:8px 8px;font-size:9px;color:#fff;">MÉDICO / DESTINO</th>
                <th align="left" style="width:28%;padding:8px 8px;font-size:9px;color:#fff;">OBSERVACIONES / NOVEDAD</th>
                <th align="center" style="width:6%;padding:8px 4px;font-size:9px;color:#fff;">CAJAS</th>
                <th align="center" style="width:6%;padding:8px 4px;font-size:9px;color:#fff;">BULTOS</th>
              </tr>

              ${groupedDetailHtml}

            </table>
          </td>
        </tr>

        <!-- SECCIÓN: RESUMEN POR ENTIDAD EN EMAIL (Al final después del detalle) -->
        <tr>
          <td class="px" style="padding:4px 20px 16px 20px;">
            <div style="font-size:12px;line-height:16px;font-weight:800;color:#0f172a;margin-bottom:6px;">
              🏥 Resumen de Actividad por Institución
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                   style="border:1px solid #dbe3ee;border-radius:6px;overflow:hidden;">
              <tr bgcolor="#1e293b">
                <th align="left" style="padding:7px 10px;font-size:9px;color:#ffffff;font-weight:800;">ENTIDAD / INSTITUCIÓN</th>
                <th align="center" style="width:12%;padding:7px 5px;font-size:9px;color:#93c5fd;font-weight:800;">ENTREGAS</th>
                <th align="center" style="width:12%;padding:7px 5px;font-size:9px;color:#a5b4fc;font-weight:800;">RETIROS</th>
                <th align="center" style="width:14%;padding:7px 5px;font-size:9px;color:#ffffff;font-weight:800;">CAJAS</th>
                <th align="center" style="width:12%;padding:7px 5px;font-size:9px;color:#ffffff;font-weight:800;">BULTOS</th>
                <th align="center" style="width:14%;padding:7px 5px;font-size:9px;color:#fcd34d;font-weight:800;">PENDIENTES</th>
              </tr>
              ${entitySummaryRows}
              <tr bgcolor="#f1f5f9" style="border-top:2px solid #cbd5e1;">
                <td style="padding:7px 10px;font-size:10px;font-weight:800;color:#0f172a;">TOTAL GENERAL</td>
                <td align="center" style="padding:7px 5px;font-size:11px;font-weight:800;color:#1d4ed8;">${emailStats.totalEntregas}</td>
                <td align="center" style="padding:7px 5px;font-size:11px;font-weight:800;color:#4338ca;">${emailStats.totalRetiros}</td>
                <td align="center" style="padding:7px 5px;font-size:11px;font-weight:800;color:#0f172a;">${emailStats.totalCajas}</td>
                <td align="center" style="padding:7px 5px;font-size:11px;font-weight:800;color:#0f172a;">${emailStats.totalBultos}</td>
                <td align="center" style="padding:7px 5px;font-size:11px;font-weight:800;color:#b45309;">${emailStats.totalPendientes > 0 ? `⚠️ ${emailStats.totalPendientes}` : '0'}</td>
              </tr>
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

        <!-- FOOTER MÍNIMO -->
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

const handleReopenInforme = async () => {
  if (!informe.value?.id) return;
  try {
    isReopening.value = true;
    const { data: res, error } = await supabase.rpc('reabrir_informe_logistica', {
      p_informe_id: informe.value.id,
      p_motivo: reopenReason.value.trim() || null
    });

    if (error) throw error;
    if (res && !res.success) {
      throw new Error(res.error || 'No se pudo reabrir el informe');
    }

    toast.success('Jornada reabierta exitosamente.');
    showReopenModal.value = false;
    router.push({ name: 'LogisticaNuevoInforme', query: { id: informe.value.id } });
  } catch (err) {
    toast.error('Error al reabrir el informe: ' + (err.message || 'Error inesperado'));
  } finally {
    isReopening.value = false;
  }
};
</script>
