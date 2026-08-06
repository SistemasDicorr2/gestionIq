<!-- src/views/logistica/LogisticaNuevoInformeView.vue -->
<template>
  <div class="max-w-xl mx-auto space-y-5 pb-44 md:pb-24 text-slate-800 dark:text-slate-100 font-sans px-3 sm:px-0">
    
    <!-- Header Mobile-First -->
    <div class="flex items-center justify-between pt-1 border-b border-slate-200/80 dark:border-slate-800 pb-3">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold">
            {{ informe.id ? 'EDIT' : 'NEW' }}
          </span>
          <h1 class="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            {{ informe.id ? 'Editar Informe Diario' : 'Nuevo Informe Diario' }}
          </h1>
          <span v-if="autoSaveStatus === 'saved'" class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span>✓</span> {{ autoSaveMessage }}
          </span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Carga fácil de entregas, retiros, bultos y novedades con autoguardado.
        </p>
      </div>

      <router-link 
        :to="{ name: 'LogisticaHistorial' }" 
        class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span>Volver</span>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <div class="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-medium">Cargando datos del informe...</span>
    </div>

    <template v-else>
      <!-- Banner informativo si se está editando un borrador existente -->
      <div v-if="informe.id && informe.estado === 'borrador'" class="p-3 bg-amber-50/90 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs animate-fadeIn">
        <div class="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
            📝 Borrador
          </span>
          <span class="font-semibold">Estás editando un borrador guardado del {{ informe.fecha }}</span>
        </div>

        <button 
          type="button" 
          @click="startNewCleanReport" 
          class="px-3 py-1 bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 rounded-xl font-extrabold text-[11px] transition-all shadow-2xs self-end sm:self-auto cursor-pointer"
        >
          + Iniciar Informe Nuevo
        </button>
      </div>

      <!-- Datos de la Jornada -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Jornada Activa</span>
          </div>
          <span class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {{ informe.responsable_nombre }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Fecha *</label>
            <input 
              v-model="informe.fecha" 
              type="date" 
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all text-xs"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Zona / Operación</label>
            <input 
              v-model="informe.zona" 
              type="text" 
              placeholder="Ej: Formosa Capital" 
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all text-xs"
            />
          </div>
        </div>
      </div>

      <!-- SECCIÓN PRINCIPAL DE CARGA DE ÍTENS -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              +
            </span>
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Cargar Movimiento
            </h3>
          </div>
          <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400">Paso a Paso</span>
        </div>

        <!-- CONSTRUCTOR DE MOVIMIENTO -->
        <div class="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
          
          <!-- PASO 1: CHIPS TÁCTILES DE TIPO DE GESTIÓN -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              1. Selecciona el Tipo de Gestión *
            </label>

            <div class="flex flex-wrap gap-1.5">
              <button 
                v-for="chip in tipoChips" 
                :key="chip.value"
                type="button"
                @click="selectTipoMovimiento(chip.value)"
                :class="[
                  'px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95',
                  builder.tipo_movimiento === chip.value 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                <span>{{ chip.icon }}</span>
                <span>{{ chip.label }}</span>
              </button>
            </div>
          </div>

          <!-- CAMPO DINÁMICO SI SE SELECCIONA INCIDENCIA U OTRA GESTIÓN -->
          <div 
            v-if="builder.tipo_movimiento === 'Incidencia' || builder.tipo_movimiento === 'Otra gestión'" 
            class="p-3 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5 animate-fadeIn"
          >
            <label class="block text-[11px] font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1">
              <span>{{ builder.tipo_movimiento === 'Incidencia' ? '⚠️ Detalle Obligatorio de la Incidencia *' : '⚙️ Detalle de la Gestión *' }}</span>
            </label>
            <input 
              v-model="builder.detalle_incidencia_o_gestion" 
              type="text" 
              :placeholder="builder.tipo_movimiento === 'Incidencia' ? 'Ej: Móvil demorado por lluvia / Falta de transporte...' : 'Ej: Entrega de documentación especial en gerencia...'"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl font-medium focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:text-white"
            />
          </div>

          <!-- TOGGLE RÁPIDO SI SE SELECCIONA RETIRO DE CAJAS (RETIRO + TRASLADO A CENTRAL EN 1 PASO) -->
          <div 
            v-if="builder.tipo_movimiento === 'Retiro de cajas'" 
            class="p-3 bg-blue-50/90 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between animate-fadeIn"
          >
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <span>🏢</span> ¿Trasladado / enviado a Central en el día?
              </span>
              <p class="text-[10px] text-blue-700 dark:text-blue-300">Registra el retiro del sanatorio y envío a central en 1 solo paso.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="builder.trasladado_a_central" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- PASO 2: BÚSQUEDA PACIENTE CON AUTOCOMPLETADO O SUGERENCIA SI NO EXISTE -->
          <div class="space-y-2 relative">
            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              2. Buscar Paciente o Asignar Cirugía *
            </label>
            
            <!-- Cirugía Vinculada Seleccionada -->
            <div v-if="selectedCirugia" class="flex items-center justify-between p-3 bg-blue-50/90 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-blue-900 dark:text-blue-200">{{ selectedCirugia.paciente }}</span>
                  <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                    {{ selectedCirugia.id_cirugia }}
                  </span>
                </div>
                <div class="flex gap-2 text-[11px] text-blue-700 dark:text-blue-300 flex-wrap">
                  <span v-if="selectedCirugia.cliente">🏢 {{ selectedCirugia.cliente }}</span>
                  <span v-if="selectedCirugia.medico">👨‍⚕️ {{ selectedCirugia.medico }}</span>
                  <span v-if="selectedCirugia.institucion">🏥 {{ selectedCirugia.institucion }}</span>
                </div>
              </div>

              <button 
                type="button" 
                @click="clearSelectedCirugia" 
                class="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
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
                  placeholder="Escribe paciente, médico, ID (CX-) o institución..." 
                  @input="onSearchInput"
                  @focus="showDropdown = true"
                  class="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400"
                />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>

              <!-- Dropdown de Resultados -->
              <div 
                v-if="showDropdown && (isSearching || searchResults.length > 0)" 
                class="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-56 overflow-y-auto p-1 space-y-1"
              >
                <div v-if="isSearching" class="p-3 text-center text-xs text-slate-400">
                  Buscando cirugías...
                </div>

                <template v-else>
                  <div 
                    v-for="item in searchResults" 
                    :key="item.id"
                    @click="selectCirugia(item)"
                    class="p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors space-y-0.5"
                  >
                    <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>{{ item.paciente || 'Paciente sin nombre' }}</span>
                      <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-bold">
                        {{ item.id_cirugia }}
                      </span>
                    </div>
                    <div class="flex gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span v-if="item.cliente">🏢 {{ item.cliente }}</span>
                      <span v-if="item.medico">👨‍⚕️ {{ item.medico }}</span>
                      <span v-if="item.institucion">🏥 {{ item.institucion }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- SUGERENCIA DE CARGA MANUAL SI LA CX NO FIGURA -->
            <div 
              v-if="!selectedCirugia && !showManualForm" 
              class="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div class="text-[11px] text-slate-600 dark:text-slate-300">
                <span class="font-bold text-slate-900 dark:text-white">¿La cirugía no figura en Gestión IQ?</span>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Por favor introducir correctamente los datos de la cirugía / paciente.</p>
              </div>

              <button 
                type="button" 
                @click="openManualForm" 
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs transition-all w-full sm:w-auto text-center"
              >
                + Cargar Cirugía Manual
              </button>
            </div>

            <!-- FORMULARIO MANUAL ESTILO CAPTURA DEL USUARIO -->
            <div 
              v-if="showManualForm && !selectedCirugia" 
              class="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-400 dark:border-blue-600 space-y-3 animate-fadeIn shadow-md"
            >
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 class="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  📝 Nueva Cirugía / Asignar Manual
                </h4>
                <button type="button" @click="closeManualForm" class="text-[11px] font-bold text-rose-500 hover:underline">
                  Ocultar
                </button>
              </div>

              <div class="space-y-2.5 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Paciente *</label>
                  <input v-model="manualForm.paciente" type="text" placeholder="Nombre completo del paciente" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Médico</label>
                  <input v-model="manualForm.medico" type="text" placeholder="Dr. / Dra." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de Cirugía</label>
                  <input v-model="manualForm.fecha_cirugia" type="date" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lugar de Cirugía (Institución)</label>
                  <input v-model="manualForm.institucion" type="text" placeholder="Clínica / Sanatorio / Hospital" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cliente / Obra Social / Prepaga</label>
                  <input v-model="manualForm.cliente" type="text" placeholder="Ej: OSDE / Subsidio Salud" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <!-- PASO 3: CAJAS Y BULTOS (CONTADORES TÁCTILES MOBILE) -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Cant. Cajas</label>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                <button type="button" @click="builder.cantidad_cajas = Math.max(0, builder.cantidad_cajas - 1)" class="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base">-</button>
                <input v-model.number="builder.cantidad_cajas" type="number" min="0" class="w-full text-center font-mono font-bold text-sm bg-transparent focus:outline-none dark:text-white" />
                <button type="button" @click="builder.cantidad_cajas++" class="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base">+</button>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Cant. Bultos</label>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                <button type="button" @click="builder.cantidad_bultos = Math.max(0, builder.cantidad_bultos - 1)" class="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base">-</button>
                <input v-model.number="builder.cantidad_bultos" type="number" min="0" class="w-full text-center font-mono font-bold text-sm bg-transparent focus:outline-none dark:text-white" />
                <button type="button" @click="builder.cantidad_bultos++" class="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base">+</button>
              </div>
            </div>
          </div>

          <!-- PASO 4: OBSERVACIONES Y PENDIENTES -->
          <div class="space-y-2 pt-1">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones / Notas</label>
              <input 
                v-model="builder.observaciones" 
                type="text" 
                placeholder="Observaciones de esta gestión (opcional)..." 
                @keyup.enter="addMovementToList"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400"
              />
            </div>

            <!-- Toggle Pendiente -->
            <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span class="text-xs font-bold text-amber-700 dark:text-amber-400">¿Quedó algo pendiente?</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="builder.tiene_pendiente" class="sr-only peer" />
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div v-if="builder.tiene_pendiente" class="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900/60 space-y-2">
              <label class="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">Detalle del Pendiente *</label>
              <input v-model="builder.detalle_pendiente" type="text" placeholder="Ej: 1 caja de tornillos pendiente de retiro" class="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg focus:outline-none dark:text-white" />
            </div>
          </div>

          <!-- BOTÓN AGREGAR A LA LISTA -->
          <button 
            type="button" 
            @click="addMovementToList" 
            class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>Añadir Movimiento al Informe</span>
          </button>
        </div>

        <!-- LISTA DE MOVIMIENTOS CARGADOS -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Movimientos en este informe ({{ movimientos.length }})
            </h4>
          </div>

          <!-- Empty State -->
          <div v-if="movimientos.length === 0" class="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
            Aún no has agregado movimientos a la lista. Completa los datos arriba y presiona "Añadir Movimiento".
          </div>

          <!-- Lista de Ítems -->
          <div v-else class="space-y-2">
            <TransitionGroup name="list">
              <div 
                v-for="(mov, index) in movimientos" 
                :key="mov.tempId || index"
                class="p-3.5 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-800 transition-all flex items-start justify-between gap-3"
              >
                <div class="space-y-1 flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                      {{ mov.tipo_movimiento }}
                    </span>

                    <span v-if="mov.id_cirugia_snapshot" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      {{ mov.id_cirugia_snapshot }}
                    </span>

                    <span v-if="mov.cliente_snapshot" class="text-[11px] text-slate-500 dark:text-slate-400">
                      🏢 {{ mov.cliente_snapshot }}
                    </span>
                  </div>

                  <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ mov.paciente_snapshot || mov.destino || mov.institucion_snapshot || 'Gestión sin nombre' }}
                  </h5>

                  <div class="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span v-if="mov.medico_snapshot">👨‍⚕️ {{ mov.medico_snapshot }}</span>
                    <span v-if="mov.institucion_snapshot">🏥 {{ mov.institucion_snapshot }}</span>
                    <span>🧰 Cajas: <strong>{{ mov.cantidad_cajas || 0 }}</strong></span>
                    <span>📦 Bultos: <strong>{{ mov.cantidad_bultos || 0 }}</strong></span>
                    <span v-if="mov.observaciones" class="italic truncate max-w-xs">💬 {{ mov.observaciones }}</span>
                  </div>

                  <div v-if="mov.tiene_pendiente" class="mt-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                    ⚠️ <strong>Pendiente:</strong> {{ mov.detalle_pendiente }}
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  <button 
                    type="button" 
                    @click="deleteMovimiento(index)" 
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all"
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
          <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Observaciones Generales de la Jornada (Opcional)</label>
          <input 
            v-model="informe.observacion_general" 
            type="text" 
            placeholder="Observaciones generales..." 
            class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white"
          />
        </div>
      </div>
    </template>

    <!-- FLOATING STICKY BOTTOM ACTION BAR (Posicionada por encima de la barra mobile-nav bottom-[57px] en móviles) -->
    <div class="fixed bottom-[57px] md:bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-2xl">
      <div class="max-w-xl mx-auto flex items-center justify-between gap-2">
        
        <!-- Estado de Autoguardado & Stats -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/80">
            <span v-if="autoSaveStatus === 'saving'" class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span v-else-if="autoSaveStatus === 'saved'" class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span v-else class="w-2 h-2 rounded-full bg-slate-400"></span>

            <span class="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 truncate max-w-[110px] sm:max-w-none">
              {{ autoSaveMessage }}
            </span>
          </div>

          <div class="hidden sm:flex items-center gap-1.5 text-xs">
            <span class="text-slate-300 dark:text-slate-700">|</span>
            <span class="text-slate-900 dark:text-white font-extrabold font-mono text-xs">{{ summaryStats.totalMovimientos }}</span>
            <span class="text-slate-500 text-[10px]">Movs</span>
          </div>
        </div>

        <!-- Acciones Directas Mobile-First -->
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="saveDraftManual" 
            :disabled="isSaving || isSending"
            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
            title="Guardar borrador manualmente"
          >
            <span>💾</span>
            <span>{{ isSaving ? '...' : 'Borrador' }}</span>
          </button>

          <button 
            type="button" 
            @click="openResumenModal" 
            :disabled="movimientos.length === 0 || isSending"
            class="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>🚀</span>
            <span>Guardar y Enviar</span>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import ResumenEnvioModal from '../../components/logistica/ResumenEnvioModal.vue';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const isSaving = ref(false);
