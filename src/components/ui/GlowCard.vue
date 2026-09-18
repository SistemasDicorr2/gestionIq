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
    default: 'indigo'
  },
  interactive: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'md'
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
  if (props.glowColor.includes('emerald') || props.glowColor.includes('16, 185, 129') || props.glowColor.includes('10, 207')) {
    return 'hover:border-emerald-400 dark:hover:border-emerald-700 shadow-emerald-500/5';
  }
  if (props.glowColor.includes('amber') || props.glowColor.includes('245, 158, 11') || props.glowColor.includes('217, 119, 6')) {
    return 'hover:border-amber-400 dark:hover:border-amber-700 shadow-amber-500/5';
  }
  if (props.glowColor.includes('rose') || props.glowColor.includes('244, 63, 94') || props.glowColor.includes('225, 29, 72')) {
    return 'hover:border-rose-400 dark:hover:border-rose-700 shadow-rose-500/5';
  }
  if (props.glowColor.includes('cyan') || props.glowColor.includes('6, 182, 212')) {
    return 'hover:border-cyan-400 dark:hover:border-cyan-700 shadow-cyan-500/5';
  }
  if (props.glowColor.includes('blue') || props.glowColor.includes('37, 99, 235') || props.glowColor.includes('59, 130, 246')) {
    return 'hover:border-blue-400 dark:hover:border-blue-700 shadow-blue-500/5';
  }
  if (props.glowColor === 'slate') {
    return 'hover:border-slate-300 dark:hover:border-slate-700';
  }
  return 'hover:border-indigo-300 dark:hover:border-indigo-800 shadow-indigo-500/5';
});

const glowBgClass = computed(() => {
  if (props.glowColor.includes('emerald') || props.glowColor.includes('16, 185, 129')) return 'bg-emerald-500';
  if (props.glowColor.includes('amber') || props.glowColor.includes('245, 158, 11')) return 'bg-amber-500';
  if (props.glowColor.includes('rose') || props.glowColor.includes('244, 63, 94')) return 'bg-rose-500';
  if (props.glowColor.includes('cyan') || props.glowColor.includes('6, 182, 212')) return 'bg-cyan-500';
  if (props.glowColor.includes('blue') || props.glowColor.includes('37, 99, 235')) return 'bg-blue-500';
  if (props.glowColor === 'slate') return 'bg-slate-500';
  return 'bg-indigo-500';
});
</script>
