// 2 colaboradores ficticios de Ecuador — solo para validar la lógica de cálculo.
// seguro: costo anual de Seguro de Vida y Salud (valor fijo por empleado, pendiente confirmar).
// Empresas: PRIMAX COMERCIAL DEL ECUADOR S.A. y ATIMASA S.A.
export const colaboradores = [
  {
    numeroId: 'EC00000001', pais: 'EC', moneda: 'USD',
    nombreCompleto: 'Fernando Esteban Castro Romero',
    gerenciaCorp: 'Operaciones', gerencia: 'Gerencia de Operaciones', area: 'Estaciones',
    puesto: 'Gerente Regional de Estaciones', grado: 'G18', gradoLabel: 'Gerente',
    tipo: 'Administrativo', sueldoMensual: 5100, seguro: 3824,
    empresa: 'PRIMAX COMERCIAL DEL ECUADOR S.A.', ciudad: 'Quito', contrato: 'Indefinido',
    avatarColor: 'linear-gradient(135deg,#8b5cf6,#6366f1)', avatarIniciales: 'FC',
  },
  {
    numeroId: 'EC00000002', pais: 'EC', moneda: 'USD',
    nombreCompleto: 'Paola Andrea Montero Suárez',
    gerenciaCorp: 'Operaciones', gerencia: 'Gerencia de Operaciones', area: 'Mantenimiento',
    puesto: 'Supervisora de Mantenimiento', grado: 'G14', gradoLabel: 'Supervisor',
    tipo: 'Administrativo', sueldoMensual: 1500, seguro: 3600,
    empresa: 'ATIMASA S.A.', ciudad: 'Guayaquil', contrato: 'Indefinido',
    avatarColor: 'linear-gradient(135deg,#10b981,#059669)', avatarIniciales: 'PM',
  },
];
