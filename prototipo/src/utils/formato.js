import { convertir } from './fx.js';

// monedaDestino: la moneda en que se MUESTRA (selector COP/USD/PEN).
// monedaOrigen: la moneda nativa en que está expresado `valor` (la del país activo).
// monedaOrigen default 'COP' por retrocompatibilidad: cualquier call-site sin actualizar
// sigue comportándose exactamente como antes (Colombia, origen COP).
export function fmt(valor, monedaDestino, monedaOrigen = 'COP') {
  const v = convertir(valor, monedaOrigen, monedaDestino);
  if (monedaDestino === 'USD') {
    return '$ ' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (monedaDestino === 'PEN') {
    return 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$ ' + v.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function pct(valor) {
  return valor.toFixed(1) + '%';
}

export function parseInp(valorStr) {
  const raw = String(valorStr ?? '').trim();
  if (!raw) return 0;

  const normalized = raw
    .replace(/\s/g, '')
    .replace(/[^0-9,.-]/g, '');

  if (normalized.includes(',') && normalized.includes('.')) {
    return parseFloat(normalized.replace(/,/g, '')) || 0;
  }

  if (normalized.includes(',') && !normalized.includes('.')) {
    return parseFloat(normalized.replace(/,/g, '.')) || 0;
  }

  return parseFloat(normalized) || 0;
}
