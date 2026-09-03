<!-- src/components/cajas/CajaKnowledgeModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-3xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan">
            <BookMarkedIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white">
              {{ noteToEdit ? 'Editar Nota de Conocimiento' : '+ Nueva Nota de Conocimiento' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Preservación de criterios operativos e información histórica</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Content -->
      <div class="p-5 overflow-y-auto space-y-4 flex-grow custom-scrollbar">

        <!-- Título -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título de la Nota *</label>
          <input 
            v-model="form.titulo"
            type="text"
            placeholder="Ej: Diferencia entre codificación OS y ST"
            class="w-full px-3 py-2 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Categoría -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría *</label>
            <select 
              v-model="form.categoria"
              class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option v-for="cat in CATEGORIAS" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Importancia -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Importancia</label>
            <select 
              v-model="form.importancia"
              class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option value="Normal">🟢 Normal</option>
              <option value="Importante">🟡 Importante</option>
              <option value="Crítico">🔴 Crítico</option>
            </select>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estado</label>
            <select 
              v-model="form.estado"
              class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option value="Vigente">Vigente</option>
              <option value="En revisión">En revisión</option>
              <option value="Histórico">Histórico</option>
            </select>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Etiquetas / Tags (separadas por coma)
          </label>
          <input 
            v-model="tagsInput"
            type="text"
            placeholder="Ej: OS, Sets, Excepciones, Criterio"
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          />
        </div>

        <!-- Editor de Contenido / Textarea Enriquecida con Preview -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Contenido de la Nota *
            </label>

            <!-- Barra de herramientas simples para insertar Markdown -->
            <div class="flex items-center gap-1">
              <button 
                type="button" 
                @click="insertFormat('### ')" 
                class="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200"
                title="Título"
              >
                H3
              </button>
              <button 
                type="button" 
                @click="insertFormat('**', '**')" 
                class="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200"
                title="Negrita"
              >
                B
              </button>
              <button 
                type="button" 
                @click="insertFormat('- ')" 
                class="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200"
                title="Lista"
              >
                • Lista
              </button>
              <button 
                type="button" 
                @click="showPreview = !showPreview" 
                class="px-2.5 py-0.5 text-[10px] font-extrabold rounded transition-colors"
                :class="showPreview ? 'bg-brand-cyan text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'"
              >
                {{ showPreview ? 'Editar' : 'Vista previa' }}
              </button>
            </div>
          </div>

          <!-- Modos Editar vs Vista Previa -->
          <div v-if="!showPreview">
            <textarea 
              ref="textareaRef"
              v-model="form.contenido"
              rows="9"
              placeholder="Escribí el contenido de la nota aquí... Párrafos, listas y criterios internos."
              class="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none custom-scrollbar"
            ></textarea>
          </div>

          <div 
            v-else 
            class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-h-[180px] space-y-2 whitespace-pre-wrap font-sans"
          >
            <div v-html="renderedContent"></div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
        >
          Cancelar
        </button>

        <button 
          @click="handleSubmit"
          :disabled="saving"
          class="px-5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <SaveIcon v-if="!saving" class="w-4 h-4" />
          <span>{{ saving ? 'Guardando...' : (noteToEdit ? 'Actualizar Nota' : 'Guardar Nota') }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import { BookMarked as BookMarkedIcon, X as XIcon, Save as SaveIcon } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  noteToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);
const { showSuccessToast, showErrorToast, showWarningToast } = useToasts();

const CATEGORIAS = ['Codificación', 'Cajas', 'Instrumental', 'Sets', 'Equipos', 'Procedimientos', 'Histórico', 'Otros'];

const form = ref({
  titulo: '',
  categoria: 'Codificación',
  importancia: 'Normal',
  estado: 'Vigente',
  contenido: ''
});

const tagsInput = ref('');
const saving = ref(false);
const showPreview = ref(false);
const textareaRef = ref(null);

watch(() => props.show, (newVal) => {
  if (newVal) {
    showPreview.value = false;
    if (props.noteToEdit) {
      form.value = {
        titulo: props.noteToEdit.titulo || '',
        categoria: props.noteToEdit.categoria || 'Codificación',
        importancia: props.noteToEdit.importancia || 'Normal',
        estado: props.noteToEdit.estado || 'Vigente',
        contenido: props.noteToEdit.contenido || ''
      };
      tagsInput.value = (props.noteToEdit.tags || []).join(', ');
    } else {
      form.value = {
        titulo: '',
        categoria: 'Codificación',
        importancia: 'Normal',
        estado: 'Vigente',
        contenido: ''
      };
      tagsInput.value = '';
    }
  }
});

const insertFormat = (beforeText, afterText = '') => {
  const el = textareaRef.value;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const val = form.value.contenido;
  const selected = val.substring(start, end);
  const replacement = `${beforeText}${selected}${afterText}`;
  form.value.contenido = val.substring(0, start) + replacement + val.substring(end);
};

// Formateador sencillo de texto markdown en HTML seguro
const renderedContent = computed(() => {
  if (!form.value.contenido) return '<em>Sin contenido.</em>';
  let txt = form.value.contenido
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Reemplazar títulos ###
  txt = txt.replace(/^### (.*$)/gim, '<h3 class="text-sm font-black text-brand-navy dark:text-brand-cyan-light mt-2 mb-1">$1</h3>');
  // Reemplazar negritas **
  txt = txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Reemplazar listas - 
  txt = txt.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

  return txt;
});

const handleSubmit = async () => {
  if (!form.value.titulo.trim()) {
    showWarningToast('Por favor, ingresá un título para la nota.');
    return;
  }
  if (!form.value.contenido.trim()) {
    showWarningToast('Por favor, ingresá el contenido de la nota.');
    return;
  }

  saving.value = true;
  try {
    const tagsArray = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      titulo: form.value.titulo.trim(),
      categoria: form.value.categoria,
      importancia: form.value.importancia,
      estado: form.value.estado,
      contenido: form.value.contenido.trim(),
      tags: tagsArray,
      updated_at: new Date().toISOString()
    };

    if (props.noteToEdit) {
      const { error } = await supabase
        .from('cajas_knowledge')
        .update(payload)
        .eq('id', props.noteToEdit.id);
      if (error) throw error;
      showSuccessToast('Nota actualizada con éxito.');
    } else {
      const { error } = await supabase
        .from('cajas_knowledge')
        .insert([payload]);
      if (error) throw error;
      showSuccessToast('Nota creada con éxito.');
    }

    emit('saved');
    emit('close');
  } catch (err) {
    console.error('Error al guardar nota de knowledge:', err);
    showErrorToast('Error al guardar la nota: ' + (err.message || err));
  } finally {
    saving.value = false;
  }
};
</script>
