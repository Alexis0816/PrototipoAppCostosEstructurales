import { useAppContext } from '../../context/AppContext.jsx';
import { Boton } from '../shared/Boton.jsx';

const TITULOS = {
  individual: 'Costeo del Colaborador',
  gerencial: 'Análisis de Costo Consolidado',
  area: 'Análisis de Costo por Área',
};

export function DetailHeader({ tipoVistaDetalle, nombre, esIndividual, numeroId }) {
  const { volver, resetEdicion, paisActual } = useAppContext();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{TITULOS[tipoVistaDetalle]}</h2>
        <p className="text-sm text-slate-400 mt-1">
          <span className="text-blue-400 font-medium">{nombre}</span> · PRIMAX · {paisActual.nombre}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Boton variant="blue" onClick={volver}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Lista
        </Boton>
        {esIndividual && (
          <Boton variant="ghost" onClick={() => resetEdicion(numeroId)} title="Restaurar valores originales">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restaurar
          </Boton>
        )}
        <Boton variant="green">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar Excel
        </Boton>
      </div>
    </div>
  );
}
