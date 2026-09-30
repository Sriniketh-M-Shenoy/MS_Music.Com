import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path so assets load seamlessly in Electron, local HTTP, and GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false,
    modulePreload: false
  }
});
