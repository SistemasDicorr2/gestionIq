<!-- src/components/admin/corrections/ToolAgregarCirugia.vue -->
<template>
  <div class="tool-container">
    <header class="tool-header">
      <h4 class="tool-title text-indigo-700 dark:text-indigo-400">Agregar Cirugía (Cx) a la Liquidación</h4>
      <p class="tool-description">
        Asocia una cirugía que quedó pendiente a esta orden de pago y actualiza los montos consolidados.
      </p>
    </header>

    <div class="tool-body space-y-6">
      <!-- Buscador de Cirugías Pendientes -->
      <div v-if="!selectedSurgery" class="space-y-4">
        <div class="space-y-1.5">
          <label for="searchPending" class="form-label font-semibold">Buscar Cirugía Pendiente</label>
          <input
            id="searchPending"
            type="text"
            v-model="searchTerm"
            placeholder="Buscar por paciente, instrumentador o ID..."
            class="form-input"
          />
        </div>

        <div v-if="isLoading" class="text-sm text-slate-500 py-2">
          Cargando cirugías pendientes...
        </div>

        <div v-else-if="filteredSurgeries.length > 0" class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40">
          <ul class="divide-y divide-slate-200 dark:divide-slate-700">
            <li
              v-for="cx in filteredSurgeries"
              :key="cx.id"
              @click="selectSurgery(cx)"
              class="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors duration-150"
            >
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ cx.paciente }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ formatDate(cx.fecha_cirugia) }} | Inst: {{ cx.instrumentador_nombre || 'No asignado' }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30">
                  {{ formatCurrency(cx.monto_a_pagar) }}
                </span>
              </div>
            </li>
          </ul>
        </div>
        <p v-else-if="searchTerm" class="text-sm text-slate-500 py-2">
          No se encontraron cirugías pendientes.
        </p>
      </div>

      <!-- Detalle y Confirmación de la Cirugía Seleccionada -->
      <div v-else class="space-y-6">
        <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-4 rounded-xl">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[10px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">Cirugía Seleccionada</p>
              <h5 class="font-bold text-slate-900 dark:text-white mt-1">{{ selectedSurgery.paciente }}</h5>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fecha: {{ formatDate(selectedSurgery.fecha_cirugia) }}
              </p>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-2">
                <span class="font-semibold">Instrumentador:</span> {{ selectedSurgery.instrumentador_nombre }} (DNI: {{ selectedSurgery.instrumentador_dni }})
              </p>
            </div>
            <button @click="resetSurgerySelection" class="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 shadow-sm transition-all duration-155 cursor-pointer">
              Cambiar
            </button>
          </div>
        </div>

        <!-- Validación de Instrumentador -->
        <div v-if="!selectedSurgery.instrumentador_dni" class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
          <p class="font-bold">Advertencia importante</p>
          <p class="mt-1">Esta cirugía no tiene un instrumentador asignado con DNI. Debes asignar el instrumentador antes de poder agregarla a esta liquidación.</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Modificación del Monto -->
          <div class="space-y-1.5">
            <label for="monto-adicional" class="form-label font-semibold">Monto a Liquidar por esta Cirugía</label>
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 px-3 py-2 flex items-center">
              <span class="text-slate-400 font-semibold mr-1.5">$</span>
              <input
                id="monto-adicional"
                type="number"
                v-model.number="montoALiquidar"
                class="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-0"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Botón de Confirmación -->
          <div class="pt-2">
            <button
              @click="handleAgregarCirugia"
              :disabled="isSubmitting || montoALiquidar <= 0"
              class="btn-primary w-full"
            >
              <span v-if="isSubmitting">Agregando cirugía...</span>
              <span v-else>Confirmar y Agregar a la Orden #{{ orderId }}</span>
            </button>
            <p v-if="montoALiquidar <= 0" class="text-center text-xs mt-2.5 text-red-500 font-bold uppercase tracking-wider">
              El monto debe ser mayor que cero
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../services/supabase';
import { useToasts } from '../../../composables/useToasts';

const props = defineProps({
  orderId: { type: [Number, String], required: true }
});

const emit = defineEmits(['action-completed']);

const { showSuccessToast, showErrorToast, showLoadingToast, updateToast } = useToasts();

const isLoading = ref(true);
const isSubmitting = ref(false);
const searchTerm = ref('');
const pendingSurgeries = ref([]);
const selectedSurgery = ref(null);
const montoALiquidar = ref(0);

const fetchPendingSurgeries = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase.rpc('get_todas_cirugias_pendientes');
    if (error) throw error;
    pendingSurgeries.value = data || [];
  } catch (err) {
    console.error('Error fetching pending surgeries:', err);
    showErrorToast(err, 'No se pudo cargar el listado de cirugías pendientes.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPendingSurgeries();
});

