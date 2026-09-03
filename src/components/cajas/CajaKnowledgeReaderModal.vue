<!-- src/components/cajas/CajaKnowledgeReaderModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-8 flex flex-col max-h-[90vh] animate-in fade-in-0 zoom-in-95">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
        <div class="flex items-center gap-2.5 min-w-0 pr-4">
          <div class="p-2 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan shrink-0">
            <BookOpenIcon class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-brand-navy/10 text-brand-navy dark:bg-brand-cyan/20 dark:text-brand-cyan-light">
                📁 {{ note?.categoria }}
              </span>
              <span 
                :class="importanceBadgeClass(note?.importancia)"
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase border"
              >
                {{ note?.importancia }}
              </span>
              <span 
                :class="statusBadgeClass(note?.estado)"
                class="px-2 py-0.5 rounded-md text-[10px] font-bold"
              >
                {{ note?.estado }}
              </span>
            </div>
          </div>
        </div>

        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-6 overflow-y-auto space-y-5 flex-grow custom-scrollbar">

        <!-- Title & Date -->
        <div class="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 class="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
            {{ note?.titulo }}
          </h2>
          <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span>Publicado: {{ formatDate(note?.created_at) }}</span>
            <span v-if="note?.updated_at && note?.updated_at !== note?.created_at">
              Actualizado: {{ formatDate(note?.updated_at) }}
            </span>
          </div>
        </div>

        <!-- Rendered Note Body -->
        <div 
          class="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 font-sans"
          v-html="renderedMarkdown"
        ></div>

        <!-- Tags -->
        <div v-if="note?.tags && note.tags.length > 0" class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
          <span class="text-xs font-bold text-slate-400 mr-1">Etiquetas:</span>
          <span 
            v-for="tag in note.tags" 
            :key="tag"
            class="px-2 py-0.5 text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
          >
            #{{ tag }}
          </span>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
        >
          Cerrar
        </button>

        <button 
          @click="$emit('edit', note)"
          class="px-4 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <EditIcon class="w-4 h-4" />
          <span>Editar Nota</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { BookOpen as BookOpenIcon, X as XIcon, Edit3 as EditIcon } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  note: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'edit']);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const importanceBadgeClass = (imp) => {
  switch (imp) {
    case 'Crítico':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Importante':
      return 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    default:
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }
};

const statusBadgeClass = (estado) => {
  switch (estado) {
    case 'Vigente':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold';
    case 'En revisión':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold';
    default:
      return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
};

const renderedMarkdown = computed(() => {
  if (!props.note || !props.note.contenido) return '<em>Sin contenido registrado.</em>';

  let txt = props.note.contenido
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  txt = txt.replace(/^### (.*$)/gim, '<h3 class="text-base font-black text-brand-navy dark:text-brand-cyan-light mt-4 mb-2">$1</h3>');
  txt = txt.replace(/^## (.*$)/gim, '<h2 class="text-lg font-black text-brand-navy dark:text-brand-cyan-light mt-5 mb-2">$1</h2>');

  // Bold
  txt = txt.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>');
  
  // Inline Code
  txt = txt.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-brand-cyan-light font-mono text-xs rounded border border-slate-200 dark:border-slate-700">$1</code>');

  // Lists
  txt = txt.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1">$1</li>');

  // Line breaks to paragraphs
  const paragraphs = txt.split('\n\n').map(p => {
    p = p.trim();
    if (p.startsWith('<h') || p.startsWith('<li')) return p;
    return `<p class="mb-2 leading-relaxed text-slate-700 dark:text-slate-300">${p}</p>`;
  });

  return paragraphs.join('');
});
</script>
