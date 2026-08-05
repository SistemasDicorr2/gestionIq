<!-- src/components/NotificationDropdown.vue (Animaciones y Transiciones Fluidas - Minimalist UI) -->
<template>
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
      ref="dropdownRef"
      tabindex="-1"
      @keydown="handleKeydown"
      class="absolute top-full right-0 mt-2.5 w-80 sm:w-96 origin-top-right rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 focus:outline-none z-50 flex flex-col overflow-hidden animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-title"
    >
      <!-- Header -->
      <header class="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center shrink-0 z-10">
        <div class="flex items-center gap-2">
          <h3 id="notifications-title" class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Notificaciones
          </h3>
          <span v-if="unreadCount > 0" class="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full animate-pulse shadow-2xs">
            {{ unreadCount }} nuevas
          </span>
        </div>

        <button 
          v-if="notifications.length > 0" 
          @click="$emit('mark-all-read')" 
          class="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
        >
          Marcar leídas
        </button>
      </header>

      <!-- Cuerpo con Scroll y Animación de Lista -->
      <div class="flex-grow overflow-y-auto max-h-[62vh] p-2 space-y-1">
        <!-- Estado Vacío -->
        <div v-if="notifications.length === 0" class="px-4 py-10 text-center flex flex-col items-center">
          <div class="animated-icon-wrapper shadow-xs">
            <svg class="w-10 h-10 text-emerald-500" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <p class="text-xs font-black text-slate-800 dark:text-slate-200 mt-3 uppercase tracking-wider">¡Todo al día!</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">No tienes notificaciones pendientes por revisar.</p>
        </div>
        
        <!-- Lista de Notificaciones Animada -->
        <TransitionGroup 
          v-else 
          tag="ul" 
          name="notification-list" 
          class="space-y-1" 
          role="listbox" 
          aria-label="Lista de notificaciones"
        >
          <li
            v-for="(notification, index) in notifications"
            :key="notification.id || index"
            role="option"
            :aria-selected="index === focusedIndex"
            class="group p-3 rounded-2xl transition-all duration-200 cursor-pointer flex items-start gap-3 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800 hover:translate-x-1"
            :class="[
              !notification.is_read ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-100/60 dark:border-blue-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-850',
              index === focusedIndex ? 'bg-slate-100 dark:bg-slate-800' : ''
            ]"
            @click="$emit('notification-click', notification)"
            @mouseenter="focusedIndex = index"
          >
            <div class="flex-shrink-0 pt-0.5 transition-transform duration-200 group-hover:scale-110">
              <component :is="getIconForType(notification.type)" :class="['h-5 w-5', getIconColor(notification.type)]" />
            </div>

            <div class="flex-grow min-w-0">
              <p v-html="notification.message" class="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></p>
              
              <div class="flex items-center justify-between mt-1">
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {{ formatTimeAgo(notification.created_at) }}
                </span>
                
                <span v-if="!notification.is_read" class="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              </div>
            </div>
          </li>
        </TransitionGroup>
      </div>

      <!-- Footer -->
      <footer class="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center shrink-0">
        <button 
          @click="$emit('view-all')" 
          class="text-xs font-extrabold text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition-all cursor-pointer"
        >
          Ver todas las notificaciones →
        </button>

        <button 
          @click="showPreferencesToast" 
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Configuración de Notificaciones"
        >
          <Cog6ToothIcon class="h-4 w-4" />
        </button>
      </footer>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useToast } from 'vue-toastification';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  show: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'mark-all-read', 'notification-click', 'view-all']);

const toast = useToast();

const unreadCount = computed(() => props.notifications.filter(n => !n.is_read).length);

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
};

const getIconForType = (type = 'info') => {
  const icons = { success: CheckCircleIcon, info: InformationCircleIcon, warning: ExclamationTriangleIcon, error: XCircleIcon };
  return icons[type] || InformationCircleIcon;
};
const getIconColor = (type = 'info') => {
  const colors = { success: 'text-emerald-500', info: 'text-blue-500', warning: 'text-amber-500', error: 'text-rose-500' };
  return colors[type] || 'text-blue-500';
};

const showPreferencesToast = () => {
  toast.info("La configuración de notificaciones estará disponible próximamente.");
};

const dropdownRef = ref(null);
const focusedIndex = ref(-1);

watch(() => props.show, (isShown) => {
  if (isShown) {
    nextTick(() => { dropdownRef.value?.focus(); });
  } else {
    focusedIndex.value = -1;
  }
});

const handleKeydown = (event) => {
  const itemsCount = props.notifications.length;
  if (itemsCount === 0) return;
  switch (event.key) {
    case 'ArrowDown': event.preventDefault(); focusedIndex.value = (focusedIndex.value + 1) % itemsCount; break;
    case 'ArrowUp': event.preventDefault(); focusedIndex.value = (focusedIndex.value - 1 + itemsCount) % itemsCount; break;
    case 'Enter': if (focusedIndex.value !== -1) { event.preventDefault(); emit('notification-click', props.notifications[focusedIndex.value]); } break;
    case 'Escape': emit('close'); break;
  }
};
</script>

<style scoped>
:deep(strong) { @apply font-bold text-slate-900 dark:text-white; }

.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.notification-list-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
.notification-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.notification-list-move {
  transition: transform 0.25s ease;
}

.animated-icon-wrapper { 
  @apply w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50; 
}

.checkmark-circle { 
  stroke-dasharray: 166; 
  stroke-dashoffset: 166; 
  stroke-width: 3; 
  stroke-miterlimit: 10; 
  stroke: #10b981; 
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; 
}
.checkmark-check { 
  transform-origin: 50% 50%; 
  stroke-dasharray: 48; 
  stroke-dashoffset: 48; 
  stroke-width: 4; 
  stroke: #10b981; 
  stroke-linecap: round; 
  stroke-linejoin: round; 
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards; 
}
@keyframes stroke { 
  100% { stroke-dashoffset: 0; } 
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96) translateY(-6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>