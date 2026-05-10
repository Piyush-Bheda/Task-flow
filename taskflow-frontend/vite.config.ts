import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';



function readBackendPortFromDotEnv(): number | undefined {
  try {
    const envPath = path.resolve(process.cwd(), '../taskflow-backend/.env');
    const txt = fs.readFileSync(envPath, 'utf8');
    const m = /^PORT\s*=\s*(\d+)/m.exec(txt);
    const port = m?.[1] ? Number(m[1]) : NaN;
    return Number.isFinite(port) && port > 0 ? port : undefined;
  } catch {
    return undefined;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const explicit = env.VITE_API_PROXY_TARGET?.trim().replace(/\/+$/, '');
  const inferredPort = readBackendPortFromDotEnv();
  const fallback = inferredPort ? `http://127.0.0.1:${inferredPort}` : 'http://127.0.0.1:5000';
  const target = explicit && explicit.length > 0 ? explicit : fallback;

  const apiProxy = {
    '/api': { target, changeOrigin: true },
  };

   

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy: apiProxy },
    preview: { proxy: apiProxy },
     resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
