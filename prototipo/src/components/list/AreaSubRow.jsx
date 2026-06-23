import { useAppContext } from '../../context/AppContext.jsx';
import { FilaAccionDual } from '../shared/FilaAccionDual.jsx';
import { Boton } from '../shared/Boton.jsx';
import { fmt } from '../../lib/formato.js';

export function AreaSubRow({ area }) {
  const { goArea, glob } = useAppContext();
  return (
    <FilaAccionDual
      onRowClick={() => goArea(area.gerenciaCorp, area.area)}
      primarLabel={area.area}
      primarSub={area.gerenciaCorp}
      indent
    >
      <td className="px-5 py-4 max-sm:hidden"><span className="text-blue-400 font-semibold">{area.empresa}</span></td>
      <td className="px-5 py-4 text-center text-slate-300 font-mono">{area.numColaboradores} colab.</td>
      <td className="px-5 py-4 text-center text-slate-400 font-mono max-md:hidden">{area.pais}</td>
      <td className="px-5 py-4 text-right font-mono text-emerald-400">{fmt(area.sueldoMensual, glob.moneda)}</td>
      <td className="px-5 py-4 text-right">
        <Boton variant="cyan" size="sm" onClick={(e) => { e.stopPropagation(); goArea(area.gerenciaCorp, area.area); }}>
          Ver Costo de Área
        </Boton>
      </td>
    </FilaAccionDual>
  );
}
