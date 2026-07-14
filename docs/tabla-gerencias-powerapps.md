# Tabla de Gerencias con Acordeón de Áreas — Power Apps

**App:** Estructura de Costos (Costos Estructurales) · Primax
**Pantalla:** Menu · vista "Gerencias" del toggle Colaboradores/Gerencias
**Referencia de diseño:** prototipo React (`prototipo/src/components/list/TablaGerencias.jsx`, `GerenciaRow.jsx`, `AreaSubRow.jsx`)
**Estado:** ✅ Implementado y validado en la app (09/07/2026) — acordeón de áreas desplegando/contrayendo correctamente · pendiente pantalla de detalle consolidado
**Última actualización:** 09/07/2026

---

## Comportamiento replicado del prototipo

- Tabla agrupada por **Gerencia Corporativa** con filas expandibles: el chevron de cada gerencia despliega/contrae sus **Áreas** como sub-filas insertadas inmediatamente debajo.
- Columnas: Gerencia Corporativa / Área · Empresa · Cantidad · País · Costo Anual · Editar (acción).
- **Cantidad** = headcount del grupo (n° de colaboradores de la gerencia completa, o del área en las sub-filas). Validación rápida: la cantidad de una gerencia debe ser la suma de las cantidades de sus áreas.
- **Costo Anual** = `Sum(CostoAnualML)` del grupo, mostrado en la **moneda nativa del país** (CO `$`, PE `S/`, EC `US$`). La suma en moneda local es segura porque un grupo nunca mezcla países. Misma validación: gerencia = suma de sus áreas. (La tabla de Colaboradores muestra el equivalente individual: `CostoAnualML` de cada persona con el símbolo de su `Moneda`.)
- La búsqueda del NavBar filtra gerencias (multipalabra, igual que la de colaboradores).
- Cambiar de país reconstruye la tabla y colapsa todo; cambiar de vista (toggle) resetea la búsqueda.
- Distinción visual por nivel: sub-filas de área con sangría, fondo tenue y acento **cyan**; gerencias con acento **violeta** (en la app se usa el ícono de ojo para "Costo", consistente con la tabla de colaboradores, en lugar del botón "Ver Costo" del prototipo).

## Por qué una tabla aplanada (el patrón clave)

Power Apps **no permite galerías anidadas**, así que el acordeón gerencia→áreas no puede ser una galería dentro de otra. La solución es una sola colección aplanada `colFilasGerencias` con filas de dos tipos:

| TipoFila | Qué es | Cuándo se muestra |
|---|---|---|
| `"G"` | Fila de gerencia corporativa | Siempre |
| `"A"` | Sub-fila de área | Solo si su gerencia está en `colExpandidas` |

El orden lo garantiza el campo **`SortKey`** (no el orden de inserción, que Power Fx no garantiza):

- Gerencia: `GerenciaCorp & "|0"`
- Área: `GerenciaCorp & "|1|" & Area`

Al ordenar alfabéticamente por `SortKey`, cada bloque de áreas (`|1|...`) queda inmediatamente debajo de su gerencia (`|0`).

## Colecciones

### `colFilasGerencias` — filas de la tabla

Se construye en dos pasos (gerencias primero, áreas después) desde `colDatosBase`, filtrando por `varPais`. Campos: `TipoFila, Etiqueta, Sub, GerenciaCorp, Area, Empresa, Pais, Cantidad, SortKey`.

```powerappsfl
// Filas de GERENCIA
ClearCollect(
    colFilasGerencias;
    ForAll(
        Distinct(Filter(colDatosBase; Pais = varPais); GerenciaCorp) As G;
        With(
            { fila: LookUp(colDatosBase; Pais = varPais && GerenciaCorp = G.Value) };
            {
                TipoFila: "G";
                Etiqueta: fila.Gerencia;
                Sub: "";
                GerenciaCorp: G.Value;
                Area: "";
                Empresa: fila.Empresa;
                Pais: varPais;
                Moneda: fila.Moneda;
                Cantidad: CountRows(Filter(colDatosBase; Pais = varPais && GerenciaCorp = G.Value));
                CostoAnual: Sum(Filter(colDatosBase; Pais = varPais && GerenciaCorp = G.Value); CostoAnualML);
                SortKey: G.Value & "|0"
            }
        )
    )
);;
// Filas de ÁREA — Distinct sobre clave concatenada + Split (sin Ungroup)
Collect(
    colFilasGerencias;
    ForAll(
        Distinct(
            Filter(colDatosBase; Pais = varPais);
            GerenciaCorp & "|" & Area
        ) As GA;
        With(
            {
                claveG: First(Split(GA.Value; "|")).Value;
                claveA: Last(Split(GA.Value; "|")).Value
            };
            With(
                { fila: LookUp(colDatosBase; Pais = varPais && GerenciaCorp = claveG && Area = claveA) };
                {
                    TipoFila: "A";
                    Etiqueta: claveA;
                    Sub: claveG;
                    GerenciaCorp: claveG;
                    Area: claveA;
                    Empresa: fila.Empresa;
                    Pais: varPais;
                    Moneda: fila.Moneda;
                    Cantidad: CountRows(Filter(colDatosBase; Pais = varPais && GerenciaCorp = claveG && Area = claveA));
                    CostoAnual: Sum(Filter(colDatosBase; Pais = varPais && GerenciaCorp = claveG && Area = claveA); CostoAnualML);
                    SortKey: claveG & "|1|" & claveA
                }
            )
        )
    )
);;
```

