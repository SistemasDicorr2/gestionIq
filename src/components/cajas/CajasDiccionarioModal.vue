<!-- src/components/cajas/CajasDiccionarioModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-3xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan">
            <BookOpenIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white">Diccionario de Componentes</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Abreviaturas y conceptos de codificación de cajas</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Content area -->
      <div class="p-5 overflow-y-auto space-y-6 flex-grow custom-scrollbar">

        <!-- Formularo Agregar / Editar -->
        <div class="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {{ editingId ? 'Editar Concepto' : '+ Nuevo Concepto en Diccionario' }}
            </h4>
            <button 
              v-if="editingId" 
              @click="resetForm" 
              class="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              Cancelar edición
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Grupo -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Grupo *</label>
              <select 
                v-model="form.grupo"
                class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              >
                <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>

            <!-- Código / Abreviatura -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Abreviatura / Código *</label>
              <input 
                v-model="form.codigo"
                type="text"
                placeholder="Ej: OS, T, 35, VL"
                class="w-full px-3 py-2 text-xs font-bold font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              />
            </div>

            <!-- Significado / Nombre -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Significado / Nombre *</label>
              <input 
                v-model="form.significado"
                type="text"
                placeholder="Ej: Osteosíntesis, Volar"
                class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              />
            </div>
          </div>

          <!-- Descripción opcional -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción / Criterio interno (opcional)</label>
            <input 
              v-model="form.descripcion"
              type="text"
              placeholder="Ej: Placas anatómicas volares para muñeca"
              class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            />
          </div>

          <!-- Opciones Activo / Histórico -->
          <div class="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" v-model="form.activo" class="rounded text-brand-navy focus:ring-brand-cyan" />
              <span>Concepto Activo</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" v-model="form.historico" class="rounded text-brand-navy focus:ring-brand-cyan" />
              <span>Marcar como Histórico</span>
            </label>
          </div>

          <div class="flex justify-end pt-1">
            <button 
              type="button"
              @click="handleSave"
              :disabled="saving"
              class="px-4 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <SaveIcon v-if="!saving" class="w-4 h-4" />
              <span>{{ saving ? 'Guardando...' : (editingId ? 'Actualizar Concepto' : 'Guardar en Diccionario') }}</span>
            </button>
          </div>
        </div>

        <!-- Búsqueda y Filtro en Diccionario -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="relative w-full sm:w-64">
            <SearchIcon class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Buscar en diccionario..."
              class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button 
              @click="filterGrupo = 'Todos'"
              :class="filterGrupo === 'Todos' ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
              class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors shrink-0"
            >
              Todos
            </button>
            <button 
              v-for="g in GRUPOS" 
              :key="g"
              @click="filterGrupo = g"
              :class="filterGrupo === g ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
              class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors shrink-0"
            >
              {{ g }}
            </button>
          </div>
        </div>

        <!-- Tabla / Listado de Conceptos -->
        <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="p-3">Grupo</th>
                <th class="p-3">Código</th>
                <th class="p-3">Significado</th>
                <th class="p-3">Estado</th>
                <th class="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="filteredEntries.length === 0">
                <td colspan="5" class="p-6 text-center text-slate-400 dark:text-slate-500 italic">
                  No hay conceptos registrados en este filtro.
                </td>
              </tr>
              <tr 
                v-for="entry in filteredEntries" 
                :key="entry.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="p-3 font-bold text-slate-700 dark:text-slate-300">
                  {{ entry.grupo }}
                </td>
                <td class="p-3 font-mono font-black text-brand-navy dark:text-brand-cyan-light text-sm">
                  {{ entry.codigo }}
                </td>
                <td class="p-3 text-slate-800 dark:text-slate-200 font-medium">
                  <div>{{ entry.significado }}</div>
                  <div v-if="entry.descripcion" class="text-[10px] text-slate-400 dark:text-slate-500">
                    {{ entry.descripcion }}
                  </div>
                </td>
                <td class="p-3">
                  <span 
                    :class="[
                      entry.activo ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                      entry.historico ? 'border border-amber-300 text-amber-800 dark:text-amber-300' : ''
                    ]"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                  >
                    {{ entry.historico ? 'Histórico' : (entry.activo ? 'Activo' : 'Inactivo') }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <button 
                    @click="editEntry(entry)"
                    class="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-brand-navy dark:hover:text-white font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end shrink-0">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
        >
          Cerrar Diccionario
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import { BookOpen as BookOpenIcon, X as XIcon, Save as SaveIcon, Search as SearchIcon } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  entries: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'refresh']);
const { showSuccessToast, showErrorToast, showWarningToast } = useToasts();

