# Vista de Detalle — Costeo del Colaborador / Análisis Consolidado

**App:** Estructura de Costos (Costos Estructurales) · Primax
**Pantalla:** `DetalleCosto`
**Referencia de diseño:** prototipo React (`prototipo/src/components/detail/*.jsx`)
**Estado:** 🔧 En construcción — Identidad ✅ · Parámetros Salariales (CO y PE) ✅ · Desglose de Cargas ✅ · Período reactivo (Mensual/Anual): Desglose ✅ y Parámetros ✅ · **Edición inline + recálculo ✅ confirmado funcionando end-to-end (21/07)** en las 2 tarjetas editables (Sueldo, N° Sueldos/Vales/Comisiones) vía flow `UpdateCollaboratorCost` · **Formato numérico EE.UU. (`,` miles / `.` decimal) ✅** aplicado en las tarjetas editables y en el Desglose (filas 1-5) · 🔧 pendiente aplicar el mismo formato a la 6ª fila del Desglose, su footer y `ContainerKpis` (nombres de control sin confirmar) · Composición (dona) pendiente · `ContainerParEC` pendiente
**Última actualización:** 2026-07-21

---

## Principio de diseño: una sola pantalla, un registro normalizado

Igual que el prototipo (`DetailView.jsx` recibe siempre un "registro" con la misma forma, sea colaborador individual o consolidado sintético de Gerencia/Área — ver `appReducer.js`), `DetalleCosto` es **una sola pantalla para los 3 modos** (`individual` / `gerencial` / `area`). La clave es `varDetalle`: un registro construido en `OnVisible` que **normaliza** los tres casos a la misma forma. Ningún control de la pantalla debe leer `varColabSel`, `varGerenciaSel` ni `varAreaSel` directamente — todos leen `varDetalle` y `varTipoDetalle`. Si un control lee `varColabSel` a secas, se "congela" con el último colaborador individual visitado en cuanto entras por Gerencias (bug real que ya nos pasó y corregimos).

## `DetalleCosto.OnVisible` — completo

Orden importante: `locCampoEditando` (variable de contexto) debe declararse **primero** — moverla al inicio corrigió un error real de "tipos de variable de contexto incompatibles" que salía cuando quedaba después de bloques largos.

```powerappsfl
// ── Estado de edición inline (Parámetros Salariales) ────────────
UpdateContext({locCampoEditando: ""});;

// ═════════════════════════════════════════════════════════════
// CONSTRUIR EL REGISTRO DE LA VISTA (individual o consolidado)
// ═════════════════════════════════════════════════════════════
Set(
    varDetalle;
    Switch(
        varTipoDetalle;
        "individual";
        Patch(varColabSel; {Cantidad: 1});
        // "gerencial" y "area" (rama por defecto): consolidado del grupo
        With(
            {
                grupo: Filter(
                    colDatosBase;
                    Pais = varPais &&
                    GerenciaCorp = varGerenciaSel &&
                    (varTipoDetalle = "gerencial" || Area = varAreaSel)
                )
            };
            Patch(
                First(grupo);   // hereda Pais, Moneda, Empresa, Gerencia...
                {
                    NumeroID: "0000";
                    NombreCompleto: If(varTipoDetalle = "gerencial"; First(grupo).Gerencia; varAreaSel);
                    Puesto: If(varTipoDetalle = "gerencial"; "Consolidado de Gerencia"; "Consolidado de Área")
                            & " — " & CountRows(grupo) & " colaboradores";
                    Cantidad: CountRows(grupo);
                    SueldoMensual: Sum(grupo; SueldoMensual); NSueldos: 0;
                    MedicinaPrepagadaAnio: Sum(grupo; MedicinaPrepagadaAnio);
                    Vales: Sum(grupo; Vales); ComisionesMensuales: Sum(grupo; ComisionesMensuales);
                    AsignacionFamiliar: Sum(grupo; AsignacionFamiliar); Seguro: Sum(grupo; Seguro);
                    // Totales — cada bono ya fue calculado POR PERSONA en SQL, por eso sumar es correcto
                    BonoCPTarget: Sum(grupo; BonoCPTarget); BonoCPMensual: Sum(grupo; BonoCPMensual);
                    CostoTotalMensual: Sum(grupo; CostoTotalMensual); CostoAnualML: Sum(grupo; CostoAnualML);
                    CostoAnualUSD: Sum(grupo; CostoAnualUSD); Carga: Sum(grupo; Carga);
                    // ⚠️ PctCarga NO se suma — se recalcula como ratio del grupo
                    PctCarga: If(Sum(grupo; SueldoMensual) > 0; Sum(grupo; Carga) / Sum(grupo; SueldoMensual); 0);
                    // Desgloses CO/PE/EC — todos Sum() directo
                    CO_PrimaVacacionesMensual: Sum(grupo; CO_PrimaVacacionesMensual);
                    CO_PrimaNavidadMensual: Sum(grupo; CO_PrimaNavidadMensual);
                    CO_PrimaServiciosMensual: Sum(grupo; CO_PrimaServiciosMensual);
                    CO_CesantiasMensual: Sum(grupo; CO_CesantiasMensual);
                    CO_ICesantiasMensual: Sum(grupo; CO_ICesantiasMensual);
                    CO_AportesPrimasMensual: Sum(grupo; CO_AportesPrimasMensual);
                    CO_MedicinaMensual: Sum(grupo; CO_MedicinaMensual); CO_BonoMensual: Sum(grupo; CO_BonoMensual);
                    PE_IngresosTotales: Sum(grupo; PE_IngresosTotales); PE_Gratificaciones: Sum(grupo; PE_Gratificaciones);
                    PE_CTS: Sum(grupo; PE_CTS); PE_EsSalud: Sum(grupo; PE_EsSalud);
                    PE_SeguroVidaLey: Sum(grupo; PE_SeguroVidaLey); PE_CostoDeVales: Sum(grupo; PE_CostoDeVales);
                    EC_XIIIMensual: Sum(grupo; EC_XIIIMensual); EC_SBUMensual: Sum(grupo; EC_SBUMensual);
                    EC_FondoMensual: Sum(grupo; EC_FondoMensual); EC_AportePatronalMensual: Sum(grupo; EC_AportePatronalMensual);
                    EC_VacacionesMensual: Sum(grupo; EC_VacacionesMensual); EC_SeguroMensual: Sum(grupo; EC_SeguroMensual)
                }
            )
        )
    )
);;

// ── Selectores y tipo de cambio ──────────────────────────────
Set(varMoneda; varDetalle.Moneda);;
Set(varPeriod; "mensual");;
Set(varTC; If(varDetalle.CostoAnualUSD > 0; varDetalle.CostoAnualML / varDetalle.CostoAnualUSD; 1));;

// ── colFilasDesglose (ver sección Desglose de Cargas) ─────────
ClearCollect(colFilasDesglose; Switch(varDetalle.Pais; "CO"; Table(...); "PE"; Table(...); Table(...)));;

// ── colSlices (dona de composición, pendiente de UI) ──────────
With({ t: varDetalle.CostoTotalMensual }; Switch(varDetalle.Pais; "CO"; With(...; ClearCollect(colSlices; ...)); ...))
```

(Las tablas completas de `colFilasDesglose` y `colSlices` están en la sección "Desglose de Cargas" más abajo.)

## Puntos de entrada — cada uno debe setear `varTipoDetalle` completo

| Origen | `OnSelect` |
|---|---|
| Ojo, tabla Colaboradores | `Set(varColabSel; ThisItem);; Set(varTipoDetalle; "individual");; Navigate(DetalleCosto; ScreenTransition.Fade)` |
| Ícono, tabla Gerencias (filas "G"/"A") | `Set(varGerenciaSel; ThisItem.GerenciaCorp);; Set(varAreaSel; If(ThisItem.TipoFila = "A"; ThisItem.Area; ""));; Set(varTipoDetalle; If(ThisItem.TipoFila = "G"; "gerencial"; "area"));; Navigate(DetalleCosto; ScreenTransition.Fade)` |

