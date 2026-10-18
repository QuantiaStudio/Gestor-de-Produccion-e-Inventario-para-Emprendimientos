# Gestor de Producción e Inventario para Emprendimientos

Aplicación web desarrollada con Angular para gestionar producción, materias primas, productos terminados, usuarios y paneles de control orientados a microemprendimientos y pequeños talleres productivos.

El objetivo del sistema es centralizar información clave del negocio en una interfaz clara: stock disponible, materiales que requieren reposición, productos terminados, órdenes de trabajo y vistas diferenciadas para administradores y usuarios operativos.

## Información general

Este repositorio contiene:

- `frontend/ProdManager`: aplicación principal desarrollada con Angular 17.
- `maqueta`: prototipo HTML/CSS inicial utilizado como base visual del proyecto.
- `backend`: API REST desarrollada con Django y Django REST Framework sobre MySQL. Tiene definidos los modelos, las migraciones y las rutas; los endpoints se van implementando de a poco y los que todavía no están responden `501 Not Implemented`. El registro, el login y la gestión básica de cuentas ya están conectados. El contrato de la API está en [`backend/API.md`](backend/API.md), y la columna *Implementado* de su resumen de rutas indica cuáles ya funcionan.

## Estado de integración

El objetivo del proyecto es que Angular use Django REST Framework y que los datos de la aplicación queden en MySQL. **Ese trabajo todavía no está completo.**

| Parte | Estado actual |
|---|---|
| Registro público de administradores, login y tokens | Conectado a Django/MySQL |
| Listado y alta de operarios desde el panel administrador | Conectado a Django/MySQL |
| Materias primas y movimientos de stock | El listado se consulta en Django/MySQL; los movimientos de stock y la edición todavía usan json-server y `db.json` |
| Productos, fórmulas e inventario | El alta de productos con su fórmula (con las categorías y materias primas de MySQL) y la eliminación usan Django/MySQL; el listado, la edición y el inventario todavía usan json-server y `db.json` |
| Órdenes y detalles de producción | Angular todavía usa json-server y `db.json`; los endpoints Django responden `501` |

`json-server` queda como soporte temporal para las pantallas pendientes de migración. No es la base de datos final ni significa que esos módulos ya estén conectados. Para completar la integración hay que implementar sus endpoints en Django y cambiar los servicios Angular para consumirlos; después se podrá retirar `json-server` y `db.json`.

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

Backend:

- Python 3.10+
- Django 5.2
- Django REST Framework
- MySQL 8.0 (con Docker o instalado localmente)

## Requisitos previos

Antes de instalar el proyecto, asegurate de tener instalado:

- Node.js 18 o superior compatible con Angular 17.
- npm.
- Git, si vas a clonar el repositorio desde GitHub.
- Python 3.10 o superior (para el backend).
- Docker Desktop (Windows/macOS) o Docker Engine con el plugin Docker Compose (Linux), si vas a levantar MySQL con Docker. Si no, un servidor MySQL 8 instalado localmente.

Para comprobar las versiones instaladas:

```bash
node -v
npm -v
git --version
python --version     # en Linux/macOS puede ser: python3 --version
docker --version
docker compose version
```

## Instalación

La instalación del proyecto y sus dependencias se realizará en dos partes. Una para el frontend y otra para el backend.

## 1. Clonar el repositorio

```bash
git clone https://github.com/QuantiaStudio/Gestor-de-Produccion-e-Inventario-para-Emprendimientos.git
cd Gestor-de-Produccion-e-Inventario-para-Emprendimientos
```

## Dependencias del Frontend

### 1. Ingresar al proyecto Angular

```bash
cd frontend/ProdManager
```

### 2. Instalar dependencias

```bash
npm install
```

Este comando instala también `json-server`, que se mantiene temporalmente para las pantallas todavía no migradas a Django.

Si querés instalar exactamente las versiones registradas en `package-lock.json`, podés usar:

