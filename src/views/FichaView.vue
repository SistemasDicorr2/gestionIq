<!-- src/views/FichaView.vue (Fondo Dinámico Modo Oscuro/Claro y Layout Responsivo) -->
<template>
  <!-- BANNER DE ANUNCIO MÓVIL/DESKTOP -->
  <Transition name="slide-down">
    <div v-if="showAnnouncementBanner" class="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-md">
      <div class="max-w-4xl mx-auto px-4 py-2.5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <InformationCircleIcon class="w-5 h-5 shrink-0" />
            <p class="text-xs sm:text-sm font-extrabold">
              ¡Recordá que ahora podés subir las imágenes directamente desde la web!
            </p>
          </div>
          <button @click="dismissBanner" class="p-1 rounded-full hover:bg-white/20 transition-colors" title="Cerrar aviso">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Fondo de pantalla adaptable a Modo Claro y Modo Oscuro -->
  <div class="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-2.5 sm:p-6 lg:p-8 transition-colors duration-200 font-sans">
    <div class="w-full max-w-4xl my-auto">
      <Transition name="fade" mode="out-in">
        
        <div v-if="viewState === 'loading'" class="text-center py-12">
          <svg class="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mt-4">Validando enlace y buscando información del caso...</p>
        </div>
        
        <div v-else-if="viewState === 'error'" class="max-w-lg mx-auto bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 p-5 rounded-2xl shadow-md flex flex-col items-center space-y-4">
          <div class="flex items-center space-x-3">
            <svg class="w-7 h-7 text-rose-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            <p class="text-xs sm:text-sm font-bold">{{ error }}</p>
          </div>
          <button @click="retryFetch" class="bg-blue-600 text-white font-extrabold py-2 px-5 rounded-xl hover:bg-blue-700 transition-colors text-xs">Reintentar</button>
        </div>
        
        <SubmissionSuccess 
          v-else-if="viewState === 'submitted'" 
          :paciente-nombre="reporte.paciente"
          :medico-nombre="reporte.medico"
          :activity-token="activityToken"
          :reporte-id="submittedReportId"
        />

        <IdentificationWizard v-else-if="viewState === 'identification'" @identification-complete="handleIdentificationComplete" @request-update="requestUpdate"/>
        
        <FichaForm v-else-if="viewState === 'form_display' && reporte && instrumentador" :reporte="reporte" :instrumentador="instrumentador" @submit-success="handleSuccess" />
        
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';
import IdentificationWizard from '../components/IdentificationWizard.vue';
import FichaForm from '../components/FichaForm.vue';
import SubmissionSuccess from '../components/SubmissionSuccess.vue';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const props = defineProps({ 
  token: { type: String, default: null },
  short_code: { type: String, default: null }
});

const viewState = ref('loading');
const reporte = ref(null);
const error = ref(null);
const instrumentador = ref(null);
const activityToken = ref(null);
const submittedReportId = ref(null);
const showAnnouncementBanner = ref(false);

const dismissBanner = () => {
  showAnnouncementBanner.value = false;
  try {
    localStorage.setItem('announcementDismissed', 'true');
  } catch (e) {
    console.warn("No se pudo guardar la preferencia del banner en localStorage:", e);
  }
};

const fetchReporte = async () => {
  viewState.value = 'loading';
  error.value = null;
  
  try {
    let reporteData;

    if (props.short_code) {
      const { data: linkData, error: linkError } = await supabase
        .from('short_links')
        .select('reporte_id')
        .eq('short_code', props.short_code)
        .single();

      if (linkError || !linkData) {
        throw new Error("El enlace corto no es válido o ha expirado.");
      }

      const { data, error: fetchError } = await supabase
        .from('reportes')
        .select('*')
        .eq('id', linkData.reporte_id)
        .single();
      
      if (fetchError) throw new Error("No se pudo encontrar la cirugía asociada al enlace.");
      reporteData = data;

    } else if (props.token) {
      const { data, error: fetchError } = await supabase
        .from('reportes')
        .select('*')
        .eq('token', props.token)
        .single();
      
      if (fetchError) {
        if (fetchError.code === 'PGRST116') throw new Error("El enlace no es válido o ha expirado.");
        throw new Error("No se pudo conectar con la base de datos.");
      }
      reporteData = data;
    } else {
      throw new Error("Enlace inválido. No se proporcionó un identificador.");
    }

    reporte.value = reporteData;
    
    if (reporteData.estado === 'Enviado') {
      submittedReportId.value = reporteData.id;

      if (reporteData.instrumentador_dni) {
        try {
          const { data: token } = await supabase.rpc('create_instrumentador_token', {
            p_instrumentador_dni: reporteData.instrumentador_dni
          });
          if (token) activityToken.value = token;
        } catch (e) {
          console.error("No se pudo generar el token para la ficha ya enviada:", e.message);
        }
      }
      viewState.value = 'submitted';
    } else {
      const cachedInstrumentador = sessionStorage.getItem('iq_instrumentador');
      if (cachedInstrumentador) {
        instrumentador.value = JSON.parse(cachedInstrumentador);
        viewState.value = 'form_display';
      } else {
        viewState.value = 'identification';
      }
    }
  } catch (err) {
    error.value = err.message;
    viewState.value = 'error';
  }
};

const handleIdentificationComplete = (identifiedInstrumentador) => {
  instrumentador.value = identifiedInstrumentador;
  sessionStorage.setItem('iq_instrumentador', JSON.stringify(identifiedInstrumentador));
  viewState.value = 'form_display';
};

const handleSuccess = async (reporteId) => {
  submittedReportId.value = reporteId;
  sessionStorage.removeItem('iq_instrumentador');
  
  try {
    const { data: token, error: tokenError } = await supabase.rpc('create_instrumentador_token', {
      p_instrumentador_dni: instrumentador.value.dni
    });

    if (tokenError) throw tokenError;
    
    activityToken.value = token;
    
  } catch (err) {
    console.error("Error al crear el token de actividad:", err.message);
  }
  
  viewState.value = 'submitted';
};

const retryFetch = () => {
  fetchReporte();
};

const requestUpdate = () => {
  window.open('https://wa.me/543794316450', '_blank');
};

onMounted(() => {
  sessionStorage.removeItem('iq_instrumentador');
  
  try {
    if (localStorage.getItem('announcementDismissed') !== 'true') {
      showAnnouncementBanner.value = true;
    }
  } catch (e) {
    console.warn("No se pudo leer la preferencia del banner desde localStorage:", e);
    showAnnouncementBanner.value = true;
  }

  fetchReporte();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.3s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}
.slide-down-enter-active, .slide-down-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-down-enter-from, .slide-down-leave-to {
  transform: translateY(-100%);
}
</style>
