import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    solidPlugin(),
    UnoCSS({
      /* options */
    }),
  ],
  server: {
    port: 25565,
    proxy: {
      '/api': 'http://127.0.0.1:8090',
    },
  },
  build: {
    target: 'esnext',
  },
  base: '',
});
