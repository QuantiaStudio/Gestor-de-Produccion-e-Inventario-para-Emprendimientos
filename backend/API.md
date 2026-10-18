# Contrato de la API — Gestor de Producción e Inventario

Versión del contrato: **v1** · Estado: **definido, sin implementar** (todos los endpoints responden `501`).

Este documento es la referencia común entre frontend y backend. Si un endpoint se implementa distinto a lo que dice acá, se actualiza este documento en el mismo PR.

---

## 1. Convenciones generales

| Tema | Regla |
|---|---|
| URL base | `/api/v1/` (local: `http://localhost:8000/api/v1/`) |
| Rutas | Recursos en plural y `kebab-case`, siempre con `/` final. Ej.: `/api/v1/materias-primas/12/` |
| Formato | JSON (`Content-Type: application/json`), codificación UTF-8 |
| Nombres de campos | `snake_case`, iguales a los del diagrama ER (`id_producto`, `stock_actual`, …) |
| Identificadores | Cada recurso expone su clave primaria con el nombre del diagrama (`id_producto`, no `id`). Las relaciones se envían y se reciben como el id de la otra tabla (`id_categoria: 3`) |
| Decimales | Cantidades, stocks y precios viajan como **string** con punto decimal (`"12.500"`), para no perder precisión. Al enviar se aceptan número o string |
| Fechas | ISO 8601 en UTC (`"2026-10-14T13:45:00Z"`) |
| Listados | Devuelven un **array** sin paginación (por ahora). Aceptan filtros por query string, indicados en cada recurso |
| Autenticación | Header `Authorization: Token <token>` obtenido en `POST /auth/login/`. Todos los endpoints la requieren salvo `login` (ver §10, pendiente de confirmar) |

### Operaciones CRUD estándar

Salvo que se indique otra cosa, cada recurso expone:

| Método | Ruta | Acción | Éxito |
|---|---|---|---|
| `GET` | `/recurso/` | Listar | `200` + array |
| `POST` | `/recurso/` | Crear | `201` + objeto creado |
| `GET` | `/recurso/{id}/` | Obtener uno | `200` + objeto |
| `PUT` | `/recurso/{id}/` | Reemplazar (se envían todos los campos editables) | `200` + objeto |
| `PATCH` | `/recurso/{id}/` | Actualizar parcialmente (solo los campos enviados) | `200` + objeto |
| `DELETE` | `/recurso/{id}/` | Eliminar | `204` sin cuerpo |

En las tablas de campos:
- **Req.** = obligatorio en `POST` y `PUT` (en `PATCH` nada es obligatorio).
- **Solo lectura** = aparece en la respuesta pero se ignora si se envía.
- **Solo escritura** = se envía pero nunca aparece en la respuesta.

---

## 2. Códigos de respuesta

| Código | Cuándo |
|---|---|
| `200 OK` | Lectura o actualización correcta |
| `201 Created` | Recurso creado |
| `204 No Content` | Recurso eliminado |
| `400 Bad Request` | Datos inválidos (faltan campos, tipos o valores fuera de rango) |
| `401 Unauthorized` | Falta el token o es inválido |
| `403 Forbidden` | El usuario no tiene permiso (por rol o por estar inactivo) |
| `404 Not Found` | No existe el recurso indicado en la URL (`/recurso/{id}/`) |
| `405 Method Not Allowed` | El método no está permitido en esa ruta (ej.: `DELETE` de un movimiento) |
| `409 Conflict` | La operación viola una regla de negocio: se elimina algo que otros registros referencian, o el stock quedaría negativo |
| `500 Internal Server Error` | Error inesperado del servidor |
| `501 Not Implemented` | El endpoint está definido en este contrato pero todavía no se implementó |

## 3. Formato de errores

Todas las respuestas de error tienen la misma forma:

```json
{
  "detail": "Mensaje legible para mostrar o loguear.",
  "code": "codigo_maquina",
  "errors": { "campo": ["mensaje", "..."] }
}
```

- `detail` y `code` están **siempre**.
- `errors` aparece **solo en `400`**, con los mensajes por campo. Los errores que no son de un campo van en `non_field_errors`.

