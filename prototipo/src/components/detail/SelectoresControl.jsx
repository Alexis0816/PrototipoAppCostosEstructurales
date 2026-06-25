import { useAppContext } from '../../context/AppContext.jsx';
import { Boton } from '../shared/Boton.jsx';

export function SelectoresControl({ esIndividual, tipoSalarioActual }) {
  const { glob, paisActual, setMoneda, setPeriodo, setTipoSalario } = useAppContext();
  const periodos = esIndividual ? paisActual.periodosIndividual : paisActual.periodosAgregado;
  const opcionesTipo = paisActual.opcionesTipoSalario;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Moneda</p>
        <div className="flex gap-2">
          {['COP', 'USD', 'PEN'].map((m) => (
            <Boton key={m} variant={glob.moneda === m ? 'active' : 'default'} onClick={() => setMoneda(m)}>
              {m}
            </Boton>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Período</p>
        <div className="flex gap-2">
          {periodos.map((p) => (
            <Boton key={p} variant={glob.periodo === p ? 'active' : 'default'} onClick={() => setPeriodo(p)}>
              {p}M
            </Boton>
          ))}
        </div>
      </div>
      {esIndividual && opcionesTipo && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tipo Salario</p>
          <div className="flex gap-2">
            {opcionesTipo.map((opt) => (
              <Boton
                key={opt.value}
                variant={tipoSalarioActual === opt.value ? 'active' : 'default'}
                onClick={() => setTipoSalario(opt.value)}
              >
                {opt.label}
              </Boton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
