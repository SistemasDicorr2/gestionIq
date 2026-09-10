<!-- src/views/admin/HistorialPagosView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950/10 min-h-screen">
    <div class="mb-6">
      <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Auditoría y Correcciones</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">Auditá el historial de pagos, detectá comprobantes faltantes y utilizá las herramientas para corregir de forma masiva o individual.</p>
    </div>

    <!-- TARJETAS KPI DE SALUD DE CONCILIACIONES -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
      <!-- Total Órdenes -->
      <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Órdenes Registradas</span>
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
            {{ historial.length }}
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
          📜
        </div>
      </div>

      <!-- Con Comprobante -->
      <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Con Comprobante Digital</span>
          <span class="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 block">
            {{ totalWithReceipt }}
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
          ✓
        </div>
      </div>

      <!-- Sin Comprobante (Filtro Interactivo) -->
      <div 
        @click="toggleFilterOnlyMissing" 
        :class="[
          'p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between shadow-2xs',
          filterOnlyMissing 
            ? 'bg-rose-50 dark:bg-rose-955/60 border-rose-400 dark:border-rose-700 ring-2 ring-rose-500/20' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
        ]"
      >
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Sin Comprobante Adjunto</span>
            <span v-if="filterOnlyMissing" class="text-[9px] px-1.5 py-0.2 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded-full font-bold">Filtrado Activo</span>
          </div>
          <span class="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono mt-0.5 block">
            {{ totalWithoutReceipt }}
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-955 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg font-bold">
          ⚠️
        </div>
      </div>
    </div>

    <!-- BANNER DE ALERTA DE ÚLTIMA CONCILIACIÓN CON COMPROBANTES FALTANTES -->
    <div 
      v-if="latestBatchMissingCount > 0 && activeTab === 'historial'" 
      class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
          ⚠️
        </div>
        <div>
          <h3 class="text-sm font-black">
            Última Conciliación: {{ latestBatchMissingCount }} {{ latestBatchMissingCount === 1 ? 'orden no tiene comprobante cargado' : 'órdenes no tienen comprobantes cargados' }}
          </h3>
          <p class="text-xs text-amber-100 font-medium">
            Usá el Auto-Matcher masivo para subir todos los comprobantes juntos sin tener que buscarlos uno a uno.
          </p>
        </div>
      </div>

      <button 
        @click="isModalAutoMatcherVisible = true" 
        class="px-4 py-2 bg-white text-slate-900 hover:bg-amber-50 font-black text-xs rounded-xl shadow-md transition cursor-pointer self-end sm:self-auto shrink-0 flex items-center gap-1.5 active:scale-95"
      >
        <span>🧲 Auto-Vincular Comprobantes Masivo ➔</span>
      </button>
    </div>

    <!-- Sistema de Pestañas y Acciones Principales -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl inline-flex gap-1.5 border border-slate-200/50 dark:border-slate-800/40 w-fit">
        <button
          @click="activeTab = 'historial'"
          :class="[
            'px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 cursor-pointer',
            activeTab === 'historial'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200/40 dark:border-slate-700/30 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205'
          ]"
        >
          Historial de Órdenes
        </button>
        <button
          @click="activeTab = 'herramientas'"
          :class="[
            'px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 cursor-pointer',
            activeTab === 'herramientas'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200/40 dark:border-slate-700/30 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205'
          ]"
        >
          Herramientas de Corrección
        </button>
      </div>

      <!-- Acciones de Reportes y Automatización -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button 
          type="button"
          @click="isModalAutoMatcherVisible = true"
          class="px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Emparejar y subir múltiples comprobantes bancarios en lote"
        >
          <span>🧲 Auto-Matcher Masivo</span>
        </button>

        <button 
          type="button"
          @click="isModalAutomatizacionVisible = true"
          class="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          title="Configurar día, horario y destinatarios para el envío automático de reportes en PDF"
        >
          <span class="text-base">⚙️</span>
          <span>Automatizar Reporte</span>
        </button>

        <!-- Botón de Reporte Ejecutivo por Período -->
        <button 
          type="button"
          @click="isModalPeriodoVisible = true"
          class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Generar Reporte por Período</span>
        </button>
      </div>
    </div>

    <!-- Contenido de la Pestaña "Historial" -->
    <div v-show="activeTab === 'historial'" class="space-y-6">
      <div v-if="isLoading" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
        <div class="inline-block w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-slate-500 dark:text-slate-400 mt-3 text-sm font-medium">Cargando historial de pagos...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200/60 dark:border-red-900/30 text-center text-sm font-medium shadow-sm">
        <p>Error al cargar el historial: {{ error }}</p>
      </div>

      <div v-else-if="historial.length === 0" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Aún no se han registrado órdenes de pago en el sistema.</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Panel de Filtros Moderno -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filtros de Búsqueda</h3>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200/50 dark:border-slate-700/50">
                Mostrando {{ filteredHistorial.length }} de {{ historial.length }} {{ historial.length === 1 ? 'orden' : 'órdenes' }}
              </span>
            </div>
            <button 
              v-if="hasActiveFilters" 
              @click="clearFilters" 
              class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar Filtros
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Buscar por ID, DNI o Profesional</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
                <input type="text" v-model="dniFilter" placeholder="Ej: #15, 12345678 o Nombre..." class="form-input-premium"/>
              </div>
            </div>
            
            <div class="space-y-1.5">
              <label for="start-date" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha Desde</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
                <input id="start-date" type="date" v-model="startDateFilter" class="form-input-premium"/>
              </div>
            </div>
            
            <div class="space-y-1.5">
              <label for="end-date" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha Hasta</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
                <input id="end-date" type="date" v-model="endDateFilter" class="form-input-premium"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Historial Premium -->
        <div v-if="filteredHistorial.length === 0" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">No se encontraron órdenes de pago que coincidan con los filtros aplicados.</p>
        </div>

        <div v-else class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60">
              <thead class="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/60">
                <tr>
                  <th class="table-header">ID Orden</th>
                  <th class="table-header">Fecha de Emisión</th>
                  <th class="table-header">Monto Total</th>
                  <th class="table-header">Instrumentador(es)</th>
                  <th class="table-header text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                <tr v-for="orden in filteredHistorial" :key="orden.id" class="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors duration-150">
                  <td class="table-cell">
                    <span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 font-mono">
                      #{{ orden.id }}
                    </span>
                  </td>
                  <td class="table-cell text-slate-600 dark:text-slate-350">
                    {{ formatDate(orden.fecha_emision) }}
                  </td>
                  <td class="table-cell font-bold text-slate-900 dark:text-slate-100">
                    {{ formatCurrency(orden.monto_total_general) }}
                  </td>
                  <td class="table-cell text-xs text-slate-600 dark:text-slate-350 max-w-xs truncate" :title="orden.instrumentadores_nombres">
                    {{ orden.instrumentadores_nombres }}
                  </td>
                  <td class="table-cell text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="verDetalle(orden)" class="btn-detail">
                        Ver Detalle
                      </button>
                      <button 
                        @click="descargarPDFOrden(orden)" 
                        :disabled="loadingPdfOrdenId === orden.id"
                        class="btn-icon-pdf" 
                        title="Descargar Reporte PDF de la Orden"
                      >
                        <div v-if="loadingPdfOrdenId === orden.id" class="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </button>
                      <button @click="abrirCompartir(orden)" class="btn-icon-share" title="Compartir Enlace">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l5.302 3.111m0 0a2.25 2.25 0 103.515 2.186m-3.515-2.186l-5.302-3.111m0 0a2.25 2.25 0 103.515-2.186m-3.515 2.186l5.302-3.111" />
                        </svg>
                      </button>
                      <!-- Comprobante Bancario -->
                      <a v-if="orden.comprobante_object_key" 
                         :href="getComprobanteUrl(orden.comprobante_object_key)" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         class="btn-icon-premium"
                         title="Ver / Descargar Comprobante Bancario">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                      </a>
                      <button v-else 
                              @click="irACorregirComprobante(orden)"
                              class="px-2.5 py-1 rounded-xl text-[11px] font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-955 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Sin comprobante bancario adjunto (Haz clic para adjuntar)">
                        <span>📎 Adjuntar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido de la Pestaña "Herramientas" -->
    <div v-show="activeTab === 'herramientas'">
      <CorrectionWorkspace 
        ref="correctionWorkspaceRef" 
        @open-auto-matcher="isModalAutoMatcherVisible = true" 
        @updated="fetchHistorial" 
      />
    </div>

    <!-- Modal Auto-Matcher Masivo de Comprobantes -->
    <AutoMatcherComprobantesModal
      :show="isModalAutoMatcherVisible"
      :orders="historial"
      @close="isModalAutoMatcherVisible = false"
      @updated="fetchHistorial"
    />

    <!-- Modal Reporte Ejecutivo por Período / Instrumentador -->
    <ModalReportePagosPeriodo
      :show="isModalPeriodoVisible"
      :historial="historial"
      @close="isModalPeriodoVisible = false"
    />

    <!-- Modal Configuración de Automatización Semanal de Pagos -->
    <ConfigurarAutomatizacionPagosModal
      :show="isModalAutomatizacionVisible"
      @close="isModalAutomatizacionVisible = false"
    />

    <!-- Modal Compartir Enlace/Mensaje -->
    <Transition name="fade">
      <div v-if="isShareModalVisible" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/80 w-full max-w-lg overflow-hidden transition-all duration-300">
          
          <header class="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Compartir Acceso</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Orden #{{ selectedOrdenForShare?.id }} — Enlaces y mensajes para los instrumentadores.</p>
              </div>
              <button @click="cerrarCompartir" class="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <main class="p-5 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30">
            <div v-for="inst in shareInstrumentadores" :key="inst.dni" class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ inst.nombre }}</h4>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">DNI: {{ inst.dni }}</p>
                </div>
                <div v-if="inst.loading" class="flex items-center gap-1 text-xs text-slate-500">
                  <div class="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span>Generando...</span>
                </div>
              </div>

              <div v-if="!inst.loading" class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button 
                  @click="copiarTexto(getShareLink(inst), 'Enlace')"
                  :disabled="!inst.token"
                  class="btn-share-action"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Copiar Enlace</span>
                </button>
                <button 
                  @click="copiarTexto(getWhatsAppMessage(inst), 'Mensaje de WhatsApp')"
                  :disabled="!inst.token"
                  class="btn-share-action text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Mensaje WhatsApp</span>
                </button>
                <button 
                  @click="descargarPDFInstrumentador(inst)"
                  :disabled="loadingPdfInstDni === inst.dni"
                  class="btn-share-action text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60"
                >
                  <div v-if="loadingPdfInstDni === inst.dni" class="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>
          </main>

          <footer class="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
            <button @click="cerrarCompartir" class="btn-close-modal">
              Cerrar
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import { useReportePagosPDF } from '../../composables/useReportePagosPDF';
import OrdenDePagoDetalleModal from '../../components/admin/OrdenDePagoDetalleModal.vue';
import ModalReportePagosPeriodo from '../../components/admin/ModalReportePagosPeriodo.vue';
import ConfigurarAutomatizacionPagosModal from '../../components/admin/ConfigurarAutomatizacionPagosModal.vue';
import CorrectionWorkspace from '../../components/admin/corrections/CorrectionWorkspace.vue';
import AutoMatcherComprobantesModal from '../../components/admin/corrections/AutoMatcherComprobantesModal.vue';

