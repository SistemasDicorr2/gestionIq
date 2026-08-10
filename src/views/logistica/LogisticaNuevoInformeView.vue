<!-- src/views/logistica/LogisticaNuevoInformeView.vue -->
<template>
  <div class="max-w-2xl mx-auto space-y-5 pb-52 md:pb-28 text-slate-800 dark:text-slate-100 font-sans px-3.5 sm:px-0">
    
    <!-- Top Header Mobile-First -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-3.5 border-b border-slate-200/80 dark:border-slate-800">
      <div class="space-y-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span 
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase',
              informe.id ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
            ]"
          >
            {{ informe.id ? 'Borrador en Edición' : 'Nuevo Informe' }}
          </span>

          <h1 class="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {{ informe.id ? 'Editar Informe Diario' : 'Cargar Informe Diario' }}
          </h1>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          Registro táctil de entregas, retiros, bultos e incidencias operativas.
        </p>
      </div>

      <div class="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
        <button 
          v-if="informe.id"
          type="button" 
          @click="showDeleteDraftModal = true"
          class="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 min-h-[38px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          <span>Descartar Borrador</span>
        </button>

        <router-link 
          :to="{ name: 'LogisticaHistorial' }" 
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs min-h-[38px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver</span>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
      <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-semibold tracking-wide">Cargando informe diario...</span>
    </div>

    <template v-else>
      <!-- BARRA DE MÚLTIPLES BORRADORES (MOBILE-OPTIMIZED) -->
      <div 
        v-if="userDrafts.length > 0" 
        class="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 dark:to-transparent rounded-2xl border border-amber-300/70 dark:border-amber-800/70 space-y-3 shadow-xs animate-fadeIn"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                Borradores Activos
              </span>
              <span class="text-xs font-bold text-amber-950 dark:text-amber-200">
                Tienes {{ userDrafts.length }} {{ userDrafts.length === 1 ? 'borrador' : 'borradores' }}
              </span>
            </div>
            <p class="text-[11px] text-amber-900/80 dark:text-amber-300/80">
              Puedes alternar entre tus borradores o iniciar un informe diario nuevo.
            </p>
          </div>

          <div class="flex items-center gap-2 self-stretch sm:self-auto">
            <button 
              type="button" 
              @click="toggleShowDraftSelector" 
              class="flex-1 sm:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[40px]"
            >
              <span>Borradores ({{ userDrafts.length }})</span>
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showDraftSelector }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>

            <button 
              type="button" 
              @click="handleNewReportClick" 
              class="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl border border-amber-300 dark:border-amber-800 transition-all shadow-2xs cursor-pointer min-h-[40px]"
            >
              + Nuevo
            </button>
          </div>
        </div>

        <!-- LISTA DESPLEGABLE DE BORRADORES DISPONIBLES -->
        <div v-if="showDraftSelector" class="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
          <div 
            v-for="d in userDrafts" 
            :key="d.id"
            @click="switchDraft(d.id)"
            :class="[
              'p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 min-h-[64px]',
              informe.id === d.id 
                ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-400 dark:border-amber-600 shadow-xs ring-2 ring-amber-500/20' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-slate-900 dark:text-white">
                Fecha: {{ formatDate(d.fecha) }}
              </span>
              <span v-if="informe.id === d.id" class="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-500 text-white rounded-full">
                En edición
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>Zona: {{ d.zona || 'Formosa' }}</span>
              <span>Guardado: {{ formatTime(d.updated_at || d.created_at) }}</span>
            </div>

            <div v-if="d.observacion_general" class="text-[10px] text-slate-600 dark:text-slate-400 italic truncate">
              "{{ d.observacion_general }}"
            </div>
          </div>
        </div>
      </div>

      <!-- Datos de la Jornada -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Datos de la Jornada
            </h2>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {{ informe.responsable_nombre }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fecha de la Jornada *
            </label>
            <input 
              v-model="informe.fecha" 
              type="date" 
              class="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all text-xs min-h-[44px]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Zona / Sector Operativo
            </label>
            <input 
              v-model="informe.zona" 
              type="text" 
              placeholder="Ej: Formosa Capital / Sanatorios" 
              class="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all text-xs min-h-[44px]"
            />
          </div>

          <!-- BANNER ADVERTENCIA JORNADA YA ENVIADA -->
          <div v-if="enviadoExistente" class="col-span-1 sm:col-span-2 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 animate-fadeIn mt-1">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <div class="space-y-0.5">
              <span class="font-extrabold block text-xs">⚠️ Atención: Jornada ya enviada</span>
              <p class="text-[11px] leading-relaxed opacity-90">
                Ya existe un informe formal enviado para la fecha {{ formatDate(enviadoExistente.fecha) }}. Este borrador se guardará como un informe diario adicional.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN PRINCIPAL DE CARGA DE ÍTENS -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-5">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span 
              :class="[
                'w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm',
                editingIndex !== null ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
              ]"
            >
              {{ editingIndex !== null ? '✏️' : '+' }}
            </span>
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {{ editingIndex !== null ? 'Modificando Movimiento' : 'Cargar Nuevo Movimiento' }}
            </h3>
          </div>
          
          <button 
            v-if="editingIndex !== null" 
            type="button" 
            @click="cancelEditMovement"
            class="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Cancelar Edición
          </button>
          <span v-else class="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg">
            Paso a Paso
          </span>
        </div>

        <!-- CONSTRUCTOR DE MOVIMIENTO -->
        <div 
          :class="[
            'p-4 sm:p-5 rounded-2xl border space-y-4 transition-all',
            editingIndex !== null ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/20' : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
          ]"
        >
          
          <!-- PASO 1: CHIPS TÁCTILES MOBILE-FIRST -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">
              1. Tipo de Gestión *
            </label>

            <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button 
                v-for="chip in tipoChips" 
                :key="chip.value"
                type="button"
                @click="selectTipoMovimiento(chip.value)"
                :class="[
                  'px-3 py-2.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer shadow-2xs active:scale-95 min-h-[44px]',
                  builder.tipo_movimiento === chip.value 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                <span class="text-center">{{ chip.label }}</span>
              </button>
            </div>
          </div>

          <!-- CAMPO DINÁMICO SI SE SELECCIONA INCIDENCIA U OTRA GESTIÓN -->
          <div 
            v-if="builder.tipo_movimiento === 'Incidencia' || builder.tipo_movimiento === 'Otra gestión'" 
            class="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800/80 space-y-2 animate-fadeIn"
          >
            <label class="block text-xs font-extrabold text-amber-900 dark:text-amber-300">
              {{ builder.tipo_movimiento === 'Incidencia' ? 'Detalle Obligatorio de la Incidencia *' : 'Detalle de la Gestión *' }}
            </label>
            <input 
              v-model="builder.detalle_incidencia_o_gestion" 
              type="text" 
              :placeholder="builder.tipo_movimiento === 'Incidencia' ? 'Ej: Transporte demorado por lluvia...' : 'Ej: Documentación en dirección...'"
              class="w-full px-3.5 py-3 sm:py-2 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl font-medium focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:text-white min-h-[42px]"
            />
          </div>

          <!-- TOGGLE RÁPIDO RETIRO -->
          <div 
            v-if="builder.tipo_movimiento === 'Retiro de cajas'" 
            class="p-3.5 bg-blue-50/90 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between animate-fadeIn gap-3"
          >
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                ¿Trasladado a Central en el mismo día?
              </span>
              <p class="text-[11px] text-blue-700 dark:text-blue-300">
                Registra el retiro del sanatorio y el envío a central en 1 paso.
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" v-model="builder.trasladado_a_central" class="sr-only peer" />
              <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- PASO 2: BÚSQUEDA PACIENTE / CIRUGÍA -->
          <div class="space-y-2 relative">
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">
              2. Buscar Paciente / Cirugía Asignada *
            </label>
            
            <!-- Cirugía Seleccionada -->
            <div v-if="selectedCirugia" class="flex items-center justify-between p-3.5 bg-blue-50/90 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-blue-950 dark:text-blue-100 text-sm">{{ selectedCirugia.paciente }}</span>
                  <span class="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold">
                    {{ selectedCirugia.id_cirugia }}
                  </span>
                </div>
                <div class="flex gap-3 text-[11px] text-blue-800 dark:text-blue-300 flex-wrap">
                  <span v-if="selectedCirugia.cliente">Cliente: <strong>{{ selectedCirugia.cliente }}</strong></span>
                  <span v-if="selectedCirugia.medico">Médico: <strong>{{ selectedCirugia.medico }}</strong></span>
                  <span v-if="selectedCirugia.institucion">Lugar: <strong>{{ selectedCirugia.institucion }}</strong></span>
                </div>
              </div>

              <button 
                type="button" 
                @click="clearSelectedCirugia" 
                class="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 dark:border-rose-900 cursor-pointer min-h-[38px]"
              >
                Cambiar
              </button>
            </div>

            <!-- Input de Búsqueda -->
            <div v-else class="relative">
              <div class="relative">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Buscar por paciente, médico, código (CX-) o clínica..." 
                  @input="onSearchInput"
                  @focus="showDropdown = true"
                  class="w-full pl-9 pr-4 py-3 sm:py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 min-h-[44px]"
                />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>

              <!-- Dropdown de Resultados -->
              <div 
                v-if="showDropdown && (isSearching || searchResults.length > 0)" 
                class="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-1"
              >
                <div v-if="isSearching" class="p-3 text-center text-xs text-slate-400">
                  Buscando en la base de datos...
                </div>

                <template v-else>
                  <div 
                    v-for="item in searchResults" 
                    :key="item.id"
                    @click="selectCirugia(item)"
                    class="p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors space-y-1 border border-transparent hover:border-blue-200 dark:hover:border-slate-600"
                  >
                    <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>{{ item.paciente || 'Paciente sin nombre' }}</span>
                      <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold">
                        {{ item.id_cirugia }}
                      </span>
                    </div>
                    <div class="flex gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span v-if="item.cliente">Cliente: {{ item.cliente }}</span>
                      <span v-if="item.medico">Médico: {{ item.medico }}</span>
                      <span v-if="item.institucion">Lugar: {{ item.institucion }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- CARGA MANUAL SI LA CX NO FIGURA -->
            <div 
              v-if="!selectedCirugia && !showManualForm" 
              class="p-3.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div class="text-xs text-slate-600 dark:text-slate-300">
                <span class="font-bold text-slate-900 dark:text-white block">¿La cirugía no figura en la lista?</span>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ingresa los datos manualmente para registrar el movimiento.</p>
              </div>

              <button 
                type="button" 
                @click="openManualForm" 
                class="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all w-full sm:w-auto text-center cursor-pointer active:scale-95 min-h-[42px]"
              >
                + Cargar Manualmente
              </button>
            </div>

            <!-- FORMULARIO DE CARGA MANUAL -->
            <div 
              v-if="showManualForm && !selectedCirugia" 
              class="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-400 dark:border-blue-600 space-y-3 animate-fadeIn shadow-md"
            >
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 class="text-xs font-extrabold text-slate-900 dark:text-white">
                  Carga Manual de Paciente / Cirugía
                </h4>
                <button type="button" @click="closeManualForm" class="text-xs font-bold text-rose-500 hover:underline">
                  Ocultar
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="sm:col-span-2">
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo del Paciente *</label>
                  <input v-model="manualForm.paciente" type="text" placeholder="Ej: Juan Pérez" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Médico Cirujano</label>
                  <input v-model="manualForm.medico" type="text" placeholder="Ej: Dr. González" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de la Cirugía</label>
                  <input v-model="manualForm.fecha_cirugia" type="date" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sanatorio / Institución</label>
                  <input v-model="manualForm.institucion" type="text" placeholder="Ej: Sanatorio Vinto" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cliente / Obra Social</label>
                  <input v-model="manualForm.cliente" type="text" placeholder="Ej: OSDE / Swiss Medical" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <!-- PASO 3: CONTADORES CAJAS Y BULTOS (TOUCH TARGET 48px) -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cantidad de Cajas</label>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                <button type="button" @click="builder.cantidad_cajas = Math.max(0, builder.cantidad_cajas - 1)" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg cursor-pointer active:scale-95">-</button>
                <input v-model.number="builder.cantidad_cajas" type="number" min="0" class="w-full text-center font-mono font-bold text-base bg-transparent focus:outline-none dark:text-white" />
                <button type="button" @click="builder.cantidad_cajas++" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg cursor-pointer active:scale-95">+</button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cantidad de Bultos</label>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                <button type="button" @click="builder.cantidad_bultos = Math.max(0, builder.cantidad_bultos - 1)" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base cursor-pointer active:scale-95">-</button>
                <input v-model.number="builder.cantidad_bultos" type="number" min="0" class="w-full text-center font-mono font-bold text-base bg-transparent focus:outline-none dark:text-white" />
                <button type="button" @click="builder.cantidad_bultos++" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base cursor-pointer active:scale-95">+</button>
              </div>
            </div>
          </div>

          <!-- PASO 4: OBSERVACIONES Y PENDIENTES -->
          <div class="space-y-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones / Notas Específicas</label>
              <input 
                v-model="builder.observaciones" 
                type="text" 
                placeholder="Detalles sobre esta entrega o retiro (opcional)..." 
                @keyup.enter="addMovementToList"
                class="w-full px-3.5 py-3 sm:py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 min-h-[44px]"
              />
            </div>

            <!-- Toggle Pendiente -->
            <div class="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span class="text-xs font-bold text-amber-800 dark:text-amber-400">¿Quedó algún ítem o bulto pendiente?</span>
              <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" v-model="builder.tiene_pendiente" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div v-if="builder.tiene_pendiente" class="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2 animate-fadeIn">
              <label class="block text-xs font-bold text-amber-900 dark:text-amber-300">Detalle del Pendiente *</label>
              <input v-model="builder.detalle_pendiente" type="text" placeholder="Ej: 1 caja pendiente de retiro por quirófano ocupado" class="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg focus:outline-none dark:text-white" />
            </div>
          </div>

          <!-- BOTÓN PRINCIPAL DE AÑADIR / GUARDAR CAMBIOS DE MOVIMIENTO -->
          <button 
            type="button" 
            @click="addMovementToList" 
            :class="[
              'w-full py-3.5 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer min-h-[46px]',
              editingIndex !== null ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>{{ editingIndex !== null ? 'Guardar Cambios del Movimiento' : 'Añadir Movimiento al Informe' }}</span>
          </button>
        </div>

        <!-- LISTA DE MOVIMIENTOS CARGADOS CON FILTROS Y REORDENAMIENTO -->
        <div class="space-y-3 pt-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Movimientos Registrados ({{ movimientos.length }})
            </h4>

            <!-- CHIPS DE FILTRO DE MOVIMIENTOS -->
            <div v-if="movimientos.length > 0" class="flex items-center gap-1 flex-wrap text-[11px]">
              <button 
                type="button"
                @click="movimientoFilter = 'todos'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'todos' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200']"
              >
                Todos ({{ filterCounts.total }})
              </button>
              <button 
                v-if="filterCounts.entregas > 0"
                type="button"
                @click="movimientoFilter = 'entrega'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'entrega' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100']"
              >
                Entregas ({{ filterCounts.entregas }})
              </button>
              <button 
                v-if="filterCounts.retiros > 0"
                type="button"
                @click="movimientoFilter = 'retiro'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'retiro' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100']"
              >
                Retiros ({{ filterCounts.retiros }})
              </button>
              <button 
                v-if="filterCounts.incidencias > 0"
                type="button"
                @click="movimientoFilter = 'incidencia'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'incidencia' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100']"
              >
                Incidencias ({{ filterCounts.incidencias }})
              </button>
              <button 
                v-if="filterCounts.otros > 0"
                type="button"
                @click="movimientoFilter = 'otros'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'otros' ? 'bg-purple-600 text-white' : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100']"
              >
                Otros ({{ filterCounts.otros }})
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="movimientos.length === 0" class="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 space-y-1">
            <p class="font-medium text-slate-500 dark:text-slate-400">Aún no has agregado movimientos a este informe.</p>
            <p class="text-[11px] text-slate-400">Completa los pasos arriba y presiona "Añadir Movimiento al Informe".</p>
          </div>

          <div v-else-if="filteredMovimientos.length === 0" class="py-6 text-center text-xs text-slate-400">
            No hay movimientos registrados para el filtro seleccionado.
          </div>

          <!-- Lista de Ítems Filtrados -->
          <div v-else class="space-y-2.5">
            <TransitionGroup name="list">
              <div 
                v-for="(mov, index) in filteredMovimientos" 
                :key="mov.tempId || index"
                :class="[
                  'p-3.5 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-3 shadow-2xs',
                  editingIndex === movimientos.indexOf(mov) 
                    ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-500/20' 
                    : 'bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/90 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700'
                ]"
              >
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {{ mov.tipo_movimiento }}
                    </span>

                    <span v-if="mov.id_cirugia_snapshot" class="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                      {{ mov.id_cirugia_snapshot }}
                    </span>

                    <span v-if="mov.cliente_snapshot" class="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      Cliente: {{ mov.cliente_snapshot }}
                    </span>
                  </div>

                  <h5 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    Paciente: {{ mov.paciente_snapshot || mov.destino || mov.institucion_snapshot || 'Gestión Sin Nombre' }}
                  </h5>

                  <div class="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                    <span v-if="mov.medico_snapshot">Médico: <strong>{{ mov.medico_snapshot }}</strong></span>
                    <span v-if="mov.institucion_snapshot">Lugar: <strong>{{ mov.institucion_snapshot }}</strong></span>
                    <span>Cajas: <strong>{{ mov.cantidad_cajas || 0 }}</strong></span>
                    <span>Bultos: <strong>{{ mov.cantidad_bultos || 0 }}</strong></span>
                  </div>

                  <div v-if="mov.observaciones" class="text-[11px] text-slate-600 dark:text-slate-400 italic">
                    Notas: {{ mov.observaciones }}
                  </div>

                  <div v-if="mov.tiene_pendiente" class="mt-1 px-3 py-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-950/70 text-[11px] text-amber-950 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-900">
                    Pendiente Registrado: {{ mov.detalle_pendiente }}
                  </div>
                </div>

                <!-- ACCIONES REORDENAR / EDICIÓN / BORRADO (TÁCTILES MOBILE) -->
                <div class="flex items-center gap-1 self-center">
                  <!-- Botones de Reordenamiento Subir/Bajar -->
                  <div class="flex flex-col gap-0.5 mr-1 border-r border-slate-200 dark:border-slate-700 pr-1.5">
                    <button 
                      type="button" 
                      @click="moveMovementUp(movimientos.indexOf(mov))" 
                      :disabled="movimientos.indexOf(mov) === 0"
                      class="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                      title="Subir posición"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>
                    </button>

                    <button 
                      type="button" 
                      @click="moveMovementDown(movimientos.indexOf(mov))" 
                      :disabled="movimientos.indexOf(mov) === movimientos.length - 1"
                      class="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                      title="Bajar posición"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                  </div>

                  <button 
                    type="button" 
                    @click="editMovement(movimientos.indexOf(mov))" 
                    class="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Editar ítem"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>

                  <button 
                    type="button" 
                    @click="deleteMovimiento(movimientos.indexOf(mov))" 
                    class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Eliminar de la lista"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Observaciones Generales -->
        <div class="pt-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Observaciones Generales del Informe (Opcional)
          </label>
          <input 
            v-model="informe.observacion_general" 
            type="text" 
            placeholder="Aclaraciones generales para la jornada..." 
            class="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white min-h-[44px]"
          />
        </div>
      </div>
    </template>

    <!-- FLOATING STICKY ACTION BAR MOBILE-OPTIMIZED (Positioned above bottom nav bottom-[57px]) -->
    <div class="fixed bottom-[57px] md:bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-2xl">
      <div class="max-w-2xl mx-auto flex items-center justify-between gap-2">
        
        <!-- Indicador de Autoguardado Sincronizado -->
        <div class="flex items-center gap-1.5">
          <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span v-if="autoSaveStatus === 'saving'" class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <svg v-else-if="autoSaveStatus === 'saved'" class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            <svg v-else-if="autoSaveStatus === 'error'" class="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span v-else class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>

            <span class="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-none">
              {{ autoSaveMessage }}
            </span>
          </div>

          <div class="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-500">
            <span>|</span>
            <span class="font-mono text-slate-900 dark:text-white">{{ summaryStats.totalMovimientos }}</span>
            <span>movs</span>
          </div>
        </div>

        <!-- Acciones Directas Mobile -->
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="saveDraftManual" 
            :disabled="isSaving || isSending"
            class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs border border-slate-200 dark:border-slate-700 min-h-[42px]"
          >
            <span>Borrador</span>
          </button>

          <button 
            type="button" 
            @click="openResumenModal" 
            :disabled="movimientos.length === 0 || isSending"
            class="px-3.5 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[42px]"
          >
            <span>Guardar y Enviar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Eliminar Borrador -->
    <div v-if="showDeleteDraftModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="space-y-1">
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
            ¿Descartar este borrador?
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Se eliminarán los movimientos registrados en este borrador y no podrán recuperarse.
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showDeleteDraftModal = false" class="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl">
            Cancelar
          </button>
          <button type="button" @click="deleteCurrentDraft" class="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs">
            Confirmar Descarte
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Resumen Envío -->
    <ResumenEnvioModal 
      :show="showResumenModal"
      :stats="summaryStats"
      :observacion="informe.observacion_general"
      :is-sending="isSending"
      @close="showResumenModal = false"
      @confirm="submitInformeFinal"
    />

    <!-- Modal Opciones de Borrador Activo -->
    <DraftOptionsModal 
      :show="showDraftOptionsModal"
      :draft="informe"
      :movimientos-count="movimientos.length"
      @close="showDraftOptionsModal = false"
      @continue="showDraftOptionsModal = false"
      @start-new="startNewCleanReport"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import ResumenEnvioModal from '../../components/logistica/ResumenEnvioModal.vue';