const filteredSurgeries = computed(() => {
  if (!searchTerm.value) return [];
  const term = searchTerm.value.toLowerCase();
  return pendingSurgeries.value.filter(cx => {
    const matchPaciente = cx.paciente?.toLowerCase().includes(term);
    const matchInst = cx.instrumentador_nombre?.toLowerCase().includes(term);
    const matchId = String(cx.id).includes(term);
    return matchPaciente || matchInst || matchId;
  }).slice(0, 10);
});

const selectSurgery = (cx) => {
  selectedSurgery.value = cx;
  montoALiquidar.value = Number(cx.monto_a_pagar) || 0;
};

const resetSurgerySelection = () => {
  selectedSurgery.value = null;
  montoALiquidar.value = 0;
};

const handleAgregarCirugia = async () => {
  if (isSubmitting.value || montoALiquidar.value <= 0 || !selectedSurgery.value?.instrumentador_dni) return;

  isSubmitting.value = true;
  const loadingToastId = showLoadingToast("Asociando cirugía a la liquidación...");

  try {
    const surgery = selectedSurgery.value;
    const orderId = Number(props.orderId);
    const amount = Number(montoALiquidar.value);

    // 1. Verificar si ya existe un registro de pago para este instrumentador en esta orden
    const { data: existingPago, error: pagoQueryError } = await supabase
      .from('pagos')
      .select('id, monto_total_instrumentador')
      .eq('orden_de_pago_id', orderId)
      .eq('instrumentador_dni', surgery.instrumentador_dni)
      .maybeSingle();

    if (pagoQueryError) throw pagoQueryError;

    // 2. Obtener el monto total actual de la orden de pago general
    const { data: orderData, error: orderQueryError } = await supabase
      .from('ordenes_de_pago')
      .select('monto_total_general')
      .eq('id', orderId)
      .single();

    if (orderQueryError) throw orderQueryError;

    let targetPagoId;

    if (existingPago) {
      targetPagoId = existingPago.id;
      // Actualizar el monto consolidado de este instrumentador sumando el nuevo monto
      const nuevoMontoPago = Number(existingPago.monto_total_instrumentador) + amount;
      const { error: updatePagoError } = await supabase
        .from('pagos')
        .update({ monto_total_instrumentador: nuevoMontoPago })
        .eq('id', targetPagoId);

      if (updatePagoError) throw updatePagoError;
    } else {
      // Si no existe, insertar un nuevo registro de pago para este instrumentador
      const { data: newPago, error: insertPagoError } = await supabase
        .from('pagos')
        .insert({
          orden_de_pago_id: orderId,
          instrumentador_dni: surgery.instrumentador_dni,
          monto_total_instrumentador: amount
        })
        .select('id')
        .single();

      if (insertPagoError) throw insertPagoError;
      targetPagoId = newPago.id;
    }

    // 3. Vincular la cirugía al pago_id y marcarla como pagada con el monto especificado
    const { error: updateSurgeryError } = await supabase
      .from('reportes')
      .update({
        pago_id: targetPagoId,
        estado_pago: 'Pagado',
        monto_a_pagar: amount
      })
      .eq('id', surgery.id);

    if (updateSurgeryError) throw updateSurgeryError;

    // 4. Actualizar el monto total general de la orden de pago general
    const nuevoMontoGeneral = Number(orderData.monto_total_general) + amount;
    const { error: updateOrderError } = await supabase
      .from('ordenes_de_pago')
      .update({ monto_total_general: nuevoMontoGeneral })
      .eq('id', orderId);

    if (updateOrderError) throw updateOrderError;

    updateToast(loadingToastId, "¡Cirugía agregada y liquidación actualizada con éxito!", "success");
    emit('action-completed');
    resetSurgerySelection();

  } catch (err) {
    console.error('Error al agregar cirugía a orden de pago:', err);
    updateToast(loadingToastId, `Error: ${err.message}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
</script>

<style scoped>
.tool-container { @apply bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-800/80; }
.tool-header { @apply p-4 border-b border-slate-200 dark:border-slate-700/80; }
.tool-title { @apply font-semibold; }
.tool-description { @apply text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed; }
.tool-body { @apply p-5; }
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
.form-input { @apply px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg w-full bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-100 transition-all duration-150; }
.btn-primary { @apply bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-150 shadow-sm disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 cursor-pointer; }
</style>
