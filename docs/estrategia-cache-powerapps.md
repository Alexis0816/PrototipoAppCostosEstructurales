# Estrategia de Caché — Power Apps Sistema HAY

**Sistema:** Evaluación de Grado Salarial (Hay Group) · Primax  
**Pantalla principal:** Valorar  
**Universo:** ~876 colaboradores · PE / EC / CO / UY  
**Estado:** Fase 1 ✅ · Fase 1.5 ✅ · Fase 1.6 🔧 pendiente de aplicar (fix de desfase en búsqueda, ver más abajo) · Fase 2 pendiente  
**Última actualización:** 09/07/2026

---

## Contexto y problema original

Antes de Fase 1, cada interacción del usuario (cambiar país, activar toggle Regional, aplicar un filtro de Gerencia) disparaba una llamada al Flow `ObtenerDatosFiltro`, que ejecutaba una consulta SQL y devolvía un JSON. Para una tabla de ~876 colaboradores en 4 países, esto implicaba 3–5 segundos de espera por cada acción.

**Solución:** cargar todo el universo de datos una sola vez en `App.OnStart`, y resolver todos los filtros, cambios de país y búsquedas completamente en el cliente. El servidor solo vuelve a consultarse cuando el usuario presiona el botón de Refrescar manualmente.

---

## Arquitectura: las 3 capas de colecciones

```
BD SQL Server · PeopleAnalytics
    ↓  ForAll(["PE";"EC";"UY";"CO"]) — 4 llamadas al Flow
    ↓  Solo en App.OnStart y Refresh
colColaboradoresTodosPaises        ← Capa 0: ~876 filas (todos los países)
    ↓  btnAplicarCambioPais — Filter por Pais o Gerencias Regionales
    ↓  100% cliente · 0 llamadas al servidor
colColaboradores                   ← Capa 1: universo del contexto actual
    ↓  btnFiltroLocal — dropdowns + búsqueda + toggle Puestos Valorados
    ↓  100% cliente · 0 llamadas al servidor
colColaboradoresFiltrados          ← Capa 2: lo que el usuario ve en la tabla
```

**Catálogos derivados de `colColaboradores` (también en cliente):**
- `colCatalogosFiltros`
- `colGerenciasOpciones`
- `colAreasOpciones`
- `colUOOpciones`
- `colPosicionesOpciones`

---

## Cuándo se llama al servidor

| Acción del usuario | Llamada al servidor | Colecciones afectadas |
|---|---|---|
| Abrir la app (App.OnStart) | ✅ Sí — 4 llamadas a ObtenerDatosFiltro | colColaboradoresTodosPaises, colColaboradores, catálogos |
| Presionar Refrescar (🔄) | ✅ Sí — 4 llamadas a ObtenerDatosFiltro | Reconstruye todo desde cero |
| Cambiar país (PE/EC/CO/UY) | ❌ No | colColaboradores, catálogos, colColaboradoresFiltrados |
| Activar/desactivar toggle Regional | ❌ No | colColaboradores, catálogos, colColaboradoresFiltrados |
| Aplicar filtros / búsqueda | ❌ No | colColaboradoresFiltrados |
| Toggle Puestos Valorados | ❌ No | colColaboradoresFiltrados |

---

## Componente 1 — App.OnStart (Sección 5)

Carga los 4 países en una sola operación `ForAll`. El alias `As CodigoPais` es obligatorio para evitar ambigüedad de `ThisRecord` entre el loop externo e interno. `Proper()` normaliza mayúsculas.