const { showSuccessToast, showErrorToast } = useToasts();
const { generarReporteDesdeDetalleOrden } = useReportePagosPDF();

const activeTab = ref('historial');
const historial = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isModalVisible = ref(false);
const isModalPeriodoVisible = ref(false);
const isModalAutomatizacionVisible = ref(false);
const isModalAutoMatcherVisible = ref(false);
const correctionWorkspaceRef = ref(null);
const selectedOrdenId = ref(null);
const dniFilter = ref('');
const startDateFilter = ref('');
const endDateFilter = ref('');
const filterOnlyMissing = ref(false);

// Estado de carga para PDFs
const loadingPdfOrdenId = ref(null);
const loadingPdfInstDni = ref(null);

// Compartir
const isShareModalVisible = ref(false);
const selectedOrdenForShare = ref(null);
const shareInstrumentadores = ref([]);

// Métricas de salud de comprobantes
const totalWithReceipt = computed(() => {
  return historial.value.filter(o => Boolean(o.comprobante_object_key)).length;
});

const totalWithoutReceipt = computed(() => {
  return historial.value.filter(o => !o.comprobante_object_key).length;
});

const latestBatchMissingCount = computed(() => {
  if (!historial.value || historial.value.length === 0) return 0;
  const latestDateStr = historial.value[0]?.fecha_emision ? String(historial.value[0].fecha_emision).substring(0, 10) : null;
  if (!latestDateStr) return 0;
  return historial.value.filter(o => String(o.fecha_emision || '').substring(0, 10) === latestDateStr && !o.comprobante_object_key).length;
});

