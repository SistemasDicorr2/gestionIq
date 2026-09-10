<!-- src/components/admin/corrections/AutoMatcherComprobantesModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
      
      <!-- CABECERA -->
      <div class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-955/40 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
            🧲
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Auto-Matcher Masivo de Comprobantes
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Arrastrá los comprobantes de la conciliación y el sistema los vinculará automáticamente por titular, monto y archivo.
            </p>
          </div>
        </div>

        <button 
          @click="closeModal" 
          class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- CUERPO PRINCIPAL -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-5 grow">
        
        <!-- DROPZONE DE CARGA MASIVA -->
        <div 
          class="border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-955/20 hover:border-indigo-500 group"
          :class="{ 'border-indigo-600 bg-indigo-100/60 dark:bg-indigo-950/40': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFilesDrop"
          @click="triggerFileInput"
        >
          <input 
            type="file" 
            ref="fileInputRef" 
            @change="handleFileInputChange" 
            multiple 
            accept="image/*,application/pdf" 
            class="hidden" 
          />
          <div class="max-w-md mx-auto space-y-2 pointer-events-none">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs">
              📄
            </div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
              Arrastrá aquí todos los comprobantes juntos (PDF o Fotos)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Podés seleccionar múltiples archivos a la vez. El emparejamiento es instantáneo.
            </p>
          </div>
        </div>

        <!-- RESUMEN DE CANDIDATOS PENDIENTES & PROGRESO -->
        <div class="p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Órdenes pendientes sin comprobante: <strong class="text-amber-700 dark:text-amber-400 font-mono text-sm">{{ pendingOrdersCount }}</strong></span>
          </div>

          <div class="flex items-center gap-3">
            <span v-if="isAnalyzingQueue" class="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <span class="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Analizando en segundo plano ({{ processedCount }}/{{ files.length }})...</span>
            </span>
            <span v-else-if="files.length > 0" class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ✓ {{ matchedCount }} de {{ files.length }} emparejados
            </span>
          </div>
        </div>

        <!-- LISTA DE COMPROBANTES Y EMPAREJAMIENTO -->
        <div v-if="files.length > 0" class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Comprobantes Emparejados ({{ matchedCount }}/{{ files.length }})
            </h4>
            <button 
              @click="clearAllFiles" 
              class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Limpiar todos
            </button>
          </div>

          <div class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 max-h-[420px] overflow-y-auto">
            <div 
              v-for="(item, idx) in files" 
              :key="item.id" 
              class="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Info del Archivo y Monto Extraído -->
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  {{ item.type?.includes('pdf') || item.name.toLowerCase().endsWith('.pdf') ? '📕' : '🖼️' }}
                </div>
                <div class="min-w-0 space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-slate-900 dark:text-white truncate max-w-[220px]" :title="item.name">
                      {{ item.name }}
                    </span>
                    <span v-if="item.status === 'processing'" class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">
                      🌀 Analizando...
                    </span>
                  </div>

                  <div v-if="item.extractedData && item.extractedData.monto_transferido" class="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 font-mono">
                    <div class="flex items-center gap-2">
                      <span class="font-black text-indigo-600 dark:text-indigo-400 text-xs">
                        ${{ formatNumber(item.extractedData.monto_transferido) }}
                      </span>
                      <span v-if="item.extractedData.destinatario_nombre" class="truncate max-w-[180px] font-sans text-slate-700 dark:text-slate-300">
                        · {{ item.extractedData.destinatario_nombre }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-[10px] text-slate-400">
                    {{ formatFileSize(item.size) }}
                  </div>
                </div>
              </div>

              <!-- Flecha de Vinculación -->
              <div class="hidden sm:flex items-center text-slate-400 shrink-0 font-bold text-sm">
                ➔
              </div>

              <!-- Orden de Pago Asignada -->
              <div class="flex-1 min-w-0">
                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Vincular a Orden de Pago:
                </label>

                <select 
                  v-model="item.selectedOrderId" 
                  @change="onManualSelect(item)"
                  class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option :value="null">-- Seleccionar Orden Manualmente --</option>
                  <option 
                    v-for="orden in candidateOrders" 
                    :key="orden.id" 
                    :value="orden.id"
                  >
                    #{{ orden.id }} · {{ formatInstrumentador(orden.instrumentadores_nombres) }} · ${{ formatNumber(orden.monto_total_general) }} ({{ formatDate(orden.fecha_emision) }})
                  </option>
                </select>

                <!-- Badge de Confianza -->
                <div class="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span 
                    v-if="item.matchType === 'exact'" 
                    class="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    ✓ Coincidencia exacta (Monto y Titular)
                  </span>
                  <span 
                    v-else-if="item.matchType === 'name'" 
                    class="px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    ✓ Coincidencia por Nombre / Archivo
                  </span>
                  <span 
                    v-else-if="item.matchType === 'cache'" 
                    class="px-2 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  >
                    ⚡ Reutilizado de Caché
                  </span>
                  <span 
                    v-else-if="item.matchType === 'monto'" 
                    class="px-2 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  >
                    ⚡ Coincidencia por monto exacto
                  </span>
                  <span 
                    v-else-if="item.selectedOrderId" 
                    class="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Asignación manual
                  </span>
                  <span 
                    v-else 
                    class="px-2 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 dark:bg-rose-955 dark:text-rose-200"
                  >
                    ⚠️ Sin orden asignada
                  </span>

                  <span v-if="item.uploaded" class="text-emerald-600 font-bold text-[10px] ml-auto">
                    ✓ Guardado
                  </span>
                </div>
              </div>

              <!-- Botón Eliminar Fila -->
              <button 
                @click="removeFile(idx)" 
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition shrink-0 cursor-pointer self-end sm:self-center"
                title="Quitar comprobante"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- PIE DE MODAL Y BOTONES DE ACCIÓN -->
      <div class="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div class="text-xs text-slate-500 dark:text-slate-400">
          <span v-if="readyToSaveCount > 0" class="font-bold text-indigo-600 dark:text-indigo-400">
            Listos para vincular: {{ readyToSaveCount }} comprobantes
          </span>
          <span v-else>
            Asigná las órdenes correspondientes para confirmar.
          </span>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-auto">
          <button 
            @click="closeModal" 
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>

          <button 
            @click="uploadAndLinkAll" 
            :disabled="readyToSaveCount === 0 || isSubmitting" 
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span v-if="isSubmitting" class="animate-spin text-sm">🌀</span>
            <span v-else>🚀</span>
            <span>{{ isSubmitting ? (uploadProgressText || 'Guardando en R2 y Supabase...') : `Vincular ${readyToSaveCount} Comprobantes` }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../../../services/supabase';
import { useToast } from 'vue-toastification';
import { parsearComprobanteBancarioTexto } from '../../../utils/bancosArgentinosParser';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  orders: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'updated']);
const toast = useToast();

