// public/sw.js - Service Worker para Notificaciones Web Push de Gestión IQ

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '💳 Gestión IQ · Districorr';
    const options = {
      body: data.body || 'Nuevo comprobante de pago disponible en tu portal.',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      data: {
        url: data.url || '/'
      },
      vibrate: [200, 100, 200],
      tag: 'comprobante-iq-notification'
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.warn('[ServiceWorker] Error al procesar push data:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/resumen') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