## Identidad (`ColabName`, `PuestoGerencia`)

```powerappsfl
// ColabName.Text — nunca un Switch manual, varDetalle ya lo normaliza
varDetalle.NombreCompleto

// PuestoGerencia (contenedor).Visible — se oculta solo en gerencial (redundante con el nombre)
varTipoDetalle <> "gerencial"

// PuestoName.Text / GerCorpName.Text — dentro de PuestoGerencia
varDetalle.Puesto   // ya trae "Consolidado de Área — N colaboradores" en modo área
varDetalle.Gerencia // heredada del grupo vía Patch(First(grupo); ...)

// Pills (Grado / Tipo / Contrato) — Visible del grupo
varTipoDetalle = "individual"
```

**Gotcha de layout resuelto**: al ocultar `PuestoGerencia`, el label `ColabName` quedaba pegado arriba en vez de centrarse. Fix en dos pasos: (1) `InfoColab.Alto automático: Activado` para que el contenedor se encoja cuando su hijo se oculta; (2) en el contenedor padre (`MainTag`), usar la propiedad nativa de alineación del auto-layout (`Alinear elementos` si es horizontal / `Justificar contenido` si es vertical) en `Centro` — **no** una fórmula manual de `Y`, porque si el padre también es auto-layout (altura calculada de sus hijos), leer `Parent.Height` desde el hijo crea una referencia circular.

### Pill "Grado" — 3ra tarjeta editable (🔧 en implementación, estructura confirmada 21/07)

Grado vive en `MainTag > GradeTipoSalario > GradeEdit` (junto a `InfoColab`, dentro del header de Identidad). Árbol real confirmado por captura (21/07):

```
GradeTipoSalario
 └── GradeEdit
      ├── InpuToEditGrade    (input de edición)
      ├── GradeName          (label de solo lectura, hoy muestra "G16" fijo)
      ├── EditGrade          (ícono lápiz)
      └── ContainerGradeEdit
           ├── OkEditGrade
           └── CancelEditGrade
```

**Modelo de datos (verificado en SQL antes de tocar nada)**: `Grado` es `INT` puro en `ColaboradoresCostos` (`sql/03_tabla_colaboradores.sql` línea 32) y en `vw_Calculadora_Costos` — el prefijo `"G"` es solo de UI, nunca se guarda. `sp_CalcularCostos` usa `Grado` para el lookup de multiplicador de bono (`Parametros_MultiplicadorBono`, join `Grado BETWEEN GradoMin AND GradoMax` por país) en **los 3 países** — editar Grado recalcula `BonoCPTarget` y todo lo que depende de él, igual que los otros 3 campos editables.

✅ **SQL ya actualizado (21/07)**: `sql/13_sp_ActualizarCampoColaborador.sql` — `'Grado'` agregado a la whitelist, nueva rama en el `UPDATE` (`CAST(@Valor AS INT)`, sin prefijo), y `Grado` agregado al `SELECT` final. **Falta volver a ejecutar el script completo en SSMS** para que el cambio tome efecto (mismo procedimiento que la vez anterior).

✅ **Nombres reales, listos para copiar y pegar en Studio**:

```powerappsfl
// GradeName.Text — modo solo-lectura
"G" & varDetalle.Grado
// GradeName.Visible
locCampoEditando <> "Grado"

// EditGrade (lápiz).Visible
// ⚠️ Corregido (21/07): se intentó (GradeName.Hover || EditGrade.Hover) para revelar el lápiz
// solo al pasar el mouse — Studio lo rechazó: "El nombre no es válido. No se reconoce 'Hover'."
// .Hover no es una propiedad legible entre controles en este entorno. Se descarta hover,
// mismo patrón "siempre visible si corresponde" que Sueldo y N° Sueldos/Vales/Comisiones.
locCampoEditando <> "Grado" && varTipoDetalle = "individual" && varRolCostos = "Administrador"
// EditGrade.OnSelect
UpdateContext({locCampoEditando: "Grado"});;
Reset(InpuToEditGrade)

// InpuToEditGrade.Default — sin prefijo "G", el número tal cual
Text(varDetalle.Grado)
// InpuToEditGrade.Visible
locCampoEditando = "Grado"
// InpuToEditGrade.DisplayMode
If(locGuardando; DisplayMode.Disabled; DisplayMode.Edit)

// ContainerGradeEdit (Ok/Cancel).Visible
locCampoEditando = "Grado"
// CancelEditGrade.OnSelect
UpdateContext({locCampoEditando: ""})

// OkEditGrade.OnSelect — mismo patrón de validación + no-op + flow + delta que Sueldo/NSueldos,
// pero sin conversión de moneda ni período (Grado es un entero simple, no un monto)
If(
    IsBlank(InpuToEditGrade.Text) || !IsNumeric(InpuToEditGrade.Text) || Value(InpuToEditGrade.Text) < 0;
    Notify("Ingresa un grado numérico válido"; NotificationType.Error);

    Round(Value(InpuToEditGrade.Text); 0) = varDetalle.Grado;
    UpdateContext({locCampoEditando: ""});;
    Notify("No hay cambios que guardar"; NotificationType.Information);

    UpdateContext({locGuardando: true});;
    With(
        {respuesta: IfError(UpdateCollaboratorCost.Run(varDetalle.NumeroID; "Grado"; Round(Value(InpuToEditGrade.Text); 0)).result; "")};
        If(
            IsBlank(respuesta);
            Notify("No se pudo guardar el cambio. Revisa la conexión e intenta de nuevo."; NotificationType.Error);

            With(
                {nuevo: ParseJSON(respuesta)};
                With(
                    {delta: {
                        SueldoMensual: Value(nuevo.SueldoMensual);
                        NSueldos: Value(nuevo.NSueldos);
                        Vales: Value(nuevo.Vales);
                        ComisionesMensuales: Value(nuevo.ComisionesMensuales);
                        Grado: Value(nuevo.Grado);
                        BonoCPTarget: Value(nuevo.BonoCPTarget);
                        BonoCPMensual: Value(nuevo.BonoCPMensual);
                        CostoTotalMensual: Value(nuevo.CostoTotalMensual);
                        CostoAnualML: Value(nuevo.CostoAnualML);
                        CostoAnualUSD: Value(nuevo.CostoAnualUSD);
                        Carga: Value(nuevo.Carga);
                        PctCarga: Value(nuevo.PctCarga);
                        CO_PrimaVacacionesMensual: Value(nuevo.CO_PrimaVacacionesMensual);
                        CO_PrimaNavidadMensual: Value(nuevo.CO_PrimaNavidadMensual);
                        CO_PrimaServiciosMensual: Value(nuevo.CO_PrimaServiciosMensual);
                        CO_CesantiasMensual: Value(nuevo.CO_CesantiasMensual);
                        CO_ICesantiasMensual: Value(nuevo.CO_ICesantiasMensual);
                        CO_AportesPrimasMensual: Value(nuevo.CO_AportesPrimasMensual);
                        CO_MedicinaMensual: Value(nuevo.CO_MedicinaMensual);
                        CO_BonoMensual: Value(nuevo.CO_BonoMensual);
                        PE_IngresosTotales: Value(nuevo.PE_IngresosTotales);
                        PE_Gratificaciones: Value(nuevo.PE_Gratificaciones);
                        PE_CTS: Value(nuevo.PE_CTS);
                        PE_EsSalud: Value(nuevo.PE_EsSalud);
                        PE_SeguroVidaLey: Value(nuevo.PE_SeguroVidaLey);
                        PE_CostoDeVales: Value(nuevo.PE_CostoDeVales);
                        EC_XIIIMensual: Value(nuevo.EC_XIIIMensual);
                        EC_SBUMensual: Value(nuevo.EC_SBUMensual);
                        EC_FondoMensual: Value(nuevo.EC_FondoMensual);
                        EC_AportePatronalMensual: Value(nuevo.EC_AportePatronalMensual);
                        EC_VacacionesMensual: Value(nuevo.EC_VacacionesMensual);
                        EC_SeguroMensual: Value(nuevo.EC_SeguroMensual)
                    }};
                    Patch(colDatosBase; LookUp(colDatosBase; NumeroID = varDetalle.NumeroID); delta);;
                    Set(varDetalle; Patch(varDetalle; delta));;
                    Set(varTC; If(varDetalle.CostoAnualUSD > 0; varDetalle.CostoAnualML / varDetalle.CostoAnualUSD; 1));;
                    Set(varRefrescarGerencias; true);;
                    UpdateContext({locCampoEditando: ""});;
                    Notify("Colaborador actualizado y costos recalculados"; NotificationType.Success)
                )
            )
        )
    );;
    UpdateContext({locGuardando: false})
)
```

