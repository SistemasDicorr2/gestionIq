<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-bold rounded-full border select-none transition-colors duration-150',
      sizeClasses,
      variantClasses,
      customClass
    ]"
  >
    <!-- Punto de estado con Radar Ping si está activo -->
    <span v-if="ping" class="relative flex h-2 w-2 shrink-0">
      <span 
        class="animate-radar-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        :class="dotColorClass"
      ></span>
      <span 
        class="relative inline-flex rounded-full h-2 w-2"
        :class="dotColorClass"
      ></span>
    </span>

    <!-- Punto estático si no es ping pero tiene dot -->
    <span 
      v-else-if="dot" 
      class="inline-block h-1.5 w-1.5 rounded-full shrink-0"
      :class="dotColorClass"
    ></span>

    <!-- Slot para icono o contenido principal -->
    <span class="truncate">
      <slot />
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'indigo',
    validator: (v) => ['success', 'warning', 'danger', 'indigo', 'teal', 'neutral'].includes(v)
  },
  size: {
    type: String,
    default: 'sm',
    validator: (s) => ['xs', 'sm', 'md'].includes(s)
  },
  ping: {
    type: Boolean,
    default: false
  },
  dot: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'px-2 py-0.5 text-[10px] leading-tight';
    case 'md': return 'px-3 py-1 text-xs';
    default: return 'px-2.5 py-0.5 text-[11px] leading-tight';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'warning':
      return 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'danger':
      return 'bg-rose-50 text-rose-900 dark:bg-rose-955/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'teal':
      return 'bg-teal-50 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    case 'neutral':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    default:
      return 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  }
});

const dotColorClass = computed(() => {
  switch (props.variant) {
    case 'success': return 'bg-emerald-500';
    case 'warning': return 'bg-amber-500';
    case 'danger': return 'bg-rose-500';
    case 'teal': return 'bg-teal-500';
    case 'neutral': return 'bg-slate-500';
    default: return 'bg-indigo-500';
  }
});
</script>
