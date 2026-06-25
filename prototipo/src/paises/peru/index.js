import { config } from './config.js';
import { calc, bonoCPTargetDe } from './calculos.js';
import {
  getFilasDesglose,
  getSubtituloFormula,
  getSlicesComposicion,
  getLabelTipo,
  getBadgeTipoCorto,
} from './desglose.js';
import { colaboradores } from '../../data/colaboradoresPE.js';

export const peru = {
  ...config,
  calc,
  getFilasDesglose,
  getSubtituloFormula,
  getSlicesComposicion,
  getLabelTipo,
  getBadgeTipoCorto,
  // Para Área/Gerencia: el bono se suma POR PERSONA (cada uno con su grado), no se recalcula
  // sobre el sueldo agregado. Se inyecta como override en el registro sintético.
  getCamposAgregados: (resueltos) => ({
    bonoCPTargetOverride: resueltos.reduce((s, p) => s + bonoCPTargetDe(p), 0),
  }),
  datos: colaboradores,
};
