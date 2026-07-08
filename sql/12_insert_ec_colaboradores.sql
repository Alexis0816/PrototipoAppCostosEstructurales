-- ============================================================================
-- 12_insert_ec_colaboradores.sql  |  PeopleAnalytics
-- Carga inicial de colaboradores Ecuador en ColaboradoresCostos.
-- Ecuador es USD nativo: SueldoMensual y Seguro van en USD directamente.
--
-- Campos EC que SE SETEAN por persona:
--   SueldoMensual  → sueldo básico mensual en USD
--   NSueldos       → multiplicador de bono según Grado (informativo)
--   Seguro         → costo anual Seguro de Vida/Salud en USD [FIJO por persona]
--   Grado          → número entero (9-20); la UI muestra 'G18'
--   Tipo           → 'Administrativo' | 'Operario' | 'Operario Part-Time'
--
-- Tabla NSueldos Target EC:
--   G20    → 3.0 | G18-19 → 2.0 | G16-17 → 1.5 | G9-15 → 1.0
--
-- Campos EC que NO se setean (quedan NULL):
--   NSueldos (CO)          → calculado por persona en CO; aquí solo informativo
--   MedicinaPrepagadaAnio  → es de Colombia
--   Vales, AsignacionFamiliar → son de Perú
-- ============================================================================

INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda, Empresa,
    NombreCompleto, GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoMensual, NSueldos, Seguro
)
VALUES
(
    '1713198024', 'EC', 'USD', 'PRIMAX COMERCIAL DEL ECUADOR S.A.',
    'PAUL ENRIQUE CAJIAS VASCO', 'SSMA', 'SSMA', 'SEGURIDAD & MEDIO AMBIENTE GUAYAQUIL', 'GERENTE SSMA',
    18, 'Administrativo',
    5100, 2.0, 3824
);

-- ── Verificar ──────────────────────────────────────────────────────────────
SELECT NumeroID, NombreCompleto, GerenciaCorp, Area, Puesto, Grado, NSueldos, Tipo,
       SueldoMensual, Seguro
FROM PeopleAnalytics.ColaboradoresCostos
WHERE Pais = 'EC'
ORDER BY SueldoMensual DESC;
