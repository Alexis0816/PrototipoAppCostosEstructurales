import { RECARGO_FIJO, RECARGO_INTEGRAL } from './constants.js';
import { RATE_PER_USD } from '../../utils/fx.js';

export function bonoTargetDe(c) {
  return (c.nSueldos || 0) * (c.sueldoMensual || 0);
}

export function calc(c, periodo) {
  const s    = c.sueldoMensual        || 0;
  const ns   = c.nSueldos             || 0;
  const med  = c.medicinaPrepagadaAnio || 0;
  const tipo = c.tipoSalario           || 'F';

  // ── Componentes anuales ──────────────────────────────────────────────────
  const salarioAnual    = s * 12;
  const primaVacaciones = s * 1;       // 1 sueldo mensual, pagado anualmente
  const primaNavidad    = s * 0.5;     // 0.5 sueldos, pagado en diciembre
  // Para vistas agregadas (Gerencia/Área), el bono se inyecta ya sumado por persona.
  const bonoTarget = c.bonoTargetOverride !== undefined
    ? c.bonoTargetOverride
    : ns * s;

  // Base compartida: Primas, Cesantías y Aportes usan la misma base
  const base = salarioAnual + primaVacaciones + primaNavidad + bonoTarget;

  const primaServicios = base / 12;
  const cesantias      = base / 12;    // igual que Prima de Servicios
  const iCesantias     = cesantias * 0.12;

  // F = 49.60%, I = 31.936% — única diferencia entre Fijo e Integral
  const parRate       = tipo === 'F' ? RECARGO_FIJO : RECARGO_INTEGRAL;
  const aportesPrimas = base * parRate;

  // ── Costo Anual ─────────────────────────────────────────────────────────
  // Mismo componentes para F e I; solo cambia el parRate.
  const costoAnualML =
    salarioAnual + primaVacaciones + primaNavidad + primaServicios
    + cesantias + iCesantias + med + bonoTarget + aportesPrimas;

  const costoAnualUSD     = Math.round(costoAnualML / RATE_PER_USD.COP);
  const costoTotalMensual = costoAnualML / 12;

  // ── Carga mensual (para KPI y % vs sueldo) ──────────────────────────────
  const cargaAnual =
    primaVacaciones + primaNavidad + primaServicios + cesantias + iCesantias + aportesPrimas;
  const carga = cargaAnual / 12;

  const pct        = s > 0 ? (carga / s) * 100 : 0;
  const proyeccion = costoTotalMensual * periodo;

  return {
    sueldo: s, salarioAnual,
    primaVacaciones, primaNavidad,
    primaServicios, cesantias, iCesantias,
    medicinaPrepagadaAnio: med,
    nSueldos: ns, bonoTarget,
    aportesPrimas, parRate,
    // Provisiones mensuales para el desglose (cada componente anual ÷ 12)
    primaVacacionesMensual: primaVacaciones / 12,
    primaNavidadMensual:    primaNavidad    / 12,
    primaServiciosMensual:  primaServicios  / 12,
    cesantiasMensual:       cesantias       / 12,
    iCesantiasMensual:      iCesantias      / 12,
    medicinaMensual:        med             / 12,
    bonoMensual:            bonoTarget      / 12,
    aportesPrimasMensual:   aportesPrimas   / 12,
    carga,
    total: costoTotalMensual,
    pct,
    proyeccion,
    costoAnualML,
    costoAnualUSD,
  };
}
