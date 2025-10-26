import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';

import app from './App.js';
import connectDB from './config/db.js';
import './config/webpush.js';

dotenv.config();
await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});



