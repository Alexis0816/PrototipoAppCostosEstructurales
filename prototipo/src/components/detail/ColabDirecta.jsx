import { useMemo, useState } from 'react';
import { useAppContext } from '../../context';
import { SearchInput, FilaColaboradorIncluido } from '../shared';

export function ColabDirecta({ colaboradores }) {
  const { go, glob } = useAppContext();
  const [busqueda, setBusqueda] = useState('');

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return colaboradores.filter((p) => p.nombreCompleto.toLowerCase().includes(q));
  }, [colaboradores, busqueda]);

  return (
    <div>
      <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar colaborador..." className="mb-3" />
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
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
            {filtradas.length === 0 ? (
              <tr><td colSpan={4} className="text-xs text-slate-500 py-3 text-center">Sin resultados</td></tr>
            ) : (
              filtradas.map((p) => (
                <FilaColaboradorIncluido
                  key={p.numeroId}
                  persona={p}
                  periodo={glob.periodo}
                  moneda={glob.moneda}
                  onClick={() => go(p)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
