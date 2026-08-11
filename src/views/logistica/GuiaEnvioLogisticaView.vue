<!-- src/views/logistica/GuiaEnvioLogisticaView.vue -->
<template>
  <div class="max-w-5xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-24">
    
    <!-- HEADER Y NAVEGACIÓN -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4 print:hidden">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            REG03-01-01-C
          </span>
          <h1 class="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Guía de Envío de Materiales
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generador documental de guías de despacho para instrumental, implantes y equipos médicos.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <router-link 
          :to="{ name: 'LogisticaInformes' }" 
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver a Logística</span>
        </router-link>
      </div>
    </div>

    <!-- CONTENEDOR PRINCIPAL INTERACTIVO (OCULTO EN IMPRESIÓN) -->
    <div class="space-y-6 print:hidden">
      
      <!-- PASO 1: DATOS DEL FORMULARIO Y BÚSQUEDA READ-ONLY -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Datos de la Guía de Envío
            </h2>
          </div>
          <span class="text-[11px] text-slate-400 italic">
            * Consulta de cirugías 100% Read-Only (sin alterar la BD)
          </span>
        </div>

        <!-- BUSCADOR READ-ONLY DE PACIENTE / CIRUGÍA -->
        <div class="space-y-2 relative">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            🔎 Autocompletar desde Cirugía / Paciente Existente
          </label>

          <!-- Chip de cirugía seleccionada -->
          <div v-if="selectedCirugia" class="flex items-center justify-between p-3 bg-blue-50/80 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
            <div class="space-y-0.5">
              <span class="font-extrabold text-blue-950 dark:text-blue-100 text-sm block">{{ selectedCirugia.paciente }}</span>
              <div class="flex gap-3 text-[11px] text-blue-800 dark:text-blue-300 flex-wrap">
                <span>Cliente: <strong>{{ selectedCirugia.cliente || '-' }}</strong></span>
                <span>Médico: <strong>{{ selectedCirugia.medico || '-' }}</strong></span>
                <span>Lugar: <strong>{{ selectedCirugia.institucion || '-' }}</strong></span>
              </div>
            </div>

            <button 
              type="button" 
              @click="clearSelectedCirugia" 
              class="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 rounded-lg border border-rose-200 dark:border-rose-900 cursor-pointer"
            >
              Limpiar
            </button>
          </div>

          <!-- Input de búsqueda -->
          <div v-else class="relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar por paciente, médico o sanatorio para pre-rellenar datos..." 
              @input="onSearchInput"
              @focus="showDropdown = true"
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>

            <!-- Dropdown de resultados -->
            <div 
              v-if="showDropdown && (isSearching || searchResults.length > 0)" 
              class="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-1"
            >
              <div v-if="isSearching" class="p-3 text-center text-xs text-slate-400">
                Buscando en la base de datos...
              </div>

              <template v-else>
                <div 
                  v-for="item in searchResults" 
                  :key="item.id"
                  @click="selectCirugia(item)"
                  class="p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors space-y-0.5 border border-transparent hover:border-blue-200"
                >
                  <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>{{ item.paciente || 'Paciente sin nombre' }}</span>
                    <span v-if="item.id_cirugia" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                      {{ item.id_cirugia }}
                    </span>
                  </div>
                  <div class="flex gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span v-if="item.cliente">Cliente: {{ item.cliente }}</span>
                    <span v-if="item.medico">Médico: {{ item.medico }}</span>
                    <span v-if="item.institucion">Lugar: {{ item.institucion }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- FORMULARIO EDITABLE DE LA GUÍA DE ENVÍO -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CLIENTE *</label>
            <input v-model="form.cliente" type="text" placeholder="Ej: BIOPROTECE / OSDE" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">MÉDICO CIRUJANO</label>
            <input v-model="form.medico" type="text" placeholder="Ej: Dr. González" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PACIENTE</label>
            <input v-model="form.paciente" type="text" placeholder="Ej: Ortiz Leandro" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">LUGAR DE ENTREGA</label>
            <input v-model="form.lugar_entrega" type="text" placeholder="Ej: Sanatorio Vinto / Depósito Central" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FECHA DE CX</label>
            <input v-model="form.fecha_cx" type="date" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FECHA DE ENVÍO *</label>
            <input v-model="form.fecha_envio" type="date" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TRANSPORTE *</label>
            <input v-model="form.transporte" type="text" placeholder="Ej: EMA PACK / ANDREANI / PROPIO" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">N° DE GUÍA *</label>
            <input v-model="form.numero_guia" type="text" placeholder="Ej: R-0044-00000771" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-mono font-bold" />
          </div>

          <div class="sm:col-span-2">
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">OBSERVACIONES</label>
            <textarea v-model="form.observaciones" rows="2" placeholder="Ej: ENVIO DE INSTRUMENTAL PARA REPARACION Y ACONDICIONAMIENTO" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white font-medium"></textarea>
          </div>
        </div>
      </div>

      <!-- PASO 2: ADJUNTO Y REORDENAMIENTO DE FOTOGRAFÍAS -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">2</span>
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Fotografías del Instrumental / Cajas ({{ imagenes.length }})
            </h2>
          </div>

          <label class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ Agregar Fotos</span>
            <input type="file" accept="image/*" multiple @change="handleImageUpload" class="hidden" />
          </label>
        </div>

        <div v-if="isUploadingImages" class="p-4 text-center text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 animate-pulse">
          ⏳ Subiendo imágenes temporales a R2...
        </div>

        <div v-if="imagenes.length === 0" class="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-2">
          <svg class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="text-xs font-bold block">No hay imágenes adjuntas</span>
          <p class="text-[11px] text-slate-500">Subí fotos de las bandejas o recipientes. Cada foto se ubicará automáticamente en su propia hoja A4 en el PDF.</p>
        </div>

        <!-- GALERÍA DE MINIATURAS CON REORDENAMIENTO Y ELIMINACIÓN -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div 
            v-for="(img, idx) in imagenes" 
            :key="img.id || idx"
            class="group relative bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col items-center gap-2 shadow-2xs"
          >
            <div class="w-full h-36 bg-slate-900/5 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative">
              <img :src="img.url" class="max-w-full max-h-full object-contain mx-auto my-auto block" />
              <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-white font-mono text-[10px] font-black">
                Hoja {{ idx + 2 }}
              </span>
            </div>

            <div class="flex items-center justify-between w-full pt-1 border-t border-slate-200 dark:border-slate-700">
              <div class="flex items-center gap-1">
                <button 
                  type="button" 
                  @click="moveImageUp(idx)" 
                  :disabled="idx === 0"
                  class="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                  title="Mover foto arriba / antes"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                
                <button 
                  type="button" 
                  @click="moveImageDown(idx)" 
                  :disabled="idx === imagenes.length - 1"
                  class="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                  title="Mover foto abajo / después"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

              <button 
                type="button" 
                @click="removeImage(idx)" 
                class="p-1 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 rounded cursor-pointer"
                title="Eliminar esta foto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 3: BOTÓN DE IMPRESIÓN Y GUARDADO DE HISTORIAL -->
      <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="space-y-0.5 text-center sm:text-left">
          <h3 class="text-sm font-black text-slate-900 dark:text-white">
            Generar Guía de Envío Imprimible
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Se generará el reporte A4 esquematizado y se registrará la entrada en el historial de guías.
          </p>
        </div>

        <button 
          type="button" 
          @click="generateAndPrintPDF" 
          :disabled="isGeneratingPDF || !form.cliente.trim() || !form.fecha_envio || !form.numero_guia.trim()"
          class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 w-full sm:w-auto min-h-[44px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 0_0-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          <span>{{ isGeneratingPDF ? 'Procesando Documento...' : '🖨️ Generar y Descargar PDF' }}</span>
        </button>
      </div>

      <!-- SECCIÓN DE ÚLTIMAS GUÍAS GENERADAS (HISTORIAL CENTRALIZADO EN SUPABASE) -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            📋 Últimas Guías Generadas en Districorr (Historial)
          </h3>
          <span class="text-[11px] font-bold text-slate-400">Últimas 20 guías</span>
        </div>

        <div v-if="loadingHistory" class="py-6 text-center text-xs text-slate-400">
          Cargando historial de guías...
        </div>

        <div v-else-if="recentGuides.length === 0" class="py-6 text-center text-xs text-slate-400">
          No hay guías de envío registradas aún.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                <th class="py-2 px-3">Fecha Envío</th>
                <th class="py-2 px-3">Paciente / Cliente</th>
                <th class="py-2 px-3">Transporte</th>
                <th class="py-2 px-3">N° Guía</th>
                <th class="py-2 px-3">Generado Por</th>
                <th class="py-2 px-3 text-center">Fotos</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr v-for="g in recentGuides" :key="g.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="py-2.5 px-3 font-mono font-bold">{{ formatDate(g.fecha_envio) }}</td>
                <td class="py-2.5 px-3">
                  <span class="font-extrabold text-slate-900 dark:text-white block">{{ g.paciente || g.cliente }}</span>
                  <span class="text-[10px] text-slate-500 block">{{ g.lugar_entrega || '-' }}</span>
                </td>
                <td class="py-2.5 px-3">{{ g.transporte }}</td>
                <td class="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{{ g.numero_guia }}</td>
                <td class="py-2.5 px-3 text-[11px] text-slate-500">{{ g.created_by_nombre || 'Sistema' }}</td>
                <td class="py-2.5 px-3 text-center font-mono font-bold">{{ g.cantidad_imagenes || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- DOCUMENTO A4 PARA IMPRESIÓN (SOLO SE MUESTRA EN IMPRESIÓN O EN MODO PREVIA) -->
    <div :class="['w-full', showPrintView ? 'block' : 'hidden print:block']">
      <GuiaEnvioPDF :guia="form" :imagenes="imagenes" />
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import GuiaEnvioPDF from '../../components/logistica/GuiaEnvioPDF.vue';

const toast = useToast();

const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const showDropdown = ref(false);
const selectedCirugia = ref(null);

const imagenes = ref([]);
const isUploadingImages = ref(false);
const isGeneratingPDF = ref(false);
const showPrintView = ref(false);

const recentGuides = ref([]);
const loadingHistory = ref(false);
const currentUserId = ref(null);
const currentUserName = ref('');

const form = reactive({
  cliente: 'BIOPROTECE',
  medico: '',
  paciente: '',
  lugar_entrega: '',
  fecha_cx: '',
  fecha_envio: new Date().toISOString().slice(0, 10),
  transporte: 'EMA PACK',
  numero_guia: `R-0044-${Math.floor(10000000 + Math.random() * 90000000)}`,
  observaciones: 'ENVIO DE INSTRUMENTAL PARA REPARACION Y ACONDICIONAMIENTO'
});

let searchTimeout = null;
const onSearchInput = () => {
  showDropdown.value = true;
  clearTimeout(searchTimeout);
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true;
      const q = `%${searchQuery.value.trim()}%`;
      const { data, error } = await supabase
        .from('logistica_informe_movimientos')
        .select('id, paciente_snapshot, medico_snapshot, institucion_snapshot, cliente_snapshot, fecha_cirugia_snapshot, id_cirugia_snapshot')
        .or(`paciente_snapshot.ilike.${q},medico_snapshot.ilike.${q},institucion_snapshot.ilike.${q},cliente_snapshot.ilike.${q}`)
        .limit(10);

      if (error) throw error;
      searchResults.value = (data || []).map(m => ({
        id: m.id,
        paciente: m.paciente_snapshot,
        medico: m.medico_snapshot,
        institucion: m.institucion_snapshot,
        cliente: m.cliente_snapshot,
        fecha_cirugia: m.fecha_cirugia_snapshot,
        id_cirugia: m.id_cirugia_snapshot
      }));
    } catch (err) {
      console.error(err);
    } finally {
      isSearching.value = false;
    }
  }, 250);
};

const selectCirugia = (cirugia) => {
  selectedCirugia.value = cirugia;
  searchQuery.value = cirugia.paciente || '';
  showDropdown.value = false;

  // Autocompletar solo valores iniciales del formulario (Read-Only)
  if (cirugia.cliente) form.cliente = cirugia.cliente;
  if (cirugia.medico) form.medico = cirugia.medico;
  if (cirugia.paciente) form.paciente = cirugia.paciente;
  if (cirugia.institucion) form.lugar_entrega = cirugia.institucion;
  if (cirugia.fecha_cirugia) form.fecha_cx = cirugia.fecha_cirugia;
};

const clearSelectedCirugia = () => {
  selectedCirugia.value = null;
  searchQuery.value = '';
};

// Subida de imágenes a R2 temporal mediante b2-presigned-url
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  try {
    isUploadingImages.value = true;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const uuidPath = crypto.randomUUID();

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const baseName = crypto.randomUUID();
      const localObjectUrl = URL.createObjectURL(file);

      try {
        const { data: presignedData, error: presignedErr } = await supabase.functions.invoke('b2-presigned-url', {
          body: {
            area: 'guias-envio-temp',
            owner: `${yyyy}/${mm}/${dd}/${uuidPath}`,
            contentType: file.type || 'image/jpeg',
            extension: ext,
            isThumb: false,
            baseName: baseName
          }
        });

        if (!presignedErr && presignedData?.uploadUrl) {
          await fetch(presignedData.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'image/jpeg' }
          });
        }
      } catch (r2Err) {
        console.warn('Fallback a URL local:', r2Err);
      }

      imagenes.value.push({
        id: baseName,
        url: localObjectUrl,
        file: file
      });
    }

    toast.success(`${files.length} ${files.length === 1 ? 'fotografía añadida' : 'fotografías añadidas'}.`);
  } catch (err) {
    toast.error('Error al cargar imágenes: ' + err.message);
  } finally {
    isUploadingImages.value = false;
    e.target.value = '';
  }
};

