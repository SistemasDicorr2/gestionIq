<!-- src/components/cajas/CajasCodificacionTab.vue -->
<template>
  <div class="space-y-4">
    
    <!-- Toolbar de Codificación -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      
      <!-- Búsqueda y Filtros -->
      <div class="flex flex-wrap items-center gap-2 flex-grow">
        <!-- Búsqueda por texto -->
        <div class="relative min-w-[200px] flex-grow sm:flex-grow-0">
          <SearchIcon class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            v-model="searchQuery" 
            @input="currentPage = 1"
            type="text" 
            placeholder="Buscar por código, nombre u observación..." 
            class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          />
        </div>

        <!-- Filtro Familia -->
        <select 
          v-model="filterFamilia"
          @change="currentPage = 1"
          class="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="Todos">🌐 Todas las Familias</option>
          <option v-for="f in familias" :key="f" :value="f">{{ f }}</option>
        </select>

        <!-- Filtro Estado -->
        <select 
          v-model="filterEstado"
          @change="currentPage = 1"
          class="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="Todos">Todos los Estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="historico">Histórico</option>
          <option value="anulado">Anulado</option>
        </select>
      </div>

      <!-- Acciones Principales -->
      <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button 
          @click="showDiccionarioModal = true"
          class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpenIcon class="w-4 h-4 text-brand-navy dark:text-brand-cyan" />
          <span>Diccionario</span>
        </button>

        <button 
          @click="showNuevoCodigoModal = true"
          class="px-3.5 py-1.5 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Nuevo código</span>
        </button>
      </div>

    </div>

    <!-- Tabla Principal de Códigos sin desbordamiento lateral excesivo -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      
      <!-- Indicador de carga -->
      <div v-if="loading" class="p-8 text-center text-slate-400 dark:text-slate-500 font-bold text-xs space-y-2">
        <div class="inline-block w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
        <p>Cargando registros de codificación...</p>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="filteredCodigos.length === 0" class="p-12 text-center space-y-3">
        <BoxIcon class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
        <div class="space-y-1">
          <h3 class="text-sm font-black text-slate-700 dark:text-slate-200">No se encontraron códigos</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500">
            No hay registros que coincidan con la búsqueda o la base de datos está vacía.
          </p>
        </div>
        <button 
          @click="showNuevoCodigoModal = true"
          class="px-4 py-2 bg-brand-navy text-white text-xs font-extrabold rounded-xl shadow-2xs inline-flex items-center gap-1.5"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Generar el primer código</span>
        </button>
      </div>

      <!-- Tabla de Datos Optimizada para Pantalla -->
      <template v-else>
        <div class="overflow-x-auto lg:overflow-x-visible">
          <table class="w-full text-left border-collapse layout-fixed text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-black text-[11px] uppercase tracking-wider">
                <th class="px-3 py-2.5 w-[20%]">Código</th>
                <th class="px-3 py-2.5 w-[23%]">Nombre</th>
                <th class="px-2 py-2.5 w-[8%] text-center">Familia</th>
                <th class="px-2 py-2.5 w-[9%] text-center">Clasif.</th>
                <th class="px-2 py-2.5 w-[8%] text-center">Serie</th>
                <th class="px-2 py-2.5 w-[10%] text-center">Estado</th>
                <th class="px-3 py-2.5 w-[10%] hidden xl:table-cell">Observación</th>
                <th class="px-3 py-2.5 w-[12%] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr 
                v-for="item in paginatedCodigos" 
                :key="item.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- Código -->
                <td class="px-3 py-2 font-mono font-black text-brand-navy dark:text-brand-cyan-light text-xs sm:text-xs">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="truncate">{{ item.codigo }}</span>
                    <span v-if="item.es_historico && !item.codigo_base" class="px-1 py-0.2 text-[8px] font-black uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                      Legacy
                    </span>
                  </div>
                </td>

                <!-- Nombre -->
                <td class="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">
                  <div class="truncate max-w-[180px] sm:max-w-[240px] xl:max-w-[280px]" :title="item.nombre">
                    {{ item.nombre || '-' }}
                  </div>
                </td>

                <!-- Familia -->
                <td class="px-2 py-2 text-slate-600 dark:text-slate-300 font-medium text-center">
                  {{ item.familia || '-' }}
                </td>

                <!-- Clasificación -->
                <td class="px-2 py-2 text-slate-600 dark:text-slate-300 font-medium text-center">
                  {{ item.clasificacion || '-' }}
                </td>

                <!-- Serie -->
                <td class="px-2 py-2 font-mono font-bold text-slate-500 dark:text-slate-400 text-center">
                  {{ item.serie !== null && item.serie !== undefined ? '#' + String(item.serie).padStart(3, '0') : '-' }}
                </td>

                <!-- Estado -->
                <td class="px-2 py-2 text-center">
                  <span 
                    :class="badgeClass(item.estado)"
                    class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border inline-block"
                  >
                    {{ item.estado }}
                  </span>
                </td>

                <!-- Observación -->
                <td class="px-3 py-2 text-slate-500 dark:text-slate-400 italic hidden xl:table-cell">
                  <div class="truncate max-w-[150px]" :title="item.observaciones">
                    {{ item.observaciones || '-' }}
                  </div>
                </td>

                <!-- Acciones -->
                <td class="px-3 py-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Botón Modificar / Editar Código -->
                    <button 
                      @click="openEditarModal(item)"
                      type="button"
                      class="p-1 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      title="Modificar datos de este código"
                    >
                      <EditIcon class="w-4 h-4 text-brand-navy dark:text-brand-cyan" />
                    </button>

                    <!-- Botón Generar Etiqueta 12x3 cm -->
                    <button 
                      @click="openEtiquetaModal(item)"
                      type="button"
                      class="p-1 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      title="Generar y Descargar Etiqueta Oficial (12cm x 3cm)"
                    >
                      <TagIcon class="w-4 h-4 text-brand-cyan" />
                    </button>

                    <!-- Selector Estado -->
                    <select 
                      :value="item.estado" 
                      @change="updateEstado(item.id, $event.target.value)"
                      class="px-1.5 py-0.5 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="historico">Histórico</option>
                      <option value="anulado">Anulado</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PaginaciónCliente -->
        <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div class="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
            Mostrando <span class="font-bold text-slate-900 dark:text-white">{{ rangeStart }} - {{ rangeEnd }}</span> de <span class="font-bold text-slate-900 dark:text-white">{{ filteredCodigos.length }}</span> códigos
          </div>

          <div class="flex items-center gap-2">
            <!-- Selector Items Por Página -->
            <select 
              v-model="itemsPerPage" 
              @change="currentPage = 1"
              class="px-2 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option :value="15">15 por pág.</option>
              <option :value="25">25 por pág.</option>
              <option :value="50">50 por pág.</option>
              <option :value="100">100 por pág.</option>
            </select>

            <!-- Botones Paginador -->
            <div class="flex items-center gap-1">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Anterior
              </button>
              
              <span class="px-2 font-bold text-slate-700 dark:text-slate-300">
                {{ currentPage }} / {{ totalPages }}
              </span>

              <button 
                @click="currentPage++" 
                :disabled="currentPage >= totalPages"
                class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>

        </div>
      </template>

    </div>

    <!-- Modales -->
    <CajaCodigoModal 
      :show="showNuevoCodigoModal"
      :dictionary-entries="dictionaryEntries"
      @close="showNuevoCodigoModal = false"
      @created="handleCodeCreated"
    />

    <CajasDiccionarioModal 
      :show="showDiccionarioModal"
      :entries="dictionaryEntries"
      @close="showDiccionarioModal = false"
      @refresh="fetchDictionary"
    />

    <CajaEtiquetaModal 
      :show="showEtiquetaModal"
      :item="selectedItemForEtiqueta"
      @close="showEtiquetaModal = false"
    />

    <CajaEditarCodigoModal 
      :show="showEditarModal"
      :item="selectedItemForEditar"
      :dictionary-entries="dictionaryEntries"
      @close="showEditarModal = false"
      @updated="fetchCodigos"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import CajaCodigoModal from './CajaCodigoModal.vue';