⚠️ **Grado inválido no tira error, silencia el bono**: si el grado editado cae fuera de todas las bandas `GradoMin`/`GradoMax` de `Parametros_MultiplicadorBono` para ese país, el `LEFT JOIN` en `sp_CalcularCostos` no encuentra multiplicador y `BonoCPTarget` puede quedar en 0/NULL sin que la app avise nada — no es un bug de este cambio, es el comportamiento ya existente del SP ante un grado fuera de rango.

## Selectores Moneda / Período

El toggle visual es un control **HTML** (`Money`, `Period`, dentro de `MoneyPeriod > TipoMoneda` / `Container8`) — ver razones y limitaciones en `docs/seguridad-powerapps.md`/histórico de esta sesión (control HTML no dispara `OnSelect`). La interactividad la dan **botones nativos transparentes superpuestos** (`LeftMoneyLocal`/`RightUSD` para Moneda, `LeftMensual`/`RightAnual` para Período):

```powerappsfl
// LeftMoneyLocal.OnSelect
Set(varMoneda; varDetalle.Moneda)
// RightUSD.OnSelect
Set(varMoneda; "USD")
// LeftMensual.OnSelect
Set(varPeriod; "mensual")
// RightAnual.OnSelect
Set(varPeriod; "anual")
```

`MoneyPeriod.Visible` (el toggle Moneda específicamente): `varDetalle.Moneda <> "USD"` (Ecuador no lo muestra, su moneda nativa ya es USD).

⚠️ **Bug conocido, en investigación (16/07)**: los 4 botones transparentes se desalinean del HTML al hacer scroll vertical — ver sección "Pendientes".

## Período reactivo (Mensual/Anual) — qué togglea y qué no

Réplica exacta de la regla ya implementada en el prototipo (`ParametrosSalariales.jsx`/`DesglosePrestacional.jsx`, 20/07). La variable real de este toggle es **`varPeriod`** (⚠️ no `varPeriodo` — nombre corregido el 20/07 tras verificar con el usuario), con valores **string** `"mensual"` / `"anual"` (⚠️ no números 1/12). `varPeriod`, seteado por `LeftMensual`/`RightAnual`, no solo debe mover el tile "Costo" de `ContainerKpis` — también debe mover **todo el Desglose de Cargas** y algunos campos de **Parámetros Salariales**. No todos los campos son iguales:

**Togglea con `varPeriod`** (mensual ⇄ anual, ×12 o ÷12):
- Todas las filas del Desglose de Cargas + su total + los títulos "...Mensual"/"...Anual" + el header de columna "Valor Mensual"/"Valor Anual".
- En Parámetros Salariales, los campos de solo lectura que son dinero y no tienen ya una tarjeta hermana fija mostrando el otro período: **Bono Target** (CO), **Bono CP Target** y **Asignación Familiar** (PE).

**No togglea** (se queda igual sin importar `varPeriod`):
- Los campos editables (Sueldo Mensual/Base, Vales, Comisiones, N° Sueldos) — su valor crudo es el que se guarda en `PeopleAnalytics.ColaboradoresCostos` por `NumeroID`; la vista `vw_Calculadora_Costos` solo alimenta la pantalla, así que mostrar un número anualizado ahí arriesgaría que alguien edite y guarde mal. Editables siempre en mensual.
- `multiplicadorBono`/"Cantidad de Sueldos Target" — es una cantidad, no dinero.
- Las dos tarjetas fijas de Bono de Ecuador (`ContainerParEC`, pendiente de construir) — decisión explícita: **Bono CP Target (Anual)** y **Bono CP Mensual** se quedan como dos tarjetas separadas y fijas, sin relación a `varPeriod`, igual que en el prototipo.
- `ContainerKpis` (Carga/Mes y %) — son tasas/porcentajes, período-neutros por naturaleza.

⚠️ **Divergencia abierta con el prototipo, no resuelta todavía**: el tile "Costo Anual" de `ContainerKpis` sigue fijo (no reactivo a `varPeriod`) en PowerApps, mientras que en el prototipo ese tile ya alterna Costo Mensual/Costo Anual. Aplicar el mismo patrón ahí queda pendiente de una próxima sesión — no está cubierto por esta sección.

⚠️ **Corrección de arquitectura (20/07)**: la primera versión de este doc asumía que el Desglose de Cargas estaba construido como una galería genérica (`colFilasDesglose` + `GaleriaDesglose`, con `ThisItem`) — **eso era incorrecto**. La UI real es una **tabla de filas fijas posicionales** (ver sección "Desglose de Cargas" más abajo, ya reescrita y confirmada fila por fila contra la app real el 20/07). No existe barra de "Proporción" construida — esa columna del header existe pero sin gráfico detrás todavía.

## Parámetros Salariales

Los campos vienen de `paises/<pais>/config.js` del prototipo (`camposEditables`/`camposReadonly`).

⚠️ **Corrección de arquitectura (20/07, confirmada por captura)**: la tabla de abajo (`ContainerPar` CO / `ContainerParPE` PE / `ContainerParEC` EC como contenedores separados) describe el diseño planeado, **no el real**. En la app real un colaborador PE se renderiza dentro de `ContainerPar` — las tarjetas son **compartidas 3-en-1 con `Switch(varDetalle.Pais; ...)`**, mismo patrón que el Desglose de Cargas. Estructura real confirmada de la tarjeta Sueldo:

```
Parametros
 ├── ParTitle                    (título "Parámetros Salariales")
 └── ContainerPar                (comparte los 3 países)
      └── CardSueldo
           ├── SueldoTitle       (título de la card)
           └── ViewEditSueldo    (la "caja" tipo input: valor + lápiz)
                ├── CantidadSueldo   (label con el monto, patrón MONTO)
                └── EditSueldo       (ícono lápiz — ya existía antes de conectar la edición)
```

La UI de edición inline (input + ✓ + ✗) se inserta **dentro de `ViewEditSueldo`** con nombres `TxtSueldo`/`OkSueldo`/`CancelSueldo` — ver la sección "Flow `UpdateCollaboratorCost`" para las fórmulas.

**Segunda tarjeta editable — confirmada por captura (21/07)**: `CardNSueldosValesComisiones`, mismo patrón 3-en-1 que Sueldo. Es N° Sueldos en CO, Vales en PE, Comisiones en EC:

```
CardNSueldosValesComisiones
 ├── Title                          (título dinámico por país)
 └── ViewEdit
      ├── InpuToEditNSValesComis    (input de edición)
      ├── CantidadEdit              (label de solo lectura — cantidad en CO, MONTO en PE/EC)
      ├── Edit                      (ícono lápiz)
      └── ContainerEditNSValesComis
           ├── OkEdit2
           └── CancelEdit2
```

Fórmulas completas de esta tarjeta en la sección "Flow `UpdateCollaboratorCost`" → "Mapeo Campo por tarjeta" más abajo. Quedan pendientes de confirmar las tarjetas readonly (Asignación Familiar PE, Bono Target/CP Target, Cantidad Sueldos Target).

| Contenedor | País | Cards | `Visible` |
|---|---|---|---|
| ~~`ContainerPar`~~ | ~~CO~~ | (histórico — ver corrección arriba) | |
| ~~`ContainerParPE`~~ | ~~PE~~ | (histórico) | |
| ~~`ContainerParEC`~~ | ~~EC~~ | (histórico) | |

