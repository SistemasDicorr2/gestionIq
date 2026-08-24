<!-- src/views/logistica/GuiaEnvioLogisticaView.vue -->
<template>
  <div class="max-w-5xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-24">
    
    <!-- HEADER PRINCIPAL CORPORATIVO -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            REG03-01-01-C
          </span>
          <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Trazabilidad Logística
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Guía de Envío de Materiales
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Generador documental e impreso para guías de despacho de instrumental, implantes y equipos médicos.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start md:self-center shrink-0">
        <router-link 
          :to="{ name: 'LogisticaInformes' }" 
          class="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver a Logística</span>
        </router-link>
      </div>
    </div>

    <!-- STEPPER INTERACTIVO DE NAVEGACIÓN DE PROCESO -->
    <div class="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden">
      <button 
        type="button" 
        @click="activeStep = 1"
        class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-bold text-xs cursor-pointer"
        :class="activeStep === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black" :class="activeStep === 1 ? 'bg-white text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'">1</span>
        <span class="hidden sm:inline">1. Datos del Envío</span>
        <span class="sm:hidden">Datos</span>
      </button>

      <button 
        type="button" 
        @click="activeStep = 2"
        class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-bold text-xs cursor-pointer"
        :class="activeStep === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black" :class="activeStep === 2 ? 'bg-white text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'">2</span>
        <span class="hidden sm:inline">2. Fotos Anexo ({{ imagenes.length }})</span>
        <span class="sm:hidden">Fotos ({{ imagenes.length }})</span>
      </button>

      <button 
        type="button" 
        @click="activeStep = 3"
        class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-bold text-xs cursor-pointer"
        :class="activeStep === 3 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black" :class="activeStep === 3 ? 'bg-white text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'">3</span>
        <span class="hidden sm:inline">3. Vista Previa & PDF</span>
        <span class="sm:hidden">Vista Previa</span>
      </button>
    </div>

    <!-- CONTENEDOR PRINCIPAL INTERACTIVO -->
    <div class="space-y-6 print:hidden">
      
      <!-- PASO 1: DATOS Y AUTOCOMPLETADO INTELIGENTE -->
      <div v-show="activeStep === 1" class="space-y-6">
        
        <!-- AUTOCOMPLETADO RÁPIDO CON CIRUGÍAS RECIENTES / INFORMES DEL DÍA -->
        <div class="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-slate-900/10 dark:from-blue-950/40 dark:to-slate-900 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 p-4 sm:p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">⚡</span>
              <h3 class="text-xs font-black uppercase tracking-wider text-blue-950 dark:text-blue-300">
                Autocompletado Rápido desde Cirugías Recientes
              </h3>
            </div>
            <span class="text-[11px] font-bold text-blue-600 dark:text-blue-400">1-Clic</span>
          </div>

          <div v-if="loadingQuickSurgeries" class="text-xs text-slate-500 animate-pulse">
            Cargando sugerencias de cirugías...
          </div>

          <div v-else-if="quickSurgeries.length === 0" class="text-xs text-slate-400 italic">
            Sin cirugías recientes en el sistema. Podés buscar en el campo a continuación o ingresar manualmente.
          </div>

          <div v-else class="flex gap-2 overflow-x-auto pb-1">
            <button 
              v-for="s in quickSurgeries" 
              :key="s.id"
              type="button"
              @click="quickFillForm(s)"
              class="shrink-0 p-2.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer shadow-2xs max-w-xs space-y-0.5"
            >
              <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white gap-2">
                <span class="truncate">{{ s.paciente || 'Cirugía sin nombre' }}</span>
                <span v-if="s.fecha_cirugia" class="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded shrink-0">{{ formatDate(s.fecha_cirugia) }}</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {{ s.medico ? `Dr/a. ${s.medico}` : '' }} {{ s.institucion ? `• ${s.institucion}` : '' }}
              </p>
            </button>
          </div>
        </div>

        <!-- FORMULARIO EDITABLE DE LA GUÍA DE ENVÍO -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
              <h2 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Datos del Despacho y Pacientes
              </h2>
            </div>
            <button 
              type="button" 
              @click="addNewEmptyPatient"
              class="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>+ Agregar Paciente Manual</span>
            </button>
          </div>

          <!-- LISTA DE PACIENTES INCLUIDOS EN LA GUÍA (MULTI-PACIENTE) -->
          <div v-if="pacientes.length > 0" class="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
              <span>👥 Pacientes Incluidos en este Despacho ({{ pacientes.length }})</span>
              <button type="button" @click="clearAllPatients" class="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline">Limpiar Lista</button>
            </div>

            <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              <div 
                v-for="(p, pIdx) in pacientes" 
                :key="p.id || pIdx"
                class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 w-full text-xs">
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">PACIENTE *</span>
                    <input v-model="p.paciente" type="text" placeholder="Ej: Ortiz Leandro" class="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-white" />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">MÉDICO</span>
                    <input v-model="p.medico" type="text" placeholder="Ej: Dr. González" class="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium dark:text-white" />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">FECHA CX</span>
                    <input v-model="p.fecha_cx" type="date" class="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium dark:text-white" />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">SANATORIO / DESTINO</span>
                    <input v-model="p.lugar_entrega" type="text" placeholder="Ej: Sanatorio Vinto" class="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium dark:text-white" />
                  </div>
                </div>

                <button 
                  type="button" 
                  @click="removePatient(pIdx)" 
                  class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg self-end sm:self-center shrink-0 cursor-pointer transition-colors"
                  title="Quitar este paciente"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- BUSCADOR CON DROPDOWN INTERACTIVO DE BÚSQUEDA -->
          <div class="space-y-2 relative">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              🔎 Buscar paciente o sanatorio en la base de datos
            </label>
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Escribí para buscar por paciente, médico o sanatorio..." 
                @input="onSearchInput"
                @focus="showDropdown = true"
                class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>

              <!-- DROPDOWN DE RESULTADOS -->
              <div 
                v-if="showDropdown && (isSearching || searchResults.length > 0)" 
                class="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-1"
              >
                <div v-if="isSearching" class="p-3 text-center text-xs text-slate-400">
                  Buscando en la base de datos...
                </div>

                <template v-else>
                  <div 
                    v-for="item in searchResults" 
                    :key="item.id"
                    class="p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors space-y-1 border border-transparent hover:border-blue-200 flex items-center justify-between gap-2"
                  >
                    <div class="space-y-0.5 flex-1">
                      <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span>{{ item.paciente || 'Paciente sin nombre' }}</span>
                        <span v-if="item.id_cirugia" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                          {{ item.id_cirugia }}
                        </span>
                      </div>
                      <div class="flex gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span v-if="item.cliente">Cliente: {{ item.cliente }}</span>
                        <span v-if="item.medico">Médico: {{ item.medico }}</span>
                        <span v-if="item.institucion">Lugar: {{ item.institucion }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      <button 
                        type="button" 
                        @click="addCirugiaToPatients(item)" 
                        class="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors shadow-2xs"
                      >
                        + Agregar
                      </button>
                      <button 
                        type="button" 
                        @click="selectCirugiaSingle(item)" 
                        class="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Reemplazar
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- CAMPOS DEL FORMULARIO -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CLIENTE *</label>
              <input v-model="form.cliente" type="text" placeholder="Ej: BIOPROTECE / OSDE" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">MÉDICO CIRUJANO PRINCIPAL</label>
              <input v-model="form.medico" type="text" placeholder="Ej: Dr. González" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PACIENTE PRINCIPAL / RESUMEN</label>
              <input v-model="form.paciente" type="text" placeholder="Ej: Ortiz Leandro (o 3 Pacientes)" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">LUGAR DE ENTREGA</label>
              <input v-model="form.lugar_entrega" type="text" placeholder="Ej: Sanatorio Vinto / Depósito Central" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FECHA DE CX</label>
              <input v-model="form.fecha_cx" type="date" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FECHA DE ENVÍO *</label>
              <input v-model="form.fecha_envio" type="date" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TRANSPORTE *</label>
              <input v-model="form.transporte" type="text" placeholder="Ej: EMA PACK / ANDREANI / PROPIO" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-700 dark:text-slate-300">N° DE GUÍA *</label>
                <button type="button" @click="regenerateGuiaNumber" class="text-[10px] text-blue-600 hover:underline font-bold">🔄 Regenerar</button>
              </div>
              <input v-model="form.numero_guia" type="text" placeholder="Ej: R-0044-00000771" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-mono font-bold" />
            </div>

            <div class="sm:col-span-2">
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">OBSERVACIONES GENERALES (HOJA 1)</label>
              <textarea v-model="form.observaciones" rows="2" placeholder="Ej: ENVIO DE INSTRUMENTAL PARA REPARACION Y ACONDICIONAMIENTO" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium"></textarea>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="button" 
              @click="activeStep = 2" 
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Continuar a Fotos Anexo</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>

        </div>
      </div>

      <!-- PASO 2: ADJUNTO DRAG & DROP, ROTACIÓN Y GALERÍA DE IMÁGENES -->
      <div v-show="activeStep === 2" class="space-y-6">
        
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">2</span>
              <h2 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Fotografías del Instrumental y Cajas ({{ imagenes.length }})
              </h2>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button 
                v-if="imagenes.length > 0"
                type="button" 
                @click="toggleAllImageSizes" 
                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                📐 Todas: {{ allImagesAreGrande ? 'Compactas' : 'Grandes (+15%)' }}
              </button>

              <label class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>+ Seleccionar Fotos</span>
                <input type="file" accept="image/*" multiple @change="handleImageUpload" class="hidden" />
              </label>
            </div>
          </div>

          <!-- ZONA DRAG & DROP DE IMÁGENES -->
          <div 
            @dragover.prevent="isDraggingOver = true"
            @dragleave.prevent="isDraggingOver = false"
            @drop.prevent="handleFileDrop"
            class="p-8 text-center border-2 border-dashed rounded-2xl transition-all space-y-3 cursor-pointer"
            :class="isDraggingOver ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-4 ring-blue-500/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60'"
          >
            <div class="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <span class="text-xs font-black text-slate-800 dark:text-slate-200 block">
                Arrastrá y soltá aquí las fotografías de las bandejas
              </span>
              <p class="text-[11px] text-slate-400 mt-0.5">
                Soporta JPG, PNG, WEBP. Cada foto se ubicará en parejas (2 por página A4) en el documento impreso.
              </p>
            </div>
          </div>

          <div v-if="isUploadingImages" class="p-4 text-center text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 animate-pulse">
            ⏳ Procesando fotografías...
          </div>

          <!-- GALERÍA DE MINIATURAS CON CONTROLES AVANZADOS -->
          <div v-if="imagenes.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div 
              v-for="(img, idx) in imagenes" 
              :key="img.id || idx"
              class="group relative bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col items-center gap-2 shadow-2xs transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div class="w-full h-40 bg-slate-950/10 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative group">
                <img 
                  :src="img.url" 
                  class="max-w-full max-h-full object-contain mx-auto my-auto block transition-transform duration-200 cursor-pointer"
                  :style="{ transform: `rotate(${img.rotation || 0}deg)` }"
                  @click="openLightbox(img)"
                  title="Haz clic para ver en pantalla completa"
                />
                
                <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/85 text-white font-mono text-[9px] font-black z-10 shadow-xs">
                  Hoja {{ Math.floor(idx / 2) + 2 }} (#{{ idx + 1 }})
                </span>

                <!-- Botón de Rotación de Imagen -->
                <button 
                  type="button" 
                  @click.stop="rotateImage(idx)"
                  class="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-blue-600 text-[10px] font-bold transition-colors shadow-xs z-10 cursor-pointer"
                  title="Girar foto 90°"
                >
                  🔄 {{ img.rotation || 0 }}°
                </button>

                <!-- Badge de tamaño interactivo -->
                <button 
                  type="button" 
                  @click="openImageSizeModal(img)"
                  class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shadow-md cursor-pointer transition-transform hover:scale-105 z-10"
                  :class="img.size === 'compacto' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'"
                  title="Configurar tamaño de esta foto"
                >
                  📐 {{ img.size === 'compacto' ? 'Compacto' : 'Grande (+15%)' }}
                </button>
              </div>

              <div class="flex items-center justify-between w-full pt-1 border-t border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-1">
                  <button 
                    type="button" 
                    @click="moveImageUp(idx)" 
                    :disabled="idx === 0"
                    class="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                    title="Mover foto antes"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  
                  <button 
                    type="button" 
                    @click="moveImageDown(idx)" 
                    :disabled="idx === imagenes.length - 1"
                    class="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                    title="Mover foto después"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>

                <div class="flex items-center gap-1">
                  <button 
                    type="button" 
                    @click="openLightbox(img)" 
                    class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded cursor-pointer"
                    title="Ver en Pantalla Completa"
                  >
                    🔍
                  </button>

                  <button 
                    type="button" 
                    @click="removeImage(idx)" 
                    class="p-1 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 rounded cursor-pointer"
                    title="Eliminar esta foto"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between pt-2">
            <button 
              type="button" 
              @click="activeStep = 1" 
              class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              ← Volver a Datos
            </button>

            <button 
              type="button" 
              @click="activeStep = 3" 
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Continuar a Emisión & Vista Previa</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>

        </div>
      </div>

      <!-- PASO 3: EMISIÓN, DESCARGA EN PDF Y VISTA PREVIA -->
      <div v-show="activeStep === 3" class="space-y-6">
        
        <div class="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center sm:text-left">
            <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>📄 Documento Listo para Emitir</span>
              <span class="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">{{ form.numero_guia }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Podés abrir la vista previa interactiva A4 para editar in-situ, imprimir o descargar directamente en archivo PDF.
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
            <button 
              type="button" 
              @click="generateAndPreviewPDF" 
              :disabled="isGeneratingPDF || !form.cliente.trim() || !form.fecha_envio || !form.numero_guia.trim()"
              class="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[44px]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>{{ isGeneratingPDF ? 'Guardando Registro...' : '👁️ Abrir Vista Previa A4' }}</span>
            </button>
          </div>
        </div>

        <!-- SECCIÓN DE ÚLTIMAS GUÍAS GENERADAS (HISTORIAL) -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              📋 Historial de Guías Generadas en Districorr
            </h3>
            <span class="text-[11px] font-bold text-slate-400">Últimas 20 guías</span>
          </div>

          <div v-if="loadingHistory" class="py-6 text-center text-xs text-slate-400">
            Cargando historial de guías...
          </div>

          <div v-else-if="recentGuides.length === 0" class="py-6 text-center text-xs text-slate-400">
            No hay guías de envío registradas aún.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                  <th class="py-2 px-3">Fecha Envío</th>
                  <th class="py-2 px-3">Paciente / Cliente</th>
                  <th class="py-2 px-3">Transporte</th>
                  <th class="py-2 px-3">N° Guía</th>
                  <th class="py-2 px-3">Generado Por</th>
                  <th class="py-2 px-3 text-center">Fotos</th>
                  <th class="py-2 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr v-for="g in recentGuides" :key="g.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td class="py-2.5 px-3 font-mono font-bold">{{ formatDate(g.fecha_envio) }}</td>
                  <td class="py-2.5 px-3">
                    <span class="font-extrabold text-slate-900 dark:text-white block">{{ g.paciente || g.cliente }}</span>
                    <span class="text-[10px] text-slate-500 block">{{ g.lugar_entrega || '-' }}</span>
                  </td>
                  <td class="py-2.5 px-3">{{ g.transporte }}</td>
                  <td class="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{{ g.numero_guia }}</td>
                  <td class="py-2.5 px-3 text-[11px] text-slate-500">{{ g.created_by_nombre || 'Sistema' }}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold">{{ g.cantidad_imagenes || 0 }}</td>
                  <td class="py-2.5 px-3 text-right">
                    <button 
                      type="button" 
                      @click="loadGuideIntoForm(g)" 
                      class="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                    >
                      Cargar Guía
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>

    <!-- MODAL LIGHTBOX FOTO PANTALLA COMPLETA HD -->
    <div v-if="lightboxImage" class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div class="relative max-w-4xl w-full h-[85vh] bg-slate-900 rounded-3xl overflow-hidden flex flex-col justify-between p-4 border border-slate-800 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 text-white">
          <span class="text-xs font-black uppercase tracking-wider">📷 Inspección de Foto en Alta Resolución</span>
          <div class="flex items-center gap-2">
            <button type="button" @click="rotateImageObj(lightboxImage)" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer">
              🔄 Girar 90° ({{ lightboxImage.rotation || 0 }}°)
            </button>
            <button type="button" @click="lightboxImage = null" class="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white rounded-lg cursor-pointer">
              Cerrar ✕
            </button>
          </div>
        </div>

        <div class="flex-1 flex items-center justify-center overflow-hidden p-2">
          <img 
            :src="lightboxImage.url" 
            class="max-w-full max-h-full object-contain transition-transform duration-200 shadow-xl rounded-xl"
            :style="{ transform: `rotate(${lightboxImage.rotation || 0}deg)` }"
          />
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIGURACIÓN RÁPIDA DE TAMAÑO DE IMAGEN -->
    <div v-if="selectedImageForModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>📐 Tamaño de Imagen en PDF</span>
          </h3>
          <button type="button" @click="selectedImageForModal = null" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="w-full h-44 bg-slate-950/10 rounded-xl overflow-hidden flex items-center justify-center">
          <img 
            :src="selectedImageForModal.url" 
            class="max-w-full max-h-full object-contain"
            :style="{ transform: `rotate(${selectedImageForModal.rotation || 0}deg)` }"
          />
        </div>

        <div class="space-y-2 text-xs">
          <label class="block font-extrabold text-slate-700 dark:text-slate-300">Seleccionar Modalidad de Tamaño:</label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              @click="setImageSize(selectedImageForModal, 'grande')"
              class="p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer"
              :class="selectedImageForModal.size !== 'compacto' ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-100 font-bold ring-2 ring-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700'"
            >
              <span class="font-extrabold text-xs">🔍 Grande (+15%)</span>
              <span class="text-[10px] text-slate-500">Altura ampliada (~118mm). Mayor nitidez.</span>
            </button>

            <button 
              type="button" 
              @click="setImageSize(selectedImageForModal, 'compacto')"
              class="p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer"
              :class="selectedImageForModal.size === 'compacto' ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-950 dark:text-amber-100 font-bold ring-2 ring-amber-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700'"
            >
              <span class="font-extrabold text-xs">📦 Compacto</span>
              <span class="text-[10px] text-slate-500">Altura estándar (~98mm). Formato compacto.</span>
            </button>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button 
            type="button" 
            @click="selectedImageForModal = null" 
            class="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE VISTA PREVIA INTERACTIVA DEL DOCUMENTO A4 OPTIMIZADO PARA MONITORES Y PANTALLAS CHICAS (17", 19", LAPTOPS) -->
    <div 
      v-if="showPreviewModal" 
      class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-1.5 sm:p-3 print:p-0 print:bg-white print:static"
    >
      <!-- BARRA SUPERIOR DE ACCIONES STICKY COMPACTA Y ULTRA-RESPONSIVE -->
      <div class="w-full max-w-5xl bg-slate-900/95 border border-slate-800 text-white rounded-2xl p-2.5 px-3 sm:px-4 mb-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl shrink-0 print:hidden sticky top-1 z-40 backdrop-blur-md">
        
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
            REG03-01-01-C
          </span>
          <div class="hidden sm:block">
            <h3 class="text-xs font-black text-white flex items-center gap-1.5">
              <span>Vista Previa Guía de Envío</span>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-blue-300">
                Zoom: {{ zoomLabel }}
              </span>
            </h3>
          </div>
        </div>

        <!-- CONTROL DE ZOOM ULTRA ADAPTABLE A CUALQUIER RESOLUCIÓN -->
        <div class="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <span class="text-[10px] text-slate-400 pl-1 hidden sm:inline">🔍 Escala:</span>
          
          <button 
            type="button"
            @click="zoomOption = 'fit'"
            class="px-2 py-1 rounded-lg transition-all cursor-pointer text-[10px]"
            :class="zoomOption === 'fit' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-400 hover:text-white'"
            title="Ajustar automáticamente a la altura de la pantalla (ideal 17&quot; / 19&quot;)"
          >
            ⚡ Ajustar Pantalla
          </button>

          <button 
            v-for="z in ['0.65', '0.75', '0.85', '1.0']" 
            :key="z"
            type="button"
            @click="zoomOption = z"
            class="px-1.5 py-1 rounded-lg transition-all cursor-pointer text-[10px]"
            :class="zoomOption === z ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-white'"
          >
            {{ Math.round(parseFloat(z) * 100) }}%
          </button>
        </div>

        <!-- BOTONES DE ACCIÓN -->
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          
          <!-- BOTÓN DESCARGA DIRECTA PDF -->
          <button 
            type="button" 
            @click="downloadDirectPDF" 
            :disabled="isExportingPDF"
            class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>{{ isExportingPDF ? 'Procesando...' : '📥 Descargar PDF' }}</span>
          </button>

          <!-- IMPRIMIR NATIVO -->
          <button 
            type="button" 
            @click="triggerPrint" 
            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>🖨️ Imprimir</span>
          </button>

          <!-- TOGGLE EDICIÓN DIRECTA EN HOJA -->
          <button 
            type="button" 
            @click="isEditableInPreview = !isEditableInPreview" 
            class="px-2.5 py-1.5 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
            :class="isEditableInPreview ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
            :title="isEditableInPreview ? 'Desactivar edición en hoja' : 'Activar edición haciendo clic directo en el documento A4'"
          >
            <span>✏️ Edición {{ isEditableInPreview ? 'ON' : 'OFF' }}</span>
          </button>

          <!-- DROPDOWN ENVIAR POR EMAIL -->
          <div class="relative group">
            <button 
              type="button" 
              class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
            >
              <span>📧 Mail</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>

            <div class="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 min-w-[160px]">
              <button 
                type="button" 
                @click="sendViaOutlook" 
                class="px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <span>📬 Abrir en Outlook</span>
              </button>
              <button 
                type="button" 
                @click="sendViaGmail" 
                class="px-3 py-2 text-left text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2 cursor-pointer border-t border-slate-700/60"
              >
                <span>🌐 Abrir en Gmail Web</span>
              </button>
            </div>
          </div>

          <!-- CERRAR -->
          <button 
            type="button" 
            @click="showPreviewModal = false" 
            class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      <!-- CONTENEDOR DEL DOCUMENTO FORMATO HOJA A4 CON ESCALADO ADAPTABLE Y CENTRADO -->
      <div class="w-full flex justify-center items-start overflow-x-auto pb-12 pt-1 print:p-0">
        <div 
          class="relative transition-all duration-200 flex justify-center origin-top shrink-0"
          :style="{
            width: `${Math.round(210 * effectiveScale)}mm`,
            maxWidth: '100%'
          }"
        >
          <div 
            class="origin-top bg-white rounded-2xl shadow-2xl print:shadow-none print:transform-none print:w-full print:max-w-none transition-transform duration-200 shrink-0"
            :style="{ 
              transform: `scale(${effectiveScale})`, 
              transformOrigin: 'top center',
              width: '210mm'
            }"
          >
            <GuiaEnvioPDF 
              :guia="form" 
              :imagenes="imagenes" 
              :pacientes="pacientes" 
              :notas-paginas="notasPaginas" 
              :editable="isEditableInPreview" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- DOCUMENTO OCULTO PARA IMPRESIÓN DIRECTA -->
    <div v-else class="hidden print:block w-full">
      <GuiaEnvioPDF :guia="form" :imagenes="imagenes" :pacientes="pacientes" :notas-paginas="notasPaginas" />
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import GuiaEnvioPDF from '../../components/logistica/GuiaEnvioPDF.vue';

const toast = useToast();

const activeStep = ref(1);
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const showDropdown = ref(false);
const selectedCirugia = ref(null);

const pacientes = ref([]);
const imagenes = ref([]);
const isUploadingImages = ref(false);
const isDraggingOver = ref(false);
const isGeneratingPDF = ref(false);
const isExportingPDF = ref(false);
const pdfProgressText = ref('');
const showPreviewModal = ref(false);
const isEditableInPreview = ref(true);

// Control Adaptativo de Zoom para Pantallas Pequeñas (17", 19", etc)
const zoomOption = ref('fit'); // 'fit', '0.65', '0.75', '0.85', '1.0'
const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);

