<!-- src/views/admin/ResumenOperativoLoteView.vue -->
<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:min-h-0">
    
    <!-- Barra Superior Flotante de Acciones (Oculta al imprimir) -->
    <header class="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm print:hidden">
      <div class="max-w-6xl mx-auto flex flex-col gap-3">
        
        <!-- Fila Superior: Título y Botón Principal -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase">DISTRICORR · GESTIÓN IQ</span>
              <span v-if="lote" class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold">
                LOTE INMUTABLE
              </span>
            </div>
            <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Impresión de Fichas de Cirugía
            </h1>
            <p v-if="lote" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Período: <strong>{{ formatDate(lote.periodo_desde) }}</strong> al <strong>{{ formatDate(lote.periodo_hasta) }}</strong> · {{ fichas.length }} Ficha(s) total
              <span class="ml-1 font-bold text-emerald-600 dark:text-emerald-400">· {{ selectedCount }} para imprimir</span>
              <span v-if="deselectedCount > 0" class="ml-1 font-bold text-slate-400 dark:text-slate-500">· {{ deselectedCount }} deseleccionada{{ deselectedCount > 1 ? 's' : '' }}</span>
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <!-- Indicador de Carga de Recursos -->
            <div v-if="!allLoaded && fichas.length > 0" class="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/80">
              <svg class="animate-spin h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Cargando recursos...</span>
            </div>

            <!-- Botón de Impresión de Seleccionadas -->
            <button 
              @click="handlePrint" 
              :disabled="!allLoaded || loading || selectedCount === 0"
              :class="[
                'px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer',
                allLoaded && !loading && selectedCount > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir Seleccionadas ({{ selectedCount }} de {{ fichas.length }}<span v-if="deselectedCount > 0" class="opacity-80 font-normal"> · {{ deselectedCount }} omitida{{ deselectedCount > 1 ? 's' : '' }}</span>)</span>
            </button>
          </div>
        </div>

        <!-- Fila Inferior: Selección por Checkboxes de Estado de Control y Devolución -->
        <div v-if="fichas.length > 0 && !loading" class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          
          <!-- Grupo de Checkboxes por Estado de Control y Devolución -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 mr-1">
              <span>📦</span>
              <span>Control y Devolución:</span>
            </span>

            <!-- Checkbox 🟢 Control OK -->
            <label 
              v-if="okCount > 0"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer select-none"
              :class="isStateSelected('ok')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-400/40' 
                : isStateIndeterminate('ok')
                  ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'"
            >
              <input 
                type="checkbox"
                :checked="isStateSelected('ok')"
                :indeterminate.prop="isStateIndeterminate('ok')"
                @change="toggleStateGroup('ok', $event.target.checked)"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <span>🟢 Control OK ({{ okCount }})</span>
            </label>

            <!-- Checkbox 🔴 Con Problemas -->
            <label 
              v-if="problemasCount > 0"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer select-none"
              :class="isStateSelected('problemas')
                ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 ring-1 ring-red-400/40' 
                : isStateIndeterminate('problemas')
                  ? 'bg-red-50/50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'"
            >
              <input 
                type="checkbox"
                :checked="isStateSelected('problemas')"
                :indeterminate.prop="isStateIndeterminate('problemas')"
                @change="toggleStateGroup('problemas', $event.target.checked)"
                class="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <span>🔴 Con Problemas ({{ problemasCount }})</span>
            </label>

            <!-- Checkbox ⚠️ En Revisión -->
            <label 
              v-if="revisionCount > 0"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer select-none"
              :class="isStateSelected('revision')
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 ring-1 ring-amber-400/40' 
                : isStateIndeterminate('revision')
                  ? 'bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'"
            >
              <input 
                type="checkbox"
                :checked="isStateSelected('revision')"
                :indeterminate.prop="isStateIndeterminate('revision')"
                @change="toggleStateGroup('revision', $event.target.checked)"
                class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <span>⚠️ En Revisión ({{ revisionCount }})</span>
            </label>

            <!-- Checkbox ⏳ Falta Control -->
            <label 
              v-if="pendingControlCount > 0"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer select-none"
              :class="isStateSelected('sin_control')
                ? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 ring-1 ring-slate-400/40' 
                : isStateIndeterminate('sin_control')
                  ? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'"
            >
              <input 
                type="checkbox"
                :checked="isStateSelected('sin_control')"
                :indeterminate.prop="isStateIndeterminate('sin_control')"
                @change="toggleStateGroup('sin_control', $event.target.checked)"
                class="w-4 h-4 rounded text-slate-600 focus:ring-slate-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <span>⏳ Falta Control ({{ pendingControlCount }})</span>
            </label>
          </div>

          <!-- Acciones Rápidas Masivas y Resumen de Deseleccionadas -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold">🟢 {{ selectedCount }} para imprimir</span>
              <span v-if="deselectedCount > 0" class="text-slate-400 dark:text-slate-500 font-medium">· ⚪ {{ deselectedCount }} deseleccionadas</span>
            </div>

            <span class="text-slate-200 dark:text-slate-700 hidden sm:inline">|</span>

            <div class="flex items-center gap-2">
              <button 
                type="button"
                @click="selectAll"
                class="px-2.5 py-1 rounded-lg font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all cursor-pointer"
              >
                Seleccionar todas
              </button>

              <span class="text-slate-300 dark:text-slate-700">|</span>

              <button 
                type="button"
                @click="deselectAll"
                class="px-2.5 py-1 rounded-lg font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Limpiar selección
              </button>
            </div>
          </div>

        </div>

      </div>
    </header>

    <!-- Estado de Carga Inicial -->
    <div v-if="loading" class="py-24 text-center space-y-3 print:hidden">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="text-sm font-medium text-slate-500">Cargando fichas del lote inmutable...</p>
    </div>

    <!-- Error al cargar lote -->
    <div v-else-if="error" class="max-w-xl mx-auto my-12 p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-3 print:hidden">
      <div class="text-2xl">⚠️</div>
      <h2 class="text-base font-bold text-red-800 dark:text-red-300">Error al cargar el lote</h2>
      <p class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Sin Fichas -->
    <div v-else-if="fichas.length === 0" class="max-w-xl mx-auto my-12 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 print:hidden">
      <p class="text-sm text-slate-500">Este lote no contiene fichas enviadas registradas.</p>
    </div>

    <!-- Contenedor Principal de Fichas con Selector Individual -->
    <main v-else class="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 print:space-y-0 print:p-0 print:m-0 print:max-w-none flex flex-col items-center print:block">
      
      <div 
        v-for="(ficha, index) in fichas" 
        :key="ficha.id || index"
        :class="[
          'w-full shadow-sm rounded-xl overflow-hidden print:shadow-none print:rounded-none transition-all',
          { 
            'page-break-card': index < selectedFichas.length - 1,
            'print:hidden hidden': !selectedIds.has(ficha.id),
            'ring-2 ring-blue-500/20': selectedIds.has(ficha.id),
            'opacity-60': !selectedIds.has(ficha.id)
          }
        ]"
      >
        <!-- Encabezado de Control, Recordatorios y Checkbox de Selección (Oculto al imprimir) -->
        <div class="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              :value="ficha.id"
              :checked="selectedIds.has(ficha.id)"
              @change="toggleSelectFicha(ficha.id)"
              class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
            />
            <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
              #{{ String(index + 1).padStart(2, '0') }} · {{ ficha.paciente || 'Sin especificar' }}
            </span>
            <span v-if="ficha.instrumentador_completado || ficha.instrumentador" class="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              ({{ ficha.instrumentador_completado || ficha.instrumentador }})
            </span>
          </label>

          <div class="flex items-center gap-2">
            <!-- Botón / Badge de Nota de Recordatorio -->
            <div class="flex items-center">
              <!-- Si ya tiene nota cargada -->
              <div 
                v-if="getNota(ficha.id)"
                @click="abrirModalNota(ficha)"
                class="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-semibold cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all shadow-xs"
                title="Hacé clic para ver o editar este recordatorio"
              >
                <span class="text-xs">📌</span>
                <span class="max-w-[140px] sm:max-w-[200px] truncate font-medium">{{ getNota(ficha.id) }}</span>
                <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:underline ml-0.5">✏️</span>
              </div>

              <!-- Si aún no tiene nota -->
              <button
                v-else
                type="button"
                @click="abrirModalNota(ficha)"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-medium transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Agregar nota o recordatorio interno a este caso"
              >
                <span>📝</span>
                <span class="text-[10px] font-bold">+ Nota</span>
              </button>
            </div>

            <!-- Estado de Control -->
            <div v-if="ficha.es_ok" class="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
              🟢 Control: OK
            </div>
            <div v-else-if="ficha.tiene_problemas" class="flex flex-col items-end">
              <span class="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-700 bg-red-100 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800 px-2.5 py-0.5 rounded-full">
                🔴 Control: Con Problemas
              </span>
              <span v-if="ficha.control_observaciones" class="text-[10px] font-semibold text-red-600 dark:text-red-400 mt-0.5 max-w-xs truncate" :title="ficha.control_observaciones">
                Obs: {{ ficha.control_observaciones }}
              </span>
            </div>
            <div v-else-if="ficha.necesita_revision" class="flex flex-col items-end">
              <span class="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                ⚠️ En Revisión
              </span>
              <span v-if="ficha.control_observaciones" class="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 max-w-xs truncate" :title="ficha.control_observaciones">
                Obs: {{ ficha.control_observaciones }}
              </span>
            </div>
            <span 
              v-else 
              class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full"
            >
              ⏳ Falta control
            </span>
          </div>
        </div>

        <!-- Renderizado de la Ficha en PDF -->
        <ReportPDF :reporte="ficha" />
      </div>

    </main>

    <!-- Modal para Agregar / Editar Nota y Control de Logística -->
    <div v-if="activeNotaFicha" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:hidden">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in duration-150">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-base">📦</span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Control de Logística · Nota de Caso
            </h3>
          </div>
          <button 
            type="button"
            @click="cerrarModalNota" 
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p class="text-xs text-slate-700 dark:text-slate-200 font-bold">
              Paciente: {{ activeNotaFicha.paciente || 'Sin especificar' }}
            </p>
            <p v-if="activeNotaFicha.instrumentador_completado || activeNotaFicha.instrumentador" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Instrumentador: {{ activeNotaFicha.instrumentador_completado || activeNotaFicha.instrumentador }}
            </p>
          </div>

          <!-- Selector de Estado de Control -->
          <div>
            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Estado de Control / Devolución:
            </label>
            <div class="grid grid-cols-3 gap-2">
              <label 
                class="flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-center select-none"
                :class="tempEstado === 'problemas'
                  ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 ring-2 ring-red-400/40 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
              >
                <input type="radio" value="problemas" v-model="tempEstado" class="sr-only" />
                <span class="text-sm mb-0.5">🔴</span>
                <span class="text-[11px] font-bold leading-tight">Con Problemas</span>
              </label>

              <label 
                class="flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-center select-none"
                :class="tempEstado === 'revision'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 ring-2 ring-amber-400/40 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
              >
                <input type="radio" value="revision" v-model="tempEstado" class="sr-only" />
                <span class="text-sm mb-0.5">⚠️</span>
                <span class="text-[11px] font-bold leading-tight">En Revisión</span>
              </label>

              <label 
                class="flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-center select-none"
                :class="tempEstado === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-400/40 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
              >
                <input type="radio" value="ok" v-model="tempEstado" class="sr-only" />
                <span class="text-sm mb-0.5">🟢</span>
                <span class="text-[11px] font-bold leading-tight">Control OK</span>
              </label>
            </div>
          </div>

          <!-- Observaciones / Motivo -->
          <div>
            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              Motivo / Observación de Logística:
            </label>
            <textarea
              v-model="tempNotaTexto"
              rows="3"
              placeholder="Ej: Caso retenido por revisión de caja, aguardar comprobante de devolución, etc."
              class="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
              autofocus
            ></textarea>
            <p class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span>🚚</span>
              <span>Esta nota se guarda en Logística Interna y se comparte con todo el equipo.</span>
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button 
            v-if="activeNotaFicha.tiene_control || getNota(activeNotaFicha.id)"
            type="button"
            :disabled="isSavingNota"
            @click="eliminarNota(activeNotaFicha.id)"
            class="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-semibold cursor-pointer px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all disabled:opacity-50"
          >
            🗑️ Eliminar control
          </button>
          <div v-else></div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              :disabled="isSavingNota"
              @click="cerrarModalNota"
              class="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              :disabled="isSavingNota"
              @click="guardarNota"
              class="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-70"
            >
              <svg v-if="isSavingNota" class="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSavingNota ? 'Guardando...' : 'Guardar en Logística' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../../services/supabase';
