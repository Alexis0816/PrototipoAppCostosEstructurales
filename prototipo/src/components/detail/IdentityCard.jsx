import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context';
import { Avatar, Badge } from '../shared';

function GradoBadgeEditable({ persona }) {
  const { confirmarEdicion } = useAppContext();
  const [editando, setEditando] = useState(false);
  const [temp, setTemp] = useState('');
  const inputRef = useRef(null);

  function iniciar() {
    setTemp(persona.grado || '');
    setEditando(true);
  }

  function confirmar() {
    const num = parseInt(String(temp).replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      confirmarEdicion(persona.numeroId, { grado: 'G' + num });
    }
    setEditando(false);
  }

  function cancelar() { setEditando(false); }

  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editando]);

  if (editando) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirmar();
          if (e.key === 'Escape') cancelar();
        }}
        onBlur={confirmar}
        className="w-20 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500 text-blue-300 outline-none text-center"
        placeholder="G18"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={iniciar}
      title="Clic para editar grado (simulación)"
      className="group inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:border-blue-400/50 transition-colors"
    >
      {persona.grado}
      <svg className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  );
}

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
          {paisActual.gradoEditable
            ? <GradoBadgeEditable persona={persona} />
            : <Badge variant="blue">{persona.grado} — {persona.gradoLabel}</Badge>
          }
          <Badge variant={tipoBadge.variante}>{tipoBadge.texto}</Badge>
          <Badge variant="gray">{persona.contrato || '-'}</Badge>
        </div>
      )}
    </div>
  );
}
