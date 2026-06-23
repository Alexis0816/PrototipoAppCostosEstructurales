import { useCalculo } from '../../hooks/useCalculo.js';
import { fmt } from '../../lib/formato.js';
import { Avatar } from './Avatar.jsx';
import { Badge } from './Badge.jsx';

export function FilaColaboradorIncluido({ persona, periodo, moneda, onClick }) {
  const r = useCalculo(persona, periodo);
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
        <Badge variant={persona.tipoSalario === 'F' ? 'green' : 'purple'}>
          {persona.tipoSalario === 'F' ? 'Fijo' : 'Integral'}
        </Badge>
      </td>
      <td className="px-3 py-3 text-right font-mono text-white">{fmt(r.total, moneda)}</td>
    </tr>
  );
}
