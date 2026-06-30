// Parámetros de cargas laborales de Ecuador (USD local, sin conversión).
export const SBU             = 482;    // Salario Básico Unificado anual
export const APORTE_PATRONAL = 0.1215; // 12.15% sobre (BonoCPTarget + SalarioAnual)
export const VACACIONES_FACTOR = 0.5;  // 15 días = 0.5 meses

// Ecuador: todos los grados reciben bono; no hay tipos excluidos por defecto.
export const TIPOS_SIN_BONO = [];

// Multiplicador de bono por grado — confirmado por tabla Excel del usuario.
// Grado máximo en Ecuador es 20 (no 21 como en Perú).
export const MULTIPLICADOR_BONO = [
  { min: 9,  max: 15, factor: 1   },
  { min: 16, max: 17, factor: 1.5 },
  { min: 18, max: 19, factor: 2   },
  { min: 20, max: 20, factor: 3   },
];
