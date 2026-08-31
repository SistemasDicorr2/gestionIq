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
    icon: h(CheckCircle2Icon, { class: 'w-4.5 h-4.5 text-emerald-600 dark:text-emerald-300 shrink-0' }),
    duration: options.duration || options.timeout || 6000,
    id: options.id,
    style: {
      backgroundColor: '#ecfdf5',
      borderColor: '#a7f3d0',
      color: '#064e3b',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      padding: '12px 16px',
      boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
      ...options.style
    },
    ...options
  });
};

toastHandler.error = function(error, options = {}) {
  const text = formatMessage(error, 'Ocurrió un error inesperado.');
  return sonnerToast.error(text, {
    icon: h(XCircleIcon, { class: 'w-4.5 h-4.5 text-rose-600 dark:text-rose-300 shrink-0' }),
    duration: options.duration || options.timeout || 8000,
    id: options.id,
    style: {
      backgroundColor: '#fff1f2',
      borderColor: '#fecdd3',
      color: '#881337',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      padding: '12px 16px',
      boxShadow: '0 4px 14px 0 rgba(244, 63, 94, 0.15)',
      ...options.style
    },
    ...options
  });
};

toastHandler.info = function(message, options = {}) {
  const text = formatMessage(message, 'Información');
  const isPersistent = options.timeout === false || options.duration === Infinity;
  return sonnerToast.info(text, {
    icon: isPersistent 
      ? h(Loader2Icon, { class: 'w-4.5 h-4.5 text-brand-navy dark:text-brand-cyan-light animate-spin shrink-0' }) 
      : h(InfoIcon, { class: 'w-4.5 h-4.5 text-brand-cyan shrink-0' }),
    duration: isPersistent ? Infinity : (options.duration || options.timeout || 6000),
    id: options.id,
    style: {
      backgroundColor: '#ecfeff',
      borderColor: '#a5f3fc',
      color: '#164e63',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      padding: '12px 16px',
      boxShadow: '0 4px 14px 0 rgba(8, 111, 146, 0.12)',
      ...options.style
    },
    ...options
  });
};

toastHandler.warning = function(message, options = {}) {
  const text = formatMessage(message, 'Advertencia');
  return sonnerToast.warning(text, {
    icon: h(AlertTriangleIcon, { class: 'w-4.5 h-4.5 text-amber-600 dark:text-amber-300 shrink-0' }),
    duration: options.duration || options.timeout || 7000,
    id: options.id,
    style: {
      backgroundColor: '#fffbeb',
      borderColor: '#fde68a',
      color: '#78350f',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      padding: '12px 16px',
      boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.15)',
      ...options.style
    },
    ...options
  });
};

toastHandler.loading = function(message = 'Procesando...', options = {}) {
  const text = formatMessage(message, 'Procesando...');
  return sonnerToast.loading(text, {
    icon: h(Loader2Icon, { class: 'w-4.5 h-4.5 text-brand-navy dark:text-brand-cyan-light animate-spin shrink-0' }),
    duration: Infinity,
    id: options.id,
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#cbd5e1',
      color: '#0f172a',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      padding: '12px 16px',
      boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.08)',
      ...options.style
    },
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