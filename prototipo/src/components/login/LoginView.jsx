import { useState } from 'react';
import { useAppContext } from '../../context';

/* ── Ícono ─────────────────────────────────────────────────── */
function PrimaxMark({ size = 52, fill = 'white', centerFill = 'rgba(255,255,255,.6)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none">
      <g transform="translate(23,23)">
        <rect x="-2.8" y="-14" width="5.6" height="28" rx="2.3" fill={fill} />
        <rect x="-2.8" y="-14" width="5.6" height="28" rx="2.3" fill={fill} transform="rotate(90)" />
        <rect x="-2.8" y="-14" width="5.6" height="28" rx="2.3" fill={fill} transform="rotate(45)" />
        <rect x="-2.8" y="-14" width="5.6" height="28" rx="2.3" fill={fill} transform="rotate(-45)" />
        <circle cx="0" cy="0" r="3.8" fill={centerFill} />
      </g>
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Componente ────────────────────────────────────────────── */
export function LoginView() {
  const { login } = useAppContext();
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setLoading(true);
    setTimeout(login, 1100);
  }

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex">

      {/* Textura sutil de fondo — dot grid como decorado */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Glow suave detrás del contenido izquierdo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 620, height: 620, left: '8%', top: '50%', transform: 'translateY(-50%)',
          background: 'radial-gradient(circle, rgba(59,130,246,.10) 0%, transparent 65%)',
        }}
      />

      {/* ════════════════════════════════════════════════════
          IZQUIERDA — 70% — LOGIN
      ════════════════════════════════════════════════════ */}
      <div className="w-full sm:w-[70%] flex items-center justify-center px-8 py-14 relative z-10">
        <div className="w-full max-w-[380px]">

          {/* Saludo */}
          <h1 className="text-[40px] font-bold text-white leading-[1.05] tracking-tight mb-2">
            Bienvenido
          </h1>
          <p className="text-[15px] text-slate-300 mb-10 leading-relaxed">
            Calculadora de costos estructurales.
          </p>

          {/* Botón principal — mismo azul que el toggle del main */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-[52px] bg-blue-500 hover:bg-blue-600 active:scale-[.985] disabled:opacity-80 disabled:cursor-wait text-white font-bold text-[14px] tracking-[.06em] uppercase rounded-xl transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 24px rgba(59,130,246,.4)' }}
          >
            {loading ? <><SpinIcon /><span>Detectando rol…</span></> : 'Ingresar'}
          </button>

          {/* Nota de rol automático */}
          <div className="mt-6 flex items-start gap-2.5 text-[12.5px] text-slate-400 leading-relaxed">
            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-[3px] text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm0 5a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>
              Tu nivel de acceso se asigna automáticamente según tu perfil corporativo.
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 left-8 text-[11px] text-slate-700">
          People Analytics · {new Date().getFullYear()}
        </p>
      </div>

      {/* ════════════════════════════════════════════════════
          DERECHA — 30% — círculo gigante con la info
      ════════════════════════════════════════════════════ */}
      <div className="hidden sm:block sm:w-[30%] relative">

        {/* Círculo — se curva hacia la izquierda como la referencia */}
        <div
          className="absolute rounded-full"
          style={{
            width: '135vh', height: '135vh',
            top: '50%', left: 0, transform: 'translateY(-50%)',
            background: 'radial-gradient(circle at 32% 38%, #2a4a6f 0%, #1e3a5f 34%, #14293f 68%, #0e1f33 100%)',
            boxShadow: '-24px 0 80px rgba(0,0,0,.5), inset 8px 0 40px rgba(59,130,246,.08)',
          }}
        />

        {/* Anillo decorativo */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '135vh', height: '135vh',
            top: '50%', left: 0, transform: 'translateY(-50%)',
            border: '1px solid rgba(59,130,246,.14)',
          }}
        />

        {/* Contenido dentro de la parte visible del círculo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">

          {/* Ícono naranja */}
          <div
            className="w-[84px] h-[84px] bg-[#E84411] rounded-[19px] flex items-center justify-center"
            style={{ boxShadow: '0 14px 44px rgba(232,68,17,.5), 0 0 0 1px rgba(255,255,255,.08)' }}
          >
            <PrimaxMark size={48} />
          </div>

          <p
            className="text-[28px] font-black text-white tracking-[.07em] leading-none"
            style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}
          >
            PRIMAX
          </p>

          <span
            className="text-[10.5px] font-bold tracking-[.09em] uppercase px-4 py-2 rounded-full"
            style={{ background: 'rgba(232,68,17,.16)', color: '#ffb48a', border: '1px solid rgba(232,68,17,.32)' }}
          >
            Costos Estructurales
          </span>
        </div>
      </div>

    </div>
  );
}
