<!-- src/views/logistica/ConciliacionFletesView.vue -->
<template>
  <div class="max-w-5xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-24 px-3 sm:px-0">
    
    <!-- HEADER CORPORATIVO -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            REG03-LOG-CONC
          </span>
          <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Conciliación & Auditoría
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>⚖️ Conciliación de Fletes y Remitos</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Cruce de guías de despacho con cirugías, clientes (obras sociales), médicos cirujanos y validación de costos de transporte.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
        <button 
          type="button" 
          @click="exportarPDF" 
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>📥 PDF Conciliación</span>
        </button>

        <button 
          type="button" 
          @click="exportarExcel" 
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>🟢 Exportar Excel</span>
        </button>

        <router-link 
          :to="{ name: 'LogisticaGuiaEnvio' }" 
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs"
        >
          <span>📄 Ir a Guías de Envío</span>
        </router-link>
      </div>
    </div>

    <!-- TARJETAS KPIS RESUMEN -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-2xs">
        <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Guías / Remitos</span>
        <div class="text-xl font-black text-slate-900 dark:text-white font-mono">
          {{ summary.stats.totalGuias }}
        </div>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-2xs">
        <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Bultos Despachados</span>
        <div class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
          {{ summary.stats.totalBultos }}
        </div>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-2xs">
        <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Costo Fletes Acumulado</span>
        <div class="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
          $ {{ formatMoney(summary.stats.totalCosto) }}
        </div>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-2xs">
        <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Conciliación</span>
        <div class="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
          {{ summary.stats.porcentajeConciliado }}%
        </div>
      </div>
    </div>

    <!-- FILTROS Y CONTROLES DE BÚSQUEDA -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">🔎 Búsqueda rápida</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por cliente, médico, paciente o N° guía..." 
            class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">🚚 Empresa de Transporte</label>
          <select 
            v-model="selectedTransporte" 
            class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white cursor-pointer font-medium"
          >
            <option value="TODOS">🌐 Todos los Transportes</option>
            <option v-for="t in transportesOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">📋 Estado de Conciliación</label>
          <select 
            v-model="selectedEstado" 
            class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white cursor-pointer font-medium"
          >
            <option value="TODOS">🌐 Todos los Estados</option>
            <option value="Conciliado">✅ Conciliado</option>
            <option value="Pendiente">⏳ Pendiente</option>
            <option value="Con Observación">⚠️ Con Observación</option>
          </select>
        </div>

      </div>
    </div>

    <!-- PESTAÑAS PRINCIPALES DE VISTA -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <div class="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-extrabold overflow-x-auto">
        <button 
          type="button" 
          @click="activeTab = 'cliente'" 
          class="px-5 py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          :class="activeTab === 'cliente' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          <span>🏢 Por Cliente ({{ summary.byCliente.length }})</span>
        </button>

        <button 
          type="button" 
          @click="activeTab = 'medico'" 
          class="px-5 py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          :class="activeTab === 'medico' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          <span>👨‍⚕️ Por Médico Cirujano ({{ summary.byMedico.length }})</span>
        </button>

        <button 
          type="button" 
          @click="activeTab = 'detalle'" 
          class="px-5 py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          :class="activeTab === 'detalle' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          <span>🚚 Auditoría de Costos por Guía ({{ filteredGuias.length }})</span>
        </button>
      </div>

      <!-- CONTENIDO PESTAÑA 1: POR CLIENTE -->
      <div v-if="activeTab === 'cliente'" class="p-4 sm:p-5">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                <th class="py-2.5 px-3">Cliente / Obra Social / Institución</th>
                <th class="py-2.5 px-3 text-center">N° de Guías</th>
                <th class="py-2.5 px-3 text-center">Bultos Despachados</th>
                <th class="py-2.5 px-3 text-right">Costo Acumulado Fletes</th>
                <th class="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr v-if="summary.byCliente.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400 italic">No hay registros para mostrar.</td>
              </tr>

              <tr v-for="c in summary.byCliente" :key="c.cliente" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                  {{ c.cliente }}
                </td>
                <td class="py-3 px-3 text-center font-mono font-bold">{{ c.guiasCount }}</td>
                <td class="py-3 px-3 text-center font-mono font-black text-blue-600 dark:text-blue-400">{{ c.bultosCount }}</td>
                <td class="py-3 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                  $ {{ formatMoney(c.costoTotal) }}
                </td>
                <td class="py-3 px-3 text-center">
                  <button 
                    type="button" 
                    @click="filterByCliente(c.cliente)" 
                    class="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    Ver Guías
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONTENIDO PESTAÑA 2: POR MÉDICO -->
      <div v-if="activeTab === 'medico'" class="p-4 sm:p-5">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                <th class="py-2.5 px-3">Médico Cirujano</th>
                <th class="py-2.5 px-3 text-center">N° de Guías</th>
                <th class="py-2.5 px-3 text-center">Bultos Despachados</th>
                <th class="py-2.5 px-3 text-right">Costo Acumulado Fletes</th>
                <th class="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr v-if="summary.byMedico.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400 italic">No hay registros para mostrar.</td>
              </tr>

              <tr v-for="m in summary.byMedico" :key="m.medico" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                  {{ m.medico }}
                </td>
                <td class="py-3 px-3 text-center font-mono font-bold">{{ m.guiasCount }}</td>
                <td class="py-3 px-3 text-center font-mono font-black text-blue-600 dark:text-blue-400">{{ m.bultosCount }}</td>
                <td class="py-3 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                  $ {{ formatMoney(m.costoTotal) }}
                </td>
                <td class="py-3 px-3 text-center">
                  <button 
                    type="button" 
                    @click="filterByMedico(m.medico)" 
                    class="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    Ver Guías
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONTENIDO PESTAÑA 3: AUDITORÍA DE COSTOS POR GUÍA -->
      <div v-if="activeTab === 'detalle'" class="p-4 sm:p-5">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                <th class="py-2.5 px-3">N° Guía / Remito</th>
                <th class="py-2.5 px-3">Fecha</th>
                <th class="py-2.5 px-3">Transporte</th>
                <th class="py-2.5 px-3">Cliente / Médico</th>
                <th class="py-2.5 px-3 text-center">Bultos</th>
                <th class="py-2.5 px-3 text-right">Costo Flete ($)</th>
                <th class="py-2.5 px-3 text-center">Estado Conciliación</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr v-if="filteredGuias.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400 italic">No hay guías para conciliar con los filtros actuales.</td>
              </tr>

              <tr v-for="g in filteredGuias" :key="g.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="py-3 px-3 font-mono font-black text-blue-600 dark:text-blue-400">
                  {{ g.numero_guia }}
                </td>
                <td class="py-3 px-3 font-mono text-slate-500">
                  {{ formatDate(g.fecha_envio) }}
                </td>
                <td class="py-3 px-3">
                  <span class="font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {{ g.transporte }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span class="font-extrabold text-slate-900 dark:text-white block">{{ g.cliente }}</span>
                  <span class="text-[10px] text-slate-500 block">{{ g.medico }}</span>
                </td>
                <td class="py-3 px-3 text-center font-mono font-extrabold">
                  {{ g.bultos }}
                </td>
                <td class="py-3 px-3 text-right font-mono">
                  <input 
                    type="number" 
                    step="50"
                    v-model.number="g.costo" 
                    @change="updateCost(g)"
                    placeholder="0.00"
                    class="w-24 text-right px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </td>
                <td class="py-3 px-3 text-center">
                  <select 
                    v-model="g.estado" 
                    @change="updateCost(g)"
                    class="px-2 py-1 text-[11px] font-extrabold rounded-lg border focus:outline-none cursor-pointer"
                    :class="[
                      g.estado === 'Conciliado' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                      g.estado === 'Con Observación' ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                    ]"
                  >
                    <option value="Conciliado">✅ Conciliado</option>
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="Con Observación">⚠️ Con Observación</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import * as XLSX from 'xlsx';
import { buildConciliacionSummary } from '../../utils/conciliacionHelpers';
import { useConciliacionPDF } from '../../composables/useConciliacionPDF';

