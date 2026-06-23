import { useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside.js';

export function DropdownAreas({ areas, seleccionado, onSeleccionar }) {
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);

  useClickOutside(wrapRef, abierto, () => setAbierto(false));

  return (
    <div ref={wrapRef} className="w-full sm:w-auto sm:min-w-[260px]">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left bg-navy-800/30 border border-navy-800 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors"
      >
        <span className="truncate">{seleccionado || 'Selecciona un área...'}</span>
        <svg
          className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {abierto && (
        <div className="mt-1.5 bg-navy-950 border border-navy-800 rounded-lg overflow-hidden">
          {areas.map(({ area }) => {
            const activo = area === seleccionado;
            return (
              <div
                key={area}
                onClick={() => { onSeleccionar(area); setAbierto(false); }}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors hover:bg-navy-800/60 ${
                  activo ? 'bg-blue-500/10 text-blue-400' : 'text-slate-200'
                }`}
              >
                {area}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
