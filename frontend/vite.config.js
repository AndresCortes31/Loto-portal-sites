import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo, las llamadas a /api se redirigen al backend Node.js
    proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } },
  },
});
