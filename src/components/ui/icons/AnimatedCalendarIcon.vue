<!-- src/components/ui/icons/AnimatedCalendarIcon.vue -->
<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    :class="['animate-ui-calendar-icon transition-transform duration-300', customClass]"
  >
    <!-- Marco del calendario -->
    <rect width="18" height="18" x="3" y="4" rx="2" class="calendar-frame transition-all duration-300" />
    <path d="M3 10h18" class="calendar-line transition-all duration-300" />
    <!-- Pines superiores con rebote elástico -->
    <path d="M8 2v4" class="calendar-pin-left origin-top transition-transform duration-300 ease-out" />
    <path d="M16 2v4" class="calendar-pin-right origin-top transition-transform duration-300 ease-out" />
    <!-- Días / Cuadrícula interior -->
    <circle cx="8" cy="14" r="1" class="calendar-dot-1 transition-transform duration-300" />
    <circle cx="12" cy="14" r="1" class="calendar-dot-2 transition-transform duration-300" />
    <circle cx="16" cy="14" r="1" class="calendar-dot-3 transition-transform duration-300" />
    <circle cx="8" cy="18" r="1" class="calendar-dot-4 transition-transform duration-300" />
    <circle cx="12" cy="18" r="1" class="calendar-dot-5 transition-transform duration-300" />
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
/* Micro-interacción estilo animate-ui: sacudida sutil de pines y balanceo */
:hover > .animate-ui-calendar-icon,
.group:hover .animate-ui-calendar-icon,
.animate-ui-calendar-icon:hover {
  transform: rotate(-3deg) scale(1.04);
}

:hover > .animate-ui-calendar-icon .calendar-pin-left,
.group:hover .animate-ui-calendar-icon .calendar-pin-left,
.animate-ui-calendar-icon:hover .calendar-pin-left {
  transform: translateY(-2px);
}

:hover > .animate-ui-calendar-icon .calendar-pin-right,
.group:hover .animate-ui-calendar-icon .calendar-pin-right,
.animate-ui-calendar-icon:hover .calendar-pin-right {
  transform: translateY(-2px);
  transition-delay: 50ms;
}

:hover > .animate-ui-calendar-icon circle,
.group:hover .animate-ui-calendar-icon circle,
.animate-ui-calendar-icon:hover circle {
  animation: dotPulse 0.4s ease-in-out alternate infinite;
}

@keyframes dotPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.3); }
}
</style>
