import webpush from 'web-push'
import dotenv from 'dotenv'
dotenv.config()

// Configuracion de las claves VAPID para las notificaciones push
// VAPID (Voluntary Application Server Identification) es un estandar que permite a los servidores
// de aplicaciones identificarse ante los servicios de notificaciones push
// Esto es necesario para enviar notificaciones push a los clientes de manera segura y autentificada

const SUBJECT = process.env.VAPID_SUBJECT
const PUB = process.env.VAPID_PUBLIC_KEY
const PRIV = process.env.VAPID_PRIVATE_KEY

if (!SUBJECT) {
  throw new Error('VAPID_SUBJECT no definido. Usa mailto:alguien@dominio.com o https://tu-dominio')
}
if (!PUB || !PRIV) {
  throw new Error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY no definidos')
}

webpush.setVapidDetails(SUBJECT, PUB, PRIV)

export default webpush;