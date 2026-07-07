-- ============================================================================
-- 00_ejecutar_todo.sql  |  PeopleAnalytics
-- Script maestro — ejecuta todos los archivos en orden.
-- Usar solo en instalación inicial o reinstalación completa.
--
-- Orden obligatorio:
--   01 → 02 → 03 → 04  (schema + tablas; 03 depende de que exista el schema)
--   05                  (datos de parámetros; depende de 02)
--   06                  (stored procedure; depende de 02, 03, 04)
--   07                  (vista; depende de 03, 04)
--   08                  (plantilla de carga; ejecutar aparte con datos reales)
-- ============================================================================

USE [PeopleAnalytics];
GO

-- Para ejecutar desde SSMS con sqlcmd mode activado:
-- :r 01_schema.sql
-- :r 02_tablas_parametros.sql
-- :r 03_tabla_colaboradores.sql
-- :r 04_tabla_resultados.sql
-- :r 05_datos_parametros.sql
-- :r 06_sp_CalcularCostos.sql
-- :r 07_vw_Calculadora_Costos.sql
-- (08_plantilla_carga.sql se ejecuta aparte con los datos reales)

-- ─────────────────────────────────────────────────────────────────────────────
-- ALTERNATIVA: pegar el contenido de cada archivo aquí en orden,
-- o ejecutarlos manualmente uno por uno en SSMS.
-- ─────────────────────────────────────────────────────────────────────────────

PRINT '=== PeopleAnalytics — Instalación completa ===';
PRINT 'Ejecutar en orden: 01 → 02 → 03 → 04 → 05 → 06 → 07';
PRINT 'Luego: 08_plantilla_carga.sql con datos reales y EXEC sp_CalcularCostos';
GO