```powerappsfl
// ── 1. Carga universal: los 4 países en UNA sola operación ──────────────
Set(varPais; "PE");;
Clear(colColaboradoresTodosPaises);;
ForAll(["PE";"EC";"UY";"CO"] As CodigoPais;
    With(
        { jsonPais: ObtenerDatosFiltro.Run("";"";"";"";"Normal"; CodigoPais.Value; "";"Nombre").resultado };
        If(!IsBlank(jsonPais);
            Collect(colColaboradoresTodosPaises; ForAll(Table(ParseJSON(jsonPais));
                { Tipo:           Text(ThisRecord.Value.Tipo);
                  NumeroID:       Text(ThisRecord.Value.NumID);
                  Nombre:         Proper(Text(ThisRecord.Value.Nombre));
                  Puesto:         Proper(Text(ThisRecord.Value.Puesto));
                  Gerencia:       Proper(Text(ThisRecord.Value.Gerencia));
                  Area:           Proper(Text(ThisRecord.Value.Area));
                  UnidadOrg:      Proper(Text(ThisRecord.Value.UnidadOrganizativa));
                  Pais:           Text(ThisRecord.Value.Pais);
                  UrlDP:          Text(ThisRecord.Value.UrlDP);
                  PuntajeKnowHow: If(IsBlank(ThisRecord.Value.PuntajeKnowHow); 0; Value(ThisRecord.Value.PuntajeKnowHow));
                  PuntajeTotal:   If(IsBlank(ThisRecord.Value.PuntajeTotal); 0; Value(ThisRecord.Value.PuntajeTotal));
                  KFReferenceLevel: If(IsBlank(ThisRecord.Value.KFReferenceLevel); Blank(); Value(ThisRecord.Value.KFReferenceLevel));
                  Estado:         Text(ThisRecord.Value.Estado);
                  GradoHayActual: If(IsBlank(ThisRecord.Value.GradoHayActual); Blank(); Value(ThisRecord.Value.GradoHayActual))
                }
            ))
        )
    )
);;

// ── 2. Universo inicial: PE sin Regional ────────────────────────────────
ClearCollect(colColaboradores; Filter(colColaboradoresTodosPaises; Trim(Pais) = varPais));;

// ── 3. Catálogo derivado localmente ─────────────────────────────────────
ClearCollect(colCatalogosFiltros;
    ForAll(colColaboradores; { Pais:Pais; Gerencia:Gerencia; Area:Area; UnidadOrg:UnidadOrg; Puesto:Puesto }));;

// ── 4. Dropdowns iniciales ───────────────────────────────────────────────
ClearCollect(colGerenciasOpciones; Table({Value:"Seleccione Gerencia..."}));;
Collect(colGerenciasOpciones; Distinct(colCatalogosFiltros; Gerencia));;
ClearCollect(colAreasOpciones; Table({Value:"Seleccione Área..."}));;
ClearCollect(colUOOpciones; Table({Value:"Seleccione Unidad Organizativa..."}));;
ClearCollect(colPosicionesOpciones; Table({Value:"Seleccione Posición..."}));;
Set(varTotalRegistros; 0);; Set(varModoVista; "Normal");;
```

---

## Componente 2 — btnAplicarCambioPais.OnSelect

Deriva `colColaboradores` desde `colColaboradoresTodosPaises` sin ninguna llamada al servidor. Cuando Regional está activo, filtra por las gerencias corporativas específicas en lugar de por país.

```powerappsfl
Set(varCargandoFiltro; true);;

// ── Capa 1: derivar universo del contexto actual ─────────────────────────
ClearCollect(colColaboradores;
    If(On_Off_Regional.Value;
        // Modo Regional: gerencias corporativas de todos los países
        Filter(colColaboradoresTodosPaises;
            Trim(Gerencia) in [
                "Gerencia Corporativa De Recursos Humanos";
                "Gerencia Corporativa De Tecnologia De La Informacion";
                "Gerencia Corporativa De Clientes Y Nuevos Negocios";
                "Gerencia Corporativa De Riesgos Y Cumplimiento";
                "Country Manager Peru"; "Country Manager Ecuador";
                "Gerencia Corporativa De Finanzas";
                "Gerencia Corporativa De Supply Chain"
            ]
        );
        // Modo País: solo el país seleccionado
        Filter(colColaboradoresTodosPaises; Trim(Pais) = varPais)
    )
);;

// ── Reconstruir catálogo y dropdowns desde la nueva capa 1 ───────────────
ClearCollect(colCatalogosFiltros;
    ForAll(colColaboradores; { Pais:Pais; Gerencia:Gerencia; Area:Area; UnidadOrg:UnidadOrg; Puesto:Puesto }));;
ClearCollect(colGerenciasOpciones; {Value:"Seleccione Gerencia..."});;
Collect(colGerenciasOpciones; Distinct(colCatalogosFiltros; Gerencia));;
ClearCollect(colAreasOpciones; {Value:"Seleccione Área..."});;
ClearCollect(colUOOpciones; {Value:"Seleccione Unidad Organizativa..."});;
ClearCollect(colPosicionesOpciones; {Value:"Seleccione Posición..."});;
Reset(drpGerencia);; Reset(drpArea);; Reset(drpUO);; Reset(drpPosicion);;
Set(varTotalRegistros; 0);; Set(varPuestoExpandido; "");; Set(varFiltroJSONTexto; "");;

// ── Aplicar filtro base (dispara btnFiltroLocal) ─────────────────────────
Select(btnFiltroLocal);;
Set(varCargandoFiltro; false)
```

