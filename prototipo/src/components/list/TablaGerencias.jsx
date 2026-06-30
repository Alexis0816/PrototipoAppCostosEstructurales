import { Fragment, useState } from 'react';
import { useAppContext } from '../../context';
import { obtenerDatosAgrupadosAreas } from '../../utils';
import { GerenciaRow } from './GerenciaRow.jsx';
import { AreaSubRow } from './AreaSubRow.jsx';

export function TablaGerencias({ gerencias }) {
  const { data, cacheEdiciones, paisActual } = useAppContext();
  const [expandidas, setExpandidas] = useState(() => new Set());

  function toggleExpand(idKey) {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(idKey)) next.delete(idKey);
      else next.add(idKey);
      return next;
    });
  }

  return (
    <div className="overflow-x-auto overflow-y-auto h-[65vh]">
      <table className="w-full text-sm table-fixed">
        <thead className="sticky top-0 z-10 bg-navy-900">
          <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
            <th className="w-[28%] px-5 py-4 text-left font-semibold">Gerencia Corporativa / Área</th>
            <th className="w-[24%] px-5 py-4 text-left font-semibold max-sm:hidden">Empresa</th>
            <th className="w-[22%] px-5 py-4 text-center font-semibold">Cantidad</th>
            <th className="w-[8%] px-5 py-4 text-center font-semibold max-md:hidden">País</th>
            <th className="w-[20%] px-5 py-4 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {gerencias.map((g) => {
            const expandido = expandidas.has(g.idKey);
            return (
              <Fragment key={g.idKey}>
                <GerenciaRow gerencia={g} expandido={expandido} onToggleExpand={() => toggleExpand(g.idKey)} />
                {expandido && obtenerDatosAgrupadosAreas(data, cacheEdiciones, paisActual.camposSumables, g.idKey).map((a) => (
                  <AreaSubRow key={a.idKey} area={a} />
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
