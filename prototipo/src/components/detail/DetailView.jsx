import { useAppContext } from '../../context';
import { useResolvedColaborador, useCalculo } from '../../hooks';
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
  const persona = resuelto ?? actual;
  const r = useCalculo(persona, glob.periodo);

  if (!actual || !persona) return null;

  const esIndividual = tipoVistaDetalle === 'individual';

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <DetailHeader
          tipoVistaDetalle={tipoVistaDetalle}
          nombre={persona.nombreCompleto}
          esIndividual={esIndividual}
          numeroId={persona.numeroId}
        />
        <IdentityCard persona={persona} tipoVistaDetalle={tipoVistaDetalle} />
        <SelectoresControl esIndividual={esIndividual} tipoSalarioActual={persona.tipoSalario} />

        {!esIndividual && <ColaboradoresIncluidos actual={persona} tipoVistaDetalle={tipoVistaDetalle} />}
        {esIndividual && (
          <ParametrosSalariales persona={persona} base={actual} r={r} moneda={glob.moneda} />
        )}

        <KpiRow r={r} periodo={glob.periodo} moneda={glob.moneda} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <DesglosePrestacional persona={persona} r={r} moneda={glob.moneda} />
          </div>
          <div className="lg:col-span-1">
            <ComposicionChart r={r} moneda={glob.moneda} />
          </div>
        </div>
      </div>
    </div>
  );
}