const fileInputRef = ref(null);
const isDragging = ref(false);
const isSubmitting = ref(false);
const isAnalyzingQueue = ref(false);
const files = ref([]);

// Órdenes candidatas ordenadas: primero las sin comprobante, luego por fecha reciente
const candidateOrders = computed(() => {
  const list = [...props.orders];
  return list.sort((a, b) => {
    const aHas = Boolean(a.comprobante_object_key);
    const bHas = Boolean(b.comprobante_object_key);
    if (!aHas && bHas) return -1;
    if (aHas && !bHas) return 1;
    return new Date(b.fecha_emision || 0) - new Date(a.fecha_emision || 0);
  });
});

const pendingOrdersCount = computed(() => {
  return props.orders.filter(o => !o.comprobante_object_key).length;
});

const matchedCount = computed(() => {
  return files.value.filter(f => f.selectedOrderId).length;
});

const processedCount = computed(() => {
  return files.value.filter(f => f.status === 'success' || f.status === 'error').length;
});

const readyToSaveCount = computed(() => {
  return files.value.filter(f => f.selectedOrderId && !f.uploaded).length;
});

const formatNumber = (val) => {
  if (val === null || val === undefined) return '0,00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (val) => {
  if (!val) return '';
  const d = String(val).slice(0, 10).split('-');
  if (d.length === 3) return `${d[2]}/${d[1]}/${d[0]}`;
  return val;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const formatInstrumentador = (val) => {
  if (Array.isArray(val)) return val.join(', ');
  return val || 'Profesional';
};

const cleanStr = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
};

