import { useMemo } from 'react';
import { useAppContext } from '../context';

// Calcula el costo de `persona` usando el motor del país activo. La firma se mantiene
// (persona, periodo) para no tocar los call-sites. Deps en [persona, periodo, paisActual]:
// `persona` es referencialmente estable salvo que cambie de verdad (igual que useResolvedColaborador),
// y `paisActual` es estable mientras no se cambie de país.
export function useCalculo(persona, periodo) {
  const { paisActual } = useAppContext();
  return useMemo(
    () => paisActual.calc(persona, periodo),
    [persona, periodo, paisActual],
  );
}
