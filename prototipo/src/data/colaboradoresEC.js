import { colaboradores as datosDemo } from './colaboradoresEC.demo.js';
const modulosLocales = import.meta.glob('./local/colaboradoresEC.js', { eager: true });
const datosLocales = Object.values(modulosLocales)[0]?.colaboradores;
const forzarDemo = import.meta.env.VITE_FORZAR_DATOS_DEMO === 'true';
export const colaboradores = (!forzarDemo && datosLocales) ? datosLocales : datosDemo;
