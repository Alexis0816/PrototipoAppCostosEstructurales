export function FilaAccionDual({
  onRowClick, primarLabel, primarSub, expandible = false, expandido = false, onToggleExpand, indent = false, children,
}) {
  return (
    <tr className={`row cursor-pointer transition-colors hover:bg-navy-800/40 ${indent ? 'bg-navy-800/10' : ''}`} onClick={onRowClick}>
      <td className="px-5 py-4">
        <div className={`flex items-center gap-2 ${indent ? 'pl-8' : ''}`}>
          {expandible && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"
              title={expandido ? 'Contraer áreas' : 'Ver áreas'}
            >
              <svg className={`w-4 h-4 transition-transform ${expandido ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {!expandible && indent && (
            <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          <div>
            <p className={indent ? 'font-medium text-slate-200' : 'font-semibold text-white'}>{primarLabel}</p>
            {primarSub && <span className="text-xs text-slate-500 font-mono">{primarSub}</span>}
          </div>
        </div>
      </td>
      {children}
    </tr>
  );
}
