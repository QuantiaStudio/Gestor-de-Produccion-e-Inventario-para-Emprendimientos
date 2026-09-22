# Gestor de Producción e Inventario para Emprendimientos

Aplicación web desarrollada con Angular para gestionar producción, materias primas, productos terminados, usuarios y paneles de control orientados a microemprendimientos y pequeños talleres productivos.

El objetivo del sistema es centralizar información clave del negocio en una interfaz clara: stock disponible, materiales que requieren reposición, productos terminados, órdenes de trabajo y vistas diferenciadas para administradores y usuarios operativos.

## Información general

Este repositorio contiene:

- `frontend/ProdManager`: aplicación principal desarrollada con Angular 17.
- `maqueta`: prototipo HTML/CSS inicial utilizado como base visual del proyecto.
- `backend`: carpeta reservada para el futuro desarrollo del backend.

La aplicación Angular consume una API de prueba simulada con [json-server](https://github.com/typicode/json-server), que expone como servicio REST los datos del archivo `frontend/ProdManager/db.json` (usuarios, materias primas, productos, órdenes de producción y movimientos de stock). Para que la aplicación funcione hay que levantar **dos procesos**: la API de prueba y el servidor de desarrollo de Angular. Los cambios que se hacen desde la aplicación (altas, movimientos de stock, cambios de estado) se guardan en `db.json`.

## Funcionalidades principales

- Página de inicio pública y sección institucional "Quiénes somos".
- Inicio de sesión contra la API, con dos roles (Administrador y Operador), rutas protegidas por rol y página 404 personalizada.
- **Administrador**: dashboard, gestión de materias primas (consulta, actualización y baja), listado y administración de productos terminados con su fórmula, y gestión de usuarios.
- **Operador**: órdenes de producción (crear, iniciar, finalizar y cancelar) y listado de materias primas con actualización de stock mediante ingresos y consumos.
- Al finalizar una orden se descuentan las materias primas de la fórmula y se suma el stock del producto terminado, registrando los movimientos.

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

Este comando instala también `json-server`, la API de prueba que se usa en la ejecución (no hace falta instalarla aparte).

Si querés instalar exactamente las versiones registradas en `package-lock.json`, podés usar:

```bash
npm ci
```

## Ejecución en desarrollo

La aplicación necesita **dos terminales abiertas al mismo tiempo**, ambas ubicadas en la carpeta `frontend/ProdManager`.

### Terminal 1: API de prueba (json-server)

```bash
npm run json-server
```

Levanta la API en `http://localhost:3000/` a partir del archivo `db.json`. Se puede comprobar abriendo `http://localhost:3000/materiasPrimas` en el navegador. Esta terminal tiene que quedar abierta mientras se usa la aplicación.

> Si el puerto 3000 está ocupado por otro programa, la API no va a levantar y la aplicación va a mostrar las tablas vacías o un error al iniciar sesión. Cerrá el programa que lo usa (o cambiá el puerto en el script `json-server` de `package.json` y en la URL de `src/environments/environment.ts` y `src/app/auth/services/auth.service.ts`).

### Terminal 2: aplicación Angular

```bash
npm start
```

Este comando ejecuta `ng serve` y levanta la aplicación en:

```text
http://localhost:4200/
```

La aplicación se recarga automáticamente cuando se modifican archivos del frontend.

### Usuarios de prueba

Los usuarios están definidos en la tabla `usuarios` de `db.json`:

| Rol | Correo | Contraseña | Acceso |
| --- | --- | --- | --- |
| Administrador | `admin@correo.com` | `123456` | `/dashboard` |
| Administrador | `rocio.altamirano@correo.com` | `123456` | `/dashboard` |
| Operador | `genaro.cura@correo.com` | `abcabc` | `/user-panel` |

El usuario `cesia.caceres@correo.com` está inactivo y no puede iniciar sesión. Al iniciar sesión, cada rol es redirigido a su panel.

### Restaurar los datos de prueba

Como la API guarda los cambios en `db.json`, después de probar la aplicación se pueden descartar con:

```bash
git checkout -- frontend/ProdManager/db.json
```

## Rutas disponibles

Rutas públicas:

- `/`: página de inicio.
- `/about-us`: información del equipo.
- `/login`: inicio de sesión.

Rutas del administrador (requieren rol `ADMIN`):

- `/dashboard`: panel administrativo.
- `/dashboard/materias-primas`: gestión de materias primas.
- `/dashboard/productos-terminados`: productos terminados.
- `/dashboard/users`: gestión de usuarios.

Rutas del operador (requieren rol `OPERARIO`):

- `/user-panel/produccion`: órdenes de producción.
- `/user-panel/materia-prima`: listado de materias primas y actualización de stock.

Cualquier otra ruta muestra la página de error 404.

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
|-- db.json                    # Base de datos de prueba que sirve json-server
|-- src/
|   |-- app/
|   |   |-- auth/              # Login, guards, modelos y servicio de autenticación
|   |   |-- dashboard/
|   |   |   |-- admin/         # Vistas y features del administrador
|   |   |   `-- user/          # Vistas y features del operador
|   |   |-- layout/            # Layouts públicos y de dashboard
|   |   |-- models/            # Modelos de datos
|   |   |-- public/            # Páginas públicas
|   |   |-- services/          # Servicios que consumen la API con HttpClient
|   |   `-- shared/            # Componentes reutilizables
|   |-- assets/                # Imágenes e iconos
|   |-- environments/          # URL base de la API
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