const moveImageUp = (index) => {
  if (index <= 0) return;
  const temp = imagenes.value[index];
  imagenes.value[index] = imagenes.value[index - 1];
  imagenes.value[index - 1] = temp;
};

const moveImageDown = (index) => {
  if (index >= imagenes.value.length - 1) return;
  const temp = imagenes.value[index];
  imagenes.value[index] = imagenes.value[index + 1];
  imagenes.value[index + 1] = temp;
};

const removeImage = (index) => {
  const img = imagenes.value[index];
  if (img?.url && img.url.startsWith('blob:')) {
    URL.revokeObjectURL(img.url);
  }
  imagenes.value.splice(index, 1);
};

const fetchRecentGuides = async () => {
  try {
    loadingHistory.value = true;
    const { data, error } = await supabase
      .from('logistica_guias_envio')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      recentGuides.value = data;
    }
  } catch (err) {
    console.warn('Historial de guías no disponible:', err);
  } finally {
    loadingHistory.value = false;
  }
};

const generateAndPrintPDF = async () => {
  if (!form.cliente.trim() || !form.numero_guia.trim() || !form.fecha_envio) {
    toast.error('Por favor completa Cliente, Fecha de Envío y N° de Guía.');
    return;
  }

  try {
    isGeneratingPDF.value = true;

    // Guardar registro liviano en el historial de Supabase (sin afectar cirugías)
    try {
      await supabase.from('logistica_guias_envio').insert({
        created_by_user_id: currentUserId.value,
        created_by_nombre: currentUserName.value,
        reporte_id: selectedCirugia.value?.id || null,
        cliente: form.cliente.trim(),
        medico: form.medico.trim() || null,
        paciente: form.paciente.trim() || null,
        lugar_entrega: form.lugar_entrega.trim() || null,
        fecha_cx: form.fecha_cx || null,
        fecha_envio: form.fecha_envio,
        transporte: form.transporte.trim() || null,
        numero_guia: form.numero_guia.trim(),
        observaciones: form.observaciones.trim() || null,
        cantidad_imagenes: imagenes.value.length
      });

      await fetchRecentGuides();
    } catch (dbErr) {
      console.warn('Advertencia al registrar historial:', dbErr);
    }

    // Ejecutar impresión directa
    toast.success('Abriendo diálogo de impresión A4...');
    setTimeout(() => {
      window.print();
    }, 200);

  } catch (err) {
    toast.error('Error al generar PDF: ' + err.message);
  } finally {
    isGeneratingPDF.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};

onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      currentUserId.value = session.user.id;
      currentUserName.value = session.user.user_metadata?.nombre_completo 
        || session.user.user_metadata?.nombre 
        || 'Operario Logística';
    }
    await fetchRecentGuides();
  } catch (err) {
    console.error(err);
  }
});
</script>
