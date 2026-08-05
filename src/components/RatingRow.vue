<!-- src/components/RatingRow.vue (Tipografía Compacta Refinada) -->
<template>
  <div class="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-200/50 last:border-b-0 dark:border-slate-700/50 items-center">
    <dt class="font-semibold text-slate-600 dark:text-slate-300 text-xs">{{ label }}</dt>
    <dd class="flex items-center" :class="{ 'font-bold': isBold }">
      <span v-if="rating" class="flex items-center">
        <span v-for="i in 5" :key="i" class="text-sm leading-none" :class="i <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'">★</span>
        <span class="ml-1.5 text-slate-700 dark:text-slate-200 text-[11px] font-bold">({{ rating }}/5)</span>
      </span>
      <span v-else class="text-slate-400 dark:text-slate-500 text-xs italic">N/A</span>
    </dd>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  rating: Number,
  isBold: Boolean
});
</script>