Ejemplos:

```json
// 400
{
  "detail": "Datos inválidos.",
  "code": "invalid",
  "errors": {
    "nombre": ["Este campo es requerido."],
    "precio": ["Asegúrese de que este valor sea mayor o igual a 0."]
  }
}

// 404
{ "detail": "No encontrado.", "code": "not_found" }

// 409
{ "detail": "Stock insuficiente de 'Roble macizo': disponible 2.000, requerido 5.000.", "code": "stock_insuficiente" }

// 501
{ "detail": "El endpoint GET /api/v1/productos/ todavía no está implementado.", "code": "not_implemented" }
```

Valores de `code` usados: `invalid`, `not_authenticated`, `authentication_failed`, `permission_denied`, `not_found`, `method_not_allowed`, `conflict`, `stock_insuficiente`, `en_uso`, `server_error`, `not_implemented`.

---

## 4. Autenticación — `/auth/`

| Método | Ruta | Descripción | Éxito |
|---|---|---|---|
| `POST` | `/auth/login/` | Inicia sesión | `200` |
| `POST` | `/auth/logout/` | Invalida el token actual | `204` |
| `GET` | `/auth/me/` | Devuelve el usuario autenticado | `200` + Usuario |

**`POST /auth/login/`**

```json
// Request
{ "email": "admin@correo.com", "contrasena": "123456" }

// 200
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "usuario": { "id_usuario": 1, "nombre": "Admin", "apellido": "Sistema", "email": "admin@correo.com", "rol": "ADMIN", "estado": true }
}
```

Errores: `400` si faltan campos; `401` (`authentication_failed`) si las credenciales son incorrectas; `403` si el usuario está inactivo (`estado: false`).

---

## 5. Usuarios — `/usuarios/`

CRUD estándar. Pensado para administradores.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_usuario` | int | — | Solo lectura |
| `nombre` | string (≤100) | Sí | |
| `apellido` | string (≤100) | Sí | |
| `email` | string (email) | Sí | Único (`400` si ya existe) |
| `contrasena` | string | Sí en `POST` | **Solo escritura**. Se guarda hasheada. En `PUT`/`PATCH` es opcional: si se envía, se cambia |
| `rol` | `"ADMIN"` \| `"OPERARIO"` | No | Por defecto `"OPERARIO"` |
| `estado` | boolean | No | Por defecto `true`. `false` = no puede iniciar sesión |

Filtros: `?rol=OPERARIO`, `?estado=true`.
`DELETE`: `409` (`en_uso`) si el usuario tiene movimientos registrados; en ese caso se lo desactiva con `PATCH {"estado": false}`.

```json
// GET /usuarios/3/ → 200
{ "id_usuario": 3, "nombre": "Genaro", "apellido": "Cura", "email": "genaro.cura@correo.com", "rol": "OPERARIO", "estado": true }
```

---

## 6. Materias primas

### 6.1 `/materias-primas/`

CRUD estándar.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_materia_prima` | int | — | Solo lectura |
| `nombre` | string (≤100) | Sí | |
| `descripcion` | string | No | Por defecto `""` |
| `unidad_medida` | string (≤50) | Sí | Texto libre (`"u"`, `"L"`, `"kg"`, `"planchas"`, …) |
| `stock_actual` | decimal | — | **Solo lectura**. Cambia únicamente al registrar movimientos (§6.2) |
| `stock_minimo` | decimal ≥ 0 | No | Por defecto `0` |

Filtros: `?bajo_stock=true` (solo las que tienen `stock_actual < stock_minimo`), `?nombre=<texto>` (contiene, sin distinguir mayúsculas).
`DELETE`: `409` (`en_uso`) si está en alguna fórmula o tiene movimientos.

```json
// GET /materias-primas/1/ → 200
{ "id_materia_prima": 1, "nombre": "Madera de Roble", "descripcion": "Madera dura de alta calidad.", "unidad_medida": "u", "stock_actual": "28.000", "stock_minimo": "8.000" }
```

### 6.2 `/movimientos-materia-prima/`

