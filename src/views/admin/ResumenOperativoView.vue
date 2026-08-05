<!-- src/views/admin/ResumenOperativoView.vue -->
<template>
  <div class="p-4 sm:p-5 lg:p-6 2xl:p-8 bg-slate-50/30 dark:bg-slate-950/10 min-h-screen text-slate-900 dark:text-slate-100">
    
    <!-- Filtros de Período -->
    <section class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-[180px_180px_auto]">
          <label class="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span>Fecha Desde</span>
            <input v-model="filters.from" type="date" class="form-input" @change="fetchReportes" />
          </label>
          <label class="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span>Fecha Hasta</span>
            <input v-model="filters.to" type="date" class="form-input" @change="fetchReportes" />
          </label>
        </div>
        
        <!-- Botones de Período Rápido -->
        <div class="flex flex-wrap gap-2">
          <button @click="setPeriod('this-week')" :class="['btn-period', activePeriod === 'this-week' ? 'active' : '']">
            Esta Semana
          </button>
          <button @click="setPeriod('this-month')" :class="['btn-period', activePeriod === 'this-month' ? 'active' : '']">
            Este Mes
          </button>
          <button @click="setPeriod('last-month')" :class="['btn-period', activePeriod === 'last-month' ? 'active' : '']">
            Mes Anterior
          </button>
        </div>
      </div>
    </section>

    <!-- Cargando / Error -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">Procesando datos del período...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 dark:bg-red-950/20 dark:border-red-900/60 dark:text-red-300" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <div v-else class="space-y-6">
      
      <!-- Tarjetas de Métricas Clave (KPIs cuantitativos) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="kpi-card bg-blue-50/40 border-blue-100 dark:bg-blue-950/10 dark:border-blue-950">
          <span class="kpi-label">Cirugías Cargadas</span>
          <span class="kpi-value text-blue-700 dark:text-blue-400">{{ totalCargadas }}</span>
        </div>
        <div class="kpi-card bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-950">
          <span class="kpi-label">Fichas Completadas</span>
          <span class="kpi-value text-emerald-700 dark:text-emerald-400">{{ totalCompletadas }}</span>
        </div>
        <div class="kpi-card bg-amber-50/40 border-amber-100 dark:bg-amber-950/10 dark:border-amber-950">
          <span class="kpi-label">Fichas Pendientes</span>
          <span class="kpi-value text-amber-700 dark:text-amber-400">{{ totalPendientes }}</span>
        </div>
        <div class="kpi-card bg-indigo-50/40 border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-950">
          <span class="kpi-label">Tasa de Cierre</span>
          <span class="kpi-value text-indigo-700 dark:text-indigo-400">{{ tasaCierre }}%</span>
        </div>
      </div>

      <!-- Desglose de Actividad Diaria -->
      <section class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-800 dark:text-slate-200">Actividad Diaria del Período</h2>
            <p class="text-xs text-slate-500 mt-0.5">Hacé clic en cualquier fila para filtrar los listados de abajo por ese día.</p>
          </div>
          <span v-if="selectedDateFilter" class="text-xxs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-full">
            Filtrado activo
          </span>
        </div>
        
        <!-- Tabla de Actividad Diaria -->
        <div class="max-h-72 overflow-y-auto">
          <table class="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-xxs border-b border-slate-200 dark:border-slate-700">
                <th class="px-4 py-2.5">Día / Fecha</th>
                <th class="px-4 py-2.5 text-center">Cargadas</th>
                <th class="px-4 py-2.5 text-center">Completadas (Firmadas)</th>
                <th class="px-4 py-2.5 text-center">Pendientes</th>
                <th class="px-4 py-2.5 text-right pr-6">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr 
                v-for="day in dailyActivity" 
                :key="day.dateStr" 
                @click="toggleDateFilter(day.dateStr)"
                :class="[
                  'cursor-pointer transition-colors select-none',
                  selectedDateFilter === day.dateStr 
                    ? 'bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-955/15 dark:hover:bg-blue-900/20 font-bold' 
                    : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/20'
                ]"
              >
                <td class="px-4 py-2.5 capitalize font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <span v-if="selectedDateFilter === day.dateStr" class="text-blue-500 font-bold text-xs">➔</span>
                  <span>{{ day.formattedDate }}</span>
                </td>
                <td class="px-4 py-2.5 text-center font-bold text-slate-800 dark:text-slate-200">{{ day.cargadas }}</td>
                <td class="px-4 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">{{ day.completadas }}</td>
                <td class="px-4 py-2.5 text-center text-amber-600 dark:text-amber-400 font-bold">{{ day.pendientes }}</td>
                <td class="px-4 py-2.5 text-right pr-6">
                  <span v-if="day.cargadas === 0" class="text-slate-400 text-xxs">Sin actividad</span>
                  <span v-else-if="day.pendientes === 0" class="badge-status bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">Todo Completo</span>
                  <span v-else class="badge-status bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400">{{ day.pendientes }} Pendientes</span>
                </td>
              </tr>
              <tr v-if="dailyActivity.length === 0">
                <td colspan="5" class="text-center py-6 text-slate-400">No hay rango de fechas seleccionado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Panel de Control de Cierre de Semana (Pestañas) -->
      <section class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <!-- Banner indicador de Filtro Activo por Día -->
        <div v-if="selectedDateFilter" class="mx-4 mt-4 flex items-center justify-between bg-blue-50/50 border border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/40 p-4 rounded-xl shadow-xs">
          <div class="flex items-center space-x-2.5">
            <span class="text-sm">📅</span>
            <div>
              <span class="text-xs md:text-sm text-blue-800 dark:text-blue-400 font-semibold block">
                Filtrado por el {{ formatDate(selectedDateFilter) }}
              </span>
              <span class="text-[10px] text-slate-400 block mt-0.5">
                Mostrando {{ listCompletadas.length }} completadas y {{ listPendientes.length }} pendientes para esta fecha.
              </span>
            </div>
          </div>
          <button 
            @click="selectedDateFilter = null" 
            class="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xxs cursor-pointer transition active:scale-95 shadow-xs"
          >
            Limpiar Filtro
          </button>
        </div>

        <!-- Pestañas -->
        <div class="border-b border-slate-200 dark:border-slate-800 flex bg-slate-50/50 dark:bg-slate-900/30 mt-1">
          <button 
            @click="activeTab = 'completadas'" 
            :class="['tab-btn', activeTab === 'completadas' ? 'active' : '']"
          >
            <span>Listas para Validar / Imprimir</span>
            <span class="tab-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              {{ listCompletadas.length }}
            </span>
          </button>
          <button 
            @click="activeTab = 'pendientes'" 
            :class="['tab-btn', activeTab === 'pendientes' ? 'active' : '']"
          >
            <span>Pendientes de Firma / Enlace</span>
            <span class="tab-badge bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              {{ listPendientes.length }}
            </span>
          </button>
        </div>

        <!-- Contenido de las pestañas -->
        <div class="p-4">
          <Transition name="fade" mode="out-in">
            
            <!-- Pestaña 1: Completadas -->
            <div v-if="activeTab === 'completadas'" key="tab-comp" class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p class="text-xs text-slate-500">Estas cirugías ya fueron firmadas por el instrumentador. Hacé clic en "Detalles / Imprimir" para auditarlas o imprimir la ficha.</p>
                <button 
                  @click="printList('completadas')" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer transition active:scale-95 whitespace-nowrap self-end sm:self-auto"
                  title="Imprimir lista de cirugías completadas"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Imprimir Lista</span>
                </button>
              </div>

              <!-- Listado Completadas -->
              <div class="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table class="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr class="bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-xxs border-b border-slate-200 dark:border-slate-700">
                      <th class="px-4 py-3">Fecha</th>
                      <th class="px-4 py-3">ID Cirugía</th>
                      <th class="px-4 py-3">Paciente</th>
                      <th class="px-4 py-3">Médico</th>
                      <th class="px-4 py-3">Técnico / Instrumentador</th>
                      <th class="px-4 py-3">Lugar / Clínica</th>
                      <th class="px-4 py-3 text-right pr-6">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr v-for="rep in listCompletadas" :key="rep.id" class="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                      <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ formatDate(rep.fecha_cirugia) }}</td>
                      <td class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{{ rep.id_cirugia }}</td>
                      <td class="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{{ rep.paciente }}</td>
                      <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ rep.medico }}</td>
                      <td class="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                        {{ rep.instrumentador_completado || rep.instrumentador || '—' }}
                      </td>
                      <td class="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[150px]" :title="rep.lugar_cirugia">{{ rep.lugar_cirugia || '—' }}</td>
                      <td class="px-4 py-3 text-right pr-6 whitespace-nowrap">
                        <button 
                          @click="openDrawer(rep)" 
                          class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-sm hover:shadow active:scale-95 transition-all animate-none cursor-pointer"
                        >
                          Detalles / Imprimir
                        </button>
                      </td>
                    </tr>
                    <tr v-if="listCompletadas.length === 0">
                      <td colspan="7" class="text-center py-10 text-slate-400">No hay cirugías completadas para mostrar.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pestaña 2: Pendientes -->
            <div v-else key="tab-pend" class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p class="text-xs text-slate-500">Estas cirugías siguen pendientes de firma. Podés copiar el link o enviarlo por WhatsApp para reclamar.</p>
                <button 
                  @click="printList('pendientes')" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer transition active:scale-95 whitespace-nowrap self-end sm:self-auto"
                  title="Imprimir lista de cirugías pendientes"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Imprimir Lista</span>
                </button>
              </div>

              <!-- Listado Pendientes -->
              <div class="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table class="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr class="bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-xxs border-b border-slate-200 dark:border-slate-700">
                      <th class="px-4 py-3">Fecha</th>
                      <th class="px-4 py-3">ID Cirugía</th>
                      <th class="px-4 py-3">Paciente</th>
                      <th class="px-4 py-3">Médico</th>
                      <th class="px-4 py-3">Técnico Asignado</th>
                      <th class="px-4 py-3">Lugar / Clínica</th>
                      <th class="px-4 py-3 text-right pr-6">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr v-for="rep in listPendientes" :key="rep.id" class="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                      <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ formatDate(rep.fecha_cirugia) }}</td>
                      <td class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{{ rep.id_cirugia }}</td>
                      <td class="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{{ rep.paciente }}</td>
                      <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ rep.medico }}</td>
                      <td class="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                        {{ rep.instrumentador || 'Sin técnico asignado' }}
                      </td>
                      <td class="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[150px]" :title="rep.lugar_cirugia">{{ rep.lugar_cirugia || '—' }}</td>
                      <td class="px-4 py-3 text-right pr-6 whitespace-nowrap space-x-2">
                        <!-- Botón Copiar Link (Habilitado si tiene short_code) -->
                        <button 
                          @click="copyLink(rep)" 
                          :disabled="!rep.short_code"
                          :class="[
                            'p-2 rounded-lg border shadow-sm active:scale-95 transition-all inline-flex items-center justify-center disabled:opacity-40 disabled:scale-100 cursor-pointer',
                            rep.short_code 
                              ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/60' 
                              : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500'
                          ]"
                          title="Copiar enlace de firma"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        <!-- Botón WhatsApp (Habilitado si tiene short_code) -->
                        <button 
                          @click="shareOnWhatsApp(rep)" 
                          :disabled="!rep.short_code"
                          class="p-2 rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 dark:bg-green-955/20 dark:text-green-400 dark:border-green-900/60 shadow-sm active:scale-95 transition-all inline-flex items-center justify-center disabled:opacity-40 disabled:scale-100 cursor-pointer"
                           title="Reclamar firma por WhatsApp"
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                        </button>
                        
                        <!-- Botón Detalles/Asignar -->
                        <button 
                          @click="openDrawer(rep)" 
                          class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs active:scale-95 transition-all inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          Detalles
                        </button>
                      </td>
                    </tr>
                    <tr v-if="listPendientes.length === 0">
                      <td colspan="7" class="text-center py-10 text-slate-400">No hay cirugías pendientes para mostrar.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Transition>
        </div>
      </section>
    </div>

    <!-- Modal Explicativo de Bienvenida (Una Sola Vez) -->
    <Transition name="fade">
      <div v-if="showWelcomeModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg shadow-2xl w-full space-y-5 animate-scaleUp">
          
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 text-lg">
              📊
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Resumen Operativo de Fichas</h3>
              <p class="text-xs text-slate-500">¿Para qué sirve este nuevo panel?</p>
            </div>
          </div>

          <div class="text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-3.5 leading-relaxed">
            <p>Este panel ha sido diseñado para simplificar y agilizar tus tareas de **liquidación y control de fichas** de forma visual:</p>
            
            <ul class="space-y-3">
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold">✓</span>
                <span><strong>Métricas de Cierre:</strong> Visualizá las cantidades totales de cirugías cargadas, completadas y las que siguen pendientes en el período seleccionado.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold">✓</span>
                <span><strong>Actividad Diaria:</strong> Llevá un registro cronológico día por día para identificar rápidamente en qué jornadas se acumulan brechas de carga o firmas.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold">✓</span>
                <span><strong>Listo para Validar:</strong> Revisá en segundos las fichas que ya están en estado <em>Enviado</em> y abrí sus detalles para imprimirlas directamente en PDF.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold">✓</span>
                <span><strong>Reclamo de Firmas:</strong> Ubicá al instante qué cirugías siguen pendientes y reclamá la firma al instrumentador asignado copiando el link o enviando un mensaje directo por WhatsApp.</span>
              </li>
            </ul>
          </div>

          <div class="pt-2">
            <button 
              @click="closeWelcomeModal" 
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs md:text-sm shadow-md hover:shadow active:scale-95 transition-all cursor-pointer text-center"
            >
              ¡Entendido, comenzar!
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Componente Reutilizable: ReportDrawer -->
    <ReportDrawer 
      :show="isDrawerVisible" 
      :reporte="selectedReporte" 
      @close="closeDrawer"
      @updated="fetchReportes"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { supabase } from '../../services/supabase.js';
