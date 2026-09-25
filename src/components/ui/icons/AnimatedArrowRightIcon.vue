<!-- src/components/ui/icons/AnimatedArrowRightIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['animate-ui-arrow-icon transition-transform duration-300', customClass]"
  >
    <path d="M5 12h14" class="arrow-stem origin-left transition-transform duration-300" />
    <path d="m12 5 7 7-7 7" class="arrow-head transition-transform duration-300" />
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
:hover > .animate-ui-arrow-icon,
.group:hover .animate-ui-arrow-icon,
.animate-ui-arrow-icon:hover {
  transform: translateX(3px);
}

:hover > .animate-ui-arrow-icon .arrow-head,
.group:hover .animate-ui-arrow-icon .arrow-head,
.animate-ui-arrow-icon:hover .arrow-head {
  transform: translateX(1.5px);
}
</style>
