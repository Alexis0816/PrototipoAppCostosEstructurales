import { useMemo, useState } from 'react';
import { useAppContext } from '../../context';
import { agruparPorArea } from '../../utils';
import { DropdownAreas, FilaColaboradorIncluido, Boton } from '../shared';

export function AreasAcordeon({ colaboradores, gerenciaCorpKey }) {
  const { go, goArea, glob } = useAppContext();
  const [areaSeleccionada, setAreaSeleccionada] = useState('');

  const grupos = useMemo(() => agruparPorArea(colaboradores), [colaboradores]);
  const grupo = grupos.find((g) => g.area === areaSeleccionada);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <DropdownAreas areas={grupos} seleccionado={areaSeleccionada} onSeleccionar={setAreaSeleccionada} />
        {grupo && (
          <Boton variant="cyan" onClick={() => goArea(gerenciaCorpKey, grupo.area)}>
            Ver Análisis Completo del Área →
          </Boton>
        )}
      </div>
      {grupo && (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <th className="px-3 py-3 text-left font-semibold">Colaborador</th>
                <th className="px-3 py-3 text-left font-semibold max-sm:hidden">Puesto</th>
                <th className="px-3 py-3 text-center font-semibold">Tipo Salario</th>
                <th className="px-3 py-3 text-right font-semibold">Costo Mensual</th>
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
