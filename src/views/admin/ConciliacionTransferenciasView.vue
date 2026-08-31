<!-- src/views/admin/ConciliacionTransferenciasView.vue -->
<template>
  <div class="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6 bg-slate-50/50 dark:bg-slate-950/30 min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
    
    <!-- ENCABEZADO RESPONSIVO Y SELECTOR DE PESTAÑAS (CONCILIADOR vs HISTORIAL) -->
    <header class="mb-4 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 mb-0.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            ADMINISTRACIÓN
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Pagos y Transferencias</span>
          
          <!-- Feedback Discreto de Guardado -->
          <span v-if="saveStatus === 'saving' && activeMainTab === 'conciliador'" class="text-[11px] text-amber-700 dark:text-amber-300 font-mono font-bold animate-pulse flex items-center gap-1 ml-2">
            <span>🌀</span> Guardando borrador...
          </span>
          <span v-else-if="saveStatus === 'saved' && activeMainTab === 'conciliador'" class="text-[11px] text-slate-600 dark:text-slate-300 font-mono font-bold flex items-center gap-1 ml-2">
            <span>💾</span> Guardado en borrador
          </span>
        </div>
        <h1 class="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Conciliación de Transferencias
        </h1>
      </div>

      <!-- SELECTOR DE PESTAÑAS (CONCILIADOR ACTIVO VS HISTORIAL DE CONCILIACIONES) -->
      <div class="flex items-center gap-2 self-stretch md:self-auto">
        <div class="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 w-full md:w-auto">
          <button 
            @click="activeMainTab = 'conciliador'"
            :class="[
              'flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer text-center',
              activeMainTab === 'conciliador' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            ⚡ Conciliador Activo
          </button>
          <button 
            @click="switchToHistorialTab"
            :class="[
              'flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer text-center flex items-center justify-center gap-1',
              activeMainTab === 'historial' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <span>📜 Historial Efectuados</span>
            <span v-if="historialConciliaciones.length > 0" class="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
              {{ historialConciliaciones.length }}
            </span>
          </button>
        </div>

        <!-- BOTÓN ÚNICO CANÓNICO "+ CARGAR NUEVA CONCILIACIÓN" -->
        <div v-if="activeMainTab === 'conciliador'" class="relative" ref="nuevaConciliacionMenuRef">
          <input type="file" ref="excelInputRef" @change="handleExcelUpload" accept=".xlsx,.xls,.csv" class="hidden" />
          <input type="file" ref="fileInputRef" @change="handleFileInputChange" multiple accept="image/*,application/pdf" class="hidden" />

          <div class="flex items-center gap-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all active:scale-95">
            <button 
              @click="iniciarNuevaConciliacion('comprobantes')" 
              class="px-3.5 py-2 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Cargar Nueva Conciliación</span>
            </button>
            <button 
              @click="isNuevaMenuOpen = !isNuevaMenuOpen" 
              class="px-2.5 py-2 border-l border-indigo-500/80 hover:bg-indigo-800 rounded-r-xl cursor-pointer flex items-center justify-center"
              title="Opciones de carga"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          <!-- Desplegable de Opciones de Carga -->
          <Transition name="fade">
            <div 
              v-if="isNuevaMenuOpen" 
              class="absolute right-0 mt-1.5 w-60 origin-top-right rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 z-50 p-1.5 border border-slate-200 dark:border-slate-800"
            >
              <button 
                @click="iniciarNuevaConciliacion('comprobantes')" 
                class="flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-xl text-slate-800 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-bold"
              >
                <span class="text-base">📄</span>
                <div class="text-left">
                  <div class="font-extrabold text-slate-900 dark:text-white">Comprobantes de Pago</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Subir PDFs o fotos de transferencias</div>
                </div>
              </button>

              <button 
                @click="iniciarNuevaConciliacion('excel')" 
                class="flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-xl text-slate-800 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-bold mt-1"
              >
                <span class="text-base">📊</span>
                <div class="text-left">
                  <div class="font-extrabold text-slate-900 dark:text-white">Planilla ERP / Libro Mayor</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Subir archivo Excel (.xlsx / .csv)</div>
                </div>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- PESTAÑA 1: CONCILIADOR ACTIVO -->
    <div v-if="activeMainTab === 'conciliador'">
      
      <!-- BANNER DE BORRADOR RECUPERABLE -->
      <Transition name="fade-slide">
        <section v-if="hasPendingDraftBanner && !isDraftRestored" class="mb-4 p-3.5 sm:p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-955/40 border-2 border-indigo-300 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              📂
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Tenés un borrador guardado del {{ pendingDraftDate }} ({{ pendingDraftFilesCount }} comprobantes).
              </h3>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-auto">
            <button 
              @click="restoreDraft" 
              class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs cursor-pointer transition active:scale-95"
            >
              Continuar Borrador ➔
            </button>
            <button 
              @click="discardDraft" 
              class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition"
            >
              Iniciar Nueva
            </button>
          </div>
        </section>
      </Transition>

      <!-- RESUMEN FINAL DE CIERRE DE LOTE -->
      <Transition name="fade-slide">
        <section v-if="allFilesConfirmed" class="mb-6 p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                LOTE CONCILIADO EXITOSAMENTE
              </span>
              <h2 class="text-lg sm:text-2xl font-black tracking-tight">
                🎉 ¡Conciliación de Lote Finalizada!
              </h2>
              <p class="text-xs text-emerald-100 font-medium">
                Todos los comprobantes fueron procesados y las cirugías han sido saldadas en el sistema.
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button 
                @click="downloadBatchSummaryPdf" 
                class="px-4 py-2.5 bg-white text-emerald-900 font-black text-xs rounded-xl shadow-md hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>📄 Descargar Resumen PDF</span>
              </button>
              <button 
                @click="clearAllFiles" 
                class="px-4 py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-white font-bold text-xs rounded-xl border border-white/20 transition cursor-pointer"
              >
                ✨ Iniciar Nueva Conciliación
              </button>
            </div>
          </div>

          <!-- Métrica de Lote -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/20 text-xs font-mono">
            <div>
              <span class="text-[10px] text-emerald-200 block font-bold uppercase">Comprobantes</span>
              <span class="text-base font-black">{{ files.length }}</span>
            </div>
            <div>
              <span class="text-[10px] text-emerald-200 block font-bold uppercase">Monto Total Procesado</span>
              <span class="text-base font-black">${{ formatNumber(batchTotalMonto) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-emerald-200 block font-bold uppercase">Cirugías Saldadas</span>
              <span class="text-base font-black">{{ batchTotalCirugiasCount }}</span>
            </div>
            <div>
              <span class="text-[10px] text-emerald-200 block font-bold uppercase">Saldos Pendientes</span>
              <span class="text-base font-black">${{ formatNumber(batchTotalSaldosPendientes) }}</span>
            </div>
          </div>
        </section>
      </Transition>

      <!-- BANNER INFORMATIVO PLANILLA ERP -->
      <Transition name="fade-slide">
        <section v-if="libroMayorSummary && !allFilesConfirmed" class="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-955/30 border border-emerald-300 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
            <span class="font-extrabold text-slate-900 dark:text-slate-100">
              Planilla ERP activa: <span class="font-mono text-emerald-800 dark:text-emerald-300 font-black truncate max-w-[200px] inline-block align-bottom">{{ libroMayorFileName }}</span> ({{ libroMayorSummary.length }} instrumentadores)
            </span>
          </div>
          <div class="font-mono text-slate-800 dark:text-slate-200 font-extrabold">
            Total esperado ERP: <span class="font-extrabold text-emerald-700 dark:text-emerald-300 text-xs">${{ formatNumber(totalMontoEsperadoERP) }}</span>
          </div>
        </section>
      </Transition>

      <!-- DROPZONE DIRECTA CANÓNICA PARA ARCHIVOS -->
      <section v-if="!allFilesConfirmed" class="mb-4">
        <!-- Dropzone sin archivos -->
        <div 
          v-if="files.length === 0"
          class="border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500 shadow-2xs group"
          :class="{ 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          @click="triggerFileInput"
        >
          <div class="max-w-md mx-auto space-y-2.5 pointer-events-none">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold shadow-2xs group-hover:scale-110 transition-transform">
              📄
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
                Arrastrá los comprobantes de transferencia aquí
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                PDF, JPG o PNG. El sistema los procesará con lectura IA y caché SHA-256 instantánea.
              </p>
            </div>

            <div class="pt-1 flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
              <button 
                type="button" 
                @click.stop="triggerFileInput"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>📁 Seleccionar Comprobantes</span>
              </button>

              <button 
                type="button" 
                @click.stop="excelInputRef?.click()"
                class="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <span>📊</span>
                <span>{{ libroMayorSummary ? 'Planilla ERP Cargada' : 'Cargar Planilla ERP Excel (Opcional)' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Barra Slim cuando hay archivos -->
        <div v-else class="border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-2xs">
          <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
            <span>📎</span>
            <span>Arrastrá más comprobantes o haz clic en añadir.</span>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button @click="triggerFileInput" class="flex-1 sm:flex-initial px-3 py-1 bg-indigo-50 dark:bg-indigo-955 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-extrabold rounded-lg cursor-pointer border border-indigo-200 dark:border-indigo-800">
              + Añadir comprobantes
            </button>
            <button @click="excelInputRef?.click()" class="flex-1 sm:flex-initial px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-extrabold rounded-lg text-slate-900 dark:text-slate-100 cursor-pointer border border-slate-300 dark:border-slate-700">
              📊 Planilla ERP
            </button>
          </div>
        </div>
      </section>



      <!-- PANEL VISOR SLIM EN VIVO DE MÉTRICAS Y PROGRESO -->
      <section v-if="files.length > 0 && !allFilesConfirmed" class="mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <!-- Métricas Numéricas Ultracompactas (1 fila) -->
          <div class="flex items-center gap-3.5 flex-wrap font-mono">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Comprobantes:</span>
              <span class="font-black text-slate-900 dark:text-white text-xs">{{ files.length }}</span>
              <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">({{ batchTotalCirugiasCount }} CX)</span>
            </div>

            <span class="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Total Lote:</span>
              <span class="font-black text-indigo-700 dark:text-indigo-300 text-xs">${{ formatNumber(batchTotalMonto) }}</span>
            </div>

            <span class="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Imputado:</span>
              <span class="font-black text-purple-700 dark:text-purple-300 text-xs">${{ formatNumber(batchTotalImputado) }}</span>
            </div>

            <span class="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Pendiente:</span>
              <span :class="['font-black text-xs', batchTotalSaldosPendientes === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300']">
                ${{ formatNumber(batchTotalSaldosPendientes) }}
              </span>
            </div>
          </div>

          <!-- Barra de Progreso Slim (%) -->
          <div class="flex items-center gap-2.5 shrink-0 min-w-[200px] w-full md:w-auto">
            <div class="grow bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
              <div 
                class="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                :style="{ width: `${batchProgressPercentage}%` }"
              ></div>
            </div>
            <span class="font-mono font-black text-xs text-indigo-700 dark:text-indigo-300 min-w-[36px] text-right">
              {{ batchProgressPercentage }}%
            </span>
          </div>
        </div>
      </section>

      <!-- TABLA PRINCIPAL DE COMPROBANTES CON BOTÓN DE CONCILIACIÓN AUTOMÁTICA EN LOTE -->
      <section v-if="files.length > 0" class="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <!-- Resumen y Acción de Lote en Cabecera de Tabla -->
        <div class="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 bg-slate-100/70 dark:bg-slate-800/60">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Comprobantes ({{ files.length }})
            </h2>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-black border border-emerald-300/60">
              {{ autoConciliadosCount }} Asignados
            </span>
            <span v-if="excepcionesCount > 0" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-black border border-amber-300/60">
              {{ excepcionesCount }} Pendientes
            </span>
          </div>

          <!-- BOTÓN DE CONCILIAR AUTOMÁTICOS EN LOTE -->
          <div class="flex items-center gap-2">
            <button 
              v-if="autoReadyFiles.length > 0"
              @click="confirmarLoteAutomatico"
              :disabled="isSubmitting"
              class="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>⚡ Conciliar {{ autoReadyFiles.length }} automáticos listos</span>
            </button>

            <button @click="clearAllFiles" class="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 font-extrabold cursor-pointer ml-2">
              Limpiar lista
            </button>
          </div>
        </div>

        <!-- VISTA ESCRITORIO -->
        <div class="hidden sm:block w-full">
          <table class="w-full table-fixed text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-extrabold uppercase tracking-wider text-[10px] border-b-2 border-slate-300 dark:border-slate-700">
                <th class="px-3 py-2.5 w-[22%]">Comprobante / Archivo</th>
                <th class="px-3 py-2.5 w-[24%]">Destinatario Detectado</th>
                <th class="px-3 py-2.5 w-[16%] text-right">Monto Transferido</th>
                <th class="px-3 py-2.5 w-[23%]">Instrumentador Asignado</th>
                <th class="px-3 py-2.5 w-[15%] text-right pr-3">Acción / Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr 
                v-for="item in files" 
                :key="item.id"
                :class="[
                  'transition-colors duration-150',
                  activeFileId === item.id 
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-l-4 border-l-indigo-600 font-semibold' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
                  !item.matchedInstrumentador ? 'bg-amber-50/60 dark:bg-amber-955/20 border-l-4 border-l-amber-500' : ''
                ]"
              >
                <!-- Archivo -->
                <td class="px-3 py-2.5 font-bold text-slate-900 dark:text-slate-100">
                  <div class="flex items-center justify-between gap-1.5">
                    <div class="flex items-center gap-1.5 truncate">
                      <span class="text-base shrink-0">📄</span>
                      <span class="truncate block max-w-[140px]" :title="item.name">{{ item.name }}</span>
                    </div>
                    <button 
                      @click.stop="openComprobanteModal(item)"
                      class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
                      title="Ver comprobante con zoom"
                    >
                      <span>👁️ Ver</span>
                    </button>
                  </div>
                  <div class="flex items-center gap-1 mt-0.5">
                    <span v-if="item.isCached" class="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">CACHE SHA-256</span>
                    <span v-if="item.observaciones" class="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold" title="Tiene observaciones">📝 Nota</span>
                  </div>
                </td>

                <!-- Destinatario -->
                <td class="px-3 py-2.5">
                  <div v-if="item.extractedData" class="space-y-0.5">
                    <span class="font-extrabold text-slate-900 dark:text-white block truncate max-w-[190px]" :title="item.extractedData.destinatario_nombre">
                      {{ item.extractedData.destinatario_nombre || 'Sin nombre' }}
                    </span>
                    <span v-if="item.extractedData.destinatario_cuit_cuil" class="text-[11px] text-slate-600 dark:text-slate-300 font-mono font-bold block">
                      CUIT: {{ item.extractedData.destinatario_cuit_cuil }}
                    </span>
                  </div>
                  <div v-else-if="item.status === 'processing'" class="flex items-center gap-2 py-0.5">
                    <div class="relative flex items-center justify-center shrink-0">
                      <span class="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-indigo-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-xs font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                        Leyendo datos...
                      </span>
                      <span class="text-[9px] text-slate-400 font-mono font-semibold">Procesamiento IA + SHA-256</span>
                    </div>
                  </div>
                  <span v-else class="text-slate-500 dark:text-slate-400 italic">Sin datos</span>
                </td>

                <!-- Monto -->
                <td class="px-3 py-2.5 text-right font-mono font-black text-xs text-indigo-700 dark:text-indigo-300">
                  ${{ formatNumber(item.extractedData?.monto_transferido || 0) }}
                </td>

                <!-- Instrumentador -->
                <td class="px-3 py-2.5">
                  <div v-if="item.matchedInstrumentador" class="space-y-1">
                    <div class="flex items-center justify-between gap-1">
                      <span class="font-black text-slate-900 dark:text-white truncate max-w-[130px]" :title="item.matchedInstrumentador.nombre">
                        {{ item.matchedInstrumentador.nombre }}
                      </span>
                      <button 
                        @click="openInstrumentadorSearchModal(item)" 
                        class="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold shrink-0 cursor-pointer"
                      >
                        Cambiar
                      </button>
                    </div>

                    <!-- Botones de copiar link y WhatsApp -->
                    <div class="flex items-center gap-1">
                      <button 
                        @click="copyInstrumentadorLink(item.matchedInstrumentador)"
                        class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-0.5"
                        title="Copiar enlace al portal digital del instrumentador"
                      >
                        <span>🔗 Link</span>
                      </button>

                      <button 
                        @click="copyWhatsAppMessage(item)"
                        class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-955 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer flex items-center gap-0.5"
                        title="Copiar mensaje de aviso para WhatsApp"
                      >
                        <span>💬 WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  <div v-else class="w-full">
                    <button 
                      @click="openInstrumentadorSearchModal(item)"
                      class="w-full px-2.5 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-black text-xs rounded-lg transition cursor-pointer flex items-center justify-between gap-1 border border-amber-300 dark:border-amber-700"
                    >
                      <span class="truncate">🔍 Asignar...</span>
                      <span>➔</span>
                    </button>
                  </div>
                </td>

                <!-- Acción -->
                <td class="px-3 py-2.5 text-right pr-3">
                  <button 
                    @click="openImputacionModal(item)" 
                    :disabled="!item.matchedInstrumentador"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer shadow-xs w-full max-w-[130px] text-center',
                      item.isConfirmed
                        ? item.saldoPendienteInterno > 0 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-emerald-600 text-white'
                        : activeFileId === item.id 
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' 
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed'
                    ]"
                  >
                    <span v-if="item.isConfirmed">
                      {{ item.saldoPendienteInterno > 0 ? `✓ Parcial ($${formatNumber(item.saldoPendienteInterno)})` : '✓ Conciliado' }}
                    </span>
                    <span v-else>Vincular CX ➔</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA MÓVIL (< 640px) -->
        <div class="block sm:hidden divide-y divide-slate-200 dark:divide-slate-800">
          <div 
            v-for="item in files" 
            :key="item.id"
            :class="[
              'p-3 space-y-2 text-xs',
              activeFileId === item.id ? 'bg-indigo-50/80 dark:bg-indigo-955/40 border-l-4 border-l-indigo-600' : '',
              !item.matchedInstrumentador ? 'bg-amber-50/60 dark:bg-amber-955/20 border-l-4 border-l-amber-500' : ''
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 truncate">
                <span class="font-extrabold text-slate-900 dark:text-white truncate">📄 {{ item.name }}</span>
                <button 
                  @click.stop="openComprobanteModal(item)"
                  class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
                  title="Ver comprobante"
                >
                  <span>👁️ Ver</span>
                </button>
              </div>
              <span class="font-mono font-black text-xs text-indigo-700 dark:text-indigo-300 shrink-0">
                ${{ formatNumber(item.extractedData?.monto_transferido || 0) }}
              </span>
            </div>

            <div class="text-xs text-slate-700 dark:text-slate-300">
              <span class="font-black text-slate-900 dark:text-white block">
                Destinatario: {{ item.extractedData?.destinatario_nombre || 'Sin datos' }}
              </span>
              <span v-if="item.extractedData?.destinatario_cuit_cuil" class="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold block">
                CUIT: {{ item.extractedData.destinatario_cuit_cuil }}
              </span>
            </div>

            <div class="pt-1 flex flex-col gap-1.5">
              <div v-if="item.matchedInstrumentador" class="space-y-1 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-black text-emerald-900 dark:text-emerald-200">
                    ✓ {{ item.matchedInstrumentador.nombre }}
                  </span>
                  <button @click="openInstrumentadorSearchModal(item)" class="text-[11px] text-indigo-600 font-extrabold underline">Cambiar</button>
                </div>
                <div class="flex items-center gap-1.5 pt-0.5">
                  <button 
                    @click="copyInstrumentadorLink(item.matchedInstrumentador)"
                    class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-0.5"
                  >
                    <span>🔗 Link</span>
                  </button>

                  <button 
                    @click="copyWhatsAppMessage(item)"
                    class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white transition cursor-pointer flex items-center gap-0.5"
                  >
                    <span>💬 WhatsApp</span>
                  </button>
                </div>
              </div>

              <div v-else>
                <button 
                  @click="openInstrumentadorSearchModal(item)"
                  class="w-full py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs rounded-xl flex items-center justify-center gap-1 border border-amber-300"
                >
                  <span>🔍 Asignar instrumentador...</span>
                </button>
              </div>

              <button 
                @click="openImputacionModal(item)" 
                :disabled="!item.matchedInstrumentador"
                :class="[
                  'w-full py-2 rounded-xl text-xs font-black transition cursor-pointer text-center',
                  item.isConfirmed
                    ? item.saldoPendienteInterno > 0 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30'
                ]"
              >
                <span v-if="item.isConfirmed">
                  {{ item.saldoPendienteInterno > 0 ? `✓ Parcial ($${formatNumber(item.saldoPendienteInterno)})` : '✓ Conciliado' }}
                </span>
                <span v-else>Vincular Cirugías ➔</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- PESTAÑA 2: HISTORIAL DE CONCILIACIONES EFECTUADAS CORRECTAMENTE -->
    <div v-else-if="activeMainTab === 'historial'" class="space-y-4">
      
      <!-- Buscador y Métricas de Historial -->
      <section class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="relative flex-1">
          <input 
            type="text" 
            v-model="historialSearchQuery" 
            placeholder="🔍 Buscar por profesional, DNI u observaciones en el historial..." 
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button @click="fetchConciliacionesHistorial" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shrink-0">
          <span>🔄 Actualizar Historial</span>
        </button>
      </section>

      <!-- TABLA DE HISTORIAL -->
      <section class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div v-if="isHistorialLoading" class="p-8 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
          🌀 Cargando historial de conciliaciones desde Supabase...
        </div>

        <div v-else-if="filteredHistorialConciliaciones.length > 0" class="w-full overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-extrabold uppercase tracking-wider text-[10px] border-b-2 border-slate-300 dark:border-slate-700">
                <th class="px-4 py-3">ID / Fecha Emisión</th>
                <th class="px-4 py-3">Instrumentador / Profesional</th>
                <th class="px-4 py-3 text-right">Monto Conciliado</th>
                <th class="px-4 py-3">Notas Internas & Detalles</th>
                <th class="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="orden in filteredHistorialConciliaciones" :key="orden.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <!-- ID / Fecha -->
                <td class="px-4 py-3 font-mono">
                  <span class="font-black text-slate-900 dark:text-white block">OP-{{ orden.id.slice(0, 8) }}</span>
                  <span class="text-[10px] text-slate-500 font-semibold">{{ formatDate(orden.fecha_emision) }}</span>
                </td>

                <!-- Instrumentador -->
                <td class="px-4 py-3">
                  <span class="font-extrabold text-slate-900 dark:text-white block truncate max-w-[200px]" :title="orden.instrumentadores_nombres?.join(', ')">
                    {{ orden.instrumentadores_nombres?.join(', ') || 'Profesional no especificado' }}
                  </span>
                  <span class="text-[10px] font-mono text-slate-500 font-bold block">
                    DNI: {{ orden.instrumentadores_dnis?.join(', ') || 'N/A' }}
                  </span>
                </td>

                <!-- Monto -->
                <td class="px-4 py-3 text-right font-mono font-black text-indigo-700 dark:text-indigo-300 text-sm">
                  ${{ formatNumber(orden.monto_total || 0) }}
                </td>

                <!-- Notas -->
                <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                  <span class="block truncate max-w-[320px] font-medium text-xs" :title="orden.notas">
                    {{ orden.notas || 'Sin notas adicionadas' }}
                  </span>
                </td>

                <!-- Acción -->
                <td class="px-4 py-3 text-right">
                  <button 
                    @click="downloadIndividualOrderPdf(orden)"
                    class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-extrabold text-xs rounded-lg transition cursor-pointer"
                  >
                    📄 PDF Detalle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-8 text-center text-xs text-slate-500 font-semibold italic">
          No se encontraron conciliaciones efectuadas en el historial.
        </div>
      </section>

    </div>

    <!-- MODAL SLIM COMPACTO: VINCULACIÓN DE CIRUGÍAS -->
    <div v-if="showImputacionModal && activeFile && activeFile.matchedInstrumentador" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-4 sm:p-5 shadow-2xl space-y-3 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Header Ultracompacto Slim -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 shrink-0">
          <div class="flex items-center gap-2 flex-wrap text-xs">
            <span class="text-[9px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-955 px-1.5 py-0.5 rounded">
              VINCULACIÓN (Esc para cerrar)
            </span>
            <span class="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]" :title="activeFile.name">
              📄 {{ activeFile.name }}
            </span>
            <button 
              @click.stop="openComprobanteModal(activeFile)"
              class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-955 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
              title="Ver comprobante con zoom"
            >
              <span>👁️ Ver Comprobante</span>
            </button>
            <span class="text-slate-400">·</span>
            <span class="font-black text-indigo-600 dark:text-indigo-400">
              {{ activeFile.matchedInstrumentador?.nombre }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Botón Modal de Observaciones -->
            <button 
              @click="showObservacionesModal = true" 
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition border border-slate-300 dark:border-slate-700 flex items-center gap-1"
            >
              <span>📝 Observaciones</span>
              <span v-if="activeFile.observaciones" class="w-2 h-2 rounded-full bg-amber-500"></span>
            </button>

            <button @click="showImputacionModal = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold p-1 shrink-0">✕</button>
          </div>
        </div>

        <!-- Barra de Saldos Compacta Slim (1 sola fila) -->
        <div class="px-3 py-2 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-300 dark:border-slate-700 shrink-0">
          <div class="flex items-center justify-between text-xs font-mono flex-wrap gap-2">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 font-bold uppercase">Transferido:</span>
              <span class="font-black text-indigo-700 dark:text-indigo-300">${{ formatNumber(activeTransferMonto) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 font-bold uppercase">Imputado:</span>
              <span class="font-black text-purple-700 dark:text-purple-300">${{ formatNumber(activeAsignadoMonto) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 font-bold uppercase">Saldo Pendiente:</span>
              <span :class="['font-black text-xs', activeSaldoPendiente === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300']">
                ${{ formatNumber(activeSaldoPendiente) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contenido Interior Scrollable -->
        <div class="overflow-y-auto space-y-3 grow pr-1 scrollbar-thin">
          
          <!-- 1. CIRUGÍAS YA VINCULADAS -->
          <div class="space-y-1.5">
            <h4 class="font-black text-[11px] text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Cirugías Vinculadas ({{ activeCirugias.length }})</span>
              <span v-if="activeAsignadoMonto > 0" class="font-mono text-purple-700 dark:text-purple-300">Imputado: ${{ formatNumber(activeAsignadoMonto) }}</span>
            </h4>

            <div v-if="activeCirugias.length > 0" class="border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <table class="w-full table-fixed text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold uppercase tracking-wider text-[9px] border-b border-slate-300 dark:border-slate-700">
                    <th class="px-2.5 py-1.5 w-[14%]">Fecha</th>
                    <th class="px-2.5 py-1.5 w-[24%]">Paciente</th>
                    <th class="px-2.5 py-1.5 w-[24%]">Médico / Lugar</th>
                    <th class="px-2.5 py-1.5 w-[14%] text-right">Total CX</th>
                    <th class="px-2.5 py-1.5 w-[16%] text-right">Monto Imputado</th>
                    <th class="px-2.5 py-1.5 w-[8%] text-right pr-2">Quitar</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr v-for="(item, idx) in activeCirugias" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td class="px-2.5 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {{ formatDate(item.fecha_cirugia) }}
                    </td>
                    <td class="px-2.5 py-1.5 font-extrabold text-slate-900 dark:text-white truncate" :title="item.paciente">
                      {{ item.paciente }}
                    </td>
                    <td class="px-2.5 py-1.5 text-slate-700 dark:text-slate-300">
                      <div class="font-bold text-slate-900 dark:text-slate-100 truncate" :title="item.medico">{{ item.medico }}</div>
                      <div class="text-[10px] text-slate-500 truncate" :title="item.lugar_cirugia">{{ item.lugar_cirugia }}</div>
                    </td>

                    <td class="px-2.5 py-1.5 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      ${{ formatNumber(item.totalCx) }}
                    </td>

                    <!-- MONTO IMPUTADO EDITABLE -->
                    <td class="px-2.5 py-1.5 text-right font-mono font-black">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          @click="item.parte1 = Math.round(activeTransferMonto / 2); saveDraftDebounced()"
                          class="px-1.5 py-0.5 text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 transition cursor-pointer shrink-0"
                          title="Asignar el 50% de la transferencia a esta cirugía"
                        >
                          🌓 50%
                        </button>
                        <span class="text-indigo-600 font-bold">$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          v-model.number="item.parte1" 
                          @input="saveDraftDebounced"
                          class="w-24 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-955/60 border border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-900 dark:text-indigo-100 font-mono font-black text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    <td class="px-2.5 py-1.5 text-right pr-2">
                      <button 
                        type="button" 
                        @click="removeCirugiaFromActive(idx)" 
                        class="text-red-600 hover:text-red-800 font-extrabold text-xs cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 font-semibold">
              Todavía no vinculaste cirugías a este comprobante. Buscá abajo en la lista o usá las liquidaciones sugeridas.
            </div>
          </div>

          <!-- 2. BUSCADOR DIRECTO DE CIRUGÍAS PENDIENTES CON ENTER TECLADO -->
          <div class="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            
            <!-- Cabecera de búsqueda y Chips de Sugerencias (50-50, 100%, ERP) -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h4 class="font-black text-[11px] text-slate-900 dark:text-white uppercase tracking-wider">
                  🔍 Buscar e Imputar Cirugías Pendientes de {{ activeFile.matchedInstrumentador?.nombre }}
                </h4>

                <!-- Chips de Importes Sugeridos (50-50, 100% y Planilla ERP) -->
                <div class="flex items-center gap-1.5 flex-wrap text-xs">
                  <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Sugeridos:</span>
                  
                  <!-- Opción 50% / 50-50 -->
                  <button 
                    type="button"
                    @click="setHalfPreallocatedAmount"
                    :class="[
                      'px-2 py-0.5 rounded-lg text-[11px] font-mono font-black border transition cursor-pointer flex items-center gap-1',
                      targetPreallocatedAmount === Math.round((activeSaldoPendiente > 0 ? activeSaldoPendiente : activeTransferMonto) / 2)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                    ]"
                    title="Asignar el 50% del saldo en partes iguales"
                  >
                    <span>🌓 50% (50-50)</span>
                    <span class="opacity-90">(${{ formatNumber(Math.round((activeSaldoPendiente > 0 ? activeSaldoPendiente : activeTransferMonto) / 2)) }})</span>
                  </button>

                  <!-- Opción 100% Saldo -->
                  <button 
                    type="button"
                    @click="setFullPreallocatedAmount"
                    :class="[
                      'px-2 py-0.5 rounded-lg text-[11px] font-mono font-black border transition cursor-pointer flex items-center gap-1',
                      targetPreallocatedAmount === (activeSaldoPendiente > 0 ? activeSaldoPendiente : activeTransferMonto)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                    ]"
                    title="Asignar el 100% del saldo disponible"
                  >
                    <span>🌕 100% Saldo</span>
                  </button>

                  <!-- Chips ERP adicionales si se cargó planilla -->
                  <template v-if="activeErpLiquidaciones.length > 0">
                    <span class="text-slate-300 dark:text-slate-700">|</span>
                    <button 
                      v-for="(liq, lIdx) in activeErpLiquidaciones" 
                      :key="lIdx"
                      @click="targetPreallocatedAmount = liq.monto"
                      :class="[
                        'px-2 py-0.5 rounded-lg text-[11px] font-mono font-black border transition cursor-pointer',
                        targetPreallocatedAmount === liq.monto 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                          : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                      ]"
                      :title="liq.descripcion"
                    >
                      ERP: ${{ formatNumber(liq.monto) }}
                    </button>
                  </template>
                </div>
              </div>

              <!-- Input de Búsqueda Integrado Slim con Atajo Enter y Checkbox de Pagadas -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input 
                  type="text" 
                  v-model="surgerySearchQuery" 
                  @keydown.enter.prevent="handleSurgerySearchEnter"
                  placeholder="🔍 Buscar paciente, médico, sanatorio... (Enter para vincular sugerida)" 
                  class="flex-1 bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                <label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-extrabold cursor-pointer shrink-0 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition">
                  <input type="checkbox" v-model="includePaidSurgeries" class="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <span>Incluir pagadas (verificación)</span>
                </label>
              </div>
            </div>

            <!-- Lista de Cirugías Pendientes y Pagadas Disponibles -->
            <div class="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto scrollbar-thin">
              <div 
                v-for="surg in filteredAvailableSurgeries" 
                :key="surg.id" 
                :class="[
                  'p-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 transition',
                  surg.esPagada || surg.estado === 'Pagado'
                    ? 'bg-emerald-50/50 dark:bg-emerald-955/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 border-l-4 border-l-emerald-500'
                    : 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
                ]"
              >
                <!-- Información Completa de Cirugía -->
                <div class="min-w-0 flex-1 space-y-0.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-extrabold text-slate-900 dark:text-white text-xs">{{ surg.paciente }}</span>
                    <span class="font-mono text-[10px] text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                      📅 {{ formatDate(surg.fecha_cirugia) }}
                    </span>
                    <!-- BADGE VISUAL DE CIRUGÍA YA PAGADA -->
                    <span 
                      v-if="surg.esPagada || surg.estado === 'Pagado'" 
                      class="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1"
                      title="Esta cirugía ya se encuentra abonada en el sistema. Disponible para verificación de comprobante."
                    >
                      ✓ Ya Pagada (Verificación)
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight">
                    <span class="font-bold text-slate-800 dark:text-slate-200">Médico:</span> {{ surg.medico || 'No especificado' }} 
                    <span class="text-slate-400 mx-1">|</span> 
                    <span class="font-bold text-slate-800 dark:text-slate-200">Lugar:</span> {{ surg.lugar_cirugia || 'No especificado' }}
                  </div>
                </div>

                <!-- Botón de Vincular -->
                <button 
                  type="button" 
                  @click="addSurgeryToActiveDirect(surg)" 
                  :class="[
                    'self-end sm:self-auto px-3 py-1.5 font-black text-xs rounded-lg cursor-pointer shrink-0 shadow-2xs active:scale-95 transition flex items-center gap-1',
                    surg.esPagada || surg.estado === 'Pagado'
                      ? 'bg-slate-800 hover:bg-slate-900 text-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  ]"
                >
                  <span>+ Vincular</span>
                  <span class="font-mono font-bold text-[11px]">(${{ formatNumber(targetPreallocatedAmount > 0 ? targetPreallocatedAmount : (activeSaldoPendiente > 0 ? activeSaldoPendiente : surg.monto_a_pagar)) }})</span>
                </button>
              </div>

              <div v-if="filteredAvailableSurgeries.length === 0" class="p-4 text-center text-xs text-slate-500 font-semibold italic">
                No se encontraron cirugías {{ includePaidSurgeries ? '' : 'pendientes' }} para este profesional con el filtro introducido.
              </div>
            </div>

          </div>

        </div>

        <!-- Footer Ultracompacto Slim -->
        <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <button @click="showImputacionModal = false" class="w-full sm:w-auto px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer">
            Guardar borrador y cerrar
          </button>

          <button 
            type="button" 
            @click="confirmarConciliacion"
            :disabled="activeCirugias.length === 0 || isSubmitting"
            :class="[
              'w-full sm:w-auto px-5 py-2 rounded-xl font-black text-xs text-white shadow-md transition cursor-pointer text-center',
              activeSaldoPendiente === 0 
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            ]"
          >
            <span>
              {{ isSubmitting ? 'Registrando...' : (activeSaldoPendiente === 0 ? '✓ Confirmar Conciliación ($0 exacto)' : `✓ Confirmar Conciliación (Registrar Saldo Pendiente: $${formatNumber(activeSaldoPendiente)})`) }}
            </span>
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL DE OBSERVACIONES E NOTAS INTERNAS -->
    <div v-if="showObservacionesModal && activeFile" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>📝 Observaciones e Notas Internas</span>
          </h3>
          <button @click="showObservacionesModal = false" class="text-slate-500 hover:text-slate-700 text-sm font-bold p-1 shrink-0">✕</button>
        </div>

        <div class="space-y-1.5">
          <p class="text-[11px] text-slate-500 font-medium">
            Ingresá notas u observaciones internas para el comprobante <span class="font-bold text-slate-800 dark:text-slate-200">{{ activeFile.name }}</span>:
          </p>
          <textarea 
            v-model="activeFile.observaciones"
            @input="saveDraftDebounced"
            placeholder="Ej: Diferencia retenida por acuerdo previo / Queda saldo pendiente a favor..." 
            rows="4"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div class="flex justify-end pt-1">
          <button @click="showObservacionesModal = false" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer">
            Guardar Nota
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL BUSCADOR FLOTANTE DE INSTRUMENTADORES -->
    <div v-if="showInstSearchModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-4 sm:p-5 shadow-2xl space-y-3 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 shrink-0">
          <div>
            <h3 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
              Asignar Instrumentador
            </h3>
            <p v-if="targetInstFile?.extractedData?.destinatario_nombre" class="text-xs text-slate-500 font-medium">
              Destinatario: <span class="font-bold text-slate-800 dark:text-slate-200">{{ targetInstFile.extractedData.destinatario_nombre }}</span>
            </p>
          </div>
          <button @click="showInstSearchModal = false" class="text-slate-500 hover:text-slate-700 text-sm font-bold p-1 shrink-0">✕</button>
        </div>

        <div class="relative shrink-0">
          <input 
            type="text" 
            v-model="instSearchQuery" 
            placeholder="🔍 Buscar por nombre o DNI..." 
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ref="instSearchInputRef"
          />
        </div>

        <div class="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl grow max-h-[50vh]">
          <div 
            v-for="inst in filteredInstrumentadoresOptions" 
            :key="inst.dni"
            @click="selectInstrumentadorFromModal(inst)"
            class="p-2.5 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs transition cursor-pointer group"
          >
            <div>
              <span class="font-extrabold text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">{{ inst.nombre }}</span>
              <span class="text-[10px] text-slate-500 font-mono">DNI: {{ inst.dni }}</span>
            </div>

            <button 
              type="button" 
              class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-extrabold text-xs rounded-lg transition"
            >
              Seleccionar ➔
            </button>
          </div>

          <div v-if="filteredInstrumentadoresOptions.length === 0" class="p-5 text-center text-xs text-slate-500 font-semibold italic">
            No se encontraron instrumentadores coincidentes.
          </div>
        </div>

        <div class="pt-2 shrink-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <label class="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer select-none">
            <input type="checkbox" v-model="rememberAccountRule" class="rounded text-indigo-600 border-slate-400 focus:ring-indigo-500" />
            <span>Recordar esta cuenta para el futuro</span>
          </label>

          <button @click="showInstSearchModal = false" class="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE PREVISUALIZACIÓN Y ZOOM DE COMPROBANTE -->
    <div 
      v-if="showComprobanteViewerModal && selectedPreviewFile" 
      class="fixed inset-0 z-50 bg-slate-955/90 dark:bg-slate-955/95 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 animate-in fade-in duration-150 select-none"
      @keydown.stop
    >
      <!-- BARRA SUPERIOR DE HERRAMIENTAS Y ZOOM -->
      <div class="bg-slate-900/90 border border-slate-800 text-white rounded-2xl p-2.5 px-4 flex items-center justify-between flex-wrap gap-2 shadow-2xl shrink-0">
        <!-- Información del Archivo -->
        <div class="flex items-center gap-2 max-w-sm truncate">
          <span class="text-xl">📄</span>
          <div>
            <h3 class="text-xs font-black text-white truncate max-w-[220px]" :title="selectedPreviewFile.name">
              {{ selectedPreviewFile.name }}
            </h3>
            <p class="text-[10px] text-slate-400 font-mono">
              {{ selectedPreviewFile.size ? (selectedPreviewFile.size / 1024).toFixed(1) + ' KB' : 'Comprobante' }} · {{ selectedPreviewFile.type || 'Archivo' }}
            </p>
          </div>
        </div>

        <!-- Barra de Controles de Zoom -->
        <div class="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button 
            @click="zoomOut" 
            :disabled="zoomScale <= 0.5"
            class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-black text-sm flex items-center justify-center transition cursor-pointer"
            title="Alejar (-)"
          >
            🔍-
          </button>

          <span class="w-14 text-center font-mono font-black text-xs text-indigo-300">
            {{ Math.round(zoomScale * 100) }}%
          </span>

          <button 
            @click="zoomIn" 
            :disabled="zoomScale >= 4"
            class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-black text-sm flex items-center justify-center transition cursor-pointer"
            title="Acercar (+)"
          >
            🔍+
          </button>

          <span class="text-slate-600 mx-0.5">|</span>

          <button 
            @click="resetZoom" 
            class="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            title="Restablecer a 100%"
          >
            <span>↺ 100%</span>
          </button>

          <button 
            @click="rotateComprobante" 
            class="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            title="Rotar 90°"
          >
            <span>🔄 Rotar</span>
          </button>

          <button 
            @click="openInNewTab" 
            class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            title="Abrir en pestaña nueva"
          >
            <span>🔗 Pestaña</span>
          </button>
        </div>

        <!-- Botón Cerrar -->
        <button 
          @click="closeComprobanteModal" 
          class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center transition cursor-pointer shrink-0"
          title="Cerrar (Esc)"
        >
          ✕
        </button>
      </div>

      <!-- ÁREA PRINCIPAL DE VISUALIZACIÓN CON DRAG & ZOOM -->
      <div 
        class="grow relative my-2 overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center cursor-grab active:cursor-grabbing"
        @wheel="handleWheelZoom"
        @mousedown="handlePanStart"
        @mousemove="handlePanMove"
        @mouseup="handlePanEnd"
        @mouseleave="handlePanEnd"
      >
        <!-- Si es Imagen -->
        <template v-if="isImageFile(selectedPreviewFile)">
          <div 
            class="transition-transform duration-75 ease-out origin-center max-w-full max-h-full flex items-center justify-center p-4"
            :style="{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale}) rotate(${zoomRotation}deg)`
            }"
          >
            <img 
              :src="getComprobanteFileUrl(selectedPreviewFile)" 
              :alt="selectedPreviewFile.name"
              class="max-w-[85vw] max-h-[72vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            />
          </div>
        </template>

        <!-- Si es PDF -->
        <template v-else-if="isPdfFile(selectedPreviewFile)">
          <div 
            class="w-full h-full p-2 flex items-center justify-center"
            :style="{
              transform: `scale(${zoomScale}) rotate(${zoomRotation}deg)`,
              transformOrigin: 'center center'
            }"
          >
            <iframe 
              :src="getComprobanteFileUrl(selectedPreviewFile)" 
              class="w-full h-full rounded-xl border border-slate-800 shadow-2xl bg-white"
              title="Vista previa del PDF"
            ></iframe>
          </div>
        </template>

        <!-- Fallback si formato indeterminado -->
        <template v-else>
          <div 
            class="transition-transform duration-75 ease-out origin-center max-w-full max-h-full flex items-center justify-center p-4"
            :style="{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale}) rotate(${zoomRotation}deg)`
            }"
          >
            <img 
              :src="getComprobanteFileUrl(selectedPreviewFile)" 
              :alt="selectedPreviewFile.name"
              class="max-w-[85vw] max-h-[72vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            />
          </div>
        </template>
      </div>

      <!-- BARRA INFERIOR DE AYUDA RÁPIDA -->
      <div class="bg-slate-900/90 border border-slate-800 text-slate-400 rounded-xl px-4 py-1.5 text-[11px] font-mono flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <span>💡 Rueda del ratón: Zoom</span>
          <span>·</span>
          <span>Clic y arrastrar: Desplazar</span>
          <span>·</span>
          <span>Esc: Cerrar</span>
        </div>
        <div class="text-indigo-400 font-bold">
          GESTIÓN IQ · Visor de Comprobantes
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import { formatDate } from '../../utils/reportMapper';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const LOCAL_STORAGE_DRAFT_KEY = 'giq_conciliacion_draft_v1';