import { useToast } from 'vue-toastification';
import ReportDrawer from '../../components/ReportDrawer.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const toast = useToast();
const headerConfig = inject('header-config', null);

const loading = ref(true);
const error = ref(null);
const reportes = ref([]);
const showWelcomeModal = ref(false);

const filters = ref({
  from: '',
  to: ''
});

const activePeriod = ref('this-week');
const activeTab = ref('completadas');
const selectedDateFilter = ref(null);

// Drawer State
const isDrawerVisible = ref(false);
const selectedReporte = ref(null);

const openDrawer = (reporte) => {
  selectedReporte.value = reporte;
  isDrawerVisible.value = true;
};

const closeDrawer = () => {
  isDrawerVisible.value = false;
  selectedReporte.value = null;
};

const closeWelcomeModal = () => {
  showWelcomeModal.value = false;
  localStorage.setItem('gestion_iq_resumen_operativo_welcome_seen', 'true');
};

const toggleDateFilter = (dateStr) => {
  if (selectedDateFilter.value === dateStr) {
    selectedDateFilter.value = null;
  } else {
    selectedDateFilter.value = dateStr;
  }
};

// KPIs
const totalCargadas = computed(() => reportes.value.length);
const totalCompletadas = computed(() => reportes.value.filter(r => r.estado === 'Enviado').length);
const totalPendientes = computed(() => reportes.value.filter(r => r.estado === 'Pendiente').length);
const tasaCierre = computed(() => {
  if (totalCargadas.value === 0) return 0;
  return Math.round((totalCompletadas.value / totalCargadas.value) * 100);
});

