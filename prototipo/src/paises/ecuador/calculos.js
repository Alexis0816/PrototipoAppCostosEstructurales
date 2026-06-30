import { SBU, APORTE_PATRONAL, VACACIONES_FACTOR, TIPOS_SIN_BONO, MULTIPLICADOR_BONO } from './constants.js';

export function multiplicadorBono(grado) {
  const n = typeof grado === 'number' ? grado : parseInt(String(grado).replace(/\D/g, ''), 10);
  const regla = MULTIPLICADOR_BONO.find((r) => n >= r.min && n <= r.max);
  return regla ? regla.factor : 0;
}

export function bonoCPTargetDe(persona) {
  if (!persona || TIPOS_SIN_BONO.includes(persona.tipo)) return 0;
  return (persona.sueldoMensual || 0) * multiplicadorBono(persona.grado || 0);
}

export function calc(c, periodo) {
  const sueldoMensual = c.sueldoMensual || 0;
  const seguro        = c.seguro || 0;  // Seguro Vida y Salud — anual en USD, fijo por empleado

  const bonoCPTarget  = c.bonoCPTargetOverride !== undefined ? c.bonoCPTargetOverride : bonoCPTargetDe(c);
  const salarioAnual  = sueldoMensual * 12;
  const bonoCPMensual = Math.round(bonoCPTarget / 12); // entero para display y agregación

  // ── Componentes anuales (enteros exactos, igual que el Excel) ──
  const base           = bonoCPMensual + sueldoMensual;       // base compartida XIII y Fondo
  const xiiiAnual      = base;                                 // (SalAnual + BonoTarget) / 12 × 1
  const sbuAnual       = SBU;                                  // 482 fijo
  const fondoAnual     = base;                                 // igual que XIII
  const aporteAnual    = Math.round((bonoCPTarget + salarioAnual) * APORTE_PATRONAL);
  const vacacionesAnual = Math.round((bonoCPTarget + salarioAnual) * VACACIONES_FACTOR / 12);

  // Costo Anual exacto (suma de columnas M+O+P+Q+R+S+T+U del Excel)
  const costoAnualML  = salarioAnual + bonoCPTarget + xiiiAnual + sbuAnual + fondoAnual
                      + aporteAnual + vacacionesAnual + seguro;
  const costoAnualUSD = costoAnualML; // Ecuador es USD nativo

  // ── Provisiones mensuales como FLOATS ──
  // fmt() (USD) muestra 2 decimales, así 5950/12 = 495.83, 482/12 = 40.17, etc.
  const xiiiMensual           = xiiiAnual / 12;
  const sbuMensual            = sbuAnual / 12;
  const fondoMensual          = fondoAnual / 12;
  const aportePatronalMensual = aporteAnual / 12;
  const vacacionesMensual     = vacacionesAnual / 12;
  const seguroMensual         = seguro / 12;

  const carga             = xiiiMensual + sbuMensual + fondoMensual
                          + aportePatronalMensual + vacacionesMensual + seguroMensual;
  const costoTotalMensual = sueldoMensual + carga;

  // Proyección basada en el costo anual exacto, prorrateado por periodo.
  const proyeccion = Math.round(costoAnualML * periodo / 12);
  const pct        = sueldoMensual > 0 ? (carga / sueldoMensual) * 100 : 0;

  return {
    sueldo: sueldoMensual,
    multiplicadorBono: multiplicadorBono(c.grado || 0),
    bonoCPTarget, bonoCPMensual,
    xiiiAnual, sbuAnual, fondoAnual, aporteAnual, vacacionesAnual, seguro,
    xiiiMensual, sbuMensual, fondoMensual, aportePatronalMensual, vacacionesMensual, seguroMensual,
    carga, total: costoTotalMensual, pct,
    proyeccion, costoAnualML, costoAnualUSD,
  };
}
