<!-- src/components/Sidebar.vue -->
<template>
  <!-- Overlay para móvil -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs md:hidden" 
    @click="$emit('toggle-sidebar')" 
  />

  <TooltipProvider :delay-duration="150">
    <aside 
      ref="sideRef" 
      :class="[
        'bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 shadow-xs select-none',
        isCollapsed ? 'w-16' : 'w-[228px]',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]" 
      role="navigation" 
      aria-label="Menú principal"
    >
      <!-- Cabecera del Sidebar -->
      <div class="h-10 px-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 overflow-hidden">
        <div 
          class="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity min-w-0" 
          @click="go('/admin')" 
          title="Ir al Home de Gestión IQ"
        >
          <div class="h-6.5 w-6.5 shrink-0 rounded-lg bg-brand-navy dark:bg-brand-cyan text-white font-black flex items-center justify-center text-[10px] shadow-2xs tracking-wider">
            IQ
          </div>
          <div v-if="!isCollapsed" class="min-w-0 transition-all duration-200">
            <h1 class="text-xs font-black tracking-tight text-brand-navy dark:text-white leading-none">Gestión IQ</h1>
          </div>
        </div>

        <!-- Botón alternar colapso en Desktop -->
        <button 
          v-if="!isCollapsed"
          @click="$emit('toggle-collapse')" 
          class="hidden md:flex p-1 rounded-md text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Colapsar menú lateral"
        >
          <PanelLeftCloseIcon class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Navegación Principal -->
      <nav class="flex-grow p-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div v-for="item in visibleItems" :key="item.label">
          <!-- Enlace simple sin hijos -->
          <template v-if="!item.children">
            <!-- Modo Colapsado con Tooltip -->
            <TooltipRoot v-if="isCollapsed">
              <TooltipTrigger as-child>
                <button 
                  @click="handleNavigation(item)" 
                  class="nav-link-item justify-center px-2"
                  :aria-current="isActive(item) ? 'page' : undefined"
                >
                  <component :is="item.icon" class="w-5 h-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent 
                  side="right" 
                  :side-offset="10" 
                  class="z-50 px-2.5 py-1.5 text-xs font-bold bg-brand-navy text-white dark:bg-slate-800 dark:text-white rounded-lg shadow-md border border-slate-700/50 animate-in fade-in-0 zoom-in-95"
                >
                  {{ item.label }}
                </TooltipContent>
              </TooltipPortal>
            </TooltipRoot>

            <!-- Modo Expandido -->
            <button 
              v-else 
              @click="handleNavigation(item)" 
              class="nav-link-item"
              :aria-current="isActive(item) ? 'page' : undefined"
            >
              <component :is="item.icon" class="w-4.5 h-4.5 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-brand-navy dark:group-hover:text-white" />
              <span class="truncate text-xs">{{ item.label }}</span>
              <span 
                v-if="item.badge" 
                class="ml-auto text-[9px] font-extrabold rounded-full px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan dark:bg-brand-cyan/20 dark:text-brand-cyan-light border border-brand-cyan/20"
              >
                {{ item.badge }}
              </span>
            </button>
          </template>

          <!-- Enlace con Submenú (Collapsible) -->
          <template v-else>
            <!-- Modo Colapsado con Tooltip que abre la primera opción -->
            <TooltipRoot v-if="isCollapsed">
              <TooltipTrigger as-child>
                <button 
                  @click="handleNavigation(item.children[0])" 
                  class="nav-link-item justify-center px-2"
                  :aria-current="isActive(item) ? 'page' : undefined"
                >
                  <component :is="item.icon" class="w-5 h-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent 
                  side="right" 
                  :side-offset="10" 
                  class="z-50 px-2.5 py-1.5 text-xs font-bold bg-brand-navy text-white dark:bg-slate-800 dark:text-white rounded-lg shadow-md border border-slate-700/50"
                >
                  {{ item.label }}
                </TooltipContent>
              </TooltipPortal>
            </TooltipRoot>

            <!-- Modo Expandido con Acordeón -->
            <CollapsibleRoot 
              v-else 
              :open="isSubmenuOpen(item.label)" 
              @update:open="toggleSubmenu(item.label)"
            >
              <CollapsibleTrigger class="nav-link-item w-full" :aria-current="isActive(item) ? 'page' : undefined">
                <component :is="item.icon" class="w-4.5 h-4.5 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-brand-navy dark:group-hover:text-white" />
                <span class="truncate text-xs">{{ item.label }}</span>
                <ChevronDownIcon 
                  class="ml-auto w-3.5 h-3.5 text-slate-400 transition-transform duration-200" 
                  :class="{ 'rotate-180': isSubmenuOpen(item.label) }" 
                />
              </CollapsibleTrigger>

              <CollapsibleContent class="pl-7 mt-0.5 space-y-0.5 overflow-hidden transition-all">
                <button 
                  v-for="child in item.children" 
                  :key="child.label" 
                  @click="handleNavigation(child)" 
                  class="nav-sublink-item"
                  :aria-current="isActive(child) ? 'page' : undefined"
                >
                  <span class="truncate text-[11px]">{{ child.label }}</span>
                </button>
              </CollapsibleContent>
            </CollapsibleRoot>
          </template>
        </div>
      </nav>

      <!-- Pie del Sidebar -->
      <div class="p-2 border-t border-slate-200/80 dark:border-slate-800 shrink-0 space-y-1">
        <!-- Expandir al hacer click en el footer si está colapsado -->
        <button 
          v-if="isCollapsed" 
          @click="$emit('toggle-collapse')" 
          class="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Expandir menú lateral"
        >
          <PanelLeftOpenIcon class="w-5 h-5" />
        </button>

        <button 
          v-else
          @click="handleLogout" 
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
        >
          <LogOutIcon class="w-4 h-4 shrink-0" />
          <span class="truncate">{{ loggingOut ? 'Cerrando…' : 'Cerrar sesión' }}</span>
        </button>
      </div>
    </aside>
  </TooltipProvider>

  <!-- Modal de Autorización -->
  <AuthorizationModal
    :show="isAuthorizationModalVisible"
    @authorized="onAuthorized"
    @cancelled="onCancelled"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';
