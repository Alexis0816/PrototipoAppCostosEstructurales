-- ============================================================================
-- SCRIPT MAESTRO: PeopleAnalytics - Calculadora de Costos Laborales
-- Versión 2.1  |  2026-07-06  |  CO / PE / EC
-- ============================================================================
-- Convenciones de comentario en Colaboradores:
--   [SETEADO]   → se carga manualmente al insertar/actualizar el registro
--   [FIJO]      → valor constante por persona (cargado, no calculado)
--   [CALCULADO] → derivado por sp_CalcularCostos; vive en Resultados_Calculo
--
-- Ejecutar en orden: Sección 1 → 2 → 3 → 4
-- ============================================================================

USE [PeopleAnalytics];   -- <-- Cambiar por el nombre real de la base de datos
GO

-- Crear schema si no existe
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'PeopleAnalytics')
    EXEC('CREATE SCHEMA PeopleAnalytics');
GO


-- ============================================================================
-- 1. TABLAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1a. Tasas y constantes por país
--     NO incluye AsignacionFamiliar de Perú (campo seteado por persona, no parámetro global).
-- ----------------------------------------------------------------------------
IF OBJECT_ID('PeopleAnalytics.Parametros_Tasas', 'U') IS NOT NULL
    DROP TABLE PeopleAnalytics.Parametros_Tasas;
GO
CREATE TABLE PeopleAnalytics.Parametros_Tasas (
    Pais        CHAR(2)        NOT NULL,
    Parametro   VARCHAR(60)    NOT NULL,
    Valor       DECIMAL(18,6)  NOT NULL,
    Descripcion VARCHAR(200)   NULL,
    CONSTRAINT PK_Tasas PRIMARY KEY (Pais, Parametro)
);
GO

-- ----------------------------------------------------------------------------
-- 1b. Multiplicadores de bono por banda de grado (PE y EC)
--     Colombia no usa esta tabla: su bono = NSueldos × SueldoMensual [SETEADO por persona].
-- ----------------------------------------------------------------------------
IF OBJECT_ID('PeopleAnalytics.Parametros_MultiplicadorBono', 'U') IS NOT NULL
    DROP TABLE PeopleAnalytics.Parametros_MultiplicadorBono;
GO
CREATE TABLE PeopleAnalytics.Parametros_MultiplicadorBono (
    Pais     CHAR(2)      NOT NULL,
    GradoMin INT          NOT NULL,
    GradoMax INT          NOT NULL,
    Factor   DECIMAL(5,2) NOT NULL,
    CONSTRAINT PK_MultBono PRIMARY KEY (Pais, GradoMin)
);
GO

-- ----------------------------------------------------------------------------
-- 1c. Colaboradores — tabla maestra de personas
-- ----------------------------------------------------------------------------
IF OBJECT_ID('PeopleAnalytics.Colaboradores', 'U') IS NOT NULL
    DROP TABLE PeopleAnalytics.Colaboradores;
