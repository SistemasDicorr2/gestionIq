<!-- src/components/ui/icons/AnimatedEyeIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['animate-ui-eye-icon transition-transform duration-300', customClass]"
  >
    <!-- Contorno del ojo -->
    <path 
      d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" 
      class="eye-outline transition-transform duration-300"
    />
    <!-- Pupila animada que mira -->
    <circle cx="12" cy="12" r="3" class="eye-pupil transition-transform duration-300 ease-out" />
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
/* Micro-interacción estilo animate-ui: la pupila parpadea y mira a la derecha */
:hover > .animate-ui-eye-icon .eye-pupil,
.group:hover .animate-ui-eye-icon .eye-pupil,
.animate-ui-eye-icon:hover .eye-pupil {
  transform: translateX(2px) scale(1.1);
  animation: eyeLook 0.6s ease-in-out forwards;
}

:hover > .animate-ui-eye-icon .eye-outline,
.group:hover .animate-ui-eye-icon .eye-outline,
.animate-ui-eye-icon:hover .eye-outline {
  animation: eyeBlink 0.3s ease-in-out;
}

@keyframes eyeBlink {
  0% { transform: scaleY(1); }
  50% { transform: scaleY(0.2); }
  100% { transform: scaleY(1); }
}

@keyframes eyeLook {
  0% { transform: translateX(0); }
  40% { transform: translateX(2px) translateY(-1px); }
  100% { transform: translateX(1.5px); }
}
</style>
