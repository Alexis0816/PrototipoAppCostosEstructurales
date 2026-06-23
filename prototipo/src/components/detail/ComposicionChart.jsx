import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fmt } from '../../lib/formato.js';

const COLORES = ['#3b82f6', '#f59e0b', '#10b981'];
const ETIQUETAS = ['Salario Neto', 'Carga Prestacional', 'Provisión Beneficios'];

export function ComposicionChart({ r, moneda }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const valores = [r.sueldo, r.carga, r.bonoMensual + r.medicina];
  const total = r.total;

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ETIQUETAS,
        datasets: [{ data: valores, backgroundColor: COLORES, borderWidth: 0, hoverOffset: 4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,29,50,.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#1e3a5f',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `${fmt(ctx.raw, moneda)} (${((ctx.raw / total) * 100).toFixed(0)}%)`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [r.sueldo, r.carga, r.bonoMensual, r.medicina, r.total, moneda]);

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-white mb-6">Composición Mensual</h3>
        <div className="relative h-40 w-40 sm:h-44 sm:w-44 mx-auto mb-6">
          <canvas ref={canvasRef} />
        </div>
      </div>
      <div className="space-y-3 border-t border-navy-800 pt-4">
        {ETIQUETAS.map((etiqueta, i) => {
          const valor = valores[i];
          const porcentaje = ((valor / total) * 100).toFixed(0);
          return (
            <div key={etiqueta} className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORES[i] }} />
              <span className="flex-1">{etiqueta}</span>
              <span className="font-mono font-semibold text-white">{fmt(valor, moneda)}</span>
              <span className="text-xs text-slate-500">({porcentaje}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
