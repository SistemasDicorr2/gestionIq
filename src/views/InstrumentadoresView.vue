<!-- src/views/InstrumentadoresView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
    <!-- Header Principal -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ headerTitle }}
          </h1>
          <span v-if="activeTab === 'lista' && !loading" class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            {{ processedInstrumentadores.length }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gestión de perfiles profesionales, accesos al portal de actividad y métricas de rendimiento.
        </p>
      </div>

      <div v-if="activeTab === 'lista'" class="flex items-center gap-2.5 w-full sm:w-auto">
        <button @click="openImportModal" class="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs">
          <ArrowUpTrayIcon class="w-4 h-4 text-slate-500" />
          <span>Importar XLS</span>
        </button>
        <button @click="openNewModal" class="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs">
          <PlusIcon class="w-4 h-4" />
          <span>Nuevo Instrumentador</span>
        </button>
      </div>
    </div>

    <!-- Sistema de Pestañas Nav -->
    <div class="border-b border-slate-200 dark:border-slate-700">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button @click="activeTab = 'lista'" :class="getTabClass('lista')">
          <UserGroupIcon class="w-4 h-4" />
          <span>Lista de Instrumentadores</span>
        </button>
        <button @click="activeTab = 'ranking'" :class="getTabClass('ranking')">
          <TrophyIcon class="w-4 h-4" />
          <span>Ranking de Rendimiento</span>
        </button>
      </nav>
    </div>

    <!-- Contenido Pestaña "Lista" -->
    <div v-show="activeTab === 'lista'" class="space-y-6">
      <InstrumentadoresFilters 
        v-model="filters" 
        :export-disabled="loading || processedInstrumentadores.length === 0"
        @export="handleExport"
      />

      <div v-if="loading" class="space-y-4">
        <SkeletonLoader v-for="n in 5" :key="`skel-${n}`" />
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm" role="alert">
        <strong class="font-bold">Error: </strong>
        <span>{{ error }}</span>
      </div>

      <div v-else class="space-y-4">
        <!-- VISTA TABLA (DESKTOP) -->
        <div class="hidden md:block bg-white dark:bg-slate-800 shadow-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" class="table-header">Instrumentador</th>
                  <th scope="col" class="table-header text-center">Teléfono</th>
                  <th scope="col" class="table-header text-center">Fichas</th>
                  <th scope="col" class="table-header text-center">IVO (90d)</th>
                  <th scope="col" class="table-header text-center">Acceso Portal</th>
                  <th scope="col" class="table-header text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700/60">
                <tr v-if="paginatedInstrumentadores.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No se encontraron instrumentadores que coincidan con los filtros.
                  </td>
                </tr>
                <tr 
                  v-for="iq in paginatedInstrumentadores" 
                  :key="iq.dni"
                  class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <!-- Instrumentador: Avatar + Nombre + DNI -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div :class="[getAvatarBg(iq.nombre_completo), 'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm']">
                        {{ getInitials(iq.nombre_completo) }}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-slate-900 dark:text-white">
                          {{ capitalizeName(iq.nombre_completo) }}
                        </p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                          DNI: {{ iq.dni || 'Sin DNI' }}
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- Teléfono -->
                  <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 text-center font-mono">
                    <a v-if="iq.telefono" :href="`tel:${iq.telefono}`" class="hover:underline text-blue-600 dark:text-blue-400">
                      {{ iq.telefono }}
                    </a>
                    <span v-else class="text-slate-400">N/A</span>
                  </td>

                  <!-- Fichas Enviadas -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {{ iq.fichas_enviadas }} cirugías
                    </span>
                  </td>

                  <!-- Score IVO -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span :class="[getIvoBadgeClass(iq.ivo_score), 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold']">
                      ⭐ {{ iq.ivo_score.toFixed(2) }}
                    </span>
                  </td>

                  <!-- Acceso al Portal (ENLACES EXPUESTOS) -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <!-- Copiar Link -->
                      <button 
                        @click="copyPermanentLink(iq)"
                        title="Copiar Enlace del Portal"
                        class="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                      >
                        <CheckIcon v-if="copiedDni === iq.dni" class="w-3.5 h-3.5 text-emerald-600" />
                        <ClipboardDocumentIcon v-else class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span class="text-[11px]">{{ copiedDni === iq.dni ? 'Copiado' : 'Link' }}</span>
                      </button>

                      <!-- WhatsApp -->
                      <button 
                        @click="shareViaWhatsApp(iq)"
                        title="Enviar por WhatsApp"
                        class="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all"
                      >
                        <ChatBubbleLeftEllipsisIcon class="w-4 h-4" />
                      </button>

                      <!-- Abrir Portal -->
                      <button 
                        v-if="iq.activity_token"
                        @click="openPortalDirect(iq)"
                        title="Abrir vista previa del portal"
                        class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all"
                      >
                        <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                  <!-- Acciones del Registro -->
                  <td class="px-6 py-4 whitespace-nowrap text-center text-xs font-medium">
                    <div class="inline-flex items-center gap-2">
                      <button 
                        @click="openStatsModal(iq)" 
                        title="Ver análisis de rendimiento"
                        class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <ChartBarIcon class="w-4 h-4" />
                      </button>
                      <button 
                        @click="openEditModal(iq)"
                        title="Editar datos del instrumentador"
                        class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <PencilSquareIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- VISTA MOBILE (CARDS) -->
        <div class="block md:hidden space-y-4">
          <div v-if="paginatedInstrumentadores.length === 0" class="bg-white dark:bg-slate-800 p-8 text-center text-slate-500 rounded-2xl">
            No se encontraron instrumentadores.
          </div>
          <div 
            v-for="iq in paginatedInstrumentadores" 
            :key="`mob-${iq.dni}`"
            class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
          >
            <!-- Top Mobile Card -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div :class="[getAvatarBg(iq.nombre_completo), 'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm']">
                  {{ getInitials(iq.nombre_completo) }}
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-base">
                    {{ capitalizeName(iq.nombre_completo) }}
                  </h3>
                  <p class="text-xs text-slate-500">DNI: {{ iq.dni || 'N/A' }}</p>
                </div>
              </div>
              <button @click="openEditModal(iq)" class="p-2 text-slate-400 hover:text-indigo-600">
                <PencilSquareIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-600/60 flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400">Fichas:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ iq.fichas_enviadas }}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-600/60 flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400">IVO 90d:</span>
                <span :class="[getIvoBadgeClass(iq.ivo_score), 'px-2 py-0.5 rounded-md font-bold']">
                  {{ iq.ivo_score.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Portal Links Section -->
            <div class="bg-indigo-50/60 dark:bg-slate-700/40 p-3 rounded-xl border border-indigo-100 dark:border-slate-600 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                <span class="flex items-center gap-1">
                  <LinkIcon class="w-3.5 h-3.5 text-indigo-600" />
                  Acceso al Portal
                </span>
                <span v-if="iq.activity_token" class="text-[10px] text-emerald-600 font-bold">Activo</span>
              </div>
              
              <div class="grid grid-cols-3 gap-2">
                <button 
                  @click="copyPermanentLink(iq)"
                  class="px-2 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                >
                  <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                  <span>{{ copiedDni === iq.dni ? '¡Listo!' : 'Copiar' }}</span>
                </button>

                <button 
                  @click="shareViaWhatsApp(iq)"
                  class="px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                >
                  <ChatBubbleLeftEllipsisIcon class="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button 
                  @click="openPortalDirect(iq)"
                  class="px-2 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                  <span>Ver</span>
                </button>
              </div>
            </div>

            <!-- Stats Button -->
            <button 
              @click="openStatsModal(iq)"
              class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ChartBarIcon class="w-4 h-4 text-blue-600" />
              <span>Ver Análisis de Rendimiento</span>
            </button>
          </div>
        </div>

        <PaginationControls 
          v-if="totalItems > itemsPerPage" 
          :current-page="currentPage" 
          :total-items="totalItems" 
          :items-per-page="itemsPerPage" 
          @page-changed="goToPage" 
        />
      </div>
    </div>

    <!-- Contenido Pestaña "Ranking de Rendimiento" -->
    <div v-show="activeTab === 'ranking'" class="space-y-6">
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Presets IVO 2.0</span>
          <div class="flex items-center gap-2">
            <button @click="setDatePreset(30)" class="preset-btn">Últimos 30 días</button>
            <button @click="setDatePreset(60)" class="preset-btn">Últimos 60 días</button>
            <button @click="setDatePreset(90)" class="preset-btn">Últimos 90 días</button>
            <button @click="setDatePreset('2026')" class="preset-btn">Año 2026</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label class="filter-label">Desde</label>
            <input type="date" v-model="startDate" class="form-input"/>
          </div>
          <div>
            <label class="filter-label">Hasta</label>
            <input type="date" v-model="endDate" class="form-input"/>
          </div>
          <div class="flex items-end h-full pt-6 md:pt-0">
            <button @click="fetchRankingData" :disabled="isRankingLoading" class="btn-primary w-full h-10 flex items-center justify-center gap-2">
              <SparklesIcon class="w-4 h-4" />
              <span>Aplicar Filtros</span>
            </button>
          </div>
        </div>

        <!-- Fila de Exportar PDF con Selector de Alcance -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Informe PDF:</span>
            <select v-model="pdfExportLimit" class="text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="20">Top 20 Instrumentadores (Recomendado)</option>
              <option value="10">Top 10 Instrumentadores</option>
              <option value="30">Top 30 Instrumentadores</option>
              <option value="all">Listado Completo (Todos)</option>
            </select>
          </div>
          <button 
            @click="exportRankingToPDF" 
            :disabled="isRankingLoading || rankingData.length === 0"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DocumentArrowDownIcon class="w-4 h-4" />
            <span>Exportar Informe PDF</span>
          </button>
        </div>
      </div>

      <div v-if="isRankingLoading" class="text-center py-16 space-y-3">
        <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-sm text-slate-500">Calculando IVO 2.0 de rendimiento quirúrgico...</p>
      </div>

      <div v-else-if="rankingError" class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl text-center text-sm border border-red-200">
        <p>Error al calcular el ranking: {{ rankingError }}</p>
      </div>

      <div v-else-if="rankingData.length === 0" class="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p class="text-slate-500">No hay datos de cirugías enviadas en el período seleccionado.</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="(instrumentador, index) in rankingData" :key="instrumentador.instrumentador_dni" class="ranking-row">
          <!-- Posición y Badge Podio -->
          <div class="col-span-2 md:col-span-1 flex items-center justify-center">
            <div :class="[getPodiumBadgeClass(index), 'w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shadow-sm border']">
              {{ index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : (index + 1) }}
            </div>
          </div>

          <!-- Nombre -->
          <div class="col-span-10 md:col-span-3">
            <p class="font-bold text-slate-900 dark:text-white text-base">
              {{ capitalizeName(instrumentador.nombre_completo) }}
            </p>
            <p class="text-xs text-slate-500">DNI: {{ instrumentador.instrumentador_dni }}</p>
          </div>

          <!-- Score IVO 2.0 -->
          <div class="col-span-6 md:col-span-2 flex items-center justify-center">
            <div class="score-badge flex-col !h-auto !py-1 px-3" :class="getScoreClass(getFormattedIvoScore(instrumentador))">
              <span class="text-xl font-extrabold leading-none">{{ getFormattedIvoScore(instrumentador) }}</span>
              <span class="text-[9px] block text-center font-bold tracking-wider uppercase opacity-80 mt-0.5">IVO 2.0</span>
            </div>
          </div>

          <!-- KPIs -->
          <div class="col-span-6 md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div class="kpi-item"><UserGroupIcon class="kpi-icon"/><span>Cirugías:</span><strong>{{ instrumentador.total_cirugias }}</strong></div>
            <div class="kpi-item"><CameraIcon class="kpi-icon"/><span>Fotos:</span><strong>{{ instrumentador.total_fotos_subidas }}</strong></div>
            <div class="kpi-item"><ClockIcon class="kpi-icon text-blue-500"/><span>Cierre (hs):</span><strong>{{ instrumentador.tiempo_cierre_promedio_horas }}h</strong></div>
            <div class="kpi-item"><ClipboardDocumentListIcon class="kpi-icon text-green-500"/><span>Consumo:</span><strong>{{ instrumentador.consumo_promedio_chars }}c</strong></div>
            <div class="kpi-item"><ChatBubbleLeftRightIcon class="kpi-icon text-orange-500"/><span>Obs:</span><strong>{{ instrumentador.observaciones_promedio_chars }}c</strong></div>
            <div class="kpi-item"><ExclamationTriangleIcon class="kpi-icon text-red-500"/><span>Demora (>48h):</span><strong>{{ (instrumentador.tasa_informes_demorados !== undefined && instrumentador.tasa_informes_demorados !== null) ? parseFloat(instrumentador.tasa_informes_demorados).toFixed(0) + '%' : (instrumentador.tasa_informe_faltante ? parseFloat(instrumentador.tasa_informe_faltante).toFixed(0) + '%' : '0%') }}</strong></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <EditInstrumentadorModal :show="isEditModalOpen" :instrumentador="selectedInstrumentador" @close="isEditModalOpen = false" @updated="handleUpdate"/>
    <EstadisticasInstrumentadorModal :show="isStatsModalOpen" :instrumentador="selectedInstrumentador" @close="isStatsModalOpen = false" />
    <NewInstrumentadorModal :show="isNewModalOpen" @close="isNewModalOpen = false" @created="handleUpdate"/>
    <ImportInstrumentadoresModal :show="isImportModalOpen" @close="isImportModalOpen = false" @imported="handleUpdate"/>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToasts } from '../composables/useToasts.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { generateRankingPDF } from '../services/pdfGenerator.js';

import SkeletonLoader from '../components/SkeletonLoader.vue';
import EditInstrumentadorModal from '../components/EditInstrumentadorModal.vue';
import EstadisticasInstrumentadorModal from '../components/EstadisticasInstrumentadorModal.vue';
import NewInstrumentadorModal from '../components/NewInstrumentadorModal.vue';
import ImportInstrumentadoresModal from '../components/ImportInstrumentadoresModal.vue';
import PaginationControls from '../components/PaginationControls.vue';
import InstrumentadoresFilters from '../components/InstrumentadoresFilters.vue';

import { 
  KeyIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CameraIcon, 
  ClockIcon, 
  ChatBubbleLeftRightIcon, 
  ClipboardDocumentListIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  TrophyIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  SparklesIcon,
  DocumentArrowDownIcon
} from '@heroicons/vue/24/outline';

const { showSuccessToast, showErrorToast } = useToasts();
const activeTab = ref('lista');

// --- Lógica Pestaña "Lista" ---
const instrumentadores = ref([]);
const loading = ref(true);
const error = ref(null);
const isEditModalOpen = ref(false);
const isStatsModalOpen = ref(false);
const selectedInstrumentador = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const copiedDni = ref(null);

const filters = ref({
  searchTerm: '',
  sortBy: 'nombre_completo',
  sortDir: 'asc',
  minIvo: '',
  maxIvo: '',
});
const isNewModalOpen = ref(false);
const isImportModalOpen = ref(false);
const openNewModal = () => { isNewModalOpen.value = true; };
const openImportModal = () => { isImportModalOpen.value = true; };

// --- Lógica Pestaña "Ranking" ---
const rankingData = ref([]);
const isRankingLoading = ref(false);
const rankingError = ref(null);
const setDefaultDates = () => {
  const endDateObj = new Date();
  const startDateObj = new Date();
  startDateObj.setDate(endDateObj.getDate() - 90);
  return { start: startDateObj.toISOString().split('T')[0], end: endDateObj.toISOString().split('T')[0] };
};
const startDate = ref(setDefaultDates().start);
const endDate = ref(setDefaultDates().end);

const setDatePreset = (daysOrYear) => {
  const end = new Date();
  if (daysOrYear === '2026') {
    startDate.value = '2026-01-01';
    endDate.value = end.toISOString().split('T')[0];
  } else {
    const start = new Date();
    start.setDate(end.getDate() - Number(daysOrYear));
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = end.toISOString().split('T')[0];
  }
  fetchRankingData();
};

// --- Métodos Comunes ---
const headerTitle = computed(() => activeTab.value === 'lista' ? 'Gestión de Instrumentadores' : 'Ranking de Rendimiento');

onMounted(() => {
  fetchInstrumentadores();
});

watch(activeTab, (newTab) => {
  if (newTab === 'ranking' && rankingData.value.length === 0) {
    fetchRankingData();
  }
});

const fetchInstrumentadores = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await supabase.rpc('get_instrumentadores_con_stats');
    if (fetchError) throw fetchError;

    // Obtener datos del IVO 2.0 (últimos 90 días por defecto) para unificar la métrica entre Lista y Ranking
    let rankingMap = new Map();
    try {
      const dates = setDefaultDates();
      let { data: rpcData, error: rpcError } = await supabase.rpc('obtener_ranking_ivo_v2', {
        p_start_date: dates.start,
        p_end_date: dates.end
      });

      if (rpcError || !rpcData) {
        const fallback = await supabase.rpc('get_instrumentador_ranking_kpis', {
          p_start_date: dates.start,
          p_end_date: dates.end
        });
        rpcData = fallback.data;
      }

      if (rpcData && Array.isArray(rpcData)) {
        rpcData.forEach(r => {
          const dniStr = String(r.instrumentador_dni || r.dni);
          let score = 0;
          if (r.ivo_score_v2 !== undefined && r.ivo_score_v2 !== null) {
            score = parseFloat(r.ivo_score_v2);
          } else if (r.puntaje_iq_promedio !== undefined && r.puntaje_iq_promedio !== null) {
            score = parseFloat(r.puntaje_iq_promedio);
          }
          rankingMap.set(dniStr, score);
        });
      }
    } catch (e) {
      console.warn('No se pudo mapear IVO 2.0 unificado, utilizando valores por defecto', e);
    }

    const list = data || [];
    // Enriquecer cada instrumentador con el score IVO 2.0 unificado
    instrumentadores.value = list.map(iq => {
      const dniStr = String(iq.dni);
      let unifiedIvo = 0;
      if (rankingMap.has(dniStr)) {
        unifiedIvo = rankingMap.get(dniStr);
      } else if (iq.ivo_score_v2 !== undefined && iq.ivo_score_v2 !== null) {
        unifiedIvo = parseFloat(iq.ivo_score_v2);
      } else if (iq.puntaje_iq_promedio !== undefined && iq.puntaje_iq_promedio !== null) {
        unifiedIvo = parseFloat(iq.puntaje_iq_promedio);
      } else if (iq.ivo_score !== undefined && iq.ivo_score !== null) {
        // Si el valor legacy es excesivo (>10), lo escala a 10 como fallback de presentación
        unifiedIvo = iq.ivo_score > 10 ? Math.min(10, (iq.ivo_score / 15) * 10) : iq.ivo_score;
      }

      return {
        ...iq,
        ivo_score: unifiedIvo
      };
    });
  } catch (err) {
    error.value = err.message;
    showErrorToast(err, "Error al cargar los instrumentadores.");
  } finally {
    loading.value = false;
  }
};

