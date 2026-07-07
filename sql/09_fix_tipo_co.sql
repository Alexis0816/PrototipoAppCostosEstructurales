-- ============================================================================
-- 09_fix_tipo_co.sql  |  PeopleAnalytics
-- Establece Tipo = 'Integral' / 'Fijo' para los 16 colaboradores CO.
-- Salario Integral: sin Prima Servicios, Vacaciones, Navidad, Cesantías.
-- Ejecutar ANTES de recrear/recompilar sp_CalcularCostos.
-- ============================================================================

-- ── 3 personas con Salario Integral ───────────────────────────────────────────
UPDATE PeopleAnalytics.ColaboradoresCostos
SET Tipo = 'Integral'
WHERE Pais = 'CO'
  AND NumeroID IN ('79597769', '9872206', '79506406');

-- ── 13 personas con Salario Fijo ──────────────────────────────────────────────
UPDATE PeopleAnalytics.ColaboradoresCostos
SET Tipo = 'Fijo'
WHERE Pais = 'CO'
  AND NumeroID NOT IN ('79597769', '9872206', '79506406');

-- Verificar
SELECT NumeroID, NombreCompleto, Tipo, SueldoMensual, NSueldos
FROM PeopleAnalytics.ColaboradoresCostos
WHERE Pais = 'CO'
ORDER BY Tipo, SueldoMensual DESC;