> **Por qué no `Ungroup` + `ForAll` anidado:** el motor de análisis moderno de Power Fx rechaza `Ungroup(ForAll(...); "columna")` ("argumentos no válidos"). El equivalente estable es `Distinct` sobre `GerenciaCorp & "|" & Area` y recuperar las partes con `Split`. Si `First(Split(...)).Value` marca error en otra versión, usar `.Result` en su lugar. El separador `|` asume que ningún nombre organizacional lo contiene.

Este bloque vive en **dos lugares** (deben mantenerse idénticos):
1. `App.OnStart` — sección 4, tras cargar `colDatosBase`.
2. `btnConstruirGerencias.OnSelect` (botón invisible en Menu) + `Clear(colExpandidas)` al final.

> Nota de contexto: el `App.OnStart` completo tiene hoy 6 secciones — 1. sesión, 2. variables de estado, 3. `colDatosBase` (incluye los desgloses `CO_*Mensual`/`EC_*Mensual` para la vista detalle), 4. filas de gerencias (este bloque), 5. `colExpandidas`, 6. estado y esquemas de la vista detalle (`varColabSel`, `varMoneda`, `varPeriodo`, `varTC`, `colFilasDesglose`, `colSlices`). Las secciones 3 y 6 no afectan esta tabla, pero el orden importa: 4 y 6 dependen de que 3 ya haya corrido.

### `colExpandidas` — estado del acordeón

Contiene una fila `{Key: GerenciaCorp}` por cada gerencia expandida. **Debe definirse con esquema en `App.OnStart`** o todo `Clear`/`RemoveIf`/`in` posterior queda sin tipo (subrayado rojo):

```powerappsfl
ClearCollect(colExpandidas; {Key: ""});;
Clear(colExpandidas)
```

## Cableado de la pantalla Menu

| Control | Evento | Código |
|---|---|---|
| Banderas de país (×3) | `OnSelect` (al final) | `;; Select(btnConstruirGerencias)` |
| Toggle "Colaboradores" | `OnSelect` | `Set(varVista; "colaboradores");; Reset(inputBusqueda)` |
| Toggle "Gerencias" | `OnSelect` | `Set(varVista; "gerencias");; Reset(inputBusqueda);; Clear(colExpandidas)` |
| Contenedor colaboradores | `Visible` | `varVista = "colaboradores"` |
| Header + galería gerencias | `Visible` | `varVista = "gerencias"` |

## Galería `GaleriaGerencias`

Galería vertical en blanco. `TemplateSize: 72` · `TemplatePadding: 0`.

**`Items`** — acordeón + búsqueda multipalabra (reactivo, sin botón intermedio — ver "Fase 1.6" en `estrategia-cache-powerapps.md` para el porqué):

```powerappsfl
With(
    {
        palabras: Filter(Split(Lower(Trim(inputBusqueda.Text)); " "); !IsBlank(Value))
    };
    SortByColumns(
        Filter(
            colFilasGerencias;
            (TipoFila = "G" || GerenciaCorp in colExpandidas.Key) &&
            (
                CountRows(palabras) = 0 ||
                CountIf(palabras; Value in Lower(GerenciaCorp)) = CountRows(palabras) ||
                CountIf(palabras; Value in Lower(If(TipoFila = "G"; Etiqueta; Sub))) = CountRows(palabras)
            )
        );
        "SortKey"
    )
)
```

Las filas "A" matchean la búsqueda por su gerencia padre (`Sub`), para que al buscar una gerencia expandida no desaparezcan sus áreas.

### Chevron — despliegue de áreas

```powerappsfl
// OnSelect — toggle de expansión
If(
    ThisItem.GerenciaCorp in colExpandidas.Key;
    RemoveIf(colExpandidas; Key = ThisItem.GerenciaCorp);
    Collect(colExpandidas; {Key: ThisItem.GerenciaCorp})
)

// Icon — gira al expandir
If(ThisItem.GerenciaCorp in colExpandidas.Key; Icon.ChevronDown; Icon.ChevronRight)
```

`Visible: ThisItem.TipoFila = "G"`. La galería se redibuja sola al tocar `colExpandidas` (su `Items` depende de ella). Tooltip: "Desplegar Áreas".

### Ícono Costo (ojo) — selección para el futuro detalle