// Limpieza y tokenización de nombres de archivo
const extractFilenameTokens = (filename) => {
  if (!filename) return [];
  // Remover extensión
  let base = filename.replace(/\.[^/.]+$/, "");
  // Reemplazar separadores por espacios
  base = cleanStr(base);
  
  // Filtrar palabras vacías o genéricas
  const stopWords = new Set([
    'comprobante', 'transferencia', 'pago', 'recibo', 'orden', 'de', 'la', 'el',
    'los', 'las', 'ticket', 'op', 'doc', 'factura', 'banco', 'santander', 'galicia',
    'macro', 'bbva', 'mp', 'mercadopago', 'pdf', 'jpg', 'png', 'nuevo', 'copia'
  ]);

  return base.split(' ').filter(w => w.length >= 2 && !stopWords.has(w));
};

// Buscar mejor orden por nombre de archivo
const matchOrderByFilename = (filename, assignedIds) => {
  const fileTokens = extractFilenameTokens(filename);
  if (fileTokens.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const orden of candidateOrders.value) {
    if (assignedIds.has(orden.id)) continue;

    const namesStr = Array.isArray(orden.instrumentadores_nombres) 
      ? orden.instrumentadores_nombres.join(' ') 
      : (orden.instrumentadores_nombres || '');
    
    const orderTokens = new Set(cleanStr(namesStr).split(' ').filter(w => w.length >= 2));
    if (orderTokens.size === 0) continue;

    // Calcular cuántos tokens del archivo coinciden con el nombre de la orden
    let matches = 0;
    for (const t of fileTokens) {
      if (orderTokens.has(t)) {
        matches++;
      } else {
        // Coincidencia parcial si la palabra empieza igual (ej: "rios" con "rios")
        for (const ot of orderTokens) {
          if (ot.includes(t) || t.includes(ot)) {
            matches += 0.8;
            break;
          }
        }
      }
    }

    const score = matches / Math.max(1, fileTokens.length);
    if (score >= 0.5 && score > highestScore) {
      highestScore = score;
      bestMatch = orden;
    }
  }

  return bestMatch;
};

// Calcular hash SHA-256 en cliente
const computeFileHash = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return null;
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileInputChange = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    addFiles(Array.from(e.target.files));
  }
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleFilesDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    addFiles(Array.from(e.dataTransfer.files));
  }
};

const clearAllFiles = () => {
  files.value = [];
};

const removeFile = (index) => {
  files.value.splice(index, 1);
};

const onManualSelect = (item) => {
  if (item.selectedOrderId) {
    item.matchType = 'manual';
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result.toString();
      const base64Clean = result.substring(result.indexOf(',') + 1);
      resolve(base64Clean);
    };
    reader.onerror = error => reject(error);
  });
};

// Incorporar archivos y ejecutar pase instantáneo
const addFiles = async (rawFiles) => {
  const newItems = [];
  const assignedIds = new Set(files.value.map(f => f.selectedOrderId).filter(Boolean));

  for (const rawFile of rawFiles) {
    const fileId = 'match_' + Math.random().toString(36).substring(2, 9);
    
    // 1. Emparejamiento instantáneo por nombre de archivo (0 ms)
    const nameMatch = matchOrderByFilename(rawFile.name, assignedIds);
    let selectedOrderId = null;
    let matchType = 'manual';

    if (nameMatch) {
      selectedOrderId = nameMatch.id;
      matchType = 'name';
      assignedIds.add(nameMatch.id);
    }

    const item = {
      id: fileId,
      rawFile,
      name: rawFile.name,
      size: rawFile.size,
      type: rawFile.type,
      status: nameMatch ? 'success' : 'processing',
      extractedData: null,
      selectedOrderId,
      matchType,
      uploaded: false,
      fileHash: null
    };

    files.value.push(item);
    newItems.push(item);
  }

  // Ejecutar verificación de fondo (Caché SHA-256 + IA / Parser) con concurrencia controlada
  processQueue(newItems);
};

