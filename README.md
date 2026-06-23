# Prototipo AppCostosEstructurales

**Cost Calculator Pro** es un prototipo funcional para el cálculo y análisis del costo prestacional de los colaboradores de PRIMAX en Colombia. Permite explorar cuánto cuesta realmente cada colaborador a la compañía —no solo su sueldo, sino la carga prestacional completa (primas, cesantías, seguridad social, etc.)— y agregar esa información a nivel de Área y de Gerencia.

## Funcionalidades

- **Listado de Colaboradores**: tabla buscable con el detalle de cada persona (puesto, gerencia, área, grado).
- **Listado de Gerencias**: vista consolidada por gerencia corporativa, con acordeón para desplegar las Áreas que la componen y su costo individual.
- **Costeo individual**: desglose completo de la carga prestacional mensual (prima de servicios, vacaciones, navidad, cesantías, intereses, seguridad social y provisión PAR), con KPIs, proyección a 6/12/24 meses y gráfico de composición.
- **Costeo consolidado (Área / Gerencia)**: mismos KPIs y desglose a nivel agregado, más el listado de los colaboradores que componen ese consolidado, con navegación directa al detalle de cada uno.
- **Edición en línea**: el sueldo y el bono target de cada colaborador se pueden ajustar desde su vista individual; los cambios se recalculan en cascada en Área y Gerencia.
- **Multi-moneda** (COP / USD / PEN) y soporte para estructura salarial Fija o Integral.

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

## Despliegue en GitHub Pages

```
cd prototipo
npm run deploy   # build + push de dist/ a la rama gh-pages
```

Requiere, una sola vez, en Settings → Pages del repo: Source = "Deploy from a branch", branch `gh-pages` / `(root)`. Queda disponible en `https://alexis0816.github.io/PrototipoAppCostosEstructurales/`.

## Estado del proyecto

Esta es una **prueba de concepto frontend**: no hay backend, base de datos ni autenticación todavía — el objetivo actual es validar la experiencia y las reglas de cálculo antes de conectar una API real.

## Estructura

```
prototipo/
  package.json, vite.config.js, tailwind.config.js, postcss.config.js
  index.html              # shell de Vite
  src/
    main.jsx, App.jsx, index.css
    data/                 # colaboradores (array en memoria)
    context/              # AppContext + reducer (navegación, ediciones, moneda/período)
    lib/                  # funciones puras de cálculo, formato y agrupación
    hooks/                # useResolvedColaborador, useCalculo, useClickOutside
    components/
      shared/              # Boton, Badge, Avatar, CampoEditable, DropdownAreas, etc.
      list/                 # vista de lista (Colaboradores / Gerencias)
      detail/               # vista de detalle (individual / área / gerencia)
```
