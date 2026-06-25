import { useAppContext } from '../../context/AppContext.jsx';
import { CampoEditable } from '../shared/CampoEditable.jsx';
import { fmt } from '../../lib/formato.js';

export function ParametrosSalariales({ persona, base, r, moneda }) {
  const { paisActual, confirmarEdicion } = useAppContext();
  const monedaOrigen = paisActual.moneda;
  const editables = paisActual.camposEditables || [];
  const readonly = paisActual.camposReadonly || [];

  // Construye el handler de confirmación de un campo editable. Si declara `rescale` de tipo
  // 'ratio', recalcula el campo dependiente por el ratio del registro BASE original (regla de
  // Colombia: bono se reescala desde el ratio bono/sueldo original, no desde el valor editado).
  function makeConfirm(entry) {
    return (nuevoValor) => {
      const patch = { [entry.campo]: nuevoValor };
      if (entry.rescale && entry.rescale.tipo === 'ratio') {
        const ratio = base[entry.rescale.campoDependiente] / base[entry.campo];
        patch[entry.rescale.campoDependiente] = Math.round(nuevoValor * ratio);
      }
      confirmarEdicion(base.numeroId, patch);
    };
  }

  function valorReadonly(entry) {
    const fuente = entry.source === 'persona' ? persona : r;
    return fuente[entry.campo];
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white">Parámetros Salariales</h3>
        <span className="text-xs text-slate-500">Pasa el cursor y haz clic en el lápiz para editar</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {editables.map((entry) => (
          <CampoEditable
            key={entry.campo}
            label={entry.label}
            valorFormateado={fmt(persona[entry.campo], moneda, monedaOrigen)}
            onConfirm={makeConfirm(entry)}
          />
        ))}
        {readonly.map((entry) => (
          <div key={entry.campo} className="bg-navy-900 border border-navy-800 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{entry.label}</p>
            <div className="font-mono text-lg font-semibold rounded-lg px-3 py-2 bg-navy-800/15 border border-navy-800/50 text-slate-200 opacity-70">
              {fmt(valorReadonly(entry), moneda, monedaOrigen)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
