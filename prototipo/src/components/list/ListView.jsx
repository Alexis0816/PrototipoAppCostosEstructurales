import { useMemo, useState } from 'react';
import { useAppContext } from '../../context';
import { obtenerDatosAgrupadosGerencias } from '../../utils';
import { listarPaises } from '../../paises/registry.js';
import { NavBar } from '../layout/NavBar.jsx';
import { Boton, SearchInput } from '../shared';
import { TablaColaboradores } from './TablaColaboradores.jsx';
import { TablaGerencias } from './TablaGerencias.jsx';

const PAISES = listarPaises();

const FLAG_URL = {
  CO: 'https://flagcdn.com/w80/co.jpg',
  PE: 'https://flagcdn.com/w80/pe.jpg',
  EC: 'https://flagcdn.com/w80/ec.jpg',
};
const FLAG_RING = {
  CO: 'ring-[3px] ring-amber-400 shadow-[0_0_14px_rgba(245,158,11,.55)]',
  PE: 'ring-[3px] ring-red-400   shadow-[0_0_14px_rgba(239,68,68,.55)]',
  EC: 'ring-[3px] ring-yellow-300 shadow-[0_0_14px_rgba(253,224,71,.55)]',
};

export function ListView() {
  const { data, cacheEdiciones, vistaMaestra, cambiarFiltroMaestro, pais, setPais, paisActual } = useAppContext();
  const [busqueda, setBusqueda] = useState('');

  const gerenciasAgrupadas = useMemo(
    () => obtenerDatosAgrupadosGerencias(data, cacheEdiciones, paisActual.camposSumables),
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
    setBusqueda('');
    cambiarFiltroMaestro(tipo);
  }

  return (
    <div>
      <NavBar>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:gap-5 lg:gap-8">
          <div className="min-w-0">
            {PAISES.length > 1 && (
              <div className="flex gap-3 mb-3">
                {PAISES.map((p) => (
                  <button
                    key={p.codigo}
                    type="button"
                    onClick={() => setPais(p.codigo)}
                    title={p.nombre}
                    className={`w-12 h-12 rounded-full overflow-hidden transition-all duration-200 outline-none
                      ring-offset-2 ring-offset-[#0a1628]
                      ${pais === p.codigo
                        ? `${FLAG_RING[p.codigo] ?? 'ring-[3px] ring-blue-400'} scale-110`
                        : 'opacity-45 hover:opacity-80 hover:scale-105'
                      }`}
                  >
                    <img
                      src={FLAG_URL[p.codigo]}
                      alt={p.nombre}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
              {vistaMaestra === 'colaboradores' ? 'Colaboradores' : 'Costos por Gerencia'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 truncate">
              {pool.length} registros · {paisActual.nombre}
            </p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 w-full sm:w-[250px]">
            <Boton
              variant={vistaMaestra === 'colaboradores' ? 'active' : 'default'}
              size="sm"
              className="flex-1 min-w-0 justify-center"
              onClick={() => cambiarVista('colaboradores')}
            >
              Colaboradores
            </Boton>
            <Boton
              variant={vistaMaestra === 'gerencias' ? 'active' : 'default'}
              size="sm"
              className="flex-1 min-w-0 justify-center"
              onClick={() => cambiarVista('gerencias')}
            >
              Gerencias
            </Boton>
          </div>
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar..." className="sm:col-span-2 lg:col-span-1" />
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