GO
CREATE TABLE PeopleAnalytics.Colaboradores (

    -- ── Identificación (todos los países) ────────────────────────────────────
    NumeroID        VARCHAR(20)   NOT NULL,
    Pais            CHAR(2)       NOT NULL,   -- 'CO' | 'PE' | 'EC'
    Moneda          CHAR(3)       NOT NULL,   -- 'COP' | 'PEN' | 'USD'
    Empresa         VARCHAR(100)  NULL,
    NombreCompleto  VARCHAR(150)  NULL,
    GerenciaCorp    VARCHAR(100)  NULL,
    Gerencia        VARCHAR(100)  NULL,
    Area            VARCHAR(100)  NULL,
    Puesto          VARCHAR(100)  NULL,
    Ciudad          VARCHAR(50)   NULL,
    Contrato        VARCHAR(100)  NULL,

    -- Grado: solo el número entero (18, 16, 9...). La UI muestra 'G18'. [SETEADO]
    Grado           INT           NULL,
    GradoLabel      VARCHAR(50)   NULL,       -- Etiqueta opcional: 'Gerencial', 'Profesional'
    Tipo            VARCHAR(50)   NULL,       -- 'Administrativo' | 'Operario' | 'Operario Part-Time'

    -- ── Colombia (CO) ─────────────────────────────────────────────────────────
    TipoSalario           CHAR(1)        NULL,  -- 'F' Fijo | 'I' Integral → determina tasa PAR [SETEADO]
    SueldoMensual         DECIMAL(18,2)  NULL,  -- Sueldo nominal mensual en COP (también EC) [SETEADO]
    NSueldos              DECIMAL(5,3)   NULL,  -- Número de sueldos del Bono CP Target [SETEADO]
    MedicinaPrepagadaAnio DECIMAL(18,2)  NULL DEFAULT 0,  -- Costo anual en COP [FIJO / SETEADO]

    -- ── Perú (PE) — todos los campos se setean manualmente ────────────────────
    SueldoBase            DECIMAL(18,2)  NULL,  -- Sueldo básico mensual en PEN [SETEADO]
    Vales                 DECIMAL(18,2)  NULL DEFAULT 0,  -- Vales mensuales en PEN [SETEADO]
    ComisionesMensuales   DECIMAL(18,2)  NULL DEFAULT 0,  -- Comisiones mensuales (PE y EC) [SETEADO]
    AsignacionFamiliar    DECIMAL(18,2)  NULL DEFAULT 113, -- S/113 legal; registrar por persona [FIJO]

    -- ── Ecuador (EC) ──────────────────────────────────────────────────────────
    -- SueldoMensual reutilizado (campo compartido CO/EC).
    -- Seguro: monto anual en USD; valor fijo por persona, no calculado. [FIJO / SETEADO]
    Seguro                DECIMAL(18,2)  NULL DEFAULT 0,

    FechaAlta             DATE           NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Colaboradores PRIMARY KEY (NumeroID)
);
GO

-- ----------------------------------------------------------------------------
-- 1d. Resultados calculados — poblada por sp_CalcularCostos vía MERGE
-- ----------------------------------------------------------------------------
IF OBJECT_ID('PeopleAnalytics.Resultados_Calculo', 'U') IS NOT NULL
    DROP TABLE PeopleAnalytics.Resultados_Calculo;