// Pestañas Filtros
const listCompletadas = computed(() => {
  let list = reportes.value.filter(r => r.estado === 'Enviado');
  if (selectedDateFilter.value) {
    list = list.filter(r => r.fecha_cirugia === selectedDateFilter.value);
  }
  return list;
});

const listPendientes = computed(() => {
  let list = reportes.value.filter(r => r.estado === 'Pendiente');
  if (selectedDateFilter.value) {
    list = list.filter(r => r.fecha_cirugia === selectedDateFilter.value);
  }
  return list;
});

// Helper para convertir fecha a string yyyy-mm-dd
const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Configurar Rango por Defecto
const setPeriod = (period) => {
  selectedDateFilter.value = null; // Limpiar filtro diario activo
  activePeriod.value = period;
  const today = new Date();

  if (period === 'this-week') {
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    filters.value.from = toInputDate(monday);
    filters.value.to = toInputDate(sunday);
  } else if (period === 'this-month') {
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    filters.value.from = toInputDate(fromDate);
    filters.value.to = toInputDate(toDate);
  } else if (period === 'last-month') {
    const fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    
    filters.value.from = toInputDate(fromDate);
    filters.value.to = toInputDate(toDate);
  } else {
    activePeriod.value = 'custom';
  }
  
  fetchReportes();
};

