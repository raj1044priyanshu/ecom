import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress unresolved CSS import warning from react-inner-image-zoom
        // (legacy package with no exports map — CSS is bundled at runtime)
        if (
          warning.code === 'UNRESOLVED_IMPORT' &&
          warning.exporter?.includes('react-inner-image-zoom')
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});
