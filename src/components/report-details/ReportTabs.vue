<!-- src/components/report-details/ReportTabs.vue (Pestañas Compactas Estilo Minimalist-UI / Linear) -->
<template>
  <div class="w-full">
    <!-- 1. Navegación de Pestañas Secundaria Compacta -->
    <div class="flex items-center gap-1.5 pb-2 mb-3 border-b border-slate-200/80 dark:border-slate-800 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        @click="setActiveTab(tab.name)"
        class="py-1.5 px-3.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
        :class="activeTab === tab.name ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.name }}</span>
      </button>
    </div>

    <!-- 2. Contenido de la Pestaña Activa con Espaciado Optimizado -->
    <div class="tab-content pt-0.5">
      <keep-alive>
        <component
          :is="activeComponent.component"
          v-bind="activeComponent.props"
          :report-id="reportId"
          :owner-id="ownerId"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue';

import ReportEventsAndPdfs from './ReportEventsAndPdfs.vue';
import PhotosGallery from './PhotosGallery.vue';
import LogisticaTimeline from './LogisticaTimeline.vue'; 

const props = defineProps({
  reportId: { type: [String, Number], required: true },
  ownerId: {
    type: [String, Number, Object],
    required: false,
    default: null
  },
});

const tabs = [
  { 
    name: 'Fotos Instrumentadores',
    icon: '📸',
    component: markRaw(PhotosGallery), 
    props: { 
      area: 'instrumentadores',
      title: 'Evidencia del Instrumentador',
      showUploader: false 
    } 
  },
  { 
    name: 'Logística Interna', 
    icon: '🚚',
    component: markRaw(LogisticaTimeline), 
    props: {}
  },
  { 
    name: 'Eventos & PDFs', 
    icon: '📄',
    component: markRaw(ReportEventsAndPdfs), 
    props: {}
  },
];

const activeTab = ref(tabs[0].name);

const setActiveTab = (tabName) => {
  activeTab.value = tabName;
};

const activeComponent = computed(() => {
  return tabs.find(tab => tab.name === activeTab.value);
});
</script>