-- ============================================================================
-- 08_plantilla_carga.sql  |  PeopleAnalytics
-- Plantilla de INSERT de colaboradores por país.
-- Completar con datos reales, descomentar y ejecutar.
-- Siempre terminar con: EXEC PeopleAnalytics.sp_CalcularCostos;
--
-- NOTA: SueldoMensual es el campo único de sueldo para CO, PE y EC.
--       NSueldos se registra en todos los países como referencia informativa.
-- ============================================================================

-- ── COLOMBIA ──────────────────────────────────────────────────────────────────
-- Campos obligatorios: Pais='CO', Moneda='COP', SueldoMensual, NSueldos, Grado
-- Tipo: 'Fijo' | 'Integral'  ← importante para el cálculo de primas
-- MedicinaPrepagadaAnio: 0 si no aplica.
/*
INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda,
    Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoMensual,          -- [SETEADO] mensual en COP
    NSueldos,               -- [SETEADO] multiplicador bono (ej. 2.0); ver tabla Grado→Target
    MedicinaPrepagadaAnio   -- [FIJO] anual en COP; 0 si no aplica
) VALUES
('1013605928', 'CO', 'COP', 'CORPORACION PRIMAX S.A.', 'Nombre Apellido 1',
 'GERENCIA', 'GERENCIA', 'ÁREA', 'GERENTE',
 18, 'Fijo',
 4500000, 2.0, 0),

('1020785674', 'CO', 'COP', 'CORPORACION PRIMAX S.A.', 'Nombre Apellido 2',
 'GERENCIA', 'GERENCIA', 'ÁREA', 'DIRECTOR',
 20, 'Integral',
 12000000, 3.0, 2400000);
*/

-- ── PERÚ ──────────────────────────────────────────────────────────────────────
-- Campos obligatorios: Pais='PE', Moneda='PEN', SueldoMensual, Grado, Tipo
-- NSueldos: informativo (el SP calcula el factor desde Parametros_MultiplicadorBono)
-- Vales y ComisionesMensuales: 0 si no aplican.
-- AsignacionFamiliar: S/113 fijo por ley (registrar siempre).
-- Tipo: 'Administrativo' | 'Operario' | 'Operario Part-Time'
/*
INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda,
    Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoMensual,          -- [SETEADO] mensual en PEN
    NSueldos,               -- [INFORMATIVO] factor bono según Grado
    Vales,                  -- [SETEADO] mensual en PEN (0 si no aplica)
    ComisionesMensuales,    -- [SETEADO] mensual en PEN (0 si no aplica)
    AsignacionFamiliar      -- [FIJO] S/113 por persona
) VALUES
('PE001', 'PE', 'PEN', 'CORPORACION PRIMAX S.A.', 'Nombre Apellido',
 'GERENCIA', 'GERENCIA', 'ÁREA', 'GERENTE',
 19, 'Administrativo',
 19510, 2.0, 2000, 0, 113),

('PE002', 'PE', 'PEN', 'CORPORACION PRIMAX S.A.', 'Nombre Apellido',
 'GERENCIA', 'GERENCIA', 'ÁREA', 'OPERADOR',
 9, 'Operario',
 2500, 0.0, 0, 0, 113);
*/

-- ── ECUADOR ───────────────────────────────────────────────────────────────────
-- Campos obligatorios: Pais='EC', Moneda='USD', SueldoMensual, Grado
-- NSueldos: informativo (el SP calcula el factor desde Parametros_MultiplicadorBono)
-- Seguro: monto anual en USD, fijo por persona.
-- Ecuador es USD nativo: CostoAnualUSD = CostoAnualML.
/*
INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda,
    Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoMensual,          -- [SETEADO] mensual en USD
    NSueldos,               -- [INFORMATIVO] factor bono según Grado
    Seguro                  -- [FIJO] monto anual USD Seguro Salud y Vida
) VALUES
('EC001', 'EC', 'USD', 'PRIMAX COMERCIAL DEL ECUADOR S.A.', 'Nombre Apellido',
 'GERENCIA', 'GERENCIA', 'ÁREA', 'GERENTE',
 18, 'Administrativo',
 5100, 2.0, 3824);
*/

-- ── Recalcular costos después de cada carga ───────────────────────────────────
-- EXEC PeopleAnalytics.sp_CalcularCostos;
-- O para una sola persona:
-- EXEC PeopleAnalytics.sp_CalcularCostos @NumeroID = 'XXXXXXXX';
GO
