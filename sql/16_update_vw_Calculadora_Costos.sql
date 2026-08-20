-- ============================================================================
-- 16_update_vw_Calculadora_Costos.sql  |  PeopleAnalytics
-- Actualiza vw_Calculadora_Costos para exponer (2026-08-19):
--   * c.Utilidades          → editable (PE/EC, escrito a mano)
--   * r.CO_IngresoMensual   → calculado
--   * r.PE_IngresoMensual   → calculado
--   * r.PE_IngresoAnual     → calculado
--   * r.EC_IngresoMensual   → calculado
--   * r.EC_IngresoAnual     → calculado
-- NOTA: Seleccionar la base PeopleAnalytics en el dropdown de SSMS antes de
--       ejecutar (USE no es compatible con Azure SQL — ver 00_ejecutar_todo.sql).
-- ============================================================================

IF OBJECT_ID('PeopleAnalytics.vw_Calculadora_Costos', 'V') IS NOT NULL
    DROP VIEW PeopleAnalytics.vw_Calculadora_Costos;
GO

CREATE VIEW PeopleAnalytics.vw_Calculadora_Costos AS
SELECT
    -- ── Identificación ────────────────────────────────────────────────────────
    c.NumeroID,
    c.Pais,
    c.Moneda,
    c.Empresa,
    c.NombreCompleto,
    c.GerenciaCorp,
    c.Gerencia,
    c.Area,
    c.Puesto,
    c.Grado,            -- INT; la UI añade el prefijo 'G'
    c.Tipo,

    -- ── Campos de entrada por país ────────────────────────────────────────────
    c.SueldoMensual,             -- todos los países [SETEADO]
    c.NSueldos,                  -- CO: n° sueldos del bono [SETEADO]
    c.MedicinaPrepagadaAnio,     -- CO [FIJO]
    c.Vales,                     -- PE [SETEADO]
    c.ComisionesMensuales,       -- PE/EC [SETEADO]
    c.AsignacionFamiliar,        -- PE: S/113 [FIJO]
    c.Seguro,                    -- EC: monto anual USD [FIJO]
    c.Utilidades,                -- PE/EC [SETEADO, escrito a mano] (2026-08-19)

    -- ── Totales calculados (todos los países) ─────────────────────────────────
    r.BonoCPTarget,
    r.BonoCPMensual,
    r.CostoTotalMensual,
    r.CostoAnualML,
    r.CostoAnualUSD,             -- EC: igual a CostoAnualML (USD nativo)
    r.Carga,
    r.PctCarga,

    -- ── Ingresos por país (nuevos, 2026-08-19) ────────────────────────────────
    r.CO_IngresoMensual,         -- CO = sueldoMensual
    r.CO_IngresoAnual,           -- CO = ingresoMensual*12 + bonoCPTarget
    r.PE_IngresoMensual,         -- PE = sueldo + vales + comisiones
    r.PE_IngresoAnual,           -- PE = ingresoMensual*14 + bono + utilidades
    r.EC_IngresoMensual,         -- EC = sueldo + comisiones
    r.EC_IngresoAnual,           -- EC = ingresoMensual*14 + bono + utilidades

    -- ── Desglose Colombia ─────────────────────────────────────────────────────
    r.CO_SalarioAnual,
    r.CO_Base,
    r.CO_PrimaVacaciones,
    r.CO_PrimaNavidad,
    r.CO_PrimaServicios,
    r.CO_Cesantias,
    r.CO_ICesantias,
    r.CO_AportesPrimas,
    r.CO_PrimaVacacionesMensual,
    r.CO_PrimaNavidadMensual,
    r.CO_PrimaServiciosMensual,
    r.CO_CesantiasMensual,
    r.CO_ICesantiasMensual,
    r.CO_AportesPrimasMensual,
    r.CO_MedicinaMensual,
    r.CO_BonoMensual,

    -- ── Desglose Perú ─────────────────────────────────────────────────────────
    r.PE_RemuneracionBase,
    r.PE_IngresosTotales,
    r.PE_Gratificaciones,
    r.PE_CTS,
    r.PE_EsSalud,
    r.PE_SeguroVidaLey,
    r.PE_CostoDeVales,
    r.PE_CostoLaboralBonoCP,

    -- ── Desglose Ecuador ──────────────────────────────────────────────────────
    r.EC_XIIIAnual,
    r.EC_SBUAnual,
    r.EC_FondoAnual,
    r.EC_AportePatronalAnual,
    r.EC_VacacionesAnual,
    r.EC_XIIIMensual,
    r.EC_SBUMensual,
    r.EC_FondoMensual,
    r.EC_AportePatronalMensual,
    r.EC_VacacionesMensual,
    r.EC_SeguroMensual,

    r.FechaCalculo

FROM PeopleAnalytics.ColaboradoresCostos c
LEFT JOIN PeopleAnalytics.Resultados_Calculo r ON c.NumeroID = r.NumeroID;
GO