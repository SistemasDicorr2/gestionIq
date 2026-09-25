// src/services/webPushService.js
// Gestor de permisos y suscripción Web Push Remoto (VAPID) para instrumentadores
import { supabase } from './supabase.js';

const STORAGE_KEY_PREFIX = 'gestion_iq_push_optin_';

// Clave pública VAPID para el registro de suscripciones en navegadores
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

/**
 * Convierte una clave VAPID en formato base64 URL-safe a un Uint8Array requerido por PushManager
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Verifica si las notificaciones web y service workers son soportados en el navegador actual
 */
export function isWebNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Obtiene el estado actual del permiso de notificaciones
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'}
 */
export function getNotificationPermissionStatus() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Registra el Service Worker en segundo plano
 */
export async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (err) {
      console.warn('[WebPush] No se pudo registrar ServiceWorker:', err);
      return null;
    }
  }
  return null;
}

/**
 * Obtiene la suscripción Push existente en este navegador
 */
export async function getExistingPushSubscription() {
  try {
    const reg = await registerServiceWorker();
    if (!reg || !reg.pushManager) return null;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.warn('[WebPush] Error al obtener suscripción existente:', err);
    return null;
  }
}

/**
 * Suscribe el navegador del instrumentador a notificaciones remotas vía VAPID y registra en Supabase
 * @param {string} instrumentadorDni DNI del instrumentador
 * @returns {Promise<{ success: boolean, subscription?: Object, error?: string }>}
 */
export async function subscribeUserToPush(instrumentadorDni = '') {
  if (!isWebNotificationSupported()) {
    return { success: false, error: 'Tu navegador no soporta notificaciones Web Push.' };
  }

  try {
    // 1. Solicitar permiso explícito al usuario
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      if (instrumentadorDni) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${instrumentadorDni}`, 'denied');
      }
      return { success: false, error: 'Permiso de notificaciones no concedido.' };
    }

    // 2. Registrar el Service Worker
    const reg = await registerServiceWorker();
    if (!reg || !reg.pushManager) {
      return { success: false, error: 'No se pudo inicializar el gestor Push del navegador.' };
    }

    // 3. Suscribirse a la red de Push (Google FCM / Apple APNs / Mozilla) con la clave pública VAPID
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      throw new Error('La suscripción push no generó las claves criptográficas requeridas.');
    }

    const cleanDni = String(instrumentadorDni || '').trim();

    // 4. Guardar preferencia local inmediata
    if (cleanDni) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${cleanDni}`, 'granted');
    }

    // 5. Guardar o actualizar la suscripción en Supabase
    if (cleanDni) {
      try {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconocido';
        const { error: dbError } = await supabase
          .from('instrumentador_push_subscriptions')
          .upsert(
            {
              instrumentador_dni: cleanDni,
              endpoint: endpoint,
              p256dh: p256dh,
              auth: auth,
              user_agent: userAgent,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'endpoint' }
          );

        if (dbError) {
          console.warn('[WebPush] Advertencia al guardar en tabla instrumentador_push_subscriptions:', dbError);
        }
      } catch (dbErr) {
        console.warn('[WebPush] Error al persistir en Supabase (puede requerir migración de tabla):', dbErr);
      }
    }

    return { success: true, subscription: subJson };
  } catch (err) {
    console.error('[WebPush] Error en suscripción remota:', err);
    return { success: false, error: err.message || 'Error al suscribir notificaciones.' };
  }
}

/**
 * Emite una notificación nativa en el dispositivo del usuario (en primer o segundo plano)
 * @param {Object} options
 * @param {string} options.title Título de la notificación
 * @param {string} options.body Cuerpo descriptivo
 * @param {string} options.url URL a abrir al hacer clic
 * @param {string} options.icon Icono opcional
 */
export async function showDeviceNotification({ title, body, url, icon = '/favicon.ico' }) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // 1. Intentar mostrar a través del ServiceWorker si está activo
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [200, 100, 200],
          data: { url },
          tag: 'comprobante-iq-notification'
        });
        return true;
      }
    }

    // 2. Fallback con Notification API estándar del navegador
    const notif = new Notification(title, {
      body,
      icon,
      data: { url }
    });

    notif.onclick = () => {
      window.focus();
      if (url && typeof window !== 'undefined') {
        window.location.href = url;
      }
      notif.close();
    };

    return true;
  } catch (err) {
    console.warn('[WebPush] Error al emitir notificación en dispositivo:', err);
    return false;
  }
}

// Alias de retrocompatibilidad
export const requestWebNotificationPermission = subscribeUserToPush;
export const subscribeToWebPush = subscribeUserToPush;

