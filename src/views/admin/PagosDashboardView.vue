<!-- src/views/admin/PagosDashboardView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950/10 min-h-screen">
    <!-- Header moderno con selector de período -->
    <header class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Estación de Pagos Rápidos</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50 shadow-2xs">
            Lotes de Pago
          </span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 mt-1.5 text-xs sm:text-sm">
          Filtrá, ajustá y seleccioná cirugías para generar liquidaciones en lote en una sola operación ágil.
        </p>
      </div>

      <div v-if="!isLoading && !error" class="flex items-center gap-3 shrink-0 self-start md:self-auto">
        <div v-if="activeKpiFilter" class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            {{ activeKpiLabel }}
          </span>
          <button type="button" @click="clearKpiFilter" class="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer shadow-2xs transition-all">
            Limpiar
          </button>
        </div>

        <div class="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 px-3 rounded-2xl shadow-2xs">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">Período:</span>
          <select v-model="filters.period" @change="onPeriodFilterChange" class="bg-transparent border-none text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-0 cursor-pointer pr-1">
            <option v-for="option in kpiPeriodOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </header>

    <!-- Cuadrícula de KPIs Compactos y Elegantes -->
    <section v-if="!isLoading && !error" class="mb-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <button
          v-for="stat in paymentKpis"
          :key="stat.label"
          type="button"
          @click="applyKpiFilter(stat.filter)"
          class="rounded-2xl border p-4 text-left shadow-2xs transition-all duration-200 focus:outline-none cursor-pointer flex flex-col justify-between"
          :class="[stat.cardClass, stat.isActive ? stat.activeClass : 'hover:-translate-y-0.5 hover:shadow-md border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900']"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">{{ stat.label }}</span>
            <div class="rounded-xl p-2 shrink-0 shadow-2xs transition-transform duration-200" :class="stat.iconClass">
              <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path :d="stat.iconPath" />
              </svg>
            </div>
          </div>

          <div class="mt-2.5 mb-1">
            <p class="text-lg sm:text-xl font-extrabold leading-tight text-slate-900 dark:text-white truncate" :title="String(stat.value)">
              {{ stat.value }}
            </p>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 dark:text-slate-500">
            <span class="truncate font-medium">{{ stat.subtitle }}</span>
            <span v-if="stat.isActive" class="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 shrink-0 ml-1">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Activo
            </span>
          </div>
        </button>
      </div>
    </section>

    <div v-if="isLoading" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
      <div class="inline-block w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      <p class="text-slate-500 dark:text-slate-400 mt-3 text-sm font-medium">Cargando cirugías pendientes...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200/60 dark:border-red-900/30 text-center text-sm font-medium shadow-sm">
      <p>Error al cargar las cirugías: {{ error }}</p>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <!-- Columna Principal: Tabla de Cirugías -->
      <div class="lg:col-span-7 xl:col-span-8">
        <!-- Panel de Filtros Modernizado -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <!-- Filtros Principales (Siempre Visibles) -->
          <div class="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Buscar por Texto</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 flex items-center px-3">
                <svg class="w-4 h-4 text-slate-400 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input 
                  type="text" 
                  v-model="filters.searchTerm"
                  placeholder="Paciente o instrumentador..."
                  class="form-input-premium-styled border-none p-0"
                />
              </div>
            </div>
            
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Instrumentador</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                <select v-model="filters.selectedInstrumentador" class="form-input-select-styled font-medium">
                  <option value="todos">Todos los profesionales ({{ allPendingSurgeries.length }})</option>
                  <option v-for="inst in instrumentadorOptions" :key="inst.dni" :value="inst.dni">
                    {{ inst.nombre }} ({{ inst.count }} {{ inst.count === 1 ? 'pendiente' : 'pendientes' }})
                  </option>
                </select>
              </div>
            </div>

            <div class="md:col-span-1 space-y-1.5">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Período</label>
              <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                <select v-model="filters.period" @change="onPeriodFilterChange" class="form-input-select-styled">
                  <option value="current-month">Mes actual</option>
                  <option value="last-30-days">Últimos 30 días</option>
                  <option value="previous-month">Mes anterior</option>
                  <option value="all">Todos</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button @click="clearFilters" class="btn-clear flex-1" title="Restablecer todos los filtros">
                Limpiar
              </button>
              <button 
                @click="showAdvancedFilters = !showAdvancedFilters" 
                class="btn-toggle-filters shrink-0" 
                :class="{'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/50': showAdvancedFilters}"
                title="Filtros avanzados"
              >
                <svg class="w-4 h-4 transition-transform duration-200" :class="{'rotate-180': showAdvancedFilters}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Filtros Avanzados Colapsables (Fechas y Montos) -->
          <Transition name="expand">
            <div v-show="showAdvancedFilters || filters.period === 'custom'" class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Desde</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="date" v-model="filters.startDate" class="form-input-premium-styled text-xs" />
                </div>
              </div>
              
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hasta</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="date" v-model="filters.endDate" class="form-input-premium-styled text-xs" />
                </div>
              </div>
              
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto Mín.</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="number" v-model.number="filters.minAmount" placeholder="Ej: 5000" class="form-input-premium-styled text-xs" />
                </div>
              </div>
              
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto Máx.</label>
                <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-155">
                  <input type="number" v-model.number="filters.maxAmount" placeholder="Ej: 10000" class="form-input-premium-styled text-xs" />
                </div>
              </div>
            </div>
          </Transition>

          <!-- Chips de Filtros Activos Claros -->
          <div v-if="activeFilterChips.length > 0" class="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Filtros Activos:</span>
            <span 
              v-for="chip in activeFilterChips" 
              :key="chip.key"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40 shadow-2xs"
            >
              <span>{{ chip.label }}</span>
              <button @click="removeFilterChip(chip.key)" class="hover:text-indigo-900 dark:hover:text-white cursor-pointer ml-0.5" title="Quitar filtro">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <button @click="clearFilters" class="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold underline cursor-pointer ml-1">
              Borrar todos
            </button>
          </div>
        </div>

        <!-- Tabla de Cirugías con Toolbar y Paginación -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md rounded-2xl overflow-hidden">
          
          <!-- Toolbar superior de la tabla -->
          <div class="p-4 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Cirugías Pendientes</h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50">
                {{ filteredSurgeries.length }}
              </span>
              <span v-if="selectedSurgeryIds.length > 0" class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ({{ selectedSurgeryIds.length }} seleccionada{{ selectedSurgeryIds.length === 1 ? '' : 's' }})
              </span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Acción Oculta/Discreta: Regularizar Históricos sin comprobante -->
              <button 
                type="button"
                @click="openRegularizacionModal"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-900/60 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="Regularizar casos antiguos sin comprobante (Confirmación Exclusiva)"
              >
                <span>🔒</span>
                <span>Regularizar Antiguos</span>
              </button>

              <!-- Selector Registros por Página -->
              <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2">
                <span class="hidden sm:inline font-medium">Mostrar:</span>
                <select v-model="pageSize" @change="currentPage = 1" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
                  <option v-for="size in pageSizeOptions" :key="size" :value="size">
                    {{ size === 'all' ? 'Todos' : size }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contenido de la Tabla -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60">
              <thead class="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/60">
                <tr>
                  <th scope="col" class="p-4 w-12 text-center">
                    <input type="checkbox" @change="toggleSelectAll" :checked="areAllSelected" class="checkbox-lg-styled" />
                  </th>
                  <th scope="col" class="table-header">Paciente / Fechas</th>
                  <th scope="col" class="table-header">Instrumentador</th>
                  <th scope="col" class="table-header text-right">Monto a Pagar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                <tr v-if="filteredSurgeries.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <div class="space-y-2">
                      <p>No se encontraron cirugías para los filtros aplicados.</p>
                      <button v-if="hasActiveFilters" @click="clearFilters" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50 hover:bg-indigo-100 transition-all cursor-pointer">
                        Limpiar Filtros
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-for="surgery in paginatedSurgeries" :key="surgery.id" 
                    class="transition-all duration-150"
                    :class="{
                      'bg-indigo-50/40 dark:bg-indigo-950/20 border-l-4 border-indigo-500': selectedSurgeryIds.includes(surgery.id),
                      'opacity-50 text-slate-400 line-through bg-slate-50/40 dark:bg-slate-900/40': justPaidSurgeryIds.has(surgery.id),
                      'hover:bg-slate-50/60 dark:hover:bg-slate-800/30': !selectedSurgeryIds.includes(surgery.id)
                    }">
                  <td class="p-4 text-center">
                    <input 
                      type="checkbox" 
                      :value="surgery.id"
                      v-model="selectedSurgeryIds"
                      class="checkbox-lg-styled"
                      :disabled="justPaidSurgeryIds.has(surgery.id)"
                    />
                  </td>
                  <td class="table-cell">
                    <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ surgery.paciente }}</div>
                    <div v-if="surgery.medico || surgery.lugar_cirugia" class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs" :title="`${surgery.medico ? 'Dr. ' + surgery.medico : ''} ${surgery.lugar_cirugia ? '• ' + surgery.lugar_cirugia : ''}`">
                      <span v-if="surgery.medico">Dr. {{ surgery.medico }}</span>
                      <span v-if="surgery.medico && surgery.lugar_cirugia"> • </span>
                      <span v-if="surgery.lugar_cirugia">{{ surgery.lugar_cirugia }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5 mt-1 text-xs">
                      <div class="text-slate-500 dark:text-slate-400 font-medium">
                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fecha Cx:</span> {{ formatDate(surgery.fecha_cirugia) }}
                      </div>
                      <div class="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <span class="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider">Ficha completa:</span> {{ getCompletedDate(surgery) }}
                      </div>
                    </div>
                  </td>
                  <td class="table-cell text-slate-600 dark:text-slate-350">{{ surgery.instrumentador_nombre || 'No asignado' }}</td>
                  <td class="table-cell text-right">
                    <div class="inline-flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 px-2.5 py-0.5">
                      <span class="text-xs font-semibold text-slate-400">$</span>
                      <input 
                        type="number"
                        v-model.number="surgery.monto_a_pagar"
                        class="form-input-table-premium"
                        @focus="$event.target.select()"
                        :disabled="justPaidSurgeryIds.has(surgery.id)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Barra de Paginación -->
          <div v-if="filteredSurgeries.length > 0" class="p-3.5 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div class="font-medium text-center sm:text-left">
              Mostrando <span class="font-bold text-slate-900 dark:text-white">{{ paginationInfo.start }}</span> a <span class="font-bold text-slate-900 dark:text-white">{{ paginationInfo.end }}</span> de <span class="font-bold text-slate-900 dark:text-white">{{ paginationInfo.total }}</span> cirugías
            </div>

            <div class="flex items-center gap-1.5">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                ‹ Anterior
              </button>

              <span class="px-2.5 font-bold text-slate-800 dark:text-slate-200">
                Página {{ currentPage }} de {{ totalPages }}
              </span>

              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages || totalPages === 0"
                class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                Siguiente ›
              </button>
            </div>
          </div>

        </div>
      </div>

      <div class="lg:col-span-5 xl:col-span-4">
        <div class="sticky top-6">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-md p-5 sm:p-6 space-y-5 max-h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Resumen de Pago</h2>
              <span v-if="selectedSurgeryIds.length > 0" class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50">
                {{ selectedSurgeryIds.length }} seleccionada{{ selectedSurgeryIds.length === 1 ? '' : 's' }}
              </span>
            </div>
            
            <div v-if="selectedSurgeryIds.length === 0" class="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-5 py-12 text-center text-slate-500 dark:text-slate-400 transition-all">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">No hay cirugías seleccionadas</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">Seleccioná una o más cirugías del listado para generar una orden de pago en lote.</p>
            </div>
            
            <div v-else class="space-y-5">
              <!-- Desglose por instrumentador en mini-cards -->
              <div class="space-y-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                <div v-for="inst in paymentSummary.instrumentadores" :key="inst.dni" class="p-3.5 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all shadow-2xs">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{{ inst.nombre }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                        {{ inst.cirugias_count }} {{ inst.cirugias_count === 1 ? 'cirugía' : 'cirugías' }}
                      </span>
                    </div>
                  </div>
                  <span class="text-sm font-extrabold text-slate-900 dark:text-slate-50 shrink-0 font-mono">
                    {{ formatCurrency(inst.monto_total) }}
                  </span>
                </div>
              </div>

              <!-- Total General Consolidado Destacado -->
              <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4.5 shadow-md border border-slate-800 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">Total General del Lote</span>
                  <p class="text-xs text-slate-400 mt-0.5">{{ selectedSurgeryIds.length }} {{ selectedSurgeryIds.length === 1 ? 'cirugía seleccionada' : 'cirugías seleccionadas' }}</p>
                </div>
                <span class="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight font-mono">
                  {{ formatCurrency(paymentSummary.monto_total_general) }}
                </span>
              </div>

              <!-- Campos de Carga y Uploader -->
              <div class="space-y-3.5">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notas del Lote (Opcional)</label>
                  <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                    <textarea v-model="paymentNotes" placeholder="Notas adicionales sobre este lote..." class="w-full p-3 bg-transparent border-none text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-0 h-16 resize-none"></textarea>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-3">
                    <input 
                      type="checkbox" 
                      id="cargarSinComprobanteCheck" 
                      v-model="cargarSinComprobante" 
                      class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                    <label for="cargarSinComprobanteCheck" class="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      Cargar pago sin comprobante
                    </label>
                  </div>

                  <div v-if="cargarSinComprobante" class="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                    <span class="text-amber-500 shrink-0 text-base">ℹ️</span>
                    <span>Se registrará la orden de pago sin adjuntar archivo de comprobante de transferencia.</span>
                  </div>

                  <div v-else class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Comprobante de Transferencia (Foto o PDF)</label>
                    <FileUpload 
                      v-if="showFileUploader"
                      ref="fileUploader" 
                      :owner-id="Date.now().toString()" 
                      accepted-file-types="image/*,application/pdf,.pdf"
                    />
                  </div>
                </div>
              </div>

              <!-- Botón Confirmar Orden -->
              <div class="pt-2">
                <button 
                  @click="registrarPago" 
                  :disabled="isSubmitting || (!cargarSinComprobante && !fileUploader?.hasFiles)"
                  class="btn-primary-styled w-full"
                >
                  <span v-if="isSubmitting">Registrando Pago...</span>
                  <span v-else>Registrar Orden de Pago</span>
                </button>
                <p v-if="!cargarSinComprobante && !fileUploader?.hasFiles" class="text-center mt-2.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                  Adjuntá un comprobante o activá "Cargar pago sin comprobante"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <PostPagoModal 
      :show="isPostPagoModalVisible" 
      :payment-data="lastPaymentData"
      @close="handleClosePostPagoModal"
    />

    <!-- Modal de Regularización Exclusiva para Casos Antiguos sin Comprobante -->
    <ModalRegularizacionAntiguos
      :show="isRegularizacionModalVisible"
      :count="regularizacionSummary.count"
      :total-amount="regularizacionSummary.totalAmount"
      :is-submitting="isSubmittingRegularizacion"
      @close="isRegularizacionModalVisible = false"
      @confirm="handleConfirmRegularizacion"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import FileUpload from '../../components/uploader/FileUpload.vue';
import PostPagoModal from '../../components/PostPagoModal.vue';
import ModalRegularizacionAntiguos from '../../components/admin/ModalRegularizacionAntiguos.vue';

const { showSuccessToast, showErrorToast, showInfoToast, showLoadingToast, updateToast } = useToasts();

const isLoading = ref(true);
const error = ref(null);
const allPendingSurgeries = ref([]);
const selectedSurgeryIds = ref([]);
const paymentNotes = ref('');
const fileUploader = ref(null);
const isSubmitting = ref(false);
const isPostPagoModalVisible = ref(false);
const lastPaymentData = ref(null);
const showFileUploader = ref(true);
const cargarSinComprobante = ref(false);
const justPaidSurgeryIds = ref(new Set());
const selectedKpiPeriod = ref('current-month');
const activeKpiFilter = ref(null);

// Estado de Paginación
const currentPage = ref(1);
const pageSize = ref(15);
const pageSizeOptions = [10, 15, 25, 50, 100, 'all'];

// Estado de Regularización de Casos Antiguos
const isRegularizacionModalVisible = ref(false);
const isSubmittingRegularizacion = ref(false);

const kpiPeriodOptions = [
  { value: 'current-month', label: 'Mes actual' },
  { value: 'last-30-days', label: 'Últimos 30 días' },
  { value: 'previous-month', label: 'Mes anterior' },
  { value: 'all', label: 'Todos' },
  { value: 'custom', label: 'Personalizado' },
];

const filters = reactive({
  searchTerm: '',
  selectedInstrumentador: 'todos',
  period: 'current-month',
  startDate: '',
  endDate: '',
  minAmount: null,
  maxAmount: null,
});

const onPeriodFilterChange = () => {
  currentPage.value = 1;
  if (filters.period === 'custom') {
    showAdvancedFilters.value = true;
  } else {
    selectedKpiPeriod.value = filters.period;
  }
};

const hasActiveFilters = computed(() => {
  return Boolean(
    filters.searchTerm || 
    filters.selectedInstrumentador !== 'todos' || 
    filters.period !== 'current-month' || 
    filters.startDate || 
    filters.endDate || 
    filters.minAmount || 
    filters.maxAmount ||
    activeKpiFilter.value
  );
});

const clearFilters = () => {
  filters.searchTerm = '';
  filters.selectedInstrumentador = 'todos';
  filters.period = 'current-month';
  selectedKpiPeriod.value = 'current-month';
  activeKpiFilter.value = null;
  filters.startDate = '';
  filters.endDate = '';
  filters.minAmount = null;
  filters.maxAmount = null;
  currentPage.value = 1;
};

const getSurgeryDate = (surgery) => {
  if (!surgery?.fecha_cirugia) return null;
  const rawDate = String(surgery.fecha_cirugia);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? new Date(`${rawDate}T00:00:00`)
    : new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isCurrentMonthSurgery = (surgery) => {
  const surgeryDate = getSurgeryDate(surgery);
  if (!surgeryDate) return false;

  const today = new Date();
  return surgeryDate.getFullYear() === today.getFullYear() && surgeryDate.getMonth() === today.getMonth();
};

const isPreviousMonthSurgery = (surgery) => {
  const surgeryDate = getSurgeryDate(surgery);
  if (!surgeryDate) return false;

  const today = new Date();
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return surgeryDate.getFullYear() === previousMonth.getFullYear() && surgeryDate.getMonth() === previousMonth.getMonth();
};

const isLast30DaysSurgery = (surgery) => {
  const surgeryDate = getSurgeryDate(surgery);
  if (!surgeryDate) return false;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);
  startDate.setHours(0, 0, 0, 0);
  today.setHours(23, 59, 59, 999);

  return surgeryDate >= startDate && surgeryDate <= today;
};

const isInSelectedKpiPeriod = (surgery) => {
  if (selectedKpiPeriod.value === 'all') return true;
  if (selectedKpiPeriod.value === 'last-30-days') return isLast30DaysSurgery(surgery);
  if (selectedKpiPeriod.value === 'previous-month') return isPreviousMonthSurgery(surgery);
  return isCurrentMonthSurgery(surgery);
};

const getRealAmount = (surgery) => {
  const amount = Number(surgery?.monto_a_pagar);
  return Number.isFinite(amount) ? amount : null;
};

const hasAmountField = (surgery) => Object.prototype.hasOwnProperty.call(surgery || {}, 'monto_a_pagar');

const hasPositiveAmount = (surgery) => {
  const amount = getRealAmount(surgery);
  return amount !== null && amount > 0;
};

const hasMissingAmount = (surgery) => {
  if (!hasAmountField(surgery)) return false;
  return !hasPositiveAmount(surgery);
};

const getCompletedDate = (surgery) => {
  const raw = surgery?.fecha_completada || surgery?.created_at || surgery?.fecha_creacion || surgery?.updated_at;
  if (!raw) return 'No registrada';
  return formatDate(raw);
};

const instrumentadorOptions = computed(() => {
  if (!allPendingSurgeries.value) return [];
  const map = {};
  allPendingSurgeries.value.forEach(surgery => {
    if (surgery.instrumentador_dni) {
      if (!map[surgery.instrumentador_dni]) {
        map[surgery.instrumentador_dni] = {
          dni: surgery.instrumentador_dni,
          nombre: surgery.instrumentador_nombre || 'Sin nombre',
          count: 0
        };
      }
      map[surgery.instrumentador_dni].count++;
    }
  });
  return Object.values(map).sort((a, b) => a.nombre.localeCompare(b.nombre));
});

const activeFilterChips = computed(() => {
  const chips = [];
  if (filters.searchTerm) {
    chips.push({ key: 'searchTerm', label: `Texto: "${filters.searchTerm}"` });
  }
  if (filters.selectedInstrumentador !== 'todos') {
    const inst = instrumentadorOptions.value.find(i => i.dni === filters.selectedInstrumentador);
    chips.push({ key: 'selectedInstrumentador', label: `Prof: ${inst ? inst.nombre : filters.selectedInstrumentador}` });
  }
  if (filters.period !== 'current-month') {
    const periodOpt = kpiPeriodOptions.find(o => o.value === filters.period);
    chips.push({ key: 'period', label: `Período: ${periodOpt ? periodOpt.label : filters.period}` });
  }
  if (filters.startDate) {
    chips.push({ key: 'startDate', label: `Desde: ${filters.startDate}` });
  }
  if (filters.endDate) {
    chips.push({ key: 'endDate', label: `Hasta: ${filters.endDate}` });
  }
  if (filters.minAmount) {
    chips.push({ key: 'minAmount', label: `Mín: $${filters.minAmount}` });
  }
  if (filters.maxAmount) {
    chips.push({ key: 'maxAmount', label: `Máx: $${filters.maxAmount}` });
  }
  return chips;
});

const removeFilterChip = (key) => {
  if (key === 'searchTerm') filters.searchTerm = '';
  if (key === 'selectedInstrumentador') filters.selectedInstrumentador = 'todos';
  if (key === 'period') {
    filters.period = 'current-month';
    selectedKpiPeriod.value = 'current-month';
  }
  if (key === 'startDate') filters.startDate = '';
  if (key === 'endDate') filters.endDate = '';
  if (key === 'minAmount') filters.minAmount = null;
  if (key === 'maxAmount') filters.maxAmount = null;
};

const kpiPeriodSurgeries = computed(() => (
  allPendingSurgeries.value.filter(surgery => !justPaidSurgeryIds.value.has(surgery.id) && isInSelectedKpiPeriod(surgery))
));

const currentMonthAmount = computed(() => {
  const surgeries = kpiPeriodSurgeries.value;
  if (surgeries.length === 0) {
    return {
      status: 'empty',
      value: 'Sin pendientes',
      subtitle: '',
    };
  }

  if (!surgeries.some(hasAmountField)) {
    return {
      status: 'unavailable',
      value: 'Dato pendiente',
      subtitle: '',
    };
  }

  const amounts = surgeries.map(getRealAmount);
  const positiveAmounts = amounts.filter(amount => amount > 0);

  if (positiveAmounts.length === 0) {
    return {
      status: 'missing',
      value: 'Sin montos cargados',
      subtitle: 'Click para ver pendientes sin importe',
    };
  }

  return {
    status: 'ready',
    value: formatCurrency(positiveAmounts.reduce((sum, amount) => sum + amount, 0)),
    subtitle: '',
  };
});

const kpiPeriodInstrumentadoresCount = computed(() => {
  const instrumentadores = new Set();

  kpiPeriodSurgeries.value.forEach(surgery => {
    const key = surgery.instrumentador_dni || surgery.instrumentador_nombre;
    if (key) instrumentadores.add(key);
  });

  return instrumentadores.size;
});

const selectedKpiPeriodLabel = computed(() => (
  kpiPeriodOptions.find(option => option.value === selectedKpiPeriod.value)?.label || 'Mes actual'
));

const pendingKpiLabel = computed(() => {
  if (selectedKpiPeriod.value === 'last-30-days') return 'Pendientes últimos 30 días';
  if (selectedKpiPeriod.value === 'previous-month') return 'Pendientes mes anterior';
  if (selectedKpiPeriod.value === 'all') return 'Pendientes totales';
  return 'Pendientes del mes';
});

const amountKpiFilterMode = computed(() => (
  currentMonthAmount.value.status === 'ready' ? 'with-amount' : 'missing-amount'
));

const activeKpiLabel = computed(() => {
  const active = paymentKpis.value.find(stat => stat.filter === activeKpiFilter.value);
  return active?.label || '';
});

const paymentKpis = computed(() => [
  {
    filter: 'pending',
    label: pendingKpiLabel.value,
    value: kpiPeriodSurgeries.value.length,
    subtitle: selectedKpiPeriodLabel.value,
    isActive: activeKpiFilter.value === 'pending',
    iconPath: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    cardClass: 'border-amber-200 bg-white dark:border-amber-900/50 dark:bg-slate-800',
    activeClass: 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-500 dark:bg-amber-950/30 dark:ring-amber-900/70',
    iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    filter: 'amount',
    label: 'Monto pendiente',
    value: currentMonthAmount.value.value,
    subtitle: currentMonthAmount.value.subtitle || selectedKpiPeriodLabel.value,
    isActive: activeKpiFilter.value === 'amount',
    iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6',
    cardClass: currentMonthAmount.value.status === 'missing'
      ? 'border-amber-200 bg-white dark:border-amber-900/50 dark:bg-slate-800'
      : 'border-emerald-200 bg-white dark:border-emerald-900/50 dark:bg-slate-800',
    activeClass: currentMonthAmount.value.status === 'missing'
      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-500 dark:bg-amber-950/30 dark:ring-amber-900/70'
      : 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/30 dark:ring-emerald-900/70',
    iconClass: currentMonthAmount.value.status === 'missing'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    filter: 'instrumentadores',
    label: 'Instrumentadores',
    value: kpiPeriodInstrumentadoresCount.value,
    subtitle: 'Con pendientes',
    isActive: activeKpiFilter.value === 'instrumentadores',
    iconPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    cardClass: 'border-violet-200 bg-white dark:border-violet-900/50 dark:bg-slate-800',
    activeClass: 'border-violet-400 bg-violet-50 ring-2 ring-violet-200 dark:border-violet-500 dark:bg-violet-950/30 dark:ring-violet-900/70',
    iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  {
    filter: 'selected',
    label: 'Seleccionadas',
    value: selectedSurgeryIds.value.length,
    subtitle: 'Para lote actual',
    isActive: activeKpiFilter.value === 'selected',
    iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    cardClass: 'border-blue-200 bg-white dark:border-blue-900/50 dark:bg-slate-800',
    activeClass: 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 dark:border-blue-500 dark:bg-blue-950/30 dark:ring-blue-900/70',
    iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
]);

const applyKpiFilter = (filter) => {
  if (filter === 'selected' && selectedSurgeryIds.value.length === 0) {
    showInfoToast('No hay cirugías seleccionadas.');
    return;
  }

  activeKpiFilter.value = activeKpiFilter.value === filter ? null : filter;
};

const clearKpiFilter = () => {
  activeKpiFilter.value = null;
};

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('get_todas_cirugias_pendientes');
    if (rpcError) throw rpcError;
    allPendingSurgeries.value = data || [];
  } catch (err) {
    error.value = "No se pudo cargar la lista de cirugías pendientes.";
    showErrorToast(err, error.value);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const filteredSurgeries = computed(() => {
  let surgeries = [...allPendingSurgeries.value];

  if (filters.searchTerm) {
    const lowerCaseSearch = filters.searchTerm.toLowerCase();
    surgeries = surgeries.filter(surgery => {
      const pacienteMatch = surgery.paciente ? surgery.paciente.toLowerCase().includes(lowerCaseSearch) : false;
      const instrumentadorMatch = surgery.instrumentador_nombre ? surgery.instrumentador_nombre.toLowerCase().includes(lowerCaseSearch) : false;
      return pacienteMatch || instrumentadorMatch;
    });
  }

  if (filters.selectedInstrumentador !== 'todos') {
    surgeries = surgeries.filter(surgery => surgery.instrumentador_dni === filters.selectedInstrumentador);
  }

  // Filtrado por Período
  if (filters.period === 'current-month') {
    surgeries = surgeries.filter(isCurrentMonthSurgery);
  } else if (filters.period === 'previous-month') {
    surgeries = surgeries.filter(isPreviousMonthSurgery);
  } else if (filters.period === 'last-30-days') {
    surgeries = surgeries.filter(isLast30DaysSurgery);
  } else if (filters.period === 'custom') {
    if (filters.startDate) {
      surgeries = surgeries.filter(surgery => surgery.fecha_cirugia >= filters.startDate);
    }
    if (filters.endDate) {
      surgeries = surgeries.filter(surgery => surgery.fecha_cirugia <= filters.endDate);
    }
  }

  if (filters.minAmount !== null && filters.minAmount > 0) {
    surgeries = surgeries.filter(surgery => surgery.monto_a_pagar >= filters.minAmount);
  }

  if (filters.maxAmount !== null && filters.maxAmount > 0) {
    surgeries = surgeries.filter(surgery => surgery.monto_a_pagar <= filters.maxAmount);
  }

  if (activeKpiFilter.value === 'pending') {
    surgeries = surgeries.filter(surgery => !justPaidSurgeryIds.value.has(surgery.id) && isInSelectedKpiPeriod(surgery));
  }

  if (activeKpiFilter.value === 'amount') {
    surgeries = surgeries.filter(surgery => {
      if (justPaidSurgeryIds.value.has(surgery.id) || !isInSelectedKpiPeriod(surgery)) return false;
      return amountKpiFilterMode.value === 'with-amount' ? hasPositiveAmount(surgery) : hasMissingAmount(surgery);
    });
  }

  if (activeKpiFilter.value === 'instrumentadores') {
    surgeries = surgeries
      .filter(surgery => !justPaidSurgeryIds.value.has(surgery.id) && isInSelectedKpiPeriod(surgery) && (surgery.instrumentador_dni || surgery.instrumentador_nombre))
      .sort((a, b) => (a.instrumentador_nombre || '').localeCompare(b.instrumentador_nombre || ''));
  }

  if (activeKpiFilter.value === 'selected') {
    surgeries = surgeries.filter(surgery => selectedSurgeryIds.value.includes(surgery.id));
  }

  return surgeries;
});

// Paginación computada
const paginatedSurgeries = computed(() => {
  if (pageSize.value === 'all') return filteredSurgeries.value;
  const limit = Number(pageSize.value) || 15;
  const start = (currentPage.value - 1) * limit;
  return filteredSurgeries.value.slice(start, start + limit);
});

const totalPages = computed(() => {
  if (pageSize.value === 'all') return 1;
  const limit = Number(pageSize.value) || 15;
  return Math.ceil(filteredSurgeries.value.length / limit) || 1;
});

const paginationInfo = computed(() => {
  const total = filteredSurgeries.value.length;
  if (total === 0) return { start: 0, end: 0, total: 0 };
  if (pageSize.value === 'all') return { start: 1, end: total, total };
  const limit = Number(pageSize.value) || 15;
  const start = (currentPage.value - 1) * limit + 1;
  const end = Math.min(currentPage.value * limit, total);
  return { start, end, total };
});

// Regularización de Casos Antiguos sin Comprobante
const regularizacionSummary = computed(() => {
  const selected = allPendingSurgeries.value.filter(s => selectedSurgeryIds.value.includes(s.id));
  const count = selected.length;
  const totalAmount = selected.reduce((sum, s) => sum + (Number(s.monto_a_pagar) || 0), 0);
  return { count, totalAmount };
});

const openRegularizacionModal = () => {
  if (selectedSurgeryIds.value.length === 0) {
    showInfoToast("Por favor seleccioná al menos una cirugía en el listado para realizar la regularización.");
    return;
  }
  isRegularizacionModalVisible.value = true;
};

const handleConfirmRegularizacion = async ({ notes }) => {
  if (isSubmittingRegularizacion.value) return;
  isSubmittingRegularizacion.value = true;

  const toastId = showLoadingToast("Procesando regularización de cirugías sin comprobante...");

  try {
    const ordenDePago = {
      monto_total_general: paymentSummary.value.monto_total_general,
      comprobante_object_key: null,
      notas: `[REGULARIZACIÓN HISTÓRICA] ${notes || 'Cirugías antiguas regularizadas sin comprobante de transferencia'}`,
      pagos: paymentSummary.value.instrumentadores
        .filter(inst => inst.dni !== 'sin-asignar')
        .map(inst => ({
          instrumentador_dni: inst.dni,
          monto_total_instrumentador: inst.monto_total,
          cirugias: inst.cirugias.map(c => ({ id: c.id, monto: c.monto }))
      }))
    };

    if (ordenDePago.pagos.length === 0) {
      throw new Error("No hay pagos válidos para registrar.");
    }

    const { error: rpcError } = await supabase.rpc('registrar_orden_de_pago', { p_orden: ordenDePago });
    if (rpcError) throw rpcError;

    updateToast(toastId, "¡Cirugías regularizadas y saldadas con éxito!", 'success');

    selectedSurgeryIds.value.forEach(id => justPaidSurgeryIds.value.add(id));
    selectedSurgeryIds.value = [];
    isRegularizacionModalVisible.value = false;
  } catch (err) {
    console.error("Error al regularizar:", err);
    updateToast(toastId, `Error: ${err.message}`, 'error');
  } finally {
    isSubmittingRegularizacion.value = false;
  }
};

const areAllSelected = computed(() => 
  filteredSurgeries.value.length > 0 && 
  filteredSurgeries.value.every(s => selectedSurgeryIds.value.includes(s.id) || justPaidSurgeryIds.value.has(s.id))
);

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    const idsToSelect = filteredSurgeries.value
      .filter(s => !justPaidSurgeryIds.value.has(s.id))
      .map(s => s.id);
    selectedSurgeryIds.value = [...new Set([...selectedSurgeryIds.value, ...idsToSelect])];
  } else {
    const idsToUnselect = filteredSurgeries.value.map(s => s.id);
    selectedSurgeryIds.value = selectedSurgeryIds.value.filter(id => !idsToUnselect.includes(id));
  }
};

const paymentSummary = computed(() => {
  const summary = {
    instrumentadores: {},
    monto_total_general: 0,
  };
  const selected = allPendingSurgeries.value.filter(s => selectedSurgeryIds.value.includes(s.id));
  selected.forEach(surgery => {
    const dni = surgery.instrumentador_dni || 'sin-asignar';
    const nombre = surgery.instrumentador_nombre || 'No Asignado';
    const token = surgery.activity_token;

    if (!summary.instrumentadores[dni]) {
      summary.instrumentadores[dni] = {
        dni: dni,
        nombre: nombre,
        monto_total: 0,
        cirugias: [],
        cirugias_count: 0,
        activity_token: token,
      };
    }
    const inst = summary.instrumentadores[dni];
    const monto = Number(surgery.monto_a_pagar) || 0;
    inst.monto_total += monto;
    inst.cirugias.push({ id: surgery.id, monto: monto });
    inst.cirugias_count++;
    summary.monto_total_general += monto;
  });
  summary.instrumentadores = Object.values(summary.instrumentadores);
  return summary;
});

const registrarPago = async () => {
  if (isSubmitting.value) return;
  if (!cargarSinComprobante.value && !fileUploader.value?.hasFiles) return;

  isSubmitting.value = true;
  let objectKey = null;

  const toastId = showLoadingToast(
    cargarSinComprobante.value 
      ? "Registrando orden de pago sin comprobante..." 
      : "Subiendo comprobante..."
  );

  try {
    if (!cargarSinComprobante.value) {
      const uploadResult = await fileUploader.value.startUpload('comprobantes-pago');
      
      if (!uploadResult || !Array.isArray(uploadResult) || uploadResult.length === 0 || !uploadResult[0].object_key) {
        console.error('[DEBUG] Estructura de uploadResult inesperada:', uploadResult);
        throw new Error("La subida del archivo no devolvió la clave del objeto esperada.");
      }
      
      objectKey = uploadResult[0].object_key;
      updateToast(toastId, "Comprobante subido. Registrando orden de pago...", 'info');
    }

    const ordenDePago = {
      monto_total_general: paymentSummary.value.monto_total_general,
      comprobante_object_key: objectKey,
      notas: paymentNotes.value,
      pagos: paymentSummary.value.instrumentadores
        .filter(inst => inst.dni !== 'sin-asignar')
        .map(inst => ({
          instrumentador_dni: inst.dni,
          monto_total_instrumentador: inst.monto_total,
          cirugias: inst.cirugias.map(c => ({ id: c.id, monto: c.monto }))
      }))
    };

    if (ordenDePago.pagos.length === 0) {
      throw new Error("No hay pagos válidos para registrar (verifique asignación de instrumentadores).");
    }

    const { error: rpcError } = await supabase.rpc('registrar_orden_de_pago', { p_orden: ordenDePago });
    if (rpcError) throw rpcError;

    updateToast(toastId, "¡Orden de pago registrada con éxito!", 'success');
    
    lastPaymentData.value = JSON.parse(JSON.stringify(paymentSummary.value));
    
    selectedSurgeryIds.value.forEach(id => justPaidSurgeryIds.value.add(id));

    selectedSurgeryIds.value = [];
    paymentNotes.value = '';
    cargarSinComprobante.value = false;
    
    showFileUploader.value = false;
    await nextTick();
    showFileUploader.value = true;
    
    isPostPagoModalVisible.value = true;
    
  } catch (err) {
    console.error("Error al registrar el pago:", err);
    updateToast(toastId, `Error: ${err.message}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleClosePostPagoModal = () => {
  isPostPagoModalVisible.value = false;
  justPaidSurgeryIds.value.clear();
  fetchData();
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
</script>

<style scoped>
.form-input-premium-styled {
  @apply w-full px-4 py-3 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-0;
}

.form-input-select-styled {
  @apply w-full px-4 py-3 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-0 cursor-pointer;
}

.table-header {
  @apply px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200;
}

.checkbox-lg-styled {
  @apply h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-150 cursor-pointer;
}

.btn-clear {
  @apply bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-toggle-filters {
  @apply p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 shadow-sm;
  @apply hover:bg-slate-50 dark:hover:bg-slate-800;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center;
}

.form-input-table-premium {
  @apply w-24 text-right bg-transparent border-none px-1 py-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0;
}

.btn-primary-styled {
  @apply w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none;
}

/* Animaciones para expansión de filtros */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 150px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  border-top-color: transparent !important;
  overflow: hidden;
}
</style>
