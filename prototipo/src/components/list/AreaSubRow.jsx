import { useAppContext } from '../../context';
import { FilaAccionDual, Boton } from '../shared';

export function AreaSubRow({ area }) {
  const { goArea } = useAppContext();
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
      <td className="px-5 py-4 text-right">
        <Boton variant="cyan" size="sm" onClick={(e) => { e.stopPropagation(); goArea(area.gerenciaCorp, area.area); }}>
          Ver Costo
        </Boton>
      </td>
    </FilaAccionDual>
  );
}
