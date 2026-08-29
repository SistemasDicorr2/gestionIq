<!-- src/components/admin/ConfigurarDestinatariosModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
      
      <!-- Encabezado Modal -->
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span class="text-xs font-black uppercase text-blue-600 dark:text-blue-400">CONFIGURACIÓN AUTOMÁTICA</span>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">
            Destinatarios del Reporte Semanal (Jueves 15 hs)
          </h3>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xl font-bold">
          ✕
        </button>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        Las direcciones listadas a continuación recibirán automáticamente el reporte ejecutivo por correo con el enlace al lote inmutable de fichas cada jueves a las 15:00 hs.
      </p>

      <!-- Estado de Carga -->
      <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
        Cargando configuración de destinatarios...
      </div>

      <div v-else class="space-y-4">
        <!-- Agregar Nuevo Email -->
        <form @submit.prevent="addEmail" class="flex gap-2">
          <input 
            v-model="newEmail" 
            type="email" 
            placeholder="ejemplo@districorr.com.ar" 
            class="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            :disabled="!newEmail.trim()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            + Añadir
          </button>
        </form>

        <!-- Lista de Emails Registrados -->
        <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
          <div 
            v-for="(email, idx) in emailList" 
            :key="idx" 
            class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400 text-sm">✉️</span>
              <span>{{ email }}</span>
            </div>
            <button 
              @click="removeEmail(idx)" 
              class="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
            >
              Quitar
            </button>
          </div>

          <div v-if="emailList.length === 0" class="text-center py-4 text-xs text-slate-400 italic">
            No hay destinatarios registrados.
          </div>
        </div>
      </div>

      <!-- Acciones del Modal -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button @click="$emit('close')" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
          Cancelar
        </button>
        <button 
          @click="saveConfig" 
          :disabled="saving || loading"
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
        >
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
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
  show: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const newEmail = ref('');
const emailList = ref([]);

const fetchConfig = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_destinatarios')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (data && Array.isArray(data.value)) {
      emailList.value = [...data.value];
    } else {
      emailList.value = ["sistemas@districorr.com.ar", "contable@districorr.com.ar", "auxiliardeposito@districorr.com.ar"];
    }
  } catch (err) {
    toast.error("Error al cargar destinatarios: " + err.message);
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (val) => {
  if (val) fetchConfig();
});

const addEmail = () => {
  const email = newEmail.value.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    toast.error("Ingresá un correo electrónico válido.");
    return;
  }
  if (emailList.value.includes(email)) {
    toast.error("El correo ya está en la lista.");
    return;
  }
  emailList.value.push(email);
  newEmail.value = '';
};

const removeEmail = (index) => {
  emailList.value.splice(index, 1);
};

const saveConfig = async () => {
  try {
    saving.value = true;
    const { error } = await supabase
      .from('resumen_operativo_config')
      .upsert({
        key: 'emails_destinatarios',
        value: emailList.value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    toast.success("Lista de destinatarios actualizada correctamente.");
    emit('close');
  } catch (err) {
    toast.error("Error al guardar destinatarios: " + err.message);
  } finally {
    saving.value = false;
  }
};
</script>
