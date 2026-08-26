<!-- src/layouts/LogisticaLayout.vue -->
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
    <!-- Header Móvil / Desktop -->
    <header class="sticky top-0 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-xs">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo & Titulo del módulo + Botón Volver a Gestión IQ -->
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            IQ
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Gestión IQ
            </h1>
            <p class="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              Informe Diario de Logística
            </p>
          </div>

          <!-- BOTÓN VOLVER A GESTIÓN IQ -->
          <button 
            type="button" 
            @click="handleReturnToGestionIQ"
            class="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs active:scale-95"
            title="Regresar al panel de Gestión IQ (requiere permiso/sesión)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span class="hidden sm:inline">Volver a Gestión IQ</span>
            <span class="sm:hidden">Volver</span>
          </button>
        </div>

        <!-- Usuario & Acciones -->
        <div class="flex items-center gap-2">
          <!-- Identificación Usuario -->
          <div class="hidden sm:flex flex-col text-right">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
              {{ userName }}
            </span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">
              Logística
            </span>
          </div>

          <!-- Botón Cerrar Sesión -->
          <button 
            @click="handleLogout" 
            :disabled="isLoggingOut"
            class="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors focus:outline-none cursor-pointer"
            title="Cerrar sesión"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Subnavegación Superior (Desktop/Tablet) -->
    <div class="hidden md:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div class="max-w-4xl mx-auto px-4 flex items-center justify-between">
        <!-- Pestañas Principales (Izquierda) -->
        <div class="flex gap-6">
          <router-link 
            v-for="item in mainNavItems" 
            :key="item.to.name"
            :to="item.to"
            class="py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2"
            :class="[
              $route.name === item.to.name 
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>

        <!-- Botón Discreto Guía de Envío (Lateral Derecho) -->
        <router-link 
          :to="{ name: 'LogisticaGuiaEnvio' }"
          class="my-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer"
          :class="[
            $route.name === 'LogisticaGuiaEnvio'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600'
          ]"
        >
          <DocumentIcon class="w-4 h-4" />
          <span>Guía Envío</span>
        </router-link>
      </div>
    </div>

    <!-- Contenido Principal -->
    <main class="flex-1 max-w-4xl w-full mx-auto p-4 pb-24 md:pb-8">
      <router-view />
    </main>

    <!-- Barra de Navegación Inferior (Móvil) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 px-6 py-2 shadow-lg">
      <div class="max-w-md mx-auto flex items-center justify-around">
        <router-link 
          v-for="item in mobileNavItems" 
          :key="item.to.name"
          :to="item.to"
          class="flex flex-col items-center gap-1 min-w-[56px] py-1 text-[11px] font-medium transition-colors"
          :class="[
            $route.name === item.to.name 
              ? 'text-blue-600 dark:text-blue-400 font-bold' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();
const userName = ref('Usuario Logística');
const isLoggingOut = ref(false);

const HomeIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }) ]) };
const PlusIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4v16m8-8H4' }) ]) };
const DocumentIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }) ]) };
const HistoryIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }) ]) };
const ScalesIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 6l9-4 9 4M3 6v14l9 4 9-4V6M3 6l9 4 9-4' }) ]) };

// Pestañas Principales (Izquierda)
const mainNavItems = [
  { label: 'Inicio', to: { name: 'LogisticaInformes' }, icon: HomeIcon },
  { label: 'Nuevo', to: { name: 'LogisticaNuevoInforme' }, icon: PlusIcon },
  { label: 'Historial', to: { name: 'LogisticaHistorial' }, icon: HistoryIcon },
  { label: 'Conciliación Fletes', to: { name: 'LogisticaConciliacionFletes' }, icon: ScalesIcon }
];

// Pestañas completas en Móvil
const mobileNavItems = [
  { label: 'Inicio', to: { name: 'LogisticaInformes' }, icon: HomeIcon },
  { label: 'Nuevo', to: { name: 'LogisticaNuevoInforme' }, icon: PlusIcon },
  { label: 'Conciliación', to: { name: 'LogisticaConciliacionFletes' }, icon: ScalesIcon },
  { label: 'Guía Envío', to: { name: 'LogisticaGuiaEnvio' }, icon: DocumentIcon },
  { label: 'Historial', to: { name: 'LogisticaHistorial' }, icon: HistoryIcon }
];

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    userName.value = session.user.user_metadata?.nombre_completo 
      || session.user.user_metadata?.nombre 
      || session.user.email?.split('@')[0] 
      || 'Usuario Logística';
  }
});

const handleReturnToGestionIQ = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/login');
      return;
    }
    router.push('/admin');
  } catch (err) {
    router.push('/login');
  }
};

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  try {
    isLoggingOut.value = true;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await router.replace('/login');
  } catch (err) {
    toast.error('Error al cerrar sesión: ' + err.message);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

