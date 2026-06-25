import { useAppContext } from '../../context/AppContext.jsx';
import { Avatar } from '../shared/Avatar.jsx';
import { Badge } from '../shared/Badge.jsx';
import { Boton } from '../shared/Boton.jsx';

export function ColaboradorRow({ colaborador }) {
  const { go } = useAppContext();
  return (
    <tr className="row cursor-pointer transition-colors hover:bg-navy-800/40" onClick={() => go(colaborador)}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar color={colaborador.avatarColor} iniciales={colaborador.avatarIniciales} />
          <p className="font-semibold text-white">{colaborador.nombreCompleto}</p>
        </div>
      </td>
      <td className="px-5 py-4 max-sm:hidden">
        <span className="text-blue-400 font-semibold">{colaborador.empresa}</span>
      </td>
      <td className="px-5 py-4 text-slate-300">
        {colaborador.puesto}
        <br />
        <span className="text-xs text-slate-500">{colaborador.gerenciaCorp} · {colaborador.area}</span>
      </td>
      <td className="px-5 py-4 text-center text-slate-400 font-mono max-md:hidden">{colaborador.pais}</td>
      <td className="px-5 py-4 text-center"><Badge variant="blue">{colaborador.grado}</Badge></td>
      <td className="px-5 py-4 text-right">
        <Boton variant="blue" size="sm" onClick={(e) => { e.stopPropagation(); go(colaborador); }}>
          Ver Costo
        </Boton>
      </td>
    </tr>
  );
}
