<!-- src/views/admin/CajasKnowledgeView.vue -->
<template>
  <div class="max-w-6xl mx-auto space-y-5 text-slate-800 dark:text-slate-100 font-sans pb-16 px-3 sm:px-0">
    
    <!-- Top Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan">
            <BoxIcon class="w-5 h-5" />
          </div>
          <h2 class="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Cajas & Instructivos
          </h2>
          <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
            V1
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Codificación de cajas, sets e instrumental, guía de nomenclatura de 11 dígitos e instructivos operativos.
        </p>
      </div>

      <!-- Selector de Pestañas Principales -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-auto shrink-0">
        <button 
          @click="activeTab = 'codificacion'"
          :class="activeTab === 'codificacion' 
            ? 'bg-brand-navy text-white dark:bg-brand-cyan dark:text-white shadow-xs font-black' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'"
          class="px-4 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <BoxIcon class="w-4 h-4" />
          <span>Codificación</span>
        </button>

        <button 
          @click="activeTab = 'knowledge'"
          :class="activeTab === 'knowledge' 
            ? 'bg-brand-navy text-white dark:bg-brand-cyan dark:text-white shadow-xs font-black' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'"
          class="px-4 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <BookMarkedIcon class="w-4 h-4" />
          <span>Instructivos</span>
        </button>
      </div>
    </div>

    <!-- Contenido de las Pestañas -->
    <keep-alive>
      <CajasCodificacionTab v-if="activeTab === 'codificacion'" key="codificacion" />
      <CajasKnowledgeTab v-else-if="activeTab === 'knowledge'" key="knowledge" />
    </keep-alive>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import CajasCodificacionTab from '../../components/cajas/CajasCodificacionTab.vue';
import CajasKnowledgeTab from '../../components/cajas/CajasKnowledgeTab.vue';
import { Box as BoxIcon, BookMarked as BookMarkedIcon } from 'lucide-vue-next';

const activeTab = ref('codificacion');
</script>
