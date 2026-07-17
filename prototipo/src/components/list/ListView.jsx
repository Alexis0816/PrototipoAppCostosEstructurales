import { useMemo, useState } from 'react';
import { useAppContext } from '../../context';
import { obtenerDatosAgrupadosGerencias } from '../../utils';
import { listarPaises } from '../../paises/registry.js';
import { NavBar } from '../layout/NavBar.jsx';
import { SearchInput } from '../shared';
import { TablaColaboradores } from './TablaColaboradores.jsx';
import { TablaGerencias } from './TablaGerencias.jsx';

const PAISES = listarPaises();

const FLAG_URL = {
  CO: 'https://flagcdn.com/w80/co.jpg',
  PE: 'https://flagcdn.com/w80/pe.jpg',
  EC: 'https://flagcdn.com/w80/ec.jpg',
};
const FLAG_ACTIVE = {
  CO: 'shadow-[0_0_14px_rgba(245,158,11,.55)]',
  PE: 'shadow-[0_0_14px_rgba(239,68,68,.55)]',
  EC: 'shadow-[0_0_14px_rgba(253,224,71,.55)]',
};

const OPCIONES_VISTA = [
  { tipo: 'colaboradores', label: 'Colaboradores' },
  { tipo: 'gerencias', label: 'Gerencias' },
];

export function ListView() {
  const { data, cacheEdiciones, vistaMaestra, cambiarFiltroMaestro, pais, setPais, paisActual, logout } = useAppContext();
  const [busqueda, setBusqueda] = useState('');
  const [waveKey, setWaveKey] = useState(0);

  const gerenciasAgrupadas = useMemo(
    () => obtenerDatosAgrupadosGerencias(data, cacheEdiciones, paisActual),
    [data, cacheEdiciones, paisActual],
  );

  const pool = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (vistaMaestra === 'colaboradores') {
      return data.filter(
        (c) => c.nombreCompleto.toLowerCase().includes(q) || c.puesto.toLowerCase().includes(q)
          || c.area.toLowerCase().includes(q) || c.gerenciaCorp.toLowerCase().includes(q),
      );
    }
    return gerenciasAgrupadas.filter(
      (g) => g.nombre.toLowerCase().includes(q) || g.gerenciaCorp.toLowerCase().includes(q),
    );
  }, [busqueda, vistaMaestra, data, gerenciasAgrupadas]);

  const totalRegistros = vistaMaestra === 'colaboradores' ? data.length : gerenciasAgrupadas.length;

  function cambiarVista(tipo) {
    if (tipo === vistaMaestra) return;
    setBusqueda('');
    setWaveKey((k) => k + 1);
    cambiarFiltroMaestro(tipo);
  }

  return (
    <div>
      <NavBar>
        <div className="flex items-center gap-3 sm:gap-5">

          {/* ── Grupo izquierdo ─────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 lg:gap-6 flex-1 min-w-0">
            <div className="w-full sm:w-[240px] min-w-0 flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                {vistaMaestra === 'colaboradores' ? 'Costos por Colaborador' : 'Costos por Gerencia'}
              </h1>
              <p className="text-sm text-slate-400 mt-1 truncate">
                {pool.length} registros · {paisActual.nombre}
              </p>
            </div>

            {PAISES.length > 1 && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {PAISES.map((p) => (
                  <button
                    key={p.codigo}
                    type="button"
                    onClick={() => setPais(p.codigo)}
                    title={p.nombre}
                    className={`w-[43px] h-[43px] rounded-full overflow-hidden transition-all duration-200 outline-none
                      ${pais === p.codigo
                        ? `${FLAG_ACTIVE[p.codigo] ?? ''} scale-110`
                        : 'opacity-45 hover:opacity-80 hover:scale-105'
                      }`}
                  >
                    <img src={FLAG_URL[p.codigo]} alt={p.nombre} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-stretch h-[43px] bg-slate-900 p-1 rounded-lg border border-slate-700 w-full sm:w-[260px] flex-shrink-0 overflow-hidden">
              <div
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] transition-transform duration-[650ms] ease-[cubic-bezier(.34,1.56,.64,1)]"
                style={{ transform: `translateX(${vistaMaestra === 'gerencias' ? '100%' : '0'})` }}
              >
                <div
                  key={waveKey}
                  className="relative w-full h-full rounded-md bg-blue-500 shadow-[0_2px_8px_rgba(59,130,246,.35)] overflow-hidden origin-bottom animate-wave-bob"
                  style={{ clipPath: 'polygon(7% 0%, 100% 0%, 93% 100%, 0% 100%)' }}
                >
                  <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-white/50 blur-[2px] animate-diagonal-wave" />
                  <span className="absolute inset-y-0 -left-1/2 w-1/3 bg-white/30 blur-[3px] animate-diagonal-wave-2" />
                </div>
              </div>
              {OPCIONES_VISTA.map((o) => (
                <button
                  key={o.tipo}
                  type="button"
                  onClick={() => cambiarVista(o.tipo)}
                  className={`relative z-10 flex flex-1 min-w-0 items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium leading-none whitespace-nowrap transition-colors duration-300 cursor-pointer ${
                    vistaMaestra === o.tipo ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Grupo derecho ───────────────────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
            <div className="w-[220px]">
              <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar..." />
            </div>

            <div className="h-8 w-px bg-navy-800 hidden lg:block" />

            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center gap-2 text-slate-400 hover:text-white border border-navy-800 hover:border-slate-600 bg-transparent hover:bg-navy-900/50 text-sm px-3.5 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>

        </div>
      </NavBar>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden">
          {vistaMaestra === 'colaboradores'
            ? <TablaColaboradores colaboradores={pool} />
            : <TablaGerencias gerencias={pool} />}
          <div className="px-5 py-3 border-t border-navy-800 text-xs text-slate-500 text-right">
            Mostrando {pool.length} de {totalRegistros} registros
          </div>
        </div>
      </div>
    </div>
  );
}
