import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
  }
})

/*
Ahora
1. Código hace: api.get('/users')
2. Se convierte en: GET /api/users
3. Vite detecta "/api" y lo redirige a: http://localhost:4000/api/users
4. Backend responde
5. Frontend recibe los datos SIN errores de CORS


*/