```bash
npm ci
```

## Dependencias del Backend

El backend está desarrollado con Django y usa MySQL como única base de datos. Para la base de datos podés elegir entre levantarla con Docker (recomendado, no requiere instalar MySQL en tu máquina) o usar un servidor MySQL instalado localmente.

Necesitás tener instalado Python 3.10 o superior, y si vas a usar la opción de Docker, también Docker y Docker Compose.

### 1. Ingresar a la carpeta del backend

Desde la raíz del repositorio:

```bash
cd backend
```
- Todos los comandos de esta sección se ejecutan **dentro de la carpeta `backend`**, salvo que se indique otra cosa.
- Si venís de instalar el frontend y seguís en `frontend/ProdManager`, primero volvé a la raíz con `cd ../..`.

### 2. Crear y activar un entorno virtual

El entorno virtual (`.venv`) es una carpeta donde se instalan las librerías de Python del proyecto, separadas del resto del sistema. Se crea **una sola vez**:

```bash
# Windows
python -m venv .venv

# Linux / macOS
python3 -m venv .venv
```

Después hay que **activarlo**. Esto se hace **cada vez que abrís una terminal nueva** para trabajar con el backend:

```bash
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (CMD)
.venv\Scripts\activate.bat

# Linux / macOS
source .venv/bin/activate
```

Cuando el entorno está activo, la terminal muestra `(.venv)` al principio de la línea. A partir de acá, con el entorno activo, `python` y `pip` usan el Python del entorno (también en Linux/macOS).

> En PowerShell, si aparece un error que dice que la ejecución de scripts está deshabilitada, ejecutá una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y volvé a intentar.

### 3. Instalar dependencias

Con el entorno virtual activo:

```bash
pip install -r requirements.txt
```

> **Linux:** el paquete `mysqlclient` se compila durante la instalación y necesita algunas librerías del sistema. Si `pip install` falla con un error relacionado a `mysqlclient` o `pkg-config`, instalalas y repetí el comando:
>
> ```bash
> # Ubuntu / Debian
> sudo apt install python3-dev default-libmysqlclient-dev build-essential pkg-config
> ```
>
> En macOS: `brew install mysql-client pkg-config`. En Windows normalmente no hace falta nada extra.

### 4. Configurar las variables de entorno

El backend lee su configuración (datos de conexión a la base, modo debug, etc.) desde un archivo `.env`. Este archivo **no se sube a Git**, así que cada integrante tiene que crear el suyo copiando la plantilla `.env.example`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (CMD)
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Si vas a usar Docker (opción A del paso siguiente), los valores de la plantilla ya funcionan y no hace falta cambiar nada. Qué significa cada variable:

| Variable | Para qué sirve |
| --- | --- |
| `DEBUG` | `True` en desarrollo: muestra errores detallados. |
| `SECRET_KEY` | Clave interna de Django. En desarrollo puede quedar la de ejemplo. |
| `ALLOWED_HOSTS` | Hosts desde los que se acepta el servidor (`localhost,127.0.0.1`). |
| `CORS_ALLOWED_ORIGINS` | Orígenes del navegador que pueden consumir la API (el frontend Angular en el puerto 4200). |
| `DB_NAME` | Nombre de la base de datos. |
| `DB_USER` / `DB_PASSWORD` | Usuario y contraseña con los que Django se conecta a MySQL. |
| `DB_ROOT_PASSWORD` | Contraseña del usuario `root` de MySQL. Solo la usa Docker al crear la base. |
| `DB_HOST` / `DB_PORT` | Dirección y puerto de MySQL (`127.0.0.1` y `3306`). |

### 5. Levantar la base de datos

Elegí una de las dos opciones:

**Opción A: MySQL con Docker (recomendada)**

