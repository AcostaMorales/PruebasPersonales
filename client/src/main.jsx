import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Registrar el service worker para habilitar las funcionalidades PWA
registerSW({ immediate: true}) // El service worker se registra inmediatamente al cargar la aplicación

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
