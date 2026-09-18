<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'relative inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-200 cursor-pointer overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
      sizeClasses,
      variantClasses,
      customClass
    ]"
    v-bind="$attrs"
  >
    <!-- Efecto de Haz de Luz Shimmer en el fondo/borde si está activo -->
    <span 
      v-if="shimmer && !disabled && !loading" 
      class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none"
    ></span>

    <!-- Spinner de carga -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-2 h-4 w-4 shrink-0" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <!-- Icono Izquierdo -->
    <span v-if="$slots.iconLeft && !loading" class="mr-1.5 shrink-0 flex items-center">
      <slot name="iconLeft" />
    </span>

    <!-- Texto / Contenido Principal -->
    <span class="relative z-10 flex items-center gap-1.5 truncate">
      <slot />
    </span>

    <!-- Icono Derecho -->
    <span v-if="$slots.iconRight" class="ml-1.5 shrink-0 flex items-center">
      <slot name="iconRight" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'emerald', 'amber', 'rose', 'glass', 'subtle', 'outline'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (s) => ['xs', 'sm', 'md', 'lg'].includes(s)
  },
  shimmer: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  customClass: {
    type: String,
    default: ''
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'px-2 py-1 text-[11px]';
    case 'sm': return 'px-3 py-1.5 text-xs';
    case 'lg': return 'px-6 py-3 text-sm';
    default: return 'px-4 py-2 text-xs sm:text-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'emerald':
      return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus-visible:ring-emerald-500';
    case 'amber':
      return 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 focus-visible:ring-amber-500';
    case 'rose':
      return 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 focus-visible:ring-rose-500';
    case 'glass':
      return 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-2xs focus-visible:ring-indigo-500';
    case 'subtle':
      return 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 focus-visible:ring-slate-500';
    case 'outline':
      return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 focus-visible:ring-slate-500';
    default:
      return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 focus-visible:ring-indigo-500';
  }
});
</script>
