import { useAppContext } from '../../context';
import { convertir, RATE_PER_USD } from '../../utils/fx.js';
import { fmt } from '../../utils';

const BLOQUES = [
  { key: 'fija', label: 'Compensación Fija', color: '#3B82F6' },
  { key: 'variable', label: 'Compensación Variable', color: '#10B981' },
  { key: 'legal', label: 'Beneficios Legales', color: '#F59E0B' },
  { key: 'extra', label: 'Beneficios Extralegales', color: '#8B5CF6' },
];

function bloquesMensuales(r, pais) {
  const b = {
    CO: { fija: (r.sueldo || 0) + (r.vales || 0) + (r.costoDeVales || 0), variable: (r.bonoMensual || 0) + (r.comisionesMensuales || 0), legal: (r.primaServiciosMensual || 0) + (r.cesantiasMensual || 0) + (r.iCesantiasMensual || 0) + (r.aportesPrimasMensual || 0), extra: r.medicinaMensual || 0 },
    PE: { fija: (r.sueldo || 0) + (r.vales || 0) + (r.costoDeVales || 0), variable: (r.bonoCPMensual || 0) + (r.comisionesMensuales || 0), legal: (r.cts || 0) + (r.gratificaciones || 0) + (r.esSalud || 0), extra: r.seguroVidaLey || 0 },
    EC: { fija: (r.sueldo || 0) + (r.vales || 0) + (r.costoDeVales || 0), variable: (r.bonoCPMensual || 0) + (r.comisionesMensuales || 0), legal: (r.xiiiMensual || 0) + (r.sbuMensual || 0) + (r.fondoMensual || 0) + (r.aportePatronalMensual || 0) + (r.vacacionesMensual || 0), extra: r.seguroMensual || 0 },
  };
  return b[pais] || b.CO;
}

export function ComposicionChart({ r, moneda, periodo = 'mensual' }) {
  const { paisActual } = useAppContext();
  const origen = paisActual.moneda;
  const factor = periodo === 'anual' || periodo === 12 ? 12 : 1;
  const tc = RATE_PER_USD[origen] || 1;
  const base = bloquesMensuales(r, paisActual.codigo);
  const bloques = BLOQUES.map((b) => {
    const periodoValor = (base[b.key] || 0) * factor;
    const valor = moneda === 'USD' && origen !== 'USD' ? periodoValor / tc : convertir(periodoValor, origen, moneda);
    return { ...b, valor };
  }).filter((b) => b.valor > 0);
  const total = bloques.reduce((s, b) => s + b.valor, 0);
  const radio = 42;
  const circ = 2 * Math.PI * radio;
  let acumulado = 0;
  const segmentos = bloques.map((b) => { const porcentaje = total ? b.valor / total : 0; const x = { ...b, porcentaje, acumulado }; acumulado += porcentaje; return x; });

  return <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 h-full flex flex-col justify-between">
    <div><h3 className="text-lg font-bold text-white mb-6">Composición {factor === 12 ? 'Anual' : 'Mensual'}</h3>
      <div className="relative h-40 w-40 sm:h-44 sm:w-44 mx-auto mb-6"><svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" role="img" aria-label="Composición de compensación">
        <circle cx="50" cy="50" r={radio} fill="none" stroke="#1e3a5f" strokeWidth="16" />
        {segmentos.map((s) => <circle key={s.key} cx="50" cy="50" r={radio} fill="none" stroke={s.color} strokeWidth="16" strokeDasharray={`${s.porcentaje * circ} ${circ}`} strokeDashoffset={-s.acumulado * circ} />)}
      </svg></div>
    </div>
    <div className="space-y-3 border-t border-navy-800 pt-4">{segmentos.map((s) => <div key={s.key} className="flex items-center gap-2 text-sm text-slate-400"><div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} /><span className="flex-1">{s.label}</span><span className="font-mono font-semibold text-white">{fmt(s.valor, moneda, moneda)}</span><span className="text-xs text-slate-500">({(s.porcentaje * 100).toFixed(0)}%)</span></div>)}</div>
  </div>;
}
