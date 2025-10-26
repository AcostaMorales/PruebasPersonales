// Pruebas/client/vite.config.js
// configuración de Vite para una aplicación React con soporte PWA
// utilizando el plugin vite-plugin-pwa

// Importar las funciones y plugins necesarios
// primeramente se importa 'defineConfig' de 'vite' para definir la configuración
// luego se importa el plugin de React para Vite
// finalmente se importa el plugin VitePWA para agregar funcionalidades PWA
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Configuración de plugins
  plugins: [
    // Plugin de React para Vite
    react(),
    // Configuración del plugin VitePWA
    VitePWA({
      // Estrategia de generación del service worker
      // injectManifest permite personalizar el service worker existente
      // osea que se inyectan las rutas precacheadas en un service worker personalizado
      strategiest: 'injectManifest',
      // Directorio fuente donde se encuentra el service worker personalizado
      srcDIr: 'src',
      // Nombre del archivo del service worker
      // osea el archivo que contiene la lógica del service worker personalizado
      filename: 'sw.js',
      // Tipo de registro del service worker
      registerType: 'autoUpdate',
      // Archivos adicionales a incluir en la PWA
      includeAssets: ['favicon.svg', 'robots.txt'],
      // Configuración del manifiesto de la PWA
      manifest: {
        // Nombre completo de la PWA
        name: 'Prueba React + Vite PWA',
        // Nombre corto de la PWA
        short_name: 'PRVP',
        // URL de inicio de la PWA
        start_url: '/',
        // Ámbito de la PWA
        scope: '/',
        // Modo de visualización de la PWA
        display: 'standalone',
        // Color del tema de la PWA
        theme_color: '#e90e0eff',
        // Color de fondo de la PWA
        background_color: '#ffffff',
        // Descripción de la PWA
        description: 'React + Vite PWA',
        // Iconos de la PWA en diferentes tamaños y propósitos
        // Se definen iconos estándar y con propósito "maskable"
        // Estos iconos se utilizan para representar la aplicación en diferentes contextos
        icons: [
          // Iconos estándar debe ser al menos de 192x192 y 512x512 píxeles
          { src: 'Icon-192x192.png', sizes: '192x192', type: 'image/png' },
          // Icono de mayor tamaño
          { src: 'Icon-512x512.png', sizes: '512x512', type: 'image/png' },
          // Iconos con propósito "maskable" estan diseñados para adaptarse mejor a diferentes formas de iconos
          // debe ser al menos de 192x192 y 512x512 píxeles
          { src: 'maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          // Icono maskable de mayor tamaño
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          {
            // Capturas de pantalla para mejorar la experiencia de instalación de la PWA
            // Se proporcionan capturas para vistas móviles y de escritorio
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            // narrow para móvil
            form_factor: 'narrow',
            label: 'Feria de Pabellón - Vista móvil'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            // wide para escritorio
            form_factor: 'wide',
            label: 'Feria de Pabellón - Vista móvil'
          }
        ]
      },
      // Opciones de desarrollo para la PWA
      devOptions: { enabled: true },
    })
  ]
})
