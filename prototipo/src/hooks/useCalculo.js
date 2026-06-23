import { useMemo } from 'react';
import { calc } from '../lib/calculos.js';

export function useCalculo(persona, periodo) {
  return useMemo(
    () => calc(persona, periodo),
    [persona.sueldoMensual, persona.bonoTargetAnual, persona.medicinaPrepagadaAnio, persona.tipoSalario, periodo],
  );
}
