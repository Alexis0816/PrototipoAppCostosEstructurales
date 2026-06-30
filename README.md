# Costos Estructurales PRIMAX — Lógica de Cálculo y Roadmap

> **Propósito:** referencia completa de las reglas de negocio verificadas contra las hojas de cálculo del equipo PRIMAX para los tres países activos: **Colombia**, **Perú** y **Ecuador**.  
> El prototipo vive en `prototipo/` (Vite + React 18 + Tailwind). Este documento sirve de base para la migración a SQL Server + Power Automate + Power Apps.

---

## Índice

1. [Arquitectura del prototipo](#1-arquitectura-del-prototipo)
2. [Colombia (CO)](#2-colombia-co)
3. [Perú (PE)](#3-perú-pe)
4. [Ecuador (EC)](#4-ecuador-ec)
5. [Patrón de agregación (Gerencia / Área)](#5-patrón-de-agregación-gerencia--área)
6. [Conversión de moneda](#6-conversión-de-moneda)
7. [Roadmap de pendientes](#7-roadmap-de-pendientes)
8. [Esquema SQL de referencia](#8-esquema-sql-de-referencia)

---

## 1. Arquitectura del prototipo

```
prototipo/src/
├── paises/
│   ├── registry.js          ← punto de entrada único: getPais(codigo)
│   ├── colombia/            ← módulo CO
│   │   ├── constants.js     rates del país
│   │   ├── calculos.js      función calc(c, periodo) → objeto r
│   │   ├── desglose.js      getFilasDesglose, slices, labels
│   │   ├── config.js        campos editables, sumables, textos UI
│   │   └── index.js         ensambla y exporta el módulo completo
│   ├── peru/                ← módulo PE (mismo esquema)
│   └── ecuador/             ← módulo EC (mismo esquema)
├── data/
│   ├── colaboradoresCO.demo.js   datos ficticios siempre comiteados
│   ├── colaboradoresPE.demo.js
│   ├── colaboradoresEC.demo.js
│   └── local/               ← GITIGNORED — datos reales nunca se suben
├── context/
│   └── appReducer.js        estado global: pais, vista, cacheEdiciones
├── hooks/
│   ├── useCalculo.js        llama modPais.calc(persona, periodo)
│   └── useResolvedColaborador.js  aplica cacheEdiciones antes de calcular
└── utils/
    ├── formato.js           fmt(valor, monedaDest, monedaOrigen)
    └── fx.js                RATE_PER_USD, convertir()
```

**Contrato de cada módulo de país:**

| Exportación | Tipo | Descripción |
|---|---|---|
| `calc(c, periodo)` | función | Recibe colaborador resuelto + período, devuelve objeto `r` con todos los valores calculados |
| `getFilasDesglose(r, persona)` | función | Array de filas `{ nombre, formula, valor, destacado?, informativo? }` para el desglose mensual |
| `getSlicesComposicion(r)` | función | Array `{ label, valor }` para el pie chart de composición |
| `getLabelTipo(persona)` | función | `{ texto, variante }` para el badge de tipo en cabecera |
| `getCamposAgregados(resueltos)` | función | Campos que no se pueden sumar linealmente (bonos por grado); se inyectan en el registro sintético de Gerencia/Área |
| `config` | objeto | `campoNomina`, `camposEditables`, `camposReadonly`, `camposSumables`, `opcionesTipoSalario`, `gradoEditable`, textos UI, períodos |
| `datos` | array | Referencia al loader de colaboradores (demo o local según env) |

---

## 2. Colombia (CO)

**Moneda:** COP | **Archivo de rates:** `paises/colombia/constants.js`

### 2.1 Campos de entrada por colaborador

| Campo | Tipo | Editable | Descripción |
|---|---|---|---|
| `sueldoMensual` | número | Sí | Salario mensual en COP |
| `nSueldos` | decimal | Sí | Número de sueldos para el Bono Target (ej. 1.5) |
| `medicinaPrepagadaAnio` | número | Sí | Costo anual de medicina prepagada en COP |
| `tipoSalario` | 'F' \| 'I' | Toggle | Fijo o Integral — determina el rate de Aportes |
| `grado` | string | Sí (badge) | Grado del colaborador (ej. 'G17') — edición inline en cabecera |

### 2.2 Tasas (constants.js)

| Constante | Valor | Aplica a |
|---|---|---|
| `RECARGO_FIJO` | **49.60%** | Tipo F — rate de Aportes y Obligaciones Primas |
| `RECARGO_INTEGRAL` | **31.936%** | Tipo I — rate de Aportes y Obligaciones Primas |

> El rate 31.936% fue verificado contra el Excel del usuario:  
> `239,754,000 × 0.31936 = 76,567,837.44` ✓

### 2.3 Fórmulas (calculos.js)

```
salarioAnual       = sueldoMensual × 12
primaVacaciones    = sueldoMensual × 1          ← 1 sueldo mensual, pagado anualmente
primaNavidad       = sueldoMensual × 0.5        ← 0.5 sueldos, pagado en diciembre
bonoTarget         = nSueldos × sueldoMensual   ← N° sueldos × sueldo mensual

base = salarioAnual + primaVacaciones + primaNavidad + bonoTarget

primaServicios     = base / 12                  ← pago anual (provisión mensual = primaServicios / 12)
cesantias          = base / 12                  ← igual que primaServicios
iCesantias         = cesantias × 12%

parRate            = 49.60% (Fijo) | 31.936% (Integral)
aportesPrimas      = base × parRate             ← Aportes y Obligaciones Primas (anual)
```

**Costo Anual (mismo desglose para F e I — solo cambia parRate):**
```
costoAnual = salarioAnual
           + primaVacaciones
           + primaNavidad
           + primaServicios
           + cesantias
           + iCesantias
           + medicinaPrepagadaAnio
           + bonoTarget
           + aportesPrimas
```

**Costo Mensual:**
```
costoMensual = costoAnual / 12
```

**Carga mensual (burdens para KPI):**
```
carga = (primaVacaciones + primaNavidad + primaServicios
        + cesantias + iCesantias + aportesPrimas) / 12
```

### 2.4 Verificación con caso real (Laura Sofía Gómez Vargas)

| Campo | Valor |
|---|---|
| sueldoMensual | COP 15,983,600 |
| nSueldos | 1.5 |
| medicinaPrepagadaAnio | COP 15,215,659.20 |
| tipoSalario | I (Integral) |

| Componente | Valor Anual (COP) |
|---|---|
| Salario Anual | 191,803,200 |
| Prima de Vacaciones | 15,983,600 |
| Prima de Navidad | 7,991,800 |
| Prima de Servicios | 19,979,500 |
| Cesantías | 19,979,500 |
| I. Cesantías | 2,397,540 |
| Medicina Prepagada | 15,215,659.20 |
| Bono Target | 23,975,400 |
| Aportes y Obligaciones Primas (31.936%) | 76,567,837.44 |
| **Costo Anual** | **373,894,036.64** ✓ |
| **Costo Mensual** | **31,157,836.39** |

### 2.5 Desglose mensual en la UI

| Fila | Fórmula de display | Aplica |
|---|---|---|
| Prima de Vacaciones | `primaVacaciones / 12` | F e I |
| Prima de Navidad | `primaNavidad / 12` | F e I |
| Prima de Servicios | `base / 144` | F e I |
| Cesantías | `base / 144` | F e I |
| I. Cesantías | `iCesantias / 12` | F e I |
| Aportes y Obligaciones Primas _(destacado)_ | `aportesPrimas / 12` | F e I |

> Medicina Prepagada y Bono Target se muestran en **Parámetros Salariales** (no en el desglose de carga).

### 2.6 Campos pendientes / por confirmar

| Campo | Estado |
|---|---|
| Medicina Prepagada — fórmula de cálculo | **Pendiente** — el usuario confirmará si es un costo fijo, un % del sueldo o un valor de tabla |
| Aportes y Obligaciones **Empleador** (salario base) | **Pendiente** — en el Excel hay una columna adicional; el usuario aún no entregó la fórmula |
| Seguridad Social (20.5%) | Removida del cálculo actual por no estar en el Excel verificado; **confirmar si aplica o fue reemplazada** |

---

## 3. Perú (PE)

**Moneda:** PEN | **Archivo de rates:** `paises/peru/constants.js`

### 3.1 Campos de entrada por colaborador

| Campo | Tipo | Editable | Descripción |
|---|---|---|---|
| `sueldoBase` | número | Sí | Sueldo Básico Mensual en PEN |
| `vales` | número | Sí | Vales de alimentación mensuales |
| `comisionesMensuales` | número | — | Solo para roles con comisiones |
| `asignacionFamiliar` | número | No (readonly) | Fijo: S/ 113 por ley |
| `grado` | string | Sí (badge) | Ej. 'G18' — determina multiplicador de bono |
| `tipo` | string | No | 'Administrativo' u 'Operario' — determina si recibe bono |

### 3.2 Tasas (constants.js)

| Constante | Valor | Descripción |
|---|---|---|
| `GRATIFICACIONES` | 18.17% | 2 sueldos × 1.09 (BE Ley 29351) / 12 |
| `ES_SALUD` | 9.00% | Aporte patronal a EsSalud |
| `SEGURO_VIDA_LEY` | 0.19% | Seguro de vida obligatorio |
| `BONO_CP_FACTOR` | 13.86% | Carga laboral sobre el Bono CP Target |
| `TIPO_CAMBIO_PEN` | 3.50 | PEN / USD para conversión de reporte |

### 3.3 Multiplicador de Bono CP por grado

| Rango de grado | Factor (N° de sueldos) |
|---|---|
| G9 – G15 | 1× |
| G16 – G17 | 1.5× |
| G18 – G19 | 2× |
| G20 – G21 | 3× |

> Solo aplica a colaboradores de tipo **Administrativo**. Operarios y Operarios Part-Time reciben bono = 0.

### 3.4 Fórmulas (calculos.js)

```
remuneracionBase   = sueldoBase + comisionesMensuales + asignacionFamiliar

gratificaciones    = round(remuneracionBase × 18.17%)
cts                = trunc(remuneracionBase × 7/72)   ← DL 650; usa INT() de Excel
esSalud            = round(remuneracionBase × 9.00%)
seguroVidaLey      = round(remuneracionBase × 0.19%)
costoDeVales       = round(vales × 1.00%)

ingresosTotales    = sueldoBase + vales + comisionesMensuales + asignacionFamiliar
carga              = gratificaciones + cts + esSalud + seguroVidaLey + costoDeVales

costoTotalMensual  = trunc(ingresosTotales + cargaFloat)  ← float interno, trunc final
```

**Bono CP Target (anual):**
```
bonoCPTarget       = sueldoBase × multiplicadorBono(grado)    ← 0 si es Operario
costoLaboralBono   = round(bonoCPTarget × 13.86%)
bonoCPMensual      = round((bonoCPTarget + costoLaboralBono) / 12)
```

**Proyección y Costo Anual:**
```
proyeccion   = trunc((bonoCPMensual + costoTotalMensualFloat) × periodo)
costoAnualML = trunc((bonoCPMensual + costoTotalMensualFloat) × 12)
costoAnualUSD = round(costoAnualML / 3.50)
```

> **Nota de precisión:** se usa el float interno de la suma de cargas (sin redondear cada componente) para la proyección y el costo anual, replicando el comportamiento de Excel que muestra 0 decimales pero calcula internamente con decimales.

### 3.5 Desglose mensual en la UI

| Fila | Fórmula de display | Nota |
|---|---|---|
| Bono CP Mensual _(informativo)_ | `(BonoCPTarget + CargaBono) / 12` | No suma al total de carga |
| Gratificaciones | `RemBase × 18.17%` | |
| CTS | `RemBase × 7/72` | Truncado (no redondeado) |
| EsSalud | `RemBase × 9.00%` | |
| Seguro Vida Ley | `RemBase × 0.19%` | |
| Costo de Vales _(destacado)_ | `Vales × 1.00%` | |

### 3.6 Verificación de referencia

sueldoBase = S/ 19,520 · vales = S/ 2,000 · grado G18 (factor 2×):
- costoTotalMensual ≈ **S/ 28,933**
- costoAnualML ≈ **S/ 391,647**
- costoAnualUSD ≈ **USD 111,899**

---

## 4. Ecuador (EC)

**Moneda:** USD | **Archivo de rates:** `paises/ecuador/constants.js`

### 4.1 Campos de entrada por colaborador

| Campo | Tipo | Editable | Descripción |
|---|---|---|---|
| `sueldoMensual` | número | Sí | Sueldo mensual en USD |
| `comisionesMensuales` | número | Sí | Comisiones mensuales en USD |
| `seguro` | número | No (dato) | Seguro Vida y Salud — valor anual fijo en USD |
| `grado` | string | Sí (badge) | Ej. 'G18' — determina multiplicador de bono |
| `tipo` | string | No | Todos los colaboradores reciben bono (no hay excluidos) |

### 4.2 Tasas (constants.js)

| Constante | Valor | Descripción |
|---|---|---|
| `SBU` | USD 482 | Salario Básico Unificado anual (valor fijo legal) |
| `APORTE_PATRONAL` | 12.15% | Sobre (BonoCPTarget + SalarioAnual) |
| `VACACIONES_FACTOR` | 0.5 | 15 días = 0.5 meses → anual = (BonoCPTarget + SalarioAnual) × 0.5 / 12 |

### 4.3 Multiplicador de Bono CP por grado

| Rango de grado | Factor (N° de sueldos) |
|---|---|
| G9 – G15 | 1× |
| G16 – G17 | 1.5× |
| G18 – G19 | 2× |
| G20 | 3× |

> En Ecuador el grado máximo es 20 (no 21 como en Perú).

### 4.4 Fórmulas (calculos.js)

```
bonoCPTarget       = sueldoMensual × multiplicadorBono(grado)
salarioAnual       = sueldoMensual × 12
bonoCPMensual      = round(bonoCPTarget / 12)

base               = bonoCPMensual + sueldoMensual   ← base compartida para XIII y Fondo

xiiiAnual          = base                             ← Décimo Tercer Sueldo
sbuAnual           = 482                              ← SBU fijo
fondoAnual         = base                             ← Fondo de Reserva (= XIII)
aporteAnual        = round((bonoCPTarget + salarioAnual) × 12.15%)
vacacionesAnual    = round((bonoCPTarget + salarioAnual) × 0.5 / 12)
```

**Costo Anual:**
```
costoAnual = salarioAnual + bonoCPTarget
           + xiiiAnual + sbuAnual + fondoAnual
           + aporteAnual + vacacionesAnual
           + seguro
```

**Provisiones mensuales (floats exactos para mostrar 2 decimales):**
```
xiiiMensual           = xiiiAnual / 12
sbuMensual            = 482 / 12   → USD 40.17
fondoMensual          = fondoAnual / 12
aportePatronalMensual = aporteAnual / 12
vacacionesMensual     = vacacionesAnual / 12
seguroMensual         = seguro / 12

carga                 = xiiiMensual + sbuMensual + fondoMensual
                      + aportePatronalMensual + vacacionesMensual + seguroMensual
costoTotalMensual     = sueldoMensual + carga
proyeccion            = round(costoAnual × periodo / 12)
```

### 4.5 Desglose mensual en la UI

| Fila | Fórmula de display |
|---|---|
| XIII (Déc. Tercer Sueldo) | `(BonoCPMens. + Sueldo) / 12` |
| SBU | `$482 / 12` |
| Fondo de Reserva | `(BonoCPMens. + Sueldo) / 12` |
| Aporte Patronal | `(BonoCPTarget + Sal.Anual) × 12.15% / 12` |
| Vacaciones (15 días) | `(BonoCPTarget + Sal.Anual) × 0.5 / 12` |
| Seguro (Vida y Salud) _(destacado)_ | `Valor anual / 12` |

---

## 5. Patrón de agregación (Gerencia / Área)

Cuando el usuario navega a una Gerencia o Área, el sistema construye un **colaborador sintético** sumando los campos de todos los miembros. La función `consolidar()` suma los `camposSumables` de cada país:

| País | camposSumables | Campos NO sumables linealmente |
|---|---|---|
| CO | `sueldoMensual`, `medicinaPrepagadaAnio` | `bonoTarget` (depende de nSueldos × sueldo individual) |
| PE | `sueldoBase`, `vales`, `comisionesMensuales`, `asignacionFamiliar` | `bonoCPTarget` (depende del grado individual) |
| EC | `sueldoMensual`, `seguro`, `comisionesMensuales` | `bonoCPTarget` (depende del grado individual) |

Para los campos no sumables, cada módulo expone `getCamposAgregados(resueltos)`:

```js
// Colombia
getCamposAgregados: (resueltos) => ({
  bonoTargetOverride: resueltos.reduce((s, p) => s + (p.nSueldos * p.sueldoMensual), 0),
})

// Perú
getCamposAgregados: (resueltos) => ({
  bonoCPTargetOverride: resueltos.reduce((s, p) => s + bonoCPTargetDe(p), 0),
})

// Ecuador
getCamposAgregados: (resueltos) => ({
  bonoCPTargetOverride: resueltos.reduce((s, p) => s + bonoCPTargetDe(p), 0),
})
```

El valor override se inyecta en el registro sintético antes de pasar por `calc()`, que lo detecta y lo usa en lugar de derivarlo del grado.

---

## 6. Conversión de moneda

Tipos de cambio internos (pivote USD):

| Moneda | Rate vs USD |
|---|---|
| COP | 3,950 |
| PEN | 3.50 |
| USD | 1 |

```js
// utils/fx.js
convertir(valor, monedaOrigen, monedaDestino):
  valor / RATE_PER_USD[monedaOrigen] * RATE_PER_USD[monedaDestino]
```

El selector de moneda en la UI (COP / USD / PEN) pasa `monedaDestino` a `fmt()`. Los cálculos internos siempre trabajan en la moneda nativa del país.

---

## 7. Roadmap de pendientes

### Colombia
- [ ] **Medicina Prepagada — fórmula de cálculo:** actualmente es un campo editable con valor anual fijo. Pendiente confirmar si tiene una fórmula (% del sueldo, valor de tabla por grado, etc.)
- [ ] **Aportes y Obligaciones Empleador (sobre salario base):** en el Excel hay una columna separada de "Aportes y Obligaciones Empleador" que no fue explicada aún. La columna actual ("Primas") usa la base ampliada. Confirmar si la columna de salario usa un rate diferente y cuál es la base.
- [ ] **Seguridad Social (20.5%):** existía en la implementación anterior. Confirmar si aplica a alguno de los dos tipos (F o I) o si fue reemplazada por los Aportes y Obligaciones.

### Perú
- [ ] **Comisiones Mensuales:** el campo existe en `camposSumables` y entra en `remuneracionBase`, pero en la UI no está como campo editable. Confirmar si debe ser editable o es siempre 0.
- [ ] **Compensación Country Manager (USD + PEN):** colaboradores con compensación mixta (parte en USD, parte en PEN). Fuera de alcance del prototipo actual.
- [ ] **Bono CP "Máximo" (2× el Target):** se calcula solo el Target. El máximo (= Target × 2) está documentado en la tabla de multiplicadores pero no se muestra aún.

### Ecuador
- [ ] **Seguro:** actualmente es un valor anual fijo en el dato del colaborador. Confirmar si tiene una fórmula de cálculo o si siempre es un valor pactado individualmente.
- [ ] **Comisiones Mensuales:** campo editable en la UI, entra en `camposSumables`. Confirmar si afecta algún componente de carga (actualmente no entra en la base de Aporte Patronal ni Vacaciones).

### General
- [ ] **Cuarto país:** la arquitectura del registry soporta N países. Cuando se incorpore el cuarto país, solo se necesita crear `paises/XX/` con el mismo contrato de módulo.
- [ ] **Datos reales en producción:** los archivos `src/data/local/colaboradoresXX.js` (gitignored) requieren el campo `nSueldos` en Colombia (antes era `bonoTargetAnual`). Los loaders de PE y EC no cambiaron.
- [ ] **Migración a SQL Server:** ver sección 8.

---

## 8. Esquema SQL de referencia

### Tablas principales

```sql
-- Colaboradores (una fila por persona)
CREATE TABLE Colaboradores (
    NumeroId        VARCHAR(20) PRIMARY KEY,
    Pais            CHAR(2)        NOT NULL,  -- 'CO', 'PE', 'EC'
    NombreCompleto  NVARCHAR(200)  NOT NULL,
    GerenciaCorp    NVARCHAR(100),
    Gerencia        NVARCHAR(100),
    Area            NVARCHAR(100),
    Puesto          NVARCHAR(100),
    Grado           VARCHAR(5),               -- 'G17'
    Tipo            NVARCHAR(50),             -- 'Administrativo', 'Operario', etc.
    TipoSalario     CHAR(1),                  -- 'F' o 'I' (solo Colombia)
    Moneda          CHAR(3)        NOT NULL,
    Empresa         NVARCHAR(50),
    Ciudad          NVARCHAR(100),
    Contrato        NVARCHAR(50),
    Activo          BIT DEFAULT 1
);

-- Parámetros salariales (separados para permitir historial)
CREATE TABLE ParametrosSalariales (
    Id              INT IDENTITY PRIMARY KEY,
    NumeroId        VARCHAR(20)    REFERENCES Colaboradores(NumeroId),
    FechaDesde      DATE           NOT NULL,
    FechaHasta      DATE,
    -- Campos Colombia
    SueldoMensualCO DECIMAL(18,2),
    NSueldos        DECIMAL(5,2),            -- N° sueldos para BonoTarget
    MedicinaPrepagadaAnio DECIMAL(18,2),
    -- Campos Perú
    SueldoBasePE    DECIMAL(18,2),
    Vales           DECIMAL(18,2),
    ComisionesMensuales DECIMAL(18,2),
    AsignacionFamiliar  DECIMAL(18,2),
    -- Campos Ecuador
    SueldoMensualEC DECIMAL(18,2),
    Seguro          DECIMAL(18,2),
    ComisionesMensualesEC DECIMAL(18,2)
);

-- Tasas por país (permite actualizar sin redeploy)
CREATE TABLE TasasPais (
    Pais            CHAR(2)        PRIMARY KEY,
    RecargoFijo     DECIMAL(8,6),            -- CO: 0.496000
    RecargoIntegral DECIMAL(8,6),            -- CO: 0.319360
    Gratificaciones DECIMAL(8,6),            -- PE: 0.181700
    EsSalud         DECIMAL(8,6),            -- PE: 0.090000
    SeguroVidaLey   DECIMAL(8,6),            -- PE: 0.001900
    BonoCPFactor    DECIMAL(8,6),            -- PE: 0.138600
    SBU             DECIMAL(18,2),           -- EC: 482.00
    AportePatronal  DECIMAL(8,6),            -- EC: 0.121500
    VacacionesFactor DECIMAL(8,6),           -- EC: 0.500000
    TipoCambioUSD   DECIMAL(10,4)            -- PEN: 3.5, COP: 3950
);
```

### Vista de costos calculados (Colombia ejemplo)

```sql
CREATE VIEW vw_CostoColaboradorCO AS
WITH params AS (
    SELECT c.NumeroId, c.Grado, c.TipoSalario,
           p.SueldoMensualCO  AS SueldoMensual,
           p.NSueldos,
           p.MedicinaPrepagadaAnio,
           t.RecargoFijo, t.RecargoIntegral
    FROM Colaboradores c
    JOIN ParametrosSalariales p ON c.NumeroId = p.NumeroId AND p.FechaHasta IS NULL
    JOIN TasasPais t ON t.Pais = 'CO'
    WHERE c.Pais = 'CO'
),
calc AS (
    SELECT *,
        SueldoMensual * 12                                          AS SalarioAnual,
        SueldoMensual * 1                                           AS PrimaVacaciones,
        SueldoMensual * 0.5                                         AS PrimaNavidad,
        NSueldos * SueldoMensual                                    AS BonoTarget
    FROM params
),
base_calc AS (
    SELECT *,
        SalarioAnual + PrimaVacaciones + PrimaNavidad + BonoTarget  AS Base
    FROM calc
),
primas AS (
    SELECT *,
        Base / 12                                                    AS PrimaServicios,
        Base / 12                                                    AS Cesantias,
        (Base / 12) * 0.12                                          AS ICesantias,
        Base * CASE WHEN TipoSalario='F' THEN RecargoFijo
                    ELSE RecargoIntegral END                         AS AportesObligacionesPrimas
    FROM base_calc
)
SELECT
    NumeroId, Grado, TipoSalario, SueldoMensual, NSueldos,
    SalarioAnual, PrimaVacaciones, PrimaNavidad,
    PrimaServicios, Cesantias, ICesantias,
    MedicinaPrepagadaAnio, BonoTarget, AportesObligacionesPrimas,
    (SalarioAnual + PrimaVacaciones + PrimaNavidad + PrimaServicios
     + Cesantias + ICesantias + MedicinaPrepagadaAnio
     + BonoTarget + AportesObligacionesPrimas)                      AS CostoAnual,
    (SalarioAnual + PrimaVacaciones + PrimaNavidad + PrimaServicios
     + Cesantias + ICesantias + MedicinaPrepagadaAnio
     + BonoTarget + AportesObligacionesPrimas) / 12                 AS CostoMensual
FROM primas;
```

### Stored Procedure: recalcular costo individual

```sql
CREATE PROCEDURE sp_CalcularCostoCO
    @NumeroId    VARCHAR(20),
    @Periodo     INT = 12
AS
BEGIN
    SELECT
        CostoMensual,
        CostoAnual,
        CostoAnual / 3950.0                             AS CostoAnualUSD,
        CostoMensual * @Periodo                         AS Proyeccion,
        (PrimaVacaciones + PrimaNavidad + PrimaServicios
         + Cesantias + ICesantias + AportesObligacionesPrimas) / 12 AS CargaMensual
    FROM vw_CostoColaboradorCO
    WHERE NumeroId = @NumeroId;
END;
```

### Flujo Power Automate → Power Apps

```
[Power Apps — pantalla Colaborador]
    ↓ usuario edita SueldoMensual / NSueldos / TipoSalario
[Power Automate — HTTP trigger]
    → recibe { NumeroId, SueldoMensual, NSueldos, TipoSalario, Periodo }
    → ejecuta sp_CalcularCostoCO (o PE / EC según Pais)
    → devuelve { CostoMensual, CostoAnual, CargaMensual, Proyeccion, Desglose[] }
[Power Apps — actualiza KPIs y tabla de desglose en pantalla]
```

---

*Documento actualizado al 2026-06-30. Verificado contra hojas de cálculo PRIMAX (Colombia: caso Laura Sofía Gómez Vargas — Costo Anual COP 373,894,036.64 ✓).*
