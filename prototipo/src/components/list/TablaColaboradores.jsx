import { ColaboradorRow } from './ColaboradorRow.jsx';

export function TablaColaboradores({ colaboradores }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
            <th className="px-5 py-4 text-left font-semibold">Nombre Completo</th>
            <th className="px-5 py-4 text-left font-semibold max-sm:hidden">Empresa</th>
            <th className="px-5 py-4 text-left font-semibold">Puesto / Área</th>
            <th className="px-5 py-4 text-center font-semibold max-md:hidden">País</th>
            <th className="px-5 py-4 text-center font-semibold">Grado</th>
            <th className="px-5 py-4 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {colaboradores.map((c) => <ColaboradorRow key={c.numeroId} colaborador={c} />)}
        </tbody>
      </table>
    </div>
  );
}
