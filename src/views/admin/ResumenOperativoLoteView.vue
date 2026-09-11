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

        <!-- Barra de Búsqueda Rápida (Oculta al imprimir) -->
        <div v-if="fichas.length > 0 && !loading" class="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div class="relative flex items-center">
            <span class="absolute left-3 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">🔍</span>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por paciente, médico, lugar, instrumentador, tipo de cirugía o ID..."
              class="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              type="button"
              class="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 rounded-md cursor-pointer"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          </div>
          <div v-if="searchQuery.trim()" class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-1 flex items-center justify-between">
            <span>
              Mostrando <strong>{{ displayedFichas.length }}</strong> de {{ fichas.length }} fichas para "<em>{{ searchQuery }}</em>"
            </span>
            <button 
              @click="searchQuery = ''"
              class="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Ver todas
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
      
      <!-- ========================================================================= -->
      <!-- HOJA 1 DE IMPRESIÓN: CHECKLIST DE ENTREGA A PAGOS (Visible solo al imprimir) -->
      <!-- ========================================================================= -->
      <section class="hidden print:block w-full bg-white text-black p-4 page-break-card">
        <div class="space-y-3">
          
          <!-- Cabecera Compacta del Checklist -->
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <div class="flex items-center gap-2.5">
              <img src="/2.svg" alt="Districorr Logo" class="h-8 w-auto object-contain" />
              <div>
                <h1 class="text-sm font-black tracking-tight text-slate-900 uppercase leading-none">
                  DISTRICORR · CHECKLIST DE ENTREGA A PAGOS
                </h1>
                <p class="text-[9px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  Control y Rendición de Fichas Físicas para Liquidación
                </p>
              </div>
            </div>
            <div class="text-right text-[9px] text-slate-600 leading-tight">
              <p><strong class="text-slate-900">Período:</strong> <span v-if="lote">{{ formatDate(lote.periodo_desde) }} al {{ formatDate(lote.periodo_hasta) }}</span></p>
              <p class="text-slate-500 mt-0.5">Fecha de Entrega: {{ new Date().toLocaleDateString('es-AR') }} · {{ selectedFichas.length }} Fichas</p>
            </div>
          </div>

          <!-- Tira Horizontal de Métricas Compactas -->
          <div class="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-[9px]">
            <div class="flex items-center gap-1">
              <span class="text-slate-500 font-bold uppercase">Total a Rendir:</span>
              <span class="font-black text-slate-900 text-xs">{{ selectedFichas.length }}</span>
            </div>
            <div class="h-3 w-px bg-slate-300"></div>
            <div class="flex items-center gap-1">
              <span class="text-emerald-700 font-bold">🟢 Control OK:</span>
              <span class="font-black text-emerald-800 text-xs">{{ selectedFichas.filter(f => f.es_ok).length }}</span>
            </div>
            <div class="h-3 w-px bg-slate-300"></div>
            <div class="flex items-center gap-1">
              <span class="text-rose-700 font-bold">🔴 Con Problemas:</span>
              <span class="font-black text-rose-800 text-xs">{{ selectedFichas.filter(f => f.tiene_problemas).length }}</span>
            </div>
            <div class="h-3 w-px bg-slate-300"></div>
            <div class="flex items-center gap-1">
              <span class="text-amber-700 font-bold">⚠️ En Revisión:</span>
              <span class="font-black text-amber-800 text-xs">{{ selectedFichas.filter(f => f.necesita_revision).length }}</span>
            </div>
            <div class="h-3 w-px bg-slate-300"></div>
            <div class="flex items-center gap-1">
              <span class="text-slate-500 font-bold">⏳ Sin Control:</span>
              <span class="font-black text-slate-700 text-xs">{{ selectedFichas.filter(f => !f.tiene_control).length }}</span>
            </div>
          </div>

          <!-- Tabla Checklist Ultra-Compacta -->
          <div>
            <table class="w-full text-[8.5px] border-collapse border border-slate-300 leading-tight">
              <thead>
                <tr class="bg-slate-100 text-slate-800 border-b border-slate-300 uppercase font-black text-left">
                  <th class="p-1 border-r border-slate-300 w-6 text-center">✓</th>
                  <th class="p-1 border-r border-slate-300 w-6 text-center">#</th>
                  <th class="p-1 border-r border-slate-300 min-w-[110px]">Paciente</th>
                  <th class="p-1 border-r border-slate-300 w-14 text-center">Fecha Cx</th>
                  <th class="p-1 border-r border-slate-300 min-w-[90px]">Instrumentador</th>
                  <th class="p-1 border-r border-slate-300">Médico / Tipo de Cirugía</th>
                  <th class="p-1 border-r border-slate-300 min-w-[80px]">Institución</th>
                  <th class="p-1 border-r border-slate-300 w-14 text-center">Control</th>
                  <th class="p-1 border-r border-slate-300 min-w-[80px]">Obs / Notas</th>
                  <th class="p-1 w-12 text-center">VºBº Pagos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr 
                  v-for="(ficha, idx) in selectedFichas" 
                  :key="ficha.id || idx"
                  class="even:bg-slate-50/50"
                >
                  <!-- Casilla de Verificación / Checkbox Físico -->
                  <td class="p-1 border-r border-slate-300 text-center">
                    <span class="inline-block w-3 h-3 border border-slate-400 rounded-xs bg-white"></span>
                  </td>
                  <td class="p-1 border-r border-slate-300 font-bold text-center text-slate-500">
                    {{ String(idx + 1).padStart(2, '0') }}
                  </td>
                  <td class="p-1 border-r border-slate-300 font-extrabold text-slate-900">
                    {{ ficha.paciente || 'Sin especificar' }}
                  </td>
                  <td class="p-1 border-r border-slate-300 text-center text-slate-700 font-mono">
                    {{ formatDate(ficha.fecha_cirugia) }}
                  </td>
                  <td class="p-1 border-r border-slate-300 text-slate-800 font-semibold">
                    {{ ficha.instrumentador_completado || ficha.instrumentador || '-' }}
                  </td>
                  <td class="p-1 border-r border-slate-300 text-slate-700">
                    <span class="font-semibold text-slate-900">{{ ficha.medico || '-' }}</span>
                    <span v-if="ficha.tipo_cirugia" class="text-slate-500 ml-1">· {{ ficha.tipo_cirugia }}</span>
                  </td>
                  <td class="p-1 border-r border-slate-300 text-slate-600">
                    {{ ficha.institucion || '-' }}
                  </td>
                  <td class="p-1 border-r border-slate-300 text-center">
                    <span v-if="ficha.es_ok" class="font-extrabold text-emerald-700">OK</span>
                    <span v-else-if="ficha.tiene_problemas" class="font-extrabold text-rose-700">Problemas</span>
                    <span v-else-if="ficha.necesita_revision" class="font-extrabold text-amber-700">Revisión</span>
                    <span v-else class="text-slate-400 font-medium">S/C</span>
                  </td>
                  <td class="p-1 border-r border-slate-300 text-slate-600 italic">
                    {{ ficha.control_observaciones || getNota(ficha.id) || '-' }}
                  </td>
                  <!-- Casilla para Visto Bueno de Pagos -->
                  <td class="p-1 text-center">
                    <span class="inline-block w-3 h-3 border border-slate-400 rounded-xs bg-white"></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bloque de Firmas y Entrega para el Área de Pagos -->
          <div class="pt-3 border-t border-slate-300 grid grid-cols-2 gap-6 text-[8.5px] text-slate-700">
            <div class="border border-slate-200 rounded-lg p-2 bg-slate-50/50 space-y-3">
              <p class="font-bold text-slate-900 uppercase tracking-wider text-[8px]">Entregado por (Logística / Operaciones):</p>
              <div class="space-y-1.5 pt-1">
                <p>Nombre y Apellido: ___________________________________</p>
                <p>Firma y Fecha: _______________________________________</p>
              </div>
            </div>

            <div class="border border-slate-200 rounded-lg p-2 bg-slate-50/50 space-y-3">
              <p class="font-bold text-slate-900 uppercase tracking-wider text-[8px]">Recibido por (Administración / Área de Pagos):</p>
              <div class="space-y-1.5 pt-1">
                <p>Responsable Receptor: ________________________________</p>
                <p>Firma de Conformidad: ________________________________</p>
              </div>
            </div>
          </div>

          <!-- Pie del Documento -->
          <div class="flex justify-between items-center text-[7.5px] text-slate-400 pt-0.5">
            <span>Gestión IQ · Trazabilidad Quirúrgica Districorr</span>
            <span>Total: {{ selectedFichas.length }} fichas para procesar en pagos</span>
          </div>

        </div>
      </section>

      <!-- Mensaje cuando el filtro de búsqueda no da resultados -->
      <div v-if="displayedFichas.length === 0" class="w-full my-8 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 print:hidden">
        <p class="text-2xl">🔍</p>
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">No se encontraron fichas</h3>
        <p class="text-xs text-slate-500">No hay coincidencias para "{{ searchQuery }}".</p>
        <button 
          @click="searchQuery = ''"
          type="button"
          class="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition cursor-pointer"
        >
          Limpiar búsqueda
        </button>
      </div>

      <!-- Tarjetas de Cirugías -->
      <div 
        v-for="(ficha, index) in displayedFichas" 
        :key="ficha.id || index"
        :class="[
          'w-full shadow-sm rounded-xl overflow-hidden print:shadow-none print:rounded-none transition-all',
          { 
            'page-break-card': true,
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
              <button 
                v-if="getNota(ficha.id)"
                type="button"
                @click="abrirModalNota(ficha)"
                class="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-bold cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all shadow-xs"
                :title="`Nota actual: ${getNota(ficha.id)} (Hacé clic para ver o editar)`"
              >
                <span class="text-xs">📌</span>
                <span class="max-w-[120px] sm:max-w-[170px] truncate font-semibold">{{ getNota(ficha.id) }}</span>
                <span class="text-[10px] opacity-75 group-hover:scale-110 transition-transform">✏️</span>
              </button>

              <!-- Si aún no tiene nota -->
              <button
                v-else
                type="button"
                @click="abrirModalNota(ficha)"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
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

            <!-- Botón / Badge Omitir de Reportes Directo -->
            <button
              v-if="omitidasMap.has(String(ficha.id))"
              type="button"
              @click="toggleOmitirRapido(ficha)"
              class="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-1 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/60 transition cursor-pointer shadow-xs"
              title="Esta cirugía está excluida de los próximos reportes semanales. Hacé clic para reincorporarla"
            >
              <span>🚫 Omitida en Reportes</span>
              <span class="text-[9px] underline opacity-80">(Reincorporar)</span>
            </button>
            <button
              v-else
              type="button"
              @click="toggleOmitirRapido(ficha)"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 text-[11px] font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              title="Omitir esta cirugía en los próximos resúmenes operativos"
            >
              <span class="text-xs">🚫</span>
              <span class="text-[10px] font-bold">Omitir de reportes</span>
            </button>
          </div>
        </div>

        <!-- Mención Minimizada de Nota de Logística (Visible en la tarjeta de la cirugía) -->
        <div 
          v-if="getNota(ficha.id)"
          @click="abrirModalNota(ficha)"
          class="mx-3 sm:mx-4 my-2 px-3 py-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200 cursor-pointer hover:bg-amber-100/90 dark:hover:bg-amber-900/60 transition-all shadow-xs print:hidden"
          title="Hacé clic para ver el detalle completo o editar la nota"
        >
          <div class="flex items-center gap-2 overflow-hidden">
            <span class="text-sm shrink-0">📌</span>
            <span class="font-bold text-amber-900 dark:text-amber-300 shrink-0">Nota de Logística:</span>
            <span class="truncate font-medium text-amber-800 dark:text-amber-200">"{{ getNota(ficha.id) }}"</span>
          </div>
          <span class="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0 flex items-center gap-1">
            <span>Ver / Editar</span>
            <span>✏️</span>
          </span>
        </div>

        <!-- Renderizado de la Ficha en PDF -->
        <ReportPDF :reporte="ficha" />
      </div>

    </main>

    <!-- Modal para Agregar / Editar Nota y Control de Logística -->
    <div v-if="activeNotaFicha" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:hidden">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
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
          <!-- Paciente e Instrumentador -->
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p class="text-xs text-slate-700 dark:text-slate-200 font-bold">
              Paciente: {{ activeNotaFicha.paciente || 'Sin especificar' }}
            </p>
            <p v-if="activeNotaFicha.instrumentador_completado || activeNotaFicha.instrumentador" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Instrumentador: {{ activeNotaFicha.instrumentador_completado || activeNotaFicha.instrumentador }}
            </p>
          </div>

          <!-- Visualización Clara de la Última Nota Guardada -->
          <div v-if="getNota(activeNotaFicha.id)" class="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-300">
              <span class="flex items-center gap-1">
                <span>📌</span>
                <span>Última Nota / Control Registrado:</span>
              </span>
              <span v-if="activeNotaFicha.control_fecha" class="text-[10px] font-normal text-amber-700 dark:text-amber-400">
                {{ formatDateTime(activeNotaFicha.control_fecha) }}
              </span>
            </div>
            <p class="text-xs text-amber-950 dark:text-amber-100 font-medium whitespace-pre-wrap leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 shadow-xs">
              {{ getNota(activeNotaFicha.id) }}
            </p>
          </div>

          <!-- Observaciones Originales del Instrumentador (Contexto del Quirófano) -->
          <div v-if="activeNotaFicha.observaciones" class="p-2.5 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl border border-blue-100 dark:border-slate-700/60 space-y-1 text-xs">
            <div class="flex items-center gap-1 font-bold text-[11px] text-blue-900 dark:text-blue-300">
              <span>📋</span>
              <span>Comentarios del Instrumentador en Quirófano:</span>
            </div>
            <p class="text-[11px] text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap bg-white/60 dark:bg-slate-900/50 p-2 rounded-lg border border-blue-100 dark:border-slate-700/40">
              "{{ activeNotaFicha.observaciones }}"
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
              {{ getNota(activeNotaFicha.id) ? '✏️ Modificar o agregar a la nota:' : '✏️ Motivo / Observación de Logística:' }}
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

          <!-- Checkbox Omitir de Próximos Reportes -->
          <div class="pt-2.5 border-t border-slate-200/70 dark:border-slate-800">
            <label class="flex items-start gap-2.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                v-model="tempOmitir"
                class="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>🚫</span>
                  <span>Omitir esta cirugía en los próximos resúmenes operativos</span>
                </span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500">
                  No se incluirá en los futuros correos semanales automáticos ni entrará al lote.
                </span>
              </div>
            </label>
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
const searchQuery = ref('');

// Fichas filtradas según la búsqueda rápida
const displayedFichas = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return fichas.value;
  return fichas.value.filter(f => {
    const paciente = (f.paciente || '').toLowerCase();
    const medico = (f.medico || '').toLowerCase();
    const inst = (f.institucion || f.lugar_cirugia || '').toLowerCase();
    const tipo = (f.tipo_cirugia || '').toLowerCase();
    const instrum = (f.instrumentador_completado || f.instrumentador || '').toLowerCase();
    const obs = (f.control_observaciones || f.observaciones || '').toLowerCase();
    const id = String(f.id || f.id_cirugia || '');
    return paciente.includes(q) || medico.includes(q) || inst.includes(q) || tipo.includes(q) || instrum.includes(q) || obs.includes(q) || id.includes(q);
  });
});