const toast = useToast();
const fileInputRef = ref(null);
const excelInputRef = ref(null);
const instSearchInputRef = ref(null);
const isDragging = ref(false);
const isSubmitting = ref(false);
const isLibroMayorSkipped = ref(false);

const isNuevaMenuOpen = ref(false);
const nuevaConciliacionMenuRef = ref(null);
onClickOutside(nuevaConciliacionMenuRef, () => { isNuevaMenuOpen.value = false; });

const iniciarNuevaConciliacion = (tipo = 'comprobantes') => {
  isNuevaMenuOpen.value = false;
  if (tipo === 'excel') {
    excelInputRef.value?.click();
  } else {
    triggerFileInput();
  }
};

const activeMainTab = ref('conciliador'); // 'conciliador' | 'historial'
const historialConciliaciones = ref([]);
const historialSearchQuery = ref('');
const isHistorialLoading = ref(false);

const saveStatus = ref('saved'); // 'saved' | 'saving'
const hasPendingDraftBanner = ref(false);
const isDraftRestored = ref(false);
const pendingDraftDate = ref('');
const pendingDraftFilesCount = ref(0);
const pendingDraftData = ref(null);

const inFlightHashes = new Set();

const files = ref([]);
const activeFileId = ref(null);

const libroMayorSummary = ref(null);
const libroMayorFileName = ref('');

