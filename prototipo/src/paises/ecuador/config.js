export const config = {
  codigo: 'EC',
  nombre: 'Ecuador',
  moneda: 'USD',
  // seguro: valor anual fijo por empleado que se suma para el agregado.
  gradoEditable: true,
  camposSumables: ['sueldoMensual', 'seguro', 'comisionesMensuales', 'utilidades'],
  campoNomina: 'sueldoMensual',
  camposEditables: [
    { campo: 'sueldoMensual', label: 'Sueldo Mensual' },
    { campo: 'comisionesMensuales', label: 'Comisiones' },
    { campo: 'utilidades', label: 'Utilidades' },
  ],
  camposReadonly: [
    {
      campo: 'bonoCPTarget',
      label: 'Bono CP Target Anual',
      source: 'r',
      labelFn: (r) => `Bono CP Target Anual (${r.multiplicadorBono}x)`,
    },
    {
      campo: 'ingresoMensual',
      label: 'Ingreso Mensual',
      source: 'r',
      labelFn: (r) => `Ingreso Mensual (Sueldo ${r.sueldo} + Comisiones ${r.comisionesMensuales})`,
    },
    {
      campo: 'ingresoAnual',
      label: 'Ingreso Anual',
      source: 'r',
      labelFn: (r) => `Ingreso Anual (13×Sueldo + Bono + Utilidades + SBU)`,
    },
  ],
  opcionesTipoSalario: null,
  periodosIndividual: [1, 12],
  periodosAgregado: [1, 12],
  defaultsAgregado: {},
  textos: {
    tituloDesglose:       'Cargas Laborales Mensuales',
    tituloDesgloseAnual:  'Cargas Laborales Anuales',
    tituloTotalDesglose:  'Total Cargas Mensuales',
    tituloTotalDesgloseAnual: 'Total Cargas Anuales',
    subtituloTotalDesglose: 'XIII + SBU + Fondo Reserva + Aporte Patronal + Vacaciones + Seguro',
    tituloComposicion:    'Composición Mensual',
    kpiCarga:             'Cargas Laborales/Mes',
    kpiPct:               '% Cargas vs. Sueldo Mensual',
  },
};
