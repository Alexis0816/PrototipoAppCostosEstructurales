export function getFilasDesglose(r) {
  return [
    { nombre: 'XIII (Déc. Tercer Sueldo)', formula: '(BonoCPMens. + Sueldo) ÷ 12',           valor: r.xiiiMensual },
    { nombre: 'SBU',                        formula: '$482 ÷ 12',                               valor: r.sbuMensual },
    { nombre: 'Fondo de Reserva',           formula: '(BonoCPMens. + Sueldo) ÷ 12',           valor: r.fondoMensual },
    { nombre: 'Aporte Patronal',            formula: '(BonoCPTarget + Sal.Anual) × 12.15% ÷ 12', valor: r.aportePatronalMensual },
    { nombre: 'Vacaciones (15 días)',        formula: '(BonoCPTarget + Sal.Anual) × 0.5 ÷ 12', valor: r.vacacionesMensual },
    { nombre: 'Seguro (Vida y Salud)',       formula: 'Valor anual fijo ÷ 12',                  valor: r.seguroMensual, destacado: true },
  ];
}

export function getSubtituloFormula() {
  return 'Provisiones mensuales — el Costo Anual usa los valores anuales exactos';
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
