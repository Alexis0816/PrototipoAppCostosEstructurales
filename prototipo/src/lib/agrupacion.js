import { resolverColaborador } from './resolverColaborador.js';

export function obtenerDatosAgrupadosGerencias(data, cacheEdiciones) {
  const gerencias = {};
  data.forEach((colab) => {
    const c = resolverColaborador(colab, cacheEdiciones);
    if (!gerencias[c.gerenciaCorp]) {
      gerencias[c.gerenciaCorp] = {
        idKey: c.gerenciaCorp, nombre: c.gerencia, gerenciaCorp: c.gerenciaCorp,
        empresa: c.empresa, pais: c.pais,
        numColaboradores: 0, sueldoMensual: 0, bonoTargetAnual: 0, medicinaPrepagadaAnio: 0,
      };
    }
    const g = gerencias[c.gerenciaCorp];
    g.numColaboradores++;
    g.sueldoMensual += c.sueldoMensual;
    g.bonoTargetAnual += c.bonoTargetAnual;
    g.medicinaPrepagadaAnio += c.medicinaPrepagadaAnio;
  });
  return Object.values(gerencias);
}

export function obtenerDatosAgrupadosAreas(data, cacheEdiciones, gerenciaCorpKey) {
  const areas = {};
  data
    .filter((c) => c.gerenciaCorp === gerenciaCorpKey)
    .forEach((colab) => {
      const c = resolverColaborador(colab, cacheEdiciones);
      const key = c.gerenciaCorp + '|' + c.area;
      if (!areas[key]) {
        areas[key] = {
          idKey: key, area: c.area, gerenciaCorp: c.gerenciaCorp, gerencia: c.gerencia,
          empresa: c.empresa, pais: c.pais,
          numColaboradores: 0, sueldoMensual: 0, bonoTargetAnual: 0, medicinaPrepagadaAnio: 0,
        };
      }
      const a = areas[key];
      a.numColaboradores++;
      a.sueldoMensual += c.sueldoMensual;
      a.bonoTargetAnual += c.bonoTargetAnual;
      a.medicinaPrepagadaAnio += c.medicinaPrepagadaAnio;
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