// Notas y Controles de Logística
const STORAGE_KEY_NOTAS = 'giq_lote_notas_recordatorios';
const notasMap = ref({});
const activeNotaFicha = ref(null);
const tempNotaTexto = ref('');
const tempEstado = ref('problemas');
const tempOmitir = ref(false);
const isSavingNota = ref(false);
const omitidasMap = ref(new Map());

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const fecha = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${fecha} · ${hora} hs`;
};

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

const fetchOmitidas = async () => {
  try {
    const { data } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'cirugias_omitidas')
      .maybeSingle();

    if (data && Array.isArray(data.value)) {
      const map = new Map();
      data.value.forEach(item => map.set(String(item.id || item), item));
      omitidasMap.value = map;
    }
  } catch (err) {
    console.warn('[LoteView] No se pudo cargar lista de cirugías omitidas:', err);
  }
};

const toggleOmitirRapido = async (ficha) => {
  const fichaId = String(ficha.id);
  const isCurrentlyOmitted = omitidasMap.value.has(fichaId);
  const shouldOmit = !isCurrentlyOmitted;

  try {
    const { error: rpcErr } = await supabase.rpc('toggle_omitir_cirugia_resumen', {
      p_cirugia_id: ficha.id,
      p_omitir: shouldOmit,
      p_motivo: ficha.control_observaciones || '',
      p_paciente: ficha.paciente || '',
      p_fecha_cirugia: ficha.fecha_cirugia || ''
    });

    if (rpcErr) {
      // Fallback directo a resumen_operativo_config
      const rawList = Array.from(omitidasMap.value.values());
      let updatedList = [];
      if (shouldOmit) {
        updatedList = [...rawList.filter(i => String(i.id) !== fichaId), {
          id: ficha.id,
          paciente: ficha.paciente || 'Sin especificar',
          fecha_cirugia: ficha.fecha_cirugia || '',
          motivo: ficha.control_observaciones || '',
          omitido_at: new Date().toISOString()
        }];
      } else {
        updatedList = rawList.filter(i => String(i.id) !== fichaId);
      }

      await supabase
        .from('resumen_operativo_config')
        .upsert({
          key: 'cirugias_omitidas',
          value: updatedList,
          updated_at: new Date().toISOString()
        });
    }

    const updated = new Map(omitidasMap.value);
    if (shouldOmit) {
      updated.set(fichaId, {
        id: ficha.id,
        paciente: ficha.paciente,
        fecha_cirugia: ficha.fecha_cirugia,
        motivo: ficha.control_observaciones,
        omitido_at: new Date().toISOString()
      });
    } else {
      updated.delete(fichaId);
    }
    omitidasMap.value = updated;
  } catch (err) {
    console.error('[LoteView] Error al alternar omisión:', err);
    alert('No se pudo actualizar omisión: ' + err.message);
  }
};

const getNota = (fichaId) => {
  const f = fichas.value.find(item => String(item.id) === String(fichaId));
  return f?.control_observaciones || notasMap.value[String(fichaId)] || '';
};

const abrirModalNota = (ficha) => {
  activeNotaFicha.value = ficha;
  tempNotaTexto.value = ficha.control_observaciones || getNota(ficha.id) || '';
  tempOmitir.value = omitidasMap.value.has(String(ficha.id));
  
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
  tempOmitir.value = false;
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

    // 4. Actualizar estado de omisión si fue modificado en el modal
    const isCurrentlyOmitted = omitidasMap.value.has(fichaId);
    if (tempOmitir.value !== isCurrentlyOmitted) {
      try {
        const { error: rpcErr } = await supabase.rpc('toggle_omitir_cirugia_resumen', {
          p_cirugia_id: activeNotaFicha.value.id,
          p_omitir: tempOmitir.value,
          p_motivo: texto,
          p_paciente: activeNotaFicha.value.paciente || '',
          p_fecha_cirugia: activeNotaFicha.value.fecha_cirugia || ''
        });

        if (rpcErr) {
          const rawList = Array.from(omitidasMap.value.values());
          let updatedList = [];
          if (tempOmitir.value) {
            updatedList = [...rawList.filter(i => String(i.id) !== fichaId), {
              id: activeNotaFicha.value.id,
              paciente: activeNotaFicha.value.paciente || 'Sin especificar',
              fecha_cirugia: activeNotaFicha.value.fecha_cirugia || '',
              motivo: texto,
              omitido_at: new Date().toISOString()
            }];
          } else {
            updatedList = rawList.filter(i => String(i.id) !== fichaId);
          }

          await supabase
            .from('resumen_operativo_config')
            .upsert({
              key: 'cirugias_omitidas',
              value: updatedList,
              updated_at: new Date().toISOString()
            });
        }
      } catch (omitErr) {
        console.warn('[LoteView] Fallback en toggle_omitir_cirugia_resumen:', omitErr);
      }

      const updatedOmit = new Map(omitidasMap.value);
      if (tempOmitir.value) {
        updatedOmit.set(fichaId, {
          id: activeNotaFicha.value.id,
          paciente: activeNotaFicha.value.paciente,
          fecha_cirugia: activeNotaFicha.value.fecha_cirugia,
          motivo: texto,
          omitido_at: new Date().toISOString()
        });
      } else {
        updatedOmit.delete(fichaId);
      }
      omitidasMap.value = updatedOmit;
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

    await fetchOmitidas();
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
