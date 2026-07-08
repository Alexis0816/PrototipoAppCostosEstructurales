-- ============================================================================
-- 03_tabla_costos_colaboradores.sql  |  PeopleAnalytics
-- Tabla maestra de costos por colaborador — todos los países.
-- ============================================================================
-- Convenciones de campos:
--   [SETEADO]  → se carga manualmente al insertar/actualizar el registro
--   [FIJO]     → valor constante por persona (cargado, no calculado)
--   [CALC]     → derivado por sp_CalcularCostos; vive en Resultados_Calculo
-- ============================================================================

USE [PeopleAnalytics];
GO

IF OBJECT_ID('PeopleAnalytics.ColaboradoresCostos', 'U') IS NOT NULL
    DROP TABLE PeopleAnalytics.ColaboradoresCostos;
GO

CREATE TABLE PeopleAnalytics.ColaboradoresCostos (

    -- ── Identificación (todos los países) ────────────────────────────────────
    NumeroID        VARCHAR(20)   NOT NULL,
    Pais            CHAR(2)       NOT NULL,   -- 'CO' | 'PE' | 'EC'
    Moneda          CHAR(3)       NOT NULL,   -- 'COP' | 'PEN' | 'USD'
    Empresa         VARCHAR(100)  NULL,
    NombreCompleto  VARCHAR(150)  NULL,
    GerenciaCorp    VARCHAR(100)  NULL,       -- Clave de agrupación (usada para consolidar)
    Gerencia        VARCHAR(100)  NULL,       -- Nombre de display de la gerencia
    Area            VARCHAR(100)  NULL,
    Puesto          VARCHAR(150)  NULL,

    -- Grado: solo el número entero (18, 16, 9...). La UI muestra 'G18'. [SETEADO]
    Grado           INT           NULL,
    Tipo            VARCHAR(50)   NULL,       -- 'Administrativo' | 'Operario' | 'Operario Part-Time'

    -- ── Colombia (CO) ─────────────────────────────────────────────────────────
    SueldoMensual         DECIMAL(18,0) NULL,  -- Sueldo mensual en COP (también EC) [SETEADO]
    NSueldos              DECIMAL(5,1)  NULL,  -- N° sueldos del Bono CP Target [SETEADO]
    MedicinaPrepagadaAnio DECIMAL(18,2) NULL DEFAULT 0,  -- Costo anual COP [FIJO]

    -- ── Perú (PE) — todos los campos se cargan manualmente ────────────────────
    -- SueldoMensual reutilizado (campo compartido CO/PE/EC)
    Vales                 DECIMAL(18,0) NULL DEFAULT 0,    -- Vales mensuales PEN [SETEADO]
    ComisionesMensuales   DECIMAL(18,0) NULL DEFAULT 0,    -- Comisiones mensuales (PE y EC) [SETEADO]
    AsignacionFamiliar    DECIMAL(18,0) NULL DEFAULT 113,  -- S/113 legal; por persona [FIJO]

    -- ── Ecuador (EC) ──────────────────────────────────────────────────────────
    -- SueldoMensual reutilizado (campo compartido CO/EC)
    -- Seguro: monto anual en USD, fijo por persona, no calculado [FIJO]
    Seguro                DECIMAL(18,0) NULL DEFAULT 0,

    CONSTRAINT PK_CostosColaboradores PRIMARY KEY (NumeroID)
);
GO