-- ============================================================================
-- 06_sp_CalcularCostos.sql  |  PeopleAnalytics
-- Recalcula todos los costos laborales y hace MERGE en Resultados_Calculo.
-- Ejecutar después de cada INSERT / UPDATE en ColaboradoresCostos.
--
-- Fórmulas resumidas por país:
--
-- COLOMBIA
--   Base         = SalarioAnual + PrimaVac + PrimaNav + BonoTarget
--   BonoTarget   = SueldoMensual × NSueldos  [seteado por persona]
--   AportesPrimas= Base × RECARGO_PAR  [única tasa, desde Parametros_Tasas]
--   CostoAnualML = SalAnual + PrimaVac + PrimaNav + PrimaServ + Cesant
--                  + ICesant + Med + Bono + AportesPrimas
--   CostoAnualUSD = ROUND(CostoAnualML / TIPO_CAMBIO_USD)
--
-- PERÚ
--   RemBase     = SueldoBase + Comisiones + AsignacionFamiliar
--   CTS         = FLOOR(RemBase × 7/72)   ← TRUNC, nunca ROUND
--   BonoTarget  = SueldoBase × Factor(Grado)  [0 si Operario/Operario PT]
--   BonoCPMensual = ROUND((BonoTarget + ROUND(BonoTarget × 13.86%)) / 12)
--   CostoAnualML  = FLOOR((BonoCPMensual + costoTotalMensualFloat) × 12)
--   CostoAnualUSD = ROUND(CostoAnualML / TIPO_CAMBIO_USD)
--
-- ECUADOR
--   BonoTarget   = SueldoMensual × Factor(Grado)
--   BonoCPMensual = ROUND(BonoTarget / 12)
--   XIIIAnual = FondoAnual = bonoCPMensual + SueldoMensual
--   AporteAnual = ROUND((BonoTarget + SalAnual) × 12.15%)
--   VacAnual    = ROUND((BonoTarget + SalAnual) × 0.5 / 12)
--   CostoAnualML = SalAnual + Bono + XIII + SBU + Fondo + Aporte + Vac + Seguro
--   CostoAnualUSD = CostoAnualML  (Ecuador es USD nativo)
-- ============================================================================

USE [PeopleAnalytics];
GO

IF OBJECT_ID('PeopleAnalytics.sp_CalcularCostos', 'P') IS NOT NULL
    DROP PROCEDURE PeopleAnalytics.sp_CalcularCostos;
GO

CREATE PROCEDURE PeopleAnalytics.sp_CalcularCostos
    @NumeroID VARCHAR(20) = NULL   -- NULL → recalcula todos | valor → solo esa persona
