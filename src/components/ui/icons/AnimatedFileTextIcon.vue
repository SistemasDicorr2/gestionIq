<!-- src/components/ui/icons/AnimatedFileTextIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['animate-ui-filetext-icon transition-transform duration-300', customClass]"
  >
    <!-- Contorno de la hoja con esquina doblada -->
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" class="file-outline transition-all duration-300" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" class="file-corner transition-all duration-300" />
    <!-- Líneas de texto que se deslizan/escriben -->
    <path d="M10 9H8" class="file-line-1 transition-all duration-300" />
    <path d="M16 13H8" class="file-line-2 transition-all duration-300" />
    <path d="M16 17H8" class="file-line-3 transition-all duration-300" />
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
/* Micro-interacción estilo animate-ui: líneas de texto que se animan secuencialmente */
:hover > .animate-ui-filetext-icon,
.group:hover .animate-ui-filetext-icon,
.animate-ui-filetext-icon:hover {
  transform: translateY(-2px);
}

:hover > .animate-ui-filetext-icon .file-corner,
.group:hover .animate-ui-filetext-icon .file-corner,
.animate-ui-filetext-icon:hover .file-corner {
  transform: translate(-1px, 1px);
}

:hover > .animate-ui-filetext-icon .file-line-1,
.group:hover .animate-ui-filetext-icon .file-line-1,
.animate-ui-filetext-icon:hover .file-line-1 {
  animation: lineDraw 0.4s ease-out forwards;
}

:hover > .animate-ui-filetext-icon .file-line-2,
.group:hover .animate-ui-filetext-icon .file-line-2,
.animate-ui-filetext-icon:hover .file-line-2 {
  animation: lineDraw 0.4s ease-out 0.1s forwards;
}

:hover > .animate-ui-filetext-icon .file-line-3,
.group:hover .animate-ui-filetext-icon .file-line-3,
.animate-ui-filetext-icon:hover .file-line-3 {
  animation: lineDraw 0.4s ease-out 0.2s forwards;
}

@keyframes lineDraw {
  0% { transform: scaleX(0.4); opacity: 0.5; }
  100% { transform: scaleX(1); opacity: 1; }
}
</style>