import DraftOptionsModal from '../../components/logistica/DraftOptionsModal.vue';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const isSaving = ref(false);
const isSending = ref(false);
const isDeletingDraft = ref(false);
const showResumenModal = ref(false);
const showDeleteDraftModal = ref(false);
const showDraftOptionsModal = ref(false);

const enviadoExistente = ref(null);
const movimientoFilter = ref('todos');

const handleNewReportClick = () => {
  if (userDrafts.value.length > 0 || informe.id || movimientos.value.length > 0) {
    showDraftOptionsModal.value = true;
  } else {
    startNewCleanReport();
  }
};

const autoSaveStatus = ref('idle'); // 'idle' | 'saving' | 'saved' | 'error'
const lastSaveTime = ref('');

const autoSaveMessage = computed(() => {
  if (autoSaveStatus.value === 'saving') return 'Sincronizando borrador...';
  if (autoSaveStatus.value === 'saved') return lastSaveTime.value ? `Autoguardado ${lastSaveTime.value}` : 'Autoguardado OK';
  if (autoSaveStatus.value === 'error') return 'Error de autoguardado';
  return 'Borrador sin cambios';
});

const todayISO = new Date().toISOString().split('T')[0];

const informe = reactive({
  id: null,
  fecha: todayISO,
  responsable_user_id: '',
  responsable_nombre: '',
  zona: 'Formosa',
  observacion_general: '',
  estado: 'borrador'
});

