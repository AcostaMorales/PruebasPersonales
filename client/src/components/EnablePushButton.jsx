import React, {useState} from 'react';
import {enablePush} from '../lib/push.js';

export default function EnavlePushButton({onSubcibed}) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try{
            setLoading(true);
            const id = await enablePush();
            onSubcibed(id);
            alert('Suscrito a notificaciones');
        }catch(err){
            console.error('Error al habilitar las notificaciones push:', err);
            alert('Error al habilitar las notificaciones push. Revisa la consola para más detalles.');
        }finally{
            setLoading(false);
        }
    }

    return (
        <button onClick={handleClick} disabled={loading}>
            {loading ? 'Habilitando...' : 'Habilitar Notificaciones Push'}
        </button>
    );
}