import ReportPDF from '../../components/ReportPDF.vue';
import { normalizeReport, formatDate } from '../../utils/reportMapper.js';

const route = useRoute();
const loading = ref(true);
const error = ref(null);

const lote = ref(null);
const fichas = ref([]);
const selectedIds = ref(new Set());
const assetsLoaded = ref(false);

// Notas y Controles de Logística
const STORAGE_KEY_NOTAS = 'giq_lote_notas_recordatorios';
const notasMap = ref({});
const activeNotaFicha = ref(null);
const tempNotaTexto = ref('');
const tempEstado = ref('problemas');
const isSavingNota = ref(false);

const cargarNotas = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTAS);
    if (raw) {
      notasMap.value = JSON.parse(raw) || {};
    }
  } catch (e) {
    console.warn('[LoteView] Error al leer notas locales:', e);
  }
};

const getNota = (fichaId) => {
  const f = fichas.value.find(item => String(item.id) === String(fichaId));
  return f?.control_observaciones || notasMap.value[String(fichaId)] || '';
};

const abrirModalNota = (ficha) => {
  activeNotaFicha.value = ficha;
  tempNotaTexto.value = ficha.control_observaciones || getNota(ficha.id) || '';
  
  if (ficha.es_ok) {
    tempEstado.value = 'ok';
  } else if (ficha.necesita_revision) {
    tempEstado.value = 'revision';
  } else {
    tempEstado.value = 'problemas';
  }
};

