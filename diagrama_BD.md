# Diagrama de Base de Datos — Solo a un Click

**Total de tablas:** 24
**Motor:** MySQL 8.0
**Última actualización:** 15 de Abril 2026

---

## Módulo 1 — Usuarios y Negocios (núcleo)

> El centro del sistema. Todo usuario tiene un plan y puede tener un negocio asociado.

```mermaid
erDiagram
    plans {
        int id PK
        varchar nombre
        decimal precio
        int max_listings
        tinyint activo
    }

    users {
        int id PK
        int plan_id FK
        enum tipo_cuenta
        varchar nombre
        varchar email
        varchar password
        varchar telefono
        varchar comuna
        tinyint activo
    }

    businesses {
        int id PK
        int user_id FK
        varchar nombre_negocio
        varchar slogan
        text descripcion
        varchar direccion
        varchar ubicacion
        varchar whatsapp
        varchar telefono
        varchar correo
        varchar facebook
        varchar instagram
        json horarios
        varchar logo
        varchar banner
        tinyint activo
        timestamp deleted_at
    }

    plans ||--o{ users : "tiene"
    users ||--o| businesses : "perfil de negocio"
```

---

## Módulo 2 — Publicaciones (Listings)

> Productos, servicios y arriendos publicados por los usuarios. Las imágenes van a la tabla `media`.

```mermaid
erDiagram
    users {
        int id PK
        varchar nombre
        enum tipo_cuenta
    }

    categorias {
        int id PK
        enum tipo
        varchar nombre
    }

    subcategorias {
        int id PK
        int categoria_id FK
        varchar nombre
    }

    listings {
        int id PK
        int user_id FK
        enum tipo
        varchar nombre
        text descripcion
        decimal precio
        varchar categoria
        varchar subcategoria
        varchar badge
        int carousel_posicion
        int banner_orden
        tinyint activo
    }

    listing_sizes {
        int id PK
        int listing_id FK
        varchar tipo_talla
        varchar valor
    }

    listing_dimensions {
        int id PK
        int listing_id FK
        decimal alto
        decimal ancho
        decimal profundidad
    }

    media {
        int id PK
        varchar entity_type
        int entity_id
        varchar url
        int orden
    }

    users ||--o{ listings : "publica"
    categorias ||--o{ subcategorias : "tiene"
    listings ||--o{ listing_sizes : "tallas"
    listings ||--o| listing_dimensions : "medidas"
    listings ||--o{ media : "imagenes (entity_type=listing)"
```

---

## Módulo 3 — Carruseles

> Banners de imágenes configurables por usuario. Las imágenes también van a `media`.

```mermaid
erDiagram
    users {
        int id PK
        varchar nombre
    }

    carousels {
        int id PK
        int user_id FK
        varchar nombre
        int posicion
    }

    media {
        int id PK
        varchar entity_type
        int entity_id
        varchar url
        int orden
    }

    users ||--o{ carousels : "tiene"
    carousels ||--o{ media : "imagenes (entity_type=carousel)"
```

---

## Módulo 4 — Turismo

> Módulo independiente para cuentas de tipo turismo. Tres tablas: tours, portada de la empresa y página de contenido.

```mermaid
erDiagram
    users {
        int id PK
        enum tipo_cuenta
    }

    businesses {
        int id PK
        int user_id FK
        varchar nombre_negocio
        varchar ubicacion
        json horarios
        tinyint activo
    }

    turismo_tours {
        int id PK
        int user_id FK
        varchar nombre
        varchar categoria
        varchar ubicacion
        text detalle
        decimal precio
        decimal precio_antes
        varchar imagen_principal
        json imagenes
        json imagenes_crop
        tinyint activo
    }

    turismo_portada {
        int id PK
        int user_id FK
        varchar nombre
        text descripcion
        json imagenes
        json categorias
    }

    turismo_pagina {
        int id PK
        int user_id FK
        varchar titulo_superior
        text texto_superior
        varchar imagen_superior
        varchar titulo_inferior
        text texto_inferior
        varchar imagen_inferior
    }

    users ||--o| businesses : "negocio turismo"
    users ||--o{ turismo_tours : "tours"
    users ||--o| turismo_portada : "portada empresa"
    users ||--o| turismo_pagina : "pagina contenido"
```