import CajasDiccionarioModal from './CajasDiccionarioModal.vue';
import CajaEtiquetaModal from './CajaEtiquetaModal.vue';
import CajaEditarCodigoModal from './CajaEditarCodigoModal.vue';
import { Search as SearchIcon, Plus as PlusIcon, BookOpen as BookOpenIcon, Box as BoxIcon, Tag as TagIcon, Edit3 as EditIcon } from 'lucide-vue-next';

const { showSuccessToast, showErrorToast } = useToasts();

const codigos = ref([]);
const dictionaryEntries = ref([]);
const loading = ref(true);

const searchQuery = ref('');
const filterFamilia = ref('Todos');
const filterEstado = ref('Todos');

const currentPage = ref(1);
const itemsPerPage = ref(25);

const showNuevoCodigoModal = ref(false);
const showDiccionarioModal = ref(false);
const showEtiquetaModal = ref(false);
const showEditarModal = ref(false);
const selectedItemForEtiqueta = ref(null);
const selectedItemForEditar = ref(null);

const fetchCodigos = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('cajas_codigos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    codigos.value = data || [];
  } catch (err) {
    console.error('Error cargando códigos de cajas:', err);
    showErrorToast('Error al cargar la lista de códigos.');
  } finally {
    loading.value = false;
  }
};

