<!-- src/components/NewSurgeryModal.vue (Rediseñado UX/UI + Sugerencias + 19" Responsive) -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs" @click.self="close">
      
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all animate-fadeIn">
        <form @submit.prevent="handleSubmit">
          
          <!-- Encabezado Modal -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                🏥
              </span>
              <div>
                <h2 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Nueva Cirugía / Asignar</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Complete los datos de la intervención para registrarla en el sistema.</p>
              </div>
            </div>

            <button 
              type="button" 
              @click="close"
              class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Cuerpo del Formulario (Grid Adaptable a Monitores 19" y Escritorio) -->
          <div class="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Paciente -->
              <div class="space-y-1.5 md:col-span-2">
                <label for="paciente" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Paciente *
                </label>
                <div class="relative">
                  <input 
                    type="text" 
                    id="paciente" 
                    v-model="form.paciente" 
                    required 
                    placeholder="Nombre completo del paciente (Apellido y Nombre)"
                    class="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              <!-- Médico con Sugerencias Datalist -->
              <div class="space-y-1.5">
                <label for="medico" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Médico Cirujano *
                </label>
                <div class="relative">
                  <input 
                    type="text" 
                    id="medico" 
                    v-model="form.medico" 
                    list="medicos-list"
                    required 
                    placeholder="Ej: Dr. Pacheco Nicolás"
                    class="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 transition-all"
                  />
                  <datalist id="medicos-list">
                    <option v-for="med in sugerencias.medicos" :key="med" :value="med" />
                  </datalist>
                </div>
              </div>

              <!-- Fecha de Cirugía -->
              <div class="space-y-1.5">
                <label for="fecha_cirugia" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Fecha de Cirugía *
                </label>
                <input 
                  type="date" 
                  id="fecha_cirugia" 
                  v-model="form.fecha_cirugia" 
                  required 
                  class="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all"
                />
              </div>

              <!-- Lugar de Cirugía (Institución) -->
              <div class="space-y-1.5">
                <label for="lugar_cirugia" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lugar de Cirugía (Institución)
                </label>
                <input 
                  type="text" 
                  id="lugar_cirugia" 
                  v-model="form.lugar_cirugia" 
                  list="instituciones-list"
                  placeholder="Ej: Clínica San Martín / Sanatorio Mayo"
                  class="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 transition-all"
                />
                <datalist id="instituciones-list">
                  <option v-for="inst in sugerencias.instituciones" :key="inst" :value="inst" />
                </datalist>
              </div>

              <!-- Cliente / Obra Social / Prepaga -->
              <div class="space-y-1.5">
                <label for="cliente" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cliente / Obra Social / Prepaga
                </label>
                <input 
                  type="text" 
                  id="cliente" 
                  v-model="form.cliente" 
                  list="clientes-list"
                  placeholder="Ej: OSDE / Subsidio Salud / Swiss Medical"
                  class="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 transition-all"
                />
                <datalist id="clientes-list">
                  <option v-for="cli in sugerencias.clientes" :key="cli" :value="cli" />
                </datalist>
              </div>

              <!-- Tipo de Cirugía -->
              <div class="space-y-1.5 md:col-span-2">
                <label for="tipo_cirugia" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tipo de Cirugía / Procedimiento
                </label>
                <input 
                  type="text" 
                  id="tipo_cirugia" 
                  v-model="form.tipo_cirugia" 
                  list="tipos-cirugia-list"
                  placeholder="Ej: Artroplastia de Rodilla / Osteosíntesis"
                  class="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 transition-all"
                />
                <datalist id="tipos-cirugia-list">
                  <option v-for="t in sugerencias.tiposCirugia" :key="t" :value="t" />
                </datalist>

                <!-- Chips de Sugerencias Rápida -->
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <button 
                    v-for="chip in quickChips" 
                    :key="chip"
                    type="button"
                    @click="form.tipo_cirugia = chip"
                    class="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
                  >
                    + {{ chip }}
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- Pie de página con Acciones -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="close" 
              class="px-4 py-2 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting" 
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-98"
            >
              <span>{{ isSubmitting ? 'Guardando...' : 'Guardar y Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'surgery-created']);
const toast = useToast();

const isSubmitting = ref(false);

const form = reactive({
  paciente: '',
  medico: '',
  fecha_cirugia: new Date().toISOString().split('T')[0],
  lugar_cirugia: '',
  cliente: '',
  tipo_cirugia: '', 
  estado: 'Pendiente',
});

// Chips de sugerencia rápida para Tipo de Cirugía
const quickChips = [
  'Artroplastia de Rodilla',
  'Artroplastia de Cadera',
  'Osteosíntesis',
  'Cirugía de Columna',
  'Reemplazo Articular'
];

// Sugerencias Dinámicas y Frecuentes
const sugerencias = reactive({
  medicos: ['Dr. Pacheco Nicolás', 'Dr. Fernández', 'Dr. Gómez', 'Dra. Rodríguez'],
  instituciones: ['Clínica San Martín - Clorinda', 'Sanatorio Mayo', 'Clínica Viamonte', 'Hospital Central Formosa'],
  clientes: ['OSDE', 'Subsidio de Salud', 'Swiss Medical', 'IASEP', 'PAMI'],
  tiposCirugia: [
    'Artroplastia de Rodilla',
    'Artroplastia de Cadera',
    'Osteosíntesis',
    'Cirugía de Columna',
    'Artroscopia de Hombro',
    'Reemplazo Articular'
  ]
});

// Cargar sugerencias dinámicas existentes de Supabase para autocompletado
const loadSuggestionsFromDB = async () => {
  try {
    const { data: reportes } = await supabase
      .from('reportes')
      .select('medico, lugar_cirugia, cliente, tipo_cirugia')
      .limit(100);

    if (reportes && reportes.length > 0) {
      const medSet = new Set(sugerencias.medicos);
      const instSet = new Set(sugerencias.instituciones);
      const cliSet = new Set(sugerencias.clientes);
      const tipoSet = new Set(sugerencias.tiposCirugia);

      reportes.forEach(r => {
        if (r.medico) medSet.add(r.medico.trim());
        if (r.lugar_cirugia) instSet.add(r.lugar_cirugia.trim());
        if (r.cliente) cliSet.add(r.cliente.trim());
        if (r.tipo_cirugia) tipoSet.add(r.tipo_cirugia.trim());
      });

      sugerencias.medicos = Array.from(medSet).slice(0, 15);
      sugerencias.instituciones = Array.from(instSet).slice(0, 15);
      sugerencias.clientes = Array.from(cliSet).slice(0, 15);
      sugerencias.tiposCirugia = Array.from(tipoSet).slice(0, 15);
    }
  } catch (err) {
    console.warn('Sugerencias locales por defecto activas.');
  }
};

onMounted(loadSuggestionsFromDB);

const resetForm = () => {
  form.paciente = '';
  form.medico = '';
  form.fecha_cirugia = new Date().toISOString().split('T')[0];
  form.lugar_cirugia = '';
  form.cliente = '';
  form.tipo_cirugia = '';
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const { data, error } = await supabase
      .from('reportes')
      .insert([{
        paciente: form.paciente.trim(),
        medico: form.medico.trim(),
        fecha_cirugia: form.fecha_cirugia,
        lugar_cirugia: form.lugar_cirugia.trim() || null,
        cliente: form.cliente.trim() || null,
        tipo_cirugia: form.tipo_cirugia.trim() || null,
        estado: form.estado
      }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      toast.success('¡Cirugía registrada exitosamente!');
      emit('surgery-created', data);
    }
    close();
  } catch (error) {
    toast.error(`Error al crear la cirugía: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  emit('close');
};

watch(() => props.show, (newValue) => {
  if (!newValue) {
    setTimeout(resetForm, 300);
  } else {
    loadSuggestionsFromDB();
  }
});
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