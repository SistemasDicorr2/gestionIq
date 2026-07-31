<!-- src/components/ReportDrawer.vue -->
<template>
  <div>
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-40 flex items-center justify-center p-4">
        <!-- Overlay -->
        <div @click="cancelEdit" class="fixed inset-0 bg-black bg-opacity-70 transition-opacity"></div>
        
        <!-- 
          Contenido del Modal 
          --- CAMBIO: Se aumenta el ancho máximo del modal. ---
          - Se cambió 'max-w-3xl' por 'max-w-4xl' para darle más espacio horizontal.
        -->
        <div class="relative z-50 w-full max-w-6xl bg-white h-[94vh] flex flex-col rounded-2xl shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          
          <!-- Cabecera -->
          <div class="p-5 border-b flex justify-between items-center flex-shrink-0 dark:border-slate-800">
            <h2 class="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {{ isEditing ? 'Editando Reporte' : 'Detalles Completos del Reporte' }}
            </h2>
            <button @click="cancelEdit" class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer text-lg font-bold" aria-label="Cerrar">&times;</button>
          </div>

          <!-- Barra de Pestañas Principal (Pills Premium) -->
          <div v-if="!isEditing" class="px-6 py-3.5 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/60">
            <div class="flex p-1 bg-slate-100 dark:bg-slate-950/40 rounded-xl w-fit">
              <button 
                @click="activeTab = 'details'" 
                class="py-2 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer"
                :class="activeTab === 'details' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
              >
                Detalles
              </button>
              <button 
                @click="activeTab = 'evidence'" 
                class="py-2 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer"
                :class="activeTab === 'evidence' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
              >
                Evidencias y Más
              </button>
            </div>
          </div>

          <!-- Cuerpo con Scroll -->
          <div v-if="formData" class="flex-grow p-6 overflow-y-auto bg-white dark:bg-slate-900 space-y-6">
            <!-- Pestaña/Vista de Detalles y Edición -->
            <div v-show="activeTab === 'details' || isEditing" class="space-y-6">
              <section class="space-y-6 text-sm">
                <!-- Datos de la Cirugía -->
                <div class="space-y-2">
                  <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Datos de la Cirugía</h3>
                  <div class="p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
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

                <!-- Informe del Instrumentador -->
                <div class="space-y-2">
                  <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Informe del Instrumentador</h3>
                  <div class="p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
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

                <!-- Evaluación -->
                <div class="space-y-2">
                  <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Evaluación</h3>
                  <div class="p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                    <RatingRow label="Puntualidad" :rating="formData.rating_puntualidad" />
                    <RatingRow label="Condiciones" :rating="formData.rating_condiciones" />
                    <RatingRow label="Asesoramiento" :rating="formData.rating_asesoramiento" />
                    <RatingRow label="General" :rating="formData.rating_evaluacion_general" is-bold />
                  </div>
                </div>

                <!-- Datos Adicionales -->
                <div class="space-y-4">
                  <div class="space-y-2">
                    <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Consumo Realizado</h3>
                    <div class="p-5 bg-blue-50/40 rounded-2xl border border-blue-200/40 dark:bg-blue-950/20 dark:border-blue-900/45">
                      <EditableField v-if="isEditing" label="" v-model="formData.consumo_realizado" :is-editing="true" type="textarea" :show-label="false" />
                      <EditableField v-else label="" :model-value="formData.consumo_realizado" :is-editing="false" type="textarea" :show-label="false" />
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-2">
                      <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Observaciones</h3>
                      <div class="p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                        <EditableField v-if="isEditing" label="" v-model="formData.observaciones" :is-editing="true" type="textarea" :show-label="false" />
                        <EditableField v-else label="" :model-value="formData.observaciones" :is-editing="false" type="textarea" :show-label="false" />
                      </div>
                    </div>
                    
                    <div class="space-y-2">
                      <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Logística y Logueo</h3>
                      <div class="p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-3">
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
                </div>

                <!-- Firma -->
                <section v-if="formData.url_firma && !isEditing" class="space-y-2">
                  <h3 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Firma del Profesional</h3>
                  <div class="border rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800/80 flex flex-col items-center">
                    <img :src="formData.url_firma" alt="Firma" class="h-32 object-contain filter dark:invert" />
                    <button @click="downloadSignature" class="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider cursor-pointer">Descargar Firma</button>
                  </div>
                </section>
              </section>
            </div>

            <!-- Contenedor para las pestañas secundarias -->
            <div v-show="activeTab === 'evidence' && !isEditing">
              <ReportTabs 
                :report-id="formData.id"
                :owner-id="formData.instrumentador_dni"
              />
            </div>
          </div>

          <!-- Pie del Modal (Premium Glassmorphism / Slate Style) -->
          <div class="p-5 bg-slate-50/50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center flex-shrink-0 rounded-b-2xl">
            <div class="flex items-center gap-3">
              <!-- Botón Eliminar -->
              <button 
                v-if="!isEditing" 
                @click="startDeleteConfirmation" 
                class="btn-footer-danger-outline"
                title="Eliminar esta cirugía"
              >
                <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Eliminar</span>
              </button>

              <button v-if="!isEditing" @click="isEditing = true" class="btn-footer-secondary">
                Editar Reporte
              </button>
              <button v-else @click="cancelEdit" class="btn-footer-secondary">
                Cancelar Edición
              </button>

              <div v-if="!isEditing">
                <button v-if="!hasIntervention" @click="isInterventionModalOpen = true" class="btn-footer-purple">
                  🟣 Registrar Intervención Clave
                </button>
                <span v-else class="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-purple-650 dark:text-purple-400 cursor-default bg-purple-50/40 dark:bg-purple-950/20 rounded-xl border border-purple-100/50 dark:border-purple-900/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Intervención Registrada
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button v-if="isEditing" @click="saveChanges" :disabled="isSaving" class="btn-footer-primary">
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>{{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
              <button v-else @click="generatePDF" :disabled="isGeneratingPdf || reporte?.estado !== 'Enviado'" class="btn-footer-primary" :class="{'opacity-50 cursor-not-allowed': reporte?.estado !== 'Enviado'}">
                <svg v-if="isGeneratingPdf" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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

    <!-- Modal de Confirmación de Eliminación con Cuenta Regresiva de Seguridad (Teletransportado al Body) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteConfirmState" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="cancelDelete">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md m-4 border border-slate-200 dark:border-slate-700 overflow-hidden animate-scaleUp">
            <!-- Encabezado -->
            <div class="p-5 border-b dark:border-slate-700 flex items-center gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400 text-lg font-bold">
                ⚠️
              </span>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Confirmar Eliminación</h3>
                <p class="text-xxs text-slate-500">Esta acción es irreversible</p>
              </div>
            </div>

            <!-- Cuerpo -->
            <div class="p-5 space-y-3">
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente la cirugía del paciente <strong>{{ formData?.paciente }}</strong> (ID: {{ formData?.id_cirugia || 'Sin ID' }})?
              </p>
              <div class="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/30 rounded-xl">
                <p class="text-[11px] text-red-700 dark:text-red-400 font-semibold flex items-center gap-1.5">
                  <span>ℹ️</span> Se eliminarán todos los datos y registros de esta cirugía de forma permanente.
                </p>
              </div>
            </div>

            <!-- Pie del modal -->
            <div class="px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border-t dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
              <button 
                @click="cancelDelete" 
                :disabled="isDeleting"
                class="px-4 py-2 text-xs font-semibold text-slate-750 bg-white border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                @click="confirmDelete" 
                :disabled="deleteCountdown > 0 || isDeleting"
                class="px-4 py-2 text-xs font-semibold text-white bg-red-650 border border-transparent rounded-xl shadow-sm hover:bg-red-750 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[130px] justify-center cursor-pointer"
              >
                <svg v-if="isDeleting" class="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
// --- CAMBIO: Se importa nuestro composable de toasts en lugar del hook directo ---
import { useToasts } from '../composables/useToasts';

import ReportTabs from './report-details/ReportTabs.vue';
import RegistrarIntervencionModal from './admin/RegistrarIntervencionModal.vue';

const EditableField = defineAsyncComponent(() => import('./EditableField.vue'));
const RatingRow = defineAsyncComponent(() => import('./RatingRow.vue'));
const ReportPDF = defineAsyncComponent(() => import('./ReportPDF.vue'));

const props = defineProps({ show: Boolean, reporte: Object });
const emit = defineEmits(['close', 'updated']);

// --- CAMBIO: Se instancia nuestro composable ---
const { showSuccessToast, showErrorToast, showLoadingToast, updateToast } = useToasts();
const activeTab = ref('details');
const isEditing = ref(false);
const isSaving = ref(false);
const formData = ref(null);
const currentPdfVersion = ref(null);
const isInterventionModalOpen = ref(false);
const hasIntervention = ref(false);

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
    // --- CAMBIO: Se usa el composable para notificaciones ---
    showSuccessToast('Reporte actualizado con éxito.');
    emit('updated');
    close();
  } catch (err) {
    // --- CAMBIO: Se usa el composable para notificaciones de error ---
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
    // --- CAMBIO: Se usa el composable para notificaciones ---
    showSuccessToast(`Generando PDF Versión ${version}...`);
    await new Promise(resolve => setTimeout(resolve, 50));
    const pdfElement = pdfComponentRef.value?.pdfTemplateRef;
    if (!pdfElement) throw new Error("Elemento de PDF no encontrado.");
    const canvas = await html2canvas(pdfElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    let imgHeight = pdfWidth / ratio;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
    pdf.save(`Reporte-${props.reporte.id_cirugia || props.reporte.id}-V${version}.pdf`);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    // --- CAMBIO: Se usa el composable para notificaciones de error ---
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
    // --- CAMBIO: Se usa el composable para notificaciones de error ---
    .catch(() => showErrorToast('No se pudo descargar la firma.'));
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' hs';
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.btn-footer-primary {
  @apply bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-sm transition-all duration-150 flex items-center justify-center;
  @apply hover:bg-indigo-700 hover:shadow-md active:scale-95 cursor-pointer;
}

.btn-footer-secondary {
  @apply bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm;
  @apply hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-footer-purple {
  @apply bg-purple-50 dark:bg-purple-950/40 border border-purple-100/50 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm;
  @apply hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:text-purple-800 dark:hover:text-purple-200;
  @apply active:scale-95 transition-all duration-150 cursor-pointer;
}

.btn-footer-danger-outline {
  @apply bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm;
  @apply hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300;
  @apply active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center;
}

.btn-footer-danger {
  @apply bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-sm transition-all duration-150 flex items-center justify-center;
  @apply hover:bg-red-700 hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>