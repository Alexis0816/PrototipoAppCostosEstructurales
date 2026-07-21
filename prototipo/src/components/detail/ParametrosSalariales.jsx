import { useAppContext } from '../../context';
import { CampoEditable } from '../shared';
import { fmt } from '../../utils';

export function ParametrosSalariales({ persona, base, r, moneda, periodo }) {
  const { paisActual, confirmarEdicion } = useAppContext();
  const monedaOrigen = paisActual.moneda;
  const editables = paisActual.camposEditables || [];
  const readonly = paisActual.camposReadonly || [];
  const esMensual = periodo === 1;

  // Construye el handler de confirmación de un campo editable. Si declara `rescale` de tipo
  // 'ratio', recalcula el campo dependiente por el ratio del registro BASE original (regla de
  // Colombia: bono se reescala desde el ratio bono/sueldo original, no desde el valor editado).
  // Si `tipo: 'grado'`, parseInp devuelve el número (parseó "G18" → 18); se re-prefija a "G18".
  function makeConfirm(entry) {
    return (nuevoValor) => {
      let valorFinal = nuevoValor;
      if (entry.tipo === 'grado') {
        valorFinal = 'G' + Math.round(nuevoValor);
      }
      const patch = { [entry.campo]: valorFinal };
      if (entry.rescale && entry.rescale.tipo === 'ratio') {
        const ratio = base[entry.rescale.campoDependiente] / base[entry.campo];
        patch[entry.rescale.campoDependiente] = Math.round(nuevoValor * ratio);
      }
      confirmarEdicion(base.numeroId, patch);
    };
  }

  function valorReadonly(entry) {
    const fuente = entry.source === 'persona' ? persona : r;
    let valor = fuente[entry.campo];
    // `formato:'numero'` ⇒ no es un monto (ej. multiplicadorBono = cantidad de sueldos), no pasa por fmt().
    if (entry.formato === 'numero') return String(valor);
    // `periodoReactivo` ⇒ el campo tiene versión mensual y anual; togglea con el selector Período.
    if (entry.periodoReactivo === 'anual')   valor = esMensual ? valor / 12 : valor;
    if (entry.periodoReactivo === 'mensual') valor = esMensual ? valor : valor * 12;
    return fmt(valor, moneda, monedaOrigen);
  }

  function labelReadonly(entry) {
    if (!entry.periodoReactivo) return entry.label;
    return `${entry.label} (${esMensual ? 'Mensual' : 'Anual'})`;
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
            valorFormateado={
              entry.tipo === 'grado'   ? String(persona[entry.campo] ?? '') :
              entry.tipo === 'decimal' ? String(persona[entry.campo] ?? 0) :
              fmt(persona[entry.campo] ?? 0, moneda, monedaOrigen)
            }
            onConfirm={makeConfirm(entry)}
          />
        ))}
        {readonly.map((entry) => (
          <div key={entry.campo} className="bg-navy-900 border border-navy-800 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{labelReadonly(entry)}</p>
            <div className="font-mono text-lg font-semibold rounded-lg px-3 py-2 bg-navy-800/15 border border-navy-800/50 text-slate-200 opacity-70">
              {valorReadonly(entry)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
