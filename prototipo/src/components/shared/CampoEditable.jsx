import { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import { parseInp } from '../../lib/formato.js';

export function CampoEditable({ label, valorFormateado, onConfirm }) {
  const [editando, setEditando] = useState(false);
  const [valorTemp, setValorTemp] = useState('');
  const inputRef = useRef(null);
  const groupRef = useRef(null);

  function iniciarEdicion() {
    setValorTemp(valorFormateado);
    setEditando(true);
  }

  function confirmar() {
    onConfirm(parseInp(valorTemp));
    setEditando(false);
  }

  function cancelar() {
    setEditando(false);
  }

  useClickOutside(groupRef, editando, cancelar);

  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, inputRef.current.value.length);
    }
  }, [editando]);

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      <div ref={groupRef} className="relative flex items-center gap-2 w-full group">
        <input
          ref={inputRef}
          type="text"
          readOnly={!editando}
          value={editando ? valorTemp : valorFormateado}
          onChange={(e) => setValorTemp(e.target.value)}
          onFocus={iniciarEdicion}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmar();
            if (e.key === 'Escape') cancelar();
          }}
          className={`flex-1 min-w-0 font-mono text-lg font-semibold rounded-lg px-3 py-2 pr-10 outline-none transition-colors ${
            editando
              ? 'bg-navy-800/60 border border-blue-500 ring-2 ring-blue-500/15'
              : 'bg-navy-800/15 border border-navy-800/50 text-slate-200 cursor-default'
          }`}
        />
        {!editando && (
          <button
            type="button"
            onClick={iniciarEdicion}
            title="Editar"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        {editando && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={confirmar}
              title="Confirmar"
              className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={cancelar}
              title="Cancelar"
              className="p-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