1. Abrí Docker Desktop y esperá a que diga que está corriendo (en Linux, el servicio de Docker tiene que estar activo).
2. Desde la carpeta `backend` (donde están `docker-compose.yml` y `.env`):

   ```bash
   docker compose up -d
   ```

   La primera vez descarga la imagen de MySQL y crea la base de datos y el usuario con los datos del `.env`. `-d` hace que quede corriendo en segundo plano.

3. Comprobá que el contenedor `mysql_django` esté en estado `running` (o `Up`):

   ```bash
   docker compose ps
   ```

   La primera vez MySQL tarda unos 20 a 30 segundos en estar listo para recibir conexiones. Si el paso 6 falla con un error de conexión justo después de levantarlo, esperá un poco y volvé a intentar.

> Si tenés una versión vieja de Docker, el comando puede ser `docker-compose` (con guion) en lugar de `docker compose`.

**Opción B: MySQL instalado localmente**

Asegurate de que el servicio de MySQL esté corriendo. Después entrá a MySQL como `root` (por ejemplo con `mysql -u root -p`, o desde MySQL Workbench) y creá la base de datos y el usuario con los mismos valores de `DB_NAME`, `DB_USER` y `DB_PASSWORD` de tu `.env`:

```sql
CREATE DATABASE ProdManager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'quantiauser'@'localhost' IDENTIFIED BY 'djangopassword';
GRANT ALL PRIVILEGES ON ProdManager.* TO 'quantiauser'@'localhost';
FLUSH PRIVILEGES;
```

Si preferís usar una base o un usuario que ya tenés, editá `.env` para que coincida con tu instalación. En esta opción `DB_ROOT_PASSWORD` no se usa.

### 6. Aplicar las migraciones

Las migraciones crean en MySQL todas las tablas del proyecto (usuarios, materias primas, productos, órdenes, etc.) y cargan los estados de producción iniciales (Pendiente, En Produccion, Finalizada, Cancelada):

```bash
python manage.py migrate
```

Si todo salió bien, vas a ver una lista de líneas terminadas en `OK`. Este paso se repite cada vez que alguien del equipo agregue migraciones nuevas (después de hacer `git pull`).

### 7. Cargar los datos iniciales

Después de las migraciones la base queda vacía: no tiene categorías ni materias primas, y sin ellas no se puede crear un producto con su fórmula. El repositorio incluye datos iniciales tomados de `frontend/ProdManager/db.json`:

| Archivo | Qué carga |
| --- | --- |
| `productos/fixtures/categorias.json` | 8 categorías (Mesas, Bibliotecas, Escritorios, …) |
| `materia_prima/fixtures/materias_primas.json` | 5 materias primas con su stock (Madera de Roble, Pintura Blanca, Tornillos 3mm, …) |

Con el entorno virtual activo y las migraciones aplicadas (paso 6):

```bash
python manage.py loaddata categorias materias_primas
```

Si salió bien, vas a ver `Installed 13 object(s) from 2 fixture(s)`. Para comprobar qué quedó cargado:

```bash
python manage.py shell -c "from productos.models import Categoria; from materia_prima.models import MateriaPrima; print(Categoria.objects.count(), 'categorias,', MateriaPrima.objects.count(), 'materias primas')"
```

La última línea tiene que decir `8 categorias, 5 materias primas`.

A tener en cuenta:

- Los datos se cargan con **los mismos ids que en `db.json`**, para que coincidan con lo que muestra la aplicación mientras convivan json-server y el backend.
- Se puede **volver a ejecutar sin duplicar nada**: cada fila se identifica por su id. Si modificaste alguna de esas categorías o materias primas, vuelve a los valores del archivo; lo demás (productos, fórmulas, otras filas) no se toca.
- El stock de las materias primas se carga directamente como punto de partida. De ahí en adelante solo cambia registrando movimientos (ver `API.md`, §6.2).

### 8. Crear un usuario administrador (opcional)

Podés crear la cuenta desde el formulario público de la aplicación, que asigna el rol `ADMIN`, o crearla desde Django:

