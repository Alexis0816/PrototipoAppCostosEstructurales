-- ============================================================================
-- 10_insert_pe_colaboradores.sql  |  PeopleAnalytics
-- Carga inicial de colaboradores Perú en ColaboradoresCostos.
-- Ejecutar ANTES de sp_CalcularCostos para que calcule los resultados.
--
-- Campos PE que SE SETEAN por persona:
--   SueldoMensual       → sueldo básico mensual en PEN
--   NSueldos            → multiplicador de bono según Grado (informativo; el SP
--                         lo calcula automático, pero se registra para referencia)
--   Vales               → vales de alimentos mensuales en PEN
--   ComisionesMensuales → comisiones mensuales en PEN (0 si no aplica)
--   AsignacionFamiliar  → S/113 fijo por ley (ya tiene DEFAULT 113)
--   Grado               → número entero (9-21); la UI muestra 'G19'
--   Tipo                → 'Administrativo' | 'Operario' | 'Operario Part-Time'
--
-- Tabla NSueldos Target PE (igual que CO):
--   G20-21 → 3.0 | G18-19 → 2.0 | G16-17 → 1.5 | G9-15 → 1.0
--   Operario / Operario Part-Time → 0.0 (sin bono)
--
-- Campos PE que NO se setean (quedan NULL):
--   MedicinaPrepagadaAnio  → es de Colombia
--   Seguro                 → es de Ecuador
-- ============================================================================

-- ── Corregir registro ya insertado (mayúsculas + NSueldos informativo) ─────
UPDATE PeopleAnalytics.ColaboradoresCostos
SET
    Gerencia  = 'GERENCIA DE NEGOCIOS PERU',
    Area      = 'MINERÍA',
    Puesto    = 'GERENTE MINERÍA',
    NSueldos  = 2.0   -- G19 → Factor 2.0 (informativo; el SP lo toma de Parametros_MultiplicadorBono)
WHERE NumeroID = '07640791';
GO

-- ── INSERT (solo si el registro NO existe aún) ────────────────────────────
INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda, Empresa,
    NombreCompleto, GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoMensual, NSueldos, Vales, ComisionesMensuales, AsignacionFamiliar
)
VALUES
(
    '07640791', 'PE', 'PEN', 'CORPORACION PRIMAX S.A.',
    'WILLY TELLO UGAS', 'GERENCIA DE NEGOCIOS PERU', 'GERENCIA DE NEGOCIOS PERU', 'MINERÍA', 'GERENTE MINERÍA',
    19, 'Administrativo',
    19510, 2.0, 2000, 0, 113
);

-- ── Verificar ──────────────────────────────────────────────────────────────
SELECT NumeroID, NombreCompleto, Grado, NSueldos, Tipo,
       SueldoMensual, Vales, ComisionesMensuales, AsignacionFamiliar
FROM PeopleAnalytics.ColaboradoresCostos
WHERE Pais = 'PE'
ORDER BY SueldoMensual DESC;
