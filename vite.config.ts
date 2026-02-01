import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      {
        name: 'configure-csp',
        configureServer(server) {
          server.middlewares.use((_req, res, next) => {
            res.setHeader("Content-Security-Policy", "default-src 'self' * 'unsafe-inline' 'unsafe-eval'; connect-src 'self' * 'unsafe-inline'; img-src 'self' * data: blob:;");
            next();
          });
        }
      }
    ],
    server: {
      port: 3001,
      host: '0.0.0.0',
      proxy: {
        '/analyze': { target: env.VITE_API_URL || 'http://localhost:8001', changeOrigin: true },
        '/reputation': { target: env.VITE_API_URL || 'http://localhost:8001', changeOrigin: true },
        '/audit': { target: env.VITE_API_URL || 'http://localhost:8001', changeOrigin: true }, // Keep backward compat URL if needed or remove
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