const isSending = ref(false);
const showResumenModal = ref(false);

const autoSaveStatus = ref('idle'); // 'idle' | 'saving' | 'saved' | 'error'
const lastSaveTime = ref('');

const autoSaveMessage = computed(() => {
  if (autoSaveStatus.value === 'saving') return 'Guardando borrador...';
  if (autoSaveStatus.value === 'saved') return lastSaveTime.value ? `Autoguardado ${lastSaveTime.value}` : 'Autoguardado';
  if (autoSaveStatus.value === 'error') return 'Error al autoguardar';
  return 'Borrador activo';
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

let autoSaveTimer = null;
const scheduleAutoSave = () => {
  if (loading.value || isSending.value || informe.estado === 'enviado' || !informe.responsable_user_id) return;
  autoSaveStatus.value = 'saving';
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    await saveDraftInternal(true);
  }, 1400);
};

// Autoguardado automático ante cambios en datos principales
watch(
  () => [informe.fecha, informe.zona, informe.observacion_general],
  () => {
    if (!loading.value) {
      scheduleAutoSave();
    }
  },
  { deep: true }
);

const tipoChips = [
  { icon: '🧰', label: 'Entrega Cajas', value: 'Entrega de cajas' },
  { icon: '🔄', label: 'Retiro Cajas', value: 'Retiro de cajas' },
  { icon: '🏢', label: 'Traslado a Central', value: 'Traslado a Central' },
  { icon: '📄', label: 'Documentación', value: 'Documentación' },
  { icon: '⚙️', label: 'Otra Gestión', value: 'Otra gestión' },
  { icon: '⚠️', label: 'Incidencia', value: 'Incidencia' }
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

  const newMov = {
    tempId: Date.now() + Math.random(),
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

  movimientos.value.push(newMov);

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

  toast.success(`Añadido: ${newMov.tipo_movimiento}`);
  scheduleAutoSave();
};

const deleteMovimiento = (index) => {
  movimientos.value.splice(index, 1);
  scheduleAutoSave();
};

const summaryStats = computed(() => ({
  totalMovimientos: movimientos.value.length,
  totalCajas: movimientos.value.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0),
  totalBultos: movimientos.value.reduce((sum, m) => sum + (m.cantidad_bultos || 0), 0),
  totalPendientes: movimientos.value.filter(m => m.tiene_pendiente).length
}));

