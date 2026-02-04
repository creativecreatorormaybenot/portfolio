import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    // Opens browser by default, but can be disabled with VITE_NO_OPEN=true
    open: process.env.VITE_NO_OPEN !== 'true',
  },
});
