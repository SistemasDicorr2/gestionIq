<!-- src/components/ui/icons/AnimatedPackageIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['animate-ui-package-icon transition-transform duration-300', customClass]"
  >
    <!-- Base de la caja -->
    <path d="m16.5 9.4 4.5-2.8L12 2 3 6.6l4.5 2.8" class="package-top origin-top transition-transform duration-300 ease-out" />
    <path d="M3 7.6v9.8L12 22V12" class="package-left transition-transform duration-300 ease-out" />
    <path d="M12 22l9-4.6V7.6" class="package-right transition-transform duration-300 ease-out" />
    <path d="M12 12l4.5-2.6" class="package-center transition-transform duration-300 ease-out" />
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
/* Micro-interacción estilo animate-ui: caja que se eleva y abre sutilmente la tapa */
:hover > .animate-ui-package-icon,
.group:hover .animate-ui-package-icon,
.animate-ui-package-icon:hover {
  transform: translateY(-2px) scale(1.05);
}

:hover > .animate-ui-package-icon .package-top,
.group:hover .animate-ui-package-icon .package-top,
.animate-ui-package-icon:hover .package-top {
  transform: translateY(-2px);
  animation: packageBounce 0.5s ease-in-out;
}

@keyframes packageBounce {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(-1px); }
}
</style>
