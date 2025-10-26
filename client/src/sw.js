import { precacheAndRoute } from 'workbox-precaching';

// Precache de archivos estáticos
precacheAndRoute(self.__WB_MANIFEST);

// Escuchar eventos push
self.addEventListener('push', (event) => {
    console.log('Push recibido:', event);
    
    // Datos por defecto
    let notificationData = {
        title: 'Nueva notificación',
        body: 'Tienes un nuevo mensaje',
        icon: '/Icon-192x192.png',
        badge: '/Icon-192x192.png',
        tag: 'push-notification',
        data: { url: '/' }
    };
    
    // Intentar parsear datos del push
    if (event.data) {
        try {
            const pushData = event.data.json();
            console.log('Datos del push:', pushData);
            notificationData = {
                title: pushData.title || notificationData.title,
                body: pushData.body || notificationData.body,
                icon: pushData.icon || notificationData.icon,
                badge: notificationData.badge,
                tag: notificationData.tag,
                data: { url: pushData.url || '/', ...pushData.data }
            };
        } catch (error) {
            console.error('Error parseando push data:', error);
        }
    }
    
    console.log('Mostrando notificación:', notificationData);
    
    // Mostrar notificación
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: false,
            silent: false,
            vibrate: [200, 100, 200],
            data: notificationData.data
        }).then(() => {
            console.log('Notificación mostrada exitosamente');
        }).catch(error => {
            console.error('Error mostrando notificación:', error);
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