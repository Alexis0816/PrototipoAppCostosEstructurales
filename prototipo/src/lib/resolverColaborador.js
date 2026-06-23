export function resolverColaborador(base, cacheEdiciones) {
  const override = cacheEdiciones[base.numeroId];
  return override ? { ...base, ...override } : base;
}