(\* = editable, con lápiz · ⇄ = togglea de mensual a anual con `varPeriod`. En EC ningún card de Bono lleva ⇄ — decisión explícita, quedan fijos.)

### Fórmulas de los cards que togglean (⇄) — estructura real confirmada (21/07)

✅ **Confirmado por el usuario (fórmulas reales pegadas desde Studio, 21/07)** — no son 3 tarjetas, son **2 tarjetas compartidas** con un `Switch(país)` cada una (mismo patrón que el resto de la pantalla), y **el mapeo país→concepto no es 1 a 1**: la "Card A" muestra Bono en CO/EC pero *Asignación Familiar* en PE; la "Card B" solo existe para PE/EC (oculta en CO) y en cada uno muestra algo distinto. Título actual confirmado de cada una (todavía sin el toggle de período, es lo que había *antes* del fix):

```powerappsfl
// Card A — Título ANTES del fix (confirmado, estático)
Switch(varDetalle.Pais; "CO"; "BONO CP TARGET (ANUAL)"; "PE"; "ASIGNACIÓN FAMILIAR"; "BONO CP TARGET (ANUAL)")

// Card B — Título ANTES del fix (confirmado, estático) — Visible solo si País ≠ CO
Switch(varDetalle.Pais; "PE"; "BONO CP TARGET (ANUAL)"; "BONO CP MENSUAL")
```

**Card A — Título, con el toggle agregado** (CO y PE pasan a ser reactivos; EC se queda fijo — decisión ya tomada, EC nunca togglea sus tarjetas de Bono):
```powerappsfl
Switch(
    varDetalle.Pais;
    "CO"; "Bono CP Target (" & If(varPeriod = "mensual"; "Mensual"; "Anual") & ")";
    "PE"; "Asignación Familiar (" & If(varPeriod = "mensual"; "Mensual"; "Anual") & ")";
    "Bono CP Target (Anual)"   // EC — fijo, sin toggle
)
```
**Card A — Valor** (⚠️ ojo: CO usa `BonoCPTarget` nativo *anual* → mensual = ÷12; PE usa `AsignacionFamiliar` nativo *mensual* → anual = ×12, dirección **opuesta** a CO; EC no togglea, siempre el valor anual completo):
```powerappsfl
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    Switch(
        varDetalle.Pais;
        "CO"; If(varPeriod = "mensual"; varDetalle.BonoCPTarget / 12; varDetalle.BonoCPTarget);
        "PE"; If(varPeriod = "mensual"; varDetalle.AsignacionFamiliar; varDetalle.AsignacionFamiliar * 12);
        varDetalle.BonoCPTarget    // EC — fijo
    )
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

✅ **Resuelto (21/07)** — Card B **no** es "PE reactivo / EC fijo" como se pensó primero. Es **PE = Bono, EC = Costo**, ambas ramas reactivas a `varPeriod`, cada una con su propio par de campos mensual/anual (nunca división manual — mismo principio que el KPI "Costo": usar el campo ya calculado, no `/12`):

**Card B — Título**
```powerappsfl
Switch(
    varDetalle.Pais;
    "PE"; If(varPeriod = "mensual"; "Bono CP Mensual"; "Bono CP Target (Anual)");
    If(varPeriod = "mensual"; "Costo Mensual"; "Costo Anual")   // EC
)
```
**Card B — Valor** (PE usa el par `BonoCPMensual`/`BonoCPTarget`; EC usa el par `CostoTotalMensual`/`CostoAnualML`, igual que el KPI):
```powerappsfl
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    Switch(
        varDetalle.Pais;
        "PE"; If(varPeriod = "mensual"; varDetalle.BonoCPMensual; varDetalle.BonoCPTarget);
        If(varPeriod = "mensual"; varDetalle.CostoTotalMensual; varDetalle.CostoAnualML)   // EC
    )
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

**Por qué esto arma el 3-2-2 en Ecuador**: como Card B ya muestra "Costo" en Ecuador, el tile "Costo Anual/Mensual" de la fila de KPIs (`ContainerKpis`) queda duplicado ahí — se oculta **solo para EC** agregándole `Visible: varDetalle.Pais <> "EC"` (Colombia y Perú lo conservan igual que hoy, sin cambios). Con eso, la fila de KPIs de Ecuador baja de 3 a 2 tiles (Cargas Sociales/Mes + % Cargas) y la pantalla completa de Ecuador queda 3-2-2. Colombia y Perú no cambian su conteo de filas con este fix — la fila 2 vacía de Colombia (Card B oculta ahí, sin contenido de reemplazo) queda fuera de este ajuste puntual.

~~**Por qué NO se unifican estos contenedores en uno solo con título-por-Switch**~~ — este razonamiento quedó **obsoleto** (20/07): en la práctica el usuario sí unificó las tarjetas 3-en-1 con `Switch(país)` (igual que el Desglose), y funciona porque las diferencias por país se resuelven por `Visible` de tarjetas puntuales en vez de contenedores completos. Se conserva el párrafo tachado solo como histórico de la decisión original.

**`ContainerPar[X]`**: `Dirección: Horizontal`, `Ajuste de línea: Activado` (wrap — 3 por fila, el resto pasa a la siguiente fila sola), `Gap: 16`.

**Cada tarjeta `Par#`** (`Dirección: Vertical`, `Fill: RGBA(17,30,53,1)`, `BorderColor: RGBA(30,58,95,1)`, `RadiusAll: 12`, `Width: (ContainerPar#.Width - 32) / 3`):

```
Par#  (vertical)
 ├── RowTitulo#  (horizontal, Justificar: Espacio entre, Alinear: Centro)  ← solo en editables
 │     ├── LblTitulo#
 │     └── IconEdit#
 ├── LblValor#      ← solo lectura (siempre visible)
 └── (si editable) TxtEditValor#, IconConfirm#, IconCancel#
```

### Patrón de edición inline (replica `CampoEditable.jsx` del prototipo)

**No es un modal** — es edición in-place. Una sola variable de pantalla controla cuál campo está en edición (simplificación intencional respecto al prototipo, que da estado aislado a cada componente vía hooks de React: aquí **solo un campo editable a la vez** en toda la pantalla, cada tarjeta usa su propia clave de `locCampoEditando`).

✅ **Patrón confirmado dos veces (21/07)**, ya no es especulativo — ver estructura y fórmulas reales completas de cada una:
- Tarjeta Sueldo → sección "Parámetros Salariales" arriba (`ViewEditSueldo > CantidadSueldo/EditSueldo`) + fórmula de guardado en "Flow `UpdateCollaboratorCost`" más abajo.
- Tarjeta N° Sueldos/Vales/Comisiones → misma sección, `CardNSueldosValesComisiones` (`ViewEdit > CantidadEdit/Edit/InpuToEditNSValesComis` + `ContainerEditNSValesComis > OkEdit2/CancelEdit2`).

Regla general que ambas siguen, para replicarla en una 3ª tarjeta editable si hiciera falta: `Cantidad#.Visible`/`Edit#.Visible` = `locCampoEditando <> "<clave>"`; `Input#.Visible` + `Container_Ok/Cancel.Visible` = `locCampoEditando = "<clave>"`; `Edit#.OnSelect` = `UpdateContext({locCampoEditando: "<clave>"});; Reset(Input#)`; `Cancel#.OnSelect` = `UpdateContext({locCampoEditando: ""})`; `Ok#.OnSelect` = la fórmula completa de guardado (ver "Flow `UpdateCollaboratorCost`").

Simplificaciones deliberadas vs. el prototipo (no se migran, no aportaban valor en PowerApps táctil): confirmar con tecla Enter, cancelar con clic-afuera (`useClickOutside`), y el hover que revela el lápiz solo al pasar el mouse — el lápiz queda simplemente visible siempre que corresponda por rol/modo.

**Patrón MONTO** (repetido en toda la pantalla — valores editables, readonly, KPIs, desglose):
```powerappsfl
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(<CAMPO> / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1); "#,##0"; "en-US")
```