const fetchReportes = async () => {
  loading.value = true;
  error.value = null;
  selectedDateFilter.value = null; // Limpiar al refrescar filtros
  
  // Si las fechas cambian manualmente por fuera de los preestablecidos
  if (activePeriod.value !== 'custom') {
    const expected = getPeriodRange(activePeriod.value);
    if (expected && (expected.from !== filters.value.from || expected.to !== filters.value.to)) {
      activePeriod.value = 'custom';
    }
  }

  try {
    const { data, error: fetchError } = await supabase
      .from('reportes')
      .select('id, id_cirugia, paciente, medico, lugar_cirugia, fecha_cirugia, estado, instrumentador, instrumentador_completado, instrumentador_dni, consumo_realizado')
      .gte('fecha_cirugia', filters.value.from)
      .lte('fecha_cirugia', filters.value.to)
      .order('fecha_cirugia', { ascending: true });

    if (fetchError) throw fetchError;

    if (data && data.length > 0) {
      const ids = data.map(r => r.id);
      const { data: linksData, error: linksError } = await supabase
        .from('short_links')
        .select('reporte_id, short_code, created_at')
        .in('reporte_id', ids);

      const linksMap = {};
      if (!linksError && linksData) {
        linksData.forEach(link => {
          linksMap[link.reporte_id] = link;
        });
      }

      reportes.value = data.map(r => ({
        ...r,
        short_code: linksMap[r.id]?.short_code || null,
        fecha_link_generado: linksMap[r.id]?.created_at || null
      }));
    } else {
      reportes.value = [];
    }
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar reportes: " + err.message);
  } finally {
    loading.value = false;
  }
};