const cerrarModalNota = () => {
  activeNotaFicha.value = null;
  tempNotaTexto.value = '';
  tempEstado.value = 'problemas';
  isSavingNota.value = false;
};

const guardarNota = async () => {
  if (!activeNotaFicha.value) return;
  const fichaId = String(activeNotaFicha.value.id);
  const texto = tempNotaTexto.value.trim();
  const estadoElegido = tempEstado.value || 'problemas';
  
  isSavingNota.value = true;

  try {
    // 1. Consultar si ya existe control en logistica_controles para esta cirugía
    const { data: existing } = await supabase
      .from('logistica_controles')
      .select('id, cirugia_id')
      .eq('cirugia_id', fichaId)
      .limit(1)
      .maybeSingle();

    if (existing && existing.id) {
      const { error: updateErr } = await supabase
        .from('logistica_controles')
        .update({
          estado: estadoElegido,
          observaciones: texto
        })
        .eq('id', existing.id);

      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from('logistica_controles')
        .insert({
          cirugia_id: fichaId,
          estado: estadoElegido,
          observaciones: texto,
          fecha_retiro: new Date().toISOString().split('T')[0]
        });

      if (insertErr) throw insertErr;
    }

    // 2. Actualizar estado reactivo local en la lista de fichas
    const idx = fichas.value.findIndex(f => String(f.id) === fichaId);
    if (idx !== -1) {
      fichas.value[idx].tiene_control = true;
      fichas.value[idx].control_estado = estadoElegido.toUpperCase();
      fichas.value[idx].control_observaciones = texto;
      fichas.value[idx].es_ok = estadoElegido === 'ok';
      fichas.value[idx].tiene_problemas = estadoElegido === 'problemas';
      fichas.value[idx].necesita_revision = estadoElegido === 'revision';
    }

    // 3. Backup local en localStorage
    const updated = { ...notasMap.value };
    if (texto) {
      updated[fichaId] = texto;
    } else {
      delete updated[fichaId];
    }
    notasMap.value = updated;
    try {
      localStorage.setItem(STORAGE_KEY_NOTAS, JSON.stringify(updated));
    } catch (e) {
      console.warn('[LoteView] Error al persistir nota local:', e);
    }

    cerrarModalNota();
  } catch (err) {
    console.error('[LoteView] Error al guardar control de logística:', err);
    alert(`No se pudo guardar en logística: ${err.message || 'Error desconocido'}`);
  } finally {
    isSavingNota.value = false;
  }
};

