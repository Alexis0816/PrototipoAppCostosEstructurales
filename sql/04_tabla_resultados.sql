-- ============================================================================
-- 04_tabla_resultados.sql  |  PeopleAnalytics
-- Tabla de resultados calculados.
-- Poblada y mantenida exclusivamente por sp_CalcularCostos vía MERGE.
-- No editar manualmente.
-- ============================================================================

USE [PeopleAnalytics];
GO

IF OBJECT_ID('PeopleAnalytics.Resultados_Calculo', 'U') IS NOT NULL
    DROP TABLE PeopleAnalytics.Resultados_Calculo;
GO

CREATE TABLE PeopleAnalytics.Resultados_Calculo (
    NumeroID            VARCHAR(20)   NOT NULL,

    -- ── Totales (todos los países) ────────────────────────────────────────────
    BonoCPTarget        DECIMAL(18,2) NULL,
    BonoCPMensual       DECIMAL(18,2) NULL,
    CostoTotalMensual   DECIMAL(18,2) NULL,
    CostoAnualML        DECIMAL(18,2) NULL,   -- Moneda local del país
    CostoAnualUSD       DECIMAL(18,2) NULL,   -- EC: igual a CostoAnualML (USD nativo)
    Carga               DECIMAL(18,2) NULL,   -- Cargas laborales mensuales
    PctCarga            DECIMAL(8,4)  NULL,   -- % carga vs sueldo base

    -- ── Desglose Colombia ─────────────────────────────────────────────────────
    -- Valores anuales (base de cálculo)
    CO_SalarioAnual             DECIMAL(18,2) NULL,
    CO_Base                     DECIMAL(18,2) NULL,   -- SalAnual + PrimaVac + PrimaNav + Bono
    CO_PrimaVacaciones          DECIMAL(18,2) NULL,   -- = SueldoMensual × 1  (anual)
    CO_PrimaNavidad             DECIMAL(18,2) NULL,   -- = SueldoMensual × 0.5 (anual)
    CO_PrimaServicios           DECIMAL(18,2) NULL,   -- = Base / 12  (anual)
    CO_Cesantias                DECIMAL(18,2) NULL,   -- = Base / 12  (anual)
    CO_ICesantias               DECIMAL(18,2) NULL,   -- = Cesantias × 12%
    CO_AportesPrimas            DECIMAL(18,2) NULL,   -- = Base × ParRate (31.936%)
    -- Provisiones mensuales (para desglose en pantalla)
    CO_PrimaVacacionesMensual   DECIMAL(18,2) NULL,
    CO_PrimaNavidadMensual      DECIMAL(18,2) NULL,
    CO_PrimaServiciosMensual    DECIMAL(18,2) NULL,
    CO_CesantiasMensual         DECIMAL(18,2) NULL,
    CO_ICesantiasMensual        DECIMAL(18,2) NULL,
    CO_AportesPrimasMensual     DECIMAL(18,2) NULL,
    CO_MedicinaMensual          DECIMAL(18,2) NULL,
    CO_BonoMensual              DECIMAL(18,2) NULL,

    -- ── Desglose Perú ─────────────────────────────────────────────────────────
    PE_RemuneracionBase         DECIMAL(18,2) NULL,   -- SueldoBase + Comis + AsigFam
    PE_IngresosTotales          DECIMAL(18,2) NULL,   -- SueldoBase + Vales + Comis + AsigFam
    PE_Gratificaciones          DECIMAL(18,2) NULL,   -- ROUND(RemBase × 18.17%)
    PE_CTS                      DECIMAL(18,2) NULL,   -- FLOOR(RemBase × 7/72) — TRUNC
    PE_EsSalud                  DECIMAL(18,2) NULL,   -- ROUND(RemBase × 9.00%)
    PE_SeguroVidaLey            DECIMAL(18,2) NULL,   -- ROUND(RemBase × 0.19%)
    PE_CostoDeVales             DECIMAL(18,2) NULL,   -- ROUND(Vales × 1.00%)
    PE_CostoLaboralBonoCP       DECIMAL(18,2) NULL,   -- ROUND(BonoCPTarget × 13.86%)

    -- ── Desglose Ecuador ──────────────────────────────────────────────────────
    -- Valores anuales
    EC_XIIIAnual                DECIMAL(18,2) NULL,   -- = bonoCPMensual + SueldoMensual
    EC_SBUAnual                 DECIMAL(18,2) NULL,   -- = 482 USD fijo
    EC_FondoAnual               DECIMAL(18,2) NULL,   -- = bonoCPMensual + SueldoMensual (= XIII)
    EC_AportePatronalAnual      DECIMAL(18,2) NULL,   -- ROUND((BonoCPTarget + SalAnual) × 12.15%)
    EC_VacacionesAnual          DECIMAL(18,2) NULL,   -- ROUND((BonoCPTarget + SalAnual) × 0.5/12)
    -- Provisiones mensuales
    EC_XIIIMensual              DECIMAL(18,2) NULL,
    EC_SBUMensual               DECIMAL(18,2) NULL,
    EC_FondoMensual             DECIMAL(18,2) NULL,
    EC_AportePatronalMensual    DECIMAL(18,2) NULL,
    EC_VacacionesMensual        DECIMAL(18,2) NULL,
    EC_SeguroMensual            DECIMAL(18,2) NULL,

    FechaCalculo DATETIME NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Resultados     PRIMARY KEY (NumeroID),
    CONSTRAINT FK_Resultados_Col FOREIGN KEY (NumeroID)
        REFERENCES PeopleAnalytics.ColaboradoresCostos(NumeroID)
);
GO