const toast = useToast();
const { generateConciliacionPDF } = useConciliacionPDF();

const activeTab = ref('cliente'); // 'cliente' | 'medico' | 'detalle'
const searchQuery = ref('');
const selectedTransporte = ref('TODOS');
const selectedEstado = ref('TODOS');

const rawGuias = ref([]);
const rawMovimientos = ref([]);
const costsMap = ref({});

const STORAGE_KEY = 'districorr_fletes_costs_map';

const loadCostsFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      costsMap.value = JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Error al cargar mapa de costos local:', err);
  }
};

const saveCostsToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(costsMap.value));
  } catch (err) {
    console.warn('Error al guardar mapa de costos local:', err);
  }
};

const updateCost = (item) => {
  if (!item || !item.numero_guia) return;
  costsMap.value[item.numero_guia] = {
    costo: item.costo || 0,
    estado: item.estado || 'Pendiente',
    notas: item.observaciones || ''
  };
  saveCostsToStorage();
  toast.success(`Costo/Estado de guía ${item.numero_guia} guardado.`);
};

const fetchAllData = async () => {
  loadCostsFromStorage();
  try {
    const [guiasRes, movsRes] = await Promise.all([
      supabase.from('logistica_guias_envio').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('logistica_informe_movimientos').select('*').order('created_at', { ascending: false }).limit(100)
    ]);

    if (guiasRes.data) rawGuias.value = guiasRes.data;
    if (movsRes.data) rawMovimientos.value = movsRes.data;
  } catch (err) {
    console.warn('Error al cargar guías y movimientos para conciliación:', err);
  }
};

