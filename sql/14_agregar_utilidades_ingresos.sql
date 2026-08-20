-- ============================================================================
-- 14_agregar_utilidades_ingresos.sql  |  PeopleAnalytics
-- Migración de Parámetros Salariales (2026-08-19):
--   * ColaboradoresCostos.Utilidades    → campo editable por persona [SETEADO]
--     (utilidades escritas a mano; fórmula de cálculo pendiente, igual que en el
--      prototipo VS Code: camposSumables incluye 'utilidades').
--   * Resultados_Calculo: 5 columnas calculadas de Ingreso por país.
-- Idempotente: cada ALTER se guarda con COL_LENGTH para no fallar al re-ejecutar.
-- NOTA: Seleccionar la base PeopleAnalytics en el dropdown de SSMS antes de
--       ejecutar (USE no es compatible con Azure SQL — ver 00_ejecutar_todo.sql).
-- ============================================================================

-- ── ColaboradoresCostos: Utilidades editable (PE y EC) ──────────────────────
IF COL_LENGTH('PeopleAnalytics.ColaboradoresCostos', 'Utilidades') IS NULL
BEGIN
    ALTER TABLE PeopleAnalytics.ColaboradoresCostos
        ADD Utilidades DECIMAL(18,2) NULL DEFAULT 0;
    PRINT 'ColaboradoresCostos.Utilidades agregada.';
END
ELSE
    PRINT 'ColaboradoresCostos.Utilidades ya existe.';
GO

-- ── Resultados_Calculo: Ingresos calculados por país ────────────────────────
-- PE_IngresoMensual = sueldoMensual + vales + comisionesMensuales
-- PE_IngresoAnual   = ingresoMensual * 14 + bonoCPTarget + utilidades
-- EC_IngresoMensual = sueldoMensual + comisionesMensuales
-- EC_IngresoAnual   = ingresoMensual * 14 + bonoCPTarget + utilidades
-- CO_IngresoMensual = sueldoMensual
-- CO_IngresoAnual   = ingresoMensual * 12 + bonoCPTarget (bono anual = NSueldos x sueldo)
-- (×14 = 12 meses + 2 gratificaciones; regla general PE y EC — el multiplicador
--  aplica sobre el INGRESO MENSUAL completo (sueldo + vales + comisiones), no solo
--  sobre el sueldo base. Ver docs/migracion-parametros-salariales-2026-08-19.md)
IF COL_LENGTH('PeopleAnalytics.Resultados_Calculo', 'PE_IngresoMensual') IS NULL
BEGIN
    ALTER TABLE PeopleAnalytics.Resultados_Calculo
        ADD PE_IngresoMensual DECIMAL(18,2) NULL,
            PE_IngresoAnual   DECIMAL(18,2) NULL,
            EC_IngresoMensual DECIMAL(18,2) NULL,
            EC_IngresoAnual   DECIMAL(18,2) NULL,
            CO_IngresoMensual DECIMAL(18,2) NULL,
            CO_IngresoAnual   DECIMAL(18,2) NULL;
    PRINT 'Resultados_Calculo: columnas de Ingreso agregadas.';
END
ELSE
    PRINT 'Resultados_Calculo: columnas de Ingreso ya existen.';
GO