const GRUPOS = ['Familia', 'Material', 'Medida', 'Clasificación', 'Contenido', 'Marca'];

const form = ref({
  grupo: 'Familia',
  codigo: '',
  significado: '',
  descripcion: '',
  activo: true,
  historico: false
});

const editingId = ref(null);
const saving = ref(false);
const searchQuery = ref('');
const filterGrupo = ref('Todos');

// Lista reactiva interna si se edita/carga directo
const localEntries = ref([]);

const loadEntries = async () => {
  try {
    const { data, error } = await supabase
      .from('cajas_diccionario')
      .select('*')
      .order('grupo', { ascending: true })
      .order('codigo', { ascending: true });

    if (error) throw error;
    localEntries.value = data || [];
  } catch (err) {
    console.error('Error cargando diccionario:', err);
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    loadEntries();
    resetForm();
  }
});

onMounted(() => {
  if (props.show) loadEntries();
});

const resetForm = () => {
  editingId.value = null;
  form.value = {
    grupo: 'Familia',
    codigo: '',
    significado: '',
    descripcion: '',
    activo: true,
    historico: false
  };
};

const editEntry = (entry) => {
  editingId.value = entry.id;
  form.value = {
    grupo: entry.grupo,
    codigo: entry.codigo,
    significado: entry.significado,
    descripcion: entry.descripcion || '',
    activo: entry.activo ?? true,
    historico: entry.historico ?? false
  };
};

const normalizeText = (text) => {
  if (!text) return '';
  return text.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u06ff]/g, "");
};

const handleSave = async () => {
  const grupo = form.value.grupo;
  const codigo = form.value.codigo.trim().toUpperCase();
  const significado = form.value.significado.trim();
  const significadoNorm = normalizeText(significado);

  if (!codigo) {
    showWarningToast('Por favor, ingresá la abreviatura o código.');
    return;
  }
  if (!significado) {
    showWarningToast('Por favor, ingresá el significado o nombre.');
    return;
  }

  // Validaciones semánticas en frontend antes de la inserción
  const existingCode = localEntries.value.find(e => 
    e.grupo.toLowerCase() === grupo.toLowerCase() && 
    e.codigo.toLowerCase() === codigo.toLowerCase() && 
    e.id !== editingId.value
  );

  if (existingCode) {
    showErrorToast(`La abreviatura "${codigo}" ya está registrada en el grupo "${grupo}" para: "${existingCode.significado}".`);
    return;
  }

  const existingMeaning = localEntries.value.find(e => 
    e.grupo.toLowerCase() === grupo.toLowerCase() && 
    normalizeText(e.significado) === significadoNorm && 
    e.id !== editingId.value
  );

  if (existingMeaning) {
    showWarningToast(`Ya existe "${existingMeaning.significado}" con la abreviatura ${existingMeaning.codigo}. Utilizá el concepto existente.`);
    return;
  }

  saving.value = true;
  try {
    const payload = {
      grupo,
      codigo,
      significado,
      significado_normalizado: significadoNorm,
      descripcion: form.value.descripcion,
      activo: form.value.activo,
      historico: form.value.historico,
      updated_at: new Date().toISOString()
    };

    if (editingId.value) {
      const { error } = await supabase
        .from('cajas_diccionario')
        .update(payload)
        .eq('id', editingId.value);
      if (error) throw error;
      showSuccessToast('Concepto actualizado correctamente en el diccionario.');
    } else {
      const { error } = await supabase
        .from('cajas_diccionario')
        .insert([payload]);
      if (error) throw error;
      showSuccessToast('Concepto guardado exitosamente en el diccionario.');
    }

    resetForm();
    await loadEntries();
    emit('refresh');
  } catch (err) {
    console.error('Error al guardar concepto:', err);
    showErrorToast('Error al guardar el concepto en el diccionario: ' + (err.message || err));
  } finally {
    saving.value = false;
  }
};

const filteredEntries = computed(() => {
  return localEntries.value.filter(e => {
    const matchesGrupo = filterGrupo.value === 'Todos' || e.grupo === filterGrupo.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchesSearch = !q || 
      e.codigo.toLowerCase().includes(q) || 
      e.significado.toLowerCase().includes(q) || 
      (e.descripcion && e.descripcion.toLowerCase().includes(q));
    return matchesGrupo && matchesSearch;
  });
});
</script>
