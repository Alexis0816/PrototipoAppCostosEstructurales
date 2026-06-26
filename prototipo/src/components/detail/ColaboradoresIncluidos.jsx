import { useAppContext } from '../../context';
import { AreasAcordeon } from './AreasAcordeon.jsx';
import { ColabDirecta } from './ColabDirecta.jsx';

export function ColaboradoresIncluidos({ actual, tipoVistaDetalle }) {
  const { navId } = useAppContext();
  const titulo = tipoVistaDetalle === 'gerencial' ? 'Áreas' : 'Colaboradores Incluidos';

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white">{titulo}</h3>
        <span className="text-xs text-slate-500">
          {actual.colaboradores.length} {actual.colaboradores.length === 1 ? 'colaborador' : 'colaboradores'}
        </span>
      </div>
      {tipoVistaDetalle === 'gerencial'
        ? <AreasAcordeon key={navId} colaboradores={actual.colaboradores} gerenciaCorpKey={actual.gerenciaCorp} />
        : <ColabDirecta colaboradores={actual.colaboradores} />}
    </div>
  );
}
