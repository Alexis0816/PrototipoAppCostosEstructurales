import { useAppContext } from '../../context';
import { useCalculo } from '../../hooks';
import { fmt } from '../../utils';

export function FilaColaboradorIncluido({ persona, periodo, moneda, onClick }) {
  const { paisActual } = useAppContext();
  const r = useCalculo(persona, periodo);
  return (
    <tr className="row cursor-pointer transition-colors hover:bg-navy-800/40" onClick={onClick}>
      <td className="px-3 py-3 text-blue-400 font-semibold truncate max-sm:hidden">{persona.empresa}</td>
      <td className="px-3 py-3">
        <span className="font-medium text-white">{persona.nombreCompleto}</span>
      </td>
      <td className="px-3 py-3 text-slate-400 max-sm:hidden">{persona.puesto}</td>
      <td className="px-3 py-3 text-right font-mono text-white">{fmt(r.total, moneda, paisActual.moneda)}</td>
      <td className="px-3 py-3 text-right font-mono text-emerald-400">{fmt(r.costoAnualML, moneda, paisActual.moneda)}</td>
    </tr>
  );
}