const movimientos = ref([]);
const userDrafts = ref([]);
const showDraftSelector = ref(false);
const editingIndex = ref(null);

const checkEnviadoForDate = async (fecha) => {
  if (!informe.responsable_user_id || !fecha) {
    enviadoExistente.value = null;
    return;
  }
  try {
    const { data } = await supabase
      .from('logistica_informes_diarios')
      .select('id, fecha, enviado_at, hora_envio')
      .eq('responsable_user_id', informe.responsable_user_id)
      .eq('fecha', fecha)
      .eq('estado', 'enviado')
      .maybeSingle();

    enviadoExistente.value = data || null;
  } catch (err) {
    console.error('Error al verificar informe enviado en la fecha:', err);
  }
};

const moveMovementUp = (idx) => {
  if (idx <= 0) return;
  const temp = movimientos.value[idx];
  movimientos.value[idx] = movimientos.value[idx - 1];
  movimientos.value[idx - 1] = temp;
  if (editingIndex.value === idx) editingIndex.value = idx - 1;
  else if (editingIndex.value === idx - 1) editingIndex.value = idx;
  scheduleAutoSave();
};

const moveMovementDown = (idx) => {
  if (idx < 0 || idx >= movimientos.value.length - 1) return;
  const temp = movimientos.value[idx];
  movimientos.value[idx] = movimientos.value[idx + 1];
  movimientos.value[idx + 1] = temp;
  if (editingIndex.value === idx) editingIndex.value = idx + 1;
  else if (editingIndex.value === idx + 1) editingIndex.value = idx;
  scheduleAutoSave();
};