const eliminarNota = async (fichaId) => {
  isSavingNota.value = true;

  try {
    // 1. Eliminar control de logistica_controles
    const { error: delErr } = await supabase
      .from('logistica_controles')
      .delete()
      .eq('cirugia_id', String(fichaId));

    if (delErr) throw delErr;

    // 2. Limpiar estado reactivo de la ficha
    const idx = fichas.value.findIndex(f => String(f.id) === String(fichaId));
    if (idx !== -1) {
      fichas.value[idx].tiene_control = false;
      fichas.value[idx].control_estado = null;
      fichas.value[idx].control_observaciones = '';
      fichas.value[idx].es_ok = false;
      fichas.value[idx].tiene_problemas = false;
      fichas.value[idx].necesita_revision = false;
    }

    // 3. Limpiar de localStorage
    const updated = { ...notasMap.value };
    delete updated[String(fichaId)];
    notasMap.value = updated;
    try {
      localStorage.setItem(STORAGE_KEY_NOTAS, JSON.stringify(updated));
    } catch (e) {
      console.warn('[LoteView] Error al eliminar nota local:', e);
    }

    cerrarModalNota();
  } catch (err) {
    console.error('[LoteView] Error al eliminar control de logística:', err);
    alert(`No se pudo eliminar el control: ${err.message || 'Error desconocido'}`);
  } finally {
    isSavingNota.value = false;
  }
};

