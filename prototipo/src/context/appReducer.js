import { colaboradores } from '../data/colaboradores.js';
import { consolidar } from '../lib/calculos.js';

export const initialState = {
  vista: 'lista', // 'lista' | 'detalle'
  vistaMaestra: 'colaboradores', // 'colaboradores' | 'gerencias'
  tipoVistaDetalle: 'individual', // 'individual' | 'gerencial' | 'area'
  actual: null,
  navId: 0, // se incrementa en cada navegación a detalle, para forzar el reset de estado local (ej. dropdown de áreas) aunque se reingrese a la misma gerencia/área
  glob: { moneda: 'COP', periodo: 12 },
  cacheEdiciones: {},
};

function clampPeriodo(periodo) {
  return periodo === 24 ? 12 : periodo;
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'GO_INDIVIDUAL': {
      const base = colaboradores.find((c) => c.numeroId === action.id);
      if (!base) return state;
      return { ...state, vista: 'detalle', tipoVistaDetalle: 'individual', actual: base, navId: state.navId + 1 };
    }

    case 'GO_GERENCIA': {
      const coleccion = colaboradores.filter((c) => c.gerenciaCorp === action.gerenciaCorpKey);
      if (coleccion.length === 0) return state;
      const { totalSueldo, totalBono, totalMedicina, resueltos } = consolidar(coleccion, state.cacheEdiciones);
      const actual = {
        numeroId: '0000',
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
        tipoSalario: 'F',
        sueldoMensual: totalSueldo,
        bonoTargetAnual: totalBono,
        medicinaPrepagadaAnio: totalMedicina,
        colaboradores: resueltos,
      };
      return {
        ...state,
        vista: 'detalle',
        tipoVistaDetalle: 'gerencial',
        actual,
        navId: state.navId + 1,
        glob: { ...state.glob, periodo: clampPeriodo(state.glob.periodo) },
      };
    }

    case 'GO_AREA': {
      const coleccion = colaboradores.filter(
        (c) => c.gerenciaCorp === action.gerenciaCorpKey && c.area === action.areaNombre,
      );
      if (coleccion.length === 0) return state;
      const { totalSueldo, totalBono, totalMedicina, resueltos } = consolidar(coleccion, state.cacheEdiciones);
      const actual = {
        numeroId: '0000',
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
        tipoSalario: 'F',
        sueldoMensual: totalSueldo,
        bonoTargetAnual: totalBono,
        medicinaPrepagadaAnio: totalMedicina,
        colaboradores: resueltos,
      };
      return {
        ...state,
        vista: 'detalle',
        tipoVistaDetalle: 'area',
        actual,
        navId: state.navId + 1,
        glob: { ...state.glob, periodo: clampPeriodo(state.glob.periodo) },
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