GO
CREATE TABLE PeopleAnalytics.Resultados_Calculo (
    NumeroID            VARCHAR(20)   NOT NULL,

    -- ── Totales (todos los países) ────────────────────────────────────────────
    BonoCPTarget        DECIMAL(18,4) NULL,
    BonoCPMensual       DECIMAL(18,4) NULL,
    CostoTotalMensual   DECIMAL(18,4) NULL,
    CostoAnualML        DECIMAL(18,4) NULL,
    CostoAnualUSD       DECIMAL(18,4) NULL,
    Carga               DECIMAL(18,4) NULL,   -- cargas mensuales
    PctCarga            DECIMAL(8,4)  NULL,   -- % carga vs sueldo base

    -- ── Desglose Colombia ─────────────────────────────────────────────────────
    CO_SalarioAnual             DECIMAL(18,4) NULL,
    CO_Base                     DECIMAL(18,4) NULL,   -- SalAnual + PrimaVac + PrimaNav + Bono
    CO_PrimaVacaciones          DECIMAL(18,4) NULL,   -- = SueldoMensual × 1  (anual)
    CO_PrimaNavidad             DECIMAL(18,4) NULL,   -- = SueldoMensual × 0.5 (anual)
    CO_PrimaServicios           DECIMAL(18,4) NULL,   -- = Base / 12  (anual)
    CO_Cesantias                DECIMAL(18,4) NULL,   -- = Base / 12  (anual)
    CO_ICesantias               DECIMAL(18,4) NULL,   -- = Cesantias × 12%
    CO_AportesPrimas            DECIMAL(18,4) NULL,   -- = Base × ParRate (F=49.6% / I=31.94%)
    CO_PrimaVacacionesMensual   DECIMAL(18,4) NULL,
    CO_PrimaNavidadMensual      DECIMAL(18,4) NULL,
    CO_PrimaServiciosMensual    DECIMAL(18,4) NULL,
    CO_CesantiasMensual         DECIMAL(18,4) NULL,
    CO_ICesantiasMensual        DECIMAL(18,4) NULL,
    CO_AportesPrimasMensual     DECIMAL(18,4) NULL,
    CO_MedicinaMensual          DECIMAL(18,4) NULL,
    CO_BonoMensual              DECIMAL(18,4) NULL,

    -- ── Desglose Perú ─────────────────────────────────────────────────────────
    PE_RemuneracionBase         DECIMAL(18,4) NULL,   -- SueldoBase + Comis + AsigFam
    PE_IngresosTotales          DECIMAL(18,4) NULL,   -- SueldoBase + Vales + Comis + AsigFam
    PE_Gratificaciones          DECIMAL(18,4) NULL,   -- ROUND(RemBase × 18.17%)
    PE_CTS                      DECIMAL(18,4) NULL,   -- FLOOR(RemBase × 7/72) — TRUNC, no ROUND
    PE_EsSalud                  DECIMAL(18,4) NULL,   -- ROUND(RemBase × 9.00%)
    PE_SeguroVidaLey            DECIMAL(18,4) NULL,   -- ROUND(RemBase × 0.19%)
    PE_CostoDeVales             DECIMAL(18,4) NULL,   -- ROUND(Vales × 1.00%)
    PE_CostoLaboralBonoCP       DECIMAL(18,4) NULL,   -- ROUND(BonoCPTarget × 13.86%)

    -- ── Desglose Ecuador ──────────────────────────────────────────────────────
    EC_XIIIAnual                DECIMAL(18,4) NULL,   -- = bonoCPMensual + SueldoMensual
    EC_SBUAnual                 DECIMAL(18,4) NULL,   -- = 482 USD fijo
    EC_FondoAnual               DECIMAL(18,4) NULL,   -- = bonoCPMensual + SueldoMensual (= XIII)
    EC_AportePatronalAnual      DECIMAL(18,4) NULL,   -- ROUND((BonoCPTarget + SalAnual) × 12.15%)
    EC_VacacionesAnual          DECIMAL(18,4) NULL,   -- ROUND((BonoCPTarget + SalAnual) × 0.5/12)
    EC_XIIIMensual              DECIMAL(18,4) NULL,
    EC_SBUMensual               DECIMAL(18,4) NULL,
    EC_FondoMensual             DECIMAL(18,4) NULL,
    EC_AportePatronalMensual    DECIMAL(18,4) NULL,
    EC_VacacionesMensual        DECIMAL(18,4) NULL,
    EC_SeguroMensual            DECIMAL(18,4) NULL,

    FechaCalculo DATETIME NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Resultados     PRIMARY KEY (NumeroID),
    CONSTRAINT FK_Resultados_Col FOREIGN KEY (NumeroID)
        REFERENCES PeopleAnalytics.Colaboradores(NumeroID)
);
GO


-- ============================================================================
-- 2. PARÁMETROS
-- ============================================================================

-- 2a. Tasas
INSERT INTO PeopleAnalytics.Parametros_Tasas (Pais, Parametro, Valor, Descripcion) VALUES
-- Colombia
('CO', 'RECARGO_FIJO',     0.496000, 'Factor PAR Salario Fijo (49.60%) aplicado sobre la Base'),
('CO', 'RECARGO_INTEGRAL', 0.319360, 'Factor PAR Salario Integral (31.936%) aplicado sobre la Base'),
('CO', 'TIPO_CAMBIO_USD',  3950.000, 'COP por 1 USD — actualizar según TRM vigente'),
-- Perú
('PE', 'GRATIFICACIONES',  0.181700, '2 gratificaciones × 1.09 (Ley 29351) / 12 ≈ 18.17% de Rem. Base'),
('PE', 'ES_SALUD',         0.090000, 'Rem. Base × 9.00%'),
('PE', 'SEGURO_VIDA_LEY',  0.001900, 'Rem. Base × 0.19%'),
('PE', 'BONO_CP_FACTOR',   0.138600, 'Carga laboral del bono: BonoCPTarget × 13.86%'),
('PE', 'TIPO_CAMBIO_USD',  3.500000, 'PEN por 1 USD — actualizar periódicamente'),
-- Ecuador
('EC', 'APORTE_PATRONAL',  0.121500, '12.15% sobre (BonoCPTarget + SalarioAnual)'),
('EC', 'SBU',              482.0000, 'Salario Básico Unificado anual en USD — valor legal fijo');
GO

