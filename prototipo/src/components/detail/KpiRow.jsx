import { useAppContext } from '../../context';
import { fmt, pct } from '../../utils';

export function KpiRow({ r, periodo, moneda }) {
  const { paisActual } = useAppContext();
  const monedaOrigen = paisActual.moneda;
  const { textos } = paisActual;

  const cols = paisActual.ocultarCostoAnual ? 'lg:grid-cols-4' : 'lg:grid-cols-5';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-4 mb-6`}>
      <div
        className="rounded-xl border border-blue-500/20 p-5"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.1) 0%, rgba(6,182,212,.05) 100%)' }}
      >
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Costo Anual</p>
        <p className="font-mono text-[1.4rem] sm:text-[1.6rem] font-bold text-blue-400">{fmt(r.costoAnualML, moneda, monedaOrigen)}</p>
      </div>
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Costo Mensual</p>
        <p className="font-mono text-[1.4rem] sm:text-[1.6rem] font-bold text-slate-200">{fmt(r.total, moneda, monedaOrigen)}</p>
      </div>
      {!paisActual.ocultarCostoAnual && (
        <div
          className="rounded-xl border border-emerald-500/20 p-5"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,.08) 0%, rgba(5,150,105,.04) 100%)' }}
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Costo Anual (USD)</p>
          <p className="font-mono text-[1.4rem] sm:text-[1.6rem] font-bold text-emerald-400">{fmt(r.costoAnualUSD, 'USD', 'USD')}</p>
        </div>
      )}
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{textos.kpiCarga}</p>
        <p className="font-mono text-[1.4rem] sm:text-[1.6rem] font-bold text-amber-400">{fmt(r.carga, moneda, monedaOrigen)}</p>
      </div>
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{textos.kpiPct}</p>
        <p className="font-mono text-[1.4rem] sm:text-[1.6rem] font-bold text-violet-400">{pct(r.pct)}</p>
      </div>
    </div>
  );
}
