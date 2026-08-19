# Migración Parámetros Salariales — Antes/Después (19/08/2026)

## Resumen ejecutivo

Se unifican tarjetas redundantes, se eliminan campos innecesarios y se agregan 2 campos nuevos (`Utilidades`, `Ingreso`) con toggle mensual/anual. El objetivo es que **Prototipo → PowerApps → SQL** queden alineados con la misma estructura de cards por país.

---

## 1. PERÚ — Antes vs. Después

### Antes (4 cards de parámetros + 3 KPIs = 7 cards)

| Fila | Card | Tipo | Valor |
|---|---|---|---|
| 1 | Sueldo Básico Mensual | Editable | `sueldoBase` |
| 1 | Vales | Editable | `vales` |
| 1 | Asignación Familiar | Readonly () | `asignacionFamiliar` (S/113) |
| 2 | Bono CP Target (Mensual/Anual) | Readonly (⇄) | `bonoCPTarget` con multiplicador |
| 2 | *(vacío)* | — | — |
| 3 | Costo Mensual/Anual | KPI () | `CostoTotalMensual` / `CostoAnualML` |
| 3 | Cargas Sociales/Mes | KPI | `Carga` |
| 3 | % Cargas vs. Sueldo Base | KPI | `PctCarga` |

### Después (8 cards: 3-3-2)

| Fila | Card | Tipo | Valor / Fórmula |
|---|---|---|---|
| 1 | Sueldo Básico Mensual | Editable | `sueldoBase` |
| 1 | Vales | Editable | `vales` |
| 1 | **Comisiones Mensuales** | **Editable (NUEVO)** | `comisionesMensuales` |
| 2 | Bono CP Target (Mensual/Anual) | Readonly (⇄) | `bonoCPTarget` con multiplicador |
| 2 | **Utilidades** | **Editable (NUEVO)** | `utilidades` (seteado, fórmula pendiente) |
| 2 | **Ingreso (Mensual/Anual)** | **Readonly (⇄) (NUEVO)** | Mensual: `sueldoBase + vales + comisionesMensuales` / Anual: `ingresoMensual × 14 + bonoCPTarget + utilidades` |
| 3 | Costo Anual | KPI | `CostoAnualML` |
| 3 | Cargas vs. Sueldo Mensual | KPI | `PctCarga` |

**Cambios clave:**
- ❌ Eliminado: `Asignación Familiar` (innecesario, S/113 fijo no aporta valor visual).
- ✅ Agregado: `Comisiones Mensuales` como editable (antes existía en SQL pero no se mostraba en la UI).
- ✅ Agregado: `Utilidades` como editable (valor seteado, fórmula de cálculo pendiente).
- ✅ Agregado: `Ingreso` como card única con toggle Mensual/Anual (fusiona lo que antes eran 2 cards separadas).
- 🔄 Layout: de 3-1-3 (desencuadrado) → **3-3-2** (encuadrado).

---

## 2. ECUADOR — Antes vs. Después

### Antes (6 cards de parámetros + 3 KPIs = 9 cards)

| Fila | Card | Tipo | Valor |
|---|---|---|---|
| 1 | Sueldo Mensual | Editable | `sueldoMensual` |
| 1 | Comisiones | Editable | `comisionesMensuales` |
| 1 | Bono CP Target Anual | Readonly | `bonoCPTarget` con multiplicador |
| 2 | Utilidades | Editable | `utilidades` |
| 2 | Ingreso Mensual | Readonly | `sueldoMensual + comisionesMensuales` |
| 2 | Ingreso Anual | Readonly | `13×sueldo + bono + utilidades + SBU` |
| 3 | Costo Mensual | KPI | `CostoTotalMensual` |
| 3 | Cargas Laborales/Mes | KPI | `Carga` |
| 3 | % Cargas vs. Sueldo | KPI | `PctCarga` |

### Después (7 cards: 3-2-2)

