import {
  GRATIFICACIONES, CTS, ES_SALUD, SEGURO_VIDA_LEY,
  BONO_CP_FACTOR, TIPO_CAMBIO_PEN, TIPOS_SIN_BONO, MULTIPLICADOR_BONO,
} from './constants.js';

// Número de sueldos de bono según el grado. Acepta grado numérico o 'G18'.
export function multiplicadorBono(grado) {
  const n = typeof grado === 'number' ? grado : parseInt(String(grado).replace(/\D/g, ''), 10);
  const regla = MULTIPLICADOR_BONO.find((r) => n >= r.min && n <= r.max);
  return regla ? regla.factor : 0;
}

// Bono Target de una persona: sueldoBase × multiplicador(grado), 0 si es operativo.
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
  const gratificaciones = remuneracionBase * GRATIFICACIONES;
  const cts = remuneracionBase * CTS;
  const esSalud = remuneracionBase * ES_SALUD;
  const seguroVidaLey = remuneracionBase * SEGURO_VIDA_LEY;
  const ingresosTotales = sueldoBase + vales + comisionesMensuales + asignacionFamiliar;
  const costoDeVales = vales * 0.01;
  const carga = gratificaciones + cts + esSalud + seguroVidaLey;
  const costoTotalMensual = ingresosTotales + carga + costoDeVales;

  // En vistas agregadas el bono llega pre-sumado por persona (override); en individual se deriva del grado.
  const bonoCPTarget = c.bonoCPTargetOverride !== undefined ? c.bonoCPTargetOverride : bonoCPTargetDe(c);
  const costoLaboralBonoCP = bonoCPTarget * BONO_CP_FACTOR;

  const costoAnualML = costoTotalMensual * 12 + bonoCPTarget * (1 + BONO_CP_FACTOR);
  const costoAnualUSD = costoAnualML / TIPO_CAMBIO_PEN;
  // Proyección incluye el bono prorrateado: a 12M es exactamente el costo anual en moneda local.
  const proyeccion = costoTotalMensual * periodo + bonoCPTarget * (1 + BONO_CP_FACTOR) * (periodo / 12);
  const pct = sueldoBase > 0 ? (carga / sueldoBase) * 100 : 0;

  return {
    sueldo: sueldoBase, vales, remuneracionBase, ingresosTotales, costoDeVales,
    gratificaciones, cts, esSalud, seguroVidaLey,
    multiplicadorBono: multiplicadorBono(c.grado || 0), bonoCPTarget, bonoMensual: bonoCPTarget / 12, costoLaboralBonoCP,
    carga, total: costoTotalMensual, pct, proyeccion, costoAnualML, costoAnualUSD,
  };
}
