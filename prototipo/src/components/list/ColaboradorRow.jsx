import { useAppContext } from '../../context';
import { useCalculo } from '../../hooks';
import { Badge } from '../shared';
import { fmt } from '../../utils';

export function ColaboradorRow({ colaborador }) {
  const { go, paisActual } = useAppContext();
  // costoAnualML no depende del período (ver KpiRow.jsx), se pasa 1 como valor fijo.
  const r = useCalculo(colaborador, 1);

  return (
    <tr className="row h-[88px] cursor-pointer transition-colors hover:bg-navy-800/40" onClick={() => go(colaborador)}>
      <td className="px-5 py-4">
        <p className="font-semibold text-white truncate">{colaborador.nombreCompleto}</p>
      </td>
      <td className="px-5 py-4 max-sm:hidden">
        <span className="text-blue-400 font-semibold">{colaborador.empresa}</span>
      </td>
      <td className="px-5 py-4 text-slate-300">
        <span className="block">{colaborador.puesto}</span>
        <span className="text-xs text-slate-500 block">{colaborador.gerenciaCorp} · {colaborador.area}</span>
      </td>
      <td className="px-5 py-4 text-center text-slate-400 font-mono max-md:hidden">{colaborador.pais}</td>
      <td className="px-5 py-4 text-center"><Badge variant="blue">{colaborador.grado}</Badge></td>
      <td className="px-5 py-4 text-right font-mono text-emerald-400">{fmt(r.costoAnualML, paisActual.moneda, paisActual.moneda)}</td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); go(colaborador); }}
          title="Editar"
          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
