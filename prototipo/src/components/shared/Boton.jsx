const VARIANTES = {
  default: 'bg-navy-800/30 border border-navy-800 text-slate-400 hover:border-navy-700 hover:text-slate-200',
  active: 'bg-blue-500 border border-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,.35)]',
  green: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25',
  red: 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25',
  ghost: 'bg-transparent border border-transparent text-slate-500 hover:text-slate-200',
  blue: 'bg-blue-500/15 border border-blue-500/30 text-blue-400',
  purple: 'bg-violet-500/15 border border-violet-500/30 text-violet-400',
  cyan: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400',
};

const TAMANOS = {
  default: 'px-5 py-2',
  sm: 'px-3 py-1.5',
};

export function Boton({ variant = 'default', size = 'default', icon = false, className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${icon ? 'p-2' : TAMANOS[size]} ${VARIANTES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
