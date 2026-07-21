import { useAppContext } from '../../context';
import { BarraProporcional } from '../shared';
import { fmt } from '../../utils';

function FilaConcepto({ nombre, formula, valor, total, destacado = false, informativo = false, moneda, monedaOrigen }) {
  const porcentaje = total > 0 ? (valor / total) * 100 : 0;
  return (
    <div className={`flex items-center justify-between py-3 border-b border-navy-800 last:border-b-0 ${informativo ? 'opacity-50' : ''}`}>
      <div className="w-1/3 pr-2">
        <p className={`text-sm font-medium truncate ${informativo ? 'text-slate-400 italic' : 'text-slate-200'}`} title={nombre}>{nombre}</p>
        <p className="text-xs text-slate-500 mt-0.5">{formula}</p>
      </div>
      <div className="w-1/3 px-4">
        <BarraProporcional porcentaje={informativo ? 0 : porcentaje} destacado={destacado} />
      </div>
      <div className="w-1/3 text-right">
        <p className={`font-mono text-[0.9375rem] font-semibold ${informativo ? 'text-slate-400' : 'text-white'}`}>{fmt(valor, moneda, monedaOrigen)}</p>
      </div>
    </div>
  );
}

export function DesglosePrestacional({ persona, r, moneda, periodo }) {
  const { paisActual } = useAppContext();
  const monedaOrigen = paisActual.moneda;
  const { textos } = paisActual;
  const filas = paisActual.getFilasDesglose(r, persona);
  const subtitulo = paisActual.getSubtituloFormula ? paisActual.getSubtituloFormula(persona) : '';
  const esMensual = periodo === 1;
  const totalPeriodo = esMensual ? r.carga : r.carga * 12;

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-white">{esMensual ? textos.tituloDesglose : textos.tituloDesgloseAnual}</h3>
          {subtitulo && <span className="text-xs text-slate-500">{subtitulo}</span>}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider mb-3 border-b border-navy-800 pb-2">
          <span className="w-1/3">Concepto</span>
          <span className="w-1/3 text-center">Proporción</span>
          <span className="w-1/3 text-right">{esMensual ? 'Valor Mensual' : 'Valor Anual'}</span>
        </div>
        <div>
          {filas.map((fila) => (
            <FilaConcepto
              key={fila.nombre}
              nombre={fila.nombre}
              formula={fila.formula}
              valor={esMensual ? fila.valor : fila.valorAnual}
              destacado={fila.destacado}
              informativo={fila.informativo}
              total={totalPeriodo}
              moneda={moneda}
              monedaOrigen={monedaOrigen}
            />
          ))}
        </div>
      </div>
      <div className="bg-blue-500/[0.08] rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-base text-slate-100">{esMensual ? textos.tituloTotalDesglose : textos.tituloTotalDesgloseAnual}</p>
            <p className="text-xs text-slate-500 mt-0.5">{textos.subtituloTotalDesglose}</p>
          </div>
          <p className="font-mono text-xl font-bold text-blue-500">{fmt(totalPeriodo, moneda, monedaOrigen)}</p>
        </div>
      </div>
    </div>
  );
}
