-- ============================================================================
-- 07_vw_Calculadora_Costos.sql  |  PeopleAnalytics
-- Vista de consumo único para Power Automate y PowerApps.
-- Une ColaboradoresCostos (campos de entrada) con Resultados_Calculo (campos calculados).
-- ============================================================================

USE [PeopleAnalytics];
GO

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
    c.SueldoMensual,             -- CO y EC [SETEADO]
    c.NSueldos,                  -- CO: n° sueldos del bono [SETEADO]
    c.MedicinaPrepagadaAnio,     -- CO [FIJO]
    c.SueldoBase,                -- PE [SETEADO]
    c.Vales,                     -- PE [SETEADO]
    c.ComisionesMensuales,       -- PE/EC [SETEADO]
    c.AsignacionFamiliar,        -- PE: S/113 [FIJO]
    c.Seguro,                    -- EC: monto anual USD [FIJO]

    -- ── Totales calculados (todos los países) ─────────────────────────────────
    r.BonoCPTarget,
    r.BonoCPMensual,
    r.CostoTotalMensual,
    r.CostoAnualML,
    r.CostoAnualUSD,             -- EC: igual a CostoAnualML (USD nativo)
    r.Carga,
    r.PctCarga,

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