AS
BEGIN
    SET NOCOUNT ON;

    -- ------------------------------------------------------------------
    -- PASO 1: Cargar tasas en variables locales
    -- ------------------------------------------------------------------
    DECLARE
        -- Colombia
        @CO_PAR         DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='CO' AND Parametro='RECARGO_PAR'),
        @CO_TC_USD      DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='CO' AND Parametro='TIPO_CAMBIO_USD'),
        -- Perú
        @PE_GRAT        DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='PE' AND Parametro='GRATIFICACIONES'),
        @PE_ESSALUD     DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='PE' AND Parametro='ES_SALUD'),
        @PE_SVL         DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='PE' AND Parametro='SEGURO_VIDA_LEY'),
        @PE_BONO_FACTOR DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='PE' AND Parametro='BONO_CP_FACTOR'),
        @PE_TC_USD      DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='PE' AND Parametro='TIPO_CAMBIO_USD'),
        -- Ecuador
        @EC_APORTE      DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='EC' AND Parametro='APORTE_PATRONAL'),
        @EC_SBU         DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='EC' AND Parametro='SBU');

    -- ------------------------------------------------------------------
    -- PASO 2: CTEs de cálculo
    -- ------------------------------------------------------------------
    ;WITH

    -- ── Base: normaliza NULLs y obtiene el multiplicador de bono ──────────────
    Base AS (
        SELECT
            c.NumeroID,
            c.Pais,
            c.Grado,            -- INT puro; la UI añade el prefijo 'G'
            c.Tipo,

            ISNULL(c.SueldoMensual,        0) AS SM,      -- CO y EC [SETEADO]
            ISNULL(c.SueldoBase,           0) AS SB,      -- PE [SETEADO]
            ISNULL(c.NSueldos,             0) AS NS,      -- CO: n° sueldos del bono [SETEADO]
            ISNULL(c.MedicinaPrepagadaAnio, 0) AS Med,    -- CO [FIJO]
            ISNULL(c.Vales,                0) AS Vales,   -- PE [SETEADO]
            ISNULL(c.ComisionesMensuales,  0) AS Coms,    -- PE/EC [SETEADO]
            ISNULL(c.AsignacionFamiliar,   0) AS AsigFam, -- PE: S/113 [FIJO]
            ISNULL(c.Seguro,               0) AS Seguro,  -- EC: anual USD [FIJO]

            ISNULL(mb.Factor, 0) AS MultBono,  -- PE y EC: factor de bono por grado
            @CO_PAR                AS CO_ParRate,         -- tasa PAR única para CO

            -- Perú: Operario y Operario Part-Time no reciben bono
            CASE WHEN c.Pais = 'PE'
                      AND c.Tipo IN ('Operario', 'Operario Part-Time')
                 THEN 0 ELSE 1
            END AS TieneBono

        FROM PeopleAnalytics.ColaboradoresCostos c
        LEFT JOIN PeopleAnalytics.Parametros_MultiplicadorBono mb
            ON  mb.Pais  = c.Pais
            AND c.Grado  BETWEEN mb.GradoMin AND mb.GradoMax
        WHERE @NumeroID IS NULL OR c.NumeroID = @NumeroID
    ),


    -- ═══════════════════════════════════════════════════════════════════════════
    -- COLOMBIA
    -- ═══════════════════════════════════════════════════════════════════════════
    CalcCO AS (
        SELECT
            b.NumeroID,
            b.SM, b.NS, b.Med AS CO_Med, b.CO_ParRate,
            -- Salario Integral: PrimaVac, PrimaNav, PrimaServ, Cesantías = 0 (absorbidas)
            CASE WHEN b.Tipo = 'Integral' THEN 1 ELSE 0 END  AS CO_EsIntegral,
            b.SM * 12.0         AS CO_SalAnual,
            b.SM * b.NS         AS CO_BonoTarget,
            b.SM * b.NS / 12.0  AS CO_BonoMensual,
            CASE WHEN b.Tipo = 'Integral' THEN 0 ELSE b.SM * 1.0 END  AS CO_PrimaVac,
            CASE WHEN b.Tipo = 'Integral' THEN 0 ELSE b.SM * 0.5 END  AS CO_PrimaNav,
            -- Base Fijo     = SalAnual + PrimaVac + PrimaNav + Bono
            -- Base Integral = SalAnual + Bono  (sin primas, son parte del sueldo)
            CASE WHEN b.Tipo = 'Integral'
                 THEN (b.SM * 12.0) + (b.SM * b.NS)
                 ELSE (b.SM * 12.0) + (b.SM * 1.0) + (b.SM * 0.5) + (b.SM * b.NS)
            END AS CO_Base
        FROM Base b
        WHERE b.Pais = 'CO'
    ),
    CalcCO2 AS (
        SELECT co.*,
            CASE WHEN co.CO_EsIntegral = 1 THEN 0 ELSE co.CO_Base / 12.0          END AS CO_PrimaServ,
            CASE WHEN co.CO_EsIntegral = 1 THEN 0 ELSE co.CO_Base / 12.0          END AS CO_Cesantias,
            CASE WHEN co.CO_EsIntegral = 1 THEN 0 ELSE (co.CO_Base / 12.0) * 0.12 END AS CO_ICesantias,
            co.CO_Base * co.CO_ParRate  AS CO_Aportes
        FROM CalcCO co
    ),
    CalcCOFinal AS (
        SELECT co.*,
            co.CO_SalAnual + co.CO_PrimaVac + co.CO_PrimaNav
            + co.CO_PrimaServ + co.CO_Cesantias + co.CO_ICesantias
            + co.CO_Med + co.CO_BonoTarget + co.CO_Aportes  AS CO_CostoAnualML,
            -- Provisiones mensuales
            co.CO_PrimaVac   / 12.0  AS CO_PrimaVacMens,
            co.CO_PrimaNav   / 12.0  AS CO_PrimaNavMens,
            co.CO_PrimaServ  / 12.0  AS CO_PrimaServMens,
            co.CO_Cesantias  / 12.0  AS CO_CesantiasMens,
            co.CO_ICesantias / 12.0  AS CO_ICesantiasMens,
            co.CO_Aportes    / 12.0  AS CO_AportesMens,
            co.CO_Med        / 12.0  AS CO_MedMens
        FROM CalcCO2 co
    ),


    -- ═══════════════════════════════════════════════════════════════════════════
    -- PERÚ
    -- CTS: FLOOR (= TRUNC = INT() de Excel). NUNCA ROUND.
    -- CostoAnualML: aritmética float antes del FLOOR final.
    -- ═══════════════════════════════════════════════════════════════════════════
    CalcPE AS (
        SELECT
            b.NumeroID,
            b.SB, b.Vales, b.Coms, b.AsigFam,
            b.SB + b.Coms + b.AsigFam            AS PE_RemBase,
            b.SB + b.Vales + b.Coms + b.AsigFam  AS PE_Ingresos,
            CASE WHEN b.TieneBono = 1
                 THEN b.SB * b.MultBono ELSE 0 END  AS PE_BonoCPTarget
        FROM Base b
        WHERE b.Pais = 'PE'
    ),
    CalcPEFinal AS (
        SELECT pe.*,
            ROUND(pe.PE_RemBase * @PE_GRAT,    0)  AS PE_Gratificaciones,
            FLOOR (pe.PE_RemBase * 7.0 / 72.0)    AS PE_CTS,          -- FLOOR, no ROUND
            ROUND(pe.PE_RemBase * @PE_ESSALUD, 0)  AS PE_EsSalud,
            ROUND(pe.PE_RemBase * @PE_SVL,     0)  AS PE_SeguroVidaLey,
            ROUND(pe.Vales * 0.01,             0)  AS PE_CostoDeVales,
            ROUND(pe.PE_BonoCPTarget * @PE_BONO_FACTOR, 0)  AS PE_CostoLaboralBono,
            ROUND((pe.PE_BonoCPTarget
                   + ROUND(pe.PE_BonoCPTarget * @PE_BONO_FACTOR, 0)) / 12.0, 0)
                                                    AS PE_BonoCPMensual,
            -- CostoTotalMensual: float interno → FLOOR (= INT() en Excel)
            FLOOR(
                pe.PE_Ingresos
                + pe.PE_RemBase * @PE_GRAT
                + pe.PE_RemBase * 7.0 / 72.0
                + pe.PE_RemBase * @PE_ESSALUD
                + pe.PE_RemBase * @PE_SVL
                + pe.Vales * 0.01
            )  AS PE_CostoTotalMensual
        FROM CalcPE pe
    ),
    CalcPEAnual AS (
        SELECT pf.*,
            -- CostoAnualML = FLOOR((bonoCPMensual + costoTotalMensualFloat) × 12)
            FLOOR((
                pf.PE_BonoCPMensual
                + pf.PE_Ingresos
                + pf.PE_RemBase * @PE_GRAT
                + pf.PE_RemBase * 7.0 / 72.0
                + pf.PE_RemBase * @PE_ESSALUD
                + pf.PE_RemBase * @PE_SVL
                + pf.Vales * 0.01
            ) * 12.0)  AS PE_CostoAnualML,
            pf.PE_Gratificaciones + pf.PE_CTS + pf.PE_EsSalud
            + pf.PE_SeguroVidaLey + pf.PE_CostoDeVales  AS PE_Carga
        FROM CalcPEFinal pf
    ),


    -- ═══════════════════════════════════════════════════════════════════════════
    -- ECUADOR
    -- USD nativo: costoAnualUSD = costoAnualML.
    -- Seguro: campo fijo por persona, no calculado.
    -- VacacionesAnual = ROUND((BonoCPTarget + SalAnual) × 0.5 / 12)
    -- ═══════════════════════════════════════════════════════════════════════════
    CalcEC AS (
        SELECT
            b.NumeroID,
            b.SM, b.Seguro,
            b.SM * 12.0                      AS EC_SalAnual,
            b.SM * b.MultBono                AS EC_BonoCPTarget,
            ROUND(b.SM * b.MultBono / 12.0, 0)  AS EC_BonoCPMensual
        FROM Base b
        WHERE b.Pais = 'EC'
    ),
    CalcECFinal AS (
        SELECT ec.*,
            ec.EC_BonoCPMensual + ec.SM      AS EC_XIIIAnual,   -- = base mensual (1 mes)
            @EC_SBU                          AS EC_SBUAnual,    -- 482 USD fijo
            ec.EC_BonoCPMensual + ec.SM      AS EC_FondoAnual,  -- = XIII
            ROUND((ec.EC_BonoCPTarget + ec.EC_SalAnual) * @EC_APORTE, 0)
                                             AS EC_AporteAnual,
            ROUND((ec.EC_BonoCPTarget + ec.EC_SalAnual) * 0.5 / 12.0, 0)
                                             AS EC_VacAnual,
            ec.Seguro                        AS EC_SeguroAnual  -- [FIJO, no calculado]
        FROM CalcEC ec
    ),
    CalcECAnual AS (
        SELECT ef.*,
            ef.EC_SalAnual + ef.EC_BonoCPTarget
            + ef.EC_XIIIAnual + ef.EC_SBUAnual + ef.EC_FondoAnual
            + ef.EC_AporteAnual + ef.EC_VacAnual + ef.EC_SeguroAnual  AS EC_CostoAnualML,
            -- Provisiones mensuales (floats, 2 decimales en display)
            ef.EC_XIIIAnual   / 12.0  AS EC_XIIIMens,
            @EC_SBU           / 12.0  AS EC_SBUMens,
            ef.EC_FondoAnual  / 12.0  AS EC_FondoMens,
            ef.EC_AporteAnual / 12.0  AS EC_AporteMens,
            ef.EC_VacAnual    / 12.0  AS EC_VacMens,
            ef.EC_SeguroAnual / 12.0  AS EC_SeguroMens
        FROM CalcECFinal ef
    ),
    CalcECCarga AS (
        SELECT ea.*,
            ea.EC_XIIIMens + ea.EC_SBUMens + ea.EC_FondoMens
            + ea.EC_AporteMens + ea.EC_VacMens + ea.EC_SeguroMens  AS EC_Carga
        FROM CalcECAnual ea
    ),


    -- ── Unión de los tres países ──────────────────────────────────────────────
    Union_Resultados AS (

        SELECT  -- Colombia
            co.NumeroID,
            co.CO_BonoTarget                           AS BonoCPTarget,
            co.CO_BonoMensual                          AS BonoCPMensual,
            co.CO_CostoAnualML / 12.0                  AS CostoTotalMensual,
            co.CO_CostoAnualML                         AS CostoAnualML,
            ROUND(co.CO_CostoAnualML / @CO_TC_USD, 0)  AS CostoAnualUSD,
            (co.CO_CostoAnualML - co.CO_SalAnual - co.CO_BonoTarget - co.CO_Med) / 12.0  AS Carga,
            CASE WHEN co.SM > 0
                 THEN ((co.CO_CostoAnualML - co.CO_SalAnual - co.CO_BonoTarget - co.CO_Med)
                        / 12.0 / co.SM) * 100.0
                 ELSE 0 END  AS PctCarga,
            -- CO desglose
            co.CO_SalAnual, co.CO_Base,
            co.CO_PrimaVac, co.CO_PrimaNav, co.CO_PrimaServ,
            co.CO_Cesantias, co.CO_ICesantias, co.CO_Aportes,
            co.CO_PrimaVacMens, co.CO_PrimaNavMens, co.CO_PrimaServMens,
            co.CO_CesantiasMens, co.CO_ICesantiasMens, co.CO_AportesMens,
            co.CO_MedMens, co.CO_BonoMensual AS CO_BonoMens,
            -- PE (NULL)
            NULL AS PE_RemBase,  NULL AS PE_Ingresos,
            NULL AS PE_Grat,     NULL AS PE_CTS,        NULL AS PE_EsSalud,
            NULL AS PE_SVL,      NULL AS PE_CostoVales, NULL AS PE_CostoLaboralBono,
            -- EC (NULL)
            NULL AS EC_XIII,     NULL AS EC_SBU,        NULL AS EC_Fondo,
            NULL AS EC_Aporte,   NULL AS EC_Vac,
            NULL AS EC_XIIIMens, NULL AS EC_SBUMens,    NULL AS EC_FondoMens,
            NULL AS EC_AporteMens, NULL AS EC_VacMens,  NULL AS EC_SeguroMens
        FROM CalcCOFinal co

        UNION ALL

        SELECT  -- Perú
            pa.NumeroID,
            pa.PE_BonoCPTarget, pa.PE_BonoCPMensual,
            pa.PE_CostoTotalMensual,
            pa.PE_CostoAnualML,
            ROUND(pa.PE_CostoAnualML / @PE_TC_USD, 0),
            pa.PE_Carga,
            CASE WHEN pa.SB > 0 THEN (pa.PE_Carga / pa.SB) * 100.0 ELSE 0 END,
            -- CO (NULL)
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            -- PE
            pa.PE_RemBase, pa.PE_Ingresos,
            pa.PE_Gratificaciones, pa.PE_CTS, pa.PE_EsSalud,
            pa.PE_SeguroVidaLey, pa.PE_CostoDeVales, pa.PE_CostoLaboralBono,
            -- EC (NULL)
            NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, NULL, NULL, NULL
        FROM CalcPEAnual pa

        UNION ALL

        SELECT  -- Ecuador
            ec.NumeroID,
            ec.EC_BonoCPTarget, ec.EC_BonoCPMensual,
            ec.SM + ec.EC_Carga,   -- costoTotalMensual = sueldo + cargas
            ec.EC_CostoAnualML,
            ec.EC_CostoAnualML,    -- USD nativo; costoAnualUSD = costoAnualML
            ec.EC_Carga,
            CASE WHEN ec.SM > 0 THEN (ec.EC_Carga / ec.SM) * 100.0 ELSE 0 END,
            -- CO (NULL)
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            -- PE (NULL)
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            -- EC
            ec.EC_XIIIAnual, ec.EC_SBUAnual, ec.EC_FondoAnual,
            ec.EC_AporteAnual, ec.EC_VacAnual,
            ec.EC_XIIIMens, ec.EC_SBUMens, ec.EC_FondoMens,
            ec.EC_AporteMens, ec.EC_VacMens, ec.EC_SeguroMens
        FROM CalcECCarga ec
    )

    -- ------------------------------------------------------------------
    -- PASO 3: MERGE → Resultados_Calculo
    -- ------------------------------------------------------------------
    MERGE PeopleAnalytics.Resultados_Calculo AS T
    USING Union_Resultados AS S ON T.NumeroID = S.NumeroID

    WHEN MATCHED THEN UPDATE SET
        T.BonoCPTarget              = S.BonoCPTarget,
        T.BonoCPMensual             = S.BonoCPMensual,
        T.CostoTotalMensual         = S.CostoTotalMensual,
        T.CostoAnualML              = S.CostoAnualML,
        T.CostoAnualUSD             = S.CostoAnualUSD,
        T.Carga                     = S.Carga,
        T.PctCarga                  = S.PctCarga,
        T.CO_SalarioAnual           = S.CO_SalAnual,
        T.CO_Base                   = S.CO_Base,
        T.CO_PrimaVacaciones        = S.CO_PrimaVac,
        T.CO_PrimaNavidad           = S.CO_PrimaNav,
        T.CO_PrimaServicios         = S.CO_PrimaServ,
        T.CO_Cesantias              = S.CO_Cesantias,
        T.CO_ICesantias             = S.CO_ICesantias,
        T.CO_AportesPrimas          = S.CO_Aportes,
        T.CO_PrimaVacacionesMensual = S.CO_PrimaVacMens,
        T.CO_PrimaNavidadMensual    = S.CO_PrimaNavMens,
        T.CO_PrimaServiciosMensual  = S.CO_PrimaServMens,
        T.CO_CesantiasMensual       = S.CO_CesantiasMens,
        T.CO_ICesantiasMensual      = S.CO_ICesantiasMens,
        T.CO_AportesPrimasMensual   = S.CO_AportesMens,
        T.CO_MedicinaMensual        = S.CO_MedMens,
        T.CO_BonoMensual            = S.CO_BonoMens,
        T.PE_RemuneracionBase       = S.PE_RemBase,
        T.PE_IngresosTotales        = S.PE_Ingresos,
        T.PE_Gratificaciones        = S.PE_Grat,
        T.PE_CTS                    = S.PE_CTS,
        T.PE_EsSalud                = S.PE_EsSalud,
        T.PE_SeguroVidaLey          = S.PE_SVL,
        T.PE_CostoDeVales           = S.PE_CostoVales,
        T.PE_CostoLaboralBonoCP     = S.PE_CostoLaboralBono,
        T.EC_XIIIAnual              = S.EC_XIII,
        T.EC_SBUAnual               = S.EC_SBU,
        T.EC_FondoAnual             = S.EC_Fondo,
        T.EC_AportePatronalAnual    = S.EC_Aporte,
        T.EC_VacacionesAnual        = S.EC_Vac,
        T.EC_XIIIMensual            = S.EC_XIIIMens,
        T.EC_SBUMensual             = S.EC_SBUMens,
        T.EC_FondoMensual           = S.EC_FondoMens,
        T.EC_AportePatronalMensual  = S.EC_AporteMens,
        T.EC_VacacionesMensual      = S.EC_VacMens,
        T.EC_SeguroMensual          = S.EC_SeguroMens,
        T.FechaCalculo              = GETDATE()

    WHEN NOT MATCHED THEN INSERT (
        NumeroID, BonoCPTarget, BonoCPMensual, CostoTotalMensual, CostoAnualML, CostoAnualUSD,
        Carga, PctCarga,
        CO_SalarioAnual, CO_Base, CO_PrimaVacaciones, CO_PrimaNavidad, CO_PrimaServicios,
        CO_Cesantias, CO_ICesantias, CO_AportesPrimas,
        CO_PrimaVacacionesMensual, CO_PrimaNavidadMensual, CO_PrimaServiciosMensual,
        CO_CesantiasMensual, CO_ICesantiasMensual, CO_AportesPrimasMensual,
        CO_MedicinaMensual, CO_BonoMensual,
        PE_RemuneracionBase, PE_IngresosTotales, PE_Gratificaciones, PE_CTS, PE_EsSalud,
        PE_SeguroVidaLey, PE_CostoDeVales, PE_CostoLaboralBonoCP,
        EC_XIIIAnual, EC_SBUAnual, EC_FondoAnual, EC_AportePatronalAnual, EC_VacacionesAnual,
        EC_XIIIMensual, EC_SBUMensual, EC_FondoMensual,
        EC_AportePatronalMensual, EC_VacacionesMensual, EC_SeguroMensual,
        FechaCalculo
    ) VALUES (
        S.NumeroID, S.BonoCPTarget, S.BonoCPMensual, S.CostoTotalMensual, S.CostoAnualML, S.CostoAnualUSD,
        S.Carga, S.PctCarga,
        S.CO_SalAnual, S.CO_Base, S.CO_PrimaVac, S.CO_PrimaNav, S.CO_PrimaServ,
        S.CO_Cesantias, S.CO_ICesantias, S.CO_Aportes,
        S.CO_PrimaVacMens, S.CO_PrimaNavMens, S.CO_PrimaServMens,
        S.CO_CesantiasMens, S.CO_ICesantiasMens, S.CO_AportesMens,
        S.CO_MedMens, S.CO_BonoMens,
        S.PE_RemBase, S.PE_Ingresos, S.PE_Grat, S.PE_CTS, S.PE_EsSalud,
        S.PE_SVL, S.PE_CostoVales, S.PE_CostoLaboralBono,
        S.EC_XIII, S.EC_SBU, S.EC_Fondo, S.EC_Aporte, S.EC_Vac,
        S.EC_XIIIMens, S.EC_SBUMens, S.EC_FondoMens,
        S.EC_AporteMens, S.EC_VacMens, S.EC_SeguroMens,
        GETDATE()
    );

    PRINT 'sp_CalcularCostos OK — ' + CAST(@@ROWCOUNT AS VARCHAR) + ' filas procesadas.';
END;
GO
