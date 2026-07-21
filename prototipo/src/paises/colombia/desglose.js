export function getFilasDesglose(r) {
  return [
    { nombre: 'Prima de Vacaciones',           formula: 'Sueldo ÷ 12',                          valor: r.primaVacacionesMensual, valorAnual: r.primaVacaciones },
    { nombre: 'Prima de Navidad',              formula: '(Sueldo × 0.5) ÷ 12',                  valor: r.primaNavidadMensual,    valorAnual: r.primaNavidad    },
    { nombre: 'Prima de Servicios',            formula: '(Sal.Anual + P.Vacaciones + Nav + Bono) ÷ 12', valor: r.primaServiciosMensual, valorAnual: r.primaServicios },
    { nombre: 'Cesantías',                     formula: '(Sal.Anual + P.Vacaciones + Nav + Bono) ÷ 12', valor: r.cesantiasMensual,      valorAnual: r.cesantias      },
    { nombre: 'I. Cesantías',                  formula: 'Cesantías × 12% ÷ 12',                 valor: r.iCesantiasMensual,      valorAnual: r.iCesantias      },
    { nombre: 'Aportes y Obligaciones Primas', formula: 'Base × 31.936% ÷ 12',                  valor: r.aportesPrimasMensual, valorAnual: r.aportesPrimas, destacado: true },
  ];
}

export function getSubtituloFormula() {
  return 'Aportes 31.936% sobre base ampliada (Sal.Anual + Vac + Nav + Bono)';
}

export function getSlicesComposicion(r) {
  return [
    { label: 'Salario Neto',       valor: r.sueldo                          },
    { label: 'Carga Prestacional', valor: r.carga                           },
    { label: 'Beneficios',         valor: r.bonoMensual + r.medicinaMensual },
  ];
}

export function getLabelTipo(persona) {
  const esIntegral = persona.tipo === 'Integral';
  return esIntegral
    ? { texto: 'Salario Integral', variante: 'blue' }
    : { texto: 'Salario Fijo', variante: 'green' };
}

export function getBadgeTipoCorto(persona) {
  const esIntegral = persona.tipo === 'Integral';
  return esIntegral
    ? { texto: 'Integral', variante: 'blue' }
    : { texto: 'Fijo', variante: 'green' };
}
