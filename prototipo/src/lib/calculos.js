import { resolverColaborador } from './resolverColaborador.js';

// Utilitario de agregación país-agnóstico. Resuelve cada colaborador (aplica ediciones
// en caché) y suma los `camposSumables` que declare el país activo.
export function consolidar(coleccion, cacheEdiciones, camposSumables) {
  const resueltos = coleccion.map((colab) => resolverColaborador(colab, cacheEdiciones));
  const totales = {};
  camposSumables.forEach((campo) => { totales[campo] = 0; });
  resueltos.forEach((c) => {
    camposSumables.forEach((campo) => { totales[campo] += c[campo] || 0; });
  });
  return { totales, resueltos };
}