---

## Componente 3 — btnFiltroLocal.OnSelect

Filtra `colColaboradoresFiltrados` desde `colColaboradores` sin ninguna llamada al servidor. Soporta filtros por Gerencia/Área/UO/Posición, toggle Puestos Valorados, y búsqueda multipalabra por Nombre o Posición.

> **⚠️ Trim() es obligatorio en ambos lados de cada comparación.** Los datos de SQL Server pueden tener espacios en blanco al final. Power Fx usa comparación exacta, por lo que `"Finanzas" = "Finanzas "` devuelve `false`. `Proper()` normaliza mayúsculas pero **no elimina espacios**.

```powerappsfl
With(
    {
        fGerencia: If(IsBlank(drpGerencia.Selected) || drpGerencia.Selected.Value = "Seleccione Gerencia...";
                    ""; Trim(Proper(drpGerencia.SelectedText.Value)));
        fArea:     If(IsBlank(drpArea.Selected) || drpArea.Selected.Value = "Seleccione Área...";
                    ""; Trim(Proper(drpArea.SelectedText.Value)));
        fUO:       If(IsBlank(drpUO.Selected) || drpUO.Selected.Value = "Seleccione Unidad Organizativa...";
                    ""; Trim(Proper(drpUO.SelectedText.Value)));
        fPuesto:   If(IsBlank(drpPosicion.Selected) || drpPosicion.Selected.Value = "Seleccione Posición...";
                    ""; Trim(Proper(drpPosicion.SelectedText.Value)));
        textoBuscado: Lower(Trim(inputBusqueda.Text));
        palabras:     Filter(Split(Lower(Trim(inputBusqueda.Text)); " "); !IsBlank(Value));
        porPosicion:  DDCriterioBusqueda.Selected.Value = "Posición"
    };
    ClearCollect(colColaboradoresFiltrados;
        Filter(colColaboradores;
            (fGerencia = "" || Trim(Gerencia) = fGerencia)         &&
            (fArea     = "" || Trim(Area)     = fArea)             &&
            (fUO       = "" || Trim(UnidadOrg) = fUO)             &&
            (fPuesto   = "" || Trim(Puesto)    = fPuesto)          &&
            (!On_Off_PuestosValorados.Value || Estado = "Evaluado") &&
            (IsBlank(textoBuscado) ||
                (porPosicion  && CountIf(palabras; Value in Lower(Puesto)) = CountRows(palabras)) ||
                (!porPosicion && CountIf(palabras; Value in Lower(Nombre)) = CountRows(palabras))
            )
        )
    )
);;
Set(varTotalRegistros; CountRows(colColaboradoresFiltrados))
```

---

## Fase 1.6 (pendiente) — Fix del desfase de búsqueda: Items reactivo en vez de botón+colección

**Origen del hallazgo:** al construir la búsqueda de App Costos Estructurales (2026-07-09) se detectó que el patrón botón+colección (Componentes 2 y 3 de arriba) es la causa del desfase que se percibe en Valorar: `inputBusqueda.OnChange` → `Select(btnFiltroLocal)` → `btnFiltroLocal.OnSelect` → `ClearCollect(colColaboradoresFiltrados; Filter(...))` es una cadena de tres saltos (evento → botón sintético → reconstrucción completa de colección) antes de que la galería pueda volver a pintar. Cada salto le cuesta un ciclo de render; con ~876 filas y varios `ForAll`/`Filter` de por medio, esos ciclos se notan como texto que va por detrás de lo que el usuario ya escribió.

**Fix:** eliminar el intermediario. Bindear `Items` de la galería directo a una fórmula `With(...)`+`Filter(...)` que declare `inputBusqueda.Text`, los dropdowns y el toggle como dependencias. Power Fx recalcula automáticamente esa fórmula en cada cambio de cualquiera de esas dependencias, sin pasar por evento ni por `ClearCollect` — es el mismo mecanismo (y la misma fórmula base) que ya corrigió el desfase en App Costos.