const updateWindowDimensions = () => {
  windowHeight.value = window.innerHeight;
  windowWidth.value = window.innerWidth;
};

const effectiveScale = computed(() => {
  if (zoomOption.value === 'fit') {
    // Top bar + margins ~ 95px
    const availableHeight = Math.max(350, windowHeight.value - 95);
    // A4 sheet height ~ 1050px (280mm)
    const fitH = availableHeight / 1050;
    // Fit width as well
    const availableWidth = Math.min(windowWidth.value - 24, 1100);
    const fitW = availableWidth / 800; // 210mm ~ 794px
    const scaleVal = Math.min(fitH, fitW);
    return Math.max(0.5, Math.min(1, parseFloat(scaleVal.toFixed(2))));
  }
  return parseFloat(zoomOption.value);
});

const zoomLabel = computed(() => {
  return `${Math.round(effectiveScale.value * 100)}%${zoomOption.value === 'fit' ? ' (Auto)' : ''}`;
});

const selectedImageForModal = ref(null);
const lightboxImage = ref(null);

const notasPaginas = reactive({});

const recentGuides = ref([]);
const quickSurgeries = ref([]);
const loadingQuickSurgeries = ref(false);
const loadingHistory = ref(false);
const currentUserId = ref(null);
const currentUserName = ref('');

