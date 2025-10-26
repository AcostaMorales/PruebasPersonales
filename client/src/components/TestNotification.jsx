import React from 'react';

export default function TestNotification() {
    const testLocalNotification = () => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Prueba Local', {
                body: 'Esta es una notificación de prueba local',
                icon: '/Icon-192x192.png'
            });
        } else {
            alert('Permisos de notificación no concedidos');
        }
    };

    const testPushNotification = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API_URL}/push/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Prueba Push',
                    body: 'Esta es una notificación push de prueba',
                    icon: '/Icon-192x192.png',
                    url: '/'
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Push enviado:', result);
                alert('Push notification enviada');
            } else {
                console.error('Error enviando push:', response.status);
                alert('Error enviando push notification');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    return (
        <div style={{ 
            margin: '20px 0', 
            padding: '15px', 
            border: '2px solid #007bff', 
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
        }}>
            <h3 style={{ color: '#007bff', margin: '0 0 15px 0' }}>🔔 Pruebas de Notificaciones</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={testLocalNotification} 
                    style={{ 
                        padding: '10px 15px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    📱 Prueba Notificación Local
                </button>
                <button 
                    onClick={testPushNotification} 
                    style={{ 
                        padding: '10px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    🚀 Prueba Push Notification
                </button>
            </div>
        </div>
    );
}