const instrumentadoresOptions = ref([]);
const allPendingSurgeries = ref([]);
const includePaidSurgeries = ref(false);

// MODALES FLOTANTES
const showImputacionModal = ref(false);
const showObservacionesModal = ref(false);
const showInstSearchModal = ref(false);
const instSearchQuery = ref('');
const targetInstFile = ref(null);
const rememberAccountRule = ref(true);

// VISOR DE COMPROBANTES Y CONTROLES DE ZOOM
const showComprobanteViewerModal = ref(false);
const selectedPreviewFile = ref(null);
const zoomScale = ref(1);
const zoomRotation = ref(0);
const panPosition = ref({ x: 0, y: 0 });
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });

const getComprobanteFileUrl = (item) => {
  if (!item) return '';
  if (item.rawFile) {
    if (!item._objectUrl) {
      item._objectUrl = URL.createObjectURL(item.rawFile);
    }
    return item._objectUrl;
  }
  if (item.previewUrl) return item.previewUrl;
  if (item.fileBase64) {
    const mime = item.type || (item.name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    return `data:${mime};base64,${item.fileBase64}`;
  }
  return '';
};

const isImageFile = (item) => {
  if (!item) return false;
  if (item.type && item.type.startsWith('image/')) return true;
  const name = item.name ? item.name.toLowerCase() : '';
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp') || name.endsWith('.gif');
};

const isPdfFile = (item) => {
  if (!item) return false;
  if (item.type === 'application/pdf') return true;
  const name = item.name ? item.name.toLowerCase() : '';
  return name.endsWith('.pdf');
};

const openComprobanteModal = async (item) => {
  if (!item) return;
  if (item.rawFile && !item.fileBase64) {
    try {
      item.fileBase64 = await fileToBase64(item.rawFile);
    } catch (e) {
      console.warn("No se pudo leer base64 para previsualización:", e);
    }
  }
  selectedPreviewFile.value = item;
  zoomScale.value = 1;
  zoomRotation.value = 0;
  panPosition.value = { x: 0, y: 0 };
  showComprobanteViewerModal.value = true;
};

const closeComprobanteModal = () => {
  showComprobanteViewerModal.value = false;
  selectedPreviewFile.value = null;
  zoomScale.value = 1;
  zoomRotation.value = 0;
  panPosition.value = { x: 0, y: 0 };
};

const zoomIn = () => {
  zoomScale.value = Math.min(zoomScale.value + 0.25, 4);
};

const zoomOut = () => {
  zoomScale.value = Math.max(zoomScale.value - 0.25, 0.5);
};

const resetZoom = () => {
  zoomScale.value = 1;
  zoomRotation.value = 0;
  panPosition.value = { x: 0, y: 0 };
};

const rotateComprobante = () => {
  zoomRotation.value = (zoomRotation.value + 90) % 360;
};

const handleWheelZoom = (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

const handlePanStart = (e) => {
  if (zoomScale.value <= 1) return;
  isPanning.value = true;
  panStart.value = {
    x: e.clientX - panPosition.value.x,
    y: e.clientY - panPosition.value.y
  };
};

const handlePanMove = (e) => {
  if (!isPanning.value) return;
  panPosition.value = {
    x: e.clientX - panStart.value.x,
    y: e.clientY - panStart.value.y
  };
};

const handlePanEnd = () => {
  isPanning.value = false;
};

const openInNewTab = () => {
  const url = getComprobanteFileUrl(selectedPreviewFile.value);
  if (!url) {
    toast.error("No se pudo obtener el archivo para abrir.");
    return;
  }
  const win = window.open();
  if (win) {
    win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  }
};

const surgerySearchQuery = ref('');
const targetPreallocatedAmount = ref(0);

const reconciliationsMap = ref({});

const formatNumber = (val) => {
  if (val === null || val === undefined) return '0,00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const activeFile = computed(() => files.value.find(f => f.id === activeFileId.value));

const autoResolvedFiles = computed(() => {
  return files.value.filter(f => f.status === 'success' && f.matchedInstrumentador);
});

const unresolvedFiles = computed(() => {
  return files.value.filter(f => f.status === 'success' && !f.matchedInstrumentador);
});

const autoConciliadosCount = computed(() => autoResolvedFiles.value.length);
const excepcionesCount = computed(() => unresolvedFiles.value.length);

const totalMontoEsperadoERP = computed(() => {
  if (!libroMayorSummary.value) return 0;
  return libroMayorSummary.value.reduce((sum, item) => sum + item.totalEsperado, 0);
});

const activeTransferMonto = computed(() => {
  return Number(activeFile.value?.extractedData?.monto_transferido) || 0;
});

const activeErpMatchItem = computed(() => {
  if (!libroMayorSummary.value || !activeFile.value?.matchedInstrumentador) return null;
  const targetDni = activeFile.value.matchedInstrumentador.dni;
  const targetName = activeFile.value.matchedInstrumentador.nombre?.toLowerCase();

  return libroMayorSummary.value.find(item => 
    (item.instrumentadorDni && item.instrumentadorDni === targetDni) ||
    (item.instrumentadorNombre && item.instrumentadorNombre.toLowerCase().includes(targetName))
  );
});

const activeErpLiquidaciones = computed(() => {
  return activeErpMatchItem.value ? activeErpMatchItem.value.liquidaciones : [];
});

const activeCirugias = computed(() => {
  if (!activeFileId.value) return [];
  return reconciliationsMap.value[activeFileId.value]?.cirugias || [];
});

const activeAsignadoMonto = computed(() => {
  return activeCirugias.value.reduce((sum, item) => sum + (Number(item.parte1) || 0), 0);
});

const activeSaldoPendiente = computed(() => {
  return activeTransferMonto.value - activeAsignadoMonto.value;
});

const setHalfPreallocatedAmount = () => {
  const base = activeSaldoPendiente.value > 0 ? activeSaldoPendiente.value : activeTransferMonto.value;
  targetPreallocatedAmount.value = Math.round(base / 2);
  toast.info(`Monto sugerido configurado al 50% ($${formatNumber(targetPreallocatedAmount.value)}). Haz clic en "+ Vincular" en la cirugía deseada.`);
};

const setFullPreallocatedAmount = () => {
  const base = activeSaldoPendiente.value > 0 ? activeSaldoPendiente.value : activeTransferMonto.value;
  targetPreallocatedAmount.value = base;
  toast.info(`Monto sugerido configurado al 100% ($${formatNumber(targetPreallocatedAmount.value)}).`);
};



const filteredAvailableSurgeries = computed(() => {
  if (!activeFile.value || !activeFile.value.matchedInstrumentador) {
    return (allPendingSurgeries.value || []).filter(s => includePaidSurgeries.value || (!s.esPagada && s.estado !== 'Pagado'));
  }
  const targetDni = activeFile.value.matchedInstrumentador.dni;
  const targetName = activeFile.value.matchedInstrumentador.nombre?.toLowerCase();
  const alreadyLinkedIds = new Set(activeCirugias.value.map(c => c.id));

  let available = (allPendingSurgeries.value || []).filter(surg => {
    if (alreadyLinkedIds.has(surg.id)) return false;
    if (!includePaidSurgeries.value && (surg.esPagada || surg.estado === 'Pagado')) return false;

    if (targetDni && surg.instrumentador_dni) {
      return String(surg.instrumentador_dni) === String(targetDni);
    }
    if (targetName && surg.instrumentador_completado) {
      return surg.instrumentador_completado.toLowerCase().includes(targetName);
    }
    return true;
  });

  if (surgerySearchQuery.value.trim()) {
    const q = surgerySearchQuery.value.toLowerCase().trim();
    available = (allPendingSurgeries.value || []).filter(surg => {
      if (alreadyLinkedIds.has(surg.id)) return false;
      if (!includePaidSurgeries.value && (surg.esPagada || surg.estado === 'Pagado')) return false;

      return (
        (surg.paciente && surg.paciente.toLowerCase().includes(q)) ||
        (surg.medico && surg.medico.toLowerCase().includes(q)) ||
        (surg.lugar_cirugia && surg.lugar_cirugia.toLowerCase().includes(q)) ||
        (surg.id_cirugia && String(surg.id_cirugia).toLowerCase().includes(q)) ||
        (surg.instrumentador_completado && surg.instrumentador_completado.toLowerCase().includes(q))
      );
    });
  }

  return available;
});



// COMPROBANTES CON COINCIDENCIA AUTOMÁTICA LISTOS PARA CONCILIAR EN 1 CLIC
const autoReadyFiles = computed(() => {
  return files.value.filter(f => {
    if (f.isConfirmed || f.status !== 'success' || !f.matchedInstrumentador) return false;
    const recMap = reconciliationsMap.value[f.id];
    const cirugiasList = recMap?.cirugias || [];
    if (cirugiasList.length === 0) return false;

    const transferMonto = Number(f.extractedData?.monto_transferido) || 0;
    const asignadoMonto = cirugiasList.reduce((sum, c) => sum + (Number(c.parte1) || 0), 0);
    return transferMonto - asignadoMonto === 0;
  });
});

// RESUMEN DE LOTE COMPLETO
const allFilesConfirmed = computed(() => {
  return files.value.length > 0 && files.value.every(f => f.isConfirmed);
});

const batchTotalMonto = computed(() => {
  return files.value.reduce((sum, f) => sum + (Number(f.extractedData?.monto_transferido) || 0), 0);
});

const batchTotalCirugiasCount = computed(() => {
  let count = 0;
  Object.values(reconciliationsMap.value).forEach(r => {
    if (r.cirugias) count += r.cirugias.length;
  });
  return count;
});

const batchTotalSaldosPendientes = computed(() => {
  return files.value.reduce((sum, f) => sum + (Number(f.saldoPendienteInterno) || 0), 0);
});

const batchTotalImputado = computed(() => {
  let total = 0;
  Object.values(reconciliationsMap.value).forEach(r => {
    if (r.cirugias) {
      total += r.cirugias.reduce((sum, c) => sum + (Number(c.parte1) || 0), 0);
    }
  });
  return total;
});

const batchProgressPercentage = computed(() => {
  const total = batchTotalMonto.value;
  if (!total || total === 0) return 0;
  const imputado = batchTotalImputado.value;
  return Math.min(100, Math.round((imputado / total) * 100));
});

const tokenCache = ref({});

const getOrFetchActivityToken = async (dni) => {
  if (!dni || dni === 'erp-match') return null;
  if (tokenCache.value[dni]) return tokenCache.value[dni];
  try {
    const { data: token, error } = await supabase.rpc('generar_activity_token', { p_dni: String(dni) });
    if (!error && token) {
      tokenCache.value[dni] = token;
      return token;
    }
  } catch (e) {
    console.warn("Error obteniendo activity token:", e);
  }
  return null;
};

const copyInstrumentadorLink = async (inst) => {
  if (!inst || !inst.dni) {
    toast.error("Seleccioná un instrumentador válido.");
    return;
  }
  const token = await getOrFetchActivityToken(inst.dni);
  if (!token) {
    toast.error("No se pudo obtener el enlace del portal para este instrumentador.");
    return;
  }
  const url = `${window.location.origin}/resumen/${token}`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success(`🔗 Enlace del portal de ${inst.nombre} copiado al portapapeles.`);
  } catch (e) {
    toast.error("Error al copiar el enlace.");
  }
};

const copyWhatsAppMessage = async (item) => {
  if (!item || !item.matchedInstrumentador) {
    toast.error("Asigná un instrumentador primero.");
    return;
  }
  const inst = item.matchedInstrumentador;
  const nombrePila = inst.nombre ? inst.nombre.split(' ')[0] : 'colega';
  const token = await getOrFetchActivityToken(inst.dni);
  
  const linkStr = token ? `${window.location.origin}/resumen/${token}` : '';
  const transferMonto = item.extractedData?.monto_transferido || 0;

  let msg = `¡Hola ${nombrePila}! Te informo que ya procesamos tu transferencia de $${formatNumber(transferMonto)}.\n`;
  if (linkStr) {
    msg += `Podés ver el detalle de tus cirugías y comprobantes en tu perfil digital:\n${linkStr}\n\n`;
  }
  msg += `¡Muchas gracias por tu trabajo!`;

  try {
    await navigator.clipboard.writeText(msg);
    toast.success(`💬 Mensaje para WhatsApp de ${inst.nombre} copiado al portapapeles.`);
  } catch (e) {
    toast.error("Error al copiar mensaje de WhatsApp.");
  }
};

// FILTRADO DE HISTORIAL DE CONCILIACIONES DESDE SUPABASE
const fetchConciliacionesHistorial = async () => {
  isHistorialLoading.value = true;
  try {
    const { data, error: rpcErr } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (rpcErr) throw rpcErr;

    // Filtrar aquellas órdenes que correspondan a Conciliaciones de pagos
    historialConciliaciones.value = (data || []).filter(o => 
      o.notas && o.notas.toLowerCase().includes('conciliación')
    );
  } catch (err) {
    console.warn("Error cargando historial de conciliaciones:", err);
  } finally {
    isHistorialLoading.value = false;
  }
};

const switchToHistorialTab = () => {
  activeMainTab.value = 'historial';
  fetchConciliacionesHistorial();
};

const filteredHistorialConciliaciones = computed(() => {
  if (!historialSearchQuery.value.trim()) {
    return historialConciliaciones.value;
  }
  const q = historialSearchQuery.value.toLowerCase().trim();
  return historialConciliaciones.value.filter(o => {
    const matchNombre = o.instrumentadores_nombres?.some(n => n.toLowerCase().includes(q));
    const matchDni = o.instrumentadores_dnis?.some(d => d.includes(q));
    const matchNotas = o.notas && o.notas.toLowerCase().includes(q);
    return matchNombre || matchDni || matchNotas;
  });
});

const downloadIndividualOrderPdf = (orden) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("GESTIÓN IQ - Comprobante de Conciliación", 14, 20);
    doc.setFontSize(10);
    doc.text(`Orden N°: OP-${orden.id.slice(0, 8)}`, 14, 28);
    doc.text(`Fecha de Emisión: ${formatDate(orden.fecha_emision)}`, 14, 34);
    doc.text(`Instrumentador: ${orden.instrumentadores_nombres?.join(', ') || 'N/A'} (DNI: ${orden.instrumentadores_dnis?.join(', ') || 'N/A'})`, 14, 40);
    doc.text(`Monto Total Conciliado: $${formatNumber(orden.monto_total || 0)}`, 14, 46);

    doc.autoTable({
      startY: 54,
      head: [['Detalle & Notas de la Operación']],
      body: [[orden.notas || 'Sin notas registradas']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Conciliacion_OP_${orden.id.slice(0, 8)}.pdf`);
    toast.success("PDF individual descargado.");
  } catch (err) {
    console.error("Error al generar PDF individual:", err);
    toast.error("No se pudo generar el PDF.");
  }
};

// CONCILIACIÓN AUTOMÁTICA EN LOTE
const confirmarLoteAutomatico = async () => {
  const readyList = autoReadyFiles.value;
  if (readyList.length === 0) return;

  isSubmitting.value = true;
  let successCount = 0;

  try {
    for (const fileItem of readyList) {
      const transferMonto = Number(fileItem.extractedData?.monto_transferido) || 0;
      const fileCirugias = reconciliationsMap.value[fileItem.id]?.cirugias || [];

      const ordenDePago = {
        monto_total_general: transferMonto,
        comprobante_object_key: null,
        notas: `[CONCILIACIÓN DE PAGOS EN LOTE] ${fileItem.extractedData?.destinatario_nombre || ''} - Ref: ${fileItem.extractedData?.numero_operacion || 'Comprobante Conciliado'}`,
        pagos: [
          {
            instrumentador_dni: fileItem.matchedInstrumentador.dni,
            monto_total_instrumentador: transferMonto,
            cirugias: fileCirugias.map(c => ({
              id: c.id,
              monto: Number(c.parte1) || 0
            }))
          }
        ]
      };

      const { error: rpcErr } = await supabase.rpc('registrar_orden_de_pago', { p_orden: ordenDePago });
      if (!rpcErr) {
        fileItem.isConfirmed = true;
        fileItem.saldoPendienteInterno = 0;
        successCount++;
      }
    }

    toast.success(`⚡ ¡Lote procesado! Se conciliarom ${successCount} comprobantes automáticamente.`);
    saveDraftDebounced();
    fetchInitialData();
  } catch (err) {
    console.error("Error en conciliación de lote:", err);
    toast.error("Error al procesar el lote automático.");
  } finally {
    isSubmitting.value = false;
  }
};

// VINCULACIÓN CON ENTER EN BUSCADOR DE CIRUGÍAS
const handleSurgerySearchEnter = () => {
  const available = filteredAvailableSurgeries.value;
  if (available.length > 0) {
    addSurgeryToActiveDirect(available[0]);
  }
};

// MANEJADOR DE TECLADO GLOBAL (ESC / ENTER / ZOOM)
const handleGlobalKeyDown = (e) => {
  if (e.key === 'Escape') {
    if (showComprobanteViewerModal.value) {
      closeComprobanteModal();
    } else if (showObservacionesModal.value) {
      showObservacionesModal.value = false;
    } else if (showInstSearchModal.value) {
      showInstSearchModal.value = false;
    } else if (showImputacionModal.value) {
      showImputacionModal.value = false;
    }
  } else if (showComprobanteViewerModal.value) {
    if (e.key === '+' || e.key === '=') {
      zoomIn();
    } else if (e.key === '-') {
      zoomOut();
    } else if (e.key === '0') {
      resetZoom();
    }
  }
};

// EXPORTAR RESUMEN PDF DE LOTE CONCILIADO
const downloadBatchSummaryPdf = () => {
  try {
    const doc = new jsPDF();
    const now = new Date().toLocaleString('es-AR');

    doc.setFontSize(16);
    doc.text("GESTIÓN IQ - Resumen de Conciliación de Pagos", 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha de Cierre: ${now}`, 14, 27);
    doc.text(`Total Comprobantes: ${files.value.length} | Cirugías Saldadas: ${batchTotalCirugiasCount.value}`, 14, 33);
    doc.text(`Monto Total Procesado: $${formatNumber(batchTotalMonto.value)}`, 14, 39);

    const tableRows = [];
    files.value.forEach(f => {
      const recMap = reconciliationsMap.value[f.id]?.cirugias || [];
      const cxStr = recMap.map(c => `${c.paciente} ($${formatNumber(c.parte1)})`).join(', ');

      tableRows.push([
        f.name,
        f.extractedData?.destinatario_nombre || 'N/A',
        f.matchedInstrumentador?.nombre || 'N/A',
        `$${formatNumber(f.extractedData?.monto_transferido || 0)}`,
        cxStr || 'Sin cirugías',
        f.saldoPendienteInterno > 0 ? `S.Pend: $${formatNumber(f.saldoPendienteInterno)}` : 'Saldado $0'
      ]);
    });

    doc.autoTable({
      startY: 46,
      head: [['Archivo', 'Destinatario', 'Instrumentador', 'Monto Transferido', 'Cirugías Imputadas', 'Estado Saldo']],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Conciliacion_Lote_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Resumen de Conciliación PDF generado correctamente.");
  } catch (err) {
    console.error("Error generando PDF de resumen:", err);
    toast.error("Error al generar el PDF de resumen.");
  }
};

// ABRIR MODAL PRINCIPAL DE IMPUTACIÓN DE CIRUGÍAS
const openImputacionModal = (item) => {
  setActiveFile(item);
  surgerySearchQuery.value = '';
  targetPreallocatedAmount.value = 0;
  showImputacionModal.value = true;
};

// ABRIR MODAL BUSCADOR DE INSTRUMENTADORES
const openInstrumentadorSearchModal = (item) => {
  targetInstFile.value = item;
  instSearchQuery.value = '';
  showInstSearchModal.value = true;
  nextTick(() => {
    instSearchInputRef.value?.focus();
  });
};

const filteredInstrumentadoresOptions = computed(() => {
  if (!instSearchQuery.value.trim()) {
    return instrumentadoresOptions.value;
  }
  const q = instSearchQuery.value.toLowerCase().trim();
  return instrumentadoresOptions.value.filter(i => 
    i.nombre.toLowerCase().includes(q) || String(i.dni).includes(q)
  );
});

const selectInstrumentadorFromModal = async (inst) => {
  if (!targetInstFile.value) return;

  targetInstFile.value.matchedInstrumentador = {
    dni: inst.dni,
    nombre: inst.nombre
  };

  if (rememberAccountRule.value && targetInstFile.value.extractedData) {
    try {
      const cleanCuit = targetInstFile.value.extractedData.destinatario_cuit_cuil ? targetInstFile.value.extractedData.destinatario_cuit_cuil.replace(/\D/g, '') : null;
      const cleanAlias = targetInstFile.value.extractedData.destinatario_cbu_alias ? targetInstFile.value.extractedData.destinatario_cbu_alias.trim().toLowerCase() : null;

      await supabase.from('conciliacion_asociaciones_bancarias').insert({
        cuit_cuil: cleanCuit,
        cbu_alias: cleanAlias,
        titular_nombre: targetInstFile.value.extractedData.destinatario_nombre,
        banco: targetInstFile.value.extractedData.destinatario_banco,
        instrumentador_dni: inst.dni,
        instrumentador_nombre: inst.nombre
      });

      toast.success(`Asociación guardada para ${inst.nombre}.`);
    } catch (e) {
      console.warn("Error guardando asociación:", e);
    }
  }

  setActiveFile(targetInstFile.value);
  showInstSearchModal.value = false;
  targetInstFile.value = null;
  saveDraftDebounced();
};

// CALCULAR HASH SHA-256 DEL ARCHIVO
const computeFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// AUTO-GUARDADO DE BORRADOR
let saveTimeout = null;
const saveDraftDebounced = () => {
  saveStatus.value = 'saving';
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(async () => {
    try {
      const serializableFiles = files.value.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        fileHash: f.fileHash,
        fileBase64: f.fileBase64 || '',
        status: f.status,
        isConfirmed: f.isConfirmed || false,
        saldoPendienteInterno: f.saldoPendienteInterno || 0,
        observaciones: f.observaciones || '',
        extractedData: f.extractedData,
        matchedInstrumentador: f.matchedInstrumentador,
        matchType: f.matchType,
        selectedInstrumentadorDni: f.selectedInstrumentadorDni,
        isCached: f.isCached || false
      }));

      const draftPayload = {
        updatedAt: new Date().toISOString(),
        libroMayorFileName: libroMayorFileName.value,
        libroMayorSummary: libroMayorSummary.value,
        isLibroMayorSkipped: isLibroMayorSkipped.value,
        files: serializableFiles,
        reconciliationsMap: reconciliationsMap.value,
        activeFileId: activeFileId.value
      };

      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draftPayload));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('conciliacion_borradores').upsert({
          user_id: user.id,
          session_key: 'default_draft',
          libro_mayor_filename: libroMayorFileName.value,
          libro_mayor_summary: libroMayorSummary.value,
          is_libro_mayor_skipped: isLibroMayorSkipped.value,
          files_data: serializableFiles,
          reconciliations_map: reconciliationsMap.value,
          active_file_id: activeFileId.value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,session_key' });
      }

      saveStatus.value = 'saved';
    } catch (err) {
      console.warn("Error autoguardando borrador:", err);
      saveStatus.value = 'saved';
    }
  }, 400);
};

