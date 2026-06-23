import { useAppContext } from '../../context/AppContext.jsx';
import { CampoEditable } from '../shared/CampoEditable.jsx';
import { fmt } from '../../lib/formato.js';

export function ParametrosSalariales({ persona, base, r, moneda }) {
  const { confirmarEdicion } = useAppContext();

  function confirmarSueldo(nuevoSueldo) {
    const ratio = base.bonoTargetAnual / base.sueldoMensual;
    confirmarEdicion(base.numeroId, {
      sueldoMensual: nuevoSueldo,
      bonoTargetAnual: Math.round(nuevoSueldo * ratio),
    });
  }

  function confirmarBono(nuevoBono) {
    confirmarEdicion(base.numeroId, { bonoTargetAnual: nuevoBono });
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white">Parámetros Salariales</h3>
        <span className="text-xs text-slate-500">Pasa el cursor y haz clic en el lápiz para editar</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CampoEditable label="Sueldo Mensual" valorFormateado={fmt(persona.sueldoMensual, moneda)} onConfirm={confirmarSueldo} />
        <CampoEditable label="Bono Target Anual" valorFormateado={fmt(persona.bonoTargetAnual, moneda)} onConfirm={confirmarBono} />
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Bono Mensual Equiv.</p>
          <div className="font-mono text-lg font-semibold rounded-lg px-3 py-2 bg-navy-800/15 border border-navy-800/50 text-slate-200 opacity-70">
            {fmt(r.bonoMensual, moneda)}
          </div>
        </div>
      </div>
    </div>
  );
}
