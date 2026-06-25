import { resolverColaborador } from './resolverColaborador.js';

// Suma los campos declarados por el país activo en el acumulador del grupo.
function acumular(grupo, c, camposSumables) {
  grupo.numColaboradores++;
  camposSumables.forEach((campo) => { grupo[campo] += c[campo] || 0; });
}

function nuevoAcumulador(camposSumables, base) {
  const g = { ...base, numColaboradores: 0 };
  camposSumables.forEach((campo) => { g[campo] = 0; });
  return g;
}

export function obtenerDatosAgrupadosGerencias(data, cacheEdiciones, camposSumables) {
  const gerencias = {};
  data.forEach((colab) => {
    const c = resolverColaborador(colab, cacheEdiciones);
    const key = c.pais + '|' + c.gerenciaCorp;
    if (!gerencias[key]) {
      gerencias[key] = nuevoAcumulador(camposSumables, {
        idKey: c.gerenciaCorp, nombre: c.gerencia, gerenciaCorp: c.gerenciaCorp,
        empresa: c.empresa, pais: c.pais,
      });
    }
    acumular(gerencias[key], c, camposSumables);
  });
  return Object.values(gerencias);
}

export function obtenerDatosAgrupadosAreas(data, cacheEdiciones, camposSumables, gerenciaCorpKey) {
  const areas = {};
  data
    .filter((c) => c.gerenciaCorp === gerenciaCorpKey)
    .forEach((colab) => {
      const c = resolverColaborador(colab, cacheEdiciones);
      const key = c.pais + '|' + c.gerenciaCorp + '|' + c.area;
      if (!areas[key]) {
        areas[key] = nuevoAcumulador(camposSumables, {
          idKey: key, area: c.area, gerenciaCorp: c.gerenciaCorp, gerencia: c.gerencia,
          empresa: c.empresa, pais: c.pais,
        });
      }
      acumular(areas[key], c, camposSumables);
    });
  return Object.values(areas);
}

export function agruparPorArea(lista) {
  const grupos = {};
  const orden = [];
  lista.forEach((p) => {
    if (!grupos[p.area]) {
      grupos[p.area] = [];
      orden.push(p.area);
    }
    grupos[p.area].push(p);
  });
  return orden.map((area) => ({ area, personas: grupos[area] }));
}