⚠️ **`"en-US"` como 3er argumento de `Text` es obligatorio, no cosmético (21/07, corregido)**: sin él, el separador de miles/decimal que se ve depende del idioma por defecto del entorno donde corre la app — puede variar entre Studio y la app publicada. El formato que pide el negocio para esta app es el de EE.UU. (**`,` separa los miles, `.` es el decimal** — ej. `2,000.00`), no el latinoamericano, aunque la app esté en español. `"en-US"` fija ese separador sin importar el entorno. Aplica a **todo** `Text(...)` que muestre un monto o una cantidad en pantalla — ver el checklist más abajo.

Nota: por ahora se mantiene `"#,##0"` (sin decimales) en los montos de dinero porque `SueldoMensual`/`Vales`/`ComisionesMensuales` son `DECIMAL(18,0)` en la base — no guardan centavos, así que un `.00` fijo no aportaría información. Si en algún momento sí quieren ver `.00` en pantalla, el cambio es `"#,##0.00"` en vez de `"#,##0"` (mismo 3er argumento `"en-US"`).

**Campo derivado sin columna propia — Cantidad Sueldos (Bono), Perú**: el prototipo lo deriva de una tabla de bandas por grado (`Parametros_MultiplicadorBono`, SQL) que no está cargada como colección en PowerApps. Se despeja del cociente, ya que `BonoCPTarget = SueldoMensual × multiplicador`:
```powerappsfl
Text(If(varDetalle.SueldoMensual > 0; varDetalle.BonoCPTarget / varDetalle.SueldoMensual; 0); "0.0"; "en-US")
```

## Desglose de Cargas — tabla de filas fijas posicionales (confirmado 20/07)

**No es una galería.** Es un contenedor `TableCargas` con **una fila por posición** (no por país) — cada fila tiene una etiqueta y un valor que reasignan el concepto correcto según `varDetalle.Pais` con un `Switch` propio. Perú tiene 5 conceptos reales y CO/EC tienen 6, así que la 6ª fila existe pero solo es `Visible` para CO/EC.

```
cntDesglose
 ├── DesgloseTitle        (título de la card)
 ├── DesglogeNames        (header de columnas)
 │     ├── Concepto
 │     ├── Proporcion      (columna reservada — sin barra construida todavía, no aplica el toggle)
 │     └── ValorMensual    ("Valor Mensual" / "Valor Anual")
 ├── TableCargas
 │     ├── Gratif          → fila 1
 │     ├── CTS             → fila 2
 │     ├── EsSalud         → fila 3
 │     ├── SeguroVidaLey   → fila 4
 │     ├── CostoVales      → fila 5
 │     └── (6ª fila, Visible solo si País ≠ PE) → fila 6
 └── (footer, fuera de TableCargas) → título + valor total
```

Cada fila tiene 2 controles: `LblX` (etiqueta del concepto — **no cambia con el período**, se deja tal cual) y `ValueX` (patrón MONTO). El período se agrega multiplicando el `Switch(varDetalle.Pais; ...)` interno de `ValueX` por `If(varPeriod = "mensual"; 1; 12)` — se confirmó fila por fila contra la app real, formulas completas abajo.

### Fila 1 — `Gratif` (Prima de Vacaciones / Gratificaciones / XIII)
```powerappsfl
// LblGratif.Text — sin cambios
Switch(varDetalle.Pais; "CO"; "Prima de Vacaciones"; "PE"; "Gratificaciones"; "XIII (Déc. Tercer Sueldo)")

// ValueGratif.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (Switch(varDetalle.Pais; "CO"; varDetalle.CO_PrimaVacacionesMensual; "PE"; varDetalle.PE_Gratificaciones; varDetalle.EC_XIIIMensual) * If(varPeriod = "mensual"; 1; 12))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

### Fila 2 — `CTS` (Prima de Navidad / CTS / SBU)
```powerappsfl
// LblCTS.Text — sin cambios
Switch(varDetalle.Pais; "CO"; "Prima de Navidad"; "PE"; "CTS"; "SBU")

// ValueCTS.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (Switch(varDetalle.Pais; "CO"; varDetalle.CO_PrimaNavidadMensual; "PE"; varDetalle.PE_CTS; varDetalle.EC_SBUMensual) * If(varPeriod = "mensual"; 1; 12))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

### Fila 3 — `EsSalud` (Prima de Servicios / EsSalud / Fondo de Reserva)
```powerappsfl
// LblEsSalud.Text — sin cambios
Switch(varDetalle.Pais; "CO"; "Prima de Servicios"; "PE"; "EsSalud"; "Fondo de Reserva")

// ValueEsSalud.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (Switch(varDetalle.Pais; "CO"; varDetalle.CO_PrimaServiciosMensual; "PE"; varDetalle.PE_EsSalud; varDetalle.EC_FondoMensual) * If(varPeriod = "mensual"; 1; 12))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

### Fila 4 — `SeguroVidaLey` (Cesantías / Seguro Vida Ley / Aporte Patronal)
```powerappsfl
// LblSeguroVidaLey.Text — sin cambios
Switch(varDetalle.Pais; "CO"; "Cesantías"; "PE"; "Seguro Vida Ley"; "Aporte Patronal")

// ValueSeguroVidaLey.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (Switch(varDetalle.Pais; "CO"; varDetalle.CO_CesantiasMensual; "PE"; varDetalle.PE_SeguroVidaLey; varDetalle.EC_AportePatronalMensual) * If(varPeriod = "mensual"; 1; 12))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

### Fila 5 — `CostoVales` (I. Cesantías / Costo de Vales / Vacaciones 15 días)
```powerappsfl
// LblCostoVales.Text — sin cambios
Switch(varDetalle.Pais; "CO"; "I. Cesantías"; "PE"; "Costo de Vales"; "Vacaciones (15 días)")

// ValueCostoVales.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (Switch(varDetalle.Pais; "CO"; varDetalle.CO_ICesantiasMensual; "PE"; varDetalle.PE_CostoDeVales; varDetalle.EC_VacacionesMensual) * If(varPeriod = "mensual"; 1; 12))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

### Fila 6 — solo `Visible` si País ≠ PE (Aportes y Obligaciones Primas / Seguro Vida y Salud)
```powerappsfl
// Lbl (fila 6).Text — sin rama "PE" porque nunca se ve en Perú
Switch(varDetalle.Pais; "CO"; "Aportes y Obligaciones Primas"; "EC"; "Seguro (Vida y Salud)")

// Value (fila 6).Text — la rama "PE" es un resto inerte (copiado de la fila 5), nunca se evalúa porque la fila está oculta en PE
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (Switch(varDetalle.Pais; "CO"; varDetalle.CO_AportesPrimasMensual; "PE"; varDetalle.PE_CostoDeVales; varDetalle.EC_SeguroMensual) * If(varPeriod = "mensual"; 1; 12))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

### Header de columna y footer
```powerappsfl
// ValorMensual.Text (header, dentro de DesglogeNames)
If(varPeriod = "mensual"; "Valor Mensual"; "Valor Anual")

// Título del footer — mismo Switch(país) de siempre, ahora con el If de período
Switch(
    varDetalle.Pais;
    "CO"; If(varPeriod = "mensual"; "Total Carga Prestacional Mensual"; "Total Carga Prestacional Anual");
    "PE"; If(varPeriod = "mensual"; "Total Cargas Sociales Mensual"; "Total Cargas Sociales Anual");
    If(varPeriod = "mensual"; "Total Cargas Mensuales"; "Total Cargas Anuales")
)

// Valor del footer
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (varDetalle.Carga * If(varPeriod = "mensual"; 1; 12))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)
```

**`DesgloseTitle`** (título de la card, arriba del todo) — no se pegó su fórmula exacta en esta sesión, pero el render visual (captura 20/07) mostró literalmente "Desglose de Cargas Sociales Mensual" para un colaborador PE, lo que confirma que sigue el mismo patrón que el footer:
```powerappsfl
Switch(
    varDetalle.Pais;
    "CO"; If(varPeriod = "mensual"; "Desglose Prestacional Mensual"; "Desglose Prestacional Anual");
    "PE"; If(varPeriod = "mensual"; "Desglose de Cargas Sociales Mensual"; "Desglose de Cargas Sociales Anual");
    If(varPeriod = "mensual"; "Cargas Laborales Mensuales"; "Cargas Laborales Anuales")
)
```
Si tu fórmula actual de `DesgloseTitle` es distinta a la de arriba, mándala y la ajusto.

