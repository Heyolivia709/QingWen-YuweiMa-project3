import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use root path for Render, subpath for GitHub Pages
// Set RENDER=true environment variable when deploying to Render
const base = process.env.RENDER === 'true' ? '/' : '/QingWen-YuweiMa-project2/';

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
