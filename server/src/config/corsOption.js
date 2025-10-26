export const corsOptions = {
    origin: [process.env.CLIENT_URL || 
      'http://192.168.56.1:5173/',
      'http://192.168.56.1:4173/'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

/*
Si se necesita permitir varios dominios, usar este codigo:
const whitelist = [process.env.CLIENT_URL, 'https://tu-dominio.com']
export const corsOptions = {
  origin(origin, cb) {
    if (!origin || whitelist.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true
}
 */