import { useAuthorization } from '../composables/useAuthorization';
import AuthorizationModal from './admin/AuthorizationModal.vue';

// Reka UI Primitives
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent
} from 'reka-ui';

// Lucide Icons
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Users,
  AlertTriangle,
  Stethoscope,
  MessageSquare,
  Gift,
  Truck,
  CalendarCheck,
  ClipboardCheck,
  DollarSign,
  Zap,
  ShieldCheck,
  History,
  UploadCloud,
  FileSpreadsheet,
  MoreHorizontal,
  LogOut as LogOutIcon,
  ChevronDown as ChevronDownIcon,
  PanelLeftClose as PanelLeftCloseIcon,
  PanelLeftOpen as PanelLeftOpenIcon
} from 'lucide-vue-next';

const props = defineProps({ 
  isOpen: Boolean, 
  isCollapsed: { type: Boolean, default: false },
  userRole: { type: String, default: 'admin' } 
});

const emit = defineEmits(['toggle-sidebar', 'toggle-collapse']);

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { isAuthorizationModalVisible, requestAuthorization, onAuthorized, onCancelled } = useAuthorization();

const openSubmenus = ref([]);
const isSubmenuOpen = (label) => openSubmenus.value.includes(label);
const toggleSubmenu = (label) => {
  if (isSubmenuOpen(label)) {
    openSubmenus.value = openSubmenus.value.filter(item => item !== label);
  } else {
    openSubmenus.value.push(label);
  }
};

const sideRef = ref(null);
const onKey = (e) => { if (e.key === 'Escape' && props.isOpen) emit('toggle-sidebar'); };
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));

