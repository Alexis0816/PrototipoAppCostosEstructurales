# Vista de Detalle — Costeo del Colaborador / Análisis Consolidado

**App:** Estructura de Costos (Costos Estructurales) · Primax
**Pantalla:** `DetalleCosto`
**Referencia de diseño:** prototipo React (`prototipo/src/components/detail/*.jsx`)
**Estado:** 🔧 En construcción — Identidad ✅ · Parámetros Salariales (CO y PE) ✅ · Desglose de Cargas ✅ · Composición (dona) pendiente · Flow de guardado pendiente
**Última actualización:** 2026-07-16

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
Set(varPeriodo; 1);;
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

## Selectores Moneda / Período

El toggle visual es un control **HTML** (`Money`, `Period`, dentro de `MoneyPeriod > TipoMoneda` / `Container8`) — ver razones y limitaciones en `docs/seguridad-powerapps.md`/histórico de esta sesión (control HTML no dispara `OnSelect`). La interactividad la dan **botones nativos transparentes superpuestos** (`LeftMoneyLocal`/`RightUSD` para Moneda, `LeftMensual`/`RightAnual` para Período):

```powerappsfl
// LeftMoneyLocal.OnSelect
Set(varMoneda; varDetalle.Moneda)
// RightUSD.OnSelect
Set(varMoneda; "USD")
// LeftMensual.OnSelect
Set(varPeriodo; 1)
// RightAnual.OnSelect
Set(varPeriodo; 12)
```

`MoneyPeriod.Visible` (el toggle Moneda específicamente): `varDetalle.Moneda <> "USD"` (Ecuador no lo muestra, su moneda nativa ya es USD).

⚠️ **Bug conocido, en investigación (16/07)**: los 4 botones transparentes se desalinean del HTML al hacer scroll vertical — ver sección "Pendientes".

## Parámetros Salariales

Los campos vienen de `paises/<pais>/config.js` del prototipo (`camposEditables`/`camposReadonly`). **Un contenedor por país**, gateado por `varDetalle.Pais`, porque a diferencia del Desglose, aquí sí cambia la cantidad/nombre de los campos:

| Contenedor | País | Cards | `Visible` |
|---|---|---|---|
| `ContainerPar` | CO | 3: Sueldo Mensual*, N° Sueldos (Bono)*, Bono Target | `varDetalle.Pais = "CO"` |
| `ContainerParPE` | PE | 5: Sueldo Básico Mensual*, Vales*, Asignación Familiar, Cantidad Sueldos (Bono), Bono CP Target (Anual) | `varDetalle.Pais = "PE"` |
| `ContainerParEC` | EC | pendiente — **6 cards** confirmadas en config.js: Sueldo Mensual*, Comisiones Mensuales*, N° Sueldos (Bono), Bono CP Target (Anual), Bono CP Mensual, Seguro Salud y Vida (Anual) | `varDetalle.Pais = "EC"` |

(\* = editable, con lápiz)

**Por qué NO se unifican estos contenedores en uno solo con título-por-Switch** (a diferencia del Desglose de Cargas, que sí se unificó): la *cantidad* de campos cambia por país (3 / 5 / 6), y el mismo concepto tiene distinta editabilidad según el país (ej. el multiplicador del bono es un input editable en CO — `NSueldos` — pero un valor derivado de solo lectura en PE/EC). Forzar esto a posiciones fijas requeriría tanto `Visible` condicional por celda que terminaría siendo más complejo que mantener un contenedor por país. Mantener `ContainerPar`/`ContainerParPE`/`ContainerParEC` separados, gateados por `varDetalle.Pais`, es la solución correcta aquí — no un caso pendiente de "generalizar".

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

**No es un modal** — es edición in-place. Una sola variable de pantalla controla cuál campo está en edición (simplificación intencional respecto al prototipo, que da estado aislado a cada componente vía hooks de React: aquí **solo un campo editable a la vez** en toda la pantalla):

```powerappsfl
// LblValor#.Visible
locCampoEditando <> "<NombreCampo>"

// TxtEditValor#.Default — valor crudo, sin formato de moneda
Text(varDetalle.<Campo>)
// TxtEditValor#.Visible
locCampoEditando = "<NombreCampo>"

// IconEdit#.Visible
locCampoEditando <> "<NombreCampo>" && varTipoDetalle = "individual" && varRolCostos = "Administrador"
// IconEdit#.OnSelect
UpdateContext({locCampoEditando: "<NombreCampo>"});;
Reset(TxtEditValor#)

// IconConfirm#.Visible / IconCancel#.Visible
locCampoEditando = "<NombreCampo>"
// IconConfirm#.OnSelect (placeholder — falta conectar el flow)
UpdateContext({locCampoEditando: ""});;
Notify("Guardado pendiente de conectar al flow"; NotificationType.Warning)
// IconCancel#.OnSelect
UpdateContext({locCampoEditando: ""})
```