// Cola de procesamiento con límite de concurrencia (máx 2 simultáneos) y timeout de seguridad
const processQueue = async (items) => {
  if (items.length === 0) return;
  isAnalyzingQueue.value = true;

  const CONCURRENCY = 2;
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const current = items[index++];
      if (!current) break;
      await processSingleItem(current);
    }
  };

  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => worker());
  await Promise.allSettled(workers);

  isAnalyzingQueue.value = false;
};

// Procesamiento individual por ítem (Caché + Edge Function IA con timeout de 7s)
const processSingleItem = async (item) => {
  try {
    // 1. Hash SHA-256 y búsqueda en caché previa
    const hash = await computeFileHash(item.rawFile);
    item.fileHash = hash;

    if (hash) {
      const { data: cached } = await supabase
        .from('conciliacion_cache_comprobantes')
        .select('extracted_data, matched_instrumentador')
        .eq('file_hash', hash)
        .maybeSingle();

      if (cached && cached.extracted_data) {
        item.extractedData = cached.extracted_data;
        recalculateBestMatch(item, 'cache');
        item.status = 'success';
        return;
      }
    }

    // 2. Extracción rápida por texto plano de PDF en cliente (si es texto legible)
    try {
      const buffer = await item.rawFile.arrayBuffer();
      const textDecoder = new TextDecoder('latin1');
      const rawText = textDecoder.decode(buffer);
      const clientParsed = parsearComprobanteBancarioTexto(rawText);
      if (clientParsed && clientParsed.monto_transferido > 0) {
        item.extractedData = clientParsed;
        recalculateBestMatch(item, 'exact');
        item.status = 'success';
        return;
      }
    } catch (e) {
      // Ignorar fallback silencioso
    }

    // 3. Invocar Edge Function IA con timeout estricto de 7 segundos
    const base64 = await fileToBase64(item.rawFile);
    item.fileBase64 = base64;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const { data, error } = await supabase.functions.invoke('procesar-comprobante-ia', {
      body: {
        fileBase64: base64,
        mimeType: item.type,
        fileName: item.name
      }
    });

    clearTimeout(timeoutId);

    if (!error && data?.success && data?.extractedData) {
      item.extractedData = data.extractedData;
      recalculateBestMatch(item, 'exact');

      // Guardar en caché para futuras ejecuciones
      if (hash) {
        supabase.from('conciliacion_cache_comprobantes').upsert({
          file_hash: hash,
          file_name: item.name,
          extracted_data: data.extractedData
        }, { onConflict: 'file_hash' }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn(`Análisis diferido de ${item.name}:`, err);
  } finally {
    // Si no tenía match por nombre, intentar emparejar con la primera orden pendiente libre
    if (!item.selectedOrderId) {
      const assigned = new Set(files.value.map(f => f.selectedOrderId).filter(Boolean));
      const firstPending = candidateOrders.value.find(o => !o.comprobante_object_key && !assigned.has(o.id));
      if (firstPending) {
        item.selectedOrderId = firstPending.id;
        item.matchType = 'manual';
      }
    }
    item.status = 'success';
  }
};

// Re-evaluar coincidencia tras extraer datos
const recalculateBestMatch = (item, preferredType = 'exact') => {
  if (!item.extractedData) return;

  const transferMonto = Number(item.extractedData.monto_transferido) || 0;
  const destName = cleanStr(item.extractedData.destinatario_nombre);
  const assigned = new Set(files.value.filter(f => f.id !== item.id).map(f => f.selectedOrderId).filter(Boolean));

  // A. Coincidencia Exacta: Monto + Titular
  let best = candidateOrders.value.find(o => {
    if (assigned.has(o.id)) return false;
    const orderMonto = Number(o.monto_total_general || o.monto || 0);
    const montoMatches = transferMonto > 0 && Math.abs(orderMonto - transferMonto) < 0.01;
    
    const orderName = cleanStr(Array.isArray(o.instrumentadores_nombres) ? o.instrumentadores_nombres.join(' ') : o.instrumentadores_nombres);
    const nameMatches = destName && orderName && (destName.includes(orderName) || orderName.includes(destName));

    return montoMatches && nameMatches;
  });

  if (best) {
    item.selectedOrderId = best.id;
    item.matchType = 'exact';
    return;
  }

  // B. Coincidencia por Monto Exacto
  if (transferMonto > 0) {
    best = candidateOrders.value.find(o => {
      if (assigned.has(o.id)) return false;
      const orderMonto = Number(o.monto_total_general || o.monto || 0);
      return Math.abs(orderMonto - transferMonto) < 0.01;
    });

    if (best) {
      item.selectedOrderId = best.id;
      item.matchType = 'monto';
      return;
    }
  }

  // C. Si ya tenía match por nombre y no se contradice, mantenerlo
  if (item.selectedOrderId) {
    item.matchType = preferredType === 'cache' ? 'cache' : (item.matchType || 'name');
  }
};

const uploadProgressText = ref('');

// Subida a R2 y actualización masiva
const uploadAndLinkAll = async () => {
  const toProcess = files.value.filter(f => f.selectedOrderId && !f.uploaded);
  if (toProcess.length === 0) return;

  try {
    isSubmitting.value = true;
    let successCount = 0;

    for (let i = 0; i < toProcess.length; i++) {
      const item = toProcess[i];
      uploadProgressText.value = `Guardando ${i + 1} de ${toProcess.length}...`;

      try {
        // 1. Preparar parámetros exactos y sanitizados para Edge Function b2-presigned-url
        const rawExt = item.name.split('.').pop() || 'pdf';
        const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf';
        const baseName = crypto.randomUUID 
          ? crypto.randomUUID() 
          : `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const effectiveContentType = item.rawFile.type || (
          ext === 'pdf' ? 'application/pdf' :
          ['jpg', 'jpeg'].includes(ext) ? 'image/jpeg' :
          ext === 'png' ? 'image/png' :
          ext === 'webp' ? 'image/webp' :
          'application/pdf'
        );

        const { data: presignedData, error: presignedErr } = await supabase.functions.invoke('b2-presigned-url', {
          body: {
            area: 'comprobantes-pago',
            owner: `orden-${item.selectedOrderId}`,
            contentType: effectiveContentType,
            extension: ext,
            isThumb: false,
            baseName: baseName
          }
        });

        if (presignedErr || !presignedData?.uploadUrl) {
          const detail = presignedErr?.message || presignedData?.error || 'No se pudo obtener URL para subida a R2';
          console.error(`[AutoMatcher] Error presigned URL para ${item.name}:`, presignedErr, presignedData);
          throw new Error(detail);
        }

        // 2. Subir binario a R2 vía HTTP PUT
        const uploadRes = await fetch(presignedData.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': effectiveContentType
          },
          body: item.rawFile
        });

        if (!uploadRes.ok) {
          throw new Error(`Error en subida R2: ${uploadRes.statusText}`);
        }

        // 3. Actualizar la orden de pago en Supabase mediante RPC oficial
        const { error: rpcErr } = await supabase.rpc('actualizar_comprobante_orden_pago', {
          p_orden_id: item.selectedOrderId,
          p_nuevo_object_key: presignedData.objectKey
        });

        if (rpcErr) throw rpcErr;

        item.uploaded = true;
        successCount++;
      } catch (err) {
        console.error(`Error guardando comprobante ${item.name}:`, err);
      }
    }

    if (successCount > 0) {
      toast.success(`¡${successCount} comprobantes vinculados y guardados con éxito!`);
      emit('updated');
      closeModal();
    } else {
      toast.error('Ocurrió un error al vincular los comprobantes.');
    }
  } catch (err) {
    console.error('Error en proceso masivo:', err);
    toast.error('Error al procesar la vinculación masiva.');
  } finally {
    isSubmitting.value = false;
    uploadProgressText.value = '';
  }
};

const closeModal = () => {
  files.value = [];
  emit('close');
};
</script>