(Histórico: 16/07 se había corregido el título de EC a "Cargas Laborales Mensuales"/"Total Cargas Mensuales"; 20/07 se corrigió toda esta sección de raíz — no es galería, es tabla de filas fijas — y se agregó el toggle de período confirmado fila por fila.)

## KPI Row — Costo Anual / Carga por Mes / % Carga (genérico, sin gate por país)

A diferencia de Parámetros Salariales, estas 3 tarjetas **sí son perfectamente análogas en los 3 países** (mismos campos `CostoAnualML`/`Carga`/`PctCarga`, solo cambia el texto del título vía `textos.kpiCarga`/`textos.kpiPct` de cada `config.js`). Van en su propio contenedor `ContainerKpis`.

⚠️ **Excepción agregada (21/07) al tile 1 ("Costo")**: deja de ser "sin `Visible` por país" — ahora lleva `Visible: varDetalle.Pais <> "EC"`, porque en Ecuador el mismo dato ya se muestra en la Card B de Parámetros Salariales (ver sección "Fórmulas de los cards que togglean" más arriba) y mostrarlo dos veces rompía la simetría de la grilla (3-2-3 en vez de 3-2-2). Los tiles 2 y 3 (Carga/Mes, % Carga) siguen sin `Visible` por país, sin cambios.

⚠️ **Corregido (21/07)**: el tile 1 estaba fijo en "Costo Anual" sin togglear con `varPeriod` — bug real confirmado por el usuario con capturas de los 3 países. El fix **no es dividir `CostoAnualML` entre 12** — verificado contra `KpiRow.jsx` + `calculos.js` del prototipo: Perú calcula `costoAnualML = Math.trunc((bonoCPMensual + costoTotalMensualFloat) * 12)`, así que `CostoAnualML / 12` da un número ligeramente distinto (por el `Math.trunc`) al que realmente se guarda como "mensual". El prototipo usa un campo **ya calculado aparte** para el mensual (`r.total`, que en SQL es la columna `CostoTotalMensual` — la misma que ya viaja en el `delta` del flow de guardado). Regla: swap de campo completo según período, no aritmética:

```powerappsfl
// Visible del tile 1 completo (la tarjeta/contenedor que agrupa LblKpi1+ValueKpi1)
varDetalle.Pais <> "EC"
// LblKpi1.Text
If(varPeriod = "mensual"; "Costo Mensual"; "Costo Anual")
// ValueKpi1.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(
    (If(varPeriod = "mensual"; varDetalle.CostoTotalMensual; varDetalle.CostoAnualML))
    / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
    "#,##0";
    "en-US"
)

// LblKpi2.Text
Switch(varDetalle.Pais; "CO"; "Carga Prestacional/Mes"; "PE"; "Cargas Sociales/Mes"; "Cargas Laborales/Mes")
// ValueKpi2.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(varDetalle.Carga / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1); "#,##0"; "en-US")

// LblKpi3.Text
Switch(varDetalle.Pais; "CO"; "% Carga vs. Salario"; "PE"; "% Cargas vs. Sueldo Base"; "% Cargas vs. Sueldo Mensual")
// ValueKpi3.Text
Text(varDetalle.PctCarga; "0.0"; "en-US") & "%"   // verificar escala del crudo (¿0.0921 o 9.21?) antes de dar por bueno
```

Origen del error que corrige esto: estas 3 tarjetas se habían construido inicialmente *dentro* de `ContainerParPE` (mezcladas con los Parámetros Salariales de verdad), duplicando por accidente los valores de otras tarjetas. Se separaron a `ContainerKpis` el 16/07/2026.

---

## Flow `UpdateCollaboratorCost` — guardado real con recálculo (✅ implementado y confirmado 21/07)

✅ **Confirmado funcionando end-to-end (21/07)**: las 2 tarjetas editables de Parámetros Salariales — Sueldo Mensual/Básico y N° Sueldos(CO)/Vales(PE)/Comisiones(EC) — guardan, recalculan y refrescan toda la pantalla al instante en la app real, para los 3 países. Circuito probado: lápiz → input → ✓ → `UpdateCollaboratorCost.Run(...)` → SP actualiza + recalcula → flow devuelve JSON → `ParseJSON` + `Patch(varDetalle)`/`Patch(colDatosBase)` → KPIs, Parámetros y Desglose se actualizan sin recargar pantalla.

⚠️ **Corrección de arquitectura (20/07, histórico)**: la primera versión de esta sección asumía que PowerApps podía releer la vista con un `LookUp('[PeopleAnalytics].[vw_Calculadora_Costos]'; ...)` directo — **error real en Studio**: *"El nombre no es válido. No se reconoce..."*. La app **no tiene conexión SQL directa y no debe tenerla** (`docs/seguridad-powerapps.md`, Paso 4-5: la conexión SQL vive solo dentro del flow, con el usuario de servicio `primax_app_readonly`; *"la app llama al flujo; el usuario final nunca tiene acceso directo"*). El fix: el mismo flow que guarda **también devuelve los datos recalculados en su respuesta**, como JSON — igual patrón que ya usa `ObtenerColaborador` en esta misma app (`_dataUsuario.colaborador` → `ParseJSON(...)`) y que el flow `GetReport` de otra app del usuario (Compose antes de Responder). También se corrigió el nombre real del flow (`UpdateCollaboratorCost`, no `ActualizarYRecalcular`) y de la salida (`.result`, no `.resultado`) contra lo que el usuario ya tenía construido en Studio.

Circuito completo del ✓ de edición inline: **1 llamada al flow, cero llamadas SQL adicionales desde la app, cero recargas de pantalla**.

```
IconConfirm (✓) → UpdateCollaboratorCost.Run(NumeroID; Campo; Valor)
                    └→ SQL: sp_ActualizarCampoColaborador
                         ├─ whitelist del campo (solo los 4 editables)
                         ├─ UPDATE ColaboradoresCostos (solo ese campo, solo ese NumeroID)
                         ├─ EXEC sp_CalcularCostos @NumeroID  (recalcula TODO lo derivado)
                         ├─ misma transacción: o pasa todo o no pasa nada
                         └─ SELECT final (fila recalculada de vw_Calculadora_Costos)
                  ← flow: Compose empaqueta esa fila en JSON → Respond la devuelve como texto
PowerApps: ParseJSON(resultado) → Patch(colDatosBase) + Patch(varDetalle) + varTC
           → KPIs, Parámetros, Desglose y tabla Colaboradores se actualizan al instante
           → varRefrescarGerencias := true → Menu.OnVisible reconstruye colFilasGerencias
```

**SQL**: `sql/13_sp_ActualizarCampoColaborador.sql` (whitelist: `SueldoMensual`, `NSueldos`, `Vales`, `ComisionesMensuales` — extensible). Ahora termina con un `SELECT` de 30 columnas (fila única, `WHERE NumeroID = @NumeroID`) que es lo que el flow mapea a JSON — **vuelve a ejecutar este script completo en SSMS** si ya habías corrido la versión anterior.

**Flow** (Power Automate — interfaz real del usuario está en **inglés**, no en español; nombres reales de las 4 acciones): `When Power Apps calls a flow (V2)` → `Execute stored procedure (V2)` → `Compose` → `Respond to a Power App or flow`. Los 3 inputs del trigger se llaman `NumeroID`, `Field`, `Value` (el usuario los nombró en inglés; da igual, `.Run()` los pasa posicionalmente, no por nombre).