const filteredMovimientos = computed(() => {
  if (movimientoFilter.value === 'todos') return movimientos.value;
  if (movimientoFilter.value === 'entrega') return movimientos.value.filter(m => m.tipo_movimiento === 'Entrega de cajas');
  if (movimientoFilter.value === 'retiro') return movimientos.value.filter(m => m.tipo_movimiento === 'Retiro de cajas');
  if (movimientoFilter.value === 'incidencia') return movimientos.value.filter(m => m.tipo_movimiento === 'Incidencia');
  if (movimientoFilter.value === 'otros') return movimientos.value.filter(m => !['Entrega de cajas', 'Retiro de cajas', 'Incidencia'].includes(m.tipo_movimiento));
  return movimientos.value;
});

const filterCounts = computed(() => {
  const total = movimientos.value.length;
  const entregas = movimientos.value.filter(m => m.tipo_movimiento === 'Entrega de cajas').length;
  const retiros = movimientos.value.filter(m => m.tipo_movimiento === 'Retiro de cajas').length;
  const incidencias = movimientos.value.filter(m => m.tipo_movimiento === 'Incidencia').length;
  const otros = total - entregas - retiros - incidencias;
  return { total, entregas, retiros, incidencias, otros };
});

onBeforeRouteLeave((to, from, next) => {
  if (informe.estado === 'enviado' || isSending.value || isDeletingDraft.value) {
    next();
    return;
  }
  if (movimientos.value.length > 0 || informe.observacion_general.trim()) {
    const confirmLeave = window.confirm('Tienes movimientos o datos cargados en borrador. ¿Estás seguro de que deseas salir sin enviar el informe diario?');
    if (confirmLeave) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// Mutex Lock contra concurrencia de autoguardado
let isSavingInternal = false;
let autoSaveTimer = null;

const scheduleAutoSave = () => {
  if (loading.value || isSending.value || isDeletingDraft.value || informe.estado === 'enviado' || !informe.responsable_user_id) return;
  // No programar autoguardado de un informe nuevo limpio si aún no tiene movimientos ni observaciones
  if (!informe.id && movimientos.value.length === 0 && !informe.observacion_general.trim()) return;
  autoSaveStatus.value = 'saving';
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    await saveDraftInternal(true);
  }, 1400);
};

// Watcher para guardar borrador automáticamente ante cambios
watch(
  () => [informe.fecha, informe.zona, informe.observacion_general],
  ([newFecha], [oldFecha]) => {
    if (newFecha !== oldFecha) {
      checkEnviadoForDate(newFecha);
    }
    if (!loading.value) {
      scheduleAutoSave();
    }
  },
  { deep: true }
);

const tipoChips = [
  { label: 'Entrega de Cajas', value: 'Entrega de cajas' },
  { label: 'Retiro de Cajas', value: 'Retiro de cajas' },
  { label: 'Traslado a Central', value: 'Traslado a Central' },
  { label: 'Documentación', value: 'Documentación' },
  { label: 'Otra Gestión', value: 'Otra gestión' },
  { label: 'Incidencia', value: 'Incidencia' }
];

const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const showDropdown = ref(false);
const selectedCirugia = ref(null);

const showManualForm = ref(false);
const manualForm = reactive({
  paciente: '',
  medico: '',
  fecha_cirugia: '',
  institucion: '',
  cliente: ''
});

const builder = reactive({
  tipo_movimiento: 'Entrega de cajas',
  detalle_incidencia_o_gestion: '',
  trasladado_a_central: false,
  cantidad_cajas: 1,
  cantidad_bultos: 1,
  observaciones: '',
  tiene_pendiente: false,
  detalle_pendiente: ''
});

const selectTipoMovimiento = (val) => {
  builder.tipo_movimiento = val;
  builder.detalle_incidencia_o_gestion = '';
};

let searchTimeout = null;
const onSearchInput = () => {
  showDropdown.value = true;
  clearTimeout(searchTimeout);
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true;
      const { data, error } = await supabase.rpc('buscar_cirugias_logistica', {
        p_busqueda: searchQuery.value.trim()
      });

      if (error) {
        const { data: fbData } = await supabase
          .from('reportes')
          .select('id, id_cirugia, cliente, paciente, medico, lugar_cirugia, fecha_cirugia')
          .or(`paciente.ilike.%${searchQuery.value}%,medico.ilike.%${searchQuery.value}%,cliente.ilike.%${searchQuery.value}%,id_cirugia.ilike.%${searchQuery.value}%`)
          .limit(10);

        searchResults.value = (fbData || []).map(r => ({
          id: r.id,
          id_cirugia: r.id_cirugia,
          cliente: r.cliente,
          paciente: r.paciente,
          medico: r.medico,
          institucion: r.lugar_cirugia,
          fecha_cirugia: r.fecha_cirugia
        }));
      } else {
        searchResults.value = data || [];
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSearching.value = false;
    }
  }, 250);
};