const generateRandomGuiaNumber = () => `R-0044-${Math.floor(10000000 + Math.random() * 90000000)}`;

const form = reactive({
  cliente: 'BIOPROTECE',
  medico: '',
  paciente: '',
  lugar_entrega: '',
  fecha_cx: '',
  fecha_envio: new Date().toISOString().slice(0, 10),
  transporte: 'EMA PACK',
  numero_guia: generateRandomGuiaNumber(),
  observaciones: 'ENVIO DE INSTRUMENTAL PARA REPARACION Y ACONDICIONAMIENTO'
});

const regenerateGuiaNumber = () => {
  form.numero_guia = generateRandomGuiaNumber();
  toast.info('Nuevo N° de Guía generado.');
};

const allImagesAreGrande = computed(() => {
  if (imagenes.value.length === 0) return false;
  return imagenes.value.every(img => img.size !== 'compacto');
});

const toggleAllImageSizes = () => {
  const targetSize = allImagesAreGrande.value ? 'compacto' : 'grande';
  imagenes.value.forEach(img => img.size = targetSize);
  toast.info(`Todas las fotos configuradas en tamaño: ${targetSize === 'compacto' ? 'Compacto' : 'Grande (+15%)'}`);
};

const openImageSizeModal = (img) => {
  if (!img.size) img.size = 'grande';
  selectedImageForModal.value = img;
};