| Fila | Card | Tipo | Valor / Fórmula |
|---|---|---|---|
| 1 | Sueldo Mensual | Editable | `sueldoMensual` |
| 1 | Comisiones | Editable | `comisionesMensuales` |
| 1 | Bono CP Target (Mensual/Anual) | Readonly (⇄) | `bonoCPTarget` con multiplicador |
| 2 | Utilidades | Editable | `utilidades` |
| 2 | **Ingreso (Mensual/Anual)** | **Readonly (⇄) (FUSIONADO)** | Mensual: `sueldoMensual + comisionesMensuales` / Anual: `ingresoMensual × 14 + bonoCPTarget + utilidades` |
| 3 | Costo Mensual | KPI | `CostoTotalMensual` |
| 3 | Cargas vs. Sueldo Mensual | KPI | `PctCarga` |

**Cambios clave:**
- 🔄 Fusionado: `Ingreso Mensual` + `Ingreso Anual` → **1 card con toggle** (reduce de 9 a 7 cards).
- 🔄 Bono CP Target ahora tiene toggle Mensual/Anual (antes era fijo Anual).
- 🔄 Layout: de 3-3-3 → **3-2-2** (encuadrado, igual que Power Apps target).

---

## 3. COLOMBIA — Antes vs. Después

### Antes (3 cards de parámetros + 3 KPIs = 6 cards)

| Fila | Card | Tipo | Valor |
|---|---|---|---|
| 1 | Sueldo Mensual | Editable | `sueldoMensual` |
| 1 | N° Sueldos (Bono) | Editable | `nSueldos` (decimal, ej. 1.5) |
| 1 | Bono Target (Mensual/Anual) | Readonly (⇄) | `bonoTarget` |
| 2 | *(vacío)* | — | — |
| 3 | Costo Mensual | KPI | `CostoTotalMensual` |
| 3 | Carga Prestacional/Mes | KPI | `Carga` |
| 3 | % Carga vs. Salario | KPI | `PctCarga` |

### Después (5 cards: 2-3)

| Fila | Card | Tipo | Valor / Fórmula |
|---|---|---|---|
| 1 | Sueldo Mensual | Editable | `sueldoMensual` |
| 1 | **Bono CP Target (Mensual/Anual) (1.5x)** | **Readonly (⇄) (FUSIONADO)** | `bonoTarget` con multiplicador en label |
| 2 | Costo Mensual | KPI | `CostoTotalMensual` |
| 2 | Cargas vs. Sueldo Mensual | KPI | `PctCarga` |
| 2 | **Ingreso (Mensual)** | **Readonly (NUEVO)** | `sueldoMensual` |

**Cambios clave:**
- 🔄 Fusionado: `N° Sueldos` se integra al label de Bono CP Target como `(1.5x)` (igual que Perú/Ecuador).
- ✅ Agregado: `Ingreso (Mensual)` como readonly (fórmula: `sueldoMensual`, ya que Colombia no tiene vales/comisiones).
- 🔄 Layout: de 3-3 (con hueco) → **2-3** (encuadrado).

---

## 4. MAPA DE CAMPOS POR PAÍS (Prototipo → SQL → PowerApps)

### Campos editables (lápiz)

| País | Campo | Label UI | SQL Column | PowerApps Field |
|---|---|---|---|---|
| CO | `sueldoMensual` | Sueldo Mensual | `SueldoMensual` | `SueldoMensual` |
| PE | `sueldoBase` | Sueldo Básico Mensual | `SueldoMensual` | `SueldoMensual` |
| EC | `sueldoMensual` | Sueldo Mensual | `SueldoMensual` | `SueldoMensual` |
| PE | `vales` | Vales | `Vales` | `Vales` |
| PE | `comisionesMensuales` | Comisiones Mensuales | `ComisionesMensuales` | `ComisionesMensuales` |
| EC | `comisionesMensuales` | Comisiones | `ComisionesMensuales` | `ComisionesMensuales` |
| PE | `utilidades` | Utilidades | **`Utilidades` (NUEVA)** | **`Utilidades` (NUEVO)** |
| EC | `utilidades` | Utilidades | `Utilidades` (ya existe) | `Utilidades` |

### Campos readonly (calculados/seteados)