const allLoaded = computed(() => !loading.value && assetsLoaded.value);

const selectedCount = computed(() => selectedIds.value.size);
const deselectedCount = computed(() => Math.max(0, fichas.value.length - selectedCount.value));

const okCount = computed(() => fichas.value.filter(f => f.es_ok).length);
const problemasCount = computed(() => fichas.value.filter(f => f.tiene_problemas).length);
const revisionCount = computed(() => fichas.value.filter(f => f.necesita_revision).length);
const pendingControlCount = computed(() => fichas.value.filter(f => !f.tiene_control).length);

const selectedFichas = computed(() => fichas.value.filter(f => selectedIds.value.has(f.id)));

const getGroupFichas = (group) => {
  if (group === 'ok') return fichas.value.filter(f => f.es_ok);
  if (group === 'problemas') return fichas.value.filter(f => f.tiene_problemas);
  if (group === 'revision') return fichas.value.filter(f => f.necesita_revision);
  if (group === 'sin_control') return fichas.value.filter(f => !f.tiene_control);
  return [];
};

const isStateSelected = (group) => {
  const groupList = getGroupFichas(group);
  if (groupList.length === 0) return false;
  return groupList.every(f => selectedIds.value.has(f.id));
};

const isStateIndeterminate = (group) => {
  const groupList = getGroupFichas(group);
  if (groupList.length === 0) return false;
  const countSelected = groupList.filter(f => selectedIds.value.has(f.id)).length;
  return countSelected > 0 && countSelected < groupList.length;
};

const toggleStateGroup = (group, isChecked) => {
  const groupList = getGroupFichas(group);
  const newSet = new Set(selectedIds.value);
  groupList.forEach(f => {
    if (isChecked) {
      newSet.add(f.id);
    } else {
      newSet.delete(f.id);
    }
  });
  selectedIds.value = newSet;
};

const toggleSelectFicha = (id) => {
  const newSet = new Set(selectedIds.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  selectedIds.value = newSet;
};

const selectAll = () => {
  selectedIds.value = new Set(fichas.value.map(f => f.id));
};

const deselectAll = () => {
  selectedIds.value = new Set();
};

const preloadAssets = async () => {
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const imageUrls = ['/2.svg'];
    fichas.value.forEach(f => {
      if (f.url_firma) imageUrls.push(f.url_firma);
      if (Array.isArray(f.evidencias)) {
        f.evidencias.forEach(ev => {
          if (ev.url) imageUrls.push(ev.url);
          if (ev.thumbnailUrl) imageUrls.push(ev.thumbnailUrl);
        });
      }
    });

    const uniqueUrls = Array.from(new Set(imageUrls));
    await Promise.all(uniqueUrls.map(url => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
      });
    }));

    assetsLoaded.value = true;
  } catch (err) {
    console.warn('[LoteView] Error al precargar imágenes/fuentes:', err);
    assetsLoaded.value = true;
  }
};