const setImageSize = (img, size) => {
  if (img) img.size = size;
};

const rotateImage = (index) => {
  const img = imagenes.value[index];
  if (!img) return;
  img.rotation = ((img.rotation || 0) + 90) % 360;
};

const rotateImageObj = (img) => {
  if (!img) return;
  img.rotation = ((img.rotation || 0) + 90) % 360;
};

const openLightbox = (img) => {
  lightboxImage.value = img;
};

// Autocompletado rápido desde cirugías recientes
const fetchQuickSurgeries = async () => {
  try {
    loadingQuickSurgeries.value = true;
    const { data, error } = await supabase
      .from('logistica_informe_movimientos')
      .select('id, paciente_snapshot, medico_snapshot, institucion_snapshot, cliente_snapshot, fecha_cirugia_snapshot')
      .order('created_at', { ascending: false })
      .limit(8);

    if (!error && data) {
      quickSurgeries.value = data.map(m => ({
        id: m.id,
        paciente: m.paciente_snapshot,
        medico: m.medico_snapshot,
        institucion: m.institucion_snapshot,
        cliente: m.cliente_snapshot,
        fecha_cirugia: m.fecha_cirugia_snapshot
      }));
    }
  } catch (err) {
    console.warn('Sugerencias de cirugías no disponibles:', err);
  } finally {
    loadingQuickSurgeries.value = false;
  }
};

