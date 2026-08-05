<!-- src/components/logistica/CirugiaSearchModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-700">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Vincular Cirugía Existente de Gestión IQ
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Selección en modo lectura para snapshot histórico del informe.
          </p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Buscador -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40">
        <div class="relative">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Buscar por paciente, médico, cliente, institución o ID..." 
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white placeholder-slate-400"
            @input="handleSearch"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <!-- Resultados -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2.5">
        <div v-if="loading" class="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
          <svg class="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-xs">Consultando cirugías...</span>
        </div>

        <div v-else-if="results.length === 0" class="text-center py-8 text-slate-400 text-xs">
          No se encontraron cirugías con el término ingresado.
        </div>

        <div 
          v-else 
          v-for="cirugia in results" 
          :key="cirugia.id"
          @click="selectCirugia(cirugia)"
          class="p-3 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer space-y-1"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white truncate">
              {{ cirugia.paciente || 'Paciente no especificado' }}
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
              {{ cirugia.id_cirugia }}
            </span>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span v-if="cirugia.cliente">🏢 {{ cirugia.cliente }}</span>
            <span>👨‍⚕️ {{ cirugia.medico || 'Médico n/a' }}</span>
            <span>🏥 {{ cirugia.institucion || 'Institución n/a' }}</span>
            <span v-if="cirugia.fecha_cirugia">📅 {{ formatDate(cirugia.fecha_cirugia) }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
        <button @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'select']);
const toast = useToast();

const searchTerm = ref('');
const results = ref([]);
const loading = ref(false);

const fetchCirugias = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase.rpc('buscar_cirugias_logistica', {
      p_busqueda: searchTerm.value.trim()
    });

    if (error) {
      // Fallback local a tabla reportes si RPC aún no fue desplegada
      const { data: fallbackData, error: fbErr } = await supabase
        .from('reportes')
        .select('id, id_cirugia, cliente, paciente, medico, lugar_cirugia, fecha_cirugia')
        .or(`paciente.ilike.%${searchTerm.value}%,medico.ilike.%${searchTerm.value}%,cliente.ilike.%${searchTerm.value}%,lugar_cirugia.ilike.%${searchTerm.value}%,id_cirugia.ilike.%${searchTerm.value}%`)
        .order('created_at', { ascending: false })
        .limit(30);

      if (fbErr) throw fbErr;
      results.value = (fallbackData || []).map(r => ({
        id: r.id,
        id_cirugia: r.id_cirugia,
        cliente: r.cliente,
        paciente: r.paciente,
        medico: r.medico,
        institucion: r.lugar_cirugia,
        fecha_cirugia: r.fecha_cirugia
      }));
    } else {
      results.value = data || [];
    }
  } catch (err) {
    toast.error('Error al consultar cirugías: ' + err.message);
  } finally {
    loading.value = false;
  }
};

let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchCirugias, 300);
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    searchTerm.value = '';
    fetchCirugias();
  }
});

const selectCirugia = (cirugia) => {
  emit('select', cirugia);
  emit('close');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};
</script>
