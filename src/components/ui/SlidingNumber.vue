<template>
  <span class="inline-flex items-baseline font-mono font-black tabular-nums tracking-tight select-none" :class="customClass">
    <span v-if="prefix" class="mr-0.5 opacity-80">{{ prefix }}</span>
    
    <span class="inline-flex items-center overflow-hidden h-[1.15em] leading-[1.15em]">
      <template v-for="(char, idx) in formattedCharacters" :key="`digit-${idx}`">
        <!-- Si es un dígito 0-9: rueda animada -->
        <span 
          v-if="isDigit(char)" 
          class="relative inline-block w-[0.62em] h-[1.15em] overflow-hidden"
        >
          <span 
            class="absolute left-0 top-0 flex flex-col transition-transform ease-out will-change-transform"
            :style="{
              transform: `translateY(-${Number(char) * 10}%)`,
              transitionDuration: `${duration}ms`
            }"
          >
            <span v-for="n in 10" :key="n" class="h-[1.15em] leading-[1.15em] flex items-center justify-center text-center">
              {{ n - 1 }}
            </span>
          </span>
        </span>

        <!-- Si es un carácter fijo (punto, coma, guión) -->
        <span v-else class="inline-block px-[0.05em] h-[1.15em] leading-[1.15em]">
          {{ char }}
        </span>
      </template>
    </span>

    <span v-if="suffix" class="ml-0.5 opacity-80 text-[0.85em]">{{ suffix }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
    default: 0
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  decimalPlaces: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 650
  },
  customClass: {
    type: String,
    default: ''
  }
});

const isDigit = (c) => /^\d$/.test(c);

const formattedCharacters = computed(() => {
  const num = Number(props.value) || 0;
  
  let formattedStr = '';
  if (props.decimalPlaces > 0) {
    formattedStr = num.toLocaleString('es-AR', {
      minimumFractionDigits: props.decimalPlaces,
      maximumFractionDigits: props.decimalPlaces
    });
  } else {
    formattedStr = num.toLocaleString('es-AR');
  }

  return formattedStr.split('');
});
</script>
