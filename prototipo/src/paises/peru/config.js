export const config = {
  codigo: 'PE',
  nombre: 'Perú',
  moneda: 'PEN',
  camposSumables: ['sueldoBase', 'vales', 'comisionesMensuales', 'asignacionFamiliar'],
  campoNomina: 'sueldoBase',
  camposEditables: [
    { campo: 'sueldoBase', label: 'Sueldo Base' },
    { campo: 'comisionesMensuales', label: 'Comisiones Mensuales' },
  ],
  // Asignación Familiar es fija (S/113, no editable); Bono CP Target se deriva del grado.
  camposReadonly: [
    { campo: 'asignacionFamiliar', label: 'Asignación Familiar', source: 'persona' },
    { campo: 'multiplicadorBono', label: 'Cantidad Sueldos (Bono)', source: 'r' },
    { campo: 'bonoCPTarget', label: 'Bono CP Target (Anual)', source: 'r' },
  ],
  // Perú no tiene toggle Fijo/Integral: el `tipo` (Operario/Administrativo) es fijo por persona.
  opcionesTipoSalario: null,
  periodosIndividual: [6, 12, 24],
  periodosAgregado: [6, 12],
  defaultsAgregado: {},
  textos: {
    tituloDesglose: 'Desglose de Cargas Sociales Mensual',
    tituloTotalDesglose: 'Total Cargas Sociales Mensual',
    subtituloTotalDesglose: 'Gratificaciones + CTS + EsSalud + Seguro Vida Ley',
    tituloComposicion: 'Composición Mensual',
    kpiCarga: 'Cargas Sociales/Mes',
    kpiPct: '% Cargas vs. Sueldo Base',
  },
};