| País | Campo | Label UI | Fórmula | SQL Column |
|---|---|---|---|---|
| CO | `bonoTarget` | Bono CP Target (Mensual/Anual) (Nx) | `nSueldos × sueldoMensual` | `BonoCPTarget` |
| PE | `bonoCPTarget` | Bono CP Target (Mensual/Anual) (Nx) | `sueldoBase × multiplicadorBono(grado)` | `BonoCPTarget` |
| EC | `bonoCPTarget` | Bono CP Target (Mensual/Anual) (Nx) | `sueldoMensual × multiplicadorBono(grado)` | `BonoCPTarget` |
| PE | `ingreso` | Ingreso (Mensual/Anual) | **Mensual:** `sueldoBase + vales + comisionesMensuales` / **Anual:** `ingresoMensual × 14 + bonoCPTarget + utilidades` | **`PE_IngresoMensual` / `PE_IngresoAnual` (NUEVAS)** |
| EC | `ingreso` | Ingreso (Mensual/Anual) | **Mensual:** `sueldoMensual + comisionesMensuales` / **Anual:** `ingresoMensual × 14 + bonoCPTarget + utilidades` | **`EC_IngresoMensual` / `EC_IngresoAnual` (NUEVAS)** |
| CO | `ingreso` | Ingreso (Mensual) | `sueldoMensual` | **`CO_IngresoMensual` (NUEVA)** |

---

## 5. IMPACTO EN SQL SERVER

### Nuevas columnas en `ColaboradoresCostos`

```sql
ALTER TABLE PeopleAnalytics.ColaboradoresCostos
ADD Utilidades DECIMAL(18,2) NULL DEFAULT 0;  -- PE y EC (editable)
```

### Nuevas columnas en `Resultados_Calculo`

```sql
ALTER TABLE PeopleAnalytics.Resultados_Calculo
ADD PE_Utilidades       DECIMAL(18,2) NULL,
    PE_IngresoMensual   DECIMAL(18,2) NULL,
    PE_IngresoAnual     DECIMAL(18,2) NULL,
    EC_IngresoMensual   DECIMAL(18,2) NULL,
    EC_IngresoAnual     DECIMAL(18,2) NULL,
    CO_IngresoMensual   DECIMAL(18,2) NULL;
```

### Cambios en `sp_CalcularCostos`

- **CTE `CalcPE`**: agregar `b.Utilidades`, `b.SM + b.Vales + b.Coms AS PE_IngresoMensual`, `(b.SM + b.Vales + b.Coms) * 12 + PE_BonoCPTarget + b.Utilidades AS PE_IngresoAnual`.
- **CTE `CalcEC`**: agregar `ef.EC_BonoCPTarget + b.Utilidades + ... AS EC_IngresoAnual` (fórmula: `ingresoMensual × 14 + bonoCPTarget + utilidades`).
- **CTE `CalcCO`**: agregar `co.SM AS CO_IngresoMensual`.
- **`Union_Resultados`**: agregar columnas nuevas en los 3 SELECTs con NULLs en los países que no aplican.
- **`MERGE`**: agregar `T.PE_Utilidades = S.PE_Utilidades`, etc. en UPDATE SET y en INSERT.

### Cambios en `vw_Calculadora_Costos`

Agregar al SELECT:
```sql
c.Utilidades,
r.PE_Utilidades, r.PE_IngresoMensual, r.PE_IngresoAnual,
r.EC_IngresoMensual, r.EC_IngresoAnual,
r.CO_IngresoMensual,
```

### Cambios en `sp_ActualizarCampoColaborador`

- Whitelist: agregar `'Utilidades'`.
- UPDATE CASE: agregar `Utilidades = CASE WHEN @Campo = 'Utilidades' THEN @Valor ELSE Utilidades END`.
- SELECT final: agregar `Utilidades`.

---

## 6. IMPACTO EN POWER AUTOMATE

### Flow `UpdateCollaboratorCost`

| Componente | Cambio |
|---|---|
| Trigger | Ninguno — mismos 3 inputs (`NumeroID`, `Field`, `Value`). |
| Execute SP | Ninguno — el SP devuelve 1 columna más en el result set. |
| Compose | Ninguno — `first()` trae la fila completa automáticamente. |
| Respond | Ninguno — JSON incluye nuevas columnas automáticamente. |

**️ Acción requerida:** Correr el flow una vez manualmente para que Power Automate refresque el esquema del result set.

