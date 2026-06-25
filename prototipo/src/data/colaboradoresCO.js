import { colaboradores as datosDemo } from './colaboradoresCO.demo.js';

// src/data/local/colaboradoresCO.js es gitignored (ver README) — si existe y no estamos
// forzando demo (VITE_FORZAR_DATOS_DEMO, ver .env.production), se usa en su lugar.
// import.meta.glob no falla si el archivo no existe: simplemente no hay match.
const modulosLocales = import.meta.glob('./local/colaboradoresCO.js', { eager: true });
const datosLocales = Object.values(modulosLocales)[0]?.colaboradores;

const forzarDemo = import.meta.env.VITE_FORZAR_DATOS_DEMO === 'true';

export const colaboradores = (!forzarDemo && datosLocales) ? datosLocales : datosDemo;
