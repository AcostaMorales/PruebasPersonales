// Generar o recuperar un identificador único para el dispositivo
export function getDeviceId() {
    // Intentar obtener el ID del dispositivo desde el almacenamiento local
    let id = localStorage.getItem('deviceId');
    // Si no existe, generar uno nuevo y almacenarlo
    if (!id){
        // Generar un UUID utilizando la API de criptografía del navegador
        id = crypto.randomUUID();
        // Almacenar el ID generado en el almacenamiento local para uso futuro
        localStorage.setItem('deviceId', id);
    }
    return id;

}