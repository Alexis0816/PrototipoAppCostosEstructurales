import {
  GRATIFICACIONES, ES_SALUD, SEGURO_VIDA_LEY,
  BONO_CP_FACTOR, TIPO_CAMBIO_PEN, TIPOS_SIN_BONO, MULTIPLICADOR_BONO,
} from './constants.js';

// NÃºmero de sueldos de bono segÃºn el grado. Acepta grado numÃ©rico o 'G18'.
export function multiplicadorBono(grado) {
  const n = typeof grado === 'number' ? grado : parseInt(String(grado).replace(/\D/g, ''), 10);
  const regla = MULTIPLICADOR_BONO.find((r) => n >= r.min && n <= r.max);
  return regla ? regla.factor : 0;
}

// Bono Target de una persona: sueldoBase Ã— multiplicador(grado), 0 si es operativo.
export function bonoCPTargetDe(persona) {
  if (!persona || TIPOS_SIN_BONO.includes(persona.tipo)) return 0;
  const sueldoBase = persona.sueldoBase || 0;
  const grado = persona.grado || 0;
  return sueldoBase * multiplicadorBono(grado);
}

export function calc(c, periodo) {
  // --- Defensive Coding: Ensure all required properties exist to prevent crashes ---
  const sueldoBase = c.sueldoBase || 0;
  const vales = c.vales || 0;
  const comisionesMensuales = c.comisionesMensuales || 0;
  const asignacionFamiliar = c.asignacionFamiliar || 0;

  const remuneracionBase = sueldoBase + comisionesMensuales + asignacionFamiliar;

  // Cada concepto se redondea al sol entero para que el desglose muestre enteros
  // y la suma de las filas coincida exactamente con el total mostrado.
  const gratificaciones   = Math.round(remuneracionBase * GRATIFICACIONES);
  // CTS: remBase Ã— 7/72 (DL 650). Se trunca al entero inferior â€” igual que Excel con INT().
  const cts               = Math.trunc(remuneracionBase * 7 / 72);
  const esSalud           = Math.round(remuneracionBase * ES_SALUD);
  const seguroVidaLey     = Math.round(remuneracionBase * SEGURO_VIDA_LEY);
  const costoDeVales      = Math.round(vales * 0.01);

  const ingresosTotales = sueldoBase + vales + comisionesMensuales + asignacionFamiliar;
  const carga           = gratificaciones + cts + esSalud + seguroVidaLey + costoDeVales;

  // El total mensual para mostrar en KPI se calcula como Math.trunc del float exacto,
  // igual que Excel muestra la celda con 0 decimales usando el valor interno de cada fÃ³rmula.
  // Esto replica el comportamiento del Excel: el float interno da 28,919.6445 â†’ trunc = 28,919.
  const cargaFloat           = remuneracionBase * GRATIFICACIONES
                             + remuneracionBase * 7 / 72
                             + remuneracionBase * ES_SALUD
                             + remuneracionBase * SEGURO_VIDA_LEY;
  const costoTotalMensualFloat = ingresosTotales + cargaFloat + vales * 0.01;
  const costoTotalMensual      = Math.trunc(costoTotalMensualFloat);

  // En vistas agregadas el bono llega pre-sumado por persona (override); en individual se deriva del grado.
  const bonoCPTarget       = c.bonoCPTargetOverride !== undefined ? c.bonoCPTargetOverride : bonoCPTargetDe(c);
  const costoLaboralBonoCP = Math.round(bonoCPTarget * BONO_CP_FACTOR);
  const bonoCPMensual      = Math.round((bonoCPTarget + costoLaboralBonoCP) / 12);

  // ProyecciÃ³n usa el float exacto (igual que Excel usa el valor de celda, no el display).
  // (bonoCPMensual + costoTotalMensualFloat) Ã— periodo â†’ Math.trunc al final.
  const proyeccion   = Math.trunc((bonoCPMensual + costoTotalMensualFloat) * periodo);
  const costoAnualML = Math.trunc((bonoCPMensual + costoTotalMensualFloat) * 12);
  const costoAnualUSD = Math.round(costoAnualML / TIPO_CAMBIO_PEN);
  const pct = sueldoBase > 0 ? (carga / sueldoBase) * 100 : 0;

  return {
    sueldo: sueldoBase, vales, comisionesMensuales, remuneracionBase, ingresosTotales, costoDeVales,
    gratificaciones, cts, esSalud, seguroVidaLey,
    multiplicadorBono: multiplicadorBono(c.grado || 0), bonoCPTarget, bonoCPMensual, costoLaboralBonoCP,
    carga, total: costoTotalMensual, pct, proyeccion, costoAnualML, costoAnualUSD,
  };
}
