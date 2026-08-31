<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="flex h-screen bg-brand-bg-light dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
    
    <!-- Sidebar con Control de Visibilidad y Estado Colapsado -->
    <Sidebar 
      :is-open="isSidebarOpen" 
      :is-collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar" 
      @toggle-collapse="toggleSidebarCollapse"
    />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <!-- Navbar / Header Principal Ultra-Compacto Estilo Linear (Height: 40px / h-10) -->
      <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-10 flex items-center justify-between px-3 shrink-0 z-20 transition-all select-none">
        
        <!-- Izquierda: Botón Menú Móvil / Toggle Collapse Desktop + Breadcrumb Fino -->
        <div class="flex items-center gap-2 min-w-0">
          
          <!-- Botón Menú Móvil (md:hidden) -->
          <button 
            @click="toggleSidebar" 
            class="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none transition-colors shrink-0"
            title="Abrir menú"
            aria-label="Abrir menú"
          >
            <MenuIcon class="w-4 h-4" />
          </button>

          <!-- Botón Toggle Sidebar Desktop (Siempre visible en escritorio) -->
          <button 
            @click="toggleSidebarCollapse" 
            class="hidden md:flex p-1 rounded-md text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            :title="isSidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'"
          >
            <component :is="isSidebarCollapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon" class="w-4 h-4" />
          </button>

          <!-- Separador fino en desktop -->
          <div class="hidden md:block w-px h-3.5 bg-slate-200 dark:bg-slate-800 shrink-0" />

          <!-- Breadcrumb Fino y Navegable -->
          <div class="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 min-w-0">
            <button 
              @click="router.push('/admin')" 
              class="text-slate-500 hover:text-brand-navy dark:text-slate-400 dark:hover:text-white font-medium transition-colors focus:outline-none shrink-0 flex items-center gap-1" 
              title="Ir al Panel Principal"
            >
              <span>Gestión IQ</span>
            </button>
            
            <ChevronRightIcon class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />

            <span class="font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {{ headerConfig?.title || 'Panel de Control' }}
            </span>
          </div>
        </div>

        <!-- Derecha: Botón Primario de Acción y Notificaciones -->
        <div class="flex items-center gap-2 shrink-0">
          
          <component 
            v-for="(button, index) in (headerConfig?.buttons || [])" 
            :key="index" 
            :is="'button'" 
            @click="button.action" 
            class="px-2.5 py-1 bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-cyan text-white font-extrabold text-[11px] rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
          >
            <component v-if="button.icon" :is="button.icon" class="w-3.5 h-3.5 shrink-0" />
            <span>{{ button.text }}</span>
          </component>
          
          <!-- Botón de Notificaciones con Badge -->
          <div class="relative" ref="notificationMenuRef">
            <button 
              @click="toggleDropdown" 
              class="relative p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              :class="{ 'animate-bellRing': isRinging }"
              title="Notificaciones"
              aria-label="Ver notificaciones"
            >
              <BellIcon class="w-4 h-4 transition-transform group-hover:scale-110" />
              
              <!-- Badge Pequeño -->
              <span 
                v-if="unreadCount > 0" 
                class="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border border-white dark:border-slate-900 shadow-2xs leading-none"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
            
            <NotificationDropdown
              :show="isDropdownOpen"
              :notifications="notifications"
              @close="isDropdownOpen = false"
              @notification-click="handleNotificationClick"
              @mark-all-read="handleMarkAllRead"
              @view-all="goToAllNotifications"
            />
          </div>
        </div>
      </header>

      <!-- Área de Trabajo Principal (Único contenedor con Scroll) -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5 lg:p-6 custom-scrollbar">
        <router-view />
      </main>
    </div>
    
    <ReportDrawer 
      :show="isDrawerVisible" 
      :reporte="selectedReporteForDrawer" 
      @close="closeDrawer"
      @updated="handleDrawerUpdate"
    />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { onClickOutside } from '@vueuse/core';
import { supabase } from '../services/supabase.js';
import Sidebar from '../components/Sidebar.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import NotificationDropdown from '../components/NotificationDropdown.vue';

// Lucide Icons
import { 
  Bell as BellIcon, 
  Menu as MenuIcon, 
  PanelLeftOpen as PanelLeftOpenIcon,
  PanelLeftClose as PanelLeftCloseIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-vue-next';

const router = useRouter();
const toast = useToast();
const isRinging = ref(false);

const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true');

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  localStorage.setItem('sidebar_collapsed', isSidebarCollapsed.value);
};

const headerConfig = ref({
  title: 'Panel de Control',
  buttons: []
});

const setHeaderConfig = (config) => {
  headerConfig.value = {
    title: config.title || 'Panel de Control',
    buttons: config.buttons || []
  };
};

provide('header-config', headerConfig);
provide('setHeaderConfig', setHeaderConfig);

const isDropdownOpen = ref(false);
const notifications = ref([]);
const notificationMenuRef = ref(null);
let notificationChannel = null;

onClickOutside(notificationMenuRef, () => {
  isDropdownOpen.value = false;
});

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

const fetchNotifications = async () => {
  const { data, error } = await supabase.rpc('get_notifications');
  if (error) {
    console.error('Error al cargar notificaciones:', error);
  } else {
    notifications.value = data || [];
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleMarkAllRead = async () => {
  notifications.value.forEach(n => n.is_read = true);
  const { error } = await supabase.rpc('mark_notifications_as_read');
  if (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
  }
};

const handleNotificationClick = (notification) => {
  isDropdownOpen.value = false;
  supabase.from('reportes').select('*').eq('id', notification.reporte_id).single()
    .then(({ data, error }) => {
      if (error) throw error;
      openDrawer(data);
    })
    .catch(() => toast.error('No se pudo encontrar el reporte asociado.'));
};

const goToAllNotifications = () => {
  isDropdownOpen.value = false;
  router.push({ name: 'Notificaciones' });
};

// Sintetizador Web Audio API para el sonido de notificación "pop-pop"
const playNotificationPopSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Pop 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(600, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.08);

    // Pop 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(850, ctx.currentTime + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(1700, ctx.currentTime + 0.17);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.17);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.09);
    osc2.stop(ctx.currentTime + 0.17);
  } catch (e) {
    // Ignorar si el navegador bloquea audio sin interacción del usuario
  }
};

const triggerBellRing = () => {
  isRinging.value = true;
  playNotificationPopSound();
  setTimeout(() => {
    isRinging.value = false;
  }, 1200);
};

onMounted(() => {
  fetchNotifications();
  notificationChannel = supabase
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
      notifications.value.unshift(payload.new);
      triggerBellRing();
      toast.success(payload.new.message || 'Nueva notificación recibida');
    })
    .subscribe();
});

onUnmounted(() => {
  if (notificationChannel) {
    supabase.removeChannel(notificationChannel);
  }
});

const isDrawerVisible = ref(false);
const selectedReporteForDrawer = ref(null);

const openDrawer = (reporte) => {
  selectedReporteForDrawer.value = reporte;
  isDrawerVisible.value = true;
};
const closeDrawer = () => {
  isDrawerVisible.value = false;
};
const handleDrawerUpdate = () => {};
</script>


<style>
@keyframes bellRing {
  0% { transform: rotate(0); }
  15% { transform: rotate(14deg); }
  30% { transform: rotate(-14deg); }
  45% { transform: rotate(10deg); }
  60% { transform: rotate(-10deg); }
  75% { transform: rotate(4deg); }
  100% { transform: rotate(0); }
}

.animate-bellRing {
  animation: bellRing 1s ease-in-out forwards;
}
</style>