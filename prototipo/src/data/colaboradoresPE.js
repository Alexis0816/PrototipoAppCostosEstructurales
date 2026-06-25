import { colaboradores as datosDemo } from './colaboradoresPE.demo.js';

// Lógica para cargar colaboradores de forma segura, sin subir datos sensibles a Git.
// El orden de prioridad es:
// 1. Variables de entorno VITE_COLAB_* (definidas en un archivo .env.local).
// 2. Archivo local `src/data/colaboradoresPE.local.js` (si existe).
// 3. Datos de demostración (`colaboradoresPE.demo.js`) como última opción.

let colaboradoresLocales = null;

// 1. Intentar cargar desde variables de entorno (ideal para datos sensibles)
const envColab = {
  nombre: import.meta.env.VITE_COLAB_NOMBRE,
  puesto: import.meta.env.VITE_COLAB_PUESTO,
  gerencia: import.meta.env.VITE_COLAB_GERENCIA,
  area: import.meta.env.VITE_COLAB_AREA,
  grado: import.meta.env.VITE_COLAB_GRADO,
  basico: import.meta.env.VITE_COLAB_BASICO,
  vales: import.meta.env.VITE_COLAB_VALES,
  asigFam: import.meta.env.VITE_COLAB_ASIGFAM,
  comisiones: import.meta.env.VITE_COLAB_COMISIONES,
};

// Si la variable principal (nombre) existe, construimos el colaborador desde el .env
if (envColab.nombre) {
  colaboradoresLocales = [
    {
      // --- Core Identification ---
      numeroId: 'ENV-001', // ID de ejemplo para datos desde .env
      nombreCompleto: envColab.nombre,
      puesto: envColab.puesto || 'Puesto no definido',
      empresa: 'PRIMAX S.A.',
      ciudad: 'Lima',
      contrato: 'Indefinido',

      // --- Organizational Hierarchy ---
      gerenciaCorp: 'FIN', // Placeholder
      gerencia: envColab.gerencia || 'Gerencia no definida',
      area: envColab.area || 'Área no definida',

      // --- Country & Salary Structure ---
      pais: 'PE',
      moneda: 'PEN', // Moneda del colaborador, requerido por algunos componentes
      tipo: 'Administrativo', // Asumir 'Administrativo' para testing de bono

      // --- Grade & Labels (Crucial for UI) ---
      grado: `G${parseInt(envColab.grado, 10) || 0}`, // e.g., "G18"
      gradoLabel: envColab.puesto || 'Puesto no definido', // Usar puesto como fallback seguro

      // --- Core Salary Components (for calculation) ---
      sueldoBase: parseFloat(envColab.basico) || 0,
      vales: parseFloat(envColab.vales) || 0,
      comisionesMensuales: parseFloat(envColab.comisiones) || 0,
      asignacionFamiliar: envColab.asigFam ? parseFloat(envColab.asigFam) : 113,

      // --- Display Properties ---
      avatarColor: 'linear-gradient(135deg,#8b5cf6,#6366f1)', // Color de avatar por defecto
      avatarIniciales: envColab.nombre.split(' ').map((n) => n[0]).join(''),
    },
  ];
}

// 2. Si no se cargó desde .env, intentar cargar desde archivo local.
if (!colaboradoresLocales) {
  const modulosLocales = import.meta.glob('./colaboradoresPE.local.js', { eager: true });
  colaboradoresLocales = Object.values(modulosLocales)[0]?.colaboradores;
}

const forzarDemo = import.meta.env.VITE_FORZAR_DATOS_DEMO === 'true';

export const colaboradores = !forzarDemo && colaboradoresLocales ? colaboradoresLocales : datosDemo;
