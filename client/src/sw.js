self.addEventListener('push', (event) =>{
    let payload = {}
    try{
        payload = event.data ? event.data.json() : {};
    }catch (error){
        console.error('Error al parsear el payload de la notificacion push', error);
        return;
    }
    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/Icon-192x192.png',
            badge: '/badge-72x72.png',
            data: {url : payload.url || '/', ...payload.data}
        })
    );
});

self.addEventListener('notificationclick', (event) =>{
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
      (async () => {
        const allClients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        const client = allClients.find(
          (c) =>
            "focus" in c && c.url && c.url.includes(self.registration.scope)
        );
        if (client) return client.focus();
        return self.clients.openWindow(url);
      })()
    );
});