<template>
  <div 
    class="relative inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-inner select-none"
    :class="customClass"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :ref="el => setTabRef(el, tab.id)"
      type="button"
      @click="selectTab(tab.id)"
      :class="[
        'relative z-10 font-black rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5',
        sizeClasses,
        modelValue === tab.id
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
      ]"
    >
      <span v-if="tab.icon" class="text-sm shrink-0">{{ tab.icon }}</span>
      <span class="truncate">{{ tab.label }}</span>
      <span 
        v-if="tab.badge !== undefined" 
        :class="[
          'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0',
          modelValue === tab.id 
            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300' 
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        ]"
      >
        {{ tab.badge }}
      </span>
    </button>

    <!-- Pastilla de Fondo Deslizante -->
    <span
      class="absolute top-1 bottom-1 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-700/80 transition-all duration-250 ease-out pointer-events-none"
      :style="pillStyle"
    ></span>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: [String, Number],
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (s) => ['sm', 'md'].includes(s)
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const tabRefs = ref({});
const pillStyle = ref({
  left: '4px',
  width: '0px',
  opacity: 0
});

const setTabRef = (el, id) => {
  if (el) tabRefs.value[id] = el;
};

const sizeClasses = computed(() => {
  return props.size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm';
});

const updatePillPosition = () => {
  const activeEl = tabRefs.value[props.modelValue];
  if (activeEl) {
    pillStyle.value = {
      left: `${activeEl.offsetLeft}px`,
      width: `${activeEl.offsetWidth}px`,
      opacity: 1
    };
  }
};

const selectTab = (id) => {
  emit('update:modelValue', id);
  emit('change', id);
};

watch(() => props.modelValue, () => {
  nextTick(updatePillPosition);
});

onMounted(() => {
  nextTick(() => {
    updatePillPosition();
    setTimeout(updatePillPosition, 100);
  });
});
</script>