-- 2b. Multiplicadores de bono por grado
INSERT INTO PeopleAnalytics.Parametros_MultiplicadorBono (Pais, GradoMin, GradoMax, Factor) VALUES
-- Perú (grados 9–21)
('PE',  9, 15, 1.00),
('PE', 16, 17, 1.50),
('PE', 18, 19, 2.00),
('PE', 20, 21, 3.00),
-- Ecuador (grados 9–20; grado máximo en EC es 20)
('EC',  9, 15, 1.00),
('EC', 16, 17, 1.50),
('EC', 18, 19, 2.00),
('EC', 20, 20, 3.00);
GO


-- ============================================================================
-- 3. sp_CalcularCostos
--    Recalcula todos los costos y hace MERGE en Resultados_Calculo.
--    Ejecutar después de cada INSERT/UPDATE en Colaboradores.
-- ============================================================================
IF OBJECT_ID('PeopleAnalytics.sp_CalcularCostos', 'P') IS NOT NULL
    DROP PROCEDURE PeopleAnalytics.sp_CalcularCostos;
GO

CREATE PROCEDURE PeopleAnalytics.sp_CalcularCostos
AS
BEGIN
    SET NOCOUNT ON;

    -- ------------------------------------------------------------------
    -- PASO 1: Cargar tasas en variables locales
    -- ------------------------------------------------------------------
    DECLARE
        -- Colombia
        @CO_FIJO        DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='CO' AND Parametro='RECARGO_FIJO'),
        @CO_INTEGRAL    DECIMAL(18,6) = (SELECT Valor FROM PeopleAnalytics.Parametros_Tasas WHERE Pais='CO' AND Parametro='RECARGO_INTEGRAL'),
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

    -- ── Base: normaliza NULLs, obtiene multiplicador de bono ──────────────────
    Base AS (
        SELECT
            c.NumeroID,
            c.Pais,
            c.Grado,                              -- INT puro; la UI añade el prefijo 'G'
            c.TipoSalario,
            c.Tipo,

            ISNULL(c.SueldoMensual,       0) AS SM,      -- CO y EC [SETEADO]
            ISNULL(c.SueldoBase,          0) AS SB,      -- PE [SETEADO]
            ISNULL(c.NSueldos,            0) AS NS,      -- CO: número de sueldos del bono [SETEADO]
            ISNULL(c.MedicinaPrepagadaAnio,0) AS Med,
            ISNULL(c.Vales,               0) AS Vales,   -- PE [SETEADO]
            ISNULL(c.ComisionesMensuales,  0) AS Coms,   -- PE/EC [SETEADO]
            ISNULL(c.AsignacionFamiliar,   0) AS AsigFam,-- PE: S/113 [FIJO, SETEADO]
            ISNULL(c.Seguro,              0) AS Seguro,  -- EC: anual USD [FIJO, SETEADO]

            ISNULL(mb.Factor, 0) AS MultBono,  -- PE y EC: multiplicador de bono por grado

            -- Tasa PAR de Colombia según tipo de salario
            CASE c.TipoSalario
                WHEN 'F' THEN @CO_FIJO
                WHEN 'I' THEN @CO_INTEGRAL
                ELSE @CO_FIJO
            END AS CO_ParRate,

            -- Perú: Operario y Operario Part-Time no reciben bono
            CASE WHEN c.Pais = 'PE'
                      AND c.Tipo IN ('Operario', 'Operario Part-Time')
                 THEN 0 ELSE 1
            END AS TieneBono

        FROM PeopleAnalytics.Colaboradores c
        LEFT JOIN PeopleAnalytics.Parametros_MultiplicadorBono mb
            ON  mb.Pais  = c.Pais
            AND c.Grado  BETWEEN mb.GradoMin AND mb.GradoMax
    ),


    -- ═══════════════════════════════════════════════════════════════════════════
    -- COLOMBIA
    -- Base = SalarioAnual + PrimaVacaciones + PrimaNavidad + BonoTarget
    -- TODAS las cargas (PAR, PrimaServicios, Cesantías) se calculan sobre
    -- esta Base, NO sobre SueldoMensual solo.
    -- ═══════════════════════════════════════════════════════════════════════════
    CalcCO AS (
        SELECT
            b.NumeroID,
            b.SM, b.NS, b.Med, b.CO_ParRate,
            b.SM * 12.0          AS CO_SalAnual,
            b.SM * b.NS          AS CO_BonoTarget,    -- Bono CP anual
            b.SM * b.NS / 12.0   AS CO_BonoMensual,   -- Provisión mensual del bono
            b.SM * 1.0           AS CO_PrimaVac,      -- 1 sueldo anual
            b.SM * 0.5           AS CO_PrimaNav,      -- 0.5 sueldos anual
            -- Base = SalAnual + PrimaVac + PrimaNav + Bono
            (b.SM * 12.0) + (b.SM * 1.0) + (b.SM * 0.5) + (b.SM * b.NS) AS CO_Base
        FROM Base b
        WHERE b.Pais = 'CO'
    ),
    CalcCO2 AS (
        SELECT co.*,
            co.CO_Base / 12.0           AS CO_PrimaServ,   -- anual
            co.CO_Base / 12.0           AS CO_Cesantias,   -- anual (= PrimaServicios)
            (co.CO_Base / 12.0) * 0.12  AS CO_ICesantias,
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
    -- CostoTotalMensual y CostoAnualML: aritmética float antes del FLOOR final.
    -- BonoCPMensual = ROUND((BonoCPTarget + CostoLaboralBonoCP) / 12)
    -- CostoAnualML  = FLOOR((BonoCPMensual + costoTotalMensualFloat) × 12)
    -- ═══════════════════════════════════════════════════════════════════════════
    CalcPE AS (
        SELECT
            b.NumeroID,
            b.SB, b.Vales, b.Coms, b.AsigFam,
            b.SB + b.Coms + b.AsigFam            AS PE_RemBase,    -- RemuneracionBase
            b.SB + b.Vales + b.Coms + b.AsigFam  AS PE_Ingresos,   -- IngresosTotales
            CASE WHEN b.TieneBono = 1
                 THEN b.SB * b.MultBono ELSE 0 END AS PE_BonoCPTarget
        FROM Base b
        WHERE b.Pais = 'PE'
    ),
    CalcPEFinal AS (
        SELECT pe.*,
            -- Cargas individuales (enteros; CTS usa FLOOR, los demás ROUND)
            ROUND(pe.PE_RemBase * @PE_GRAT,    0)  AS PE_Gratificaciones,
            FLOOR (pe.PE_RemBase * 7.0 / 72.0)    AS PE_CTS,           -- TRUNC, no ROUND
            ROUND(pe.PE_RemBase * @PE_ESSALUD, 0)  AS PE_EsSalud,
            ROUND(pe.PE_RemBase * @PE_SVL,     0)  AS PE_SeguroVidaLey,
            ROUND(pe.Vales * 0.01,             0)  AS PE_CostoDeVales,
            -- Bono CP y carga laboral
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
    -- Todo USD nativo; costoAnualUSD = costoAnualML.
    -- Seguro: campo FIJO seteado por persona (no calculado).
    -- Provisiones mensuales = componente anual / 12 (floats, 2 decimales en display).
    -- VacacionesAnual = ROUND((BonoCPTarget + SalAnual) × 0.5 / 12)
    -- ═══════════════════════════════════════════════════════════════════════════
    CalcEC AS (
        SELECT
            b.NumeroID,
            b.SM, b.Seguro,
            b.SM * 12.0                    AS EC_SalAnual,
            b.SM * b.MultBono              AS EC_BonoCPTarget,   -- anual
            ROUND(b.SM * b.MultBono / 12.0, 0)  AS EC_BonoCPMensual -- entero
        FROM Base b
        WHERE b.Pais = 'EC'
    ),
    CalcECFinal AS (
        SELECT ec.*,
            -- XIII y Fondo = un mes de base (bonoCPMensual + sueldoMensual)
            ec.EC_BonoCPMensual + ec.SM    AS EC_XIIIAnual,  -- = base (1 mes de base)
            @EC_SBU                        AS EC_SBUAnual,   -- 482 USD fijo
            ec.EC_BonoCPMensual + ec.SM    AS EC_FondoAnual, -- = XIII
            ROUND((ec.EC_BonoCPTarget + ec.EC_SalAnual) * @EC_APORTE, 0)
                                           AS EC_AporteAnual,
            -- Vacaciones = ROUND((BonoCPTarget + SalAnual) × 0.5 / 12)
            ROUND((ec.EC_BonoCPTarget + ec.EC_SalAnual) * 0.5 / 12.0, 0)
                                           AS EC_VacAnual,
            ec.Seguro                      AS EC_SeguroAnual  -- [FIJO, no calculado]
        FROM CalcEC ec
    ),
    CalcECAnual AS (
        SELECT ef.*,
            ef.EC_SalAnual + ef.EC_BonoCPTarget
            + ef.EC_XIIIAnual + ef.EC_SBUAnual + ef.EC_FondoAnual
            + ef.EC_AporteAnual + ef.EC_VacAnual + ef.EC_SeguroAnual  AS EC_CostoAnualML,
            -- Provisiones mensuales (floats)
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
            co.CO_BonoTarget                            AS BonoCPTarget,
            co.CO_BonoMensual                           AS BonoCPMensual,
            co.CO_CostoAnualML / 12.0                   AS CostoTotalMensual,
            co.CO_CostoAnualML                          AS CostoAnualML,
            ROUND(co.CO_CostoAnualML / @CO_TC_USD, 0)   AS CostoAnualUSD,
            (co.CO_CostoAnualML - co.CO_SalAnual - co.CO_BonoTarget - co.CO_Med) / 12.0  AS Carga,
            CASE WHEN co.SM > 0
                 THEN ((co.CO_CostoAnualML - co.CO_SalAnual - co.CO_BonoTarget - co.CO_Med)
                        / 12.0 / co.SM) * 100.0
                 ELSE 0 END  AS PctCarga,
            co.CO_SalAnual, co.CO_Base,
            co.CO_PrimaVac, co.CO_PrimaNav, co.CO_PrimaServ,
            co.CO_Cesantias, co.CO_ICesantias, co.CO_Aportes, co.CO_CostoAnualML AS CO_CostoAnualML,
            co.CO_PrimaVacMens, co.CO_PrimaNavMens, co.CO_PrimaServMens,
            co.CO_CesantiasMens, co.CO_ICesantiasMens, co.CO_AportesMens,
            co.CO_MedMens, co.CO_BonoMensual AS CO_BonoMens,
            NULL AS PE_RemBase,  NULL AS PE_Ingresos,
            NULL AS PE_Grat,     NULL AS PE_CTS,           NULL AS PE_EsSalud,
            NULL AS PE_SVL,      NULL AS PE_CostoVales,    NULL AS PE_CostoLaboralBono,
            NULL AS EC_XIII,     NULL AS EC_SBU,           NULL AS EC_Fondo,
            NULL AS EC_Aporte,   NULL AS EC_Vac,
            NULL AS EC_XIIIMens, NULL AS EC_SBUMens,       NULL AS EC_FondoMens,
            NULL AS EC_AporteMens, NULL AS EC_VacMens,     NULL AS EC_SeguroMens
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
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,  -- CO
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            pa.PE_RemBase, pa.PE_Ingresos,
            pa.PE_Gratificaciones, pa.PE_CTS, pa.PE_EsSalud,
            pa.PE_SeguroVidaLey, pa.PE_CostoDeVales, pa.PE_CostoLaboralBono,
            NULL, NULL, NULL, NULL, NULL,                          -- EC
            NULL, NULL, NULL, NULL, NULL, NULL
        FROM CalcPEAnual pa

        UNION ALL

        SELECT  -- Ecuador
            ec.NumeroID,
            ec.EC_BonoCPTarget, ec.EC_BonoCPMensual,
            ec.SM + ec.EC_Carga,       -- costoTotalMensual = sueldo + carga
            ec.EC_CostoAnualML,
            ec.EC_CostoAnualML,        -- USD nativo; costoAnualUSD = costoAnualML
            ec.EC_Carga,
            CASE WHEN ec.SM > 0 THEN (ec.EC_Carga / ec.SM) * 100.0 ELSE 0 END,
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,  -- CO
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,        -- PE
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
        S.CO_MedMens, S.CO_BonoMensual,
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


-- ============================================================================
-- 4. Vista vw_Calculadora_Costos
--    Punto único de consumo para Power Automate / PowerApps.
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
    c.Grado,          -- INT; la UI añade el prefijo 'G'
    c.GradoLabel,
    c.Tipo,
    c.TipoSalario,    -- 'F'/'I' (CO) | NULL (PE/EC)
    c.Ciudad,
    c.Contrato,

    -- ── Campos de entrada por país ────────────────────────────────────────────
    c.SueldoMensual,             -- CO y EC [SETEADO]
    c.NSueldos,                  -- CO [SETEADO]
    c.MedicinaPrepagadaAnio,     -- CO [FIJO]
    c.SueldoBase,                -- PE [SETEADO]
    c.Vales,                     -- PE [SETEADO]
    c.ComisionesMensuales,       -- PE/EC [SETEADO]
    c.AsignacionFamiliar,        -- PE [FIJO]
    c.Seguro,                    -- EC [FIJO]

    -- ── Totales calculados ────────────────────────────────────────────────────
    r.BonoCPTarget,
    r.BonoCPMensual,
    r.CostoTotalMensual,
    r.CostoAnualML,
    r.CostoAnualUSD,
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

FROM PeopleAnalytics.Colaboradores c
LEFT JOIN PeopleAnalytics.Resultados_Calculo r ON c.NumeroID = r.NumeroID;
GO


-- ============================================================================
-- 5. PLANTILLA DE CARGA DE COLABORADORES (datos reales)
--    Descomentar, rellenar y ejecutar por país.
--    Siempre terminar con: EXEC PeopleAnalytics.sp_CalcularCostos;
-- ============================================================================

/*
-- ── COLOMBIA ──────────────────────────────────────────────────────────────────
INSERT INTO PeopleAnalytics.Colaboradores (
    NumeroID, Pais, Moneda, Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, GradoLabel, Tipo, Ciudad, Contrato,
    TipoSalario,           -- 'F' Fijo | 'I' Integral
    SueldoMensual,         -- [SETEADO] en COP
    NSueldos,              -- [SETEADO] número de sueldos del bono (ej. 2.5)
    MedicinaPrepagadaAnio  -- [FIJO] anual en COP; 0 si no aplica
) VALUES
-- (NumeroID, 'CO', 'COP', 'Empresa SA', 'Nombre Apellido',
--  'GerenciaCorp', 'Gerencia', 'Área', 'Puesto',
--  18, 'Gerencial', 'Administrativo', 'Bogotá', 'Indefinido',
--  'F', 4500000, 2.5, 0),
;

-- ── PERÚ ──────────────────────────────────────────────────────────────────────
INSERT INTO PeopleAnalytics.Colaboradores (
    NumeroID, Pais, Moneda, Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, GradoLabel, Tipo, Ciudad, Contrato,
    SueldoBase,           -- [SETEADO] mensual en PEN
    Vales,                -- [SETEADO] mensual en PEN (0 si no aplica)
    ComisionesMensuales,  -- [SETEADO] mensual en PEN (0 si no aplica)
    AsignacionFamiliar    -- [FIJO] S/113 legal; registrar por persona
) VALUES
-- ('PE001', 'PE', 'PEN', 'Primax Peru SAC', 'Nombre Apellido',
--  'Gerencia Operaciones', 'Gerencia Operaciones', 'Estaciones', 'Jefe Operaciones',
--  18, 'Gerencial', 'Administrativo', 'Lima', 'Indeterminado',
--  19520, 2000, 0, 113),
;

-- ── ECUADOR ───────────────────────────────────────────────────────────────────
INSERT INTO PeopleAnalytics.Colaboradores (
    NumeroID, Pais, Moneda, Empresa, NombreCompleto,
    GerenciaCorp, Gerencia, Area, Puesto,
    Grado, GradoLabel, Tipo, Ciudad, Contrato,
    SueldoMensual,        -- [SETEADO] en USD
    ComisionesMensuales,  -- [SETEADO] en USD (0 si no aplica)
    Seguro                -- [FIJO] monto anual USD Seguro Salud y Vida
) VALUES
-- ('EC001', 'EC', 'USD', 'Primax Ecuador SA', 'Nombre Apellido',
--  'Gerencia Comercial', 'Gerencia Comercial', 'Ventas', 'Gerente Comercial',
--  16, 'Profesional', 'Administrativo', 'Quito', 'Indefinido',
--  5950, 0, 1200),
;

EXEC PeopleAnalytics.sp_CalcularCostos;
*/


-- ============================================================================
-- FIN — PeopleAnalytics v2.1  |  2026-07-06
-- ============================================================================