const quickFillForm = (item) => {
  if (!item) return;
  pacientes.value = [{
    id: crypto.randomUUID(),
    paciente: item.paciente || '',
    medico: item.medico || '',
    fecha_cx: item.fecha_cirugia || '',
    lugar_entrega: item.institucion || ''
  }];

  if (item.cliente) form.cliente = item.cliente;
  if (item.medico) form.medico = item.medico;
  if (item.paciente) form.paciente = item.paciente;
  if (item.institucion) form.lugar_entrega = item.institucion;
  if (item.fecha_cirugia) form.fecha_cx = item.fecha_cirugia;

  toast.success(`Campos autocompletados con paciente "${item.paciente || 'Cirugía'}"`);
};

// Múltiples Pacientes
const addCirugiaToPatients = (cirugia) => {
  if (!cirugia) return;
  
  pacientes.value.push({
    id: crypto.randomUUID(),
    paciente: cirugia.paciente || '',
    medico: cirugia.medico || '',
    fecha_cx: cirugia.fecha_cirugia || '',
    lugar_entrega: cirugia.institucion || ''
  });

  if (cirugia.cliente && !form.cliente) form.cliente = cirugia.cliente;
  showDropdown.value = false;
  syncFormSummaryWithPatients();
  toast.success(`Paciente "${cirugia.paciente || 'Cirugía'}" agregado a la guía.`);
};

