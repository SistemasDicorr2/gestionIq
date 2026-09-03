<!-- src/components/cajas/CajasKnowledgeTab.vue -->
<template>
  <div class="space-y-4">
    
    <!-- Toolbar de Búsqueda y Filtros de Knowledge -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
      
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Input de Búsqueda -->
        <div class="relative flex-grow max-w-xl">
          <SearchIcon class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            v-model="searchQuery"
            @input="currentPage = 1"
            type="text"
            placeholder="Buscar por título, contenido, categoría o tags..."
            class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          />
        </div>

        <!-- Botón Nueva Nota -->
        <button 
          @click="openNewNoteModal"
          class="px-4 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 self-end md:self-auto"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Nueva nota</span>
        </button>
      </div>

      <!-- Filtros Avanzados (Categorías, Importancia, Estado) -->
      <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        
        <span class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Filtros:</span>

        <!-- Categorías -->
        <div class="flex items-center gap-1 overflow-x-auto custom-scrollbar max-w-full pb-1 sm:pb-0">
          <button 
            @click="selectCategoria('Todas')"
            :class="filterCategoria === 'Todas' ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
            class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Todas las categorías
          </button>
          <button 
            v-for="cat in CATEGORIAS"
            :key="cat"
            @click="selectCategoria(cat)"
            :class="filterCategoria === cat ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
            class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Importancia -->
        <select 
          v-model="filterImportancia"
          @change="currentPage = 1"
          class="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer ml-auto"
        >
          <option value="Todas">Toda Importancia</option>
          <option value="Normal">Normal</option>
          <option value="Importante">Importante</option>
          <option value="Crítico">Crítico</option>
        </select>

        <!-- Estado -->
        <select 
          v-model="filterEstado"
          @change="currentPage = 1"
          class="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Vigente">Vigente</option>
          <option value="En revisión">En revisión</option>
          <option value="Histórico">Histórico</option>
        </select>

      </div>

    </div>

    <!-- Indicador de Carga -->
    <div v-if="loading" class="p-12 text-center text-slate-400 dark:text-slate-500 font-bold text-xs space-y-2">
      <div class="inline-block w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
      <p>Cargando base de conocimiento...</p>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="filteredNotes.length === 0" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3">
      <BookMarkedIcon class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
      <div class="space-y-1">
        <h3 class="text-sm font-black text-slate-700 dark:text-slate-200">No se encontraron notas</h3>
        <p class="text-xs text-slate-400 dark:text-slate-500">
          No hay artículos registrados con los filtros aplicados o aún no se creó ninguna nota.
        </p>
      </div>
      <button 
        @click="openNewNoteModal"
        class="px-4 py-2 bg-brand-navy text-white text-xs font-extrabold rounded-xl shadow-2xs inline-flex items-center gap-1.5"
      >
        <PlusIcon class="w-4 h-4" />
        <span>Crear la primera nota de Knowledge</span>
      </button>
    </div>

    <!-- Listado de Cards de Knowledge -->
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div 
          v-for="note in paginatedNotes"
          :key="note.id"
          class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
          @click="openReaderModal(note)"
        >
          <!-- Header de la Card -->
          <div class="space-y-2">
            
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-brand-navy dark:group-hover:text-brand-cyan-light transition-colors">
                {{ note.titulo }}
              </h3>

              <!-- Badge de Importancia -->
              <span 
                :class="importanceBadgeClass(note.importancia)"
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 border"
              >
                {{ note.importancia }}
              </span>
            </div>

            <!-- Badges de Categoría y Estado -->
            <div class="flex items-center gap-2 text-[10px] font-bold">
              <span class="px-2 py-0.5 bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan-light rounded-md">
                📁 {{ note.categoria }}
              </span>

              <span 
                :class="statusBadgeClass(note.estado)"
                class="px-2 py-0.5 rounded-md"
              >
                {{ note.estado }}
              </span>

              <span class="text-slate-400 dark:text-slate-500 ml-auto font-mono text-[10px]">
                {{ formatDate(note.created_at) }}
              </span>
            </div>

          </div>

          <!-- Extracto de Contenido Limpio -->
          <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1 line-clamp-3 leading-relaxed font-sans bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {{ cleanPreviewSnippet(note.contenido) }}
          </div>

          <!-- Footer Card: Tags y Acciones -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            
            <!-- Chips de Tags -->
            <div class="flex flex-wrap items-center gap-1 max-w-[60%]">
              <span 
                v-for="tag in note.tags"
                :key="tag"
                class="px-1.5 py-0.5 text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- Botones Acciones (Leer y Editar) -->
            <div class="flex items-center gap-1.5 shrink-0" @click.stop>
              <button 
                @click="openReaderModal(note)"
                class="px-2.5 py-1 bg-brand-navy/10 hover:bg-brand-navy/20 dark:bg-brand-cyan/20 dark:hover:bg-brand-cyan/30 text-brand-navy dark:text-brand-cyan-light font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <EyeIcon class="w-3.5 h-3.5" />
                <span>Leer nota</span>
              </button>

              <button 
                @click="openEditNoteModal(note)"
                class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <EditIcon class="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      <!-- Barra de Paginación para Knowledge -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        
        <div class="text-slate-500 dark:text-slate-400 font-medium">
          Mostrando <strong>{{ rangeStart }}</strong> - <strong>{{ rangeEnd }}</strong> de <strong>{{ filteredNotes.length }}</strong> notas
        </div>

        <div class="flex items-center gap-3">
          <!-- Selector Notas por página -->
          <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span>Por página:</span>
            <select 
              v-model="itemsPerPage" 
              @change="currentPage = 1"
              class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option :value="6">6</option>
              <option :value="12">12</option>
              <option :value="24">24</option>
            </select>
          </div>

          <!-- Botones Paginador -->
          <div class="flex items-center gap-1">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Anterior
            </button>

            <span class="px-2 font-bold text-slate-700 dark:text-slate-300">
              {{ currentPage }} / {{ totalPages || 1 }}
            </span>

            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>

      </div>
    </template>

    <!-- Modal Lectura / Reader -->
    <CajaKnowledgeReaderModal 
      :show="showReaderModal"
      :note="readerNote"
      @close="showReaderModal = false"
      @edit="handleEditFromReader"
    />

    <!-- Modal Formulario Note -->
    <CajaKnowledgeModal 
      :show="showNoteModal"
      :note-to-edit="selectedNote"
      @close="showNoteModal = false"
      @saved="fetchNotes"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import CajaKnowledgeModal from './CajaKnowledgeModal.vue';