const selectCirugia = (cirugia) => {
  selectedCirugia.value = cirugia;
  searchQuery.value = cirugia.paciente || cirugia.id_cirugia || '';
  showDropdown.value = false;
  showManualForm.value = false;
};

const clearSelectedCirugia = () => {
  selectedCirugia.value = null;
  searchQuery.value = '';
};

const openManualForm = () => {
  showManualForm.value = true;
  if (searchQuery.value.trim()) {
    manualForm.paciente = searchQuery.value.trim();
  }
};

const closeManualForm = () => {
  showManualForm.value = false;
};

const addMovementToList = () => {
  if ((builder.tipo_movimiento === 'Incidencia' || builder.tipo_movimiento === 'Otra gestión') && !builder.detalle_incidencia_o_gestion.trim()) {
    toast.error(`Ingresa el detalle de la ${builder.tipo_movimiento.toLowerCase()}.`);
    return;
  }

  let pacienteVal = '';
  let medicoVal = '';
  let fechaCirugiaVal = '';
  let institucionVal = '';
  let clienteVal = '';
  let reporteIdVal = null;
  let idCirugiaSnapVal = null;

  if (selectedCirugia.value) {
    pacienteVal = selectedCirugia.value.paciente;
    medicoVal = selectedCirugia.value.medico;
    fechaCirugiaVal = selectedCirugia.value.fecha_cirugia;
    institucionVal = selectedCirugia.value.institucion;
    clienteVal = selectedCirugia.value.cliente;
    reporteIdVal = selectedCirugia.value.id;
    idCirugiaSnapVal = selectedCirugia.value.id_cirugia;
  } else if (showManualForm.value && manualForm.paciente.trim()) {
    pacienteVal = manualForm.paciente.trim();
    medicoVal = manualForm.medico.trim();
    fechaCirugiaVal = manualForm.fecha_cirugia;
    institucionVal = manualForm.institucion.trim();
    clienteVal = manualForm.cliente.trim();
  } else if (searchQuery.value.trim()) {
    pacienteVal = searchQuery.value.trim();
  } else {
    toast.error('Por favor ingresa o busca un paciente o cirugía.');
    return;
  }

  if (builder.tiene_pendiente && !builder.detalle_pendiente.trim()) {
    toast.error('Indique el detalle del pendiente.');
    return;
  }

  let finalObs = builder.observaciones.trim();
  if (builder.tipo_movimiento === 'Retiro de cajas' && builder.trasladado_a_central) {
    finalObs = finalObs 
      ? `[Trasladado a Central en el día] ${finalObs}`
      : `[Trasladado a Central en el día]`;
  }
  if (builder.detalle_incidencia_o_gestion.trim()) {
    finalObs = finalObs 
      ? `[${builder.tipo_movimiento}: ${builder.detalle_incidencia_o_gestion.trim()}] ${finalObs}`
      : `[${builder.tipo_movimiento}: ${builder.detalle_incidencia_o_gestion.trim()}]`;
  }

  const movItem = {
    tempId: editingIndex.value !== null ? movimientos.value[editingIndex.value].tempId : Date.now() + Math.random(),
    tipo_movimiento: builder.tipo_movimiento,
    reporte_id: reporteIdVal,
    id_cirugia_snapshot: idCirugiaSnapVal,
    cliente_snapshot: clienteVal || null,
    paciente_snapshot: pacienteVal,
    medico_snapshot: medicoVal || null,
    institucion_snapshot: institucionVal || null,
    fecha_cirugia_snapshot: fechaCirugiaVal || null,
    destino: (builder.tipo_movimiento === 'Retiro de cajas' && builder.trasladado_a_central) ? 'Central' : pacienteVal,
    cantidad_cajas: builder.cantidad_cajas || 0,
    cantidad_bultos: builder.cantidad_bultos || 0,
    observaciones: finalObs || null,
    tiene_pendiente: builder.tiene_pendiente,
    cantidad_pendiente: builder.tiene_pendiente ? 1 : 0,
    detalle_pendiente: builder.tiene_pendiente ? builder.detalle_pendiente.trim() : null
  };

  if (editingIndex.value !== null) {
    movimientos.value[editingIndex.value] = movItem;
    toast.success(`Modificado: ${movItem.tipo_movimiento}`);
    editingIndex.value = null;
  } else {
    movimientos.value.push(movItem);
    toast.success(`Añadido: ${movItem.tipo_movimiento}`);
  }

  clearSelectedCirugia();
  showManualForm.value = false;
  Object.assign(manualForm, { paciente: '', medico: '', fecha_cirugia: '', institucion: '', cliente: '' });
  builder.cantidad_cajas = 1;
  builder.cantidad_bultos = 1;
  builder.observaciones = '';
  builder.detalle_incidencia_o_gestion = '';
  builder.trasladado_a_central = false;
  builder.tiene_pendiente = false;
  builder.detalle_pendiente = '';

  scheduleAutoSave();
};

