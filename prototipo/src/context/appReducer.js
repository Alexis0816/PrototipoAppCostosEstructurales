import { getPais } from '../paises/registry.js';
import { consolidar } from '../utils';

export const initialState = {
  pais: 'CO', // país activo (clave del registro). Determina dataset y módulo de cálculo.
  vista: 'lista', // 'lista' | 'detalle'
  vistaMaestra: 'colaboradores', // 'colaboradores' | 'gerencias'
  tipoVistaDetalle: 'individual', // 'individual' | 'gerencial' | 'area'
  actual: null,
  navId: 0, // se incrementa en cada navegación a detalle, para forzar el reset de estado local (ej. dropdown de áreas) aunque se reingrese a la misma gerencia/área
  glob: { moneda: 'COP', periodo: 1 },
  cacheEdiciones: {},
};

// Si el período actual no está permitido para vistas agregadas del país, cae al primero permitido.
function clampPeriodo(periodo, periodosPermitidos) {
  return periodosPermitidos.includes(periodo) ? periodo : periodosPermitidos[0];
}

// Construye el registro sintético común para Gerencia/Área a partir de los totales sumados.
function construirAgregado(modPais, totales, resueltos, meta) {
  return {
    numeroId: '0000',
    ...totales,
    ...modPais.defaultsAgregado,
    ...(modPais.getCamposAgregados ? modPais.getCamposAgregados(resueltos) : {}),
    colaboradores: resueltos,
    ...meta,
  };
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'GO_INDIVIDUAL': {
      const modPais = getPais(state.pais);
      const base = typeof action.id === 'object'
        ? action.id
        : modPais.datos.find((c) => c.numeroId === action.id);
      if (!base) return state;
      return { ...state, vista: 'detalle', tipoVistaDetalle: 'individual', actual: base, navId: state.navId + 1 };
    }

    case 'GO_GERENCIA': {
      const modPais = getPais(state.pais);
      const coleccion = modPais.datos.filter((c) => c.gerenciaCorp === action.gerenciaCorpKey);
      if (coleccion.length === 0) return state;
      const { totales, resueltos } = consolidar(coleccion, state.cacheEdiciones, modPais.camposSumables);
      const actual = construirAgregado(modPais, totales, resueltos, {
        nombreCompleto: coleccion[0].gerencia,
        gerenciaCorp: action.gerenciaCorpKey,
        gerencia: coleccion[0].gerencia,
        puesto: `Consolidado de Gerencia — ${coleccion.length} Colaboradores`,
        empresa: coleccion[0].empresa,
        pais: coleccion[0].pais,
        ciudad: 'Varias sedes',
        contrato: 'Consolidado',
        avatarColor: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        avatarIniciales: 'GC',
        grado: 'Global',
        gradoLabel: 'Costo Consolidado',
      });
      return {
        ...state,
        vista: 'detalle',
        tipoVistaDetalle: 'gerencial',
        actual,
        navId: state.navId + 1,
        glob: { ...state.glob, periodo: clampPeriodo(state.glob.periodo, modPais.periodosAgregado) },
      };
    }

    case 'GO_AREA': {
      const modPais = getPais(state.pais);
      const coleccion = modPais.datos.filter(
        (c) => c.gerenciaCorp === action.gerenciaCorpKey && c.area === action.areaNombre,
      );
      if (coleccion.length === 0) return state;
      const { totales, resueltos } = consolidar(coleccion, state.cacheEdiciones, modPais.camposSumables);
      const actual = construirAgregado(modPais, totales, resueltos, {
        nombreCompleto: action.areaNombre,
        gerenciaCorp: action.gerenciaCorpKey,
        gerencia: coleccion[0].gerencia,
        puesto: `Consolidado de Área — ${coleccion.length} Colaboradores`,
        empresa: coleccion[0].empresa,
        pais: coleccion[0].pais,
        ciudad: coleccion[0].ciudad,
        contrato: 'Consolidado',
        avatarColor: 'linear-gradient(135deg, #06b6d4, #6366f1)',
        avatarIniciales: 'AR',
        grado: 'Área',
        gradoLabel: 'Costo Consolidado',
      });
      return {
        ...state,
        vista: 'detalle',
        tipoVistaDetalle: 'area',
        actual,
        navId: state.navId + 1,
        glob: { ...state.glob, periodo: clampPeriodo(state.glob.periodo, modPais.periodosAgregado) },
      };
    }

    case 'SET_PAIS': {
      if (action.pais === state.pais) return state;
      // Al cambiar de país, la moneda de visualización por defecto pasa a la nativa del país.
      // vistaMaestra se preserva: si estaba en Gerencias, se sigue viendo Gerencias del nuevo país.
      const monedaPais = getPais(action.pais).moneda;
      return {
        ...state,
        pais: action.pais,
        vista: 'lista',
        actual: null,
        glob: { ...state.glob, moneda: monedaPais },
      };
    }

    case 'VOLVER':
      return { ...state, vista: 'lista', actual: null };

    case 'CAMBIAR_FILTRO_MAESTRO':
      return { ...state, vistaMaestra: action.tipo };

    case 'SET_MONEDA':
      return { ...state, glob: { ...state.glob, moneda: action.moneda } };

    case 'SET_PERIODO':
      return { ...state, glob: { ...state.glob, periodo: action.periodo } };

    case 'SET_TIPO_SALARIO': {
      if (state.tipoVistaDetalle !== 'individual' || !state.actual) return state;
      return {
        ...state,
        cacheEdiciones: {
          ...state.cacheEdiciones,
          [state.actual.numeroId]: { ...state.cacheEdiciones[state.actual.numeroId], tipoSalario: action.tipoSalario },
        },
      };
    }

    case 'CONFIRMAR_EDICION':
      return {
        ...state,
        cacheEdiciones: {
          ...state.cacheEdiciones,
          [action.numeroId]: { ...state.cacheEdiciones[action.numeroId], ...action.patch },
        },
      };

    case 'RESET_EDICION': {
      const next = { ...state.cacheEdiciones };
      delete next[action.numeroId];
      return { ...state, cacheEdiciones: next };
    }

    default:
      return state;
  }
}