// COMPROBAR Y RECUPERAR BORRADOR AL INICIAR
const checkForExistingDraft = async () => {
  try {
    let draftData = null;

    const localRaw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
    if (localRaw) {
      draftData = JSON.parse(localRaw);
    }

    if (!draftData) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: remoteDraft } = await supabase
          .from('conciliacion_borradores')
          .select('*')
          .eq('user_id', user.id)
          .eq('session_key', 'default_draft')
          .maybeSingle();

        if (remoteDraft && remoteDraft.files_data && remoteDraft.files_data.length > 0) {
          draftData = {
            updatedAt: remoteDraft.updated_at,
            libroMayorFileName: remoteDraft.libro_mayor_filename,
            libroMayorSummary: remoteDraft.libro_mayor_summary,
            isLibroMayorSkipped: remoteDraft.is_libro_mayor_skipped,
            files: remoteDraft.files_data,
            reconciliationsMap: remoteDraft.reconciliations_map,
            activeFileId: remoteDraft.active_file_id
          };
        }
      }
    }

    if (draftData && ((draftData.files && draftData.files.length > 0) || draftData.libroMayorSummary)) {
      pendingDraftData.value = draftData;
      pendingDraftFilesCount.value = draftData.files ? draftData.files.length : 0;
      pendingDraftDate.value = draftData.updatedAt ? new Date(draftData.updatedAt).toLocaleString('es-AR') : '';
      hasPendingDraftBanner.value = true;
    }
  } catch (err) {
    console.warn("Error al verificar borradores:", err);
  }
};

