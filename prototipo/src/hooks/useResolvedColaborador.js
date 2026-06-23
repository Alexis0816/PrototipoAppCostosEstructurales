import { useMemo } from 'react';
import { resolverColaborador } from '../lib/resolverColaborador.js';

export function useResolvedColaborador(base, cacheEdiciones) {
  const override = base ? cacheEdiciones[base.numeroId] : undefined;
  return useMemo(() => (base ? resolverColaborador(base, cacheEdiciones) : null), [base, override]);
}