---

## Módulo 5 — Eventos y Locales

> Contenido editorial gestionado por los programadores del sitio (no por usuarios).

```mermaid
erDiagram
    categorias_evento {
        int id PK
        varchar nombre
        varchar icono
    }

    eventos {
        int id PK
        varchar titulo
        varchar imagen
        varchar fecha
        varchar ubicacion
        varchar precio
        int categoria_evento_id FK
        tinyint activo
        text imagen_crop
    }

    categorias_barrio {
        int id PK
        varchar nombre
    }

    locales_barrio {
        int id PK
        varchar nombre
        varchar direccion
        int categoria_barrio_id FK
        varchar imagen
        int orden
        tinyint activo
    }

    categorias_evento ||--o{ eventos : "clasifica"
    categorias_barrio ||--o{ locales_barrio : "clasifica"
```

---

## Módulo 6 — Analytics y Sistema

> Registro de actividad, visitas, sesiones y seguridad. Todo apunta a `users` pero con FK opcional.

```mermaid
erDiagram
    users {
        int id PK
        varchar nombre
        varchar email
    }

    analytics {
        int id PK
        int user_id FK
        varchar event_type
        int listing_id
        timestamp created_at
    }

    page_visits {
        int id PK
        int user_id FK
        varchar visitor_ip
        varchar pagina
        timestamp created_at
    }

    site_visits {
        int id PK
        varchar ip
        varchar pagina
        text user_agent
        timestamp created_at
    }

    user_sessions {
        int id PK
        int user_id FK
        varchar ip
        text user_agent
        timestamp created_at
    }

    activity_log {
        int id PK
        int user_id FK
        varchar accion
        text detalles
        varchar ip
        timestamp created_at
    }

    password_resets {
        int id PK
        int user_id FK
        varchar token
        timestamp expires_at
    }

    users ||--o{ analytics : "genera"
    users ||--o{ page_visits : "genera"
    users ||--o{ user_sessions : "genera"
    users ||--o{ activity_log : "genera"
    users ||--o{ password_resets : "solicita"
```

---

## Resumen de Relaciones

| Tabla | Se conecta con | Tipo |
|-------|---------------|------|
| `plans` | `users` | 1 plan → muchos usuarios |
| `users` | `businesses` | 1 usuario → 1 negocio |
| `users` | `listings` | 1 usuario → muchos listings |
| `users` | `carousels` | 1 usuario → muchos carruseles |
| `users` | `turismo_tours` | 1 usuario → muchos tours |
| `users` | `turismo_portada` | 1 usuario → 1 portada |
| `users` | `turismo_pagina` | 1 usuario → 1 página |
| `categorias` | `subcategorias` | 1 categoría → muchas subcategorías |
| `listings` | `listing_sizes` | 1 listing → muchas tallas |
| `listings` | `listing_dimensions` | 1 listing → 1 medida |
| `listings` | `media` | 1 listing → muchas imágenes (polimórfica) |
| `carousels` | `media` | 1 carrusel → muchas imágenes (polimórfica) |
| `categorias_evento` | `eventos` | 1 categoría → muchos eventos |
| `categorias_barrio` | `locales_barrio` | 1 categoría → muchos locales |
| `users` | `analytics`, `page_visits`, `user_sessions`, `activity_log`, `password_resets` | 1 usuario → muchos registros |

### Nota sobre `media` (tabla polimórfica)
La tabla `media` no tiene FK directa. En cambio usa dos campos:
- `entity_type` — indica a qué tabla pertenece (`'listing'` o `'carousel'`)
- `entity_id` — indica el ID del registro en esa tabla

Esto permite que una sola tabla de imágenes sirva para múltiples entidades.
