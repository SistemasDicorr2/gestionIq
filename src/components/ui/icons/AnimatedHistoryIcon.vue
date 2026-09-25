<!-- src/components/ui/icons/AnimatedHistoryIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['animate-ui-history-icon transition-transform duration-300', customClass]"
  >
    <!-- Círculo exterior con flecha de retorno -->
    <path 
      d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" 
      class="history-arrow origin-center transition-transform duration-500 ease-out"
    />
    <path d="M3 3v5h5" class="history-tip transition-transform duration-300 ease-out" />
    <!-- Manecillas de reloj animadas -->
    <path d="M12 7v5l4 2" class="history-hands origin-[12px_12px] transition-transform duration-500 ease-out" />
  </svg>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: 'w-5 h-5'
  }
});
</script>

<style scoped>
/* Micro-interacción estilo animate-ui: rotación de manecilla y contragiro sutil */
:hover > .animate-ui-history-icon,
.group:hover .animate-ui-history-icon,
.animate-ui-history-icon:hover {
  transform: rotate(-12deg);
}

:hover > .animate-ui-history-icon .history-hands,
.group:hover .animate-ui-history-icon .history-hands,
.animate-ui-history-icon:hover .history-hands {
  transform: rotate(-90deg);
}

:hover > .animate-ui-history-icon .history-arrow,
.group:hover .animate-ui-history-icon .history-arrow,
.animate-ui-history-icon:hover .history-arrow {
  stroke-dasharray: 60;
  animation: historyDraw 0.6s ease-out forwards;
}

@keyframes historyDraw {
  0% { stroke-dashoffset: 20; transform: rotate(0deg); }
  50% { transform: rotate(-30deg); }
  100% { stroke-dashoffset: 0; transform: rotate(0deg); }
}
</style>
