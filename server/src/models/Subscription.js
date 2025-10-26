// Subcription.js
// Modelo de datos para las suscripciones de notificaciones push
// Esta es una forma de tener una sesion persistente con el cliente para enviarle notificaciones push
// sin tener que crear un perfil de usuario completo
// Ademas de almacenar la informacion necesaria para enviar las notificaciones push

import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
    deviceId: {
        // tipo: String,
        type: String,
        // index se refiere a que este campo sera indexado en la base de datos para mejorar la velocidad de las consultas
        // esto se refiere a que se creara un indice en la base de datos para este campo
        index: true,
        // unique se refiere a que este campo no puede tener valores duplicados en la base de datos
        unique: true,
    },
    // el endpoint es la URL a la que se enviaran las notificaciones push
    endpoint: {
        type: String,
        required: true,
    },
    keys: {
        // p256dh significa "prime 256 bits Diffie-Hellman"
        p256dh: {type: String, required: true},
        // auth es un valor utilizado en el proceso de cifrado para asegurar la integridad y confidencialidad de los mensajes enviados a través de las notificaciones push
        auth: {type: String, required: true},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Subscription', SubscriptionSchema);