const fetchDictionary = async () => {
  try {
    const { data, error } = await supabase
      .from('cajas_diccionario')
      .select('*')
      .order('grupo', { ascending: true });
    if (error) throw error;
    dictionaryEntries.value = data || [];
  } catch (err) {
    console.error('Error cargando diccionario:', err);
  }
};

const openEtiquetaModal = (item) => {
  selectedItemForEtiqueta.value = item;
  showEtiquetaModal.value = true;
};

const openEditarModal = (item) => {
  selectedItemForEditar.value = item;
  showEditarModal.value = true;
};

const handleCodeCreated = async (newItem) => {
  await fetchCodigos();
  if (newItem) {
    openEtiquetaModal(newItem);
  }
};

onMounted(() => {
  fetchCodigos();
  fetchDictionary();
});

const familias = computed(() => {
  const set = new Set(codigos.value.map(c => c.familia).filter(Boolean));
  return Array.from(set);
});

const filteredCodigos = computed(() => {
  return codigos.value.filter(item => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchesSearch = !q || 
      item.codigo.toLowerCase().includes(q) || 
      (item.nombre && item.nombre.toLowerCase().includes(q)) || 
      (item.observaciones && item.observaciones.toLowerCase().includes(q));

    const matchesFamilia = filterFamilia.value === 'Todos' || item.familia === filterFamilia.value;
    const matchesEstado = filterEstado.value === 'Todos' || item.estado === filterEstado.value;

    return matchesSearch && matchesFamilia && matchesEstado;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredCodigos.value.length / itemsPerPage.value) || 1;
});

const paginatedCodigos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCodigos.value.slice(start, start + itemsPerPage.value);
});

const rangeStart = computed(() => {
  if (filteredCodigos.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const rangeEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredCodigos.value.length);
});

const badgeClass = (estado) => {
  switch (estado) {
    case 'activo':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'inactivo':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    case 'historico':
      return 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    case 'anulado':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
  }
};

const updateEstado = async (id, newEstado) => {
  try {
    const { error } = await supabase
      .from('cajas_codigos')
      .update({ estado: newEstado, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    showSuccessToast(`Estado actualizado a "${newEstado}".`);
    await fetchCodigos();
  } catch (err) {
    console.error('Error actualizando estado:', err);
    showErrorToast('No se pudo actualizar el estado.');
  }
};
</script>
