-- ============================================================================
-- 11_consolidar_sueldo.sql  |  PeopleAnalytics
-- Elimina la columna SueldoBase (duplicada de SueldoMensual).
-- SueldoMensual pasa a ser el campo único de sueldo para CO, PE y EC.
-- Ejecutar UNA SOLA VEZ sobre la base existente.
-- ============================================================================

-- Paso 1: mover el valor de SueldoBase → SueldoMensual para registros PE
UPDATE PeopleAnalytics.ColaboradoresCostos
SET SueldoMensual = SueldoBase
WHERE Pais = 'PE'
  AND SueldoBase IS NOT NULL
  AND SueldoBase > 0;

-- Paso 2: eliminar la columna duplicada
ALTER TABLE PeopleAnalytics.ColaboradoresCostos
DROP COLUMN SueldoBase;

-- Verificar
SELECT NumeroID, Pais, NombreCompleto, SueldoMensual
FROM PeopleAnalytics.ColaboradoresCostos
ORDER BY Pais, SueldoMensual DESC;
