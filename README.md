# Gestor de Producción e Inventario para Emprendimientos

Aplicación web desarrollada con Angular para gestionar producción, materias primas, productos terminados, usuarios y paneles de control orientados a microemprendimientos y pequeños talleres productivos.

El objetivo del sistema es centralizar información clave del negocio en una interfaz clara: stock disponible, materiales que requieren reposición, productos terminados, órdenes de trabajo y vistas diferenciadas para administradores y usuarios operativos.

## Información general

Este repositorio contiene:

- `frontend/ProdManager`: aplicación principal desarrollada con Angular 17.
- `maqueta`: prototipo HTML/CSS inicial utilizado como base visual del proyecto.
- `backend`: carpeta reservada para el futuro desarrollo del backend.

La versión Angular actual funciona como frontend y utiliza datos definidos dentro de la aplicación. Por el momento no requiere levantar un backend para visualizar las pantallas principales.

## Funcionalidades principales

- Página de inicio pública.
- Sección institucional "Quiénes somos".
- Inicio de sesión.
- Dashboard administrativo.
- Gestión visual de materias primas.
- Listado de productos terminados.
- Gestión de usuarios.
- Navegación mediante layouts públicos y privados.
- Pantalla de error para rutas no encontradas.

## Tecnologías utilizadas

- Angular 17.3
- Angular CLI 17.3
- TypeScript 5.4
- Bootstrap 5.3
- RxJS
- Karma y Jasmine para pruebas unitarias

## Requisitos previos

Antes de instalar el proyecto, asegurate de tener instalado:

- Node.js 18 o superior compatible con Angular 17.
- npm.
- Git, si vas a clonar el repositorio desde GitHub.

Para comprobar las versiones instaladas:

```bash
node -v
npm -v
git --version
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/QuantiaStudio/Gestor-de-Produccion-e-Inventario-para-Emprendimientos.git
cd Gestor-de-Produccion-e-Inventario-para-Emprendimientos
```

### 2. Ingresar al proyecto Angular

```bash
cd frontend/ProdManager
```

### 3. Instalar dependencias

```bash
npm install
```

Si querés instalar exactamente las versiones registradas en `package-lock.json`, podés usar:

```bash
npm ci
```

## Ejecución en desarrollo

Desde la carpeta `frontend/ProdManager`, ejecutar:

```bash
npm start
```

Este comando ejecuta `ng serve` y levanta la aplicación en:

```text
http://localhost:4200/
```

La aplicación se recarga automáticamente cuando se modifican archivos del frontend.

## Rutas disponibles

Algunas rutas principales de la aplicación son:

- `/`: página de inicio.
- `/about-us`: información del equipo.
- `/login`: inicio de sesión.
- `/dashboard`: panel administrativo.
- `/dashboard/materias-primas`: vista de materias primas.
- `/dashboard/users`: gestión de usuarios.
- `/dashboard/productos-terminados`: listado de productos terminados.

## Compilación para producción

Para generar una versión compilada del frontend:

```bash
npm run build
```

Los archivos generados quedan dentro de:

```text
frontend/ProdManager/dist/prod-manager
```

## Pruebas

Para ejecutar las pruebas unitarias configuradas con Karma y Jasmine:

```bash
npm test
```

## Estructura del frontend

```text
frontend/ProdManager/
|-- src/
|   |-- app/
|   |   |-- auth/              # Componentes, modelos y servicios de autenticación
|   |   |-- dashboard/         # Vistas administrativas
|   |   |-- layout/            # Layouts públicos y de dashboard
|   |   |-- materia-prima/     # Componentes de materias primas
|   |   |-- models/            # Modelos de datos
|   |   |-- public/            # Páginas públicas
|   |   |-- services/          # Servicios del frontend
|   |   `-- shared/            # Componentes reutilizables
|   |-- assets/                # Imágenes e iconos
|   |-- index.html
|   |-- main.ts
|   `-- styles.css
|-- angular.json
|-- package.json
`-- package-lock.json
```

## Equipo de desarrollo

Proyecto desarrollado por **QuantiaStudio**, equipo de estudiantes de la **Tecnicatura Superior en Desarrollo de Software** del **Instituto Superior Politécnico de Córdoba (ISPC)**.

- [Altamirano Rocío](https://github.com/rocioaltamirano19)
- [Cáceres Cesia](https://github.com/Cesiaf)
- [Cura Genaro](https://github.com/GenaroCura)
- [Mendieta Mauro](https://github.com/Mauroo8)
- [Sanchez Matías Emanuel](https://github.com/sanchez-matias)
- [Villafañe Lautaro Emanuel](https://github.com/lautiiv)
