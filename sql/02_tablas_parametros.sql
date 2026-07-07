-- ============================================================================
-- 02_tablas_parametros.sql  |  PeopleAnalytics
-- Tablas de configuración estática del modelo:
--   · Parametros_Tasas          — tasas y tipos de cambio por país
--   · Parametros_MultiplicadorBono — multiplicador de bono por banda de grado (PE y EC)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Parametros_Tasas
-- Permite actualizar tasas y tipos de cambio sin recompilar el SP.
-- Colombia: NSueldos NO va aquí — es un campo seteado por persona en Colaboradores.
-- Perú: AsignacionFamiliar NO va aquí — campo seteado por persona (S/113 fijo).
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
-- Parametros_MultiplicadorBono
-- Tabla de bandas grado → factor de bono para Perú y Ecuador.
-- Colombia NO usa esta tabla: su bono = NSueldos × SueldoMensual (seteado por persona).
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
