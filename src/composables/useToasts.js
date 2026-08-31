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
 * Adaptador invocable y compatible para vue-sonner.
 * Funciona como función toast("mensaje") y como objeto toast.success(), toast.error(), etc.
 */
const toastHandler = (message, options = {}) => {
  return toastHandler.info(message, options);
};

toastHandler.success = function(message, options = {}) {
  const text = formatMessage(message, 'Operación realizada con éxito');
  return sonnerToast.success(text, {
    icon: h(CheckCircle2Icon, { class: 'w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0' }),
    duration: options.duration || options.timeout || 5000,
    id: options.id,
    className: 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100',
    ...options
  });
};

toastHandler.error = function(error, options = {}) {
  const text = formatMessage(error, 'Ocurrió un error inesperado.');
  return sonnerToast.error(text, {
    icon: h(XCircleIcon, { class: 'w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0' }),
    duration: options.duration || options.timeout || 7000,
    id: options.id,
    className: 'border-rose-200/80 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100',
    ...options
  });
};

toastHandler.info = function(message, options = {}) {
  const text = formatMessage(message, 'Información');
  const isPersistent = options.timeout === false || options.duration === Infinity;
  return sonnerToast.info(text, {
    icon: isPersistent 
      ? h(Loader2Icon, { class: 'w-4 h-4 text-brand-navy dark:text-brand-cyan-light animate-spin shrink-0' }) 
      : h(InfoIcon, { class: 'w-4 h-4 text-brand-cyan shrink-0' }),
    duration: isPersistent ? Infinity : (options.duration || options.timeout || 5000),
    id: options.id,
    className: 'border-cyan-200/80 dark:border-cyan-900/60 bg-cyan-50/90 dark:bg-cyan-950/60 text-slate-900 dark:text-white',
    ...options
  });
};

toastHandler.warning = function(message, options = {}) {
  const text = formatMessage(message, 'Advertencia');
  return sonnerToast.warning(text, {
    icon: h(AlertTriangleIcon, { class: 'w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0' }),
    duration: options.duration || options.timeout || 6000,
    id: options.id,
    className: 'border-amber-200/80 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100',
    ...options
  });
};

toastHandler.loading = function(message = 'Procesando...', options = {}) {
  const text = formatMessage(message, 'Procesando...');
  return sonnerToast.loading(text, {
    icon: h(Loader2Icon, { class: 'w-4 h-4 text-brand-navy dark:text-brand-cyan-light animate-spin shrink-0' }),
    duration: Infinity,
    id: options.id,
    ...options
  });
};

// Shim de actualización para compatibilidad con vue-toastification
toastHandler.update = function(toastId, payload = {}) {
  const content = payload.content || payload;
  const options = payload.options || {};
  const type = options.type || 'success';
  const text = formatMessage(content);
  if (type === 'error') {
    return this.error(text, { id: toastId, ...options });
  } else if (type === 'info') {
    return this.info(text, { id: toastId, ...options });
  }
  return this.success(text, { id: toastId, ...options });
};

toastHandler.dismiss = function(toastId) {
  return sonnerToast.dismiss(toastId);
};

toastHandler.clear = function() {
  return sonnerToast.dismiss();
};

toastHandler.promise = function(promise, { loading, success, error }) {
  return sonnerToast.promise(promise, {
    loading,
    success: (data) => (typeof success === 'function' ? success(data) : success),
    error: (err) => (typeof error === 'function' ? error(err) : formatMessage(err, 'Error en el proceso')),
  });
};

export const toast = toastHandler;

/**
 * Hook para el uso de toasts en componentes Vue
 */
export function useToast() {
  return toastHandler;
}

/**
 * Composable centralizado para notificaciones del sistema
 */
export function useToasts() {
  const showErrorToast = (error, defaultMessage = 'Ocurrió un error inesperado.') => {
    toastHandler.error(error, { defaultMessage });
  };

  const showSuccessToast = (message) => {
    toastHandler.success(message);
  };

  const showInfoToast = (message) => {
    toastHandler.info(message);
  };

  const showLoadingToast = (message = 'Procesando...') => {
    return toastHandler.loading(message);
  };

  const updateToast = (toastId, content, type = 'success') => {
    toastHandler.update(toastId, { content, options: { type } });
  };

  return {
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    showLoadingToast,
    updateToast,
    toast: toastHandler
  };
}

export default useToasts;