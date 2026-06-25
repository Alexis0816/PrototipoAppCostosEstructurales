import { RECARGO_FIJO, RECARGO_INTEGRAL } from './constants.js';

// Cálculo de costo estructural de Colombia. Portado byte-a-byte del lib/calculos.js original.
export function calc(c, periodo) {
  const s = c.sueldoMensual;
  const ba = c.bonoTargetAnual;
  const bm = ba / 12;
  const mm = c.medicinaPrepagadaAnio / 12;
  let p = 0, v = 0, n = 0, ce = 0, ic = 0, par = 0, ss = 0;

  if (c.tipoSalario === 'F') {
    p = s / 12;
    v = s / 12;
    n = (s * 0.5) / 12;
    ce = s / 12;
    ic = ce * 0.12;
    ss = s * 0.205;
    par = s * RECARGO_FIJO;
  } else {
    par = s * RECARGO_INTEGRAL;
  }

  const cp = p + v + n + ce + ic + ss + par;
  const ct = s + bm + mm + cp;
  const ps = s > 0 ? ((ct - s - bm - mm) / s) * 100 : 0;
  const py = ct * periodo;

  return {
    sueldo: s, bonoAnual: ba, bonoMensual: bm, medicina: mm,
    prima: p, vacaciones: v, navidad: n, cesantias: ce, intereses: ic, seguridad: ss,
    par, carga: cp, total: ct, pct: ps, proyeccion: py,
  };
}
