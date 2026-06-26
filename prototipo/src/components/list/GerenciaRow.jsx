import { useAppContext } from '../../context';
import { FilaAccionDual, Boton } from '../shared';
import { fmt } from '../../utils';

export function GerenciaRow({ gerencia, expandido, onToggleExpand }) {
  const { goGerencia, glob, paisActual } = useAppContext();
  return (
    <FilaAccionDual
      onRowClick={() => goGerencia(gerencia.idKey)}
      primarLabel={gerencia.nombre}
      expandible
      expandido={expandido}
      onToggleExpand={onToggleExpand}
    >
      <td className="px-5 py-4 max-sm:hidden"><span className="text-blue-400 font-semibold">{gerencia.empresa}</span></td>
      <td className="px-5 py-4 text-center text-slate-300 font-mono">{gerencia.numColaboradores} colab.</td>
      <td className="px-5 py-4 text-center text-slate-400 font-mono max-md:hidden">{gerencia.pais}</td>
      <td className="px-5 py-4 text-right font-mono text-emerald-400">{fmt(gerencia[paisActual.campoNomina], glob.moneda, paisActual.moneda)}</td>
      <td className="px-5 py-4 text-right">
        <Boton variant="purple" size="sm" onClick={(e) => { e.stopPropagation(); goGerencia(gerencia.idKey); }}>
          Análisis Consolidado
        </Boton>
      </td>
    </FilaAccionDual>
  );
}