```powerappsfl
Set(varGerenciaSel; ThisItem.GerenciaCorp);;
Set(varAreaSel; If(ThisItem.TipoFila = "A"; ThisItem.Area; ""));;
Set(varTipoDetalle; If(ThisItem.TipoFila = "G"; "gerencial"; "area"))
// Navigate(DetalleGerencia; ScreenTransition.Fade) — activar cuando exista la pantalla
```

### Columna Costo Anual — label

```powerappsfl
Switch(ThisItem.Moneda; "COP"; "$ "; "PEN"; "S/ "; "US$ ") &
Text(ThisItem.CostoAnual; "#,##0")
```

(En la galería de Colaboradores el equivalente usa `ThisItem.CostoAnualML` directo.) Nota: la columna "Editar" (lápiz) solo tiene sentido en la vista individual — los parámetros se editan por colaborador y el consolidado se recalcula solo; en filas de gerencia/área la acción es ver el detalle.

### Estilos por nivel (colores del prototipo)

| Elemento | Gerencia ("G") | Área ("A") |
|---|---|---|
| Fondo de fila | transparente | `RGBA(30, 58, 95, 0.1)` |
| Etiqueta | blanco · semibold · X=48 | `RGBA(226,232,240,1)` · normal · X=68 (sangría) |
| Sub-label (gerencia padre) | — | `RGBA(100,116,139,1)` · tamaño 9 |
| Acento del botón/acción | violeta `RGBA(167,139,250,1)` sobre `RGBA(139,92,246,0.15)` | cyan `RGBA(34,211,238,1)` sobre `RGBA(6,182,212,0.15)` |
| Divisor inferior | `RGBA(30,41,59,1)` × 1px | igual |

Anchos de columna (header y template): 28% / 24% / 22% / 8% / 18-20%.

## Contador de registros del NavBar

```powerappsfl
If(
    varVista = "colaboradores";
    CountRows(Colaboradores.AllItems);
    CountIf(GaleriaGerencias.AllItems; TipoFila = "G")
) & " registros · " &
Switch(varPais; "CO"; "Colombia"; "PE"; "Perú"; "EC"; "Ecuador")
```

## Gotchas del motor moderno de Power Fx (aprendidos aquí)

1. **`Set(var; Blank())` no define tipo** → "No se ha encontrado ningún tipo para la variable". Inicializar siempre tipado: `""` para texto, `0` para números. Aplica también al limpiar en Cerrar Sesión.
2. **`Clear`/`RemoveIf` sobre colección nunca definida** → sin tipo. Definir esquema una vez en OnStart (`ClearCollect(col; {Key: ""});; Clear(col)`).
3. **`Ungroup` con ForAll anidado** → "argumentos no válidos". Usar el patrón Distinct-clave-concatenada + Split.
4. **`Trim()` al cargar `colDatosBase`** en `Pais, Empresa, NombreCompleto, GerenciaCorp, Gerencia, Area, Puesto` — sin esto, espacios colgantes de SQL crean grupos duplicados en `Distinct` y rompen los `=` de los filtros.

## Pendientes

- **Pantalla `DetalleGerencia`** (destino del ícono Costo en filas "G" y "A"): KPIs consolidados = `Sum()` de los campos calculados del grupo (`CostoTotalMensual`, `CostoAnualML`, `CostoAnualUSD`, `Carga`, `BonoCPTarget`...). **`PctCarga` no se suma** — se recalcula como ratio (`Sum(Carga) / Sum(base)`). No requiere ningún flow nuevo: todo sale de `colDatosBase`. El ícono ya deja lista la selección en `varGerenciaSel`/`varAreaSel`/`varTipoDetalle` ("gerencial"/"area"); solo falta descomentar el `Navigate` cuando exista la pantalla.
- Clic en la fila completa como atajo de navegación (hoy solo el ícono navega), igual que el prototipo.
- La búsqueda de gerencias hoy ignora el rol (`varRolCostos`) — cuando se activen las limitaciones de `Usuario`, añadir la misma condición de rol que la galería de colaboradores.

## Relación con la vista de detalle individual (en construcción)

La pantalla `DetalleCosto` (Costeo del Colaborador — "Análisis de costo") se está construyendo primero, desde la tabla de **Colaboradores** (ícono de ojo → `Set(varColabSel; ThisItem);; Set(varTipoDetalle; "individual");; Navigate(DetalleCosto)`). Su maquetación reutiliza el mismo lenguaje visual de esta tabla (cards navy-900, pills, acentos por color) y sus desgloses/slices se arman en `DetalleCosto.OnVisible` desde los campos `CO_*/PE_*/EC_*` de `colDatosBase` — todos precalculados por `sp_CalcularCostos` en SQL (las columnas `*Mensual` son provisiones anual÷12 materializadas, no historia mensual; PowerApps solo muestra, nunca recalcula). Cuando `DetalleCosto` esté validada, la versión consolidada (`DetalleGerencia`) seguirá el mismo esqueleto cambiando los valores individuales por `Sum()` del grupo.