Simplificaciones deliberadas vs. el prototipo (no se migran, no aportaban valor en PowerApps táctil): confirmar con tecla Enter, cancelar con clic-afuera (`useClickOutside`), y el hover que revela el lápiz solo al pasar el mouse — el lápiz queda simplemente visible siempre que corresponda por rol/modo.

**Patrón MONTO** (repetido en toda la pantalla — valores editables, readonly, KPIs, desglose):
```powerappsfl
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(<CAMPO> / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1); "#,##0")
```

**Campo derivado sin columna propia — Cantidad Sueldos (Bono), Perú**: el prototipo lo deriva de una tabla de bandas por grado (`Parametros_MultiplicadorBono`, SQL) que no está cargada como colección en PowerApps. Se despeja del cociente, ya que `BonoCPTarget = SueldoMensual × multiplicador`:
```powerappsfl
Text(If(varDetalle.SueldoMensual > 0; varDetalle.BonoCPTarget / varDetalle.SueldoMensual; 0); "0.0")
```

## Desglose de Cargas — genérico, un solo bloque para los 3 países

A diferencia de Parámetros Salariales, **este bloque NO se gatea por país** — `colFilasDesglose` ya normaliza los datos a la misma forma (`Concepto`, `Formula`, `Valor`, `Destacado`, `Informativo`), así que una sola card + una sola galería sirve para CO/PE/EC.

### `colFilasDesglose` (construida en `OnVisible`, ver arriba)

```powerappsfl
Switch(
    varDetalle.Pais;
    "CO";
    Table(
        {Concepto: "Prima de Vacaciones"; Formula: "Sueldo ÷ 12"; Valor: varDetalle.CO_PrimaVacacionesMensual; Destacado: false; Informativo: false};
        {Concepto: "Prima de Navidad"; Formula: "(Sueldo × 0.5) ÷ 12"; Valor: varDetalle.CO_PrimaNavidadMensual; Destacado: false; Informativo: false};
        {Concepto: "Prima de Servicios"; Formula: "(Sal.Anual + P.Vac + Nav + Bono) ÷ 12"; Valor: varDetalle.CO_PrimaServiciosMensual; Destacado: false; Informativo: false};
        {Concepto: "Cesantías"; Formula: "(Sal.Anual + P.Vac + Nav + Bono) ÷ 12"; Valor: varDetalle.CO_CesantiasMensual; Destacado: false; Informativo: false};
        {Concepto: "I. Cesantías"; Formula: "Cesantías × 12% ÷ 12"; Valor: varDetalle.CO_ICesantiasMensual; Destacado: false; Informativo: false};
        {Concepto: "Aportes y Obligaciones Primas"; Formula: "Base × 31.936% ÷ 12"; Valor: varDetalle.CO_AportesPrimasMensual; Destacado: true; Informativo: false}
    );
    "PE";
    Table(
        {Concepto: "Bono CP Mensual"; Formula: "(BonoCPTarget + CargaBono) ÷ 12"; Valor: varDetalle.BonoCPMensual; Destacado: false; Informativo: true};
        {Concepto: "Gratificaciones"; Formula: "Rem. Base × 18.17%"; Valor: varDetalle.PE_Gratificaciones; Destacado: false; Informativo: false};
        {Concepto: "CTS"; Formula: "Rem. Base × 9.72%"; Valor: varDetalle.PE_CTS; Destacado: false; Informativo: false};
        {Concepto: "EsSalud"; Formula: "Rem. Base × 9.00%"; Valor: varDetalle.PE_EsSalud; Destacado: false; Informativo: false};
        {Concepto: "Seguro Vida Ley"; Formula: "Rem. Base × 0.19%"; Valor: varDetalle.PE_SeguroVidaLey; Destacado: false; Informativo: false};
        {Concepto: "Costo de Vales"; Formula: "Vales × 1.00%"; Valor: varDetalle.PE_CostoDeVales; Destacado: true; Informativo: false}
    );
    Table(
        {Concepto: "XIII (Déc. Tercer Sueldo)"; Formula: "(BonoCPMens. + Sueldo) ÷ 12"; Valor: varDetalle.EC_XIIIMensual; Destacado: false; Informativo: false};
        {Concepto: "SBU"; Formula: "$482 ÷ 12"; Valor: varDetalle.EC_SBUMensual; Destacado: false; Informativo: false};
        {Concepto: "Fondo de Reserva"; Formula: "(BonoCPMens. + Sueldo) ÷ 12"; Valor: varDetalle.EC_FondoMensual; Destacado: false; Informativo: false};
        {Concepto: "Aporte Patronal"; Formula: "(BonoCPTarget + Sal.Anual) × 12.15% ÷ 12"; Valor: varDetalle.EC_AportePatronalMensual; Destacado: false; Informativo: false};
        {Concepto: "Vacaciones (15 días)"; Formula: "(BonoCPTarget + Sal.Anual) × 0.5 ÷ 12"; Valor: varDetalle.EC_VacacionesMensual; Destacado: false; Informativo: false};
        {Concepto: "Seguro (Vida y Salud)"; Formula: "Valor anual fijo ÷ 12"; Valor: varDetalle.EC_SeguroMensual; Destacado: true; Informativo: false}
    )
)
```

