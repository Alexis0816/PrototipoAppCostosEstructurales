export const config = {
  codigo: 'CO',
  nombre: 'Colombia',
  moneda: 'COP',
  gradoEditable: true,
  camposSumables: ['sueldoMensual', 'medicinaPrepagadaAnio'],
  campoNomina: 'sueldoMensual',
  camposEditables: [
    { campo: 'sueldoMensual', label: 'Sueldo Mensual'      },
    { campo: 'nSueldos',      label: 'N° Sueldos (Bono)',  tipo: 'decimal' },
  ],
  camposReadonly: [
    { campo: 'bonoTarget', label: 'Bono Target', source: 'r' },
  ],
  opcionesTipoSalario: null,
  periodosIndividual: [1, 12],
  periodosAgregado:   [1, 12],
  defaultsAgregado:   {},
  textos: {
    tituloDesglose:         'Desglose Prestacional Mensual',
    tituloTotalDesglose:    'Total Carga Prestacional Mensual',
    subtituloTotalDesglose: 'Factor consolidado aplicado según matriz prestacional legal',
    tituloComposicion:      'Composición Mensual',
    kpiCarga:               'Carga Prestacional/Mes',
    kpiPct:                 '% Carga vs. Salario',
  },
};
