
<!-- src/layouts/AdminLayout.vue (Con Botón de Menú Hamburguesa Móvil y Layout Responsive) -->
<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
    
    <!-- Sidebar con Control de Visibilidad en Móvil -->
    <Sidebar :is-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <!-- Navbar / Header Principal Adaptable (Mobile-First + 19" Desktop) -->
      <header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 z-20 transition-all">
        
        <!-- Izquierda: Botón Menú Móvil + Breadcrumb e Identificador de Vista -->
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          
          <!-- Botón de Menú Hamburguesa para Móvil (md:hidden) -->
          <button 
            @click="toggleSidebar" 
            class="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none transition-all active:scale-90 cursor-pointer flex items-center justify-center shrink-0"
            title="Abrir menú de navegación"
            aria-label="Abrir menú"
          >
            <Bars3Icon class="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>

          <div class="hidden md:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold">
            <span class="text-blue-600 dark:text-blue-400">Gestión IQ</span>
            <span class="text-slate-300 dark:text-slate-700">/</span>
          </div>

          <h1 class="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
            {{ headerConfig?.title || 'Panel de Control' }}
          </h1>
        </div>

        <!-- Derecha: Botones de Acción Dinámicos y Notificaciones -->
        <div class="flex items-center gap-1.5 sm:gap-3">
          
          <component 
            v-for="(button, index) in (headerConfig?.buttons || [])" 
            :key="index" 
            :is="'button'" 
            @click="button.action" 
            class="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <component v-if="button.icon" :is="button.icon" class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">{{ button.text }}</span>
            <span class="sm:hidden text-[11px]">{{ button.text }}</span>
          </component>
          
          <!-- Botón de Notificaciones con Balanceo y Badge -->
          <div class="relative" ref="notificationMenuRef">
            <button 
              @click="toggleDropdown" 
              class="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-all active:scale-90 cursor-pointer"
              :class="{ 'animate-bellRing': isRinging }"
              title="Notificaciones"
            >
              <BellIcon class="h-5 w-5 text-slate-700 dark:text-slate-200 transition-transform group-hover:scale-110" />
              
              <!-- Badge Pulsante para No Leídas -->
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 text-white font-extrabold text-[9px] items-center justify-center border-2 border-white dark:border-slate-900 shadow-2xs">
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </span>
            </button>
            
            <NotificationDropdown
              :show="isDropdownOpen"
              :notifications="notifications"
              @notification-click="handleNotificationClick"
              @mark-all-read="handleMarkAllRead"
              @view-all="goToAllNotifications"
            />
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 lg:p-8">
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
import { onClickOutside } from '@vueuse/core';
import Sidebar from '../components/Sidebar.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import NotificationDropdown from '../components/NotificationDropdown.vue';
import { BellIcon, Bars3Icon } from '@heroicons/vue/24/outline';

const router = useRouter();
const toast = useToast();
const isRinging = ref(false);

const isSidebarOpen = ref(false);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
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

onClickOutside(notificationMenuRef, () => { isDropdownOpen.value = false; });

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