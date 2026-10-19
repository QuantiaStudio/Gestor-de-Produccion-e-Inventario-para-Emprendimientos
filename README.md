
# Gestor de Producción e Inventario para Emprendimientos

Aplicación web desarrollada con Angular para gestionar producción, materias primas, productos terminados, usuarios y paneles de control orientados a microemprendimientos y pequeños talleres productivos.

El objetivo del sistema es centralizar información clave del negocio en una interfaz clara: stock disponible, materiales que requieren reposición, productos terminados, órdenes de trabajo y vistas diferenciadas para administradores y usuarios operativos.

## Información general

Este repositorio contiene:

- `frontend/ProdManager`: aplicación principal desarrollada con Angular 17.
- `maqueta`: prototipo HTML/CSS inicial utilizado como base visual del proyecto.
- `backend`: API REST desarrollada con Django y Django REST Framework sobre MySQL. El proyecto integra el flujo de producción y los inventarios; el módulo de materias primas tiene algunas tareas pendientes. El contrato está en [`backend/API.md`](backend/API.md).

## Estado del proyecto

🟡 **Desarrollo en curso.**

ProdManager es una aplicación web para gestionar la producción y los inventarios de microemprendimientos. Integra un frontend desarrollado con Angular, un backend implementado con Django REST Framework y una base de datos MySQL.

El sistema contempla el flujo principal de producción: crear productos terminados y sus fórmulas, administrar órdenes de producción y actualizar los inventarios. Al iniciar una orden se reservan las materias primas necesarias; al finalizarla se descuentan los materiales utilizados y aumenta el stock del producto terminado. Al cancelar una orden, se liberan las reservas sin descontar físicamente las materias primas.

La entrega prioriza el proceso de producción y la consistencia de los inventarios. El módulo de producción se entrega completo; el módulo de materias primas está implementado, con algunas tareas pendientes. La carga y edición completa de materias primas y otras funciones secundarias quedan fuera de las prioridades principales de esta etapa. La arquitectura permite incorporar mejoras en futuras etapas.

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

## Instalar e iniciar la aplicación

Estos pasos son para Windows y se ejecutan desde PowerShell. Instalá previamente **Git**, **Node.js 18 o superior**, **Python 3.10 o superior** y **Docker Desktop**; abrí Docker Desktop y esperá a que esté iniciado.

### Primera vez

Cloná el proyecto y prepará el frontend:

```powershell
git clone https://github.com/QuantiaStudio/Gestor-de-Produccion-e-Inventario-para-Emprendimientos.git
cd Gestor-de-Produccion-e-Inventario-para-Emprendimientos
cd frontend\ProdManager
npm install
```

Prepará el backend y la base de datos:

```powershell
cd ..\..\backend
python -m venv .venv
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
docker compose up -d
```

Esperá unos segundos a que MySQL termine de iniciar y creá las tablas:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
```

### Cada vez que quieras usar la aplicación

Dejá abiertas tres ventanas de PowerShell. En la primera, iniciá el servidor y la base de datos:

```powershell
cd ruta\a\Gestor-de-Produccion-e-Inventario-para-Emprendimientos\backend
docker compose up -d
.\.venv\Scripts\python.exe manage.py runserver
```

En la segunda, iniciá el servicio de datos de la aplicación:

```powershell
cd ruta\a\Gestor-de-Produccion-e-Inventario-para-Emprendimientos\frontend\ProdManager
npm run json-server
```

En la tercera, iniciá la aplicación web:

```powershell
cd ruta\a\Gestor-de-Produccion-e-Inventario-para-Emprendimientos\frontend\ProdManager
npm start
```

Cuando la terminal indique que Angular está listo, abrí **http://localhost:4200** en el navegador. Dejá las tres ventanas abiertas mientras usás la aplicación. Para detenerla, presioná `Ctrl + C` en cada ventana.
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

Cada app tiene sus `models.py` (tablas), `views.py` (endpoints), `urls.py` (rutas) y `migrations/`.

## Equipo de desarrollo

Proyecto desarrollado por **QuantiaStudio**, equipo de estudiantes de la **Tecnicatura Superior en Desarrollo de Software** del **Instituto Superior Politécnico de Córdoba (ISPC)**.

- [Altamirano Rocío](https://github.com/rocioaltamirano19)
- [Cáceres Cesia](https://github.com/Cesiaf)
- [Cura Genaro](https://github.com/GenaroCura)
- [Mendieta Mauro](https://github.com/Mauroo8)
- [Sanchez Matías Emanuel](https://github.com/sanchez-matias)
- [Villafañe Lautaro Emanuel](https://github.com/lautiiv)
