import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/practice2026/' : '/',
  plugins: [react()],
  optimizeDeps: {
    entries: ['index.html'],
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /[\\/]src[\\/].*\.js$/,
    exclude: [],
  },
}));
