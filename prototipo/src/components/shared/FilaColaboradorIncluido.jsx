import { useAppContext } from '../../context';
import { useCalculo } from '../../hooks';
import { fmt } from '../../utils';
import { Avatar } from './Avatar.jsx';
import { Badge } from './Badge.jsx';

export function FilaColaboradorIncluido({ persona, periodo, moneda, onClick }) {
  const { paisActual } = useAppContext();
  const r = useCalculo(persona, periodo);
  const tipoBadge = paisActual.getBadgeTipoCorto(persona);
  return (
    <tr className="row cursor-pointer transition-colors hover:bg-navy-800/40" onClick={onClick}>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar color={persona.avatarColor} iniciales={persona.avatarIniciales} size="small" />
          <span className="font-medium text-white">{persona.nombreCompleto}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-slate-400 max-sm:hidden">{persona.puesto}</td>
      <td className="px-3 py-3 text-center">
        <Badge variant={tipoBadge.variante}>{tipoBadge.texto}</Badge>
      </td>
      <td className="px-3 py-3 text-right font-mono text-white">{fmt(r.total, moneda, paisActual.moneda)}</td>
    </tr>
  );
}