// --- ESTRUCTURA DE NAVEGACIÓN CON ICONOS LUCIDE ---
const items = computed(() => ([
  { label: 'Resumen Operativo', to: { name: 'ResumenOperativo' }, badge: 'Nuevo', icon: LayoutDashboard, roles: ['admin','coord'] },
  { label: 'Panel de Cirugías', to: { name: 'Admin' }, icon: ClipboardList, roles: ['admin','coord','user'] },
  { label: 'Estadísticas', to: { name: 'Estadisticas' }, badge: 'Nuevo', icon: BarChart3, roles: ['admin','coord'] },
  { label: 'Instrumentadores', to: { name: 'Instrumentadores' }, icon: Users, roles: ['admin','coord','user'] },
  {
    label: 'Logística',
    icon: Truck,
    roles: ['admin', 'coord'],
    children: [
      { 
        label: 'Informe Diario Logística', 
        to: { name: 'LogisticaHistorial' },
        icon: CalendarCheck
      },
      { 
        label: 'Control de Consumo', 
        to: { name: 'ControlConsumo' },
        icon: ClipboardCheck
      },
    ]
  },
  {
    label: 'Administración',
    icon: DollarSign,
    roles: ['admin'],
    requiresAuth: true,
    children: [
      { 
        label: 'Estación de Pagos', 
        to: { name: 'PagosDashboard' },
        icon: Zap
      },
      { 
        label: 'Conciliación Transferencias', 
        to: { name: 'ConciliacionTransferencias' },
        icon: ShieldCheck
      },
      { 
        label: 'Auditoría y Correcciones', 
        to: { name: 'HistorialPagos' },
        icon: History
      },
    ]
  },
  {
    label: 'Otras Opciones',
    icon: MoreHorizontal,
    roles: ['admin', 'coord'],
    children: [
      { label: 'Incidencias', to: { name: 'Incidencias' }, icon: AlertTriangle },
      { label: 'Gestión de Reclamos', to: { name: 'Quejas' }, icon: MessageSquare },
      { label: 'Pedidos Especiales', to: { name: 'PedidosEspeciales' }, icon: Gift },
      { label: 'Control Devolución', to: { name: 'LogisticaControl' }, icon: FileSpreadsheet },
    ]
  }
]));

const visibleItems = computed(() => items.value.filter(i => i.roles.includes(props.userRole)));

const isActive = (item) => {
  const currentRouteName = route.name;
  if (item.to && item.to.name === currentRouteName) return true;
  if (item.children) {
    return item.children.some(child => child.to && child.to.name === currentRouteName);
  }
  return false;
};

let pendingNavigation = null;

const handleNavigation = async (item) => {
  if (item.action) {
    item.action();
    return;
  }

  const requiresAuth = item.requiresAuth || items.value.find(parent => parent.children?.includes(item))?.requiresAuth;

  if (requiresAuth) {
    pendingNavigation = item.to;
    const authorized = await requestAuthorization();
    
    if (authorized) {
      go(pendingNavigation);
      pendingNavigation = null;
    }
  } else {
    go(item.to);
  }
};

const go = (to) => { 
  if (!to) return;
  router.push(to); 
  if (props.isOpen) {
    emit('toggle-sidebar'); 
  }
};

const loggingOut = ref(false);
const handleLogout = async () => {
  if (loggingOut.value) return;
  loggingOut.value = true;
  const { error } = await supabase.auth.signOut();
  if (error) { toast.error('Error al cerrar sesión: ' + error.message); loggingOut.value = false; }
  else { await router.replace('/login'); }
};
</script>

<style scoped>
.nav-link-item {
  @apply w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all cursor-pointer select-none;
}

.nav-link-item[aria-current="page"] {
  @apply bg-brand-navy text-white dark:bg-brand-cyan dark:text-white font-bold shadow-sm;
}

.nav-sublink-item {
  @apply w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left;
}

.nav-sublink-item[aria-current="page"] {
  @apply text-brand-navy dark:text-brand-cyan-light font-bold bg-brand-navy/5 dark:bg-brand-cyan/15;
}
</style>