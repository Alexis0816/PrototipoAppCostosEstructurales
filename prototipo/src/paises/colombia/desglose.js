export function getFilasDesglose(r, persona) {
  const pctLabel = persona.tipoSalario === 'F' ? '49.60%' : '31.936%';
  return [
    { nombre: 'Prima de Vacaciones',          formula: 'Sueldo ÷ 12',                            valor: r.primaVacacionesMensual },
    { nombre: 'Prima de Navidad',             formula: '(Sueldo × 0.5) ÷ 12',                    valor: r.primaNavidadMensual    },
    { nombre: 'Prima de Servicios',           formula: '(Sal.Anual + Vac + Nav + Bono) ÷ 144',   valor: r.primaServiciosMensual  },
    { nombre: 'Cesantías',                    formula: '(Sal.Anual + Vac + Nav + Bono) ÷ 144',   valor: r.cesantiasMensual       },
    { nombre: 'I. Cesantías',                 formula: 'Cesantías × 12% ÷ 12',                   valor: r.iCesantiasMensual      },
    { nombre: 'Aportes y Obligaciones Primas', formula: `Base × ${pctLabel} ÷ 12`,               valor: r.aportesPrimasMensual, destacado: true },
  ];
}

export function getSubtituloFormula(persona) {
  return persona.tipoSalario === 'F'
    ? 'Estructura Fija — Aportes 49.60% sobre base ampliada'
    : 'Estructura Integral — Aportes 31.936% sobre base ampliada';
}

export function getSlicesComposicion(r) {
  return [
    { label: 'Salario Neto',       valor: r.sueldo                        },
    { label: 'Carga Prestacional', valor: r.carga                         },
    { label: 'Beneficios',         valor: r.bonoMensual + r.medicinaMensual },
  ];
}

export function getLabelTipo(persona) {
  return persona.tipoSalario === 'F'
    ? { texto: 'Estructura Fija',     variante: 'green'  }
    : { texto: 'Estructura Integral', variante: 'purple' };
}

export function getBadgeTipoCorto(persona) {
  return persona.tipoSalario === 'F'
    ? { texto: 'Fijo',     variante: 'green'  }
    : { texto: 'Integral', variante: 'purple' };
}
