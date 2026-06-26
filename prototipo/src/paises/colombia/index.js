import { config } from './config.js';
import { calc } from './calculos.js';
import {
  getFilasDesglose,
  getSubtituloFormula,
  getSlicesComposicion,
  getLabelTipo,
  getBadgeTipoCorto,
} from './desglose.js';
import { colaboradoresCO as colaboradores } from '../../data';

export const colombia = {
  ...config,
  calc,
  getFilasDesglose,
  getSubtituloFormula,
  getSlicesComposicion,
  getLabelTipo,
  getBadgeTipoCorto,
  datos: colaboradores,
};
