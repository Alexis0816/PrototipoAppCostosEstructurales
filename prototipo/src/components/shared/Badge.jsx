const VARIANTES = {
  green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  purple: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  gray: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
};

export function Badge({ variant = 'gray', children }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${VARIANTES[variant]}`}>
      {children}
    </span>
  );
}
