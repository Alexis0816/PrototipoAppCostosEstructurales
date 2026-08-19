export const config = {
  codigo: 'PE',
  nombre: 'Perú',
  moneda: 'PEN',
  camposSumables: ['sueldoBase', 'vales', 'comisionesMensuales', 'utilidades'],
  campoNomina: 'sueldoBase',
  gradoEditable: true,
  camposEditables: [
    { campo: 'sueldoBase', label: 'Sueldo Básico Mensual' },
    { campo: 'vales', label: 'Vales' },
    { campo: 'comisionesMensuales', label: 'Comisiones Mensuales' },
    { campo: 'utilidades', label: 'Utilidades' },
  ],
  // Bono CP Target se deriva del grado. Ingreso = Mensual (sueldo+vales+comis) / Anual (bono+utilidades).
  camposReadonly: [
    {
      campo: 'bonoCPTarget',
      label: 'Bono CP Target',
      source: 'r',
      periodoReactivo: 'anual',
      labelFn: (r, esMensual) => `Bono CP Target (${esMensual ? 'Mensual' : 'Anual'}) (${r.multiplicadorBono}x)`,
    },
    {
      campo: 'ingreso',
      label: 'Ingreso',
      source: 'r',
      periodoReactivo: 'toggle',
      labelFn: (r, esMensual) => `Ingreso (${esMensual ? 'Mensual' : 'Anual'})`,
    },
  ],
  // Perú no tiene toggle Fijo/Integral: el `tipo` (Operario/Administrativo) es fijo por persona.
  opcionesTipoSalario: null,
  periodosIndividual: [1, 12],
  periodosAgregado: [1, 12],
  defaultsAgregado: {},
  textos: {
    tituloDesglose: 'Desglose de Cargas Sociales Mensual',
    tituloDesgloseAnual: 'Desglose de Cargas Sociales Anual',
    tituloTotalDesglose: 'Total Cargas Sociales Mensual',
    tituloTotalDesgloseAnual: 'Total Cargas Sociales Anual',
    subtituloTotalDesglose: 'Gratificaciones + CTS + EsSalud + Seguro Vida Ley + Costo de Vales',
    tituloComposicion: 'Composición Mensual',
    kpiCarga: 'Cargas Sociales/Mes',
    kpiPct: '% Cargas vs. Sueldo Base',
  },
};
