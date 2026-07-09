import { createContext, useContext, useMemo, useReducer } from 'react';
import { appReducer, initialState } from './appReducer.js';
import { getPais } from '../paises/registry.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(
    () => ({
      login: () => dispatch({ type: 'LOGIN' }),
      logout: () => dispatch({ type: 'LOGOUT' }),
      go: (id) => dispatch({ type: 'GO_INDIVIDUAL', id }),
      goGerencia: (gerenciaCorpKey) => dispatch({ type: 'GO_GERENCIA', gerenciaCorpKey }),
      goArea: (gerenciaCorpKey, areaNombre) => dispatch({ type: 'GO_AREA', gerenciaCorpKey, areaNombre }),
      volver: () => dispatch({ type: 'VOLVER' }),
      cambiarFiltroMaestro: (tipo) => dispatch({ type: 'CAMBIAR_FILTRO_MAESTRO', tipo }),
      setPais: (pais) => dispatch({ type: 'SET_PAIS', pais }),
      setMoneda: (moneda) => dispatch({ type: 'SET_MONEDA', moneda }),
      setPeriodo: (periodo) => dispatch({ type: 'SET_PERIODO', periodo }),
      confirmarEdicion: (numeroId, patch) => dispatch({ type: 'CONFIRMAR_EDICION', numeroId, patch }),
      resetEdicion: (numeroId) => dispatch({ type: 'RESET_EDICION', numeroId }),
    }),
    [],
  );

  const paisActual = getPais(state.pais);

  const value = useMemo(
    () => ({ ...state, ...actions, paisActual, data: paisActual.datos }),
    [state, actions, paisActual],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext debe usarse dentro de <AppProvider>');
  return ctx;
}