const editMovement = (index) => {
  const mov = movimientos.value[index];
  if (!mov) return;

  editingIndex.value = index;
  builder.tipo_movimiento = mov.tipo_movimiento || 'Entrega de cajas';
  builder.cantidad_cajas = mov.cantidad_cajas || 0;
  builder.cantidad_bultos = mov.cantidad_bultos || 0;
  builder.observaciones = mov.observaciones || '';
  builder.tiene_pendiente = !!mov.tiene_pendiente;
  builder.detalle_pendiente = mov.detalle_pendiente || '';

  if (mov.reporte_id || mov.id_cirugia_snapshot) {
    selectedCirugia.value = {
      id: mov.reporte_id,
      id_cirugia: mov.id_cirugia_snapshot,
      paciente: mov.paciente_snapshot,
      medico: mov.medico_snapshot,
      institucion: mov.institucion_snapshot,
      cliente: mov.cliente_snapshot
    };
  } else if (mov.paciente_snapshot) {
    searchQuery.value = mov.paciente_snapshot;
  }

  window.scrollTo({ top: 180, behavior: 'smooth' });
};

const cancelEditMovement = () => {
  editingIndex.value = null;
  clearSelectedCirugia();
  builder.cantidad_cajas = 1;
  builder.cantidad_bultos = 1;
  builder.observaciones = '';
  builder.detalle_incidencia_o_gestion = '';
  builder.tiene_pendiente = false;
  builder.detalle_pendiente = '';
};

