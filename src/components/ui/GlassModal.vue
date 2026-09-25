<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isVisible" 
        class="fixed inset-0 z-50 bg-slate-950/75 dark:bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain"
        @click="handleBackdropClick"
        @keydown.esc="handleEsc"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="isVisible"
            @click.stop
            :class="[
              'relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xl flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] overflow-hidden',
              maxWidthClass,
              customClass
            ]"
          >
            <!-- Cabecera del Modal -->
            <div v-if="$slots.title || title" class="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2.5 sm:gap-3 shrink-0">
              <div class="space-y-0.5 min-w-0 flex-1">
                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <slot name="title">{{ title }}</slot>
                </h3>
                <p v-if="$slots.description || description" class="text-xs text-slate-500 dark:text-slate-400">
                  <slot name="description">{{ description }}</slot>
                </p>
              </div>

              <button
                v-if="showCloseButton"
                type="button"
                @click="closeModal"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center justify-center transition cursor-pointer shrink-0"
                title="Cerrar (Esc)"
              >
                ✕
              </button>
            </div>

            <!-- Cuerpo del Modal -->
            <div class="overflow-y-auto grow scrollbar-thin overscroll-contain">
              <slot />
            </div>

            <!-- Footer del Modal -->
            <div v-if="$slots.footer" class="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: 'lg'
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:open', 'update:show', 'close']);

const isVisible = computed(() => props.open || props.show);

const maxWidthClass = computed(() => {
  if (props.maxWidth.startsWith('max-w-')) {
    return props.maxWidth;
  }
  switch (props.maxWidth) {
    case 'sm': return 'max-w-sm';
    case 'md': return 'max-w-md';
    case 'xl': return 'max-w-xl';
    case '2xl': return 'max-w-2xl';
    case '3xl': return 'max-w-3xl';
    case '4xl': return 'max-w-4xl';
    default: return 'max-w-lg';
  }
});

const closeModal = () => {
  emit('update:open', false);
  emit('update:show', false);
  emit('close');
};

const handleBackdropClick = () => {
  if (props.closeOnClickOutside) {
    closeModal();
  }
};

const handleEsc = () => {
  if (props.closeOnEscape) {
    closeModal();
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && isVisible.value && props.closeOnEscape) {
    closeModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

watch(isVisible, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>