const pdfExportLimit = ref('20');

const fetchRankingData = async () => {
  isRankingLoading.value = true;
  rankingError.value = null;
  try {
    // Intentar primero RPC unificada IVO 2.0 (obtener_ranking_ivo_v2)
    let { data, error: rpcError } = await supabase.rpc('obtener_ranking_ivo_v2', {
      p_start_date: startDate.value,
      p_end_date: endDate.value
    });

    // Fallback a la RPC anterior si la v2 aún no existe en Supabase
    if (rpcError) {
      const fallback = await supabase.rpc('get_instrumentador_ranking_kpis', {
        p_start_date: startDate.value,
        p_end_date: endDate.value
      });
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    rankingData.value = data || [];
  } catch (err) {
    rankingError.value = err.message;
    showErrorToast(err, "Error al calcular el ranking IVO 2.0.");
  } finally {
    isRankingLoading.value = false;
  }
};

const exportRankingToPDF = () => {
  if (rankingData.value.length === 0) {
    showErrorToast("No hay datos de ranking disponibles para exportar.");
    return;
  }
  try {
    generateRankingPDF(rankingData.value, {
      startDate: startDate.value,
      endDate: endDate.value,
      limit: pdfExportLimit.value
    });
    const label = pdfExportLimit.value === 'all' ? 'Completo' : `Top ${pdfExportLimit.value}`;
    showSuccessToast(`¡Informe PDF generado exitosamente (${label})!`);
  } catch (err) {
    showErrorToast(err, "Error al generar el PDF del ranking.");
  }
};

const capitalizeName = (name) => {
  if (!name) return '';
  return name.replace(/\b\w/g, char => char.toUpperCase());
};

const getInitials = (name) => {
  if (!name) return 'IQ';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarBgs = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
];

const getAvatarBg = (name) => {
  if (!name) return avatarBgs[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarBgs.length;
  return avatarBgs[index];
};

const getOrCreateToken = async (instrumentador) => {
  if (instrumentador.activity_token) return instrumentador.activity_token;
  try {
    const { data: newToken, error: rpcError } = await supabase.rpc('generar_activity_token', { 
      p_instrumentador_dni: instrumentador.dni 
    });
    if (rpcError) throw rpcError;
    if (!newToken) throw new Error('No se generó token.');
    instrumentador.activity_token = newToken;
    const idx = instrumentadores.value.findIndex(i => i.dni === instrumentador.dni);
    if (idx !== -1) {
      instrumentadores.value[idx].activity_token = newToken;
    }
    return newToken;
  } catch (err) {
    showErrorToast(err, 'Error al obtener token permanente.');
    return null;
  }
};

const copyPermanentLink = async (instrumentador) => {
  const token = await getOrCreateToken(instrumentador);
  if (!token) return;
  const url = `${window.location.origin}/resumen/${token}`;
  try {
    await navigator.clipboard.writeText(url);
    copiedDni.value = instrumentador.dni;
    showSuccessToast(`¡Link copiado para ${capitalizeName(instrumentador.nombre_completo)}!`);
    setTimeout(() => { copiedDni.value = null; }, 2000);
  } catch (err) {
    showErrorToast(err, 'No se pudo copiar el enlace.');
  }
};

const shareViaWhatsApp = async (instrumentador) => {
  const token = await getOrCreateToken(instrumentador);
  if (!token) return;
  const url = `${window.location.origin}/resumen/${token}`;
  const firstName = instrumentador.nombre_completo ? instrumentador.nombre_completo.split(' ')[0] : '';
  const message = `Hola ${capitalizeName(firstName)}, te comparto tu enlace de acceso permanente al portal de Gestión IQ para consultar tus cirugías y liquidaciones:\n\n${url}`;
  
  let cleanPhone = (instrumentador.telefono || '').replace(/\D/g, '');
  if (cleanPhone.length > 0 && !cleanPhone.startsWith('54')) {
    cleanPhone = '54' + cleanPhone;
  }
  
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
  showSuccessToast('Abriendo WhatsApp...');
  window.open(waUrl, '_blank');
};

const openPortalDirect = async (instrumentador) => {
  const token = await getOrCreateToken(instrumentador);
  if (!token) return;
  window.open(`${window.location.origin}/resumen/${token}`, '_blank');
};

const processedInstrumentadores = computed(() => {
  let processed = [...instrumentadores.value];
  if (filters.value.searchTerm) {
    const term = filters.value.searchTerm.toLowerCase();
    processed = processed.filter(iq => 
      iq.nombre_completo.toLowerCase().includes(term) ||
      (iq.dni && String(iq.dni).toLowerCase().includes(term))
    );
  }
  if (filters.value.minIvo) {
    processed = processed.filter(iq => iq.ivo_score >= parseFloat(filters.value.minIvo));
  }
  if (filters.value.maxIvo) {
    processed = processed.filter(iq => iq.ivo_score <= parseFloat(filters.value.maxIvo));
  }
  processed.sort((a, b) => {
    let valA = a[filters.value.sortBy];
    let valB = b[filters.value.sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;
    return filters.value.sortDir === 'asc' ? comparison : -comparison;
  });
  return processed;
});

const paginatedInstrumentadores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return processedInstrumentadores.value.slice(start, end);
});

const totalItems = computed(() => processedInstrumentadores.value.length);

watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

const goToPage = (page) => {
  currentPage.value = page;
};

const getIvoBadgeClass = (score) => {
  if (score >= 8.0) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (score >= 5.0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  if (score >= 3.0) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
};

const getPodiumBadgeClass = (index) => {
  if (index === 0) return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700';
  if (index === 1) return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';
  if (index === 2) return 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700';
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
};

const openEditModal = (instrumentador) => {
  selectedInstrumentador.value = instrumentador;
  isEditModalOpen.value = true;
};

const openStatsModal = (instrumentador) => {
  selectedInstrumentador.value = instrumentador;
  isStatsModalOpen.value = true;
};

const handleUpdate = () => {
  fetchInstrumentadores();
};

function handleExport() {
  const dataToExport = processedInstrumentadores.value.map(iq => ({
    'Nombre Completo': capitalizeName(iq.nombre_completo),
    'DNI': iq.dni,
    'Teléfono': iq.telefono || 'N/A',
    'Fichas Enviadas (Total)': iq.fichas_enviadas,
    'IVO 2.0 (90 días)': parseFloat(iq.ivo_score.toFixed(2))
  }));
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Instrumentadores');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8' });
  const fileName = `Reporte_Instrumentadores_${new Date().toISOString().slice(0,10)}.xlsx`;
  saveAs(data, fileName);
}

