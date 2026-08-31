<!-- src/App.vue -->
<template>
  <router-view />
  <Toaster 
    position="top-right" 
    :expand="true"
    :visible-toasts="6"
    :close-button="true"
  />
</template>

<script setup>
import { Toaster } from 'vue-sonner';
</script>