const startNewCleanReport = () => {
  clearTimeout(autoSaveTimer);
  informe.id = null;
  informe.fecha = todayISO;
  informe.observacion_general = '';
  informe.estado = 'borrador';
  movimientos.value = [];
  autoSaveStatus.value = 'idle';
  toast.info('Se inició un nuevo informe diario.');
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

    // SOPORTE PARA EDICIÓN DE UN INFORME EXISTENTE O CREACIÓN LIMPIA
    const targetInformeId = route.params.id || route.query.id;
    const isExplicitNew = route.query.mode === 'new';

    if (targetInformeId) {
      const { data: existing, error: extErr } = await supabase
        .from('logistica_informes_diarios')
        .select('*')
        .eq('id', targetInformeId)
        .single();

      if (!extErr && existing) {
        Object.assign(informe, existing);

        const { data: movs } = await supabase
          .from('logistica_informe_movimientos')
          .select('*')
          .eq('informe_id', existing.id)
          .order('orden', { ascending: true });

        if (movs) movimientos.value = movs.map(m => ({ ...m, tempId: m.id }));
        autoSaveStatus.value = 'saved';
      }
    } else if (!isExplicitNew) {
      // Cargar solo el borrador activo más reciente de hoy si existe y no se solicitó un informe limpio
      const { data: existing } = await supabase
        .from('logistica_informes_diarios')
        .select('*')
        .eq('responsable_user_id', session.user.id)
        .eq('fecha', todayISO)
        .eq('estado', 'borrador')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        Object.assign(informe, existing);

        const { data: movs } = await supabase
          .from('logistica_informe_movimientos')
          .select('*')
          .eq('informe_id', existing.id)
          .order('orden', { ascending: true });

        if (movs) movimientos.value = movs.map(m => ({ ...m, tempId: m.id }));
        autoSaveStatus.value = 'saved';
      }
    }
  } catch (err) {
    toast.error('Error al inicializar el informe: ' + err.message);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  clearTimeout(autoSaveTimer);
});

