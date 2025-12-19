
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FIX: Cast `process` to `any` to access `cwd()` when node types are unavailable.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/public/ai-studio/api_key': {
            target: 'http://localhost:5173',
            changeOrigin: true,
            rewrite: () => {
                return JSON.stringify({ apiKey: env.FREE_GEMINI_KEY });
            }
        }
      },
    },
    define: {
      'process.env': env
    }
  };
});