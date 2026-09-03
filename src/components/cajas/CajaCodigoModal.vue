<!-- src/components/cajas/CajaCodigoModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl xl:max-w-5xl overflow-hidden my-auto flex flex-col max-h-[95vh] h-auto transition-all">
      
      <!-- Header -->
      <div class="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan shrink-0">
            <BoxIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">Generar & Registrar Código</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Codificación asistida e inteligente de cajas, sets e instrumental</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-4 flex-grow custom-scrollbar">

        <!-- Selector de Modo: Generador Controlado vs Carga Manual Histórica -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <div class="space-y-0.5">
            <span class="text-xs font-bold text-slate-900 dark:text-white block">
              {{ isHistorico ? '📌 Modo Código Histórico / Legacy' : '⚡ Modo Generador Controlado Asistido' }}
            </span>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ isHistorico ? 'Permite ingresar un código manual existente sin reformatear.' : 'Autocompleta componentes desde texto o código y calcula la próxima serie.' }}
            </p>
          </div>

          <button 
            type="button" 
            @click="toggleMode" 
            class="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer shrink-0 self-end sm:self-auto"
            :class="isHistorico 
              ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300' 
              : 'bg-white border-slate-300 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200'"
          >
            {{ isHistorico ? 'Cambiar a Generador' : 'Cargar Histórico' }}
          </button>
        </div>

        <!-- VISTA MODO GENERADOR CONTROLADO CON IA Y PARSER -->
        <template v-if="!isHistorico">
          
          <!-- Detector / Parser e IA OpenRouter -->
          <div class="p-3.5 sm:p-4 bg-gradient-to-br from-brand-cyan/15 via-brand-cyan/5 to-transparent dark:from-slate-800/90 dark:to-slate-800/40 rounded-xl border border-brand-cyan/40 space-y-2.5">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <label class="text-xs font-black text-brand-navy dark:text-brand-cyan flex items-center gap-1.5 shrink-0">
                <SparklesIcon class="w-4 h-4 text-brand-cyan animate-pulse" />
                <span>Parser & Asistente IA</span>
              </label>

              <span v-if="smartDetectedSummary && !aiExplanation" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800 truncate max-w-full sm:max-w-xs">
                {{ smartDetectedSummary }}
              </span>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input 
                v-model="quickParseInput"
                @input="handleQuickParse"
                type="text"
                placeholder="Escribí o pegá cualquier texto o descripción (ej: CAJA DE COLUMNA, Prótesis de hombro)..."
                class="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-brand-cyan/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none placeholder:text-slate-400"
              />

              <div class="flex items-center gap-1.5 shrink-0">
                <!-- Botón Generar con IA -->
                <button 
                  type="button"
                  @click="handleGenerateAI(false)"
                  :disabled="loadingAI"
                  class="px-3.5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Consulta la API de OpenRouter para interpretar el texto con IA"
                >
                  <div v-if="loadingAI" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <BotIcon v-else class="w-4 h-4 text-brand-cyan-light" />
                  <span>{{ loadingAI ? 'Analizando...' : (aiSuggestionsHistory.length > 0 ? 'Re-analizar' : 'Generar con IA') }}</span>
                </button>

                <!-- Botón + Otra Sugerencia IA (sin borrar la anterior) -->
                <button 
                  v-if="aiSuggestionsHistory.length > 0"
                  type="button"
                  @click="handleGenerateAI(true)"
                  :disabled="loadingAI"
                  class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Pide una sugerencia alternativa manteniendo las sugerencias anteriores"
                >
                  <SparklesIcon v-if="!loadingAI" class="w-3.5 h-3.5 text-emerald-200" />
                  <span>+ Otra Sugerencia IA</span>
                </button>
              </div>
            </div>

            <!-- Botón Desplegable de Explicación IA e Historial de Sugerencias -->
            <div v-if="aiExplanation" class="pt-1">
              <button 
                type="button"
                @click="showAiExplanationDropdown = !showAiExplanationDropdown"
                class="w-full text-left p-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800/80 transition-colors flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer"
              >
                <span class="flex items-center gap-1.5 truncate">
                  <BotIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span class="truncate">💡 Explicación IA (Sugerencia {{ activeSuggestionIndex + 1 }} de {{ aiSuggestionsHistory.length }})</span>
                </span>
                <span class="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">
                  <span>{{ showAiExplanationDropdown ? 'Ocultar' : 'Ver detalle' }}</span>
                  <ChevronDownIcon class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showAiExplanationDropdown }" />
                </span>
              </button>

              <!-- Panel Desplegable Extendido -->
              <div v-if="showAiExplanationDropdown" class="mt-2 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-3 text-xs animate-in fade-in-0 zoom-in-95">
                
                <!-- Historial de Sugerencias IA (Tabs cuando hay múltiples) -->
                <div v-if="aiSuggestionsHistory.length > 1" class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                    <HistoryIcon class="w-3 h-3" />
                    Sugerencias:
                  </span>
                  <button 
                    v-for="(sug, idx) in aiSuggestionsHistory" 
                    :key="sug.id"
                    @click="selectAiSuggestion(idx)"
                    type="button"
                    class="px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    :class="activeSuggestionIndex === idx 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'"
                  >
                    <span>Opción {{ idx + 1 }}</span>
                    <span class="font-mono text-[10px] opacity-90">({{ sug.codigo_base }})</span>
                  </button>
                </div>

                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-start gap-2">
                    <BotIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div class="space-y-1">
                      <h4 class="font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                        <span>Razonamiento IA - Opción {{ activeSuggestionIndex + 1 }}</span>
                        <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          Aplicado al formulario
                        </span>
                      </h4>
                      <p class="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "{{ aiExplanation }}"
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Desglose de Componentes Seleccionados -->
                <div v-if="aiResultDetails" class="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px]">
                  <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span class="text-slate-400 block font-semibold text-[9px] uppercase">Familia</span>
                    <span class="font-bold text-brand-navy dark:text-brand-cyan">{{ aiResultDetails.familia || '-' }}</span>
                  </div>
                  <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span class="text-slate-400 block font-semibold text-[9px] uppercase">Material</span>
                    <span class="font-bold text-brand-navy dark:text-brand-cyan">{{ aiResultDetails.material || '-' }}</span>
                  </div>
                  <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span class="text-slate-400 block font-semibold text-[9px] uppercase">Medida</span>
                    <span class="font-bold text-brand-navy dark:text-brand-cyan">{{ aiResultDetails.variante || '-' }}</span>
                  </div>
                  <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span class="text-slate-400 block font-semibold text-[9px] uppercase">Clasificación</span>
                    <span class="font-bold text-brand-navy dark:text-brand-cyan">{{ aiResultDetails.clasificacion || '-' }}</span>
                  </div>
                  <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg col-span-2 lg:col-span-1">
                    <span class="text-slate-400 block font-semibold text-[9px] uppercase">Contenido</span>
                    <span class="font-bold text-brand-navy dark:text-brand-cyan">{{ aiResultDetails.contenido || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Banner de Vista Previa en Tiempo Real -->
          <div class="p-4 bg-gradient-to-r from-brand-navy/5 via-brand-cyan/10 to-brand-navy/5 dark:from-slate-800 dark:to-slate-800 rounded-xl border border-brand-cyan/30 text-center space-y-2">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Código Sugerido Generado
            </span>

            <div class="text-3xl sm:text-4xl font-mono font-black tracking-wider text-brand-navy dark:text-brand-cyan-light">
              {{ computedNextCode || 'OS-T35VLU-001' }}
            </div>

            <div class="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                Último utilizado: 
                <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ previewData.ultimo_codigo || 'Ninguno' }}
                </span>
              </div>
              <div>•</div>
              <div>
                Base: 
                <span class="font-mono font-bold text-brand-navy dark:text-brand-cyan">
                  {{ computedBaseCode || 'OS-T35VLU' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Componentes Form: 6 columnas en desktop grande (19"+), 3 en tablet, 2 en mobile -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <!-- Familia -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">1. Familia *</label>
              <select 
                v-model="form.familia" 
                @change="fetchPreviewSeries"
                class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              >
                <option v-for="opt in optionsFor('Familia')" :key="opt.codigo" :value="opt.codigo">
                  {{ opt.codigo }} - {{ opt.significado }}
                </option>
              </select>
            </div>

            <!-- Material -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">2. Material</label>
              <select 
                v-model="form.material" 
                @change="fetchPreviewSeries"
                class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              >
                <option value="">(Ninguno)</option>
                <option v-for="opt in optionsFor('Material')" :key="opt.codigo" :value="opt.codigo">
                  {{ opt.codigo }} - {{ opt.significado }}
                </option>
              </select>
            </div>

            <!-- Medida / Variante -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">3. Medida / Variante</label>
              <select 
                v-model="form.variante" 
                @change="fetchPreviewSeries"
                class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              >
                <option value="">(Ninguna)</option>
                <option v-for="opt in optionsFor('Medida')" :key="opt.codigo" :value="opt.codigo">
                  {{ opt.codigo }} - {{ opt.significado }}
                </option>
              </select>
            </div>

            <!-- Clasificación -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">4. Clasificación</label>
              <select 
                v-model="form.clasificacion" 
                @change="fetchPreviewSeries"
                class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              >
                <option value="">(Ninguna)</option>
                <option v-for="opt in optionsFor('Clasificación')" :key="opt.codigo" :value="opt.codigo">
                  {{ opt.codigo }} - {{ opt.significado }}
                </option>
              </select>
            </div>

            <!-- Contenido -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">5. Contenido</label>
              <select 
                v-model="form.contenido" 
                @change="fetchPreviewSeries"
                class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              >
                <option value="">(Ninguno)</option>
                <option v-for="opt in optionsFor('Contenido')" :key="opt.codigo" :value="opt.codigo">
                  {{ opt.codigo }} - {{ opt.significado }}
                </option>
              </select>
            </div>

            <!-- Marca (opcional) -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">6. Marca (opcional)</label>
              <input 
                v-model="form.marca" 
                @input="fetchPreviewSeries"
                type="text" 
                placeholder="Ej: Stryker, Depuy"
                class="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
              />
            </div>

          </div>
        </template>

        <!-- VISTA MODO CÓDIGO HISTÓRICO / MANUAL CON AUTOCORRECCIÓN -->
        <template v-else>
          <div class="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-amber-950 dark:text-amber-200">
                Código Histórico Completo *
              </label>

              <!-- Sugerencia de autocorrección canónica si aplica -->
              <button 
                v-if="manualCanonicalSuggestion" 
                @click="applyCanonicalSuggestion"
                type="button"
                class="text-[10px] font-black text-brand-navy dark:text-brand-cyan bg-brand-cyan/20 hover:bg-brand-cyan/30 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                <WandIcon class="w-3 h-3" />
                <span>Normalizar a: {{ manualCanonicalSuggestion }}</span>
              </button>
            </div>

            <input 
              v-model="codigoManual"
              @input="handleManualCodeInput"
              type="text"
              placeholder="Ej: OS-T35CLU0001 o CL-A00FRP-001"
              class="w-full px-4 py-2.5 font-mono font-bold text-sm tracking-wider uppercase rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
            
            <p class="text-[11px] text-amber-800 dark:text-amber-400">
              Se conservará el código exacto ingresado respetando formatos históricos. Si es formato estándar, podés usar el botón de arriba para normalizarlo.
            </p>
          </div>
        </template>

        <!-- Campos Comunes: Nombre descriptivo y Observaciones -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre / Descripción de la Caja o Instrumental *
            </label>
            <input 
              v-model="form.nombre"
              @input="handleNameInput"
              type="text"
              placeholder="Ej: Caja de Osteosíntesis Placa Volar Titanio 3.5mm Unificada"
              class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observación breve
            </label>
            <textarea 
              v-model="form.observaciones"
              rows="2"
              placeholder="Ej: Incluye 2 tornillos de reserva. Ubicación Estante B-4."
              class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            ></textarea>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-4 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
        <div class="flex items-center gap-2">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <!-- Botón Limpiar Formulario -->
          <button 
            @click="resetForm(true)"
            type="button"
            class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            title="Restablece todos los campos del formulario y las sugerencias"
          >
            <RotateCcwIcon class="w-4 h-4 text-slate-500" />
            <span>Limpiar Formulario</span>
          </button>
        </div>

        <button 
          @click="handleSubmit"
          :disabled="saving"
          class="px-5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <SaveIcon v-if="!saving" class="w-4 h-4" />
          <span>{{ saving ? 'Guardando en Backend...' : 'Guardar y Reservar Código' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import { generateCodeWithAI } from '../../services/openrouterService';
import { Box as BoxIcon, X as XIcon, Save as SaveIcon, Sparkles as SparklesIcon, Wand2 as WandIcon, Bot as BotIcon, ChevronDown as ChevronDownIcon, RotateCcw as RotateCcwIcon, History as HistoryIcon, Plus as PlusIcon } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  dictionaryEntries: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'created']);
const { showSuccessToast, showErrorToast, showWarningToast } = useToasts();

const isHistorico = ref(false);
const codigoManual = ref('');
const saving = ref(false);
const loadingAI = ref(false);
const quickParseInput = ref('');
const smartDetectedSummary = ref('');
const manualCanonicalSuggestion = ref('');

const aiExplanation = ref('');
const aiResultDetails = ref(null);
const showAiExplanationDropdown = ref(false);

const aiSuggestionsHistory = ref([]);
const activeSuggestionIndex = ref(0);

const form = ref({
  familia: 'OS',
  material: '',
  variante: '',
  clasificacion: 'VL',
  contenido: 'C',
  marca: '',
  nombre: '',
  observaciones: ''
});

const previewData = ref({
  codigo_base: 'OS-VLC',
  siguiente_serie: 1,
  siguiente_codigo: 'OS-VLC-001',
  ultimo_codigo: null
});

const optionsFor = (grupoName) => {
  const list = [...props.dictionaryEntries.filter(e => 
    e.grupo.toLowerCase() === grupoName.toLowerCase() && e.activo !== false
  )];

  // Fallbacks: Garantizar que códigos críticos como CO (Columna) existan siempre en las opciones desplegables
  if (grupoName.toLowerCase() === 'familia' && !list.some(e => e.codigo === 'CO')) {
    list.unshift({ grupo: 'Familia', codigo: 'CO', significado: 'Columna', significado_normalizado: 'COLUMNA', descripcion: 'Cirugía de columna vertebral' });
  }
  if (grupoName.toLowerCase() === 'clasificación' && !list.some(e => e.codigo === 'CO')) {
    list.unshift({ grupo: 'Clasificación', codigo: 'CO', significado: 'Columna / Fijación Vertebral', significado_normalizado: 'COLUMNA / FIJACION VERTEBRAL', descripcion: 'Sistemas de columna' });
  }

  return list;
};

const normalizeText = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Código Base generado en frontend (Formato estándar de 11 dígitos de datos: FAM-MATVARCLASCONT-SERIE)
const computedBaseCode = computed(() => {
  const fam = form.value.familia || 'OS';
  const mat = form.value.material || 'X';
  const varnt = form.value.variante || '00';
  const clas = form.value.clasificacion || 'CO';
  const cont = form.value.contenido || 'C';

  return `${fam}-${mat}${varnt}${clas}${cont}`;
});

const computedNextCode = computed(() => {
  return previewData.value.siguiente_codigo || `${computedBaseCode.value}-001`;
});

// PARSER INTELIGENTE LOCAL (REGLAS Y PALABRAS CLAVE)
const parseTextToIntelligentComponents = (rawInput) => {
  if (!rawInput || rawInput.trim().length < 2) {
    smartDetectedSummary.value = '';
    return;
  }
  const clean = rawInput.trim();
  const norm = normalizeText(clean);
  const detected = [];

  // 1. Intentar Parseo por Patrón de Código Estructurado (ej: OS-T35VLU-001, OST35VLU, RC-T00CMU)
  const codeMatch = clean.match(/^([A-Z]{2})[-]?([A-Z])([A-Z0-9]{2})([A-Z0-9]{2})([A-Z0-9])(?:[-]?([0-9]{3}))?$/i);
  if (codeMatch) {
    const fam = codeMatch[1].toUpperCase();
    const mat = codeMatch[2].toUpperCase();
    const varnt = codeMatch[3].toUpperCase();
    const clas = codeMatch[4].toUpperCase();
    const cont = codeMatch[5].toUpperCase();

    if (optionsFor('Familia').some(e => e.codigo === fam)) { form.value.familia = fam; detected.push(`Familia ${fam}`); }
    if (optionsFor('Material').some(e => e.codigo === mat)) { form.value.material = mat; detected.push(`Mat ${mat}`); }
    if (optionsFor('Medida').some(e => e.codigo === varnt)) { form.value.variante = varnt; detected.push(`Var ${varnt}`); }
    if (optionsFor('Clasificación').some(e => e.codigo === clas)) { form.value.clasificacion = clas; detected.push(`Clasif ${clas}`); }
    if (optionsFor('Contenido').some(e => e.codigo === cont)) { form.value.contenido = cont; detected.push(`Cont ${cont}`); }

    smartDetectedSummary.value = `Código estructurado: ${fam}-${mat}${varnt}${clas}${cont}`;
    fetchPreviewSeries();
    return;
  }

  // 2. PARSEO POR PALABRAS CLAVE Y PALABRAS CLAVE HISTÓRICAS
  const famOptions = optionsFor('Familia');
  let matchedFam = null;

  const normTokens = norm.split(/[\s\/,\(\)\.\-]+/).filter(Boolean);

  if (norm.includes('cadera') || normTokens.includes('cad')) {
    matchedFam = norm.includes('no cementad') ? 'RN' : 'RC';
  } else if (norm.includes('columna') || normTokens.includes('col') || normTokens.includes('colum')) {
    matchedFam = 'CO';
  } else if (norm.includes('rodilla') || normTokens.includes('rod')) {
    matchedFam = 'RR';
  } else if (norm.includes('artroscopia') || normTokens.includes('art')) {
    matchedFam = 'AR';
  } else if (norm.includes('canulado') || normTokens.includes('can')) {
    matchedFam = 'TR';
  } else if (norm.includes('ligamento')) {
    matchedFam = norm.includes('cruzado') ? 'LC' : 'LG';
  } else if (norm.includes('clavo')) {
    matchedFam = 'CL';
  } else if (norm.includes('extrac')) {
    matchedFam = 'EX';
  } else if (norm.includes('tutor')) {
    matchedFam = 'TU';
  } else if (norm.includes('herbert')) {
    matchedFam = 'HE';
  } else if (norm.includes('gamma')) {
    matchedFam = 'GM';
  } else if (norm.includes('motor')) {
    matchedFam = norm.includes('micro') ? 'MC' : (norm.includes('sierra') ? 'MS' : 'MT');
  } else if (norm.includes('sierra')) {
    matchedFam = 'SR';
  } else if (norm.includes('osteosintesis') || normTokens.includes('os')) {
    matchedFam = 'OS';
  } else {
    for (const opt of famOptions) {
      const sigNorm = normalizeText(opt.significado);
      const words = sigNorm.split(/[\s\/,\(\)]+/).filter(w => w.length >= 4);
      for (const w of words) {
        if (norm.includes(w)) {
          matchedFam = opt.codigo;
          break;
        }
      }
      if (matchedFam) break;
    }
  }

  if (matchedFam) {
    form.value.familia = matchedFam;
    detected.push(`Familia: ${matchedFam}`);
  }

  // Resetear campos opcionales para evitar heredar defaults previos
  form.value.material = '';
  form.value.variante = '';

  // Match Material
  if (norm.includes('titanio') || norm.includes('titani')) {
    form.value.material = 'T';
    detected.push('Titanio (T)');
  } else if (norm.includes('acero')) {
    form.value.material = 'A';
    detected.push('Acero (A)');
  } else if (norm.includes('peek')) {
    form.value.material = 'P';
    detected.push('PEEK (P)');
  } else if (norm.includes('mixto')) {
    form.value.material = 'X';
    detected.push('Mixto (X)');
  }

  // Match Medidas / Variantes
  if (norm.includes('3.5') || norm.includes('3,5')) { form.value.variante = '35'; detected.push('3.5mm'); }
  else if (norm.includes('4.0') || norm.includes('4,0')) { form.value.variante = '40'; detected.push('4.0mm'); }
  else if (norm.includes('6.0') || norm.includes('6,0')) { form.value.variante = '60'; detected.push('6.0mm'); }
  else if (norm.includes('7.0') || norm.includes('7,0')) { form.value.variante = '70'; detected.push('7.0mm'); }
  else if (norm.includes('2.5') || norm.includes('2,5')) { form.value.variante = '25'; detected.push('2.5mm'); }
  else if (norm.includes('4.5') || norm.includes('4,5')) { form.value.variante = '45'; detected.push('4.5mm'); }
  else if (norm.includes('0.0') || norm.includes('0,0')) { form.value.variante = '00'; detected.push('Sin medida (00)'); }
  else if (norm.includes('izq') || norm.includes('izquierda')) { form.value.variante = 'I1'; detected.push('Izquierda (I1)'); }
  else if (norm.includes('der') || norm.includes('derecha')) { form.value.variante = 'D2'; detected.push('Derecha (D2)'); }

  // Match Clasificación
  let matchedClas = null;
  if (norm.includes('volar')) matchedClas = 'VL';
  else if (norm.includes('columna') || normTokens.includes('col')) matchedClas = 'CO';
  else if (norm.includes('tibia proximal')) matchedClas = 'TP';
  else if (norm.includes('tibia distal')) matchedClas = 'TD';
  else if (norm.includes('tibia expert')) matchedClas = 'TX';
  else if (norm.includes('tibia')) matchedClas = 'TP';
  else if (norm.includes('femur expert')) matchedClas = 'FX';
  else if (norm.includes('femur') || norm.includes('femoral')) matchedClas = 'FR';
  else if (norm.includes('humero distal')) matchedClas = 'HD';
  else if (norm.includes('humero proximal')) matchedClas = 'HP';
  else if (norm.includes('humero')) matchedClas = 'HP';
  else if (norm.includes('clavicula')) matchedClas = 'CV';
  else if (norm.includes('olecranon')) matchedClas = 'OL';
  else if (norm.includes('perone')) matchedClas = 'PR';
  else if (norm.includes('rotula')) matchedClas = 'RT';
  else if (norm.includes('no cementad')) matchedClas = 'CN';
  else if (norm.includes('cementad')) matchedClas = 'CM';
  else if (norm.includes('dhs')) matchedClas = 'DH';
  else if (norm.includes('barouk')) matchedClas = 'HB';
  else if (norm.includes('boton') || norm.includes('botn')) matchedClas = 'BT';
  else if (norm.includes('arpon')) matchedClas = 'AP';
  else if (norm.includes('micro')) matchedClas = 'MC';
  else if (norm.includes('tenodesis')) matchedClas = 'TN';
  else if (norm.includes('cupula')) matchedClas = 'CR';
  else if (norm.includes('reconstruccion')) matchedClas = 'RS';

  if (matchedClas) {
    form.value.clasificacion = matchedClas;
    detected.push(`Clasif: ${matchedClas}`);
  }

  // Match Contenido (Reglas oficiales Districorr: I = Instrumental, P = Implante, U = Unificado, C = Contenedor)
  if (norm.includes('instrumental') || normTokens.includes('inst') || normTokens.includes('instru')) {
    form.value.contenido = 'I';
    detected.push('Instrumental (I)');
  } else if (norm.includes('implante') || norm.includes('placa') || norm.includes('protesis') || normTokens.includes('imp')) {
    form.value.contenido = 'P';
    detected.push('Implantes (P)');
  } else if (norm.includes('unificad') || norm.includes('ambos')) {
    form.value.contenido = 'U';
    detected.push('Unificado (U)');
  } else if (norm.includes('contenedor') || norm.includes('caja') || normTokens.includes('ca') || normTokens.includes('caj')) {
    form.value.contenido = 'C';
    detected.push('Contenedor / Caja (C)');
  }

  if (detected.length > 0) {
    smartDetectedSummary.value = 'Auto-detectado: ' + detected.join(' | ');
    fetchPreviewSeries();
  } else {
    smartDetectedSummary.value = 'Sin coincidencia automática';
  }
};

// SELECCIONAR UNA SUGERENCIA DEL HISTORIAL Y APLICARLA AL FORMULARIO
const selectAiSuggestion = (idx) => {
  if (idx < 0 || idx >= aiSuggestionsHistory.value.length) return;
  
  activeSuggestionIndex.value = idx;
  const sug = aiSuggestionsHistory.value[idx];
  const res = sug.result;

  aiResultDetails.value = res;
  aiExplanation.value = res.explicacion || 'Código asignado por IA.';

  if (res.familia) form.value.familia = res.familia;
  if (res.material) form.value.material = res.material;
  if (res.variante) form.value.variante = res.variante;
  if (res.clasificacion) form.value.clasificacion = res.clasificacion;
  if (res.contenido) form.value.contenido = res.contenido;
  if (res.nombre_sugerido) form.value.nombre = res.nombre_sugerido;

  smartDetectedSummary.value = `✨ IA (${sug.title}): ${aiExplanation.value}`;
  fetchPreviewSeries();
};

const buildIntelligentAiResult = (query, isAlternative = false) => {
  parseTextToIntelligentComponents(query);

  const contenidoSugerido = isAlternative 
    ? (form.value.contenido === 'C' ? 'I' : 'C') 
    : (form.value.contenido || 'C');

  const clasifSignificado = optionsFor('Clasificación').find(e => e.codigo === form.value.clasificacion)?.significado || form.value.clasificacion || 'General';
  const famSignificado = optionsFor('Familia').find(e => e.codigo === form.value.familia)?.significado || form.value.familia || 'Osteosíntesis';

  const explicacion = isAlternative
    ? `Sugerencia alternativa #${aiSuggestionsHistory.value.length + 1}: Interpretado como Contenido ${contenidoSugerido === 'I' ? 'Instrumental (I)' : 'Contenedor (C)'} para clasificar por ${clasifSignificado}.`
    : `Analizado "${query.trim()}": Identificada Familia ${famSignificado} (${form.value.familia || 'OS'}) y Clasificación ${clasifSignificado} (${form.value.clasificacion || 'CO'}).`;

  return {
    familia: form.value.familia || 'OS',
    material: form.value.material || 'X',
    variante: form.value.variante || '00',
    clasificacion: form.value.clasificacion || 'CO',
    contenido: contenidoSugerido,
    nombre_sugerido: query.trim().toUpperCase(),
    explicacion
  };
};

// GENERADOR DE CÓDIGO MEDIANTE OPENROUTER AI
const handleGenerateAI = async (isAlternative = false) => {
  const query = quickParseInput.value || form.value.nombre;
  if (!query || !query.trim()) {
    showWarningToast('Por favor, ingresá una descripción para consultar a la IA.');
    return;
  }

  loadingAI.value = true;
  let aiResult = null;

  try {
    aiResult = await generateCodeWithAI(query, props.dictionaryEntries, isAlternative);
  } catch (err) {
    if (err.message !== 'OPENROUTER_NO_KEY') {
      console.warn('Fallback a motor local inteligente:', err.message);
    }
    aiResult = buildIntelligentAiResult(query, isAlternative);
  }

  if (aiResult) {
    const codeBase = `${aiResult.familia}-${aiResult.material || ''}${aiResult.variante || ''}${aiResult.clasificacion || ''}${aiResult.contenido || ''}`;
    
    const newSuggestion = {
      id: Date.now(),
      title: `Opción ${aiSuggestionsHistory.value.length + 1}`,
      query: query.trim(),
      result: aiResult,
      codigo_base: codeBase
    };

    aiSuggestionsHistory.value.push(newSuggestion);
    showAiExplanationDropdown.value = true;
    selectAiSuggestion(aiSuggestionsHistory.value.length - 1);

    if (isAlternative) {
      showSuccessToast(`IA: Sugerencia alternativa #${aiSuggestionsHistory.value.length} generada.`);
    } else {
      showSuccessToast('IA: Código deducido y explicado con éxito.');
    }
  }

  loadingAI.value = false;
};

const handleQuickParse = () => {
  if (quickParseInput.value) {
    parseTextToIntelligentComponents(quickParseInput.value);
    if (!form.value.nombre) {
      form.value.nombre = quickParseInput.value;
    }
  }
};

const handleNameInput = () => {
  if (form.value.nombre) {
    parseTextToIntelligentComponents(form.value.nombre);
  }
};

const handleManualCodeInput = () => {
  if (!codigoManual.value) {
    manualCanonicalSuggestion.value = '';
    return;
  }
  const clean = codigoManual.value.trim().toUpperCase();
  const codeMatch = clean.match(/^([A-Z]{2})[-]?([A-Z])([A-Z0-9]{2})([A-Z0-9]{2})([A-Z0-9])(?:[-]?([0-9]{3}))?$/);
  if (codeMatch) {
    const canonical = `${codeMatch[1]}-${codeMatch[2]}${codeMatch[3]}${codeMatch[4]}${codeMatch[5]}-${codeMatch[6] || '001'}`;
    if (canonical !== clean) {
      manualCanonicalSuggestion.value = canonical;
    } else {
      manualCanonicalSuggestion.value = '';
    }
  } else {
    manualCanonicalSuggestion.value = '';
  }
};

const applyCanonicalSuggestion = () => {
  if (manualCanonicalSuggestion.value) {
    codigoManual.value = manualCanonicalSuggestion.value;
    manualCanonicalSuggestion.value = '';
    showSuccessToast('Código normalizado a formato estándar canónico.');
  }
};

const toggleMode = () => {
  isHistorico.value = !isHistorico.value;
  if (!isHistorico.value) {
    fetchPreviewSeries();
  }
};

// Consulta la RPC para obtener la serie sugerida sin insertar nada aún
const fetchPreviewSeries = async () => {
  const base = computedBaseCode.value;
  if (!base) return;

  try {
    const { data, error } = await supabase.rpc('obtener_siguiente_serie_caja', {
      p_codigo_base: base
    });

    if (error) throw error;
    if (data) {
      previewData.value = data;
    }
  } catch (err) {
    console.error('Error al obtener la siguiente serie:', err);
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm(false);
    fetchPreviewSeries();
  }
});

watch(computedBaseCode, (newBase) => {
  if (newBase && !isHistorico.value) {
    fetchPreviewSeries();
  }
});

onMounted(() => {
  if (props.show) fetchPreviewSeries();
});

const resetForm = (userInitiated = false) => {
  isHistorico.value = false;
  codigoManual.value = '';
  quickParseInput.value = '';
  smartDetectedSummary.value = '';
  manualCanonicalSuggestion.value = '';
  aiExplanation.value = '';
  aiResultDetails.value = null;
  aiSuggestionsHistory.value = [];
  activeSuggestionIndex.value = 0;
  showAiExplanationDropdown.value = false;
  
  form.value = {
    familia: 'OS',
    material: '',
    variante: '',
    clasificacion: 'VL',
    contenido: 'C',
    marca: '',
    nombre: '',
    observaciones: ''
  };

  fetchPreviewSeries();

  if (userInitiated) {
    showSuccessToast('Formulario limpiado.');
  }
};

// AUTO-REGISTRO AUTOMÁTICO EN DICCIONARIO
const ensureComponentInDictionary = async (grupo, codigo, significadoDefault) => {
  if (!codigo) return;
  const exists = props.dictionaryEntries.some(
    e => e.grupo.toLowerCase() === grupo.toLowerCase() && e.codigo.toUpperCase() === codigo.toUpperCase()
  );
  if (!exists) {
    try {
      await supabase.from('cajas_diccionario').upsert({
        grupo,
        codigo: codigo.toUpperCase(),
        significado: significadoDefault,
        significado_normalizado: significadoDefault.toUpperCase(),
        descripcion: `Registrado automáticamente al emitir nuevo código con componente ${codigo}`
      }, { onConflict: 'grupo, codigo' });
    } catch (err) {
      console.warn(`No se pudo auto-registrar ${grupo} ${codigo} en el diccionario:`, err);
    }
  }
};

const handleSubmit = async () => {
  if (!form.value.nombre.trim()) {
    showWarningToast('Por favor, ingresá un nombre o descripción para el código.');
    return;
  }

  if (isHistorico.value && !codigoManual.value.trim()) {
    showWarningToast('En modo histórico debés ingresar el código manual.');
    return;
  }

  saving.value = true;
  try {
    // Si es un código nuevo y usa componentes inéditos, auto-guardarlos en el diccionario
    if (!isHistorico.value) {
      await ensureComponentInDictionary('Familia', form.value.familia, form.value.familia === 'CO' ? 'Columna' : form.value.familia);
      await ensureComponentInDictionary('Material', form.value.material, 'Material ' + form.value.material);
      await ensureComponentInDictionary('Medida', form.value.variante, 'Medida ' + form.value.variante);
      await ensureComponentInDictionary('Clasificación', form.value.clasificacion, form.value.clasificacion === 'CO' ? 'Columna / Fijación Vertebral' : form.value.clasificacion);
      await ensureComponentInDictionary('Contenido', form.value.contenido, 'Contenido ' + form.value.contenido);
    }

    const base = computedBaseCode.value;

    const payload = {
      p_codigo_base: isHistorico.value ? null : base,
      p_familia: isHistorico.value ? null : form.value.familia,
      p_material: isHistorico.value ? null : form.value.material,
      p_variante: isHistorico.value ? null : form.value.variante,
      p_clasificacion: isHistorico.value ? null : form.value.clasificacion,
      p_contenido: isHistorico.value ? null : form.value.contenido,
      p_marca: isHistorico.value ? null : form.value.marca,
      p_nombre: form.value.nombre.trim(),
      p_observaciones: form.value.observaciones ? form.value.observaciones.trim() : null,
      p_es_historico: isHistorico.value,
      p_codigo_manual: isHistorico.value ? codigoManual.value.trim() : null
    };

    const { data, error } = await supabase.rpc('generar_codigo_caja', payload);

    if (error) throw error;

    showSuccessToast(`Código ${data.codigo} generado y reservado con éxito.`);
    emit('created', data);
    emit('close');
  } catch (err) {
    console.error('Error generando código de caja:', err);
    if (err.message && err.message.includes('unique constraint')) {
      showErrorToast('El código ingresado ya existe en la base de datos.');
    } else {
      showErrorToast('Error al reservar el código: ' + (err.message || err));
    }
  } finally {
    saving.value = false;
  }
};
</script>
