<!-- src/views/logistica/GuiaEnvioLogisticaView.vue -->
<template>
  <div class="max-w-5xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-24">
    
    <!-- HEADER Y NAVEGACIÓN -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4 print:hidden">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            REG03-01-01-C
          </span>
          <h1 class="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Guía de Envío de Materiales
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generador documental de guías de despacho para instrumental, implantes y equipos médicos.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <router-link 
          :to="{ name: 'LogisticaInformes' }" 
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver a Logística</span>
        </router-link>
      </div>
    </div>

    <!-- CONTENEDOR PRINCIPAL INTERACTIVO (OCULTO EN IMPRESIÓN) -->
    <div class="space-y-6 print:hidden">
      
      <!-- PASO 1: DATOS DEL FORMULARIO Y BÚSQUEDA READ-ONLY -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Datos de la Guía de Envío
            </h2>
          </div>
          <span class="text-[11px] text-slate-400 italic">
            * Consulta de cirugías 100% Read-Only (sin alterar la BD)
          </span>
        </div>

        <!-- BUSCADOR READ-ONLY DE PACIENTE / CIRUGÍA CON SOPORTE MULTI-PACIENTE -->
        <div class="space-y-2 relative">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              🔎 Buscar y Agregar Cirugías / Pacientes
            </label>
            <button 
              type="button" 
              @click="addNewEmptyPatient"
              class="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>+ Agregar Paciente Manual</span>
            </button>
          </div>

          <!-- LISTA DE PACIENTES INCLUIDOS EN LA GUÍA (MULTI-PACIENTE) -->
          <div v-if="pacientes.length > 0" class="space-y-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1.5">
              <span>👥 Pacientes Incluidos en este Despacho ({{ pacientes.length }})</span>
              <button type="button" @click="clearAllPatients" class="text-[10px] text-rose-600 dark:text-rose-400 hover:underline">Limpiar Lista</button>
            </div>

            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div 
                v-for="(p, pIdx) in pacientes" 
                :key="p.id || pIdx"
                class="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
              >
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full text-xs">
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">PACIENTE *</span>
                    <input v-model="p.paciente" type="text" placeholder="Ej: Ortiz Leandro" class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold dark:text-white" />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">MÉDICO</span>
                    <input v-model="p.medico" type="text" placeholder="Ej: Dr. González" class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium dark:text-white" />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">FECHA CX</span>
                    <input v-model="p.fecha_cx" type="date" class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium dark:text-white" />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold">SANATORIO / DESTINO</span>
                    <input v-model="p.lugar_entrega" type="text" placeholder="Ej: Sanatorio Vinto" class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium dark:text-white" />
                  </div>
                </div>

                <button 
                  type="button" 
                  @click="removePatient(pIdx)" 
                  class="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded self-end sm:self-center shrink-0 cursor-pointer"
                  title="Quitar este paciente"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Input de búsqueda con dropdown interactivo -->
          <div class="relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar por paciente, médico o sanatorio para agregar a la guía..." 
              @input="onSearchInput"
              @focus="showDropdown = true"
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>

            <!-- Dropdown de resultados -->
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

        <!-- FORMULARIO EDITABLE DE LA GUÍA DE ENVÍO -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
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
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">N° DE GUÍA *</label>
            <input v-model="form.numero_guia" type="text" placeholder="Ej: R-0044-00000771" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-mono font-bold" />
          </div>

          <div class="sm:col-span-2">
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">OBSERVACIONES GENERALES (HOJA 1)</label>
            <textarea v-model="form.observaciones" rows="2" placeholder="Ej: ENVIO DE INSTRUMENTAL PARA REPARACION Y ACONDICIONAMIENTO" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium"></textarea>
          </div>
        </div>
      </div>

      <!-- PASO 2: ADJUNTO Y REORDENAMIENTO DE FOTOGRAFÍAS CON MODAL DE TAMAÑOS -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">2</span>
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Fotografías del Instrumental / Cajas ({{ imagenes.length }})
            </h2>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button 
              v-if="imagenes.length > 0"
              type="button" 
              @click="toggleAllImageSizes" 
              class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              📐 Todas: {{ allImagesAreGrande ? 'Compactas' : 'Grandes (+15%)' }}
            </button>

            <label class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>+ Agregar Fotos</span>
              <input type="file" accept="image/*" multiple @change="handleImageUpload" class="hidden" />
            </label>
          </div>
        </div>

        <div v-if="isUploadingImages" class="p-4 text-center text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 animate-pulse">
          ⏳ Subiendo imágenes temporales a R2...
        </div>

        <div v-if="imagenes.length === 0" class="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-2">
          <svg class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="text-xs font-bold block">No hay imágenes adjuntas</span>
          <p class="text-[11px] text-slate-500">Subí fotos de las bandejas o recipientes. Cada foto se ubicará automáticamente en su propia hoja A4 en el PDF.</p>
        </div>

        <!-- GALERÍA DE MINIATURAS CON SELECTOR RÁPIDO DE TAMAÑO -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div 
            v-for="(img, idx) in imagenes" 
            :key="img.id || idx"
            class="group relative bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col items-center gap-2 shadow-2xs"
          >
            <div class="w-full h-36 bg-slate-900/5 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative">
              <img :src="img.url" class="max-w-full max-h-full object-contain mx-auto my-auto block" />
              
              <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-white font-mono text-[10px] font-black">
                Hoja {{ Math.floor(idx / 2) + 2 }} (#{{ idx + 1 }})
              </span>

              <!-- Badge de tamaño interactivo -->
              <button 
                type="button" 
                @click="openImageSizeModal(img)"
                class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shadow-md cursor-pointer transition-transform hover:scale-105"
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
                  title="Mover foto arriba / antes"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                
                <button 
                  type="button" 
                  @click="moveImageDown(idx)" 
                  :disabled="idx === imagenes.length - 1"
                  class="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                  title="Mover foto abajo / después"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

              <div class="flex items-center gap-1">
                <button 
                  type="button" 
                  @click="openImageSizeModal(img)" 
                  class="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer"
                  title="Ajustar tamaño"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
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
      </div>

      <!-- PASO 3: BOTÓN DE GENERACIÓN DE GUÍA Y APERTURA DE VISTA PREVIA -->
      <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="space-y-0.5 text-center sm:text-left">
          <h3 class="text-sm font-black text-slate-900 dark:text-white">
            Generar Guía de Envío y Vista Previa
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Se registrará la entrada en el historial de guías y se abrirá la vista previa formal del documento A4.
          </p>
        </div>

        <button 
          type="button" 
          @click="generateAndPreviewPDF" 
          :disabled="isGeneratingPDF || !form.cliente.trim() || !form.fecha_envio || !form.numero_guia.trim()"
          class="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 w-full sm:w-auto min-h-[44px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>{{ isGeneratingPDF ? 'Guardando Registro...' : '👁️ Ver Vista Previa del Documento' }}</span>
        </button>
      </div>

      <!-- SECCIÓN DE ÚLTIMAS GUÍAS GENERADAS (HISTORIAL CENTRALIZADO EN SUPABASE) -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            📋 Últimas Guías Generadas en Districorr (Historial)
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
          <img :src="selectedImageForModal.url" class="max-w-full max-h-full object-contain" />
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
              <span class="text-[10px] text-slate-500">Altura ampliada (~118mm). Mayor nitidez y detalle visual.</span>
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

    <!-- MODAL DE VISTA PREVIA INTERACTIVA DEL DOCUMENTO A4 (ESCALADO, EMAIL Y NOTAS POR HOJA) -->
    <div 
      v-if="showPreviewModal" 
      class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 print:p-0 print:bg-white print:static"
    >
      <!-- BARRA SUPERIOR DE ACCIONES -->
      <div class="w-full max-w-5xl bg-slate-900 border border-slate-800 text-white rounded-2xl p-3 sm:p-4 mb-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
            REG03-01-01-C
          </span>
          <div>
            <h3 class="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>Vista Previa de Guía de Envío</span>
              <span class="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-blue-300">Escala: {{ isScaledDown ? '85%' : '100%' }}</span>
            </h3>
            <p class="text-[11px] text-slate-400 hidden sm:block">
              N° Guía: {{ form.numero_guia }} • Cliente: {{ form.cliente }}
            </p>
          </div>
        </div>

        <!-- BOTONES DE ACCIÓN -->
        <div class="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          <!-- BOTÓN TOGGLE EDICIÓN EN PANTALLA SOBRE LA HOJA A4 -->
          <button 
            type="button" 
            @click="isEditableInPreview = !isEditableInPreview" 
            class="px-3 py-1.5 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
            :class="isEditableInPreview ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
            :title="isEditableInPreview ? 'Desactivar edición en hoja' : 'Activar edición haciendo clic directo en el documento A4'"
          >
            <span>✏️ Edición Directa {{ isEditableInPreview ? 'ON' : 'OFF' }}</span>
          </button>

          <!-- PANEL TOGGLE EDITAR NOTAS POR PÁGINA -->
          <button 
            type="button" 
            @click="showNotesPanel = !showNotesPanel" 
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
            :class="{ 'ring-2 ring-blue-500 bg-slate-700': showNotesPanel }"
          >
            <span>📝 Edit. Notas/Página</span>
          </button>

          <!-- ZOOM TOGGLE (85% / 100%) -->
          <button 
            type="button" 
            @click="isScaledDown = !isScaledDown" 
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
          >
            <span>🔍 Zoom {{ isScaledDown ? '85%' : '100%' }}</span>
          </button>

          <!-- DROPDOWN ENVIAR POR EMAIL -->
          <div class="relative group">
            <button 
              type="button" 
              class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span>📧 Enviar Guía</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>

            <div class="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 min-w-[170px]">
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

          <!-- IMPRIMIR / DESCARGAR PDF -->
          <button 
            type="button" 
            @click="triggerPrint" 
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>🖨️ Imprimir / PDF</span>
          </button>

          <!-- EDITAR -->
          <button 
            type="button" 
            @click="showPreviewModal = false" 
            class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            ✏️ Cerrar Vista Previa
          </button>
        </div>
      </div>

      <!-- PANEL DESPLEGABLE DE EDICIÓN DE NOTAS POR PÁGINA EN TIEMPO REAL -->
      <div v-if="showNotesPanel" class="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 text-white space-y-3 shrink-0 print:hidden shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black uppercase text-blue-400 tracking-wider">📝 Configuración de Observaciones / Notas por Hoja</span>
            <span class="text-[10px] text-slate-400">(Se actualiza en tiempo real en la hoja A4)</span>
          </div>
          <button type="button" @click="showNotesPanel = false" class="text-xs text-slate-400 hover:text-white">Cerrar Panel ✕</button>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <button 
            v-for="pNum in totalPagesCount" 
            :key="pNum"
            type="button"
            @click="activePageNoteTab = pNum"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
            :class="activePageNoteTab === pNum ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            Hoja {{ pNum }} {{ pNum === 1 ? '(Principal)' : `(Fotos #${(pNum-2)*2+1}-${(pNum-2)*2+2})` }}
          </button>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-300 mb-1">
            Nota / Observación para Hoja {{ activePageNoteTab }}:
          </label>
          <textarea 
            v-model="notasPaginas[activePageNoteTab]"
            rows="2"
            :placeholder="activePageNoteTab === 1 ? 'Observaciones generales del despacho...' : `Escribí una observación específica para la Hoja ${activePageNoteTab}...`"
            class="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-medium"
          ></textarea>
        </div>
      </div>

      <!-- CONTENEDOR DEL DOCUMENTO FORMATO HOJA A4 CON ESCALADO EN VISTA PREVIA -->
      <div class="w-full flex justify-center items-start overflow-x-auto pb-12 print:p-0">
        <div 
          class="transition-transform duration-200 origin-top bg-white rounded-2xl shadow-2xl print:shadow-none print:transform-none print:w-full print:max-w-none"
          :style="{ transform: isScaledDown ? 'scale(0.85)' : 'scale(1)', width: '210mm', maxWidth: '100%' }"
        >
          <GuiaEnvioPDF :guia="form" :imagenes="imagenes" :pacientes="pacientes" :notas-paginas="notasPaginas" :editable="isEditableInPreview" />
        </div>
      </div>
    </div>

    <!-- DOCUMENTO OCULTO PARA IMPRESIÓN DIRECTA SI NO ESTÁ EL MODAL -->
    <div v-else class="hidden print:block w-full">
      <GuiaEnvioPDF :guia="form" :imagenes="imagenes" :pacientes="pacientes" :notas-paginas="notasPaginas" />
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import GuiaEnvioPDF from '../../components/logistica/GuiaEnvioPDF.vue';

const toast = useToast();

const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const showDropdown = ref(false);
const selectedCirugia = ref(null);

const pacientes = ref([]); // Lista de múltiples pacientes

const imagenes = ref([]);
const isUploadingImages = ref(false);
const isGeneratingPDF = ref(false);
const showPreviewModal = ref(false);
const isScaledDown = ref(true);
const isEditableInPreview = ref(true); // Permite editar in-situ sobre el PDF en vista previa

const selectedImageForModal = ref(null);

// Notas y observaciones por página
const notasPaginas = reactive({});
const showNotesPanel = ref(false);
const activePageNoteTab = ref(1);

const recentGuides = ref([]);
const loadingHistory = ref(false);
const currentUserId = ref(null);
const currentUserName = ref('');

const form = reactive({
  cliente: 'BIOPROTECE',
  medico: '',
  paciente: '',
  lugar_entrega: '',
  fecha_cx: '',
  fecha_envio: new Date().toISOString().slice(0, 10),
  transporte: 'EMA PACK',
  numero_guia: `R-0044-${Math.floor(10000000 + Math.random() * 90000000)}`,
  observaciones: 'ENVIO DE INSTRUMENTAL PARA REPARACION Y ACONDICIONAMIENTO'
});

const totalPagesCount = computed(() => {
  return 1 + Math.ceil((imagenes.value.length || 0) / 2);
});

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

const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

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
        size: 'grande' // Por defecto tamaño Grande (+15%)
      });
    }

    toast.success(`${files.length} ${files.length === 1 ? 'fotografía añadida' : 'fotografías añadidas'}.`);
  } catch (err) {
    toast.error('Error al cargar imágenes: ' + err.message);
  } finally {
    isUploadingImages.value = false;
    e.target.value = '';
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

    showPreviewModal.value = true;
    toast.success('Guía generada. Abriendo vista previa del documento...');

  } catch (err) {
    toast.error('Error al generar vista previa: ' + err.message);
  } finally {
    isGeneratingPDF.value = false;
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
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      currentUserId.value = session.user.id;
      currentUserName.value = session.user.user_metadata?.nombre_completo 
        || session.user.user_metadata?.nombre 
        || 'Operario Logística';
    }
    await fetchRecentGuides();
  } catch (err) {
    console.error(err);
  }
});
</script>
