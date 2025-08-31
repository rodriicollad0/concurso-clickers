import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [], // Array vacío para deshabilitar todos los plugins de PostCSS
    },
  },
  // 🎬 Configuración para video demostración
  preview: {
    port: 5173,
    host: false // Solo localhost, sin mostrar IPs de red
  },
  server: {
    port: 5173,
    host: false // Solo localhost, sin mostrar IPs de red
  }
})
