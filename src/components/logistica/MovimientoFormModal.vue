<!-- src/components/logistica/MovimientoFormModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/80 dark:border-slate-800 transition-all font-sans">
      
      <!-- Header del Modal -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <h3 class="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
            {{ isEditing ? 'Editar Detalles del Movimiento' : 'Agregar Movimiento Completo' }}
          </h3>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Form Body -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        
        <!-- Tipo de Movimiento con Chips Rápido -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tipo de Movimiento *
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button 
              v-for="tipo in tiposMovimiento" 
              :key="tipo"
              type="button"
              @click="form.tipo_movimiento = tipo"
              :class="[
                'px-2.5 py-2 text-[11px] font-bold rounded-xl border text-left transition-all truncate',
                form.tipo_movimiento === tipo 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-[1.01]' 
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              ]"
            >
              {{ tipo }}
            </button>
          </div>
        </div>

        <!-- Bloque Vincular Cirugía de Gestión IQ -->
        <div class="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-2">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-[11px] font-bold text-blue-900 dark:text-blue-300">Vincular Cirugía de Gestión IQ</span>
              <p class="text-[10px] text-blue-600/80 dark:text-blue-400/80">Opcional. Importa paciente, médico y cliente.</p>
            </div>

            <button 
              type="button" 
              @click="showCirugiaSearch = true"
              class="px-3 py-1.5 text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 shadow-2xs transition-all"
            >
              {{ form.reporte_id ? 'Cambiar Cirugía' : '🔍 Buscar Cirugía' }}
            </button>
          </div>

          <div v-if="form.reporte_id" class="text-[11px] text-slate-700 dark:text-slate-200 space-y-1 pt-2 border-t border-blue-100 dark:border-blue-900/40">
            <div class="flex items-center justify-between font-mono">
              <span class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 font-bold text-[10px]">
                {{ form.id_cirugia_snapshot || 'CX-REF' }}
              </span>
              <button type="button" @click="clearCirugia" class="text-rose-500 hover:underline text-[10px] font-semibold">
                Desvincular
              </button>
            </div>
            <p v-if="form.cliente_snapshot">🏢 <strong>Cliente:</strong> {{ form.cliente_snapshot }}</p>
            <p v-if="form.paciente_snapshot">👤 <strong>Paciente:</strong> {{ form.paciente_snapshot }}</p>
            <p v-if="form.medico_snapshot">👨‍⚕️ <strong>Médico:</strong> {{ form.medico_snapshot }}</p>
            <p v-if="form.institucion_snapshot">🏥 <strong>Institución:</strong> {{ form.institucion_snapshot }}</p>
          </div>
        </div>

        <!-- Campos Manuales de Snapshot -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Paciente / Referencia</label>
            <input v-model="form.paciente_snapshot" type="text" placeholder="Nombre paciente" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Médico</label>
            <input v-model="form.medico_snapshot" type="text" placeholder="Dr. / Dra." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Cliente / Obra Social</label>
            <input v-model="form.cliente_snapshot" type="text" placeholder="Cliente / OS" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Institución / Destino</label>
            <input v-model="form.institucion_snapshot" type="text" placeholder="Sanatorio / Clínica / Lugar" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all" />
          </div>
        </div>

        <!-- Cantidades de Cajas y Bultos -->
        <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cajas</label>
            <div class="flex items-center gap-2">
              <button type="button" @click="form.cantidad_cajas = Math.max(0, (form.cantidad_cajas || 0) - 1)" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100">-</button>
              <input v-model.number="form.cantidad_cajas" type="number" min="0" class="w-full text-center px-2 py-1.5 font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
              <button type="button" @click="form.cantidad_cajas = (form.cantidad_cajas || 0) + 1" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100">+</button>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bultos</label>
            <div class="flex items-center gap-2">
              <button type="button" @click="form.cantidad_bultos = Math.max(0, (form.cantidad_bultos || 0) - 1)" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100">-</button>
              <input v-model.number="form.cantidad_bultos" type="number" min="0" class="w-full text-center px-2 py-1.5 font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
              <button type="button" @click="form.cantidad_bultos = (form.cantidad_bultos || 0) + 1" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100">+</button>
            </div>
          </div>
        </div>

        <!-- Declaración de Pendientes -->
        <div class="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-900 dark:text-amber-300">¿Quedó un pendiente en este movimiento?</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.tiene_pendiente" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div v-if="form.tiene_pendiente" class="space-y-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
            <div>
              <label class="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">Detalle del Pendiente *</label>
              <input v-model="form.detalle_pendiente" type="text" placeholder="Ej: 1 caja de tornillos pendiente de retiro" class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl focus:outline-none dark:text-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">Motivo (Opcional)</label>
              <input v-model="form.motivo_pendiente" type="text" placeholder="Ej: Cirugía extendida / Movilidad" class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl focus:outline-none dark:text-white" />
            </div>
          </div>
        </div>

        <!-- Observaciones Adicionales -->
        <div>
          <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Observaciones o Notas</label>
          <textarea v-model="form.observaciones" rows="2" placeholder="Observaciones adicionales sobre esta gestión..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all"></textarea>
        </div>
      </div>

      <!-- Footer del Modal -->
      <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
        <button 
          v-if="isEditing" 
          type="button" 
          @click="$emit('delete')" 
          class="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
        >
          Eliminar
        </button>

        <div class="flex items-center gap-2 ml-auto">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            @click="save" 
            class="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-98"
          >
            Guardar Movimiento
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Buscador de Cirugías -->
    <CirugiaSearchModal 
      :show="showCirugiaSearch"
      @close="showCirugiaSearch = false"
      @select="handleCirugiaSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import CirugiaSearchModal from './CirugiaSearchModal.vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
  initialData: Object,
  isEditing: Boolean
});