const fetchLote = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = route.params.token;
    if (!token) throw new Error("Token de lote no especificado.");

    const { data, error: rpcErr } = await supabase.rpc('obtener_lote_por_token', { p_token: token });

    if (rpcErr) throw rpcErr;
    if (!data.success) throw new Error(data.error || "No se pudo recuperar el lote especificado.");

    lote.value = data.lote;
    
    // 1. Normalizar fichas
    const rawFichas = data.fichas || [];
    const normalized = rawFichas.map(f => normalizeReport(f));
    const surgeryIds = normalized.map(f => f.id).filter(Boolean);

    // 1.1 Fallback resiliente: Si tipo_cirugia no vino en la respuesta de la RPC (omisión en versión anterior de la función),
    // consultar tipo_cirugia directamente desde la tabla reportes para las cirugías del lote
    const missingTipoIds = normalized
      .filter(f => !f.tipo_cirugia || f.tipo_cirugia === 'Sin especificar')
      .map(f => f.id)
      .filter(Boolean);

    if (missingTipoIds.length > 0) {
      try {
        const { data: reportesData } = await supabase
          .from('reportes')
          .select('id, tipo_cirugia')
          .in('id', missingTipoIds);

        if (reportesData && reportesData.length > 0) {
          const tipoMap = new Map(reportesData.map(r => [String(r.id), r.tipo_cirugia]));
          normalized.forEach(f => {
            const val = tipoMap.get(String(f.id));
            if (val) {
              f.tipo_cirugia = val;
            }
          });
        }
      } catch (tipoErr) {
        console.warn('[LoteView] Fallback de tipo_cirugia no pudo completarse:', tipoErr);
      }
    }

    // 2. Consultar en lote el estado y observaciones de control de logística
    const controlMap = new Map();
    if (surgeryIds.length > 0) {
      const { data: controlesData } = await supabase
        .from('logistica_controles')
        .select('cirugia_id, estado, observaciones, created_at')
        .in('cirugia_id', surgeryIds);

      if (controlesData) {
        controlesData.forEach(c => controlMap.set(String(c.cirugia_id), c));
      }
    }

    // 3. Enriquecer fichas con control de logística diferenciando ok, revision y problemas
    const enriched = normalized.map(f => {
      const control = controlMap.get(String(f.id));
      const tieneControl = Boolean(control);
      const rawEstado = (control?.estado || '').toLowerCase().trim();
      const controlEstado = control?.estado || (tieneControl ? 'OK' : null);
      const controlObservaciones = control?.observaciones || '';
      const controlFecha = control?.created_at || null;

      const esOk = tieneControl && (rawEstado === 'ok' || rawEstado === 'correcto');
      const tieneProblemas = tieneControl && (rawEstado === 'problemas' || rawEstado === 'con problemas' || rawEstado === 'error');
      const necesitaRevision = tieneControl && (rawEstado === 'revision' || rawEstado === 'necesita revision');

      return {
        ...f,
        tiene_control: tieneControl,
        control_estado: controlEstado,
        control_observaciones: controlObservaciones,
        control_fecha: controlFecha,
        es_ok: esOk,
        tiene_problemas: tieneProblemas,
        necesita_revision: necesitaRevision
      };
    });

    // 4. Priorizar fichas: las que tienen control OK van primero, luego problemas/revisión, luego sin control
    enriched.sort((a, b) => {
      const score = (item) => item.es_ok ? 3 : (item.tiene_problemas || item.necesita_revision) ? 2 : 1;
      return score(b) - score(a);
    });

    fichas.value = enriched;

    // 5. Preseleccionar automáticamente las fichas con control (o todas si aún no hay controles)
    const controlledIds = enriched.filter(f => f.tiene_control).map(f => f.id);
    if (controlledIds.length > 0) {
      selectedIds.value = new Set(controlledIds);
    } else {
      selectedIds.value = new Set(enriched.map(f => f.id));
    }

    await preloadAssets();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handlePrint = async () => {
  if (!allLoaded.value || selectedCount.value === 0) return;

  // Registrar evento en el historial de PDFs para las fichas seleccionadas
  const toPrint = selectedFichas.value;
  if (toPrint && toPrint.length > 0) {
    for (const ficha of toPrint) {
      if (ficha.id) {
        try {
          await supabase.rpc('log_pdf_generation', { p_reporte_id: ficha.id });
        } catch (err) {
          console.warn(`[LoteView] No se pudo registrar historial PDF para la ficha ${ficha.id}:`, err);
        }
      }
    }
  }

  window.print();
};

onMounted(() => {
  cargarNotas();
  fetchLote();
});
</script>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    margin: 0;
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page-break-card {
    break-after: page !important;
    page-break-after: always !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
</style>
