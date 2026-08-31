// src/composables/useToasts.js
import { h } from 'vue';
import { toast as sonnerToast } from 'vue-sonner';
import {
  CheckCircle2 as CheckCircle2Icon,
  XCircle as XCircleIcon,
  Info as InfoIcon,
  AlertTriangle as AlertTriangleIcon,
  Loader2 as Loader2Icon
} from 'lucide-vue-next';

/**
 * Normaliza y formatea el mensaje de error o texto.
 */
const formatMessage = (msg, defaultMsg = 'Ocurrió un error inesperado.') => {
  if (!msg) return defaultMsg;
  if (typeof msg === 'string') return msg;
  if (typeof msg === 'object' && msg.message) return msg.message;
  return defaultMsg;
};

/**
 * Adaptador completo para vue-sonner con estilo Linear/Vercel e íconos Lucide.
 */
export const toast = {
  success(message, options = {}) {
    const text = formatMessage(message, 'Operación realizada con éxito');
    return sonnerToast.success(text, {
      icon: h(CheckCircle2Icon, { class: 'w-4 h-4 text-emerald-500 shrink-0' }),
      duration: options.duration || options.timeout || 4000,
      id: options.id,
      ...options
    });
  },

  error(error, options = {}) {
    const text = formatMessage(error, 'Ocurrió un error inesperado.');
    return sonnerToast.error(text, {
      icon: h(XCircleIcon, { class: 'w-4 h-4 text-rose-500 shrink-0' }),
      duration: options.duration || options.timeout || 5000,
      id: options.id,
      ...options
    });
  },

  info(message, options = {}) {
    const text = formatMessage(message, 'Información');
    const isPersistent = options.timeout === false || options.duration === Infinity;
    return sonnerToast.info(text, {
      icon: isPersistent 
        ? h(Loader2Icon, { class: 'w-4 h-4 text-brand-navy dark:text-brand-cyan-light animate-spin shrink-0' }) 
        : h(InfoIcon, { class: 'w-4 h-4 text-brand-cyan shrink-0' }),
      duration: isPersistent ? Infinity : (options.duration || options.timeout || 4000),
      id: options.id,
      ...options
    });
  },

  warning(message, options = {}) {
    const text = formatMessage(message, 'Advertencia');
    return sonnerToast.warning(text, {
      icon: h(AlertTriangleIcon, { class: 'w-4 h-4 text-amber-500 shrink-0' }),
      duration: options.duration || options.timeout || 4500,
      id: options.id,
      ...options
    });
  },

  loading(message = 'Procesando...', options = {}) {
    const text = formatMessage(message, 'Procesando...');
    return sonnerToast.loading(text, {
      icon: h(Loader2Icon, { class: 'w-4 h-4 text-brand-navy dark:text-brand-cyan-light animate-spin shrink-0' }),
      duration: Infinity,
      id: options.id,
      ...options
    });
  },

  // Shim de actualización para compatibilidad con vue-toastification
  update(toastId, { content, options = {} }) {
    const type = options.type || 'success';
    const text = formatMessage(content);
    if (type === 'error') {
      return this.error(text, { id: toastId, ...options });
    } else if (type === 'info') {
      return this.info(text, { id: toastId, ...options });
    }
    return this.success(text, { id: toastId, ...options });
  },

  dismiss(toastId) {
    return sonnerToast.dismiss(toastId);
  },

  clear() {
    return sonnerToast.dismiss();
  },

  promise(promise, { loading, success, error }) {
    return sonnerToast.promise(promise, {
      loading,
      success: (data) => (typeof success === 'function' ? success(data) : success),
      error: (err) => (typeof error === 'function' ? error(err) : formatMessage(err, 'Error en el proceso')),
    });
  }
};

/**
 * Hook para el uso de toasts en componentes Vue
 */
export function useToast() {
  return toast;
}

/**
 * Composable centralizado para notificaciones del sistema
 */
export function useToasts() {
  const showErrorToast = (error, defaultMessage = 'Ocurrió un error inesperado.') => {
    toast.error(error, { defaultMessage });
  };

  const showSuccessToast = (message) => {
    toast.success(message);
  };

  const showInfoToast = (message) => {
    toast.info(message);
  };

  const showLoadingToast = (message = 'Procesando...') => {
    return toast.loading(message);
  };

  const updateToast = (toastId, content, type = 'success') => {
    toast.update(toastId, { content, options: { type } });
  };

  return {
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    showLoadingToast,
    updateToast,
    toast
  };
}

export default useToasts;