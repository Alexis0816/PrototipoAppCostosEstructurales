import { resolverColaborador } from './resolverColaborador.js';

// Suma los campos declarados por el país activo en el acumulador del grupo, más el costo
// anual de cada persona. El costo se calcula individualmente (sin override de bono, cada
// quien con su propio grado) y se suma ya resuelto — a diferencia de la vista de detalle
// consolidado (appReducer.js), aquí no hace falta recalcular el bono sobre un sueldo
// agregado, solo sumar totales que cada calc() ya dejó correctos.
function acumular(grupo, c, camposSumables, costoAnualML) {
  grupo.numColaboradores++;
  camposSumables.forEach((campo) => { grupo[campo] += c[campo] || 0; });
  grupo.costoAnualML += costoAnualML;
}

function nuevoAcumulador(camposSumables, base) {
  const g = { ...base, numColaboradores: 0, costoAnualML: 0 };
  camposSumables.forEach((campo) => { g[campo] = 0; });
  return g;
}

export function obtenerDatosAgrupadosGerencias(data, cacheEdiciones, paisActual) {
  const gerencias = {};
  data.forEach((colab) => {
    const c = resolverColaborador(colab, cacheEdiciones);
    const costoAnualML = paisActual.calc(c, 1).costoAnualML;
    const key = c.pais + '|' + c.gerenciaCorp;
    if (!gerencias[key]) {
      gerencias[key] = nuevoAcumulador(paisActual.camposSumables, {
        idKey: c.gerenciaCorp, nombre: c.gerencia, gerenciaCorp: c.gerenciaCorp,
        empresa: c.empresa, pais: c.pais,
      });
    }
    acumular(gerencias[key], c, paisActual.camposSumables, costoAnualML);
  });
  return Object.values(gerencias);
}

export function obtenerDatosAgrupadosAreas(data, cacheEdiciones, paisActual, gerenciaCorpKey) {
  const areas = {};
  data
    .filter((c) => c.gerenciaCorp === gerenciaCorpKey)
    .forEach((colab) => {
      const c = resolverColaborador(colab, cacheEdiciones);
      const costoAnualML = paisActual.calc(c, 1).costoAnualML;
      const key = c.pais + '|' + c.gerenciaCorp + '|' + c.area;
      if (!areas[key]) {
        areas[key] = nuevoAcumulador(paisActual.camposSumables, {
          idKey: key, area: c.area, gerenciaCorp: c.gerenciaCorp, gerencia: c.gerencia,
          empresa: c.empresa, pais: c.pais,
        });
      }
      acumular(areas[key], c, paisActual.camposSumables, costoAnualML);
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
