// Tabla de cambio de la cáscara de la app: cuántas unidades de cada moneda equivalen a 1 USD.
// Se usa SOLO para la conversión de presentación (el selector COP/USD/PEN), pivotando por USD.
// No confundir con tasas internas de cálculo de cada país (ej. Perú reporta su costoAnualUSD
// con su propio TIPO_CAMBIO_PEN, que coincide con PEN aquí: 3.50).
export const RATE_PER_USD = { COP: 3950, PEN: 3.5, USD: 1 };

export function convertir(valor, monedaOrigen, monedaDestino) {
  if (monedaOrigen === monedaDestino) return valor;
  const enUsd = valor / RATE_PER_USD[monedaOrigen];
  return enUsd * RATE_PER_USD[monedaDestino];
}
