import { precacheAndRoute } from 'workbox-precaching';

// Precache de archivos estáticos
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
    let payload = {
        title: 'Notificación',
        body: 'Nueva notificación disponible',
        icon: '/Icon-192x192.png',
        url: '/'
    };
    
    try {
        if (event.data) {
            payload = { ...payload, ...event.data.json() };
        }
    } catch (error) {
        console.error('Error al parsear payload:', error);
    }
    
    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon,
            badge: '/Icon-192x192.png',
            tag: 'notification-' + Date.now(),
            requireInteraction: false,
            silent: false,
            data: { url: payload.url || '/', ...payload.data }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Si hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                }
            })
    );
});