1. **`When Power Apps calls a flow (V2)`** — ya construido.
2. **`Execute stored procedure (V2)`** → `[PeopleAnalytics].[sp_ActualizarCampoColaborador]` — ya construido; ahora expone además un result set (`ResultSets.Table1`, 1 fila) gracias al `SELECT` agregado al SP.
3. **`Compose`** — ⚠️ **corregido (20/07): sin "Apply to each"**, no hace falta. El primer intento falló porque el conector no ofrece las columnas del SP como contenido dinámico individual sin antes correr el flow una vez (por eso no salió el loop) — la solución es traer **la fila completa de un solo golpe** con una expresión, en vez de mapear columna por columna:
   - Borra lo que haya en **Inputs** (ahí quedó apuntando al `Value` del trigger por error — mismo ícono morado que `NumeroID`/`Field`, fácil de confundir).
   - Clic en el rayo (contenido dinámico) → arriba del panel hay dos pestañas: **Dynamic content** y **Expression** → ve a **Expression**.
   - Escribe: `first(` — luego, sin cerrar el paréntesis, busca **"Body"** bajo el paso `Execute stored procedure (V2)` en la lista de abajo y haz clic para insertarlo (así el nombre interno del paso queda exacto, sin que lo escribas a mano). Termina de escribir el resto a mano hasta que quede:
   ```
   first(body('Execute_stored_procedure_(V2)')?['ResultSets']?['Table1'])
   ```
   (el nombre entre comillas puede variar un poco según cómo Power Automate lo generó al insertar "Body" — no lo cambies, usa el que quedó insertado).
   - Clic en **Add** / **Update**.
4. **`Respond to a Power App or flow`** (ya construido, hoy con `result` = `"OK"` fijo — captura 3) — cambia el valor de `result`: bórralo y en su lugar inserta la salida del `Compose` (clic en el campo → contenido dinámico → "Outputs" del paso Compose). Si el paso 2 (el SP) lanza error, el flow entero falla antes de llegar aquí → la app lo detecta con `IfError`.

**Por qué esto reemplaza el diseño anterior (30 campos + loop)**: `first(...)` ya trae el objeto completo de la única fila que devuelve el SP — sus claves son exactamente los nombres de columna del `SELECT` (`SueldoMensual`, `CostoAnualML`, etc.), que son los mismos que ya usa la fórmula `ParseJSON(...).nuevo.<Campo>` del lado de PowerApps más abajo. **No cambia nada de la fórmula de PowerApps** — solo cambia cómo se arma el JSON adentro del flow.

**Mapeo Campo por tarjeta** (2° argumento del `Run`):

| Tarjeta editable | Campo (string) |
|---|---|
| Sueldo Mensual / Sueldo Básico Mensual (CO/PE/EC) | `"SueldoMensual"` |
| N° Sueldos (CO) / Vales (PE) / Comisiones Mensuales (EC) | `Switch(varDetalle.Pais; "CO"; "NSueldos"; "PE"; "Vales"; "ComisionesMensuales")` |

**Tarjeta 2 — confirmada (21/07)**: `CardNSueldosValesComisiones`, compartida 3-en-1 como Sueldo (ver estructura arriba en "Parámetros Salariales"). Diferencia clave respecto a Sueldo: `CantidadEdit.Text` **no** usa el patrón MONTO para CO (N° Sueldos es una cantidad, `Text(varDetalle.NSueldos; "0.0"; "en-US")`), solo PE/EC lo usan (dinero).

```powerappsfl
// Title.Text
Switch(varDetalle.Pais; "CO"; "N° Sueldos"; "PE"; "Vales"; "Comisiones")

// CantidadEdit.Text
If(
    varDetalle.Pais = "CO";
    Text(varDetalle.NSueldos; "0.0"; "en-US");
    Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
    Text(
        (If(varDetalle.Pais = "PE"; varDetalle.Vales; varDetalle.ComisionesMensuales))
        / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1);
        "#,##0";
        "en-US"
    )
)

// CantidadEdit.Visible / Edit.Visible (base) / ContainerEditNSValesComis.Visible / InpuToEditNSValesComis.Visible
// mismo patrón que Sueldo, clave "NSValesComis" en vez de la de Sueldo:
locCampoEditando <> "NSValesComis"   // CantidadEdit.Visible, Edit.Visible (+ && varTipoDetalle = "individual" && varRolCostos = "Administrador")
locCampoEditando = "NSValesComis"    // InpuToEditNSValesComis.Visible, ContainerEditNSValesComis.Visible

// InpuToEditNSValesComis.Default
Text(Switch(varDetalle.Pais; "CO"; varDetalle.NSueldos; "PE"; varDetalle.Vales; varDetalle.ComisionesMensuales))

// Edit.OnSelect
UpdateContext({locCampoEditando: "NSValesComis"});;
Reset(InpuToEditNSValesComis)

// CancelEdit2.OnSelect
UpdateContext({locCampoEditando: ""})
```

`OkEdit2.OnSelect` es **idéntico** al `OKEdit.OnSelect` de abajo (mismo `delta` de 30 columnas, mismo flujo `With`/`ParseJSON`/`Patch`), con estos 3 reemplazos:
- `InpuToEditSueldo` → `InpuToEditNSValesComis` (en las 3 apariciones: validación, comparación no-op, y el valor pasado al `Run`)
- comparación no-op: `varDetalle.SueldoMensual` → `Switch(varDetalle.Pais; "CO"; varDetalle.NSueldos; "PE"; varDetalle.Vales; varDetalle.ComisionesMensuales)`
- 2° argumento del `Run`: `"SueldoMensual"` → `Switch(varDetalle.Pais; "CO"; "NSueldos"; "PE"; "Vales"; "ComisionesMensuales")`

**Ícono ✓.OnSelect — fórmula completa** (la de la tarjeta Sueldo; para las demás solo cambia el 2° argumento del `Run` según la tabla de arriba, y el input). Usa `ParseJSON` sobre la respuesta del flow — **no** vuelve a tocar SQL:

```powerappsfl
If(
    IsBlank(InpuToEditSueldo.Text) || !IsNumeric(InpuToEditSueldo.Text) || Value(InpuToEditSueldo.Text) < 0;
    Notify("Ingresa un valor numérico válido"; NotificationType.Error);

    // Sin cambios reales → no vale la pena llamar al flow (20/07)
    Value(InpuToEditSueldo.Text) = varDetalle.SueldoMensual;
    UpdateContext({locCampoEditando: ""});;
    Notify("No hay cambios que guardar"; NotificationType.Information);

    // Valor distinto → recién aquí se llama al flow
    UpdateContext({locGuardando: true});;
    With(
        {respuesta: IfError(UpdateCollaboratorCost.Run(varDetalle.NumeroID; "SueldoMensual"; Value(InpuToEditSueldo.Text)).result; "")};
        If(
            IsBlank(respuesta);
            Notify("No se pudo guardar el cambio. Revisa la conexión e intenta de nuevo."; NotificationType.Error);

            With(
                {nuevo: ParseJSON(respuesta)};
                With(
                    {delta: {
                        SueldoMensual: Value(nuevo.SueldoMensual);
                        NSueldos: Value(nuevo.NSueldos);
                        Vales: Value(nuevo.Vales);
                        ComisionesMensuales: Value(nuevo.ComisionesMensuales);
                        BonoCPTarget: Value(nuevo.BonoCPTarget);
                        BonoCPMensual: Value(nuevo.BonoCPMensual);
                        CostoTotalMensual: Value(nuevo.CostoTotalMensual);
                        CostoAnualML: Value(nuevo.CostoAnualML);
                        CostoAnualUSD: Value(nuevo.CostoAnualUSD);
                        Carga: Value(nuevo.Carga);
                        PctCarga: Value(nuevo.PctCarga);
                        CO_PrimaVacacionesMensual: Value(nuevo.CO_PrimaVacacionesMensual);
                        CO_PrimaNavidadMensual: Value(nuevo.CO_PrimaNavidadMensual);
                        CO_PrimaServiciosMensual: Value(nuevo.CO_PrimaServiciosMensual);
                        CO_CesantiasMensual: Value(nuevo.CO_CesantiasMensual);
                        CO_ICesantiasMensual: Value(nuevo.CO_ICesantiasMensual);
                        CO_AportesPrimasMensual: Value(nuevo.CO_AportesPrimasMensual);
                        CO_MedicinaMensual: Value(nuevo.CO_MedicinaMensual);
                        CO_BonoMensual: Value(nuevo.CO_BonoMensual);
                        PE_IngresosTotales: Value(nuevo.PE_IngresosTotales);
                        PE_Gratificaciones: Value(nuevo.PE_Gratificaciones);
                        PE_CTS: Value(nuevo.PE_CTS);
                        PE_EsSalud: Value(nuevo.PE_EsSalud);
                        PE_SeguroVidaLey: Value(nuevo.PE_SeguroVidaLey);
                        PE_CostoDeVales: Value(nuevo.PE_CostoDeVales);
                        EC_XIIIMensual: Value(nuevo.EC_XIIIMensual);
                        EC_SBUMensual: Value(nuevo.EC_SBUMensual);
                        EC_FondoMensual: Value(nuevo.EC_FondoMensual);
                        EC_AportePatronalMensual: Value(nuevo.EC_AportePatronalMensual);
                        EC_VacacionesMensual: Value(nuevo.EC_VacacionesMensual);
                        EC_SeguroMensual: Value(nuevo.EC_SeguroMensual)
                    }};
                    Patch(colDatosBase; LookUp(colDatosBase; NumeroID = varDetalle.NumeroID); delta);;
                    Set(varDetalle; Patch(varDetalle; delta));;
                    Set(varTC; If(varDetalle.CostoAnualUSD > 0; varDetalle.CostoAnualML / varDetalle.CostoAnualUSD; 1));;
                    Set(varRefrescarGerencias; true);;
                    UpdateContext({locCampoEditando: ""});;
                    Notify("Colaborador actualizado y costos recalculados"; NotificationType.Success)
                )
            )
        )
    );;
    UpdateContext({locGuardando: false})
)
```

