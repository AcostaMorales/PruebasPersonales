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
    // Verificar si el navegador soporta notificaciones y service workers
    if(!('Notification' in window))throw new Error ('Este navegador no soporta notificaciones');
    // Verificar soporte para service workers
    if(!('serviceWorker' in navigator)) throw new Error ('Este navegador no soporta service workers');
    
    // 1) Solicitar permiso para mostrar notificaciones
    // la constante permiso espera la respuesta del usuario 
    const permiso = await Notification.requestPermission();
    // Si el permiso es denegado, lanzar un error
    if (permiso !== 'granted')throw new Error ('Permiso de notificaciones denegado');

    // 2) Registrar el service worker
    // la constante registro espera a que el service worker esté listo
    const registro = await navigator.serviceWorker.ready;

    // 3) Suscribirse a las notificaciones push
    // la constante subscription espera la suscripción push del service worker
    const subscription = await registro.pushManager.subscribe({
        // Indica que las notificaciones deben ser visibles para el usuario
        userVisibleOnly: true,
        // Clave pública del servidor para autenticar la suscripción
        applicationServerKey: urlBase64ToUint8Array (VAPID_PUBLIC_KEY),
    });

    // 4) Enviar la suscripción al servidor
    // Importar la función getDeviceID de forma dinámica
    // para obtener el identificador único del dispositivo
    const { getDeviceId } = await import ('./deviceId.js')
    // Obtener el deviceId
    const deviceId = getDeviceId();

    // Enviar la suscripción y el deviceId al servidor a través de una solicitud POST
    const respuesta = await fetch(`${API_URI}/push/subscribe`, {
        // Tipo de solicitud
        method: 'POST',
        // Encabezados de la solicitud
        headers: {
            'Content-Type': 'application/json',
        },
        // Cuerpo de la solicitud en formato JSON
        body: JSON.stringify({
            deviceId,
            subscription: subscription,
        }),
    });
    // Verificar si la respuesta del servidor es exitosa
    if(!respuesta.ok) throw new Error ('Error al enviar la suscripción al servidor');

    // 5) Regresar el deviceId para uso futuro
    return deviceId;
}
