-- ============================================================================
-- 05_datos_parametros.sql  |  PeopleAnalytics
-- Carga inicial de valores estáticos del modelo laboral:
--   · Tasas de cargas sociales por país
--   · Tipos de cambio (actualizar periódicamente)
--   · Multiplicadores de bono por banda de grado (PE y EC)
-- ============================================================================

USE [PeopleAnalytics];
GO

-- ----------------------------------------------------------------------------
-- Tasas y tipos de cambio
-- ----------------------------------------------------------------------------
INSERT INTO PeopleAnalytics.Parametros_Tasas (Pais, Parametro, Valor, Descripcion) VALUES

-- ── Colombia ──────────────────────────────────────────────────────────────────
-- La Base = SalarioAnual + PrimaVac + PrimaNav + BonoTarget.
-- RECARGO_PAR se aplica sobre la Base (no sobre SueldoMensual).
('CO', 'RECARGO_PAR',     0.319360, 'Factor PAR (31.936%) aplicado sobre la Base'),
('CO', 'TIPO_CAMBIO_USD', 3950.000, 'COP por 1 USD — actualizar según TRM vigente'),

-- ── Perú ──────────────────────────────────────────────────────────────────────
-- Gratificaciones: 2 × RemBase × 1.09 (Ley 29351) / 12 ≈ 18.17% mensual.
-- CTS NO usa tasa fija: se calcula como FLOOR(RemBase × 7/72) en el SP.
('PE', 'GRATIFICACIONES',  0.181700, '18.17% de Rem. Base mensual (incluye bonif. extraordinaria Ley 29351)'),
('PE', 'ES_SALUD',         0.090000, 'Rem. Base × 9.00%'),
('PE', 'SEGURO_VIDA_LEY',  0.001900, 'Rem. Base × 0.19%'),
('PE', 'BONO_CP_FACTOR',   0.138600, 'Carga laboral del bono: BonoCPTarget × 13.86%'),
('PE', 'TIPO_CAMBIO_USD',  3.500000, 'PEN por 1 USD — actualizar periódicamente'),

-- ── Ecuador ───────────────────────────────────────────────────────────────────
-- Aporte Patronal se aplica sobre (BonoCPTarget + SalarioAnual), no solo sobre SueldoMensual.
-- Vacaciones: (BonoCPTarget + SalAnual) × 0.5 / 12 (15 días anuales prorrateados).
-- SBU: valor legal fijo anual en USD.
('EC', 'APORTE_PATRONAL',  0.121500, '12.15% sobre (BonoCPTarget + SalarioAnual)'),
('EC', 'SBU',              482.0000, 'Salario Básico Unificado anual en USD — valor legal fijo');
GO


-- ----------------------------------------------------------------------------
-- Multiplicadores de bono por grado
-- Colombia no usa esta tabla (su bono se setea por persona con NSueldos).
-- ----------------------------------------------------------------------------
INSERT INTO PeopleAnalytics.Parametros_MultiplicadorBono (Pais, GradoMin, GradoMax, Factor) VALUES

-- ── Perú (grados 9–21) ────────────────────────────────────────────────────────
('PE',  9, 15, 1.00),
('PE', 16, 17, 1.50),
('PE', 18, 19, 2.00),
('PE', 20, 21, 3.00),

-- ── Ecuador (grados 9–20; grado máximo en EC es 20, no 21 como en PE) ─────────
('EC',  9, 15, 1.00),
('EC', 16, 17, 1.50),
('EC', 18, 19, 2.00),
('EC', 20, 20, 3.00);
GO