```bash
python manage.py createsuperuser
```

El comando pide email, nombre, apellido y contraseña. El usuario se crea con rol `ADMIN`.

## Ejecución en desarrollo (frontend)

La aplicación puede necesitar **tres procesos abiertos al mismo tiempo**: json-server para las pantallas aún no migradas, Django con MySQL para registro/autenticación/cuentas y el alta de productos, y Angular. Para trabajar solo con registro/login y cuentas, no hace falta iniciar json-server. Para usar las pantallas pendientes de migración, sí.

### Terminal opcional: módulos todavía conectados a json-server

```bash
npm run json-server
```

Levanta la API provisional en `http://localhost:3000/` a partir de `db.json`. Solo hace falta para probar materias primas, productos, fórmulas, movimientos y producción mientras esos módulos no se migren al backend. No es necesario para registro, login ni gestión de cuentas.

> Si el puerto 3000 está ocupado, fallarán las pantallas que todavía dependen de json-server. El registro, login y la gestión de cuentas usan Django en el puerto 8000.

### Terminal 2: aplicación Angular

```bash
npm start
```

Este comando ejecuta `ng serve` y levanta la aplicación en:

```text
http://localhost:4200/
```

La aplicación se recarga automáticamente cuando se modifican archivos del frontend.

### Backend Django y MySQL

