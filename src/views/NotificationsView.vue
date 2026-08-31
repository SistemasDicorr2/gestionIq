<!-- src/views/NotificationsView.vue -->
<template>
  <div class="p-3 sm:p-6 lg:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Cabecera de la Página -->
      <div class="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 class="text-xl sm:text-2xl font-black text-brand-navy dark:text-white tracking-tight">
          Historial de Notificaciones
        </h1>
        <p class="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Aquí puedes ver todas las notificaciones generadas en el sistema.
        </p>
      </div>

      <!-- Estado de Carga -->
      <div v-if="loading" class="mt-6 space-y-3">
        <!-- Usamos un esqueleto simple para el feedback de carga -->
        <div v-for="n in 5" :key="n" class="h-16 bg-slate-100 dark:bg-slate-800/80 rounded-xl animate-pulse"></div>
      </div>

      <!-- Estado de Error -->
      <div v-else-if="error" class="mt-6 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400 px-4 py-3 rounded-xl text-xs sm:text-sm" role="alert">
        <strong class="font-bold">Error: </strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <!-- Contenido Principal -->
      <div v-else class="mt-6">
        <!-- Mensaje para cuando no hay notificaciones -->
        <div v-if="notifications.length === 0" class="text-center py-10 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p class="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">No se han encontrado notificaciones.</p>
        </div>
        
        <!-- Lista de Notificaciones -->
        <div v-else class="bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
          <ul class="divide-y divide-slate-100 dark:divide-slate-800/80">
            <li
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread-highlight': !notification.is_read }"
            >
              <div class="flex-shrink-0 self-start pt-0.5">
                <InformationCircleIcon class="h-5 w-5 text-brand-cyan" />
              </div>
              <div class="flex-grow min-w-0">
                <p v-html="notification.message" class="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words"></p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">{{ formatTimeAgo(notification.created_at) }}</p>
              </div>
            </li>
          </ul>
          
          <!-- Controles de Paginación -->
          <PaginationControls 
            v-if="totalNotifications > itemsPerPage" 
            :current-page="currentPage" 
            :total-items="totalNotifications" 
            :items-per-page="itemsPerPage" 
            @page-changed="goToPage" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import PaginationControls from '../components/PaginationControls.vue';

const toast = useToast();

// Estado reactivo para la vista
const notifications = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(20); // Mostramos 20 notificaciones por página
const totalNotifications = ref(0);

// Función para obtener los datos paginados desde la RPC
const fetchPaginatedNotifications = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      p_page: currentPage.value,
      p_items_per_page: itemsPerPage.value
    };

    const { data, error: rpcError } = await supabase.rpc('get_all_notifications_paginated', params);

    if (rpcError) throw rpcError;

    if (data && data.length > 0) {
      notifications.value = data;
      totalNotifications.value = data[0].total_count;
    } else {
      notifications.value = [];
      totalNotifications.value = 0;
    }
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar el historial: " + err.message);
  } finally {
    loading.value = false;
  }
};

// Se llama a la función al montar el componente para la carga inicial.
onMounted(fetchPaginatedNotifications);

// Función para cambiar de página
const goToPage = (page) => {
  currentPage.value = page;
  fetchPaginatedNotifications();
};

// Función helper para formatear la fecha
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
};
</script>

<style scoped>
.notification-item {
  @apply flex items-start gap-3 px-4 py-4;
}
.unread-highlight {
  @apply bg-blue-50 dark:bg-blue-900/20;
}
:deep(strong) {
  @apply font-semibold text-gray-900 dark:text-slate-100;
}
</style>