const emit = defineEmits(['close', 'save', 'delete']);
const toast = useToast();

const showCirugiaSearch = ref(false);
const tiposMovimiento = [
  'Entrega de cajas',
  'Retiro de cajas',
  'Traslado a Central',
  'Documentación',
  'Otra gestión',
  'Incidencia'
];

const form = reactive({
  tipo_movimiento: 'Entrega de cajas',
  reporte_id: null,
  id_cirugia_snapshot: '',
  cliente_snapshot: '',
  paciente_snapshot: '',
  medico_snapshot: '',
  institucion_snapshot: '',
  fecha_cirugia_snapshot: '',
  cantidad_cajas: 1,
  cantidad_bultos: 1,
  resultado: '',
  tiene_pendiente: false,
  cantidad_pendiente: 0,
  detalle_pendiente: '',
  motivo_pendiente: '',
  observaciones: ''
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      Object.assign(form, props.initialData);
    } else {
      Object.assign(form, {
        tipo_movimiento: 'Entrega de cajas',
        reporte_id: null,
        id_cirugia_snapshot: '',
        cliente_snapshot: '',
        paciente_snapshot: '',
        medico_snapshot: '',
        institucion_snapshot: '',
        fecha_cirugia_snapshot: '',
        cantidad_cajas: 1,
        cantidad_bultos: 1,
        resultado: '',
        tiene_pendiente: false,
        cantidad_pendiente: 0,
        detalle_pendiente: '',
        motivo_pendiente: '',
        observaciones: ''
      });
    }
  }
});

const handleCirugiaSelect = (cirugia) => {
  form.reporte_id = cirugia.id;
  form.id_cirugia_snapshot = cirugia.id_cirugia || '';
  form.cliente_snapshot = cirugia.cliente || '';
  form.paciente_snapshot = cirugia.paciente || '';
  form.medico_snapshot = cirugia.medico || '';
  form.institucion_snapshot = cirugia.institucion || '';
  form.fecha_cirugia_snapshot = cirugia.fecha_cirugia || '';
};

const clearCirugia = () => {
  form.reporte_id = null;
  form.id_cirugia_snapshot = '';
  form.cliente_snapshot = '';
};

const save = () => {
  if (!form.tipo_movimiento) {
    toast.error('Debe seleccionar un tipo de movimiento.');
    return;
  }
  if (form.tiene_pendiente && !form.detalle_pendiente?.trim()) {
    toast.error('Indique el detalle del pendiente.');
    return;
  }
  emit('save', { ...form });
  emit('close');
};
</script>