**`Colaboradores.Items` (reemplaza Componentes 2 y 3 combinados)**
```powerappsfl
With(
    {
        fGerencia: If(IsBlank(drpGerencia.Selected) || drpGerencia.Selected.Value = "Seleccione Gerencia...";
                    ""; Trim(Proper(drpGerencia.SelectedText.Value)));
        fArea:     If(IsBlank(drpArea.Selected) || drpArea.Selected.Value = "Seleccione Área...";
                    ""; Trim(Proper(drpArea.SelectedText.Value)));
        fUO:       If(IsBlank(drpUO.Selected) || drpUO.Selected.Value = "Seleccione Unidad Organizativa...";
                    ""; Trim(Proper(drpUO.SelectedText.Value)));
        fPuesto:   If(IsBlank(drpPosicion.Selected) || drpPosicion.Selected.Value = "Seleccione Posición...";
                    ""; Trim(Proper(drpPosicion.SelectedText.Value)));
        textoBuscado: Lower(Trim(inputBusqueda.Text));
        palabras:     Filter(Split(Lower(Trim(inputBusqueda.Text)); " "); !IsBlank(Value));
        porPosicion:  DDCriterioBusqueda.Selected.Value = "Posición"
    };
    Filter(
        colColaboradores;
        (fGerencia = "" || Trim(Gerencia) = fGerencia)         &&
        (fArea     = "" || Trim(Area)     = fArea)             &&
        (fUO       = "" || Trim(UnidadOrg) = fUO)             &&
        (fPuesto   = "" || Trim(Puesto)    = fPuesto)          &&
        (!On_Off_PuestosValorados.Value || Estado = "Evaluado") &&
        (
            IsBlank(textoBuscado) ||
            (porPosicion  && CountIf(palabras; Value in Lower(Puesto)) = CountRows(palabras)) ||
            (!porPosicion && CountIf(palabras; Value in Lower(Nombre)) = CountRows(palabras))
        )
    )
)
```

