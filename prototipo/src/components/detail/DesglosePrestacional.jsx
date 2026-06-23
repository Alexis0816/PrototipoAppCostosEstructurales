import { BarraProporcional } from '../shared/BarraProporcional.jsx';
import { fmt } from '../../lib/formato.js';

function FilaConcepto({ nombre, formula, valor, max, destacado = false, moneda }) {
  const porcentaje = max > 0 ? (valor / max) * 100 : 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-navy-800 last:border-b-0">
      <div className="w-1/3 pr-2">
        <p className="text-sm font-medium text-slate-200 truncate" title={nombre}>{nombre}</p>
        <p className="text-xs text-slate-500 mt-0.5">{formula}</p>
      </div>
      <div className="w-1/3 px-4">
        <BarraProporcional porcentaje={porcentaje} destacado={destacado} />
      </div>
      <div className="w-1/3 text-right">
        <p className="font-mono text-[0.9375rem] font-semibold text-white">{fmt(valor, moneda)}</p>
      </div>
    </div>
  );
}

export function DesglosePrestacional({ persona, r, moneda }) {
  const max = Math.max(r.prima, r.vacaciones, r.navidad, r.cesantias, r.intereses, r.seguridad, r.par) || 1;
  const esFijo = persona.tipoSalario === 'F';

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-white">Desglose Prestacional Mensual</h3>
          <span className="text-xs text-slate-500">
            {esFijo ? 'Fórmula Base: Primas + Cesantías Consolidadas' : 'Fórmula Base: Recargo Integral de Ley'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider mb-3 border-b border-navy-800 pb-2">
          <span className="w-1/3">Concepto</span>
          <span className="w-1/3 text-center">Proporción</span>
          <span className="w-1/3 text-right">Valor Mensual</span>
        </div>
        <div>
          {esFijo && (
            <>
              <FilaConcepto nombre="Prima de Servicios Mensual" formula="Sueldo / 12" valor={r.prima} max={max} moneda={moneda} />
              <FilaConcepto nombre="Prima de Vacaciones Mensual" formula="Sueldo / 12" valor={r.vacaciones} max={max} moneda={moneda} />
              <FilaConcepto nombre="Prima de Navidad Mensual" formula="(Sueldo × 0.5) / 12" valor={r.navidad} max={max} moneda={moneda} />
              <FilaConcepto nombre="Cesantías Mensual" formula="Sueldo / 12" valor={r.cesantias} max={max} moneda={moneda} />
              <FilaConcepto nombre="Intereses de Cesantías Mensual" formula="12% de Cesantías" valor={r.intereses} max={max} moneda={moneda} />
              <FilaConcepto nombre="Seguridad Social Base" formula="Sueldo × 20.5% (Aporte Patronal)" valor={r.seguridad} max={max} moneda={moneda} />
            </>
          )}
          <FilaConcepto
            nombre="Provisión Costo PAR"
            formula={esFijo ? '((Sueldo / 12) × 49.60%)' : 'Sueldo × 31.94%'}
            valor={r.par}
            max={max}
            destacado
            moneda={moneda}
          />
        </div>
      </div>
      <div className="bg-blue-500/[0.08] rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-base text-slate-100">Total Carga Prestacional Mensual</p>
            <p className="text-xs text-slate-500 mt-0.5">Factor consolidado aplicado según matriz prestacional legal</p>
          </div>
          <p className="font-mono text-xl font-bold text-blue-500">{fmt(r.carga, moneda)}</p>
        </div>
      </div>
    </div>
  );
}