Registro histórico: **solo** `GET` (listar y obtener) y `POST`. `PUT`, `PATCH` y `DELETE` → `405`. Para corregir un error se registra un movimiento `ajuste`.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_movimiento` | int | — | Solo lectura |
| `fecha` | datetime | — | Solo lectura. La asigna el servidor |
| `tipo_movimiento` | `"ingreso"` \| `"consumo"` \| `"ajuste"` | Sí | |
| `cantidad` | decimal | Sí | `ingreso` y `consumo`: > 0. `ajuste`: ≠ 0, con signo (negativo resta) |
| `observacion` | string | No | Por defecto `""` |
| `id_materia_prima` | int | Sí | `400` si no existe |
| `id_usuario` | int | — | Solo lectura. Es el usuario autenticado |

Efecto al crear: actualiza `stock_actual` de la materia prima en la misma transacción (`ingreso` suma, `consumo` resta, `ajuste` suma con signo). Si el stock resultante es negativo → `409` (`stock_insuficiente`) y no se registra nada.

Filtros: `?id_materia_prima=1`, `?tipo_movimiento=consumo`, `?desde=2026-09-01`, `?hasta=2026-09-30`. Orden: más reciente primero.

```json
// POST /movimientos-materia-prima/
{ "tipo_movimiento": "ingreso", "cantidad": "50", "observacion": "Compra a proveedor", "id_materia_prima": 1 }

// 201
{ "id_movimiento": 9, "fecha": "2026-10-14T13:45:00Z", "tipo_movimiento": "ingreso", "cantidad": "50.000", "observacion": "Compra a proveedor", "id_materia_prima": 1, "id_usuario": 1 }
```

---

## 7. Productos

### 7.1 `/categorias/`

CRUD estándar.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_categoria` | int | — | Solo lectura |
| `nombre` | string (≤100) | Sí | Único (`400` si ya existe) |

`DELETE`: `409` (`en_uso`) si tiene productos.

### 7.2 `/productos/`

CRUD estándar.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_producto` | int | — | Solo lectura |
| `nombre` | string (≤100) | Sí | |
| `descripcion` | string | No | Por defecto `""` |
| `precio` | decimal ≥ 0 | Sí | 2 decimales |
| `estado` | `"activo"` \| `"inactivo"` \| `"en_produccion"` \| `"pendiente"` | No | Por defecto `"activo"` |
| `stock_actual` | decimal | — | **Solo lectura**. Cambia únicamente con movimientos (§7.4) o al finalizar producción |
| `id_categoria` | int | Sí | `400` si no existe |

Filtros: `?id_categoria=1`, `?estado=activo`, `?nombre=<texto>`.
`DELETE`: borra también su fórmula. `409` (`en_uso`) si tiene movimientos u órdenes de producción; en ese caso se lo pasa a `"inactivo"`.

```json
// GET /productos/1/ → 200
{ "id_producto": 1, "nombre": "Mesa Nórdica", "descripcion": "Mesa de comedor de roble macizo.", "precio": "150000.00", "estado": "activo", "stock_actual": "28.000", "id_categoria": 1 }
```

### 7.3 `/detalles-formula/`

CRUD estándar. Cada registro es **una línea de la receta**: cuánta materia prima hace falta para **una unidad** del producto.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_detalle_formula` | int | — | Solo lectura |
| `id_producto` | int | Sí | `400` si no existe |
| `id_materia_prima` | int | Sí | `400` si no existe |
| `cantidad_necesaria` | decimal > 0 | Sí | En la `unidad_medida` de la materia prima |

Filtros: `?id_producto=1` (la fórmula completa de un producto), `?id_materia_prima=3`.

```json
// GET /detalles-formula/?id_producto=1 → 200
[
  { "id_detalle_formula": 1, "id_producto": 1, "id_materia_prima": 1, "cantidad_necesaria": "1.000" },
  { "id_detalle_formula": 2, "id_producto": 1, "id_materia_prima": 3, "cantidad_necesaria": "15.000" }
]
```

### 7.4 `/movimientos-producto/`