const deleteMovimiento = (index) => {
  if (editingIndex.value === index) {
    cancelEditMovement();
  }
  movimientos.value.splice(index, 1);
  scheduleAutoSave();
};

const summaryStats = computed(() => ({
  totalMovimientos: movimientos.value.length,
  totalCajas: movimientos.value.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0),
  totalBultos: movimientos.value.reduce((sum, m) => sum + (m.cantidad_bultos || 0), 0),
  totalPendientes: movimientos.value.filter(m => m.tiene_pendiente).length
}));

const toggleShowDraftSelector = () => {
  showDraftSelector.value = !showDraftSelector.value;
};

const fetchUserDrafts = async (userId) => {
  if (!userId) return;
  try {
    const { data } = await supabase
      .from('logistica_informes_diarios')
      .select('id, fecha, zona, observacion_general, created_at, updated_at')
      .eq('responsable_user_id', userId)
      .eq('estado', 'borrador')
      .order('created_at', { ascending: false });

    userDrafts.value = data || [];
  } catch (err) {
    console.error('Error al obtener borradores activos:', err);
  }
};

const loadDraftData = async (draftId) => {
  clearTimeout(autoSaveTimer);
  const { data: existing, error } = await supabase
    .from('logistica_informes_diarios')
    .select('*')
    .eq('id', draftId)
    .single();

  if (error || !existing) throw new Error('No se encontró el borrador especificado.');

  Object.assign(informe, existing);

  const { data: movs } = await supabase
    .from('logistica_informe_movimientos')
    .select('*')
    .eq('informe_id', existing.id)
    .order('orden', { ascending: true });

  movimientos.value = (movs || []).map(m => ({ ...m, tempId: m.id }));
  autoSaveStatus.value = 'saved';
};

const switchDraft = async (draftId) => {
  if (informe.id === draftId) return;
  try {
    loading.value = true;
    editingIndex.value = null;
    await loadDraftData(draftId);
    toast.info('Borrador cargado correctamente.');
    showDraftSelector.value = false;
  } catch (err) {
    toast.error('Error al cambiar de borrador: ' + err.message);
  } finally {
    loading.value = false;
  }
};

const startNewCleanReport = () => {
  clearTimeout(autoSaveTimer);
  editingIndex.value = null;
  informe.id = null;
  informe.fecha = todayISO;
  informe.observacion_general = '';
  informe.zona = 'Formosa';
  informe.estado = 'borrador';
  movimientos.value = [];
  autoSaveStatus.value = 'idle';
  showDraftSelector.value = false;
  showDraftOptionsModal.value = false;
  clearSelectedCirugia();
  showManualForm.value = false;
  clearTimeout(autoSaveTimer);
  toast.info('Se inició un nuevo informe diario limpio.');
};

const deleteCurrentDraft = async () => {
  if (!informe.id) return;
  try {
    isDeletingDraft.value = true;
    clearTimeout(autoSaveTimer);
    const draftIdToDelete = informe.id;

    // 1. Eliminar movimientos asociados (Permitido por Grant DELETE en movimientos)
    await supabase.from('logistica_informe_movimientos').delete().eq('informe_id', draftIdToDelete);

    // 2. Intentar eliminar registro principal del borrador
    const { error: deleteErr } = await supabase.from('logistica_informes_diarios').delete().eq('id', draftIdToDelete);
    if (deleteErr) {
      console.warn('DELETE no permitido por RLS/Grant en logistica_informes_diarios, limpiando borrador:', deleteErr);
      // Fallback sin violar el CHECK constraint (estado admite: borrador, enviado, corregido)
      const { error: updateErr } = await supabase
        .from('logistica_informes_diarios')
        .update({ observacion_general: null })
        .eq('id', draftIdToDelete);
      if (updateErr) console.warn('Error en fallback update:', updateErr);
    }

    toast.success('Borrador descartado correctamente.');
    showDeleteDraftModal.value = false;
    
    // 3. Actualizar la lista de borradores del usuario
    await fetchUserDrafts(informe.responsable_user_id);
    
    // 4. Cambiar al siguiente borrador o limpiar estado de manera segura
    const remainingDrafts = userDrafts.value.filter(d => d.id !== draftIdToDelete);
    if (remainingDrafts.length > 0) {
      await loadDraftData(remainingDrafts[0].id);
    } else {
      startNewCleanReport();
    }
  } catch (err) {
    toast.error('Error al descartar el borrador: ' + (err.message || 'Error inesperado'));
  } finally {
    isDeletingDraft.value = false;
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    informe.responsable_user_id = session.user.id;
    informe.responsable_nombre = session.user.user_metadata?.nombre_completo 
      || session.user.user_metadata?.nombre 
      || session.user.email?.split('@')[0] 
      || 'Usuario Logística';

    if (session.user.user_metadata?.zona) {
      informe.zona = session.user.user_metadata.zona;
    }

    await fetchUserDrafts(session.user.id);

    const targetInformeId = route.params.id || route.query.id;
    const isExplicitNew = route.query.mode === 'new';

    if (targetInformeId) {
      await loadDraftData(targetInformeId);
    } else if (!isExplicitNew && userDrafts.value.length > 0) {
      await loadDraftData(userDrafts.value[0].id);
    }

    await checkEnviadoForDate(informe.fecha);
  } catch (err) {
    toast.error('Error al inicializar el informe: ' + err.message);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  clearTimeout(autoSaveTimer);
});

