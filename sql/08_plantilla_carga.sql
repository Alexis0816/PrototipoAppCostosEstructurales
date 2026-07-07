-- ============================================================================
-- 08_plantilla_carga.sql  |  PeopleAnalytics
-- Plantilla de INSERT de colaboradores por país.
-- Completar con datos reales, descomentar y ejecutar.
-- Siempre terminar con: EXEC PeopleAnalytics.sp_CalcularCostos;
-- ============================================================================

USE [PeopleAnalytics];
GO

-- ── COLOMBIA ──────────────────────────────────────────────────────────────────
-- Campos obligatorios: Pais, Moneda, SueldoMensual, NSueldos, Grado
-- MedicinaPrepagadaAnio: 0 si no aplica.
/*
INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda,
    Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoMensual,          -- [SETEADO] en COP
    NSueldos,               -- [SETEADO] número de sueldos del bono (ej. 2.5)
    MedicinaPrepagadaAnio   -- [FIJO] anual en COP; 0 si no aplica
) VALUES
('1013605928', 'CO', 'COP', 'Empresa SA', 'Nombre Apellido 1',
 'GerenciaCorp', 'Gerencia', 'Área', 'Gerente Comercial',
 18, 'Administrativo',
 4500000, 2.5, 0),

('1020785674', 'CO', 'COP', 'Empresa SA', 'Nombre Apellido 2',
 'GerenciaCorp', 'Gerencia', 'Área', 'Coordinador de Ventas',
 16, 'Administrativo',
 12000000, 3.0, 2400000);
*/

-- ── PERÚ ──────────────────────────────────────────────────────────────────────
-- Campos obligatorios: Pais, Moneda, SueldoBase, Grado, Tipo
-- Vales y ComisionesMensuales: 0 si no aplican.
-- AsignacionFamiliar: S/113 (valor legal fijo; registrar por persona).
/*
INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda,
    Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoBase,             -- [SETEADO] mensual en PEN
    Vales,                  -- [SETEADO] mensual en PEN (0 si no aplica)
    ComisionesMensuales,    -- [SETEADO] mensual en PEN (0 si no aplica)
    AsignacionFamiliar      -- [FIJO] S/113 por persona
) VALUES
('PE001', 'PE', 'PEN', 'Primax Peru SAC', 'Nombre Apellido',
 'Operaciones', 'Gerencia de Operaciones', 'Estaciones', 'Jefe de Operaciones',
 18, 'Administrativo',
 19520, 2000, 0, 113),

('PE002', 'PE', 'PEN', 'Primax Peru SAC', 'Nombre Apellido',
 'Operaciones', 'Gerencia de Operaciones', 'Patio', 'Operador de Estación',
 9, 'Operario',
 2500, 0, 0, 113);
*/

-- ── ECUADOR ───────────────────────────────────────────────────────────────────
-- Campos obligatorios: Pais, Moneda, SueldoMensual, Grado
-- Seguro: monto anual en USD, fijo por persona.
-- ComisionesMensuales: 0 si no aplica.
/*
INSERT INTO PeopleAnalytics.ColaboradoresCostos (
    NumeroID, Pais, Moneda,
    Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, Tipo,
    SueldoMensual,          -- [SETEADO] en USD
    ComisionesMensuales,    -- [SETEADO] en USD (0 si no aplica)
    Seguro                  -- [FIJO] monto anual USD Seguro Salud y Vida
) VALUES
('EC001', 'EC', 'USD', 'Primax Ecuador SA', 'Nombre Apellido',
 'Operaciones', 'Gerencia de Operaciones', 'Estaciones', 'Gerente Regional de Estaciones',
 18, 'Administrativo',
 5950, 0, 1200);
*/

-- ── Recalcular costos después de cada carga ───────────────────────────────────
-- EXEC PeopleAnalytics.sp_CalcularCostos;
GO
