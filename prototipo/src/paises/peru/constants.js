// Tasas de cargas sociales de Perú.
// GRATIFICACIONES: incluye la bonificación extraordinaria del 9% (Ley 29351).
//   = 2 sueldos × 1.09 / 12 meses ≈ 18.17% de la Rem. Base.
// CTS: NO usa una tasa fija — se calcula como (Rem.Base + SueldoBase/6) / 12
//   porque la parte proporcional de gratificación que entra a CTS se mide solo
//   sobre SueldoBase (sin Asignación Familiar). Ver calculos.js.
export const GRATIFICACIONES = 0.1817;
export const ES_SALUD = 0.09;
export const SEGURO_VIDA_LEY = 0.0019;

// Carga laboral sobre el Bono de Corto Plazo (anual).
export const BONO_CP_FACTOR = 0.1386;

// Tipo de cambio interno de reporte de Perú (PEN→USD).
export const TIPO_CAMBIO_PEN = 3.5;

// Tipos que NO reciben bono (operativos: vendedores, patio, etc.).
export const TIPOS_SIN_BONO = ['Operario', 'Operario Part-Time'];

// Bono Target por grado: número de sueldos según la banda del grado.
// (El "máximo" = 2× el target NO se modela; solo el Target, confirmado por el usuario.)
export const MULTIPLICADOR_BONO = [
  { min: 9, max: 15, factor: 1 },
  { min: 16, max: 17, factor: 1.5 },
  { min: 18, max: 19, factor: 2 },
  { min: 20, max: 21, factor: 3 },
];