const summary = computed(() => {
  return buildConciliacionSummary(rawGuias.value, rawMovimientos.value, costsMap.value);
});

const transportesOptions = computed(() => {
  const set = new Set();
  summary.value.guiasDetalle.forEach(g => {
    if (g.transporte) set.add(g.transporte);
  });
  return Array.from(set).sort();
});

const filteredGuias = computed(() => {
  let list = summary.value.guiasDetalle || [];

  if (selectedTransporte.value !== 'TODOS') {
    list = list.filter(g => g.transporte === selectedTransporte.value);
  }

  if (selectedEstado.value !== 'TODOS') {
    list = list.filter(g => g.estado === selectedEstado.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(g => 
      g.cliente.toLowerCase().includes(q) ||
      g.medico.toLowerCase().includes(q) ||
      g.paciente.toLowerCase().includes(q) ||
      g.numero_guia.toLowerCase().includes(q) ||
      g.transporte.toLowerCase().includes(q)
    );
  }

  return list;
});

const filterByCliente = (clienteName) => {
  searchQuery.value = clienteName;
  activeTab.value = 'detalle';
};

const filterByMedico = (medicoName) => {
  searchQuery.value = medicoName;
  activeTab.value = 'detalle';
};

const formatMoney = (val) => {
  return Number(val || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};

const exportarPDF = () => {
  const filterDesc = selectedTransporte.value !== 'TODOS' ? `Transporte: ${selectedTransporte.value}` : '';
  generateConciliacionPDF(summary.value, filterDesc);
};

const exportarExcel = () => {
  try {
    const dataToExport = filteredGuias.value.map(g => ({
      'N° Guía / Remito': g.numero_guia,
      'Fecha': g.fecha_envio,
      'Empresa Transporte': g.transporte,
      'Cliente / Obra Social': g.cliente,
      'Médico Cirujano': g.medico,
      'Paciente': g.paciente,
      'Lugar de Entrega': g.lugar_entrega,
      'Bultos': g.bultos,
      'Costo Flete ($)': g.costo,
      'Estado Conciliación': g.estado
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Conciliacion_Fletes');
    
    const filename = `Conciliacion_Fletes_Districorr_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
    toast.success(`Archivo Excel "${filename}" descargado.`);
  } catch (err) {
    toast.error('Error al exportar a Excel: ' + err.message);
  }
};

onMounted(async () => {
  await fetchAllData();
});
</script>