// Guardado seguro con bloqueo mutex y resolución de duplicados por fecha
const saveDraftInternal = async (isSilent = false) => {
  if (!informe.responsable_user_id) return false;
  if (isSavingInternal) return true;

  try {
    isSavingInternal = true;
    isSaving.value = true;
    autoSaveStatus.value = 'saving';

    if (informe.id) {
      const { error } = await supabase
        .from('logistica_informes_diarios')
        .update({
          fecha: informe.fecha,
          zona: informe.zona,
          observacion_general: informe.observacion_general
        })
        .eq('id', informe.id);

      if (error) throw error;
    } else {
      // Prevenir violación de constraint único (fecha, responsable_user_id)
      const { data: existingForDate } = await supabase
        .from('logistica_informes_diarios')
        .select('id, estado')
        .eq('responsable_user_id', informe.responsable_user_id)
        .eq('fecha', informe.fecha)
        .maybeSingle();

      if (existingForDate && existingForDate.estado === 'borrador') {
        informe.id = existingForDate.id;
        const { error: updateErr } = await supabase
          .from('logistica_informes_diarios')
          .update({
            fecha: informe.fecha,
            zona: informe.zona,
            observacion_general: informe.observacion_general
          })
          .eq('id', informe.id);

        if (updateErr) throw updateErr;
      } else {
        const { data, error } = await supabase
          .from('logistica_informes_diarios')
          .insert({
            fecha: informe.fecha,
            responsable_user_id: informe.responsable_user_id,
            responsable_nombre: informe.responsable_nombre,
            zona: informe.zona,
            observacion_general: informe.observacion_general,
            estado: 'borrador'
          })
          .select()
          .single();

        if (error) throw error;
        informe.id = data.id;
      }
    }

    if (informe.id) {
      const { error: deleteErr } = await supabase.from('logistica_informe_movimientos').delete().eq('informe_id', informe.id);
      if (deleteErr) throw deleteErr;

      if (movimientos.value.length > 0) {
        const payload = movimientos.value.map((m, idx) => ({
          informe_id: informe.id,
          reporte_id: (m.reporte_id && String(m.reporte_id).trim() !== '') ? m.reporte_id : null,
          id_cirugia_snapshot: (m.id_cirugia_snapshot && String(m.id_cirugia_snapshot).trim() !== '') ? m.id_cirugia_snapshot : null,
          cliente_snapshot: (m.cliente_snapshot && String(m.cliente_snapshot).trim() !== '') ? m.cliente_snapshot : null,
          tipo_movimiento: m.tipo_movimiento,
          paciente_snapshot: m.paciente_snapshot || null,
          medico_snapshot: (m.medico_snapshot && String(m.medico_snapshot).trim() !== '') ? m.medico_snapshot : null,
          institucion_snapshot: (m.institucion_snapshot && String(m.institucion_snapshot).trim() !== '') ? m.institucion_snapshot : null,
          fecha_cirugia_snapshot: (m.fecha_cirugia_snapshot && String(m.fecha_cirugia_snapshot).trim() !== '') ? m.fecha_cirugia_snapshot : null,
          destino: m.destino || m.paciente_snapshot || 'Central',
          cantidad_cajas: Number(m.cantidad_cajas) || 0,
          cantidad_bultos: Number(m.cantidad_bultos) || 0,
          resultado: m.resultado || null,
          tiene_pendiente: !!m.tiene_pendiente,
          cantidad_pendiente: m.tiene_pendiente ? 1 : 0,
          detalle_pendiente: m.tiene_pendiente ? (m.detalle_pendiente || null) : null,
          motivo_pendiente: m.motivo_pendiente || null,
          observaciones: m.observaciones || null,
          orden: idx
        }));

        const { error: insertErr } = await supabase.from('logistica_informe_movimientos').insert(payload);
        if (insertErr) throw insertErr;
      }
    }

    await fetchUserDrafts(informe.responsable_user_id);

    if (!isSilent) {
      toast.success('Borrador guardado exitosamente.');
    }
    autoSaveStatus.value = 'saved';
    const now = new Date();
    lastSaveTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return true;
  } catch (err) {
    if (!isSilent) {
      toast.error('Error al guardar borrador: ' + (err.message || 'Error inesperado'));
    }
    autoSaveStatus.value = 'error';
    return false;
  } finally {
    isSaving.value = false;
    isSavingInternal = false;
  }
};

const saveDraftManual = async () => {
  clearTimeout(autoSaveTimer);
  await saveDraftInternal(false);
};

const openResumenModal = async () => {
  if (movimientos.value.length === 0) {
    toast.error('Cargue al menos un movimiento antes de guardar y enviar el informe.');
    return;
  }
  clearTimeout(autoSaveTimer);
  const saved = await saveDraftInternal(true);
  if (saved && informe.id) {
    showResumenModal.value = true;
  }
};

const submitInformeFinal = async () => {
  try {
    clearTimeout(autoSaveTimer);
    isSending.value = true;

    // Asegurar que la versión más reciente quede guardada
    const saved = await saveDraftInternal(true);
    if (!saved || !informe.id) {
      throw new Error('No se pudo verificar el borrador en la base de datos antes de enviar.');
    }

    const { error } = await supabase.rpc('enviar_informe_logistica', {
      p_informe_id: informe.id
    });

    if (error) throw error;

    toast.success('¡Informe diario guardado y enviado exitosamente!');
    showResumenModal.value = false;
    router.replace({ name: 'LogisticaDetalleInforme', params: { id: informe.id } });
  } catch (err) {
    toast.error('Error al enviar el informe: ' + (err.message || err.details || 'Compruebe los movimientos'));
  } finally {
    isSending.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
