import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

export default defineConfig(({ mode }) => {
  // Loads variables from your root environment file
  const env = loadEnv(mode, path.join(process.cwd(), '..'), '');
  
  return {
    define: {
      'process.env': env,
    },
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://redemption-backend-service:5500',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: 'http://redemption-backend-service:3000',
          ws: true,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});