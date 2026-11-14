/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  build: {
    rollupOptions: {
      treeshake: {
        // Cada componente de Ionic (@ionic/core/components/ion-*.js) solo se registra cuando se usa,
        // así que si ninguna pantalla lo usa se puede dejar fuera del build (EF2: rendimiento).
        moduleSideEffects: (id) => !/@ionic[\\/]core[\\/]components[\\/]ion-[a-z-]+\.js$/.test(id),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
