import { TASA_USD, TASA_PEN } from './constants.js';

export function fmt(valor, moneda) {
  if (moneda === 'USD') {
    return '$ ' + (valor / TASA_USD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (moneda === 'PEN') {
    return 'S/ ' + (valor / TASA_PEN).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$ ' + valor.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function pct(valor) {
  return valor.toFixed(1) + '%';
}

export function parseInp(valorStr) {
  return parseFloat(valorStr.replace(/[^0-9]/g, '')) || 0;
}
