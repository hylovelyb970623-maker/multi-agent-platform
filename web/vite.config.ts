import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 用 @ 指向 web/src,方便导入
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 把 /api 请求代理到后端 Express(默认 3007)
    proxy: {
      '/api': {
        target: 'http://localhost:3007',
        changeOrigin: true,
      },
    },
  },
});
