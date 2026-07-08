# Plan de Seguridad — App Costos Estructurales en PowerApps

## Contexto

La aplicación muestra información salarial confidencial (sueldos, grados, costos laborales) de colaboradores de Colombia, Perú y Ecuador. El desarrollo ocurre en la cuenta corporativa de la empresa, por lo que múltiples personas podrían tener acceso al entorno de Power Platform. Este documento define los controles necesarios para garantizar que **solo los usuarios autorizados puedan ver la información**.

---

## Arquitectura de seguridad

```
SQL Server (PeopleAnalytics)
    ↓ — conexión con usuario de servicio (sin contraseña expuesta)
Power Automate (flujos privados, no compartidos)
    ↓
PowerApps Canvas App (entorno Producción, acceso restringido)
    ↓
Solo usuarios del grupo AD: "PRIMAX_Costos_Autorizados"
```

---

## Paso 1 — Separar entornos: Desarrollo vs Producción

**Por qué:** En el entorno por defecto (Default), cualquier usuario con rol "Maker" puede abrir el lienzo en modo edición y ver las conexiones y datos.

**Acción:** Crear un entorno dedicado en Power Platform Admin Center.

1. Ingresar a [admin.powerplatform.microsoft.com](https://admin.powerplatform.microsoft.com)
2. Ir a **Entornos → Nuevo**
3. Nombre: `PRIMAX - Costos Estructurales (Producción)`
4. Tipo: **Producción**
5. Región: la misma que usa la empresa actualmente

| Entorno | Quién tiene acceso | Propósito |
|---------|-------------------|-----------|
| Default / Dev | Tú (desarrollador) | Construcción y pruebas |
| Producción | Solo usuarios autorizados | Versión final con datos reales |

---

## Paso 2 — Controlar roles dentro del entorno de Producción

**Por qué:** Los roles determinan quién puede editar vs solo ejecutar la app.

**Acción:** En el entorno de Producción, asignar roles mínimos:

| Rol Power Platform | Quién | Puede hacer |
|-------------------|-------|-------------|
| Environment Admin | Tú + IT | Gestionar el entorno, ver todo |
| Environment Maker | Nadie más | Crear/editar apps — NO asignar en Producción |
| Basic User | Usuarios autorizados | Solo ejecutar la app publicada |

> En Producción **nadie excepto tú y el equipo IT** debe tener rol Maker.  
> Esto impide que alguien abra el lienzo y vea la estructura de datos.

---

## Paso 3 — Compartir la app solo con el grupo de seguridad autorizado

**Por qué:** Aunque el entorno esté restringido, compartir la app define quién puede ejecutarla.

**Acción:**
1. Crear en Azure Active Directory un grupo de seguridad: `PRIMAX_Costos_Autorizados`
2. Agregar solo a las personas que deben ver la información (RRHH, Finanzas, la Gerencia correspondiente)
3. Al publicar la app en PowerApps: **Compartir → seleccionar ese grupo AD**
4. NO activar "Compartir con toda la organización"

**Resultado:** Un usuario que no esté en el grupo no verá la app ni en el portal de PowerApps ni en Teams.

---

## Paso 4 — Conexión SQL con usuario de servicio (no credenciales personales)

**Por qué:** Si la conexión SQL usa credenciales personales, al compartir la app esas credenciales se exponen. Con un usuario de servicio, los desarrolladores del lienzo ven que existe la conexión pero no pueden extraer la contraseña ni usarla fuera del flujo.

**Acción:** Crear en SQL Server un usuario de solo lectura para la app:

```sql
-- Ejecutar en SQL Server como admin
CREATE LOGIN primax_app_readonly WITH PASSWORD = 'ContraseñaFuerte!2026';
CREATE USER  primax_app_readonly FOR LOGIN primax_app_readonly;

-- Solo puede leer la vista consolidada, no las tablas base
GRANT SELECT ON PeopleAnalytics.vw_Calculadora_Costos TO primax_app_readonly;

-- NO tiene acceso a ColaboradoresCostos ni Resultados_Calculo directamente
```

En el conector de Power Automate → SQL Server:
- Autenticación: **SQL Server Authentication**
- Usuario: `primax_app_readonly`
- La contraseña la gestiona IT; los demás Makers no la conocen

---

## Paso 5 — Los flujos de Power Automate son privados (no compartidos)

**Por qué:** Un flujo compartido puede ser ejecutado o copiado por quien lo reciba.

**Acción:**
- Los flujos que consultan costos laborales se crean como **flujos de solución** dentro del entorno de Producción
- El propietario es la cuenta de servicio o tu cuenta corporativa
- **No usar "Ejecutar solo" ni compartir el flujo** con otros usuarios
- La app llama al flujo; el usuario final nunca tiene acceso directo al flujo

---

## Paso 6 (opcional avanzado) — Row-Level Security en SQL Server

**Por qué:** Defensa de fondo. Si alguien llegara a tener acceso a la conexión SQL, SQL Server filtraría automáticamente qué datos puede ver según su usuario.

**Cuándo aplicar:** Si en el futuro distintos gerentes de país deben ver solo sus propios colaboradores (CO ve solo CO, PE ve solo PE).

```sql
-- Función que filtra por país según el usuario de la app
CREATE FUNCTION PeopleAnalytics.fn_AccesoPorPais(@Pais AS VARCHAR(5))
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS resultado
WHERE @Pais = SESSION_CONTEXT(N'pais_usuario')
   OR IS_MEMBER('db_owner') = 1;
GO

-- Política aplicada a la vista
CREATE SECURITY POLICY FiltroPais
ADD FILTER PREDICATE PeopleAnalytics.fn_AccesoPorPais(Pais)
ON PeopleAnalytics.ColaboradoresCostos
WITH (STATE = ON);
GO
```

---

## Resumen de controles por riesgo (actualizado)

| Riesgo | Control | Paso |
|--------|---------|------|
| Otro Maker abre el lienzo en Dev y ve datos | Entorno separado Producción con rol Maker solo para ti | Paso 1 y 2 |
| Compañero ejecuta la app y ve sueldos sin autorización | App compartida solo con grupo AD `PRIMAX_Costos_Autorizados` | Paso 3 |
| Alguien extrae las credenciales SQL del conector | Usuario de servicio `primax_app_readonly` gestionado por IT | Paso 4 |
| Alguien copia el flujo de Automate y lo ejecuta | Flujos dentro de solución en entorno Producción, no compartidos | Paso 5 |
| Gerente de un país ve datos de otro país (defensa de fondo) | Row-Level Security en SQL Server | Paso 6 |
| Usuario autorizado edita sueldos sin permiso explícito | `varRolCostos` — solo Administrador (doble gate) ve botones de edición | Paso 7 |
| Usuario de otra gerencia ve sueldos de toda la empresa | `varRolCostos = "Usuario"` → galería filtrada a su propia gerencia | Paso 7 |
| Acceso desde fuera de la empresa | PowerApps requiere login Microsoft 365 corporativo (Azure AD) | Inherente |

---

## Paso 7 — Control de roles dentro de la app (In-App RBAC)

**Por qué:** Los pasos 1–6 controlan *quién entra*. Este paso controla *qué puede hacer cada usuario dentro de la app*. Es la capa aprobada por el equipo (conversación con Rodo Arturo Vilcarromero Moscoso, julio 2026): mostrar datos de costos con normalidad, controlar visibilidad y acciones por rol asignado en tiempo de sesión.

### Variables de sesión

| Variable | Tipo | Descripción |
|---|---|---|
| `varRolCostos` | Text | `"Administrador"` / `"Consultor"` / `"Usuario"` |
| `varGerenciaUsuario` | Text | Gerencia del usuario logueado (para filtro de `"Usuario"`) |
| `varNombreUsuario` | Text | Nombre para mostrar en el header |

### Código — `App.OnStart` (bloque de sesión, antes del caché)

```powerfx
// ── Sesión: obtener datos del usuario logueado vía Power Automate ──────────
Set(
    _dataUsuario;
    'APP(PA)CostosEstructurales::ObtenerColaborador'.Run(Upper(User().Email))
);;
ClearCollect(
    _colaborador;
    Table(ParseJSON(_dataUsuario.colaborador))
);;

// ── Asignación de rol (doble gate para Administrador) ─────────────────────
// Lógica: área Compensaciones + ID en whitelist → Administrador
//         área Compensaciones solo               → Consultor (lectura total)
//         cualquier otro                         → Usuario (solo su gerencia)
Set(
    varRolCostos;
    With(
        {
            unidad: Upper(Trim(Text(First(_colaborador).Value.Unidad_x0020_Organizativa)));
            nid:    Trim(Text(First(_colaborador).Value.Número_x0020_ID))
        };
        If(
            unidad in ["COMPENSACIONES"; "GERENCIA CORPORATIVO DE COMPENSACIONES"]
            && nid in ["44855632"; "72490756"; "73197243"];
            "Administrador";
            unidad in ["COMPENSACIONES"; "GERENCIA CORPORATIVO DE COMPENSACIONES"];
            "Consultor";
            "Usuario"
        )
    )
);;

// ── Datos de sesión para display y filtros ────────────────────────────────
Set(
    varGerenciaUsuario;
    Proper(Trim(Text(First(_colaborador).Value.Gerencia)))
);;
Set(
    varNombreUsuario;
    Trim(
        Proper(Text(First(_colaborador).Value.Nombre_x0020_de_x0020_pila)) & " " &
        Proper(Text(First(_colaborador).Value.Apellido))
    )
)
```

### Tabla de roles: qué puede ver y hacer cada uno

| Rol | Quiénes | Ver sueldos | Ver todos los países | Editar parámetros | Recalcular |
|---|---|---|---|---|---|
| `Administrador` | Equipo Compensaciones (ID whitelist) | ✅ Todos | ✅ CO / PE / EC | ✅ Sí | ✅ Sí |
| `Consultor` | Equipo Compensaciones sin whitelist | ✅ Todos | ✅ CO / PE / EC | ❌ No | ❌ No |
| `Usuario` | Resto de la organización | ✅ Solo su gerencia | Fijo al país de su gerencia | ❌ No | ❌ No |

### Aplicación del rol en la UI

**Galería / tabla de colaboradores — registros visibles:**
```powerfx
// Propiedad Items de la galería, encima del Filter de búsqueda:
Filter(
    colColaboradoresFiltrados;
    varRolCostos <> "Usuario" ||
    Trim(Gerencia) = varGerenciaUsuario
)
```

**Botón "Editar" / controles de modificación:**
```powerfx
// Propiedad Visible:
varRolCostos = "Administrador"
```

**Botón "Recalcular":**
```powerfx
// Propiedad Visible:
varRolCostos = "Administrador"
```

**Columna SueldoMensual (si se decide ocultar para Usuario):**
```powerfx
// Propiedad Visible del Label:
varRolCostos in ["Administrador"; "Consultor"]
```

### Por qué el doble gate (departamento + ID en lista)

Un solo check de Unidad Organizativa no es suficiente: cualquier colaborador que rote al área de Compensaciones (aunque sea temporalmente) obtendría acceso Administrador. La whitelist de IDs numéricos garantiza que solo las personas específicamente autorizadas lleguen a ese nivel. La capa de `"Consultor"` cubre el resto del equipo de Compensaciones con lectura total pero sin modificación.

---

## Resumen de controles por riesgo (actualizado)

| Riesgo | Control | Paso |
|--------|---------|------|
| Otro Maker abre el lienzo en Dev y ve datos | Entorno separado Producción con rol Maker solo para ti | Paso 1 y 2 |
| Compañero ejecuta la app y ve sueldos sin autorización | App compartida solo con grupo AD `PRIMAX_Costos_Autorizados` | Paso 3 |
| Alguien extrae las credenciales SQL del conector | Usuario de servicio `primax_app_readonly` gestionado por IT | Paso 4 |
| Alguien copia el flujo de Automate y lo ejecuta | Flujos dentro de solución en entorno Producción, no compartidos | Paso 5 |
| Gerente de un país ve datos de otro país (defensa de fondo) | Row-Level Security en SQL Server | Paso 6 |
| Usuario autorizado edita sueldos sin permiso explícito | `varRolCostos` — solo Administrador (doble gate) ve botones de edición | Paso 7 |
| Usuario de otra gerencia ve sueldos de toda la empresa | `varRolCostos = "Usuario"` → galería filtrada a su propia gerencia | Paso 7 |
| Acceso desde fuera de la empresa | PowerApps requiere login Microsoft 365 corporativo (Azure AD) | Inherente |

---

## Orden de implementación sugerido

```
1. Crear grupo AD "PRIMAX_Costos_Autorizados" (pedir a IT)
2. Crear entorno Producción en Power Platform Admin Center
3. Crear usuario de servicio SQL primax_app_readonly
4. Construir la app en entorno Dev
   4a. App.OnStart: bloque de sesión (varRolCostos) antes del caché 3 capas
   4b. Galería: Items con filter de rol (varGerenciaUsuario para "Usuario")
   4c. Botones de edición/recalcular: Visible = varRolCostos = "Administrador"
5. Al terminar, mover la solución a entorno Producción
6. Compartir solo con el grupo AD
7. Validar con usuario Administrador (acceso total + edición visible)
8. Validar con usuario Consultor (ve todo, sin botones de edición)
9. Validar con usuario de otra área (solo ve su gerencia)
10. Validar con usuario fuera del grupo AD (no puede abrir la app)
```

---

*Documento interno — no compartir fuera del equipo de RRHH/Finanzas/IT.*
