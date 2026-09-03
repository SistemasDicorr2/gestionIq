<!-- src/components/cajas/CajaEditarCodigoModal.vue -->
<template>
  <div v-if="show && item" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan">
            <EditIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">
              Modificar Registro de Código
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Código actual: <span class="font-bold text-brand-navy dark:text-brand-cyan">{{ item.codigo }}</span>
            </p>
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
      <div class="p-5 overflow-y-auto space-y-4 flex-grow custom-scrollbar">
        
        <!-- Previsualización del nuevo código generado -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center space-y-1">
          <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nuevo Código Calculado</span>
          <div class="text-2xl sm:text-3xl font-mono font-black text-brand-navy dark:text-brand-cyan-light tracking-wider">
            {{ computedCode }}
          </div>
          <div class="text-[11px] text-slate-500 font-semibold">
            Base: <span class="font-mono font-bold text-slate-700 dark:text-slate-300">{{ computedBaseCode }}</span>
            <span v-if="item.serie !== null && item.serie !== undefined"> • Serie #{{ String(item.serie).padStart(3, '0') }}</span>
          </div>
        </div>

        <!-- Nombre / Descripción -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nombre / Descripción *
          </label>
          <input 
            v-model="form.nombre"
            type="text"
            placeholder="Nombre de la caja o instrumental..."
            class="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          />
        </div>

        <!-- Grid de 6 Componentes de Código -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          <!-- Familia -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Familia</label>
            <select 
              v-model="form.familia"
              class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option v-for="opt in optionsFor('Familia')" :key="opt.codigo" :value="opt.codigo">
                {{ opt.codigo }} - {{ opt.significado }}
              </option>
            </select>
          </div>

          <!-- Material -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Material</label>
            <select 
              v-model="form.material"
              class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option value="">(Ninguno / X)</option>
              <option v-for="opt in optionsFor('Material')" :key="opt.codigo" :value="opt.codigo">
                {{ opt.codigo }} - {{ opt.significado }}
              </option>
            </select>
          </div>

          <!-- Medida / Variante -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Medida / Variante</label>
            <select 
              v-model="form.variante"
              class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option value="">(Ninguna / 00)</option>
              <option v-for="opt in optionsFor('Medida')" :key="opt.codigo" :value="opt.codigo">
                {{ opt.codigo }} - {{ opt.significado }}
              </option>
            </select>
          </div>

          <!-- Clasificación -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Clasificación</label>
            <select 
              v-model="form.clasificacion"
              class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option v-for="opt in optionsFor('Clasificación')" :key="opt.codigo" :value="opt.codigo">
                {{ opt.codigo }} - {{ opt.significado }}
              </option>
            </select>
          </div>

          <!-- Contenido -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contenido</label>
            <select 
              v-model="form.contenido"
              class="w-full px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option v-for="opt in optionsFor('Contenido')" :key="opt.codigo" :value="opt.codigo">
                {{ opt.codigo }} - {{ opt.significado }}
              </option>
            </select>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estado</label>
            <select 
              v-model="form.estado"
              class="w-full px-2.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="historico">Histórico</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>

        </div>

        <!-- Marca (Opcional) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Marca (opcional, no modifica el código de 11 dígitos)
          </label>
          <input 
            v-model="form.marca"
            type="text"
            placeholder="Ej: Stryker, Depuy, Synthes"
            class="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          />
        </div>

        <!-- Observaciones -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Observaciones
          </label>
          <textarea 
            v-model="form.observaciones"
            rows="2"
            placeholder="Observaciones adicionales..."
            class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          ></textarea>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Cancelar
        </button>

        <button 
          @click="handleSave"
          :disabled="saving"
          class="px-5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <SaveIcon v-if="!saving" class="w-4 h-4" />
          <span>{{ saving ? 'Guardando cambios...' : 'Guardar Cambios' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import { Edit3 as EditIcon, X as XIcon, Save as SaveIcon } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  item: Object,
  dictionaryEntries: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'updated']);
const { showSuccessToast, showErrorToast, showWarningToast } = useToasts();

const saving = ref(false);

const form = ref({
  nombre: '',
  familia: 'OS',
  material: 'X',
  variante: '00',
  clasificacion: 'CO',
  contenido: 'C',
  marca: '',
  observaciones: '',
  estado: 'activo'
});

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      nombre: newItem.nombre || '',
      familia: newItem.familia || 'OS',
      material: newItem.material || '',
      variante: newItem.variante || '',
      clasificacion: newItem.clasificacion || 'CO',
      contenido: newItem.contenido || 'C',
      marca: newItem.marca || '',
      observaciones: newItem.observaciones || '',
      estado: newItem.estado || 'activo'
    };
  }
}, { immediate: true });

const optionsFor = (grupoName) => {
  const list = [...props.dictionaryEntries.filter(e => 
    e.grupo.toLowerCase() === grupoName.toLowerCase() && e.activo !== false
  )];

  if (grupoName.toLowerCase() === 'familia' && !list.some(e => e.codigo === 'CO')) {
    list.unshift({ grupo: 'Familia', codigo: 'CO', significado: 'Columna' });
  }
  if (grupoName.toLowerCase() === 'clasificación' && !list.some(e => e.codigo === 'CO')) {
    list.unshift({ grupo: 'Clasificación', codigo: 'CO', significado: 'Columna / Fijación Vertebral' });
  }

  return list;
};

const computedBaseCode = computed(() => {
  const fam = form.value.familia || 'OS';
  const mat = form.value.material || 'X';
  const varnt = form.value.variante || '00';
  const clas = form.value.clasificacion || 'CO';
  const cont = form.value.contenido || 'C';

  return `${fam}-${mat}${varnt}${clas}${cont}`;
});

const computedCode = computed(() => {
  if (!props.item) return computedBaseCode.value;
  if (props.item.es_historico && props.item.codigo_manual) {
    return props.item.codigo_manual;
  }
  if (props.item.serie !== null && props.item.serie !== undefined) {
    return `${computedBaseCode.value}-${String(props.item.serie).padStart(3, '0')}`;
  }
  return `${computedBaseCode.value}-001`;
});

const handleSave = async () => {
  if (!form.value.nombre || !form.value.nombre.trim()) {
    showWarningToast('El campo Nombre / Descripción es obligatorio.');
    return;
  }

  saving.value = true;
  try {
    const newBase = computedBaseCode.value;
    const newCodigo = computedCode.value;

    const payload = {
      nombre: form.value.nombre.trim(),
      familia: form.value.familia,
      material: form.value.material || null,
      variante: form.value.variante || null,
      clasificacion: form.value.clasificacion,
      contenido: form.value.contenido,
      marca: form.value.marca ? form.value.marca.trim() : null,
      observaciones: form.value.observaciones ? form.value.observaciones.trim() : null,
      estado: form.value.estado,
      codigo_base: newBase,
      codigo: newCodigo,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('cajas_codigos')
      .update(payload)
      .eq('id', props.item.id);

    if (error) throw error;

    showSuccessToast(`Código ${newCodigo} modificado con éxito.`);
    emit('updated');
    emit('close');
  } catch (err) {
    console.error('Error al modificar código:', err);
    showErrorToast('Error al modificar el código: ' + (err.message || err));
  } finally {
    saving.value = false;
  }
};
</script>
