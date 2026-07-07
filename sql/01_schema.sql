-- ============================================================================
-- 01_schema.sql  |  PeopleAnalytics
-- Crea el schema si no existe.
-- ============================================================================

USE [PeopleAnalytics];
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'PeopleAnalytics')
    EXEC('CREATE SCHEMA PeopleAnalytics');
GO
