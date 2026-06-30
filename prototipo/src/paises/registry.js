import { colombia } from './colombia/index.js';
import { peru } from './peru/index.js';
import { ecuador } from './ecuador/index.js';

// Registro central de países. Agregar un país = una entrada aquí + su módulo + su data file.
export const PAISES = {
  CO: colombia,
  PE: peru,
  EC: ecuador,
};

export function getPais(codigo) {
  return PAISES[codigo] || PAISES.CO;
}

export function listarPaises() {
  return Object.values(PAISES).map((p) => ({ codigo: p.codigo, nombre: p.nombre }));
}