const saveDraftInternal = async (isSilent = false) => {
  if (!informe.responsable_user_id) return false;
  try {
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

    if (informe.id) {
      await supabase.from('logistica_informe_movimientos').delete().eq('informe_id', informe.id);

      if (movimientos.value.length > 0) {
        const payload = movimientos.value.map((m, idx) => ({
          informe_id: informe.id,
          reporte_id: m.reporte_id || null,
          id_cirugia_snapshot: m.id_cirugia_snapshot || null,
          cliente_snapshot: m.cliente_snapshot || null,
          tipo_movimiento: m.tipo_movimiento,
          paciente_snapshot: m.paciente_snapshot || null,
          medico_snapshot: m.medico_snapshot || null,
          institucion_snapshot: m.institucion_snapshot || null,
          fecha_cirugia_snapshot: m.fecha_cirugia_snapshot || null,
          destino: m.destino || null,
          cantidad_cajas: m.cantidad_cajas || 0,
          cantidad_bultos: m.cantidad_bultos || 0,
          resultado: m.resultado || null,
          tiene_pendiente: m.tiene_pendiente || false,
          cantidad_pendiente: m.cantidad_pendiente || 0,
          detalle_pendiente: m.detalle_pendiente || null,
          motivo_pendiente: m.motivo_pendiente || null,
          observaciones: m.observaciones || null,
          orden: idx
        }));

        const { error: insertErr } = await supabase.from('logistica_informe_movimientos').insert(payload);
        if (insertErr) throw insertErr;
      }
    }

    if (!isSilent) {
      toast.success('Borrador guardado exitosamente.');
    }
    autoSaveStatus.value = 'saved';
    const now = new Date();
    lastSaveTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return true;
  } catch (err) {
    if (!isSilent) {
      toast.error('Error al guardar borrador: ' + err.message);
    }
    autoSaveStatus.value = 'error';
    return false;
  } finally {
    isSaving.value = false;
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
  if (saved) {
    showResumenModal.value = true;
  }
};

const submitInformeFinal = async () => {
  try {
    isSending.value = true;
    const { error } = await supabase.rpc('enviar_informe_logistica', {
      p_informe_id: informe.id
    });

    if (error) throw error;

    toast.success('¡Informe diario guardado y enviado exitosamente!');
    showResumenModal.value = false;
    router.replace({ name: 'LogisticaDetalleInforme', params: { id: informe.id } });
  } catch (err) {
    toast.error('Error al enviar el informe: ' + err.message);
  } finally {
    isSending.value = false;
  }
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
