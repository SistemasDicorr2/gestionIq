<!-- src/components/ui/icons/AnimatedBoxIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['animate-ui-box-icon transition-transform duration-300', customClass]"
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" class="box-mesh transition-transform duration-300" />
    <path d="m3.3 7 8.7 5 8.7-5" class="box-cross-1 transition-transform duration-300" />
    <path d="M12 22V12" class="box-cross-2 transition-transform duration-300" />
  </svg>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: 'w-4 h-4'
  }
});
</script>

<style scoped>
:hover > .animate-ui-box-icon,
.group:hover .animate-ui-box-icon,
.animate-ui-box-icon:hover {
  transform: scale(1.08) rotate(3deg);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
