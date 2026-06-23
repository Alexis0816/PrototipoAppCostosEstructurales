import { createContext, useContext, useMemo, useReducer } from 'react';
import { appReducer, initialState } from './appReducer.js';
import { colaboradores } from '../data/colaboradores.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(
    () => ({
      go: (id) => dispatch({ type: 'GO_INDIVIDUAL', id }),
      goGerencia: (gerenciaCorpKey) => dispatch({ type: 'GO_GERENCIA', gerenciaCorpKey }),
      goArea: (gerenciaCorpKey, areaNombre) => dispatch({ type: 'GO_AREA', gerenciaCorpKey, areaNombre }),
      volver: () => dispatch({ type: 'VOLVER' }),
      cambiarFiltroMaestro: (tipo) => dispatch({ type: 'CAMBIAR_FILTRO_MAESTRO', tipo }),
      setMoneda: (moneda) => dispatch({ type: 'SET_MONEDA', moneda }),
      setPeriodo: (periodo) => dispatch({ type: 'SET_PERIODO', periodo }),
      setTipoSalario: (tipoSalario) => dispatch({ type: 'SET_TIPO_SALARIO', tipoSalario }),
      confirmarEdicion: (numeroId, patch) => dispatch({ type: 'CONFIRMAR_EDICION', numeroId, patch }),
      resetEdicion: (numeroId) => dispatch({ type: 'RESET_EDICION', numeroId }),
    }),
    [],
  );

  const value = useMemo(
    () => ({ ...state, ...actions, data: colaboradores }),
    [state, actions],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext debe usarse dentro de <AppProvider>');
  return ctx;
}