const restoreDraft = () => {
  if (!pendingDraftData.value) return;
  const draft = pendingDraftData.value;

  libroMayorFileName.value = draft.libroMayorFileName || '';
  libroMayorSummary.value = draft.libroMayorSummary || null;
  isLibroMayorSkipped.value = draft.isLibroMayorSkipped || false;
  files.value = draft.files || [];
  reconciliationsMap.value = draft.reconciliationsMap || {};
  activeFileId.value = draft.activeFileId || (files.value[0]?.id || null);

  isDraftRestored.value = true;
  hasPendingDraftBanner.value = false;
  toast.success("Borrador de conciliación restaurado.");
};

const discardDraft = async () => {
  localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
  hasPendingDraftBanner.value = false;
  pendingDraftData.value = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('conciliacion_borradores').delete().eq('user_id', user.id);
    }
  } catch (e) {
    console.warn("Error al borrar borrador en DB:", e);
  }
};

const clearDraftStorage = async () => {
  localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
  pendingDraftData.value = null;
  hasPendingDraftBanner.value = false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('conciliacion_borradores').delete().eq('user_id', user.id);
    }
  } catch (e) {
    console.warn("Error al limpiar borrador remoto:", e);
  }
};

const skipLibroMayorStep = () => {
  isLibroMayorSkipped.value = true;
  saveDraftDebounced();
};