const getPeriodRange = (period) => {
  const today = new Date();
  if (period === 'this-week') {
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: toInputDate(monday), to: toInputDate(sunday) };
  } else if (period === 'this-month') {
    return {
      from: toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: toInputDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
    };
  } else if (period === 'last-month') {
    return {
      from: toInputDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      to: toInputDate(new Date(today.getFullYear(), today.getMonth(), 0))
    };
  }
  return null;
};

// Agrupamiento Diario Dinámico
const dailyActivity = computed(() => {
  if (!filters.value.from || !filters.value.to) return [];
  const start = new Date(`${filters.value.from}T00:00:00`);
  const end = new Date(`${filters.value.to}T00:00:00`);
  const days = [];
  let current = new Date(start);

  let limit = 0;
  while (current <= end && limit < 100) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
    limit++;
  }

  return days.map(day => {
    const dateStr = toInputDate(day);
    const dayReports = reportes.value.filter(r => r.fecha_cirugia === dateStr);
    const cargadas = dayReports.length;
    const completadas = dayReports.filter(r => r.estado === 'Enviado').length;

    return {
      dateStr,
      formattedDate: day.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit' }),
      cargadas,
      completadas,
      pendientes: cargadas - completadas
    };
  }).reverse();
});

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Acciones de Copia Rápida y WhatsApp
const copyLink = async (rep) => {
  if (!rep.short_code) return;
  const fullLink = `${window.location.origin}/f/${rep.short_code}`;
  try {
    await navigator.clipboard.writeText(fullLink);
    toast.success(`¡Enlace de firma copiado para ${rep.paciente}!`);
  } catch (err) {
    toast.error('No se pudo copiar el enlace.');
  }
};