### Flow `GetColaboradoresCost`

| Componente | Cambio |
|---|---|
| Query | La vista tiene 7 columnas más. |
| Compose | Ninguno — trae todas las columnas automáticamente. |
| Respond | Ninguno — JSON incluye nuevas columnas. |

**⚠️ Acción requerida:** Correr el flow una vez para refrescar esquema.

---

## 7. IMPACTO EN POWERAPPS

### `App.OnStart`

Agregar al `ForAll(ParseJSON(...))`:
```powerappsfl
Utilidades: Value(ThisRecord.Utilidades),
PE_IngresoMensual: Value(ThisRecord.PE_IngresoMensual),
PE_IngresoAnual: Value(ThisRecord.PE_IngresoAnual),
EC_IngresoMensual: Value(ThisRecord.EC_IngresoMensual),
EC_IngresoAnual: Value(ThisRecord.EC_IngresoAnual),
CO_IngresoMensual: Value(ThisRecord.CO_IngresoMensual),
```

### `DetalleCostoColaborador`

| País | Cards nuevas | Cards eliminadas | Cards fusionadas |
|---|---|---|---|
| **Perú** | `CardComisiones` (editable), `CardUtilidades` (editable), `CardIngreso` (readonly ⇄) | `CardAsignacionFamiliar` | `CardIngresoMensual` + `CardIngresoAnual` → `CardIngreso` |
| **Ecuador** | `CardIngreso` (readonly ⇄, fusionado) | `CardIngresoMensual`, `CardIngresoAnual` (separadas) | `CardIngresoMensual` + `CardIngresoAnual` → `CardIngreso` |
| **Colombia** | `CardIngreso` (readonly), `CardBonoCPTarget` (con multiplicador en label) | `CardNSueldos` (separada) | `CardNSueldos` → integrado en label de `CardBonoCPTarget` |

### `DetalleCostoGerenArea`

Agregar `Sum()` de nuevos campos en la consolidación:
```powerappsfl
Utilidades: Sum(Filter(colDatosBase; Pais = varPais && ...); Utilidades),
PE_IngresoMensual: Sum(Filter(colDatosBase; Pais = varPais && ...); PE_IngresoMensual),
PE_IngresoAnual: Sum(Filter(colDatosBase; Pais = varPais && ...); PE_IngresoAnual),
EC_IngresoMensual: Sum(Filter(colDatosBase; Pais = varPais && ...); EC_IngresoMensual),
EC_IngresoAnual: Sum(Filter(colDatosBase; Pais = varPais && ...); EC_IngresoAnual),
CO_IngresoMensual: Sum(Filter(colDatosBase; Pais = varPais && ...); CO_IngresoMensual),
```

---

## 8. ORDEN DE EJECUCIÓN

1. **Prototipo React** ← (este paso, ahora)
2. **PowerApps** (actualizar pantallas y fórmulas)
3. **SQL Server** (scripts 14-17)
4. **Power Automate** (refrescar esquemas de flows)
5. **Validación cruzada** (Excel ↔ Prototipo ↔ SQL ↔ PowerApps)

---

## 9. FÓRMULAS DE CÁLCULO RESUMEN

| País | Campo | Fórmula Mensual | Fórmula Anual |
|---|---|---|---|
| **PE** | Ingreso | `sueldoBase + vales + comisionesMensuales` | `ingresoMensual × 14 + bonoCPTarget + utilidades` |
| **EC** | Ingreso | `sueldoMensual + comisionesMensuales` | `ingresoMensual × 14 + bonoCPTarget + utilidades` |
| **CO** | Ingreso | `sueldoMensual` | N/A (solo mensual) |
| **PE** | Utilidades | Seteado manual | Seteado manual |
| **EC** | Utilidades | Seteado manual | Seteado manual |

> **Regla general Ingreso Anual (19/08):** `Ingreso Anual = Ingreso Mensual × 14 + Bono Target + Utilidades`. El ×14 = 12 meses + 2 gratificaciones (julio y diciembre en Perú). Se aplica igual en Ecuador por regla general.

---

*Documento generado el 19/08/2026 — versión 1.0*
