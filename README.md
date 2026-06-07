# Gestor de Producción e Inventario para Emprendimientos

Sistema web orientado a microemprendimientos que necesitan administrar, en un mismo lugar, su materia prima, su flujo de producción y su inventario de productos terminados.

## Introducción

### ¿De qué se trata el sistema?

Este proyecto es una aplicación web pensada para acompañar el día a día de pequeños emprendedores y talleres productivos. Su objetivo es ofrecer una herramienta simple, accesible y visualmente clara que permita controlar todo el ciclo productivo de un negocio: desde la compra y el registro de materia prima, pasando por el seguimiento de la producción, hasta el control del stock final de productos listos para la venta.

### ¿Qué problema busca resolver?

Los emprendimientos pequeños suelen quedar atrapados en una situación intermedia: ya no alcanzan con un cuaderno o una hoja de cálculo improvisada, pero todavía no tienen el volumen ni el presupuesto para acceder a un ERP empresarial. En ese punto medio aparecen problemas concretos como:

- **Desconocimiento del stock real** de materias primas e insumos, lo que lleva a comprar de más o quedarse sin material en medio de una producción.
- **Falta de visibilidad sobre el flujo de producción**: no se sabe con claridad qué se está fabricando, en qué etapa está cada pedido o qué órdenes están demoradas.
- **Pérdida de información histórica** que podría servir para proyectar compras, ventas y producción futura.
- **Dependencia de la memoria del dueño o dueña** del emprendimiento, lo cual no escala cuando el negocio crece.

Este sistema busca dar respuesta directa a esas necesidades mediante una interfaz amigable, organizada por roles (administrador y usuario operativo) y centrada en mostrar la información clave de forma inmediata: cuánto hay, qué se está produciendo, qué falta reponer y cómo está rindiendo el equipo.

## Funcionalidades del sistema

A continuación se describen las funcionalidades previstas para el producto final. La maqueta actual representa visualmente la mayoría de estas pantallas y sirve como base para el desarrollo posterior.

- **Acceso y gestión de usuarios**:
  1. Pantalla de bienvenida (landing page)
  2. Inicio de sesión
  3. Registro de nuevos usuarios
  4. Diferenciación por roles (Administrador y Usuario operativo)

- **Panel de Administrador (Dashboard Admin)**:
  1. Indicadores clave (KPIs) comparados con el mes anterior.
  2. Gráficos de producción para análisis visual.
  3. Tabla de órdenes de trabajo donde se listan los pedidos con cada detalle.
  4. Menú expandible lateral para navegación.

- **Panel de Usuario operativo**:

  1. Listado de materias primas con cada detalle
  2. Buscador de materiales para filtrar rápidamente entre los insumos del taller.
  3. Indicadores visuales que destacan en color los materiales que requieren reposición urgente.
  4. Menú lateral expandible con accesos a Producción, Materias Primas, Productos terminados y Métricas.

- **Páginas institucionales**:

  1. Página de inicio (Home).
  2. Sección "Quiénes somos" con la presentación del equipo de desarrollo.
  3. Footer institucional con información del estudio (QuantiaStudio) y del proyecto.

## Instalación y ejecución del prototipo

### 1. Obtener el código fuente

**Opción A — Clonando con Git (recomendada):**

Abrí una terminal y ejecutá los siguientes comandos:

```bash
git clone https://github.com/QuantiaStudio/Gestor-de-Produccion-e-Inventario-para-Emprendimientos.git
cd Gestor-de-Produccion-e-Inventario-para-Emprendimientos
```

**Opción B — Descargando el ZIP:**

1. Ingresá a la página del repositorio en GitHub.
2. Hacé clic en el botón verde **"Code"**.
3. Seleccioná **"Download ZIP"**.
4. Descomprimí el archivo en la carpeta de tu preferencia.


### 2. Levantar un servidor local con la extensión Live Server de Visual Studio Code

  1. Instalá la extensión **Live Server** desde el marketplace de VS Code.
  2. Abrí la carpeta del proyecto en VS Code.
  3. Hacé clic derecho sobre `maqueta/html/landing.html` y selecciona **"Open with Live Server"**.

## Equipo de desarrollo

Este proyecto está siendo desarrollado por **QuantiaStudio**, un equipo de estudiantes de la **Tecnicatura Superior en Desarrollo de Software** del **Instituto Superior Politécnico de Córdoba (ISPC)**.

- [Altamirano Rocío](https://github.com/rocioaltamirano19)
- [Cáceres Cesia](https://github.com/Cesiaf)
- [Cura Genaro](https://github.com/GenaroCura)
- [Mendieta Mauro](https://github.com/Mauroo8)
- [Sanchez Matías Emanuel](https://github.com/sanchez-matias)
- [Villafañe Lautaro Emanuel](https://github.com/lautiiv)