const shareOnWhatsApp = (rep) => {
  if (!rep.short_code) return;
  const fullLink = `${window.location.origin}/f/${rep.short_code}`;
  const message = `Hola, te recordamos que podés firmar y completar la Ficha Digital de la cirugía de *${rep.paciente}* (Médico: ${rep.medico}) ingresando en este link rápido:\n\n${fullLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

const printList = (type) => {
  const isCompletadas = type === 'completadas';
  const list = isCompletadas ? listCompletadas.value : listPendientes.value;

  if (list.length === 0) {
    toast.info("No hay datos en la lista para imprimir.");
    return;
  }

  try {
    const doc = new jsPDF({ orientation: 'landscape' });
    const title = isCompletadas ? 'Listas para Validar / Imprimir (Fichas Firmadas)' : 'Pendientes de Firma / Enlace';
    const periodText = `Período: ${formatDate(filters.value.from)} al ${formatDate(filters.value.to)}`;
    const filterText = selectedDateFilter.value ? `Filtro Día: ${formatDate(selectedDateFilter.value)}` : '';

    doc.setFontSize(14);
    doc.text(title, 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${periodText}${filterText ? ' | ' + filterText : ''}`, 14, 22);

    doc.setTextColor(0);

    const headers = ['Fecha', 'ID Cirugía', 'Paciente', 'Médico', isCompletadas ? 'Instrumentador' : 'Técnico Asignado', 'Lugar / Clínica'];
    const body = list.map(r => [
      formatDate(r.fecha_cirugia),
      r.id_cirugia,
      r.paciente,
      r.medico,
      isCompletadas ? (r.instrumentador_completado || r.instrumentador || '—') : (r.instrumentador || 'Sin técnico asignado'),
      r.lugar_cirugia || '—'
    ]);

    autoTable(doc, {
      startY: 26,
      head: [headers],
      body: body,
      theme: 'striped',
      headStyles: { fillColor: isCompletadas ? [16, 185, 129] : [245, 158, 11] }, // Emerald (Completas) o Amber (Pendientes)
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 25 }, // Fecha
        1: { cellWidth: 25 }, // ID Cirugía
        2: { cellWidth: 65 }, // Paciente
        3: { cellWidth: 55 }, // Médico
        4: { cellWidth: 55 }, // Instrumentador / Técnico
        5: { cellWidth: 70 }  // Clínica
      }
    });

    const filename = `Resumen_Operativo_${type}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    toast.success("Listado exportado a PDF correctamente.");
  } catch (err) {
    console.error("Error al exportar a PDF:", err);
    toast.error("No se pudo exportar el listado: " + err.message);
  }
};

onMounted(() => {
  const welcomeSeen = localStorage.getItem('gestion_iq_resumen_operativo_welcome_seen');
  if (!welcomeSeen) {
    showWelcomeModal.value = true;
  }

  if (headerConfig) {
    headerConfig.value = {
      title: 'Resumen Operativo de Fichas',
      buttons: []
    };
  }
  setPeriod('this-week');
});
</script>

<style scoped>
.form-input {
  @apply rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-950/40;
}

.btn-period {
  @apply rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition shadow-sm hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer;
}

.btn-period.active {
  @apply border-blue-600 bg-blue-50/50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 font-bold;
}

.kpi-card {
  @apply flex flex-col justify-center p-5 rounded-2xl border shadow-sm min-h-[90px];
}

.kpi-label {
  @apply text-xxs font-bold text-slate-400 uppercase tracking-widest;
}

.kpi-value {
  @apply text-2xl font-black mt-1 leading-none;
}

.badge-status {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold leading-5 border border-transparent whitespace-nowrap;
}

.tab-btn {
  @apply flex-1 py-4 px-4 text-center font-bold text-xs md:text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition border-b-2 border-transparent flex items-center justify-center gap-2 cursor-pointer;
}

.tab-btn.active {
  @apply border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400;
}

.tab-badge {
  @apply text-xxs font-bold px-2 py-0.5 rounded-full;
}

.table-header {
  @apply truncate px-4 py-3 text-left text-xxs font-semibold uppercase text-slate-500 dark:text-slate-300 tracking-wider;
}

.table-cell {
  @apply truncate whitespace-nowrap px-4 py-3 text-xs md:text-sm text-slate-700 dark:text-slate-300;
}

.text-xxs {
  font-size: 0.68rem;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scaleUp {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
