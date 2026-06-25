import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          react: ['react', 'react-dom'],
          capacitor: ['@capacitor/core', '@capacitor/preferences', '@capacitor/haptics', '@capacitor/status-bar'],
        },
      },
    },
  },
});