const selectCirugiaSingle = (cirugia) => {
  selectedCirugia.value = cirugia;
  searchQuery.value = cirugia.paciente || '';
  showDropdown.value = false;

  pacientes.value = [{
    id: crypto.randomUUID(),
    paciente: cirugia.paciente || '',
    medico: cirugia.medico || '',
    fecha_cx: cirugia.fecha_cirugia || '',
    lugar_entrega: cirugia.institucion || ''
  }];

  if (cirugia.cliente) form.cliente = cirugia.cliente;
  if (cirugia.medico) form.medico = cirugia.medico;
  if (cirugia.paciente) form.paciente = cirugia.paciente;
  if (cirugia.institucion) form.lugar_entrega = cirugia.institucion;
  if (cirugia.fecha_cirugia) form.fecha_cx = cirugia.fecha_cirugia;
};

const addNewEmptyPatient = () => {
  pacientes.value.push({
    id: crypto.randomUUID(),
    paciente: '',
    medico: form.medico || '',
    fecha_cx: form.fecha_cx || '',
    lugar_entrega: form.lugar_entrega || ''
  });
};

const removePatient = (index) => {
  pacientes.value.splice(index, 1);
  syncFormSummaryWithPatients();
};

const clearAllPatients = () => {
  pacientes.value = [];
  selectedCirugia.value = null;
  form.paciente = '';
  form.medico = '';
  form.lugar_entrega = '';
};