**Por qué `delta` solo trae esos campos**: son exactamente los campos numéricos que `colDatosBase` ya tiene (los mismos que suma el consolidado en `OnVisible`) — patchar columnas que la colección no conoce rompe el esquema en el motor moderno. Los campos de texto no se tocan (ya venían con `Trim()` y una edición numérica no los cambia). **`Value(...)`** es obligatorio sobre cada campo: `ParseJSON` devuelve tipo Dinámico, no Número, así que sin la conversión los cálculos posteriores (`varDetalle.CostoAnualUSD > 0`, sumas en tablas) fallarían.

**Piezas de soporte**:
```powerappsfl
// DetalleCosto.OnVisible — la primera línea pasa a inicializar ambas variables de contexto
UpdateContext({locCampoEditando: ""; locGuardando: false});;

// IconConfirm#.DisplayMode e IconCancel#.DisplayMode — evita doble clic mientras guarda
If(locGuardando; DisplayMode.Disabled; DisplayMode.Edit)

// App.OnStart (sección 2, variables de estado) — inicialización tipada (gotcha #2)
Set(varRefrescarGerencias; false);;

// Menu.OnVisible — reconstruye la tabla de Gerencias solo si hubo una edición
// (btnConstruirGerencias ya existe en Menu; Select solo funciona en la misma pantalla,
//  por eso el flag en vez de llamarlo directo desde DetalleCosto)
If(
    varRefrescarGerencias;
    Select(btnConstruirGerencias);;
    Set(varRefrescarGerencias; false)
)
```

**Seguridad**: el lápiz solo es visible para `varRolCostos = "Administrador"` (gate de UI) y el SP whitelistea los 4 campos (gate de datos). Endurecer con validación de rol dentro del flow queda como mejora futura — ver `docs/seguridad-powerapps.md`.

## Gotchas del motor moderno de Power Fx (acumulados en esta pantalla)

1. **Variable de contexto declarada tarde en el script** puede disparar "tipos incompatibles" aunque el tipo sea consistente en todo el resto de la app — declárala de primero.
2. **`Set(var; Blank())` no define tipo** — inicializar siempre con un valor tipado (`""`, `0`).
3. **Auto-layout con `Height` calculado desde los hijos**: no se puede leer `Container.Height` desde dentro de un hijo del propio `Container` para centrar otra cosa — referencia circular. Usar las propiedades nativas de alineación (`Alinear elementos`/`Justificar contenido`) en vez de fórmulas de posición manual.
4. **El control HTML no dispara `OnSelect`** — cualquier toggle visual hecho en HTML necesita botones nativos transparentes superpuestos para la interactividad.

## Pendientes

- **Bug de scroll — botones Moneda/Período se desalinean del HTML al scrollear.** En investigación (ver conversación 16/07): los botones transparentes (`LeftMensual`, `RightAnual`, `LeftMoneyLocal`, `RightUSD`) están como hijos directos de la pantalla `DetalleCosto`, **fuera** del contenedor que scrollea (`MainDetalle`) — por eso al hacer scroll el HTML visual se mueve con el contenido pero los botones se quedan fijos en su posición original de pantalla. Fix: reparentar los 4 botones **dentro** del mismo contenedor inmediato que envuelve cada control HTML (`TipoMoneda` para `LeftMoneyLocal`/`RightUSD`, `Container8` para `LeftMensual`/`RightAnual`), y usar coordenadas relativas al nuevo padre (`Parent.Width`/`Parent.Height`) en vez de píxeles de pantalla — así quedan pegados al HTML sin importar cuánto se haya scrolleado.
- **Composición Mensual (dona)**: `colSlices` ya está armada en `OnVisible`; falta la UI (control Imagen con SVG por fórmula + galería leyenda) — patrón ya usado en el círculo del login.
- **`ContainerParEC`**: las 3 cards de Ecuador (Sueldo Mensual*, Comisiones*, Seguro / Bono CP Target) sin construir todavía.
- **Formato numérico EE.UU. (`,` miles / `.` decimal) — falta aplicar a 5 controles sin nombre confirmado (21/07)**: la regla (agregar `"en-US"` como 3er argumento de `Text(...)`, ver sección "Parámetros Salariales" → Patrón MONTO) ya está aplicada y confirmada en `CantidadSueldo`, `CantidadEdit` y las 5 filas del Desglose (`ValueGratif/CTS/EsSalud/SeguroVidaLey/CostoVales`). Falta aplicarla en: el `Value` de la 6ª fila del Desglose, el valor del footer del Desglose, y los 3 valores de `ContainerKpis` (Costo Anual/Carga por Mes/% Carga) — estos 5 nunca se confirmaron con nombre real de control, hace falta pasar los nombres reales (o una captura del árbol) para dejar las fórmulas exactas.
- **`ContainerKpis` período-reactivo**: el tile "Costo Anual" sigue fijo aunque Parámetros Salariales y Desglose de Cargas ya togglean con `varPeriod` (20/07, ver sección dedicada) — falta aplicar el mismo patrón (Costo Mensual ⇄ Costo Anual) al tile 1, igual que ya hace el prototipo (`KpiRow.jsx`).
- **KPI Row** (Costo Anual / Costo Mensual / Cargas Sociales/Mes / % Cargas vs Sueldo Base): ya hay 3 tarjetas construidas para Perú pero conceptualmente son resultados (KPIs), no Parámetros Salariales — evaluar separarlas a su propio contenedor `ContainerKpis` para no mezclarlas con las tarjetas editables.
- **Tarjetas readonly período-reactivas** (Bono Target CO, Bono CP Target PE, Asignación Familiar PE — ver sección "Período reactivo" y plan `soft-twirling-anchor`): fórmulas propuestas pero nunca confirmadas contra la app real; falta captura de árbol + fórmula actual antes de tocarlas.
- **Rol/permiso en los íconos de edición**: confirmar que `Edit`/`EditSueldo`.`Visible` de ambas tarjetas realmente incluye `&& varRolCostos = "Administrador"` (el patrón genérico lo pedía, no se verificó explícitamente contra Studio en ninguna de las 2 tarjetas ya construidas).
- Vista consolidada (gerencial/área) — construida en el modelo de datos (`varDetalle` ya soporta ambos modos) pero sin probar visualmente todavía con un colaborador real de cada modo.
