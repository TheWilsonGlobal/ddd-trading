import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Read root .env two levels up: ../..
  const ROOT_ENV_DIR = path.resolve(__dirname, '../..');
  const raw = loadEnv(mode, ROOT_ENV_DIR, ['ADMIN_PORT', 'PORT', 'WEB_PORT']);
  const port = Number(raw.ADMIN_PORT) || 5472;
  const gatewayPort = Number(raw.PORT) || 5470;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      host: 'localhost',
      proxy: {
        '/v1': {
          target: `http://localhost:${gatewayPort}`,
          changeOrigin: true,
        },
        '/ws': {
          target: `ws://localhost:${gatewayPort}`,
          ws: true,
        },
      },
    },
    preview: {
      allowedHosts: ['.onrender.com'],
    },
  };
});
