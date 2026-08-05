<!-- src/components/SubmissionSuccess.vue (UX/UI Rediseñado & Fix Defensivo de Subida) -->
<template>
  <div class="w-full max-w-xl mx-auto text-center px-3">
    <div class="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl transition-all">
      <div class="flex flex-col items-center space-y-5">
        
        <img src="/2.svg" alt="Districorr" class="h-10 sm:h-12 opacity-90 dark:opacity-100">
        
        <div class="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 shadow-inner">
          <svg class="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          ¡Ficha Enviada con Éxito!
        </h2>

        <p class="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 max-w-md">
          Gracias por tu compromiso. Tu ficha quirúrgica fue registrada correctamente en el sistema.
        </p>

        <div v-if="activityToken" class="text-center bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200/60 dark:border-blue-900/50 w-full">
          <router-link
            :to="{ name: 'ActivitySummary', params: { token: activityToken } }"
            class="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1.5"
          >
            <span>📊 Accedé a tu Resumen de Actividad</span>
          </router-link>
          <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            (Este enlace es personal y válido por 72 hs)
          </p>
        </div>

        <div class="w-full text-left space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          
          <!-- Bloque Informativo de Pago -->
          <div class="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500 rounded-2xl">
            <div class="flex items-start gap-3">
              <BanknotesIcon class="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 class="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">Información de Pago</h3>
                <p class="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                  Procesaremos tu pago <strong>dentro de los 7 días hábiles</strong> posterior a la recepción y control del material en nuestro depósito. ¡Gracias por tu trabajo! 🤝
                </p>
              </div>
            </div>
          </div>

          <!-- Bloque de Evidencia Fotográfica -->
          <div class="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
            <div class="flex items-start gap-3">
              <CloudArrowUpIcon class="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">Importante: Adjuntá tu Evidencia</h3>
                <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Subí las fotos de los stickers, remitos y estado del material. Es tu respaldo y agiliza la liquidación.
                </p>
              </div>
            </div>
            
            <div class="space-y-3">
              <FileUpload
                ref="fileUploaderRef"
                area="instrumentadores"
                :owner-id="String(reporteId)"
                :accepted-file-types="'image/*'"
                :enable-camera="true"
              />
              
              <button 
                type="button"
                @click="finalizeUploads" 
                :disabled="isSaving"
                class="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CloudArrowUpIcon class="w-5 h-5" />
                <span>{{ isSaving ? 'Guardando Evidencia...' : 'Finalizar y Guardar Evidencia' }}</span>
              </button>

              <div v-if="uploadSuccessMessage" class="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl text-center">
                <p>{{ uploadSuccessMessage }}</p>
              </div>

              <EvidenceViewer v-if="uploadedFiles.length > 0" :files="uploadedFiles" class="mt-3" />
            </div>

            <div class="flex items-center text-center my-2">
              <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span class="flex-shrink mx-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">o si preferís (opcional)</span>
              <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-98"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004-1.035 3.787 3.864-1.025z" /></svg>
              <span>Enviar Fotos por WhatsApp (Opcional)</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { supabase } from '../services/supabase';
import FileUpload from './uploader/FileUpload.vue';
import EvidenceViewer from './shared/EvidenceViewer.vue';
import { BanknotesIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  pacienteNombre: { type: String, default: '' },
  medicoNombre: { type: String, default: '' },
  activityToken: { type: String, default: null },
  reporteId: { type: [String, Number], required: true }
});

const toast = useToast();
const fileUploaderRef = ref(null);
const uploadedFiles = ref([]);
const isSaving = ref(false);
const uploadSuccessMessage = ref('');

const fetchExistingEvidences = async () => {
  if (!props.reporteId) return;
  try {
    const { data, error } = await supabase
      .from('reporte_evidencias')
      .select('*')
      .eq('reporte_id', props.reporteId)
      .eq('area', 'instrumentadores');
    if (error) throw error;
    uploadedFiles.value = data || [];
  } catch (error) {
    toast.error("No se pudo cargar la evidencia existente.");
  }
};

onMounted(fetchExistingEvidences);

const finalizeUploads = async () => {
  if (!fileUploaderRef.value) {
    console.error('[SubmissionSuccess] La referencia al componente FileUpload no existe.');
    return;
  }

  isSaving.value = true;
  uploadSuccessMessage.value = '';

  try {
    const newEvidences = await fileUploaderRef.value.startUpload();

    if (newEvidences.length === 0) {
      toast.info("No hay nuevos archivos para guardar.");
      return;
    }

    const recordsToInsert = newEvidences.map(ev => ({
      reporte_id: props.reporteId,
      object_key: ev.object_key,
      file_name: ev.file_name,
      content_type: ev.content_type,
      size_bytes: ev.size_bytes,
      area: 'instrumentadores'
    }));

    const { data: insertedData, error } = await supabase
      .from('reporte_evidencias')
      .insert(recordsToInsert)
      .select();

    if (error) throw error;

    uploadedFiles.value.push(...insertedData);
    
    // Llamada defensiva para limpiar archivos seleccionados
    if (fileUploaderRef.value) {
      if (typeof fileUploaderRef.value.clear === 'function') {
        fileUploaderRef.value.clear();
      } else if (typeof fileUploaderRef.value.reset === 'function') {
        fileUploaderRef.value.reset();
      }
    }
    
    uploadSuccessMessage.value = `¡${insertedData.length} archivo(s) guardado(s) con éxito!`;
    setTimeout(() => { uploadSuccessMessage.value = ''; }, 5000);

  } catch (error) {
    toast.error(`Error al guardar la evidencia: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

const whatsappUrl = computed(() => {
  const phone = '543794009899';
  const pacienteNombre = props.pacienteNombre?.trim() || 'sin especificar';
  const medicoNombre = props.medicoNombre?.trim() || 'sin especificar';
  const message = `Hola, paso a informar que completé la ficha correspondiente al paciente: ${pacienteNombre}, médico: ${medicoNombre}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
});
</script>

<style scoped>
.checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 3; stroke-miterlimit: 10; stroke: #10b981; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
.checkmark-check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-width: 4; stroke: #10b981; stroke-linecap: round; stroke-linejoin: round; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
@keyframes stroke { 100% { stroke-dashoffset: 0; } }
</style>