import CajaKnowledgeReaderModal from './CajaKnowledgeReaderModal.vue';
import { Search as SearchIcon, Plus as PlusIcon, BookMarked as BookMarkedIcon, Edit3 as EditIcon, Eye as EyeIcon } from 'lucide-vue-next';

const { showErrorToast } = useToasts();

const CATEGORIAS = ['Codificación', 'Cajas', 'Instrumental', 'Sets', 'Equipos', 'Procedimientos', 'Histórico', 'Otros'];

const notes = ref([]);
const loading = ref(true);

const searchQuery = ref('');
const filterCategoria = ref('Todas');
const filterImportancia = ref('Todas');
const filterEstado = ref('Todos');

const currentPage = ref(1);
const itemsPerPage = ref(6);

const showNoteModal = ref(false);
const selectedNote = ref(null);

const showReaderModal = ref(false);
const readerNote = ref(null);

const fetchNotes = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('cajas_knowledge')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    notes.value = data || [];
  } catch (err) {
    console.error('Error cargando base de conocimiento:', err);
    showErrorToast('Error al cargar la base de conocimiento.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNotes();
});

const selectCategoria = (cat) => {
  filterCategoria.value = cat;
  currentPage.value = 1;
};

const filteredNotes = computed(() => {
  return notes.value.filter(note => {
    const q = searchQuery.value.toLowerCase().trim();
    const tagsString = (note.tags || []).join(' ').toLowerCase();
    
    const matchesSearch = !q || 
      note.titulo.toLowerCase().includes(q) || 
      note.contenido.toLowerCase().includes(q) || 
      note.categoria.toLowerCase().includes(q) ||
      tagsString.includes(q);

    const matchesCat = filterCategoria.value === 'Todas' || note.categoria === filterCategoria.value;
    const matchesImp = filterImportancia.value === 'Todas' || note.importancia === filterImportancia.value;
    const matchesEst = filterEstado.value === 'Todos' || note.estado === filterEstado.value;

    return matchesSearch && matchesCat && matchesImp && matchesEst;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotes.value.length / itemsPerPage.value) || 1;
});

const paginatedNotes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredNotes.value.slice(start, start + itemsPerPage.value);
});

const rangeStart = computed(() => {
  if (filteredNotes.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const rangeEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredNotes.value.length);
});

const cleanPreviewSnippet = (content) => {
  if (!content) return '';
  return content
    .replace(/^###\s+/g, '')
    .replace(/^##\s+/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^-\s+/gm, '• ')
    .trim();
};

const openNewNoteModal = () => {
  selectedNote.value = null;
  showNoteModal.value = true;
};

const openEditNoteModal = (note) => {
  selectedNote.value = note;
  showNoteModal.value = true;
};

const openReaderModal = (note) => {
  readerNote.value = note;
  showReaderModal.value = true;
};

const handleEditFromReader = (note) => {
  showReaderModal.value = false;
  openEditNoteModal(note);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const importanceBadgeClass = (imp) => {
  switch (imp) {
    case 'Crítico':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Importante':
      return 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    default:
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }
};

const statusBadgeClass = (estado) => {
  switch (estado) {
    case 'Vigente':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold';
    case 'En revisión':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold';
    default:
      return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
};
</script>
