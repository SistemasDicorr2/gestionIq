<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="flex h-screen bg-brand-bg-light dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
    
    <!-- Sidebar con Control de Visibilidad y Estado Colapsado -->
    <Sidebar 
      :is-open="isSidebarOpen" 
      :is-collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar" 
      @toggle-collapse="toggleSidebarCollapse"
    />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <!-- Navbar / Header Principal Compacto (Height: 52px / h-13) -->
      <header class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-13 flex items-center justify-between px-3 sm:px-5 shrink-0 z-20 transition-all select-none">
        
        <!-- Izquierda: Botón Menú Móvil / Toggle Collapse + Breadcrumb -->
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          
          <!-- Botón Menú Móvil (md:hidden) -->
          <button 
            @click="toggleSidebar" 
            class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
            title="Abrir menú de navegación"
            aria-label="Abrir menú"
          >
            <MenuIcon class="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>

          <!-- Botón Toggle Sidebar Desktop cuando está colapsado -->
          <button 
            v-if="isSidebarCollapsed"
            @click="toggleSidebarCollapse" 
            class="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-brand-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Expandir menú lateral"
          >
            <PanelLeftOpenIcon class="w-4.5 h-4.5" />
          </button>

          <!-- Breadcrumb Fino -->
          <div class="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold shrink-0">
            <button @click="router.push('/admin')" class="text-brand-navy dark:text-brand-cyan-light hover:underline cursor-pointer focus:outline-none" title="Ir al Panel Principal">Gestión IQ</button>
            <span class="text-slate-300 dark:text-slate-700">/</span>
          </div>

          <h1 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {{ headerConfig?.title || 'Panel de Control' }}
          </h1>
        </div>

        <!-- Derecha: Botones de Acción Dinámicos y Notificaciones -->
        <div class="flex items-center gap-1.5 sm:gap-2.5">
          
          <component 
            v-for="(button, index) in (headerConfig?.buttons || [])" 
            :key="index" 
            :is="'button'" 
            @click="button.action" 
            class="px-3 py-1.5 bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-cyan text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <component v-if="button.icon" :is="button.icon" class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">{{ button.text }}</span>
            <span class="sm:hidden text-[11px]">{{ button.text }}</span>
          </component>
          
          <!-- Botón de Notificaciones con Badge de No Leídas -->
          <div class="relative">
            <button 
              @click="toggleDropdown" 
              class="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              :class="{ 'animate-bellRing': isRinging }"
              title="Notificaciones"
              aria-label="Ver notificaciones"
            >
              <BellIcon class="w-4.5 h-4.5 text-slate-700 dark:text-slate-200 transition-transform group-hover:scale-110" />
              
              <!-- Badge Pequeño con Cantidad Exacta de No Leídas -->
              <span 
                v-if="unreadCount > 0" 
                class="absolute top-1 right-1 min-w-[15px] h-3.5 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border border-white dark:border-slate-900 shadow-2xs leading-none"
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

      <!-- Área de Trabajo Principal -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5 lg:p-6">
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
import { supabase } from '../services/supabase.js';
import Sidebar from '../components/Sidebar.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import NotificationDropdown from '../components/NotificationDropdown.vue';

// Lucide Icons
import { 
  Bell as BellIcon, 
  Menu as MenuIcon, 
  PanelLeftOpen as PanelLeftOpenIcon 
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
let notificationChannel = null;

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
    .catch(err => toast.error('No se pudo encontrar el reporte asociado.'));
};

const goToAllNotifications = () => {
  isDropdownOpen.value = false;
  router.push({ name: 'Notificaciones' });
};

const triggerBellRing = () => {
  isRinging.value = true;
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