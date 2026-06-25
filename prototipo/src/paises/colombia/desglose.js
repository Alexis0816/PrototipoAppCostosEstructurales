// Filas del desglose, slices del gráfico y etiquetas de tipo de salario — externalizadas
// de DesglosePrestacional.jsx / ComposicionChart.jsx / IdentityCard.jsx. Mismos textos exactos.

export function getFilasDesglose(r, persona) {
  const esFijo = persona.tipoSalario === 'F';
  const filas = [];
  if (esFijo) {
    filas.push(
      { nombre: 'Prima de Servicios Mensual', formula: 'Sueldo / 12', valor: r.prima },
      { nombre: 'Prima de Vacaciones Mensual', formula: 'Sueldo / 12', valor: r.vacaciones },
      { nombre: 'Prima de Navidad Mensual', formula: '(Sueldo × 0.5) / 12', valor: r.navidad },
      { nombre: 'Cesantías Mensual', formula: 'Sueldo / 12', valor: r.cesantias },
      { nombre: 'Intereses de Cesantías Mensual', formula: '12% de Cesantías', valor: r.intereses },
      { nombre: 'Seguridad Social Base', formula: 'Sueldo × 20.5% (Aporte Patronal)', valor: r.seguridad },
    );
  }
  filas.push({
    nombre: 'Provisión Costo PAR',
    formula: esFijo ? '((Sueldo / 12) × 49.60%)' : 'Sueldo × 31.94%',
    valor: r.par,
    destacado: true,
  });
  return filas;
}

export function getSubtituloFormula(persona) {
  return persona.tipoSalario === 'F'
    ? 'Fórmula Base: Primas + Cesantías Consolidadas'
    : 'Fórmula Base: Recargo Integral de Ley';
}

export function getSlicesComposicion(r) {
  return [
    { label: 'Salario Neto', valor: r.sueldo },
    { label: 'Carga Prestacional', valor: r.carga },
    { label: 'Provisión Beneficios', valor: r.bonoMensual + r.medicina },
  ];
}

export function getLabelTipo(persona) {
  return persona.tipoSalario === 'F'
    ? { texto: 'Estructura Fija', variante: 'green' }
    : { texto: 'Estructura Integral', variante: 'purple' };
}

export function getBadgeTipoCorto(persona) {
  return persona.tipoSalario === 'F'
    ? { texto: 'Fijo', variante: 'green' }
    : { texto: 'Integral', variante: 'purple' };
}