### Qué significa "Proporción" (la barra) — % del total (`varDetalle.Carga`)

```
proporción_de_la_fila = valor_de_la_fila / varDetalle.Carga
```

Cada barra representa qué porción del total (el mismo que se muestra en el footer, "Total Cargas Sociales Mensual"/equivalente) aporta esa fila — la lectura natural dado que el footer ya establece el 100%. Las filas `Informativo: true` (el Bono CP Mensual de Perú) dibujan barra en 0 y no suman al total.

> **Nota**: la primera versión de esta pantalla usó `valor / MAX(filas no informativas)` (relativo a la fila más grande, replicando el prototipo tal cual estaba) — se cambió a relativo-al-total el 16/07/2026 por ser la lectura más intuitiva dado que ya existe un total visible. Pendiente decidir si `DesglosePrestacional.jsx` del prototipo se actualiza igual para mantener ambos sincronizados.

### Construcción — `GaleriaDesglose` (`Items: colFilasDesglose`, `TemplateSize: 56`)

3 zonas de `TW/3` (`TW = Parent.TemplateWidth`):

```powerappsfl
// LblConcepto.Text / Color / Italic
ThisItem.Concepto
If(ThisItem.Informativo; RGBA(148,163,184,1); RGBA(226,232,240,1))
ThisItem.Informativo

// LblFormula.Text
ThisItem.Formula

// RecRelleno.Width — el corazón del concepto de "proporción" (% del total)
If(
    ThisItem.Informativo; 0;
    RecRiel.Width * ThisItem.Valor / varDetalle.Carga
)
// RecRelleno.Fill
If(ThisItem.Destacado; RGBA(251,191,36,1); RGBA(59,130,246,1))

// LblValorDesglose.Text — patrón MONTO sobre ThisItem.Valor
```

**Footer** (`ContainerTotalDesglose`, fuera de la galería): título/subtítulo por `Switch(varDetalle.Pais; ...)`, valor = patrón MONTO sobre `varDetalle.Carga` (ya excluye el Bono informativo, porque así lo sumó `sp_CalcularCostos` en SQL).

**Título/subtítulo de la card** (dinámicos, mismo `Switch(varDetalle.Pais; ...)`, textos exactos de `paises/<pais>/config.js` → `textos`): "Desglose Prestacional Mensual"/"Total Carga Prestacional Mensual" (CO) / "Desglose de Cargas Sociales Mensual"/"Total Cargas Sociales Mensual" (PE) / **"Cargas Laborales Mensuales"/"Total Cargas Mensuales"** (EC — corregido 16/07, la versión anterior de este doc tenía "Desglose de Provisiones"/"Total Provisiones Mensuales", que no coincide con el prototipo).

## KPI Row — Costo Anual / Carga por Mes / % Carga (genérico, sin gate por país)

A diferencia de Parámetros Salariales, estas 3 tarjetas **sí son perfectamente análogas en los 3 países** (mismos campos `CostoAnualML`/`Carga`/`PctCarga`, solo cambia el texto del título vía `textos.kpiCarga`/`textos.kpiPct` de cada `config.js`). Van en su propio contenedor `ContainerKpis`, **sin `Visible` por país** — mismo principio que el Desglose.

