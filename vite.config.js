import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MS_Music.Com/', // Matches repository name for GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});
