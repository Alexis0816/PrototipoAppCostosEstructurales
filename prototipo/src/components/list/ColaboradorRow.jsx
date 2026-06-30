import { useAppContext } from '../../context';
import { Badge, Boton } from '../shared';

export function ColaboradorRow({ colaborador }) {
  const { go } = useAppContext();
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
      <td className="px-5 py-4 text-right">
        <Boton variant="blue" size="sm" onClick={(e) => { e.stopPropagation(); go(colaborador); }}>
          Ver Costo
        </Boton>
      </td>
    </tr>
  );
}