const getTabClass = (tabName) => [
  'whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all',
  activeTab.value === tabName
    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
];

const getFormattedIvoScore = (instrumentador) => {
  if (!instrumentador) return '0.00';
  if (instrumentador.ivo_score_v2 !== undefined && instrumentador.ivo_score_v2 !== null) {
    return parseFloat(instrumentador.ivo_score_v2).toFixed(2);
  }
  if (instrumentador.puntaje_iq_promedio) {
    return parseFloat(instrumentador.puntaje_iq_promedio).toFixed(2);
  }
  return '0.00';
};

const getScoreClass = (scoreInput) => {
  const score = parseFloat(scoreInput || 0);
  if (score >= 8.5) return 'score-high';
  if (score >= 6.0) return 'score-medium';
  if (score > 0) return 'score-low';
  return 'score-none';
};
</script>

<style scoped>
.table-header { @apply px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none; }
.form-input { @apply px-3.5 py-2 text-sm border border-slate-300 rounded-xl w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 shadow-sm; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-all hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50; }
.btn-secondary { @apply bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all; }
.preset-btn { @apply px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors; }
.ranking-row { @apply bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm rounded-2xl p-4 grid grid-cols-12 gap-4 items-center; }
.score-badge { @apply text-2xl font-black w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm; }
.score-high { @apply bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200; }
.score-medium { @apply bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200; }
.score-low { @apply bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200; }
.score-none { @apply bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400; }
.kpi-item { @apply flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50; }
.kpi-item strong { @apply font-bold text-slate-900 dark:text-slate-100 ml-auto; }
.kpi-icon { @apply w-3.5 h-3.5 text-slate-400 shrink-0; }
</style>