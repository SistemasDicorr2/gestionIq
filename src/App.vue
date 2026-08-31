<!-- src/App.vue -->
<template>
  <router-view />
  <Toaster 
    position="top-right" 
    :expand="false"
    :visible-toasts="4"
    :toast-options="{
      classes: {
        toast: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-sans text-xs font-semibold rounded-xl shadow-lg p-3.5 flex items-center gap-2.5 select-none',
        title: 'text-xs font-bold text-slate-900 dark:text-white',
        description: 'text-xs text-slate-500 dark:text-slate-400 font-normal',
      }
    }"
  />
</template>

<script setup>
import { Toaster } from 'vue-sonner';
</script>