Seguí los pasos de instalación del backend anteriores, levantá MySQL, aplicá las migraciones y ejecutá `python manage.py runserver` desde `backend` (ver [Ejecución del backend](#ejecución-del-backend)). Actualmente, registro/login, gestión de cuentas y el alta de productos se comunican con `http://localhost:8000/api/v1/` (configurado como `djangoApiUrl` en `src/environments/environment.ts`). Los endpoints de los otros módulos siguen pendientes.

Para que el navegador pueda llamar al backend, `backend/.env` tiene que incluir la variable `CORS_ALLOWED_ORIGINS` con el origen de Angular (ya viene en `.env.example`; si tu `.env` es anterior, agregala y reiniciá el backend):

```text
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

> Los productos creados se guardan en MySQL. Hasta que se migre el listado, no aparecen en la tabla de productos terminados, que todavía lee `db.json`.

### Probar registro, login y alta de operarios

El login y las cuentas usan MySQL, no los usuarios hardcodeados de `db.json`. Con Django/MySQL y Angular iniciados:

1. Abrí `http://localhost:4200/registro` y creá una cuenta con un email único. El registro público asigna siempre `ADMIN`.
2. Iniciá sesión en `http://localhost:4200/login`; el administrador llega al dashboard.
3. Desde **Gestión de usuarios**, creá un operario con nombre, apellido, email único y contraseña inicial.
4. Cerrá sesión e iniciá con el operario para comprobar que llega al panel de producción.

Las contraseñas deben cumplir los validadores de Django (mínimo 8 caracteres). Las cuentas se almacenan en MySQL. Los demás módulos aún guardan datos temporales en `db.json`; su conexión real a Django/MySQL es trabajo pendiente.

### Restablecer los datos temporales de json-server

Como la API guarda los cambios en `db.json`, después de probar la aplicación se pueden descartar con:

```bash
git checkout -- frontend/ProdManager/db.json
```

## Ejecución del backend

Una vez completada la instalación del backend, cada vez que quieras levantar el servidor:

1. Abrí una terminal en la carpeta `backend`.
2. Activá el entorno virtual (ver [paso 2](#2-crear-y-activar-un-entorno-virtual)).
3. Asegurate de que la base de datos esté corriendo. Con Docker:

   ```bash
   docker compose up -d
   ```

4. Iniciá el servidor de desarrollo de Django:

   ```bash
   python manage.py runserver
   ```

   Si arranca bien, vas a ver un mensaje como `Starting development server at http://127.0.0.1:8000/`. Esta terminal tiene que quedar abierta mientras uses la API, y el servidor se reinicia solo cuando se modifican archivos del backend.

### Comprobar que la API responde

Todos los endpoints están bajo la URL base:

```text
http://localhost:8000/api/v1/
```

Abrí en el navegador `http://localhost:8000/api/v1/productos/` (o ejecutá `curl http://localhost:8000/api/v1/productos/`). Actualmente responde `501` porque el endpoint todavía no está implementado; esto confirma que Django responde, pero no que el módulo de productos esté integrado:

```json
{ "detail": "El endpoint GET /api/v1/productos/ todavía no está implementado.", "code": "not_implemented" }
```

Si ves esa respuesta, el backend está funcionando correctamente. La lista completa de rutas, métodos, campos y códigos de respuesta está en [`backend/API.md`](backend/API.md).

### Hacer peticiones con Postman

1. Creá un *Environment* con la variable `base_url` = `http://localhost:8000/api/v1`.
2. Creá una *Collection* y usá `{{base_url}}` en las URLs, por ejemplo `GET {{base_url}}/materias-primas/`.
3. Para `POST`, `PUT` y `PATCH`, elegí *Body* → *raw* → *JSON* y enviá los datos con los nombres de campo de `API.md`. Por ejemplo, para `POST {{base_url}}/auth/login/`:

   ```json
   { "email": "admin@correo.com", "contrasena": "123456" }
   ```

> **Importante:** todas las rutas terminan en `/`. Un `GET` sin la barra final se redirige solo, pero un `POST`, `PUT` o `PATCH` sin la barra final devuelve un error `500`.

### Detener el backend

- Para frenar el servidor de Django: `Ctrl + C` en su terminal.
- Para frenar MySQL en Docker (los datos se conservan): `docker compose stop`.
- Para salir del entorno virtual: `deactivate`.

### Problemas frecuentes

| Problema | Solución |
| --- | --- |
| `python` no se reconoce como comando | En Linux/macOS usá `python3`. En Windows, reinstalá Python marcando la opción *Add Python to PATH*. |
| `ModuleNotFoundError: No module named 'django'` | El entorno virtual no está activado. Activalo (paso 2) y volvé a intentar. |
| `pip install` falla al instalar `mysqlclient` | Faltan las librerías del sistema. Ver la nota del [paso 3](#3-instalar-dependencias). |
| `Can't connect to MySQL server on '127.0.0.1'` | MySQL no está corriendo. Abrí Docker y ejecutá `docker compose up -d`, o iniciá tu servicio local. Si recién lo levantaste, esperá unos segundos. |
| `docker compose up` falla porque el puerto `3306` está ocupado | Ya tenés otro MySQL corriendo en ese puerto. Detenelo, o cambiá `DB_PORT` en `.env` (por ejemplo a `3307`) y volvé a ejecutar `docker compose up -d`. |
| `Access denied for user 'quantiauser'` | Los datos de `.env` no coinciden con los de la base. Con Docker, esto pasa si cambiaste `.env` después de crear el contenedor: la base se crea una sola vez. Ejecutá `docker compose down -v` (**borra todos los datos de la base**), luego `docker compose up -d` y `python manage.py migrate`. |
| `Error: That port is already in use` al ejecutar `runserver` | Otro programa usa el puerto 8000. Cerralo o usá otro puerto: `python manage.py runserver 8001` (y cambiá `djangoApiUrl` en `frontend/ProdManager/src/environments/environment.ts`). |
| Al crear un producto aparece "No se pudo conectar con el servidor" | El backend no está corriendo, o el navegador bloqueó el pedido por CORS (en la consola del navegador aparece un error que menciona `CORS`). Levantá el backend y revisá que `backend/.env` tenga `CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200`; después de cambiar `.env`, reiniciá `runserver`. |
| El formulario de alta muestra las listas de categorías y materiales vacías | Faltan los datos iniciales en MySQL. Cargalos con el [paso 7](#7-cargar-los-datos-iniciales). |
| `loaddata` falla con `Table ... doesn't exist` o `Unknown column` | Faltan migraciones por aplicar. Ejecutá `python manage.py migrate` y repetí el [paso 7](#7-cargar-los-datos-iniciales). |
| `loaddata` dice `No fixture named 'categorias'` | El comando no se ejecutó dentro de la carpeta `backend`, o falta hacer `git pull`. |

## Rutas disponibles

Rutas públicas:

- `/`: página de inicio.
- `/about-us`: información del equipo.
- `/login`: inicio de sesión.
- `/registro`: registro público de una cuenta `ADMIN`.

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

### Frontend

Para ejecutar las pruebas unitarias configuradas con Karma y Jasmine (desde `frontend/ProdManager`):

```bash
npm test
```

Para correrlas una sola vez sin abrir una ventana del navegador, o para correr un solo archivo de pruebas:

```bash
npx ng test --watch=false --browsers=ChromeHeadless
npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/dashboard/admin/features/productos/new-product-form/new-product-form.component.spec.ts
```

### Backend

Las pruebas del backend (desde `backend`, con el entorno virtual activo) no usan tu base de datos: Django crea una base aparte llamada `test_` + tu `DB_NAME` (por ejemplo `test_ProdManager`), la llena con las migraciones y los datos iniciales, y la borra al terminar.

El usuario de MySQL necesita permiso para crear esa base. Se da **una sola vez**, como `root` (reemplazá `ProdManager` por tu `DB_NAME` si es otro):

```bash
# Con Docker (pide la contraseña de DB_ROOT_PASSWORD de tu .env)
docker compose exec db mysql -u root -p -e "GRANT ALL PRIVILEGES ON \`test_ProdManager\`.* TO 'quantiauser'@'%';"
```

```sql
-- Con MySQL instalado localmente
GRANT ALL PRIVILEGES ON `test_ProdManager`.* TO 'quantiauser'@'localhost';
```

Después, para correr todas las pruebas:

```bash
python manage.py test
```

Si todo está bien, termina con `OK`. Si falla con `Access denied ... to database 'test_...'`, falta el permiso anterior. Para correr las de una sola app: `python manage.py test productos`.

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

## Estructura del backend

```text
backend/
|-- config/                    # Proyecto Django: settings, URLs raíz, manejo de errores
|-- usuarios/                  # Usuarios y autenticación (/auth/, /usuarios/)
|-- materia_prima/             # Materias primas y sus movimientos de stock
|-- productos/                 # Categorías, productos, fórmulas y movimientos de inventario
|-- produccion/                # Estados, órdenes de producción y sus detalles
|-- API.md                     # Contrato de la API (rutas, campos, respuestas)
|-- docker-compose.yml         # MySQL 8 para desarrollo
|-- .env.example               # Plantilla de variables de entorno
|-- manage.py
`-- requirements.txt
```

Cada app tiene sus `models.py` (tablas), `views.py` (endpoints), `urls.py` (rutas) y `migrations/`. `productos` y `materia_prima` tienen además `fixtures/`, con los datos iniciales que se cargan con `loaddata` (ver [paso 7](#7-cargar-los-datos-iniciales)).

## Equipo de desarrollo

Proyecto desarrollado por **QuantiaStudio**, equipo de estudiantes de la **Tecnicatura Superior en Desarrollo de Software** del **Instituto Superior Politécnico de Córdoba (ISPC)**.

- [Altamirano Rocío](https://github.com/rocioaltamirano19)
- [Cáceres Cesia](https://github.com/Cesiaf)
- [Cura Genaro](https://github.com/GenaroCura)
- [Mendieta Mauro](https://github.com/Mauroo8)
- [Sanchez Matías Emanuel](https://github.com/sanchez-matias)
- [Villafañe Lautaro Emanuel](https://github.com/lautiiv)
