import { ColaboradorRow } from './ColaboradorRow.jsx';

export function TablaColaboradores({ colaboradores }) {
  return (
    <div className="overflow-x-auto overflow-y-auto h-[65vh]">
      <table className="w-full text-sm table-fixed">
        <thead className="sticky top-0 z-10 bg-navy-900">
          <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
            <th className="w-[20%] px-5 py-4 text-left font-semibold">Nombre Completo</th>
            <th className="w-[20%] px-5 py-4 text-left font-semibold max-sm:hidden">Empresa</th>
            <th className="w-[16%] px-5 py-4 text-left font-semibold">Puesto / Área</th>
            <th className="w-[7%] px-5 py-4 text-center font-semibold max-md:hidden">País</th>
            <th className="w-[10%] px-5 py-4 text-center font-semibold">Grado</th>
            <th className="w-[15%] px-5 py-4 text-right font-semibold">Costo</th>
            <th className="w-[12%] px-5 py-4 text-right font-semibold">Editar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {colaboradores.map((c) => <ColaboradorRow key={c.numeroId} colaborador={c} />)}
        </tbody>
      </table>
    </div>
  );
}
