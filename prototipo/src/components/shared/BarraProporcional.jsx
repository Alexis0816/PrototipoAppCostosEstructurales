export function BarraProporcional({ porcentaje, destacado = false }) {
  return (
    <div className="h-1.5 bg-navy-800/50 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${destacado ? 'bg-violet-500' : 'bg-blue-500'}`}
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}
