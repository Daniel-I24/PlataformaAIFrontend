import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite para el proyecto React
// El proxy de desarrollo redirige las llamadas /api al backend local
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy para desarrollo: redirige /api al backend Spring Boot
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
