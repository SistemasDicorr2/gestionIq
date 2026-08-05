<!-- src/components/ReportDrawer.vue (Fuentes Ajustadas y Ajuste Compacto Ejecutivo) -->
<template>
  <div>
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md">
        <!-- Overlay -->
        <div @click="cancelEdit" class="fixed inset-0"></div>
        
        <!-- Contenido del Modal (Max Width 6xl) -->
        <div class="relative z-50 w-full max-w-6xl bg-white dark:bg-slate-900 h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transform transition-all animate-fadeIn">
          
          <!-- Encabezado Compacto y Maximizado -->
          <div class="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900 flex justify-between items-start gap-3 flex-shrink-0">
            <div class="flex-1 space-y-1.5 min-w-0">
              
              <!-- Fila 1: Badges + Pestañas Integradas a la Derecha -->
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                    {{ isEditing ? 'Modo Edición' : 'Reporte de Cirugía' }}
                  </span>

                  <span v-if="formData?.id_cirugia" class="font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    {{ formData.id_cirugia }}
                  </span>

                  <span v-if="formData?.estado" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {{ formData.estado }}
                  </span>
                </div>

                <!-- Pestañas Integradas en la Línea Superior -->
                <div v-if="!isEditing" class="flex p-0.5 bg-slate-200/70 dark:bg-slate-950/80 rounded-lg">
                  <button 
                    @click="activeTab = 'details'" 
                    class="py-1 px-3 text-[10.5px] font-extrabold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer"
                    :class="activeTab === 'details' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
                  >
                    📋 Detalles
                  </button>
                  <button 
                    @click="activeTab = 'evidence'" 
                    class="py-1 px-3 text-[10.5px] font-extrabold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer"
                    :class="activeTab === 'evidence' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
                  >
                    🖼️ Evidencias
                  </button>
                </div>
              </div>

              <!-- Fila 2: Título del Paciente + Datos Rápidos Claves -->
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                <h2 class="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                  👤 {{ isEditing ? 'Editando Cirugía' : (formData?.paciente || 'Detalles Completos del Reporte') }}
                </h2>

                <div v-if="formData && !isEditing" class="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span v-if="formData.medico" class="inline-flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200 font-medium">
                    👨‍⚕️ {{ formData.medico }}
                  </span>

                  <span v-if="formData.fecha_cirugia" class="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    📅 {{ formatDateDisplay(formData.fecha_cirugia) }}
                  </span>

                  <span v-if="formData.lugar_cirugia" class="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    🏥 {{ formData.lugar_cirugia }}
                  </span>

                  <span v-if="formData.tipo_cirugia" class="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                    🦴 {{ formData.tipo_cirugia }}
                  </span>
                </div>
              </div>

            </div>

            <button 
              @click="cancelEdit" 
              class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer" 
              aria-label="Cerrar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Cuerpo con Scroll y Jerarquía Visual Repriorizada -->
          <div v-if="formData" class="flex-grow p-4 overflow-y-auto bg-white dark:bg-slate-900 space-y-4">
            
            <!-- Vista de Detalles y Edición -->
            <div v-show="activeTab === 'details' || isEditing" class="space-y-4">
              
              <!-- ================================================================= -->
              <!-- PRIORIDAD 1 (BLOQUE HERO): CONSUMO Y OBSERVACIONES                 -->
              <!-- ================================================================= -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                <!-- TARJETA 1: CONSUMO REALIZADO (PROMINENTE Y EN PRIMER PLANO) -->
                <div class="p-4 bg-gradient-to-br from-blue-50/90 to-slate-50 dark:from-blue-950/40 dark:to-slate-950/40 rounded-2xl border-2 border-blue-500/30 dark:border-blue-700/50 shadow-2xs space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        📦
                      </span>
                      <div>
                        <h3 class="text-[11px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                          Consumo Realizado
                        </h3>
                        <p class="text-[9.5px] text-blue-700/70 dark:text-blue-400/70 font-semibold">Insumos y prótesis utilizadas</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-200/70 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                      Prioritario
                    </span>
                  </div>

                  <div class="pt-0.5">
                    <EditableField 
                      v-if="isEditing" 
                      label="" 
                      v-model="formData.consumo_realizado" 
                      :is-editing="true" 
                      type="textarea" 
                      :show-label="false" 
                    />
                    <div v-else class="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-blue-200/80 dark:border-blue-900/60 shadow-2xs">
                      <p v-if="formData.consumo_realizado" class="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                        {{ formData.consumo_realizado }}
                      </p>
                      <p v-else class="text-[11px] italic text-slate-400">Sin registro de consumo detallado.</p>
                    </div>
                  </div>
                </div>

                <!-- TARJETA 2: OBSERVACIONES GENERALES -->
                <div class="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      💬
                    </span>
                    <div>
                      <h3 class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Observaciones y Novedades
                      </h3>
                      <p class="text-[9.5px] text-slate-500 font-semibold">Comentarios operativos de la intervención</p>
                    </div>
                  </div>

                  <div>
                    <EditableField 
                      v-if="isEditing" 
                      label="" 
                      v-model="formData.observaciones" 
                      :is-editing="true" 
                      type="textarea" 
                      :show-label="false" 
                    />
                    <div v-else class="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p v-if="formData.observaciones" class="text-xs font-medium text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap">
                        "{{ formData.observaciones }}"
                      </p>
                      <p v-else class="text-[11px] italic text-slate-400">Sin observaciones registradas.</p>
                    </div>
                  </div>
                </div>

              </div>

              <!-- ================================================================= -->
              <!-- PRIORIDAD 2: 4 COLUMNAS DE DETALLES COMPLEMENTARIOS (FUENTES FUERTES FUERTES) -->
              <!-- ================================================================= -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                
                <!-- SECCIÓN 1: DATOS DE LA CIRUGÍA -->
                <div class="space-y-1.5">
                  <div class="flex items-center gap-1 px-1">
                    <span class="text-[11px]">🏥</span>
                    <h3 class="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Datos de la Cirugía
                    </h3>
                  </div>

                  <div class="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
                    <EditableField v-if="isEditing" label="Paciente" v-model="formData.paciente" :is-editing="true" is-bold />
                    <EditableField v-else label="Paciente" :model-value="formData.paciente" :is-editing="false" is-bold />
                    
                    <EditableField v-if="isEditing" label="Médico" v-model="formData.medico" :is-editing="true" />
                    <EditableField v-else label="Médico" :model-value="formData.medico" :is-editing="false" />
                    
                    <EditableField v-if="isEditing" label="Tipo de Cirugía" v-model="formData.tipo_cirugia" :is-editing="true" />
                    <EditableField v-else label="Tipo de Cirugía" :model-value="formData.tipo_cirugia" :is-editing="false" />
                    
                    <EditableField v-if="isEditing" label="Fecha" v-model="formData.fecha_cirugia" :is-editing="true" type="date" />
                    <EditableField v-else label="Fecha" :model-value="formData.fecha_cirugia" :is-editing="false" type="date" />
                    
                    <EditableField v-if="isEditing" label="Lugar" v-model="formData.lugar_cirugia" :is-editing="true" />
                    <EditableField v-else label="Lugar" :model-value="formData.lugar_cirugia" :is-editing="false" />
                    
                    <EditableField v-if="isEditing" label="ID Cirugía" v-model="formData.id_cirugia" :is-editing="true" />
                    <EditableField v-else label="ID Cirugía" :model-value="formData.id_cirugia" :is-editing="false" />
                  </div>
                </div>

                <!-- SECCIÓN 2: INFORME DEL INSTRUMENTADOR -->
                <div class="space-y-1.5">
                  <div class="flex items-center gap-1 px-1">
                    <span class="text-[11px]">🩺</span>
                    <h3 class="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Informe Instrumentador
                    </h3>
                  </div>

                  <div class="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
                    <EditableField label="Completado por" :model-value="formData.instrumentador_completado" :is-editing="false" is-bold />
                    <EditableField label="DNI" :model-value="formData.instrumentador_dni" :is-editing="false" />
                    
                    <EditableField v-if="isEditing" label="Set Completo" v-model="formData.set_completo" :is-editing="true" type="boolean" />
                    <EditableField v-else label="Set Completo" :model-value="formData.set_completo" :is-editing="false" type="boolean" />
                    
                    <template v-if="formData.set_completo === false || isEditing">
                      <EditableField v-if="isEditing" label="Informó Faltante" v-model="formData.informe_faltante" :is-editing="true" type="boolean" />
                      <EditableField v-else label="Informó Faltante" :model-value="formData.informe_faltante" :is-editing="false" type="boolean" />
                    </template>
                  </div>
                </div>

                <!-- SECCIÓN 3: EVALUACIÓN Y PUNTAJE IQ -->
                <div class="space-y-1.5">
                  <div class="flex items-center gap-1 px-1">
                    <span class="text-[11px]">⭐</span>
                    <h3 class="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Evaluación / Puntaje IQ
                    </h3>
                  </div>

                  <div class="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                    <RatingRow label="Puntualidad" :rating="formData.rating_puntualidad" />
                    <RatingRow label="Condiciones" :rating="formData.rating_condiciones" />
                    <RatingRow label="Asesoramiento" :rating="formData.rating_asesoramiento" />
                    <RatingRow label="General" :rating="formData.rating_evaluacion_general" is-bold />
                  </div>
                </div>

                <!-- SECCIÓN 4: LOGÍSTICA Y LOGUEO -->
                <div class="space-y-1.5">
                  <div class="flex items-center gap-1 px-1">
                    <span class="text-[11px]">🚚</span>
                    <h3 class="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Logística y Logueo
                    </h3>
                  </div>

                  <div class="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
                    <EditableField v-if="isEditing" label="Representante" v-model="formData.representante_ventas" :is-editing="true" simple />
                    <EditableField v-else label="Representante" :model-value="formData.representante_ventas" :is-editing="false" simple />
                    
                    <EditableField v-if="isEditing" label="Duración Cirugía" v-model="formData.duracion_cirugia" :is-editing="true" simple />
                    <EditableField v-else label="Duración Cirugía" :model-value="formData.duracion_cirugia" :is-editing="false" simple />
                    
                    <EditableField v-if="isEditing" label="Logística" v-model="formData.tipo_logistica" :is-editing="true" simple />
                    <EditableField v-else label="Logística" :model-value="formData.tipo_logistica" :is-editing="false" simple />
                    
                    <EditableField v-if="isEditing" label="Transporte" v-model="formData.transporte_utilizado" :is-editing="true" simple />
                    <EditableField v-else label="Transporte" :model-value="formData.transporte_utilizado" :is-editing="false" simple />
                  </div>
                </div>

              </div>

              <!-- ================================================================= -->
              <!-- PRIORIDAD 3: FIRMA DEL PROFESIONAL COMO OPCIÓN DESPLEGABLE        -->
              <!-- ================================================================= -->
              <div v-if="formData.url_firma && !isEditing" class="pt-1">
                <div class="border border-slate-200/70 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
                  <button 
                    type="button"
                    @click="showSignatureDropdown = !showSignatureDropdown"
                    class="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span class="flex items-center gap-1.5 text-[11px]">
                      <span>✍️</span>
                      <span>Firma del Profesional</span>
                    </span>
                    <span class="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                      <span>{{ showSignatureDropdown ? 'Ocultar' : 'Ver Firma' }}</span>
                      <svg :class="{'rotate-180': showSignatureDropdown}" class="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </span>
                  </button>

                  <div v-show="showSignatureDropdown" class="p-3 border-t border-slate-200/70 dark:border-slate-800 flex flex-col items-center animate-fadeIn">
                    <img :src="formData.url_firma" alt="Firma" class="h-24 object-contain filter dark:invert" />
                    <button @click="downloadSignature" class="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors uppercase tracking-wider cursor-pointer">
                      📥 Descargar Firma
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Contenedor para las pestañas secundarias (Evidencias y Archivos) -->
            <div v-show="activeTab === 'evidence' && !isEditing">
              <ReportTabs 
                :report-id="formData.id"
                :owner-id="formData.instrumentador_dni"
              />
            </div>
          </div>

          <!-- Pie del Modal (Mobile-First / Responsive / Tactile Glassmorphism) -->
          <div class="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0 rounded-b-3xl">
            
            <div class="flex flex-wrap items-center gap-2">
              <!-- Botón Eliminar -->
              <button 
                v-if="!isEditing" 
                @click="startDeleteConfirmation" 
                class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                title="Eliminar esta cirugía"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Eliminar</span>
              </button>

              <button 
                v-if="!isEditing" 
                @click="isEditing = true" 
                class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                ✏️ Editar Reporte
              </button>

              <button 
                v-else 
                @click="cancelEdit" 
                class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancelar Edición
              </button>

              <div v-if="!isEditing" class="inline-flex">
                <button 
                  v-if="!hasIntervention" 
                  @click="isInterventionModalOpen = true" 
                  class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/60 hover:bg-purple-100 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  🟣 Registrar Intervención Clave
                </button>
                <span v-else class="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200/60 dark:border-purple-900/50">
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Intervención Registrada
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                v-if="isEditing" 
                @click="saveChanges" 
                :disabled="isSaving" 
                class="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
              >
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>{{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>

              <button 
                v-else 
                @click="generatePDF" 
                :disabled="isGeneratingPdf || reporte?.estado !== 'Enviado'" 
                class="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                :class="{'opacity-50 cursor-not-allowed': reporte?.estado !== 'Enviado'}"
              >
                <svg v-if="isGeneratingPdf" class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>{{ isGeneratingPdf ? 'Generando...' : 'Descargar PDF' }}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </Transition>

    <div v-if="formData" :class="isGeneratingPdf ? 'fixed top-0 -left-[9999px]' : 'hidden'">
      <ReportPDF 
        :reporte="formData" 
        :instrumentador-dni="formData.instrumentador_dni" 
        :pdf-version="currentPdfVersion"
        ref="pdfComponentRef" />
    </div>

    <RegistrarIntervencionModal
      :show="isInterventionModalOpen"
      :reporte="formData"
      @close="isInterventionModalOpen = false"
      @confirm="handleRegisterIntervention"
    />

    <!-- Modal de Confirmación de Eliminación -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteConfirmState" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4" @click.self="cancelDelete">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
            <!-- Encabezado -->
            <div class="p-4 border-b dark:border-slate-800 flex items-center gap-3">
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-base font-bold">
                ⚠️
              </span>
              <div>
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">Confirmar Eliminación</h3>
                <p class="text-[11px] text-slate-500">Esta acción es permanente e irreversible</p>
              </div>
            </div>

            <!-- Cuerpo -->
            <div class="p-4 space-y-2.5">
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente la cirugía del paciente <strong>{{ formData?.paciente }}</strong> (ID: {{ formData?.id_cirugia || 'Sin ID' }})?
              </p>
              <div class="p-2.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl">
                <p class="text-[10.5px] text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <span>ℹ️</span> Se borrarán todos los datos y evidencias registradas de esta cirugía.
                </p>
              </div>
            </div>

            <!-- Pie del modal -->
            <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t dark:border-slate-800 flex justify-end gap-2.5 rounded-b-3xl">
              <button 
                @click="cancelDelete" 
                :disabled="isDeleting"
                class="px-3.5 py-1.5 text-[11px] font-extrabold text-slate-700 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                @click="confirmDelete" 
                :disabled="deleteCountdown > 0 || isDeleting"
                class="px-3.5 py-1.5 text-[11px] font-extrabold text-white bg-rose-600 border border-transparent rounded-lg shadow-xs hover:bg-rose-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-w-[120px] justify-center cursor-pointer"
              >
                <svg v-if="isDeleting" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>
                  {{ deleteCountdown > 0 ? `Confirmar (${deleteCountdown}s)` : (isDeleting ? 'Eliminando...' : 'Sí, Eliminar') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, defineAsyncComponent } from 'vue';
import { supabase } from '../services/supabase.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToasts } from '../composables/useToasts';

import ReportTabs from './report-details/ReportTabs.vue';
import RegistrarIntervencionModal from './admin/RegistrarIntervencionModal.vue';

const EditableField = defineAsyncComponent(() => import('./EditableField.vue'));
const RatingRow = defineAsyncComponent(() => import('./RatingRow.vue'));
const ReportPDF = defineAsyncComponent(() => import('./ReportPDF.vue'));

const props = defineProps({ show: Boolean, reporte: Object });
const emit = defineEmits(['close', 'updated']);

const { showSuccessToast, showErrorToast, showLoadingToast, updateToast } = useToasts();
const activeTab = ref('details');
const isEditing = ref(false);
const isSaving = ref(false);
const formData = ref(null);
const currentPdfVersion = ref(null);
const isInterventionModalOpen = ref(false);
const hasIntervention = ref(false);
const showSignatureDropdown = ref(false);

const checkExistingIntervention = async (reporteId) => {
  if (!reporteId) {
    hasIntervention.value = false;
    return;
  }
  try {
    const { data, error } = await supabase
      .from('intervenciones_clave')
      .select('id')
      .eq('reporte_id', reporteId)
      .maybeSingle();
    
    hasIntervention.value = !!data && !error;
  } catch (err) {
    hasIntervention.value = false;
  }
};

watch(() => props.show, (isVisible) => {
  if (isVisible && props.reporte) {
    activeTab.value = 'details';
    currentPdfVersion.value = null;
    showSignatureDropdown.value = false;
    checkExistingIntervention(props.reporte.id);
  }
});

watch(() => props.reporte, (newReporte) => {
  if (newReporte) {
    formData.value = JSON.parse(JSON.stringify(newReporte));
    checkExistingIntervention(newReporte.id);
  } else {
    formData.value = null;
    hasIntervention.value = false;
  }
}, { deep: true, immediate: true });

const handleRegisterIntervention = async () => {
  if (!formData.value) return;
  
  const loadingToastId = showLoadingToast("Registrando intervención...");
  try {
    const { data, error } = await supabase.rpc('registrar_intervencion_clave', {
      p_reporte_id: formData.value.id,
      p_instrumentador_dni: formData.value.instrumentador_dni
    });

    if (error) throw error;

    if (data) {
      updateToast(loadingToastId, "¡Intervención Clave registrada con éxito!", 'success');
      hasIntervention.value = true;
    } else {
      updateToast(loadingToastId, "Esta cirugía ya tenía una intervención registrada.", 'info');
      hasIntervention.value = true;
    }

  } catch (err) {
    updateToast(loadingToastId, `Error al registrar: ${err.message}`, 'error');
  } finally {
    isInterventionModalOpen.value = false;
  }
};

const close = () => {
  isEditing.value = false;
  activeTab.value = 'details';
  showSignatureDropdown.value = false;
  cancelDelete();
  emit('close');
};

const cancelEdit = () => {
  if (isEditing.value) {
    formData.value = JSON.parse(JSON.stringify(props.reporte));
    isEditing.value = false;
  } else {
    close();
  }
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

// Lógica de Eliminación con Cuenta Regresiva
const deleteConfirmState = ref(false);
const deleteCountdown = ref(0);
const isDeleting = ref(false);
let deleteInterval = null;

const startDeleteConfirmation = () => {
  deleteConfirmState.value = true;
  deleteCountdown.value = 3;
  if (deleteInterval) clearInterval(deleteInterval);
  
  deleteInterval = setInterval(() => {
    if (deleteCountdown.value > 0) {
      deleteCountdown.value--;
    } else {
      clearInterval(deleteInterval);
      deleteInterval = null;
    }
  }, 1000);
};

const cancelDelete = () => {
  if (deleteInterval) {
    clearInterval(deleteInterval);
    deleteInterval = null;
  }
  deleteConfirmState.value = false;
  deleteCountdown.value = 0;
};

const confirmDelete = async () => {
  if (deleteCountdown.value > 0 || !formData.value) return;
  isDeleting.value = true;
  const loadingToastId = showLoadingToast("Eliminando cirugía...");
  try {
    const { error } = await supabase
      .from('reportes')
      .delete()
      .eq('id', formData.value.id);

    if (error) throw error;

    updateToast(loadingToastId, "¡Cirugía eliminada con éxito!", 'success');
    emit('updated');
    close();
  } catch (err) {
    console.error("Error al eliminar cirugía:", err);
    updateToast(loadingToastId, `Error al eliminar la cirugía: ${err.message}`, 'error');
  } finally {
    isDeleting.value = false;
    deleteConfirmState.value = false;
  }
};

const saveChanges = async () => {
  if (!formData.value) return;
  isSaving.value = true;
  try {
    const updateData = { ...formData.value };
    delete updateData.total_count;
    delete updateData.short_links;
    delete updateData.instrumentador_nombre;
    const { id, created_at, token, url_firma, instrumentadores, ...finalUpdateData } = updateData;
    const { error } = await supabase.from('reportes').update(finalUpdateData).eq('id', id);
    if (error) throw error;
    showSuccessToast('Reporte actualizado con éxito.');
    emit('updated');
    close();
  } catch (err) {
    showErrorToast(err, 'Error al actualizar el reporte.');
  } finally {
    isSaving.value = false;
  }
};

const isGeneratingPdf = ref(false);
const pdfComponentRef = ref(null);

const generatePDF = async () => {
  if (!props.reporte) return;
  isGeneratingPdf.value = true;
  try {
    const { data: version, error: rpcError } = await supabase.rpc('log_pdf_generation', {
      p_reporte_id: props.reporte.id
    });
    if (rpcError) throw rpcError;
    currentPdfVersion.value = version;
    showSuccessToast(`Generando PDF Versión ${version}...`);
    await new Promise(resolve => setTimeout(resolve, 50));
    const pdfElement = pdfComponentRef.value?.pdfTemplateRef;
    if (!pdfElement) throw new Error("Elemento de PDF no encontrado.");
    const canvas = await html2canvas(pdfElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const ratio = canvas.width / canvas.height;
    let imgHeight = pdfWidth / ratio;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
    pdf.save(`Reporte-${props.reporte.id_cirugia || props.reporte.id}-V${version}.pdf`);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    showErrorToast(error, 'Hubo un error al generar el PDF.');
  } finally {
    isGeneratingPdf.value = false;
  }
};

const downloadSignature = () => {
  if (!formData.value?.url_firma) return;
  fetch(formData.value.url_firma)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `firma-${formData.value.id_cirugia || formData.value.id}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(() => showErrorToast('No se pudo descargar la firma.'));
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>