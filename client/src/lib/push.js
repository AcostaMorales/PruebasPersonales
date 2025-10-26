const API_URI = import.meta.env.VITE_API_URL;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Función para convertir una clave pública en formato Base64 a un Uint8Array
function urlBase64ToUint8Array(base64){
    // Añadir relleno si es necesario
    // El relleno asegura que la longitud de la cadena sea múltiplo de 4
    const padding = '='.repeat((4 - (base64.length % 4))%4);
    // Reemplazar caracteres para hacer la cadena compatible con Base64 estándar
    const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    // Decodificar la cadena Base64 a datos binarios
    const raw = atob(base64Safe);
    // Crear un Uint8Array para almacenar los bytes decodificados
    const outputArray = new Uint8Array (raw.length);
    // Llenar el Uint8Array con los códigos de carácter de los datos binarios
    // ciclo para convertir cada carácter en su valor numérico correspondiente
    for (let i = 0; i< raw.length; ++i){
        outputArray[i] = raw.charCodeAt(i);
    }
    // regresa la matriz de bytes
    return outputArray;
}

export async function enablePush(){
    console.log('Iniciando proceso de habilitación de push...');
    
    // Verificar soporte básico
    if(!('Notification' in window)) {
        throw new Error('Este navegador no soporta notificaciones');
    }
    if(!('serviceWorker' in navigator)) {
        throw new Error('Este navegador no soporta service workers');
    }
    if(!('PushManager' in window)) {
        throw new Error('Este navegador no soporta push messaging');
    }

    console.log('Navegador compatible. Solicitando permisos...');
    
    // 1) Solicitar permiso para mostrar notificaciones
    const permiso = await Notification.requestPermission();
    console.log('Permiso de notificaciones:', permiso);
    
    if (permiso !== 'granted') {
        throw new Error('Permiso de notificaciones denegado');
    }

    // 2) Esperar a que el service worker esté listo
    console.log('Esperando service worker...');
    const registro = await navigator.serviceWorker.ready;
    console.log('Service worker listo:', registro);

    // 3) Verificar si ya existe una suscripción
    let subscription = await registro.pushManager.getSubscription();
    
    if (!subscription) {
        console.log('Creando nueva suscripción...');
        // Crear nueva suscripción
        subscription = await registro.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
    } else {
        console.log('Suscripción existente encontrada');
    }

    console.log('Suscripción obtenida:', subscription);

    // 4) Enviar suscripción al servidor
    const { getDeviceId } = await import('./deviceId.js');
    const deviceId = getDeviceId();
    
    console.log('Enviando suscripción al servidor...');
    const respuesta = await fetch(`${API_URI}/push/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            deviceId,
            subscription: subscription,
        }),
    });
    
    console.log('Respuesta del servidor:', respuesta.status);
    
    if(!respuesta.ok) {
        const errorText = await respuesta.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al enviar la suscripción al servidor: ${respuesta.status}`);
    }

    console.log('Push notifications habilitadas exitosamente');
    return deviceId;
}
