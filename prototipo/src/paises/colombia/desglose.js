export function getFilasDesglose(r) {
  return [
    { nombre: 'Prima de Vacaciones',           formula: 'Sueldo ÷ 12',                          valor: r.primaVacacionesMensual },
    { nombre: 'Prima de Navidad',              formula: '(Sueldo × 0.5) ÷ 12',                  valor: r.primaNavidadMensual    },
    { nombre: 'Prima de Servicios',            formula: '(Sal.Anual + P.Vacaciones + Nav + Bono) ÷ 12', valor: r.primaServiciosMensual  },
    { nombre: 'Cesantías',                     formula: '(Sal.Anual + P.Vacaciones + Nav + Bono) ÷ 12', valor: r.cesantiasMensual       },
    { nombre: 'I. Cesantías',                  formula: 'Cesantías × 12% ÷ 12',                 valor: r.iCesantiasMensual      },
    { nombre: 'Aportes y Obligaciones Primas', formula: 'Base × 31.936% ÷ 12',                  valor: r.aportesPrimasMensual, destacado: true },
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

export function getLabelTipo() {
  return { texto: 'Estructura Fija', variante: 'green' };
}

export function getBadgeTipoCorto() {
  return { texto: 'Fijo', variante: 'green' };
}
