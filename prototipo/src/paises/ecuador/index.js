import { config } from './config.js';
import { calc, bonoCPTargetDe } from './calculos.js';
import { getFilasDesglose, getSubtituloFormula, getSlicesComposicion, getLabelTipo, getBadgeTipoCorto } from './desglose.js';
import { colaboradoresEC as colaboradores } from '../../data';

export const ecuador = {
  ...config,
  calc,
  getFilasDesglose,
  getSubtituloFormula,
  getSlicesComposicion,
  getLabelTipo,
  getBadgeTipoCorto,
  // Bono no es lineal: se suma por persona igual que Perú.
  getCamposAgregados: (resueltos) => ({
    bonoCPTargetOverride: resueltos.reduce((s, p) => s + bonoCPTargetDe(p), 0),
  }),
  datos: colaboradores,
};
