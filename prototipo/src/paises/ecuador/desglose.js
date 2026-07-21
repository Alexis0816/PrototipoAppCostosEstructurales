export function getFilasDesglose(r) {
  return [
    { nombre: 'XIII (Déc. Tercer Sueldo)', formula: '(BonoCPMens. + Sueldo) ÷ 12',           valor: r.xiiiMensual, valorAnual: r.xiiiAnual },
    { nombre: 'SBU',                        formula: '$482 ÷ 12',                               valor: r.sbuMensual, valorAnual: r.sbuAnual },
    { nombre: 'Fondo de Reserva',           formula: '(BonoCPMens. + Sueldo) ÷ 12',           valor: r.fondoMensual, valorAnual: r.fondoAnual },
    { nombre: 'Aporte Patronal',            formula: '(BonoCPTarget + Sal.Anual) × 12.15% ÷ 12', valor: r.aportePatronalMensual, valorAnual: r.aporteAnual },
    { nombre: 'Vacaciones (15 días)',        formula: '(BonoCPTarget + Sal.Anual) × 0.5 ÷ 12', valor: r.vacacionesMensual, valorAnual: r.vacacionesAnual },
    { nombre: 'Seguro (Vida y Salud)',       formula: 'Valor anual fijo ÷ 12',                  valor: r.seguroMensual, valorAnual: r.seguro, destacado: true },
  ];
}

export function getSubtituloFormula() {
  return 'Provisiones según la matriz legal — el Costo Anual usa los valores anuales exactos';
}

export function getSlicesComposicion(r) {
  return [
    { label: 'Sueldo Mensual',   valor: r.sueldo },
    { label: 'Cargas Laborales', valor: r.carga  },
  ];
}

export function getLabelTipo(persona) {
  return { texto: persona.tipo || 'Administrativo', variante: 'blue' };
}

export function getBadgeTipoCorto(persona) {
  const tipo = (persona.tipo || '').toLowerCase();
  if (tipo.includes('operario')) return { texto: 'Operario', variante: 'gray' };
  return { texto: 'Admin.', variante: 'blue' };
}
