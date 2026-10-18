# Backend

Backend de la aplicación, desarrollado con Django, Django REST Framework y
MySQL.

## Requisitos

- Python 3.10 o superior.
- Docker Desktop y Docker Compose, si se usa la base de datos incluida en el
  proyecto.
- Git.

## Configuración inicial en Windows

Abrir PowerShell en esta carpeta:

```powershell
cd E:\Gestor-de-Produccion-e-Inventario-para-Emprendimientos\backend
```

Crear y activar el entorno virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Instalar las dependencias:

```powershell
pip install -r requirements.txt
```

Crear el archivo local de variables de entorno:

```powershell
Copy-Item .env.example .env
```

El archivo `.env.example` ya contiene la configuración necesaria para trabajar
con la base de datos del proyecto. En el caso habitual no es necesario editar
nada después de copiarlo. El archivo `.env` es local y no se debe subir a Git.

## Iniciar MySQL con Docker

Desde la carpeta `backend`:

```powershell
docker compose up -d
```

Para comprobar el estado del contenedor:

```powershell
docker compose ps
```

## Aplicar migraciones

Ejecutar:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
```

Este comando crea las tablas y carga las materias primas iniciales mediante la
migración de datos de `materia_prima`.

Para revisar el estado de esa aplicación:

```powershell
.\.venv\Scripts\python.exe manage.py showmigrations materia_prima
```

Las migraciones aplicadas aparecen con `[X]`.

## Materias primas iniciales

Las materias primas iniciales se encuentran en una migración versionada en:

```text
materia_prima\migrations\0002_cargar_materias_primas.py
```

La carga utiliza el nombre como identificador:

- si la materia prima no existe, se crea;
- si ya existe, no se duplica;
- si ya existe, no se sobrescriben sus datos;
- ninguna materia prima existente se elimina.

Por ese motivo, las migraciones ya compartidas no deben editarse ni eliminarse.
Si hay que agregar datos nuevos o corregir una carga ya compartida, se debe
crear una nueva migración.

## Ejecutar el servidor

```powershell
.\.venv\Scripts\python.exe manage.py runserver
```

La API de materias primas queda disponible en:

```text
http://localhost:8000/api/v1/materias-primas/
```

Por ahora, el módulo de materias primas del frontend se está conectando
progresivamente a esta API. Los demás módulos pueden continuar usando
`json-server` mientras se realiza la migración.

## Flujo para actualizar el proyecto

Después de traer cambios del repositorio:

```powershell
git pull
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
```

No es necesario compartir una copia de MySQL ni un archivo SQL. Las
migraciones versionadas permiten reproducir la estructura y los datos iniciales
en cada entorno.

## Problemas frecuentes

### La API devuelve una lista vacía

Comprobar que:

1. MySQL esté iniciado:

   ```powershell
   docker compose ps
   ```

2. `.env` use la misma base que Docker:

   ```env
   DB_NAME=quantia_db
   ```

3. Las migraciones estén aplicadas:

   ```powershell
   .\.venv\Scripts\python.exe manage.py showmigrations materia_prima
   ```

4. El servidor Django se haya reiniciado después de modificar `.env`.

### El puerto de MySQL ya está ocupado

Verificar si existe otro servicio usando el puerto `3306`. Si se modifica el
puerto en `.env`, el valor de `DB_PORT` debe coincidir con el puerto publicado
por Docker.
