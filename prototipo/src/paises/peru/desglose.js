export function getFilasDesglose(r) {
  // Bono CP Mensual (r.bonoCPMensual) se omite a propósito por ahora — no se muestra en el
  // desglose, aunque el cálculo lo sigue produciendo. Si se vuelve a pedir, es una fila
  // informativa (no cuenta para el total): { nombre: 'Bono CP Mensual', formula: '(BonoCPTarget + CargaBono) ÷ 12', valor: r.bonoCPMensual ?? 0, informativo: true }.
  return [
    { nombre: 'Gratificaciones', formula: 'Rem. Base × 18.17%', valor: r.gratificaciones },
    { nombre: 'CTS', formula: 'Rem. Base × 9.72%', valor: r.cts },
    { nombre: 'EsSalud', formula: 'Rem. Base × 9.00%', valor: r.esSalud },
    { nombre: 'Seguro Vida Ley', formula: 'Rem. Base × 0.19%', valor: r.seguroVidaLey },
    { nombre: 'Costo de Vales', formula: 'Vales × 1.00%', valor: r.costoDeVales ?? 0, destacado: true },
  ];
}

export function getSubtituloFormula() {
  return 'Fórmula Base: Aportes sobre Remuneración Base';
}

export function getSlicesComposicion(r) {
  // Suman exactamente r.total (= ingresosTotales + carga + costo de vales), para que los % cierren en 100%.
  return [
    { label: 'Ingresos Totales', valor: r.ingresosTotales },
    { label: 'Cargas Sociales', valor: r.carga },
    { label: 'Costo de Vales', valor: r.costoDeVales ?? 0 },
  ];
}

export function getLabelTipo(persona) {
  const esAdmin = (persona.tipo || '').startsWith('Administrativo');
  return { texto: persona.tipo, variante: esAdmin ? 'blue' : 'gray' };
}

export function getBadgeTipoCorto(persona) {
  const esAdmin = (persona.tipo || '').startsWith('Administrativo');
  return { texto: esAdmin ? 'Admin.' : 'Operario', variante: esAdmin ? 'blue' : 'gray' };
}
