import { config } from './config.js';
import { calc, bonoTargetDe } from './calculos.js';
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
  // Para Área/Gerencia: el bono se suma POR PERSONA (nSueldos_i × sueldoMensual_i)
  // para no recalcularlo sobre el sueldo total agregado.
  getCamposAgregados: (resueltos) => ({
    bonoTargetOverride: resueltos.reduce((s, p) => s + bonoTargetDe(p), 0),
  }),
  datos: colaboradores,
};