function toggleFilterOnlyMissing() {
  filterOnlyMissing.value = !filterOnlyMissing.value;
}

function irACorregirComprobante(orden) {
  activeTab.value = 'herramientas';
  setTimeout(() => {
    correctionWorkspaceRef.value?.selectOrder(orden);
  }, 100);
}

const hasActiveFilters = computed(() => {
  return Boolean(dniFilter.value.trim() || startDateFilter.value || endDateFilter.value || filterOnlyMissing.value);
});

function clearFilters() {
  dniFilter.value = '';
  startDateFilter.value = '';
  endDateFilter.value = '';
  filterOnlyMissing.value = false;
}

const filteredHistorial = computed(() => {
  let items = historial.value;

  if (dniFilter.value.trim()) {
    const rawSearch = dniFilter.value.trim().toLowerCase();
    const searchWithoutHash = rawSearch.replace(/^#/, '');

    items = items.filter(orden => {
      // 1. Coincidencia por ID de Orden (soporta "#15" o "15")
      const matchId = String(orden.id || '').toLowerCase().includes(searchWithoutHash);

      // 2. Coincidencia por DNI (soporta arreglo, string o números)
      let matchDni = false;
      if (Array.isArray(orden.instrumentadores_dnis)) {
        matchDni = orden.instrumentadores_dnis.some(dni => String(dni).toLowerCase().includes(rawSearch));
      } else if (orden.instrumentadores_dnis) {
        matchDni = String(orden.instrumentadores_dnis).toLowerCase().includes(rawSearch);
      }

      // 3. Coincidencia por Nombre (soporta arreglo o string)
      let matchNombre = false;
      if (Array.isArray(orden.instrumentadores_nombres)) {
        matchNombre = orden.instrumentadores_nombres.some(n => String(n).toLowerCase().includes(rawSearch));
      } else if (orden.instrumentadores_nombres) {
        matchNombre = String(orden.instrumentadores_nombres).toLowerCase().includes(rawSearch);
      }

      return matchId || matchDni || matchNombre;
    });
  }

  if (startDateFilter.value) {
    items = items.filter(orden => {
      if (!orden.fecha_emision) return false;
      const fechaStr = String(orden.fecha_emision).substring(0, 10);
      return fechaStr >= startDateFilter.value;
    });
  }

  if (endDateFilter.value) {
    items = items.filter(orden => {
      if (!orden.fecha_emision) return false;
      const fechaStr = String(orden.fecha_emision).substring(0, 10);
      return fechaStr <= endDateFilter.value;
    });
  }

  if (filterOnlyMissing.value) {
    items = items.filter(orden => !orden.comprobante_object_key);
  }

  return items;
});

async function fetchHistorial() {
  try {
    isLoading.value = true;
    const { data, error: rpcError } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (rpcError) throw rpcError;
    historial.value = data || [];
  } catch (err) {
    console.error('Error al obtener el historial de pagos:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function verDetalle(orden) {
  selectedOrdenId.value = orden.id;
  isModalVisible.value = true;
}

function closeModal() {
  isModalVisible.value = false;
  selectedOrdenId.value = null;
}

async function descargarPDFOrden(orden) {
  try {
    loadingPdfOrdenId.value = orden.id;
    const { data: detalle, error: rpcErr } = await supabase.rpc('obtener_detalle_orden_pago', {
      p_orden_id: orden.id
    });
    if (rpcErr) throw rpcErr;
    if (!detalle) throw new Error('No se encontraron detalles para la orden.');
    generarReporteDesdeDetalleOrden(detalle);
    showSuccessToast(`Reporte oficial de Orden #${orden.id} descargado.`);
  } catch (err) {
    console.error('Error al generar PDF de la orden:', err);
    showErrorToast(err, 'No se pudo generar el reporte PDF de la orden.');
  } finally {
    loadingPdfOrdenId.value = null;
  }
}

async function descargarPDFInstrumentador(inst) {
  if (!selectedOrdenForShare.value) return;
  try {
    loadingPdfInstDni.value = inst.dni;
    const ordenId = selectedOrdenForShare.value.id;
    const { data: detalle, error: rpcErr } = await supabase.rpc('obtener_detalle_orden_pago', {
      p_orden_id: ordenId
    });
    if (rpcErr) throw rpcErr;
    if (!detalle) throw new Error('No se encontraron detalles para la orden.');
    generarReporteDesdeDetalleOrden(detalle, inst.dni);
    showSuccessToast(`Reporte oficial para ${inst.nombre} descargado.`);
  } catch (err) {
    console.error('Error al generar PDF del instrumentador:', err);
    showErrorToast(err, 'No se pudo generar el reporte PDF.');
  } finally {
    loadingPdfInstDni.value = null;
  }
}

function getShareLink(inst) {
  if (!inst.token) return '';
  return `${window.location.origin}/resumen/${inst.token}`;
}

function getWhatsAppMessage(inst) {
  const nombrePila = inst.nombre ? inst.nombre.split(' ')[0] : 'colega';
  const accessLink = getShareLink(inst);
  if (!accessLink) return '';
  return `¡Hola ${nombrePila}! Te informo que ya se cargaron tus nuevos comprobantes de pago. Podés acceder a ver el detalle y descargarlos desde el siguiente enlace:\n${accessLink}\n\nAnte cualquier duda, no dudes en consultarnos. ¡Muchas gracias!`;
}

async function copiarTexto(texto, tipo) {
  try {
    await navigator.clipboard.writeText(texto);
    showSuccessToast(`¡${tipo} copiado al portapapeles!`);
  } catch (err) {
    showErrorToast(err, 'No se pudo copiar el texto.');
  }
}

async function abrirCompartir(orden) {
  selectedOrdenForShare.value = orden;
  isShareModalVisible.value = true;
  
  let nombres = [];
  if (Array.isArray(orden.instrumentadores_nombres)) {
    nombres = orden.instrumentadores_nombres;
  } else if (typeof orden.instrumentadores_nombres === 'string') {
    nombres = orden.instrumentadores_nombres.split(', ').map(s => s.trim()).filter(Boolean);
  }

  let dnis = [];
  if (Array.isArray(orden.instrumentadores_dnis)) {
    dnis = orden.instrumentadores_dnis;
  } else if (typeof orden.instrumentadores_dnis === 'string') {
    dnis = orden.instrumentadores_dnis.split(', ').map(s => s.trim()).filter(Boolean);
  }
  
  shareInstrumentadores.value = nombres.map((nombre, index) => ({
    nombre,
    dni: String(dnis[index] || ''),
    token: null,
    loading: false
  }));

  // Cargar tokens de forma segura y secuencial
  for (const inst of shareInstrumentadores.value) {
    if (inst.dni) {
      inst.loading = true;
      try {
        const { data: token, error: rpcError } = await supabase.rpc('generar_activity_token', { 
          p_instrumentador_dni: inst.dni 
        });
        if (rpcError) throw rpcError;
        inst.token = token;
      } catch (err) {
        console.error(`Error al generar el token para ${inst.nombre}:`, err);
      } finally {
        inst.loading = false;
      }
    }
  }
}

function cerrarCompartir() {
  isShareModalVisible.value = false;
  selectedOrdenForShare.value = null;
  shareInstrumentadores.value = [];
}

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
const getComprobanteUrl = (objectKey) => {
  if (!objectKey) return '#';
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

onMounted(() => {
  fetchHistorial();
});

watch(activeTab, (newTab) => {
  if (newTab === 'historial') {
    fetchHistorial();
  }
});
</script>

<style scoped>
.form-input-premium {
  @apply w-full px-4 py-3 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-0;
}

.table-header {
  @apply px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200;
}

.btn-detail {
  @apply bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-4 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-icon-premium {
  @apply p-2 rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30;
  @apply hover:bg-indigo-100 dark:hover:bg-indigo-950 hover:text-indigo-800 dark:hover:text-indigo-300;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center;
}

.btn-icon-share {
  @apply p-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/30;
  @apply hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-800 dark:hover:text-emerald-300;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center;
}

.btn-icon-pdf {
  @apply p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100/50 dark:border-rose-900/30;
  @apply hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-800 dark:hover:text-rose-300;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-share-action {
  @apply flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold;
  @apply text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80;
  @apply border border-slate-200/50 dark:border-slate-700/50 shadow-sm;
  @apply hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white;
  @apply active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100;
}

.btn-close-modal {
  @apply px-4 py-2 rounded-xl text-xs font-semibold shadow-sm;
  @apply text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800;
  @apply border border-slate-200/40 dark:border-slate-700/60;
  @apply hover:bg-slate-200/80 dark:hover:bg-slate-700;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

/* Transición fade para el modal */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>