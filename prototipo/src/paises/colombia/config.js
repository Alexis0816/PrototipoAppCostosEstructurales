// Metadata declarativa de Colombia consumida genéricamente por reducer y componentes.
export const config = {
  codigo: 'CO',
  nombre: 'Colombia',
  moneda: 'COP',
  // Campos lineales que se suman al consolidar Área/Gerencia.
  camposSumables: ['sueldoMensual', 'bonoTargetAnual', 'medicinaPrepagadaAnio'],
  // Campo que representa la "Nómina" en la lista de Gerencias/Áreas.
  campoNomina: 'sueldoMensual',
  // Campos editables en la vista individual. `rescale` reproduce la regla de Colombia:
  // al cambiar el sueldo, el bono se recalcula por el ratio bono/sueldo del registro base.
  camposEditables: [
    { campo: 'sueldoMensual', label: 'Sueldo Mensual', rescale: { campoDependiente: 'bonoTargetAnual', tipo: 'ratio' } },
    { campo: 'bonoTargetAnual', label: 'Bono Target Anual' },
  ],
  // Campos de solo lectura mostrados junto a los editables. source: 'r' (resultado calc) | 'persona'.
  camposReadonly: [
    { campo: 'bonoMensual', label: 'Bono Mensual Equiv.', source: 'r' },
  ],
  // Toggle Fijo/Integral del selector. null ⇒ no se renderiza ese control.
  opcionesTipoSalario: [
    { value: 'F', label: 'Fijo' },
    { value: 'I', label: 'Integral' },
  ],
  periodosIndividual: [6, 12, 24],
  periodosAgregado: [6, 12],
  // Campos extra inyectados en el registro sintético de Área/Gerencia (Colombia: fuerza tipo Fijo).
  defaultsAgregado: { tipoSalario: 'F' },
  textos: {
    tituloDesglose: 'Desglose Prestacional Mensual',
    tituloTotalDesglose: 'Total Carga Prestacional Mensual',
    subtituloTotalDesglose: 'Factor consolidado aplicado según matriz prestacional legal',
    tituloComposicion: 'Composición Mensual',
    kpiCarga: 'Carga Prestacional/Mes',
    kpiPct: '% Carga vs. Salario',
  },
};
