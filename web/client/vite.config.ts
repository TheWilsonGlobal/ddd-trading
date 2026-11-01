import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Read root .env two levels up: ../..
  const ROOT_ENV_DIR = path.resolve(__dirname, '../..');
  const raw = loadEnv(mode, ROOT_ENV_DIR, ['WEB_PORT', 'PORT', 'CLIENT_PORT']);
  const port = Number(raw.CLIENT_PORT || raw.WEB_PORT) || 5471;
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
    // `vite preview` runs on Render (ddd-web). Vite 5.4 rejects any Host it does not list.
    preview: {
      allowedHosts: ['.onrender.com'],
    },
  };
});
