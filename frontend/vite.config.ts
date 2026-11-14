/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Sin @vitejs/plugin-legacy (EF3): Ionic ya no funciona en los navegadores antiguos que ese plugin
  // cubría, y sus scripts dentro del HTML impedían una política de seguridad (CSP) estricta.
  plugins: [react()],
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
