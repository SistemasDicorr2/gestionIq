<template>
  <div
    :class="[
      'relative rounded-2xl border transition-all duration-300 overflow-hidden',
      'bg-white dark:bg-slate-900',
      glowBorderClass,
      interactive ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' : 'shadow-2xs',
      paddingClasses,
      customClass
    ]"
    v-bind="$attrs"
  >
    <!-- Resplandor sutil de fondo -->
    <div 
      class="pointer-events-none absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
      :class="glowBgClass"
    ></div>

    <!-- Header slot si existe -->
    <div v-if="$slots.header" class="mb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
      <slot name="header" />
    </div>

    <!-- Contenido principal -->
    <div class="relative z-10">
      <slot />
    </div>

    <!-- Footer slot si existe -->
    <div v-if="$slots.footer" class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  glowColor: {
    type: String,
    default: 'indigo',
    validator: (c) => ['indigo', 'emerald', 'amber', 'rose', 'slate'].includes(c)
  },
  interactive: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'md',
    validator: (p) => ['none', 'sm', 'md', 'lg'].includes(p)
  },
  customClass: {
    type: String,
    default: ''
  }
});

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none': return 'p-0';
    case 'sm': return 'p-3';
    case 'lg': return 'p-6';
    default: return 'p-4 sm:p-5';
  }
});

const glowBorderClass = computed(() => {
  switch (props.glowColor) {
    case 'emerald':
      return 'border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-emerald-500/5';
    case 'amber':
      return 'border-amber-200/80 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700 shadow-amber-500/5';
    case 'rose':
      return 'border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-700 shadow-rose-500/5';
    case 'slate':
      return 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';
    default:
      return 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-indigo-500/5';
  }
});

const glowBgClass = computed(() => {
  switch (props.glowColor) {
    case 'emerald': return 'bg-emerald-500';
    case 'amber': return 'bg-amber-500';
    case 'rose': return 'bg-rose-500';
    case 'slate': return 'bg-slate-500';
    default: return 'bg-indigo-500';
  }
});
</script>
