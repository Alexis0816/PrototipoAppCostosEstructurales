import { useMemo, useState } from 'react';
import { useAppContext } from '../../context';
import { agruparPorArea } from '../../utils';
import { DropdownAreas, Boton } from '../shared';
import { AreasAcordeon } from './AreasAcordeon.jsx';
import { ColabDirecta } from './ColabDirecta.jsx';

export function ColaboradoresIncluidos({ actual, tipoVistaDetalle }) {
  const { goArea } = useAppContext();
  const esGerencial = tipoVistaDetalle === 'gerencial';
  const titulo = esGerencial ? 'Áreas' : 'Colaboradores Incluidos';
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const grupos = useMemo(
    () => (esGerencial ? agruparPorArea(actual.colaboradores) : []),
    [actual.colaboradores, esGerencial],
  );
  const grupo = grupos.find((g) => g.area === areaSeleccionada);
  const cantidad = grupo ? grupo.personas.length : actual.colaboradores.length;

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-white">{titulo}</h3>
        {esGerencial && (
          <DropdownAreas areas={grupos} seleccionado={areaSeleccionada} onSeleccionar={setAreaSeleccionada} />
        )}
        <div className="flex flex-col items-center gap-3 sm:ml-auto">
          <span className="text-sm font-semibold text-slate-200 bg-navy-800 px-3 py-1 rounded-lg">
            {cantidad} {cantidad === 1 ? 'colaborador' : 'colaboradores'}
          </span>
          {grupo && (
            <Boton variant="blue" size="sm" onClick={() => goArea(actual.gerenciaCorp, grupo.area)}>
              Ver Costo de Área
            </Boton>
          )}
        </div>
      </div>
      {esGerencial ? (
        <AreasAcordeon grupos={grupos} areaSeleccionada={areaSeleccionada} />
      ) : (
        <ColabDirecta colaboradores={actual.colaboradores} />
      )}
    </div>
  );
}