**Qué se elimina al aplicar este fix:**
- `inputBusqueda.OnChange` — queda vacío o se borra; ya no dispara nada, la galería reacciona sola a `inputBusqueda.Text`.
- `btnFiltroLocal` (botón invisible) y la colección `colColaboradoresFiltrados` — dejan de ser necesarios. Cualquier otro control que hoy lea `colColaboradoresFiltrados` (contadores DP's, `varTotalRegistros`, etc.) debe apuntar a `Colaboradores.AllItems` en su lugar (ver punto siguiente).
- La línea `Select(btnFiltroLocal)` al final de `btnAplicarCambioPais.OnSelect` (Componente 2) y de `Refresh.OnSelect` (Componente 4) — ya no aplica, cambiar `colColaboradores` es suficiente para que `Items` se recalcule solo.

**Trade-off a resolver — `varTotalRegistros` y los contadores DP's:** hoy se setean como efecto secundario dentro de `btnFiltroLocal.OnSelect` (`Set(varTotalRegistros; CountRows(colColaboradoresFiltrados))`). Una fórmula de `Items` no puede tener `Set()` (debe ser pura). Dos opciones:
1. Reemplazar cada lugar que hoy muestra `varTotalRegistros` por `CountRows(Colaboradores.AllItems)` directo (recalculado en vivo, cero variables) — recomendado, más simple.
2. Si se necesita el conteo en un sitio costoso de recalcular repetidamente, mantener un `Set(varTotalRegistros; ...)` disparado solo por `OnChange`/`OnSelect` de los controles de filtro (no por la galería), aceptando que ese número específico puede ir uno o dos caracteres "detrás" — pero la tabla en sí ya no tiene desfase.

**No aplicado todavía** — queda pendiente de que el usuario lo pegue y valide en Valorar (misma dinámica que con Costos: cambiar la fórmula, probar, confirmar antes de borrar `btnFiltroLocal`/`colColaboradoresFiltrados` por si algo más los referencia).

---

## Componente 4 — Refresh.OnSelect

Único punto de recarga desde la BD. Borra `colColaboradoresTodosPaises` y vuelve a ejecutar las 4 llamadas al Flow. Al terminar llama a `btnAplicarCambioPais` que reconstruye las capas 1 y 2 y resetea la UI al estado inicial.

```powerappsfl
Clear(colColaboradoresTodosPaises);;
ForAll(["PE";"EC";"UY";"CO"] As CodigoPais;
    With(
        { jsonPais: ObtenerDatosFiltro.Run("";"";"";"";"Normal"; CodigoPais.Value; "";"Nombre").resultado };
        If(!IsBlank(jsonPais);
            Collect(colColaboradoresTodosPaises; ForAll(Table(ParseJSON(jsonPais));
                { /* mismos campos que App.OnStart */ }
            ))
        )
    )
);;
Set(varPais; "PE");; Set(varModoVista; "Normal");;
Reset(tglOrdenGrado);; Reset(On_Off_PuestosValorados);;
Reset(On_Off_Regional);; Reset(inputBusqueda);;
Select(btnAplicarCambioPais)
```

---

## Patrón reutilizable: buscador + filtros combinados

Este patrón puede trasladarse a cualquier aplicativo Power Apps que tenga una colección en caché, dropdowns de filtro y un campo de búsqueda de texto libre.

### Controles necesarios

| Control | Tipo | Propósito |
|---|---|---|
| `inputBusqueda` | TextInput | Campo de texto libre |
| `DDCriterioBusqueda` | Dropdown | Selector "Nombre" / "Posición" |
| `drpGerencia` | Dropdown | Filtro jerárquico nivel 1 |
| `drpArea` | Dropdown | Filtro jerárquico nivel 2 |
| `drpUO` | Dropdown | Filtro jerárquico nivel 3 |
| `drpPosicion` | Dropdown | Filtro jerárquico nivel 4 |
| `On_Off_PuestosValorados` | Toggle | Filtro booleano adicional |
| `btnFiltroLocal` | Button | Botón invisible que ejecuta el filtro |

### inputBusqueda.OnChange

Disparar el filtro automáticamente cada vez que el usuario escribe:

```powerappsfl
Select(btnFiltroLocal)
```

### btnFiltroLocal.OnSelect — código completo

```powerappsfl
With(
    {
        fGerencia: If(IsBlank(drpGerencia.Selected) || drpGerencia.Selected.Value = "Seleccione Gerencia...";
                    ""; Trim(Proper(drpGerencia.SelectedText.Value)));
        fArea:     If(IsBlank(drpArea.Selected) || drpArea.Selected.Value = "Seleccione Área...";
                    ""; Trim(Proper(drpArea.SelectedText.Value)));
        fUO:       If(IsBlank(drpUO.Selected) || drpUO.Selected.Value = "Seleccione Unidad Organizativa...";
                    ""; Trim(Proper(drpUO.SelectedText.Value)));
        fPuesto:   If(IsBlank(drpPosicion.Selected) || drpPosicion.Selected.Value = "Seleccione Posición...";
                    ""; Trim(Proper(drpPosicion.SelectedText.Value)));
        textoBuscado: Lower(Trim(inputBusqueda.Text));
        palabras:     Filter(Split(Lower(Trim(inputBusqueda.Text)); " "); !IsBlank(Value));
        porPosicion:  DDCriterioBusqueda.Selected.Value = "Posición" || DDCriterioBusqueda.SelectedText.Value = "Posición"
    };
    ClearCollect(
        colColaboradoresFiltrados;
        Filter(
            colColaboradores;
            (fGerencia = "" || Trim(Gerencia) = fGerencia) &&
            (fArea     = "" || Trim(Area)     = fArea)     &&
            (fUO       = "" || Trim(UnidadOrg) = fUO)     &&
            (fPuesto   = "" || Trim(Puesto)    = fPuesto)  &&
            (!On_Off_PuestosValorados.Value || Estado = "Evaluado") &&
            (
                IsBlank(textoBuscado) ||
                (porPosicion  && CountIf(palabras; Value in Lower(Puesto)) = CountRows(palabras)) ||
                (!porPosicion && CountIf(palabras; Value in Lower(Nombre)) = CountRows(palabras))
            )
        )
    )
);;
Set(varTotalRegistros; CountRows(colColaboradoresFiltrados))
```

### Cómo funciona la búsqueda multipalabra

1. `Split(textoBuscado; " ")` divide el texto en palabras individuales
2. `Filter(...; !IsBlank(Value))` elimina los espacios vacíos del split
3. `CountIf(palabras; Value in Lower(campo))` cuenta cuántas palabras están contenidas en el campo
4. `= CountRows(palabras)` exige que **todas** las palabras estén presentes (AND implícito)

> Ejemplo: buscar `"juan lima"` devuelve solo registros donde tanto `"juan"` como `"lima"` aparecen en el nombre/puesto — en cualquier orden.

### Adaptación a otro aplicativo

Para reusar este patrón en otro app, reemplazar:

| Este app | Tu app |
|---|---|
| `colColaboradores` | Tu colección en caché (Capa 1) |
| `colColaboradoresFiltrados` | Tu colección de resultados visibles |
| `Gerencia`, `Area`, `UnidadOrg`, `Puesto` | Los campos de tu tabla que correspondan |
| `Nombre` | El campo de texto principal para búsqueda |
| `On_Off_PuestosValorados` | Cualquier filtro booleano adicional (o eliminar esa línea) |
| `Estado = "Evaluado"` | La condición que aplique a tu toggle |
| `"Seleccione Gerencia..."` | El texto placeholder de cada dropdown |

---

## Reglas críticas al mantener este código

### 1. Trim() en ambos lados de toda comparación de texto
SQL Server puede almacenar campos con espacios en blanco al final. Siempre usar `Trim(campo) = fValor`, nunca `campo = fValor`.

### 2. Proper() normaliza mayúsculas, no espacios
`Proper()` se aplica al cargar datos en `colColaboradoresTodosPaises` para normalizar el case. No elimina espacios — por eso el `Trim()` sigue siendo necesario en los comparadores.

### 3. IsBlank("") devuelve false en Power Fx
SQL usa `ISNULL(UrlDP, '')`, lo que llega a Power Apps como string vacío, no blank real. Para verificar si `UrlDP` tiene valor usar siempre:
```powerappsfl
!IsBlank(UrlDP) && UrlDP <> ""
```

### 4. Alias obligatorio en ForAll anidados
Sin `As CodigoPais` en el loop externo, `ThisRecord` queda ambiguo y Power Apps lanza error de compilación al anidar dos `ForAll`.

### 5. Los catálogos de dropdowns se derivan siempre de colColaboradores (Capa 1)
- Nunca de `colColaboradoresTodosPaises` (mostraría opciones de todos los países)
- Nunca de `colColaboradoresFiltrados` (se reduciría al subconjunto filtrado)

### 6. Los contadores DP's usan colColaboradoresFiltrados
```powerappsfl
// DP's cargados
CountIf(colColaboradoresFiltrados; !IsBlank(UrlDP) && UrlDP <> "")
// DP's valorados
CountIf(colColaboradoresFiltrados; !IsBlank(UrlDP) && UrlDP <> "" && Estado = "Evaluado")
```

---

---

## Adaptación para App Costos Estructurales

El patrón de las 3 capas se reutiliza en el App Costos con las siguientes diferencias:

### Diferencias respecto al Sistema HAY

| Aspecto | Sistema HAY (Valorar) | App Costos |
|---|---|---|
| Países | PE / EC / UY / CO | CO / PE / EC (sin UY) |
| Flow de datos | `ObtenerDatosFiltro` | `ObtenerColaboradores` |
| Toggle adicional | Regional (gerencias corp. de todos los países) | No aplica |
| Toggle de vistas | No | Colaboradores / Gerencias (`varVista`) |
| País por defecto | PE | CO |
| Filtro booleano extra | Puestos Valorados (`Estado = "Evaluado"`) | No aplica |
| Criterio de búsqueda | Nombre o Posición (dropdown selector) | Solo NombreCompleto |
| Campos numéricos extra | Puntajes, Grades Hay | SueldoMensual, CostoTotalMensual, CostoAnualML, CostoAnualUSD, BonoCPTarget, Carga, PctCarga |
| Filtro de rol | No | `varRolCostos = "Usuario"` → solo su gerencia |

### Capa 0 — `App.OnStart` (bloque de caché Costos)

```powerappsfl
// ── BLOQUE DE SESIÓN Y ROL va ANTES de este bloque ─────────────────────
// (ver docs/seguridad-powerapps.md — Paso 7)

Set(varPais; "CO");;
Set(varVista; "colaboradores");;
Clear(colColaboradoresTodosPaises);;

ForAll(["CO"; "PE"; "EC"] As CodigoPais;
    With(
        { jsonPais: ObtenerColaboradores.Run(CodigoPais.Value).resultado };
        If(!IsBlank(jsonPais);
            Collect(colColaboradoresTodosPaises;
                ForAll(Table(ParseJSON(jsonPais));
                    {
                        NumeroID:          Text(ThisRecord.Value.NumeroID);
                        Pais:              Text(ThisRecord.Value.Pais);
                        Moneda:            Text(ThisRecord.Value.Moneda);
                        Empresa:           Text(ThisRecord.Value.Empresa);
                        NombreCompleto:    Proper(Text(ThisRecord.Value.NombreCompleto));
                        GerenciaCorp:      Proper(Text(ThisRecord.Value.GerenciaCorp));
                        Gerencia:          Proper(Text(ThisRecord.Value.Gerencia));
                        Area:              Proper(Text(ThisRecord.Value.Area));
                        Puesto:            Proper(Text(ThisRecord.Value.Puesto));
                        Grado:             If(IsBlank(ThisRecord.Value.Grado); 0; Value(ThisRecord.Value.Grado));
                        Tipo:              Text(ThisRecord.Value.Tipo);
                        SueldoMensual:     If(IsBlank(ThisRecord.Value.SueldoMensual); 0; Value(ThisRecord.Value.SueldoMensual));
                        NSueldos:          If(IsBlank(ThisRecord.Value.NSueldos); 0; Value(ThisRecord.Value.NSueldos));
                        BonoCPTarget:      If(IsBlank(ThisRecord.Value.BonoCPTarget); 0; Value(ThisRecord.Value.BonoCPTarget));
                        CostoTotalMensual: If(IsBlank(ThisRecord.Value.CostoTotalMensual); 0; Value(ThisRecord.Value.CostoTotalMensual));
                        CostoAnualML:      If(IsBlank(ThisRecord.Value.CostoAnualML); 0; Value(ThisRecord.Value.CostoAnualML));
                        CostoAnualUSD:     If(IsBlank(ThisRecord.Value.CostoAnualUSD); 0; Value(ThisRecord.Value.CostoAnualUSD));
                        Carga:             If(IsBlank(ThisRecord.Value.Carga); 0; Value(ThisRecord.Value.Carga));
                        PctCarga:          If(IsBlank(ThisRecord.Value.PctCarga); 0; Value(ThisRecord.Value.PctCarga))
                    }
                )
            )
        )
    )
);;

// ── Capa 1: Colombia (por defecto) ──────────────────────────────────────
ClearCollect(colColaboradores;
    Filter(colColaboradoresTodosPaises; Trim(Pais) = varPais));;

// ── Catálogos derivados localmente ──────────────────────────────────────
ClearCollect(colCatalogosFiltros;
    ForAll(colColaboradores; { Gerencia:Gerencia; Area:Area; Puesto:Puesto }));;

ClearCollect(colGerenciasOpciones; Table({Value:"Todas las gerencias"}));;
Collect(colGerenciasOpciones;
    SortByColumns(Distinct(colCatalogosFiltros; Gerencia); "Value"; Ascending));;
ClearCollect(colAreasOpciones;    Table({Value:"Todas las áreas"}));;
ClearCollect(colPuestosOpciones;  Table({Value:"Todos los puestos"}));;

// ── Capa 2: vista inicial (dispara btnFiltroLocal) ──────────────────────
Select(btnFiltroLocal)
```

### Capa 1 — `btnAplicarCambioPais.OnSelect` (Costos)

```powerappsfl
ClearCollect(colColaboradores;
    Filter(colColaboradoresTodosPaises; Trim(Pais) = varPais));;

ClearCollect(colCatalogosFiltros;
    ForAll(colColaboradores; { Gerencia:Gerencia; Area:Area; Puesto:Puesto }));;

ClearCollect(colGerenciasOpciones; Table({Value:"Todas las gerencias"}));;
Collect(colGerenciasOpciones;
    SortByColumns(Distinct(colCatalogosFiltros; Gerencia); "Value"; Ascending));;
ClearCollect(colAreasOpciones;   Table({Value:"Todas las áreas"}));;
ClearCollect(colPuestosOpciones; Table({Value:"Todos los puestos"}));;

Reset(drpGerencia);; Reset(drpArea);; Reset(drpPuesto);;
Select(btnFiltroLocal)
```

### Capa 2 — `btnFiltroLocal.OnSelect` (Costos)

> **Estado real de la app (2026-07-09)**: `App.OnStart` hoy solo hace un `ClearCollect(colDatosBase; ForAll(ParseJSON(GetColaboradoresCost.Run().resultado); {...}))` — una sola colección con los 3 países mezclados, sin la capa intermedia `colColaboradores` (país actual) descrita más arriba en este doc. Tampoco existen aún `drpGerencia`/`drpArea`/`drpPuesto`, login ni `varRolCostos`. La versión mínima que sí está cableada:

```powerappsfl
With(
    {
        textoBuscado: Lower(Trim(inputBusqueda.Text));
        palabras:     Filter(Split(Lower(Trim(inputBusqueda.Text)); " "); !IsBlank(Value))
    };
    ClearCollect(
        colColaboradoresFiltrados;
        Filter(
            colDatosBase;
            IsBlank(textoBuscado) ||
            CountIf(palabras; Value in Lower(NombreCompleto)) = CountRows(palabras)
        )
    )
);;
Set(varTotalRegistros; CountRows(colColaboradoresFiltrados))
```

**Implementación real elegida (más simple que el patrón botón+colección)**: en vez de `btnFiltroLocal` + `colColaboradoresFiltrados`, el filtro de búsqueda se puso directo en el `Items` de la galería `Colaboradores`, combinado con el filtro de país que ya existía:

```powerappsfl
With(
    {
        palabras: Filter(Split(Lower(Trim(inputBusqueda.Text)); " "); !IsBlank(Value))
    };
    Filter(
        colDatosBase;
        Pais = varPais &&
        (
            CountRows(palabras) = 0 ||
            CountIf(palabras; Value in Lower(NombreCompleto)) = CountRows(palabras)
        )
    )
)
```
Al vivir en `Items`, se recalcula solo cuando cambia `inputBusqueda.Text` o `varPais` — no requiere `OnChange` ni botón invisible. Nota: aquí sí quedó atado a `varPais` desde el principio (a diferencia de lo pedido antes) porque el `Items` original ya filtraba por país; quitarlo habría regresado a mostrar los 3 países mezclados, que no era el objetivo de este paso.

Pendientes explícitos (a pedido del usuario, "por ahora que funcione ignorando X, si me lo piden más adelante lo agrego"):
- **País**: la búsqueda ignora `varPais` (busca sobre los 3 países a la vez), aunque las banderas del header ya setean `varPais` en otro lado. Cuando se pida que la búsqueda respete el país seleccionado, agregar `Trim(Pais) = varPais &&` como primera condición del `Filter`.
- **Rol**: sin `varRolCostos` todavía (no existe login). Cuando se construya, agregar `(varRolCostos <> "Usuario" || Trim(Gerencia) = varGerenciaUsuario) &&`.
- **Dropdowns de Gerencia/Área/Puesto**: no existen controles aún; la sección "Patrón reutilizable" más arriba en este doc tiene la fórmula completa de referencia para cuando se agreguen.

### `inputBusqueda.OnChange` (igual que HAY)

```powerappsfl
Select(btnFiltroLocal)
```

### Cuándo se llama al servidor — App Costos

| Acción | Llamada al servidor | Colecciones afectadas |
|---|---|---|
| Abrir la app (`App.OnStart`) | ✅ 1 llamada sesión + 3 llamadas ObtenerColaboradores | Todas |
| Presionar Refrescar (🔄) | ✅ 3 llamadas ObtenerColaboradores | Reconstruye todo |
| Cambiar país (CO/PE/EC) | ❌ No | colColaboradores, catálogos, colColaboradoresFiltrados |
| Toggle Colaboradores/Gerencias | ❌ No | Cambia `varVista` (solo visual) |
| Filtros / búsqueda | ❌ No | colColaboradoresFiltrados |
| Editar un parámetro + Recalcular | ✅ 1 llamada ActualizarYRecalcular | `colColaboradoresTodosPaises` + capas 1 y 2 (se refresca el registro afectado) |

---

## Fase 2 — Pendiente (bloqueada)

Las pantallas de evaluación siguen consultando la BD en cada cambio de dropdown. Para implementar caché en los factores se necesita compartir el código de cada pantalla.

| Bloqueo | Qué se necesita |
|---|---|
| EvalKnowHow (135 filas) | Código pantalla completa (DDTecnica, DDGerencial, DDRelaciones, modificador, Guardar) + shape de respuesta de `ConsultarKnowHow` |
| Solución de Problemas (~40 filas) | Código pantalla (DDAmbito, DDDesafio, modificador) + `ConsultarSolucionProblemas` |
| Accountability (192 filas) | Código pantalla + `ConsultarAccountability` + botón "Finalizar Evaluación" (para verificar Hallazgo 1.1) |

**Principio Fase 2:** cachear cada matriz una sola vez en `App.OnStart`, resolver sombreado y validación en cliente, llamar al backend solo para guardar.
