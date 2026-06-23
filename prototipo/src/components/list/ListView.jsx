import { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { obtenerDatosAgrupadosGerencias } from '../../lib/agrupacion.js';
import { NavBar } from '../layout/NavBar.jsx';
import { Boton } from '../shared/Boton.jsx';
import { SearchInput } from '../shared/SearchInput.jsx';
import { TablaColaboradores } from './TablaColaboradores.jsx';
import { TablaGerencias } from './TablaGerencias.jsx';

export function ListView() {
  const { data, cacheEdiciones, vistaMaestra, cambiarFiltroMaestro } = useAppContext();
  const [busqueda, setBusqueda] = useState('');

  const gerenciasAgrupadas = useMemo(
    () => obtenerDatosAgrupadosGerencias(data, cacheEdiciones),
    [data, cacheEdiciones],
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
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
              {vistaMaestra === 'colaboradores' ? 'Colaboradores' : 'Costos por Gerencia'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 truncate">
              {pool.length} registros · <span className="text-blue-400 font-semibold">PRIMAX</span>
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
