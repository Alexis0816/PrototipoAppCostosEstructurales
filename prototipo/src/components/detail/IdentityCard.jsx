import { useAppContext } from '../../context';
import { Avatar, Badge } from '../shared';

export function IdentityCard({ persona, tipoVistaDetalle }) {
  const { paisActual } = useAppContext();
  const ocultarSubtituloGerencia = tipoVistaDetalle === 'gerencial';
  const mostrarBadges = tipoVistaDetalle === 'individual';
  const tipoBadge = paisActual.getLabelTipo(persona);

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Avatar color={persona.avatarColor} iniciales={persona.avatarIniciales} />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-white truncate">{persona.nombreCompleto}</h3>
        {!ocultarSubtituloGerencia && (
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-400 flex-wrap">
            <span>{persona.puesto}</span>
            <span className="text-slate-600">·</span>
            <span>{persona.gerencia}</span>
          </div>
        )}
      </div>
      {mostrarBadges && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <Badge variant="blue">{persona.grado} — {persona.gradoLabel}</Badge>
          <Badge variant={tipoBadge.variante}>{tipoBadge.texto}</Badge>
          <Badge variant="gray">{persona.contrato || '-'}</Badge>
        </div>
      )}
    </div>
  );
}
