import { useAppContext } from '../../context';
import { fmt, pct } from '../../utils';

export function KpiRow({ r, periodo, moneda }) {
  const { paisActual } = useAppContext();
  const monedaOrigen = paisActual.moneda;
  const { textos } = paisActual;

  const esMensual = periodo === 1;
  const valorPeriodo = esMensual ? r.total : r.costoAnualML;

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <div
        className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] rounded-xl border border-blue-500/20 p-5"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.1) 0%, rgba(6,182,212,.05) 100%)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{esMensual ? 'Costo Mensual' : 'Costo Anual'}</p>
        <div className="font-mono text-lg font-semibold rounded-lg px-3 py-2 bg-navy-800/15 border border-navy-800/50 text-blue-400">
          {fmt(valorPeriodo, moneda, monedaOrigen)}
        </div>
      </div>
      <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] bg-navy-900 border border-navy-800 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{textos.kpiPct}</p>
        <div className="font-mono text-lg font-semibold rounded-lg px-3 py-2 bg-navy-800/15 border border-navy-800/50 text-violet-400">
          {pct(r.pct)}
        </div>
      </div>
    </div>
  );
}