const syncFormSummaryWithPatients = () => {
  if (pacientes.value.length === 0) return;
  const p0 = pacientes.value[0];
  if (pacientes.value.length === 1) {
    form.paciente = p0.paciente || '';
    form.medico = p0.medico || '';
    form.lugar_entrega = p0.lugar_entrega || '';
    form.fecha_cx = p0.fecha_cx || '';
  } else {
    form.paciente = `${p0.paciente || 'Paciente 1'} (+${pacientes.value.length - 1} más)`;
    if (p0.medico) form.medico = p0.medico;
    if (p0.lugar_entrega) form.lugar_entrega = p0.lugar_entrega;
  }
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
      const q = `%${searchQuery.value.trim()}%`;
      const { data, error } = await supabase
        .from('logistica_informe_movimientos')
        .select('id, paciente_snapshot, medico_snapshot, institucion_snapshot, cliente_snapshot, fecha_cirugia_snapshot, id_cirugia_snapshot')
        .or(`paciente_snapshot.ilike.${q},medico_snapshot.ilike.${q},institucion_snapshot.ilike.${q},cliente_snapshot.ilike.${q}`)
        .limit(10);

      if (error) throw error;
      searchResults.value = (data || []).map(m => ({
        id: m.id,
        paciente: m.paciente_snapshot,
        medico: m.medico_snapshot,
        institucion: m.institucion_snapshot,
        cliente: m.cliente_snapshot,
        fecha_cirugia: m.fecha_cirugia_snapshot,
        id_cirugia: m.id_cirugia_snapshot
      }));
    } catch (err) {
      console.error(err);
    } finally {
      isSearching.value = false;
    }
  }, 250);
};

const handleFileDrop = (e) => {
  isDraggingOver.value = false;
  const files = Array.from(e.dataTransfer.files || []);
  if (files.length > 0) {
    processFiles(files);
  }
};

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length > 0) {
    processFiles(files);
  }
  e.target.value = '';
};

const processFiles = async (files) => {
  try {
    isUploadingImages.value = true;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const uuidPath = crypto.randomUUID();

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const baseName = crypto.randomUUID();
      const localObjectUrl = URL.createObjectURL(file);

      let r2ObjectKey = null;

      try {
        const { data: presignedData, error: presignedErr } = await supabase.functions.invoke('b2-presigned-url', {
          body: {
            area: 'guias-envio-temp',
            owner: `${yyyy}/${mm}/${dd}/${uuidPath}`,
            contentType: file.type || 'image/jpeg',
            extension: ext,
            isThumb: false,
            baseName: baseName
          }
        });

        if (!presignedErr && presignedData?.uploadUrl) {
          r2ObjectKey = presignedData.objectKey;
          await fetch(presignedData.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'image/jpeg' }
          });
        }
      } catch (r2Err) {
        console.warn('Fallback a URL local:', r2Err);
      }

      imagenes.value.push({
        id: baseName,
        objectKey: r2ObjectKey,
        url: localObjectUrl,
        file: file,
        size: 'grande',
        rotation: 0
      });
    }

    toast.success(`${files.length} ${files.length === 1 ? 'fotografía añadida' : 'fotografías añadidas'}.`);
  } catch (err) {
    toast.error('Error al cargar imágenes: ' + err.message);
  } finally {
    isUploadingImages.value = false;
  }
};

const moveImageUp = (index) => {
  if (index <= 0) return;
  const temp = imagenes.value[index];
  imagenes.value[index] = imagenes.value[index - 1];
  imagenes.value[index - 1] = temp;
};

const moveImageDown = (index) => {
  if (index >= imagenes.value.length - 1) return;
  const temp = imagenes.value[index];
  imagenes.value[index] = imagenes.value[index + 1];
  imagenes.value[index + 1] = temp;
};

const removeImage = async (index) => {
  const img = imagenes.value[index];
  if (!img) return;

  if (img.url && img.url.startsWith('blob:')) {
    URL.revokeObjectURL(img.url);
  }

  const [removed] = imagenes.value.splice(index, 1);

  if (removed?.objectKey) {
    try {
      await supabase.functions.invoke('b2-presigned-url', {
        body: {
          action: 'delete',
          objectKey: removed.objectKey
        }
      });
    } catch (r2DelErr) {
      console.warn('Advertencia al eliminar objeto de Cloudflare R2:', r2DelErr);
    }
  }
};

const fetchRecentGuides = async () => {
  try {
    loadingHistory.value = true;
    const { data, error } = await supabase
      .from('logistica_guias_envio')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      recentGuides.value = data;
    }
  } catch (err) {
    console.warn('Historial de guías no disponible:', err);
  } finally {
    loadingHistory.value = false;
  }
};

const loadGuideIntoForm = (g) => {
  if (!g) return;
  form.cliente = g.cliente || '';
  form.medico = g.medico || '';
  form.paciente = g.paciente || '';
  form.lugar_entrega = g.lugar_entrega || '';
  form.fecha_cx = g.fecha_cx || '';
  form.fecha_envio = g.fecha_envio || new Date().toISOString().slice(0, 10);
  form.transporte = g.transporte || 'EMA PACK';
  form.numero_guia = g.numero_guia || '';
  form.observaciones = g.observaciones || '';

  if (g.paciente) {
    pacientes.value = [{
      id: crypto.randomUUID(),
      paciente: g.paciente,
      medico: g.medico || '',
      fecha_cx: g.fecha_cx || '',
      lugar_entrega: g.lugar_entrega || ''
    }];
  }

  toast.info(`Datos de guía ${g.numero_guia} cargados en el formulario.`);
  activeStep.value = 1;
};

