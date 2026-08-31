<template>
  <!-- Backdrop transparente para móviles -->
  <div 
    v-if="show" 
    class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs sm:hidden"
    @click="$emit('close')"
  />

  <Transition
    enter-active-class="transition ease-out duration-200 transform"
    enter-from-class="opacity-0 -translate-y-2 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition ease-in duration-150 transform"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-2 scale-95"
  >
    <div 
      v-if="show"
      class="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-11 sm:top-full sm:mt-2.5 w-auto sm:w-96 max-w-[calc(100vw-1rem)] sm:max-w-none rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 focus:outline-none z-50 flex flex-col overflow-hidden select-none max-h-[82vh] sm:max-h-[600px]"
      role="dialog"
      aria-label="Panel de Notificaciones"
    >
      <!-- Header -->
      <header class="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 z-10">
        <div class="flex items-center gap-2 min-w-0">
          <h3 class="text-xs font-black text-brand-navy dark:text-white uppercase tracking-wider truncate">
            Notificaciones
          </h3>
          <span v-if="unreadCount > 0" class="px-2 py-0.5 text-[10px] font-black bg-brand-cyan text-white rounded-full shadow-2xs shrink-0">
            {{ unreadCount }} nuevas
          </span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button 
            v-if="notifications.length > 0 && unreadCount > 0" 
            @click="$emit('mark-all-read')" 
            class="text-[11px] font-bold text-brand-cyan hover:text-brand-cyan-dark dark:text-brand-cyan-light transition-colors cursor-pointer flex items-center gap-1"
          >
            <CheckCheckIcon class="w-3.5 h-3.5" />
            <span class="hidden xs:inline sm:inline">Marcar leídas</span>
            <span class="inline xs:hidden sm:hidden">Leídas</span>
          </button>

          <!-- Botón de cierre en móviles -->
          <button 
            @click="$emit('close')" 
            class="sm:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar notificaciones"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </header>

      <!-- Cuerpo de Notificaciones -->
      <div class="flex-grow overflow-y-auto max-h-[60vh] p-1.5 space-y-1 custom-scrollbar">
        <!-- Estado Vacío -->
        <div v-if="notifications.length === 0" class="px-4 py-10 text-center flex flex-col items-center">
          <div class="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 mb-3 shadow-xs">
            <CheckCircle2Icon class="w-6 h-6 text-emerald-500" />
          </div>
          <p class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">¡Todo al día!</p>
          <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">No tienes notificaciones pendientes por revisar.</p>
        </div>
        
        <!-- Lista de Notificaciones -->
        <ul v-else class="space-y-1" role="list">
          <li
            v-for="(notification, index) in notifications"
            :key="notification.id || index"
            class="group p-2.5 sm:p-3 rounded-xl transition-all duration-150 cursor-pointer flex items-start gap-2.5 sm:gap-3 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
            :class="[
              !notification.is_read 
                ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-100/50 dark:border-blue-900/40' 
                : ''
            ]"
            @click="$emit('notification-click', notification)"
          >
            <div class="shrink-0 pt-0.5">
              <component :is="getIconForType(notification.type)" :class="['w-4 h-4 sm:w-4.5 sm:h-4.5', getIconColor(notification.type)]" />
            </div>

            <div class="flex-grow min-w-0">
              <p v-html="notification.message" class="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed group-hover:text-brand-cyan transition-colors break-words"></p>
              
              <div class="flex items-center justify-between mt-1 gap-2">
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                  {{ formatTimeAgo(notification.created_at) }}
                </span>
                
                <span v-if="!notification.is_read" class="w-2 h-2 rounded-full bg-brand-cyan shrink-0"></span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Footer -->
      <footer class="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3.5 py-2.5 sm:px-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <button 
          @click="$emit('view-all')" 
          class="text-xs font-bold text-brand-navy hover:text-brand-cyan dark:text-brand-cyan-light transition-all cursor-pointer flex items-center gap-1"
        >
          <span>Ver todas las notificaciones</span>
          <span>→</span>
        </button>
      </footer>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Lucide Icons
import {
  CheckCircle2 as CheckCircle2Icon,
  Info as InfoIcon,
  AlertTriangle as AlertTriangleIcon,
  XCircle as XCircleIcon,
  CheckCheck as CheckCheckIcon,
  X as XIcon
} from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] }
});

defineEmits(['close', 'mark-all-read', 'notification-click', 'view-all']);

const unreadCount = computed(() => props.notifications.filter(n => !n.is_read).length);

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
};

const getIconForType = (type = 'info') => {
  const icons = { success: CheckCircle2Icon, info: InfoIcon, warning: AlertTriangleIcon, error: XCircleIcon };
  return icons[type] || InfoIcon;
};

const getIconColor = (type = 'info') => {
  const colors = { success: 'text-emerald-500', info: 'text-brand-cyan', warning: 'text-amber-500', error: 'text-rose-500' };
  return colors[type] || 'text-brand-cyan';
};
</script>