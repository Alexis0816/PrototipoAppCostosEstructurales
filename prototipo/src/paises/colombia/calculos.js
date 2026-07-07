import { RECARGO_PAR } from './constants.js';
import { RATE_PER_USD } from '../../utils/fx.js';

export function bonoTargetDe(c) {
  return (c.nSueldos || 0) * (c.sueldoMensual || 0);
}

export function calc(c, periodo) {
  const s   = c.sueldoMensual         || 0;
  const ns  = c.nSueldos              || 0;
  const med = c.medicinaPrepagadaAnio || 0;
  const esIntegral = (c.tipo === 'Integral' || c.tipoSueldo === 'Integral');

  // ── Componentes anuales ──────────────────────────────────────────────────
  const salarioAnual    = s * 12;
  // Integral: PrimaVac y PrimaNav = 0 (absorbidas en el sueldo integral)
  const primaVacaciones = esIntegral ? 0 : s * 1;
  const primaNavidad    = esIntegral ? 0 : s * 0.5;
  // Para vistas agregadas (Gerencia/Área), el bono se inyecta ya sumado por persona.
  const bonoTarget = c.bonoTargetOverride !== undefined
    ? c.bonoTargetOverride
    : ns * s;

  // Base Fijo = SalAnual + PrimaVac + PrimaNav + Bono
  // Base Integral = SalAnual + Bono  (sin primas, son parte del sueldo)
  const base = salarioAnual + primaVacaciones + primaNavidad + bonoTarget;

  // Integral: PrimaServ, Cesantías, ICesantías = 0 (incluidas en el salario integral)
  const primaServicios = esIntegral ? 0 : base / 12;
  const cesantias      = esIntegral ? 0 : base / 12;
  const iCesantias     = esIntegral ? 0 : cesantias * 0.12;

  const parRate       = RECARGO_PAR;
  const aportesPrimas = base * parRate;

  // ── Costo Anual ─────────────────────────────────────────────────────────
  // Fijo:     SalAnual + PrimaVac + PrimaNav + PrimaServ + Ces + ICes + Med + Bono + Aportes
  // Integral: SalAnual + Med + Bono + (SalAnual + Bono) × PAR
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
