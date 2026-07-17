// 2 colaboradores ficticios de Perú — solo para validar la lógica de cálculo.
// asignacionFamiliar fija S/113. tipo define elegibilidad de bono.
export const colaboradores = [
  {
    numeroId: 'PE00000001', pais: 'PE', moneda: 'PEN',
    nombreCompleto: 'Ana Lucía Villanueva Ríos',
    gerenciaCorp: 'GERENCIA DE NEGOCIOS PERU', gerencia: 'Gerencia de Negocios Perú', area: 'Minería',
    puesto: 'Gerente Minería', grado: 'G19', gradoLabel: 'Gerente',
    tipo: 'Administrativo', sueldoBase: 19510, vales: 2000, comisionesMensuales: 0, asignacionFamiliar: 113,
    empresa: 'CORPORACION PRIMAX S.A.', ciudad: 'Lima',
    avatarColor: 'linear-gradient(135deg,#8b5cf6,#6366f1)', avatarIniciales: 'AV',
  },
  {
    numeroId: 'PE00000002', pais: 'PE', moneda: 'PEN',
    nombreCompleto: 'Miguel Ángel Torres Ccasa',
    gerenciaCorp: 'Operaciones', gerencia: 'Gerencia de Operaciones', area: 'Mantenimiento',
    puesto: 'Operador de Estación', grado: 'G9', gradoLabel: 'Operador',
    tipo: 'Operario', sueldoBase: 1025, vales: 200, comisionesMensuales: 0, asignacionFamiliar: 113,
    empresa: 'CORPORACION PRIMAX S.A.', ciudad: 'Arequipa',
    avatarColor: 'linear-gradient(135deg,#f97316,#ea580c)', avatarIniciales: 'MT',
  },
];
