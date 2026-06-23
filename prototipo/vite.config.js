import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base solo se fija al hacer build (GitHub Pages sirve el repo en /PrototipoAppCostosEstructurales/);
// en dev se mantiene en la raíz para no alterar npm run dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/PrototipoAppCostosEstructurales/' : '/',
  plugins: [react()],
}));