// Genera la entrada en historial y abre la vista previa interactiva
const generateAndPreviewPDF = async () => {
  if (!form.cliente.trim() || !form.numero_guia.trim() || !form.fecha_envio) {
    toast.error('Por favor completa Cliente, Fecha de Envío y N° de Guía.');
    return;
  }

  syncFormSummaryWithPatients();

  try {
    isGeneratingPDF.value = true;

    try {
      await supabase.from('logistica_guias_envio').insert({
        created_by_user_id: currentUserId.value,
        created_by_nombre: currentUserName.value,
        reporte_id: selectedCirugia.value?.id || null,
        cliente: form.cliente.trim(),
        medico: form.medico.trim() || null,
        paciente: form.paciente.trim() || null,
        lugar_entrega: form.lugar_entrega.trim() || null,
        fecha_cx: form.fecha_cx || null,
        fecha_envio: form.fecha_envio,
        transporte: form.transporte.trim() || null,
        numero_guia: form.numero_guia.trim(),
        observaciones: form.observaciones.trim() || null,
        cantidad_imagenes: imagenes.value.length
      });

      await fetchRecentGuides();
    } catch (dbErr) {
      console.warn('Advertencia al registrar historial:', dbErr);
    }

    // Auto-ajustar zoom a la pantalla si es un monitor chico
    if (window.innerHeight < 900 || window.innerWidth < 1400) {
      zoomOption.value = 'fit';
    }

    showPreviewModal.value = true;
    toast.success('Guía registrada. Vista previa A4 abierta.');

  } catch (err) {
    toast.error('Error al generar vista previa: ' + err.message);
  } finally {
    isGeneratingPDF.value = false;
  }
};

// Descarga directa a archivo PDF con jsPDF y html2canvas
const downloadDirectPDF = async () => {
  try {
    isExportingPDF.value = true;
    toast.info('Generando documento PDF...');

    if (!showPreviewModal.value) {
      showPreviewModal.value = true;
    }

    await new Promise(resolve => setTimeout(resolve, 350));

    const container = document.getElementById('guia-envio-document');
    if (!container) throw new Error('No se encontró el contenedor del documento A4.');

    const pages = container.querySelectorAll('.a4-page');
    if (!pages || pages.length === 0) throw new Error('No hay páginas A4 renderizadas.');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      pdfProgressText.value = `Renderizando Hoja ${i + 1} de ${pages.length}...`;
      const pageEl = pages[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    const cleanNum = (form.numero_guia || 'Districorr').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Guia_Envio_${cleanNum}.pdf`;
    pdf.save(filename);

    toast.success(`Documento PDF "${filename}" descargado.`);
  } catch (err) {
    console.error('Error al descargar PDF:', err);
    toast.error('Error al descargar PDF: ' + err.message);
  } finally {
    isExportingPDF.value = false;
    pdfProgressText.value = '';
  }
};

const triggerPrint = () => {
  window.print();
};

const sendViaOutlook = () => {
  const subject = encodeURIComponent(`Guía de Envío ${form.numero_guia} - ${form.cliente}`);
  const body = encodeURIComponent(
    `Estimados,\n\nSe adjuntan los datos correspondientes a la Guía de Envío N° ${form.numero_guia}:\n\n` +
    `• Cliente: ${form.cliente}\n` +
    `• Médico: ${form.medico || '-'}\n` +
    `• Paciente(s): ${form.paciente || '-'}\n` +
    `• Lugar de Entrega: ${form.lugar_entrega || '-'}\n` +
    `• Fecha CX: ${formatDate(form.fecha_cx)}\n` +
    `• Fecha Envío: ${formatDate(form.fecha_envio)}\n` +
    `• Transporte: ${form.transporte}\n` +
    `• Observaciones: ${form.observaciones || '-'}\n\n` +
    `Saludos cordiales,\nDistricorr Logística Salud`
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

const sendViaGmail = () => {
  const subject = encodeURIComponent(`Guía de Envío ${form.numero_guia} - ${form.cliente}`);
  const body = encodeURIComponent(
    `Estimados,\n\nSe adjuntan los datos correspondientes a la Guía de Envío N° ${form.numero_guia}:\n\n` +
    `• Cliente: ${form.cliente}\n` +
    `• Médico: ${form.medico || '-'}\n` +
    `• Paciente(s): ${form.paciente || '-'}\n` +
    `• Lugar de Entrega: ${form.lugar_entrega || '-'}\n` +
    `• Fecha CX: ${formatDate(form.fecha_cx)}\n` +
    `• Fecha Envío: ${formatDate(form.fecha_envio)}\n` +
    `• Transporte: ${form.transporte}\n` +
    `• Observaciones: ${form.observaciones || '-'}\n\n` +
    `Saludos cordiales,\nDistricorr Logística Salud`
  );
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${subject}&body=${body}`, '_blank');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};

onMounted(async () => {
  window.addEventListener('resize', updateWindowDimensions);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      currentUserId.value = session.user.id;
      currentUserName.value = session.user.user_metadata?.nombre_completo 
        || session.user.user_metadata?.nombre 
        || 'Operario Logística';
    }
    await Promise.all([
      fetchRecentGuides(),
      fetchQuickSurgeries()
    ]);
  } catch (err) {
    console.error(err);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowDimensions);
});
</script>
