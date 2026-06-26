# Prototipo AppCostosEstructurales

**Cost Calculator Pro** es un prototipo funcional para el cálculo y análisis del costo estructural/prestacional de los colaboradores de PRIMAX, **multi-país** (hoy Colombia y Perú, extensible a más). Cada país tiene su propia lógica de cálculo, nombres de factores y moneda — la app permite explorar cuánto cuesta realmente cada colaborador a la compañía y agregar esa información a nivel de Área y de Gerencia.

## Funcionalidades

- **Selector de país**: cambia entre Colombia/Perú; cada uno usa su propio dataset, fórmulas y etiquetas, manteniendo la misma estructura de navegación e interfaz.
- **Listado de Colaboradores**: tabla buscable con el detalle de cada persona (puesto, gerencia, área, grado).
- **Listado de Gerencias**: vista consolidada por gerencia corporativa, con acordeón para desplegar las Áreas que la componen y su costo individual.
- **Costeo individual**: desglose completo de la carga del país correspondiente, con KPIs, proyección a 6/12/24 meses y gráfico de composición.
- **Costeo consolidado (Área / Gerencia)**: mismos KPIs y desglose a nivel agregado (sumando los factores de cada colaborador), más el listado de quienes lo componen, con navegación directa al detalle de cada uno.
- **Edición en línea**: los campos editables de cada colaborador (definidos por país) se ajustan desde su vista individual; los cambios se recalculan en cascada en Área y Gerencia.
- **Multi-moneda** (COP / USD / PEN), con conversión vía tipo de cambio pivotando en USD.

## Stack

React 18 + Vite + Tailwind CSS (build real con PostCSS) + Chart.js. Sin backend ni base de datos: los datos viven en memoria del navegador y se reinician al recargar.

## Cómo ejecutarlo

```
cd prototipo
npm install
npm run dev      # entorno de desarrollo, http://localhost:5173
npm run build    # build de producción en prototipo/dist
npm run preview  # sirve el build de producción localmente
```

## Datos: demo (público) vs. reales (solo local)

Este proyecto **nunca sube datos reales/confidenciales** (sueldos, vales, grados, nombres, etc.) al repositorio. El mecanismo:

- `src/data/colaboradoresCO.demo.js` y `colaboradoresPE.demo.js` — datos **ficticios**, comitteados a git. Son los que se usan en cualquier build de producción (`npm run build` / `npm run deploy`), sin excepción — ver `.env.production` (`VITE_FORZAR_DATOS_DEMO=true`).
- `src/data/local/colaboradoresCO.js` y `src/data/local/colaboradoresPE.js` *(carpeta `src/data/local/` completa, gitignored)* — datos **reales**, solo existen en tu máquina. Si existen, `npm run dev` los usa automáticamente en lugar de los de demo.
- `src/data/colaboradoresCO.js` / `colaboradoresPE.js` — el *loader*: elige entre local y demo según el modo (dev vs. build) y si el archivo local existe. Este archivo sí se commitea (es solo lógica, sin datos).

Para cargar datos reales: edita directamente `src/data/local/colaboradoresCO.js` o `colaboradoresPE.js` (cópialos de los `.demo.js` como plantilla de formato) — nunca pegues datos reales en `.env.production`, ni en ningún archivo fuera de `src/data/local/`.

## Despliegue en GitHub Pages

```
cd prototipo
npm run deploy   # build (con datos demo forzados) + push de dist/ a la rama gh-pages
```

Requiere, una sola vez, en Settings → Pages del repo: Source = "Deploy from a branch", branch `gh-pages` / `(root)`. Queda disponible en `https://alexis0816.github.io/PrototipoAppCostosEstructurales/`.

## Estado del proyecto

Esta es una **prueba de concepto frontend**: no hay backend, base de datos ni autenticación todavía — el objetivo actual es validar la experiencia y las reglas de cálculo antes de conectar una API real.

## Estructura

```
prototipo/
  package.json, vite.config.js, tailwind.config.js, postcss.config.js
  index.html              # shell de Vite
  .env.production          # fuerza datos demo en cualquier build (sí se commitea)
  .env.local                # variables locales propias, nunca se commitea (hoy vacío)
  src/
    main.jsx, App.jsx, index.css
    data/                  # ver sección "Datos: demo vs. reales" arriba — barrel: index.js
      colaboradoresCO.js, colaboradoresPE.js        # loaders (demo vs. local)
      colaboradoresCO.demo.js, colaboradoresPE.demo.js  # datos ficticios (commiteados)
      local/                                         # datos reales (gitignored)
    paises/                # un módulo por país: fórmulas, config declarativa y dataset
      registry.js          # barrel/orquestador: PAISES, getPais(codigo), listarPaises()
      colombia/             # calculos.js, constants.js, config.js, desglose.js, index.js
      peru/                  # idem
    context/               # AppContext (Provider + useAppContext) + appReducer — barrel: index.js
    utils/                  # funciones país-agnósticas puras: agrupación, formato/fx, resolverColaborador — barrel: index.js
    hooks/                  # hooks de React: useResolvedColaborador, useCalculo, useClickOutside — barrel: index.js
    components/
      shared/               # Boton, Badge, Avatar, CampoEditable, DropdownAreas, etc. — barrel: index.js
      list/                  # vista de lista (Colaboradores / Gerencias)
      detail/                # vista de detalle (individual / área / gerencia)
```

Cada carpeta con `index.js` es un *barrel*: el resto del código importa `from '../../utils'` / `from '../../hooks'` / `from '../shared'` / `from '../../context'` / `from '../../data'` en vez de apuntar a archivos individuales. Las importaciones entre archivos *dentro* de la misma carpeta (ej. `list/TablaGerencias.jsx` → `./GerenciaRow.jsx`) siguen siendo directas.
