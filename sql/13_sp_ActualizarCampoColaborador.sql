-- ============================================================================
-- 13_sp_ActualizarCampoColaborador.sql  |  PeopleAnalytics
-- Guardado inline desde PowerApps: actualiza UN campo seteado de un colaborador
-- y recalcula sus costos en la misma transacción (UPDATE + sp_CalcularCostos).
-- Devuelve un result set (fila única, vw_Calculadora_Costos) para que el flow
-- lo empaquete en JSON y se lo regrese a PowerApps — la app NUNCA lee SQL
-- directo (ver docs/seguridad-powerapps.md), todo pasa por este único canal.
-- Invocado por el flow de Power Automate "UpdateCollaboratorCost"
-- (trigger PowerApps V2: NumeroID, Campo, Valor).
-- NOTA: Seleccionar la base PeopleAnalytics en el dropdown de SSMS antes de
--       ejecutar (USE no es compatible con Azure SQL — ver 00_ejecutar_todo.sql).
-- ============================================================================

IF OBJECT_ID('PeopleAnalytics.sp_ActualizarCampoColaborador', 'P') IS NOT NULL
    DROP PROCEDURE PeopleAnalytics.sp_ActualizarCampoColaborador;
GO

CREATE PROCEDURE PeopleAnalytics.sp_ActualizarCampoColaborador
    @NumeroID VARCHAR(20),
    @Campo    VARCHAR(50),
    @Valor    DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- Lista blanca: solo los campos editables desde la app.
    -- Si se habilitan más campos (MedicinaPrepagadaAnio, Seguro...),
    -- agregarlos aquí Y en el CASE del UPDATE.
    IF @Campo NOT IN ('SueldoMensual', 'NSueldos', 'Vales', 'ComisionesMensuales', 'Grado')
        THROW 50001, 'Campo no permitido para edición desde la app.', 1;

    IF @Valor < 0
        THROW 50002, 'El valor no puede ser negativo.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Grado es INT puro en la tabla (sin el prefijo 'G' — eso lo agrega la UI al mostrarlo,
        -- ver comentario en 03_tabla_colaboradores.sql); @Valor llega como el número que PowerApps
        -- ya parseó del input (sin 'G'), así que un CAST a INT alcanza, no hace falta prefijo.
        UPDATE PeopleAnalytics.ColaboradoresCostos
        SET SueldoMensual       = CASE WHEN @Campo = 'SueldoMensual'       THEN @Valor ELSE SueldoMensual       END,
            NSueldos            = CASE WHEN @Campo = 'NSueldos'            THEN @Valor ELSE NSueldos            END,
            Vales               = CASE WHEN @Campo = 'Vales'               THEN @Valor ELSE Vales               END,
            ComisionesMensuales = CASE WHEN @Campo = 'ComisionesMensuales' THEN @Valor ELSE ComisionesMensuales END,
            Grado               = CASE WHEN @Campo = 'Grado'               THEN CAST(@Valor AS INT) ELSE Grado END
        WHERE NumeroID = @NumeroID;

        IF @@ROWCOUNT = 0
            THROW 50003, 'NumeroID no encontrado en ColaboradoresCostos.', 1;

        EXEC PeopleAnalytics.sp_CalcularCostos @NumeroID = @NumeroID;

        COMMIT TRANSACTION;

        -- Fila recalculada — el flow la mapea a JSON en un paso Compose.
        -- Nombres de columna EXACTOS de vw_Calculadora_Costos: si agregas o
        -- quitas alguno, actualizar también el Compose del flow y el ParseJSON
        -- en PowerApps (ver docs/detalle-costo-powerapps.md).
        SELECT
            SueldoMensual, NSueldos, Vales, ComisionesMensuales, Grado,
            BonoCPTarget, BonoCPMensual, CostoTotalMensual, CostoAnualML, CostoAnualUSD,
            Carga, PctCarga,
            CO_PrimaVacacionesMensual, CO_PrimaNavidadMensual, CO_PrimaServiciosMensual,
            CO_CesantiasMensual, CO_ICesantiasMensual, CO_AportesPrimasMensual,
            CO_MedicinaMensual, CO_BonoMensual,
            PE_IngresosTotales, PE_Gratificaciones, PE_CTS, PE_EsSalud,
            PE_SeguroVidaLey, PE_CostoDeVales,
            EC_XIIIMensual, EC_SBUMensual, EC_FondoMensual,
            EC_AportePatronalMensual, EC_VacacionesMensual, EC_SeguroMensual
        FROM PeopleAnalytics.vw_Calculadora_Costos
        WHERE NumeroID = @NumeroID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;  -- el error sube al flow → el flow falla → PowerApps lo captura con IfError
    END CATCH
END;
GO