Registro histórico: **solo** `GET` y `POST` (igual que §6.2).

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_movimiento_producto` | int | — | Solo lectura |
| `fecha` | datetime | — | Solo lectura |
| `tipo_movimiento` | `"ingreso"` \| `"venta"` \| `"ajuste"` | Sí | |
| `cantidad` | decimal | Sí | `ingreso` y `venta`: > 0. `ajuste`: ≠ 0, con signo |
| `id_producto` | int | Sí | `400` si no existe |
| `id_usuario` | int | — | Solo lectura. Es el usuario autenticado |

Efecto al crear: actualiza `stock_actual` del producto (`ingreso` suma, `venta` resta, `ajuste` suma con signo). Stock negativo → `409` (`stock_insuficiente`).

Filtros: `?id_producto=1`, `?tipo_movimiento=venta`, `?desde=`, `?hasta=`. Orden: más reciente primero.

---

## 8. Producción

### 8.1 `/estados/`

CRUD estándar. Catálogo precargado por migración:

| `id_estado` | `nombre` |
|---|---|
| 1 | Pendiente |
| 2 | En Produccion |
| 3 | Finalizada |
| 4 | Cancelada |

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_estado` | int | — | Solo lectura |
| `nombre` | string (≤50) | Sí | Único (`400` si ya existe) |

`DELETE`: `409` (`en_uso`) si alguna orden lo usa.

### 8.2 `/ordenes-produccion/`

CRUD estándar.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_orden` | int | — | Solo lectura |
| `fecha_creacion` | datetime | — | Solo lectura. La asigna el servidor |
| `fecha_inicio` | datetime \| null | No | Por defecto `null` |
| `id_estado` | int | No | Por defecto `1` (Pendiente). `400` si no existe |

Filtros: `?id_estado=2`, `?desde=`, `?hasta=` (sobre `fecha_creacion`). Orden: más reciente primero.
`DELETE`: borra también sus detalles. `409` si la orden no está en estado Pendiente.

```json
// POST /ordenes-produccion/
{ "fecha_inicio": null }

// 201
{ "id_orden": 7, "fecha_creacion": "2026-10-14T13:45:00Z", "fecha_inicio": null, "id_estado": 1 }
```

### 8.3 `/detalles-orden-produccion/`

CRUD estándar. Cada registro es un producto dentro de una orden.

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| `id_detalle_produccion` | int | — | Solo lectura |
| `id_orden` | int | Sí | `400` si no existe |
| `id_producto` | int | Sí | `400` si no existe |
| `cantidad_planificada` | decimal > 0 | Sí | |
| `cantidad_producida` | decimal ≥ 0 | No | Por defecto `0`. No puede superar `cantidad_planificada` → `400` |

Filtros: `?id_orden=7`, `?id_producto=1`.

```json
// GET /detalles-orden-produccion/?id_orden=2 → 200
[
  { "id_detalle_produccion": 2, "id_orden": 2, "id_producto": 2, "cantidad_planificada": "15.000", "cantidad_producida": "6.000" }
]
```

---

## 9. Resumen de rutas

| Ruta | Métodos |
|---|---|
| `/auth/login/` | `POST` |
| `/auth/logout/` | `POST` |
| `/auth/me/` | `GET` |
| `/usuarios/`, `/usuarios/{id}/` | CRUD |
| `/materias-primas/`, `/materias-primas/{id}/` | CRUD |
| `/movimientos-materia-prima/`, `/movimientos-materia-prima/{id}/` | `GET`, `POST` |
| `/categorias/`, `/categorias/{id}/` | CRUD |
| `/productos/`, `/productos/{id}/` | CRUD |
| `/detalles-formula/`, `/detalles-formula/{id}/` | CRUD |
| `/movimientos-producto/`, `/movimientos-producto/{id}/` | `GET`, `POST` |
| `/estados/`, `/estados/{id}/` | CRUD |
| `/ordenes-produccion/`, `/ordenes-produccion/{id}/` | CRUD |
| `/detalles-orden-produccion/`, `/detalles-orden-produccion/{id}/` | CRUD |

Todas con el prefijo `/api/v1/`. Hoy todas responden `501 Not Implemented` (o `405` si el método no está permitido).