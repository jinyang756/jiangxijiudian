// vite.admin.config.ts
// 用于管理面板演示的Vite配置

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist-admin',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});