export const config = {
  codigo: 'EC',
  nombre: 'Ecuador',
  moneda: 'USD',
  // seguro: valor anual fijo por empleado que se suma para el agregado.
  gradoEditable: true,
  camposSumables: ['sueldoMensual', 'seguro', 'comisionesMensuales'],
  campoNomina: 'sueldoMensual',
  camposEditables: [
    { campo: 'sueldoMensual', label: 'Sueldo Mensual' },
    { campo: 'comisionesMensuales', label: 'Comisiones Mensuales' },
  ],
  camposReadonly: [
    { campo: 'multiplicadorBono', label: 'N° Sueldos (Bono)',       source: 'r', formato: 'numero' },
    { campo: 'bonoCPTarget',      label: 'Bono CP Target (Anual)',  source: 'r' },
    { campo: 'bonoCPMensual',     label: 'Bono CP Mensual',        source: 'r' },
    { campo: 'seguro',            label: 'Seguro Salud y Vida (Anual)', source: 'persona' },
  ],
  ocultarCostoAnual: true,
  opcionesTipoSalario: null,
  periodosIndividual: [1, 12],
  periodosAgregado: [1, 12],
  defaultsAgregado: {},
  textos: {
    tituloDesglose:       'Cargas Laborales Mensuales',
    tituloTotalDesglose:  'Total Cargas Mensuales',
    subtituloTotalDesglose: 'XIII + SBU + Fondo Reserva + Aporte Patronal + Vacaciones + Seguro',
    tituloComposicion:    'Composición Mensual',
    kpiCarga:             'Cargas Laborales/Mes',
    kpiPct:               '% Cargas vs. Sueldo Mensual',
  },
};