const fetchInitialData = async () => {
  try {
    const { data: instData } = await supabase
      .from('reportes')
      .select('instrumentador_dni, instrumentador, instrumentador_completado')
      .not('instrumentador_dni', 'is', null);

    const mapInst = {};
    if (instData) {
      instData.forEach(r => {
        if (r.instrumentador_dni && !mapInst[r.instrumentador_dni]) {
          mapInst[r.instrumentador_dni] = {
            dni: r.instrumentador_dni,
            nombre: r.instrumentador_completado || r.instrumentador
          };
        }
      });
    }
    instrumentadoresOptions.value = Object.values(mapInst);

    let combinedList = [];

    // 1. Fetch cirugías pendientes
    const { data: surgData, error: surgErr } = await supabase.rpc('get_todas_cirugias_pendientes');
    if (!surgErr && surgData) {
      combinedList = surgData.map(s => ({ ...s, esPagada: false }));
    }

    // 2. Fetch cirugías pagadas/liquidadas desde reportes para permitir verificación
    const { data: paidData } = await supabase
      .from('reportes')
      .select('id, paciente, medico, lugar_cirugia, fecha_cirugia, instrumentador_dni, instrumentador, instrumentador_completado, monto_a_pagar, monto, estado, pago_id')
      .eq('estado', 'Pagado')
      .order('fecha_cirugia', { ascending: false })
      .limit(300);

    if (paidData) {
      const existingIds = new Set(combinedList.map(s => s.id));
      paidData.forEach(p => {
        if (!existingIds.has(p.id)) {
          combinedList.push({
            id: p.id,
            paciente: p.paciente || 'Sin nombre',
            medico: p.medico || '',
            lugar_cirugia: p.lugar_cirugia || '',
            fecha_cirugia: p.fecha_cirugia,
            instrumentador_dni: p.instrumentador_dni,
            instrumentador_completado: p.instrumentador_completado || p.instrumentador,
            monto_a_pagar: p.monto_a_pagar || p.monto || 0,
            monto: p.monto_a_pagar || p.monto || 0,
            estado: p.estado || 'Pagado',
            pago_id: p.pago_id,
            esPagada: true
          });
        }
      });
    }

    allPendingSurgeries.value = combinedList;
  } catch (err) {
    console.warn("Error cargando datos iniciales:", err);
  }
};

const handleExcelUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const fileName = file.name;
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (!rawRows || rawRows.length === 0) {
        throw new Error("El archivo Excel está vacío.");
      }

      const normalizeStr = (str) => {
        if (!str) return '';
        return String(str)
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      };

      let headerRowIndex = -1;
      let colMap = { nombre: -1, cuit: -1, haber: -1, debe: -1, concepto: -1, observacion: -1, numero: -1 };

      for (let r = 0; r < Math.min(30, rawRows.length); r++) {
        const rowCells = rawRows[r];
        if (!Array.isArray(rowCells)) continue;

        let tempColMap = { nombre: -1, cuit: -1, haber: -1, debe: -1, concepto: -1, observacion: -1, numero: -1 };

        rowCells.forEach((cell, colIdx) => {
          const norm = normalizeStr(cell);
          if (!norm) return;

          if (norm.includes('nombre') || norm.includes('contacto') || norm.includes('titular') || norm.includes('beneficiario')) {
            tempColMap.nombre = colIdx;
          } else if (norm.includes('cuit') || norm.includes('cuil')) {
            tempColMap.cuit = colIdx;
          } else if (norm.includes('haber') || norm === 'monto' || norm === 'importe' || norm === 'total') {
            tempColMap.haber = colIdx;
          } else if (norm.includes('debe')) {
            tempColMap.debe = colIdx;
          } else if (norm.includes('concepto')) {
            tempColMap.concepto = colIdx;
          } else if (norm.includes('observacion') || norm.includes('referencia') || norm.includes('nota')) {
            tempColMap.observacion = colIdx;
          } else if (norm.includes('numero') || norm.includes('nro')) {
            tempColMap.numero = colIdx;
          }
        });

        if (tempColMap.nombre !== -1 && (tempColMap.haber !== -1 || tempColMap.debe !== -1)) {
          headerRowIndex = r;
          colMap = tempColMap;
          break;
        }
      }

      if (headerRowIndex === -1) {
        toast.error("No se pudo reconocer el formato de la Planilla ERP. Verifique los encabezados 'Nombre' y 'Haber'.");
        return;
      }

      const grouped = {};
      let totalLiquidacionesCount = 0;
      let totalMontoSum = 0;

      for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!Array.isArray(row) || row.length === 0) continue;

        const rawNombre = String(row[colMap.nombre] || '').trim();
        const rawConcepto = colMap.concepto !== -1 ? String(row[colMap.concepto] || '').trim() : '';
        const rawObs = colMap.observacion !== -1 ? String(row[colMap.observacion] || '').trim() : '';
        const rawCuit = colMap.cuit !== -1 ? String(row[colMap.cuit] || '').replace(/\D/g, '') : '';

        const combinedCheckText = normalizeStr(`${rawNombre} ${rawConcepto} ${rawObs}`);
        if (
          combinedCheckText.includes('totales acumulados') ||
          combinedCheckText.includes('saldo final') ||
          combinedCheckText.includes('total acumulado') ||
          combinedCheckText.includes('subtotal') ||
          combinedCheckText.includes('pagina ') ||
          combinedCheckText === 'totales' ||
          combinedCheckText === 'total'
        ) {
          continue;
        }

        let rawVal = colMap.haber !== -1 ? row[colMap.haber] : '';
        if ((rawVal === '' || rawVal === 0 || rawVal === undefined) && colMap.debe !== -1) {
          rawVal = row[colMap.debe];
        }

        let monto = 0;
        if (typeof rawVal === 'number') {
          monto = rawVal;
        } else if (typeof rawVal === 'string' && rawVal.trim() !== '') {
          const cleanVal = rawVal.trim().replace(/\./g, '').replace(',', '.');
          const parsed = parseFloat(cleanVal);
          if (!isNaN(parsed)) monto = parsed;
        }

        if (rawNombre && monto > 0) {
          const key = rawCuit || rawNombre.toLowerCase();
          const descripcionStr = [rawConcepto, rawObs].filter(Boolean).join(' - ');

          if (!grouped[key]) {
            grouped[key] = {
              instrumentadorNombre: rawNombre,
              cuitCuil: rawCuit,
              totalEsperado: 0,
              liquidaciones: []
            };
          }

          grouped[key].totalEsperado += monto;
          grouped[key].liquidaciones.push({
            monto,
            descripcion: descripcionStr,
            refErpCx: descripcionStr.match(/cx\s*\d+/i)?.[0] || ''
          });

          totalLiquidacionesCount++;
          totalMontoSum += monto;
        }
      }

      const resultList = Object.values(grouped);

      if (resultList.length === 0 || totalLiquidacionesCount === 0) {
        toast.error("El archivo no posee liquidaciones válidas.");
        return;
      }

      libroMayorFileName.value = fileName;
      libroMayorSummary.value = resultList;
      isLibroMayorSkipped.value = false;

      toast.success(`Planilla ERP importada: ${resultList.length} instrumentadores (${totalLiquidacionesCount} liquidaciones).`);

      reprocessMatchingWithLibroMayor();
      saveDraftDebounced();
    } catch (err) {
      console.error("Error procesando Excel:", err);
      toast.error("Error al leer la Planilla ERP.");
    }
  };

  reader.readAsArrayBuffer(file);
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileInputChange = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    processMultipleFiles(Array.from(e.target.files));
  }
};

const handleFileDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    processMultipleFiles(Array.from(e.dataTransfer.files));
  }
};

const processMultipleFiles = async (rawFiles) => {
  for (const rawFile of rawFiles) {
    const fileId = 'file_' + Math.random().toString(36).substring(2, 9);
    const item = ref({
      id: fileId,
      rawFile,
      name: rawFile.name,
      size: rawFile.size,
      type: rawFile.type,
      fileHash: '',
      isCached: false,
      isConfirmed: false,
      saldoPendienteInterno: 0,
      observaciones: '',
      status: 'processing',
      progress: 0,
      extractedData: null,
      matchedInstrumentador: null,
      matchType: 'desconocido',
      selectedInstrumentadorDni: '',
      rememberRule: true,
      error: null
    });

    files.value.push(item.value);
    reconciliationsMap.value[fileId] = { cirugias: [] };

    processSingleFileWithCacheAndIa(item.value);
  }
};

const processSingleFileWithCacheAndIa = async (item) => {
  try {
    const hash = await computeFileHash(item.rawFile);
    item.fileHash = hash;

    if (inFlightHashes.has(hash)) {
      console.log("Comprobante con mismo hash ya está procesándose:", hash);
    }
    inFlightHashes.add(hash);

    const { data: cached } = await supabase
      .from('conciliacion_cache_comprobantes')
      .select('extracted_data, matched_instrumentador, match_type')
      .eq('file_hash', hash)
      .maybeSingle();

    if (cached && cached.extracted_data) {
      console.log("✓ Reutilizando extracción desde caché SHA-256 para:", item.name);
      item.extractedData = cached.extracted_data;
      item.matchedInstrumentador = cached.matched_instrumentador;
      item.matchType = cached.match_type || 'cache_sha256';
      item.isCached = true;
      item.status = 'success';

      tryMatchWithLibroMayor(item);
      saveDraftDebounced();
      return;
    }

    const base64 = await fileToBase64(item.rawFile);
    item.fileBase64 = base64;

    const { data, error: fnErr } = await supabase.functions.invoke('procesar-comprobante-ia', {
      body: {
        fileBase64: base64,
        mimeType: item.type,
        fileName: item.name
      }
    });

    if (fnErr) throw fnErr;
    if (!data.success) throw new Error(data.error || "No se pudo procesar el comprobante.");

    item.extractedData = data.extractedData;
    item.matchedInstrumentador = data.matchedInstrumentador;
    item.matchType = data.matchType;
    item.status = 'success';

    tryMatchWithLibroMayor(item);

    try {
      await supabase.from('conciliacion_cache_comprobantes').upsert({
        file_hash: hash,
        file_name: item.name,
        extracted_data: data.extractedData,
        matched_instrumentador: data.matchedInstrumentador,
        match_type: data.matchType
      }, { onConflict: 'file_hash' });
    } catch (cacheErr) {
      console.warn("Error guardando en caché Supabase:", cacheErr);
    }

    saveDraftDebounced();
  } catch (err) {
    console.error(`Error procesando ${item.name}:`, err);
    item.status = 'error';
    item.error = err.message;
    saveDraftDebounced();
  } finally {
    if (item.fileHash) {
      inFlightHashes.delete(item.fileHash);
    }
  }
};

const tryMatchWithLibroMayor = (item) => {
  if (!libroMayorSummary.value || !item.extractedData) return;

  const cuit = item.extractedData.destinatario_cuit_cuil ? item.extractedData.destinatario_cuit_cuil.replace(/\D/g, '') : '';
  const monto = item.extractedData.monto_transferido || 0;
  const nombre = item.extractedData.destinatario_nombre ? item.extractedData.destinatario_nombre.toLowerCase() : '';

  const erpMatch = libroMayorSummary.value.find(lm => {
    const matchCuit = cuit && lm.cuitCuil === cuit;
    const matchNombreMonto = nombre && lm.instrumentadorNombre.toLowerCase().includes(nombre) && Math.abs(lm.totalEsperado - monto) < 1;
    return matchCuit || matchNombreMonto;
  });

  if (erpMatch) {
    const instGiq = instrumentadoresOptions.value.find(i => 
      i.nombre.toLowerCase().includes(erpMatch.instrumentadorNombre.toLowerCase())
    );

    item.matchedInstrumentador = {
      dni: instGiq ? instGiq.dni : 'erp-match',
      nombre: erpMatch.instrumentadorNombre
    };
    item.matchType = 'libro_mayor';
  }
};

const reprocessMatchingWithLibroMayor = () => {
  files.value.forEach(item => {
    if (item.status === 'success') {
      tryMatchWithLibroMayor(item);
    }
  });
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result.toString();
      const base64Clean = result.substring(result.indexOf(',') + 1);
      resolve(base64Clean);
    };
    reader.onerror = error => reject(error);
  });
};

const setActiveFile = (item) => {
  activeFileId.value = item.id;
  saveDraftDebounced();
};

const addSurgeryToActiveDirect = (surg) => {
  if (!activeFileId.value) return;
  if (!reconciliationsMap.value[activeFileId.value]) {
    reconciliationsMap.value[activeFileId.value] = { cirugias: [] };
  }
  const list = reconciliationsMap.value[activeFileId.value].cirugias;

  const totalCxVal = Number(surg.monto_a_pagar || surg.monto) || 0;
  
  let allocated = 0;
  if (targetPreallocatedAmount.value > 0) {
    allocated = targetPreallocatedAmount.value;
  } else if (activeSaldoPendiente.value > 0) {
    allocated = activeSaldoPendiente.value;
  } else {
    allocated = totalCxVal > 0 ? totalCxVal : activeTransferMonto.value;
  }

  list.push({
    id: surg.id,
    paciente: surg.paciente,
    medico: surg.medico,
    lugar_cirugia: surg.lugar_cirugia,
    fecha_cirugia: surg.fecha_cirugia,
    totalCx: totalCxVal,
    esDividido: false,
    parte1: allocated,
    parte2: 0
  });

  toast.info(`Cirugía de ${surg.paciente} vinculada ($${formatNumber(allocated)}). Podés editar el monto libremente.`);
  targetPreallocatedAmount.value = 0;
  saveDraftDebounced();
};

const removeCirugiaFromActive = (index) => {
  if (!activeFileId.value) return;
  reconciliationsMap.value[activeFileId.value].cirugias.splice(index, 1);
  saveDraftDebounced();
};

const handleDividirToggle = (item) => {
  if (!item.esDividido) {
    item.parte1 = item.totalCx;
    item.parte2 = 0;
  } else {
    item.parte1 = Math.round(item.totalCx / 2);
    item.parte2 = item.totalCx - item.parte1;
  }
  saveDraftDebounced();
};

const clearAllFiles = () => {
  files.value = [];
  activeFileId.value = null;
  reconciliationsMap.value = {};
  showImputacionModal.value = false;
  saveDraftDebounced();
};

const confirmarConciliacion = async () => {
  if (activeCirugias.value.length === 0) {
    toast.error("Vincular al menos 1 cirugía para registrar la conciliación.");
    return;
  }

  isSubmitting.value = true;
  try {
    const notasConciliacion = [
      `[CONCILIACIÓN DE PAGOS] ${activeFile.value.extractedData?.destinatario_nombre || ''}`,
      `Ref Operación: ${activeFile.value.extractedData?.numero_operacion || 'Comprobante Conciliado'}`,
      activeSaldoPendiente.value > 0 ? `⚠️ Saldo Pendiente Interno Registrado: $${formatNumber(activeSaldoPendiente.value)}` : 'Saldo $0 exacto',
      activeFile.value.observaciones ? `Notas: ${activeFile.value.observaciones}` : ''
    ].filter(Boolean).join(' | ');

    const ordenDePago = {
      monto_total_general: activeAsignadoMonto.value,
      comprobante_object_key: null,
      notas: notasConciliacion,
      pagos: [
        {
          instrumentador_dni: activeFile.value.matchedInstrumentador.dni,
          monto_total_instrumentador: activeAsignadoMonto.value,
          cirugias: activeCirugias.value.map(c => ({
            id: c.id,
            monto: Number(c.parte1) || 0
          }))
        }
      ]
    };

    const { error: rpcErr } = await supabase.rpc('registrar_orden_de_pago', { p_orden: ordenDePago });
    if (rpcErr) throw rpcErr;

    if (activeFile.value) {
      activeFile.value.isConfirmed = true;
      activeFile.value.saldoPendienteInterno = activeSaldoPendiente.value;
    }

    toast.success(`🚀 ¡Conciliación confirmada para ${activeFile.value.matchedInstrumentador.nombre}! ${activeSaldoPendiente.value > 0 ? `(Queda saldo pendiente interno: $${formatNumber(activeSaldoPendiente.value)})` : ''}`);

    showImputacionModal.value = false;

    if (allFilesConfirmed.value) {
      toast.success("🎉 ¡Felicitaciones! Has completado el procesamiento de todo el lote.");
    }

    saveDraftDebounced();
    fetchInitialData();
  } catch (err) {
    console.error("Error al registrar conciliación:", err);
    toast.error(`Error al confirmar conciliación: ${err.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchInitialData();
  checkForExistingDraft();
  window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