```powerappsfl
// LblKpi1.Text — no varía por país
"Costo Anual"
// ValueKpi1.Text
Switch(varMoneda; "USD"; "US$ "; "PEN"; "S/ "; "COP"; "$ "; "$ ") &
Text(varDetalle.CostoAnualML / If(varMoneda = "USD" && varDetalle.Moneda <> "USD"; varTC; 1); "#,##0")

// LblKpi2.Text
Switch(varDetalle.Pais; "CO"; "Carga Prestacional/Mes"; "PE"; "Cargas Sociales/Mes"; "Cargas Laborales/Mes")
// ValueKpi2.Text — mismo patrón MONTO con varDetalle.Carga

// LblKpi3.Text
Switch(varDetalle.Pais; "CO"; "% Carga vs. Salario"; "PE"; "% Cargas vs. Sueldo Base"; "% Cargas vs. Sueldo Mensual")
// ValueKpi3.Text
Text(varDetalle.PctCarga; "0.0") & "%"   // verificar escala del crudo (¿0.0921 o 9.21?) antes de dar por bueno
```

Origen del error que corrige esto: estas 3 tarjetas se habían construido inicialmente *dentro* de `ContainerParPE` (mezcladas con los Parámetros Salariales de verdad), duplicando por accidente los valores de otras tarjetas. Se separaron a `ContainerKpis` el 16/07/2026.

---

## Gotchas del motor moderno de Power Fx (acumulados en esta pantalla)

1. **Variable de contexto declarada tarde en el script** puede disparar "tipos incompatibles" aunque el tipo sea consistente en todo el resto de la app — declárala de primero.
2. **`Set(var; Blank())` no define tipo** — inicializar siempre con un valor tipado (`""`, `0`).
3. **Auto-layout con `Height` calculado desde los hijos**: no se puede leer `Container.Height` desde dentro de un hijo del propio `Container` para centrar otra cosa — referencia circular. Usar las propiedades nativas de alineación (`Alinear elementos`/`Justificar contenido`) en vez de fórmulas de posición manual.
4. **El control HTML no dispara `OnSelect`** — cualquier toggle visual hecho en HTML necesita botones nativos transparentes superpuestos para la interactividad.

## Pendientes

- **Bug de scroll — botones Moneda/Período se desalinean del HTML al scrollear.** En investigación (ver conversación 16/07): los botones transparentes (`LeftMensual`, `RightAnual`, `LeftMoneyLocal`, `RightUSD`) están como hijos directos de la pantalla `DetalleCosto`, **fuera** del contenedor que scrollea (`MainDetalle`) — por eso al hacer scroll el HTML visual se mueve con el contenido pero los botones se quedan fijos en su posición original de pantalla. Fix: reparentar los 4 botones **dentro** del mismo contenedor inmediato que envuelve cada control HTML (`TipoMoneda` para `LeftMoneyLocal`/`RightUSD`, `Container8` para `LeftMensual`/`RightAnual`), y usar coordenadas relativas al nuevo padre (`Parent.Width`/`Parent.Height`) en vez de píxeles de pantalla — así quedan pegados al HTML sin importar cuánto se haya scrolleado.
- **Composición Mensual (dona)**: `colSlices` ya está armada en `OnVisible`; falta la UI (control Imagen con SVG por fórmula + galería leyenda) — patrón ya usado en el círculo del login.
- **`ContainerParEC`**: las 3 cards de Ecuador (Sueldo Mensual*, Comisiones*, Seguro / Bono CP Target) sin construir todavía.
- **Flow `ActualizarYRecalcular`**: los botones ✓ de edición inline hoy solo cierran el modo edición y muestran un `Notify` de aviso — falta conectar el flow real (UPDATE → `sp_CalcularCostos @NumeroID` → refresh del registro en `colDatosBase` y `varDetalle`).
- **KPI Row** (Costo Anual / Costo Mensual / Cargas Sociales/Mes / % Cargas vs Sueldo Base): ya hay 3 tarjetas construidas para Perú pero conceptualmente son resultados (KPIs), no Parámetros Salariales — evaluar separarlas a su propio contenedor `ContainerKpis` para no mezclarlas con las tarjetas editables.
- Vista consolidada (gerencial/área) — construida en el modelo de datos (`varDetalle` ya soporta ambos modos) pero sin probar visualmente todavía con un colaborador real de cada modo.
