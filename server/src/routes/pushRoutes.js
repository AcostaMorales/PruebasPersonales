import { Router } from "express";
import Subscription from "../models/Subscription.js";
import webpush from "../config/webpush.js";

const router = Router();

// Ruta para manejar las suscripciones de notificaciones push
// Esta ruta recibe la informacion de la suscripcion desde el cliente y la almacena en la base de datos
router.post('/subscribe', async (req, res, next) => {
    try{
        // Extraer deviceId y subcription del cuerpo de la solicitud
        const {deviceId, subscription} = req.body || {};
        // Validar que deviceId y subcription existan
        if (!deviceId || !subscription?.endpoint){
            // si no existen, devolver un error 400 (Bad Request)
            console.log('Invalid subscription data', req.body);
            return res.status(400).json({message: 'Invalid subscription data'});
        }
        // Buscar la suscripcion en la base de datos por deviceId y actualizarla o crearla si no existe
        await Subscription.findOneAndUpdate(
            // significa que buscamos una suscripcion con el deviceId proporcionado
            {deviceId},
            // si no existe, creamos una nueva suscripcion con la informacion proporcionada
            {
                deviceId,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            },
            // esto significa que si no existe una suscripcion con el deviceId proporcionado, se creara una nueva
            {upsert: true, new: true, setDefaultsOnInsert: true}
        );
        // Devolver una respuesta exitosa
        res.status(201).json({message: 'Subscription saved successfully'});
    }catch (error){
        next(error);
    }
});

// enviar a todos los suscriptores una notificacion push
// broadcast significa difusion masiva, osea enviar a todos los suscriptores
router.post('/broadcast', async (req, res, next) => {
    try{
        // Obtener todas las suscripciones de la base de datos
        const subs = await Subscription.find({}, {endpoint:1, keys:1, deviceId: 1});
        // Crear la carga util (payload) de la notificacion push
        const payload = JSON.stringify({
            // si no se proporciona un titulo, cuerpo, icono, url o datos, se utilizan valores predeterminados
            title: req.body.title || 'Notificacion masiva',
            // Si no se proporciona un cuerpo, se utiliza un valor predeterminado
            body: req.body.body || 'Esta es una notificacion enviada a todos los suscriptores',
            // Si no se proporciona un icono, se utiliza un valor predeterminado
            icon: req.body.icon || '/icon.png',
            // Si no se proporciona una url, se utiliza un valor predeterminado
            url: req.body.url || '/',
            // Si no se proporcionan datos adicionales, se utiliza un objeto vacio
            data: req.body.data || {}
        });
        const results = await Promise.allSettled(
            subs.map(sub => webpush.sendNotification({endpoint: sub.endpoint, keys: sub.keys}, payload))
        );

        // Limpia expirados
        const toDelete = results
            .map((result, index) => ({result, sub: subs[index]}))
            .filter(x => x.result.status === 'rejected' && [404,410].includes(x.result.reason?.statusCode))
            .map(x=>({deviceId: x.sub.deviceId}));
        if (toDelete.length){
            await Subscription.deleteMany({$or: toDelete});
        }
        
        // Enviar respuesta con estadísticas
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        res.status(200).json({
            message: 'Broadcast completed',
            total: subs.length,
            successful,
            failed,
            removed: toDelete.length
        });

    }catch (error){
        next(error);
    }

});

export default router;