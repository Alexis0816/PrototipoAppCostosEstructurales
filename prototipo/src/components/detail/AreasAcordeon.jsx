import { useAppContext } from '../../context';
import { FilaColaboradorIncluido } from '../shared';

export function AreasAcordeon({ grupos, areaSeleccionada }) {
  const { go, glob } = useAppContext();
  const grupo = grupos.find((g) => g.area === areaSeleccionada);

  return (
    <div>
      {grupo && (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <th className="px-3 py-3 text-left font-semibold max-sm:hidden">Empresa</th>
                <th className="px-3 py-3 text-left font-semibold">Colaborador</th>
                <th className="px-3 py-3 text-left font-semibold max-sm:hidden">Puesto</th>
                <th className="px-3 py-3 text-right font-semibold">Costo Mensual</th>
                <th className="px-3 py-3 text-right font-semibold">Costo Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {grupo.personas.map((p) => (
                <FilaColaboradorIncluido
                  key={p.numeroId}
                  persona={p}
                  periodo={glob.periodo}
                  moneda={glob.moneda}
                  onClick={() => go(p)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}