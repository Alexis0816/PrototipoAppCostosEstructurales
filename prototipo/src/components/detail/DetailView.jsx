import { useAppContext } from '../../context/AppContext.jsx';
import { useResolvedColaborador } from '../../hooks/useResolvedColaborador.js';
import { useCalculo } from '../../hooks/useCalculo.js';
import { NavBar } from '../layout/NavBar.jsx';
import { DetailHeader } from './DetailHeader.jsx';
import { IdentityCard } from './IdentityCard.jsx';
import { SelectoresControl } from './SelectoresControl.jsx';
import { ColaboradoresIncluidos } from './ColaboradoresIncluidos.jsx';
import { ParametrosSalariales } from './ParametrosSalariales.jsx';
import { KpiRow } from './KpiRow.jsx';
import { DesglosePrestacional } from './DesglosePrestacional.jsx';
import { ComposicionChart } from './ComposicionChart.jsx';

export function DetailView() {
  const { actual, tipoVistaDetalle, cacheEdiciones, glob } = useAppContext();
  const resuelto = useResolvedColaborador(actual, cacheEdiciones);
  const r = useCalculo(resuelto ?? actual, glob.periodo);

  if (!actual || !resuelto) return null;

  const esIndividual = tipoVistaDetalle === 'individual';

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <DetailHeader
          tipoVistaDetalle={tipoVistaDetalle}
          nombre={resuelto.nombreCompleto}
          esIndividual={esIndividual}
          numeroId={resuelto.numeroId}
        />
        <IdentityCard persona={resuelto} tipoVistaDetalle={tipoVistaDetalle} />
        <SelectoresControl esIndividual={esIndividual} tipoSalarioActual={resuelto.tipoSalario} />

        {!esIndividual && <ColaboradoresIncluidos actual={resuelto} tipoVistaDetalle={tipoVistaDetalle} />}
        {esIndividual && (
          <ParametrosSalariales persona={resuelto} base={actual} r={r} moneda={glob.moneda} />
        )}

        <KpiRow r={r} periodo={glob.periodo} moneda={glob.moneda} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <DesglosePrestacional persona={resuelto} r={r} moneda={glob.moneda} />
          </div>
          <div className="lg:col-span-1">
            <ComposicionChart r={r} moneda={glob.moneda} />
          </div>
        </div>
      </div>
    </div>
  );
}
