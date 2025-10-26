import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import routes from './routes/index.js';
import {corsOptions } from './config/corsOption.js';

const app = express();

// Middlewares base
app.use(cors(corsOptions));
//app.use('*', cors(corsOptions)); // para preflight requests
app.use(express.json({limit: '1mb'}));
app.use(cookieParser());

// Prefijo de rutas /api
app.use('/api', routes);

export default app;