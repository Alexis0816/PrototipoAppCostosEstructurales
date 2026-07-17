import { useAppContext } from '../../context';
import { FilaAccionDual } from '../shared';
import { fmt } from '../../utils';

export function AreaSubRow({ area }) {
  const { goArea, paisActual } = useAppContext();
  return (
    <FilaAccionDual
      onRowClick={() => goArea(area.gerenciaCorp, area.area)}
      primarLabel={area.area}
      primarSub={area.gerenciaCorp}
      indent
    >
      <td className="px-5 py-4 max-sm:hidden"><span className="text-blue-400 font-semibold">{area.empresa}</span></td>
      <td className="px-5 py-4 text-center text-slate-300 font-mono">{area.numColaboradores}</td>
      <td className="px-5 py-4 text-center text-slate-400 font-mono max-md:hidden">{area.pais}</td>
      <td className="px-5 py-4 text-right font-mono text-emerald-400">{fmt(area.costoAnualML, paisActual.moneda, paisActual.moneda)}</td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goArea(area.gerenciaCorp, area.area); }}
          title="Editar"
          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </td>
    </FilaAccionDual>
  );
}
