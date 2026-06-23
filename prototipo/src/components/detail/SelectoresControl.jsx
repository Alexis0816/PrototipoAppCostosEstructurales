import { useAppContext } from '../../context/AppContext.jsx';
import { Boton } from '../shared/Boton.jsx';

export function SelectoresControl({ esIndividual, tipoSalarioActual }) {
  const { glob, setMoneda, setPeriodo, setTipoSalario } = useAppContext();
  const periodos = esIndividual ? [6, 12, 24] : [6, 12];

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
      {esIndividual && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tipo Salario</p>
          <div className="flex gap-2">
            <Boton variant={tipoSalarioActual === 'F' ? 'active' : 'default'} onClick={() => setTipoSalario('F')}>
              Fijo
            </Boton>
            <Boton variant={tipoSalarioActual === 'I' ? 'active' : 'default'} onClick={() => setTipoSalario('I')}>
              Integral
            </Boton>
          </div>
        </div>
      )}
    </div>
  );
}
