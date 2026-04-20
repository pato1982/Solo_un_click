# Diagrama de Base de Datos — Solo a un Click (v2 · Homologado)

**Fecha:** 19 de Abril 2026
**Motor:** MySQL 8.0
**Total de tablas:** 25
**Branch:** `feature/db-schema-v2`
**Estado:** Este documento refleja la **realidad operativa** de producción (`158.220.123.58`) verificada por inspección directa de `information_schema`.

> 🔄 Sustituye a `diagrama_BD.md` (15-abr). Cambios clave: +2 tablas de auth, +9 campos reales en listings, FK de categorías, FK dual en turismo_*, patrones mixtos de imágenes.

---

## Mapa general por módulo

| Módulo | Tablas | Scope FK | Imágenes |
|---|---|---|---|
| 1. Config | plans, categorias, subcategorias, categorias_evento, categorias_barrio | — | — |
| 2. Usuarios & Negocios | users, businesses | user_id | — |
| 3. Publicaciones | listings, listing_sizes, listing_dimensions | **user_id** | tabla `media` |
| 4. Carruseles | carousels | **user_id** | tabla `media` |
| 5. Turismo | turismo_tours, turismo_portada, turismo_pagina | **user_id** (+FK dual obsoleta) | **JSON inline** |
| 6. Editorial | eventos, locales_barrio | — | varchar URL |
| 7. Analytics & Auth | analytics, page_visits, site_visits, user_sessions, activity_log, password_resets, **refresh_tokens**, **mfa_pending_tokens** | user_id | — |
| 8. Deuda técnica | **listing_images** (tabla muerta, 0 filas) | — | candidate DROP |

---

## Módulo 1 — Usuarios y Negocios

```mermaid
erDiagram
    plans {
        int id PK
        varchar nombre
        decimal precio
        int max_listings
        tinyint tiene_pagina
        tinyint tiene_destacados
        tinyint tiene_estadisticas
        tinyint activo
    }
    users {
        int id PK
        int plan_id FK
        enum tipo_cuenta "general|turismo"
        varchar nombre
        varchar email
        varchar password
        varchar telefono
        varchar comuna
        varchar direccion
        tinyint vende_productos
        tinyint ofrece_servicios
        tinyint ofrece_arriendos
        int failed_attempts
        timestamp locked_until
        tinyint activo
    }
    businesses {
        int id PK
        int user_id FK
        varchar tipo "general|turismo"
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
        tinyint activo
        timestamp deleted_at
    }
    plans ||--o{ users : "plan asignado"
    users ||--o| businesses : "1 a 1"
```

**Notas:**
- `businesses.tipo` discrimina `general` vs `turismo` (no documentado previamente).
- `users` tiene control de bloqueo por intentos fallidos (`failed_attempts`, `locked_until`).

---

## Módulo 2 — Publicaciones (Listings)

```mermaid
erDiagram
    listings {
        int id PK
        int user_id FK
        enum tipo "producto|servicio|arriendo"
        varchar seccion
        varchar nombre
        text descripcion
        decimal precio
        decimal precio_antes
        decimal precio_original
        varchar categoria "legado - varchar"
        varchar subcategoria "legado - varchar"
        int categoria_id FK "nuevo - FK"
        int subcategoria_id FK "nuevo - FK"
        varchar badge
        varchar genero
        int carousel_posicion
        int carousel_orden
        int banner_orden
        tinyint destacado
        tinyint activo
        timestamp deleted_at
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
    media {
        int id PK
        varchar entity_type "listing|carousel"
        int entity_id
        varchar url
        int orden
    }
    users ||--o{ listings : "publica"
    listings ||--o{ listing_sizes : "tallas"
    listings ||--o| listing_dimensions : "medidas"
    listings ||--o{ media : "imagenes"
    categorias ||--o{ subcategorias : "jerarquía"
    categorias ||--o{ listings : "clasifica (FK nuevo)"
```

**Estado dual de categorías:**
- `categoria` (varchar) y `categoria_id` (FK) coexisten.
- Backend escribe ambas. Frontend aún usa solo `categoria` (varchar).
- **Dirección deseada:** completar FK, dejar `categoria_id` como única fuente. Ver ROADMAP.

---

## Módulo 3 — Carruseles

```mermaid
erDiagram
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

- Max 8 imágenes por carousel.
- Hard delete de `media` + archivo en disco cuando se elimina imagen.

---

## Módulo 4 — Turismo

> ⚠️ Patrón de imágenes **distinto** al resto del sistema: usa JSON inline (no tabla `media`).

```mermaid
erDiagram
    turismo_tours {
        int id PK
        int user_id FK
        varchar nombre
        varchar categoria "varchar"
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
        int user_id FK "UNIQUE (1 por usuario)"
        varchar nombre
        text descripcion
        json imagenes
        json imagenes_crop
        json categorias
    }
    turismo_pagina {
        int id PK
        int user_id FK "UNIQUE (1 por usuario)"
        varchar titulo_superior
        text texto_superior
        varchar imagen_superior
        json crop_superior
        varchar titulo_inferior
        text texto_inferior
        varchar imagen_inferior
        json crop_inferior
    }
    users ||--o{ turismo_tours : "max 12"
    users ||--o| turismo_portada : "1"
    users ||--o| turismo_pagina : "1 (plan Premium)"
```

**⚠️ Deuda — FK dual:** Las 3 tablas tienen 2 foreign keys simultáneas en `user_id`: una a `users.id` y otra huérfana a `businesses.user_id`. El código solo usa la primera. La segunda es basura heredada — limpiar en próxima migración.

---

## Módulo 5 — Eventos y Locales (editorial)

```mermaid
erDiagram
    categorias_evento {
        int id PK
        varchar nombre
        varchar icono
    }
    eventos {
        int id PK
        int categoria_evento_id FK
        varchar titulo
        varchar imagen
        text imagen_crop
        varchar fecha
        varchar ubicacion
        varchar precio
        tinyint activo
    }
    categorias_barrio {
        int id PK
        varchar nombre
    }
    locales_barrio {
        int id PK
        int categoria_barrio_id FK
        varchar nombre
        varchar direccion
        varchar imagen
        int orden
        tinyint activo
    }
    categorias_evento ||--o{ eventos : "clasifica"
    categorias_barrio ||--o{ locales_barrio : "clasifica"
```

---

## Módulo 6 — Analytics, Sesiones y Auth

```mermaid
erDiagram
    users {
        int id PK
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
    refresh_tokens {
        int id PK
        int user_id FK
        varchar token_hash
        timestamp expires_at
        timestamp revoked_at
    }
    mfa_pending_tokens {
        int id PK
        int user_id FK
        varchar token_hash
        timestamp expires_at
    }
    users ||--o{ analytics : ""
    users ||--o{ page_visits : ""
    users ||--o{ user_sessions : ""
    users ||--o{ activity_log : ""
    users ||--o{ password_resets : ""
    users ||--o{ refresh_tokens : "rotación JWT"
    users ||--o{ mfa_pending_tokens : "flujo MFA"
```

**Nuevas tablas (no documentadas antes):**
- `refresh_tokens` — rotación JWT con revocación.
- `mfa_pending_tokens` — tokens temporales durante flujo MFA.

---

## Patrones de imágenes (homologado)

| Entidad | Dónde se guardan | Razón |
|---|---|---|
| `listings` | Tabla `media` (polimórfica, N imágenes) | N variable, requiere orden |
| `carousels` | Tabla `media` (polimórfica, max 8) | Requiere orden y borrado masivo |
| `turismo_tours` | JSON en `imagenes` + `imagenes_crop` | Array fijo pequeño (≤3), incluye metadata de recorte |
| `turismo_portada` | JSON en `imagenes` + `imagenes_crop` | Array fijo (=3), layout "fan" |
| `turismo_pagina` | Columnas varchar `imagen_superior/inferior` + JSON `crop_*` | 2 imágenes fijas con metadata |
| `eventos` / `locales_barrio` | Columna varchar `imagen` | 1 imagen, editorial |

**Conclusión:** El patrón mixto es **intencional y óptimo** para los casos de uso. No se consolida todo en `media`.

---

## Deuda técnica documentada

| # | Deuda | Acción recomendada |
|---|---|---|
| D-1 | Tabla `listing_images` (0 filas, sin uso en código) | `DROP TABLE listing_images` |
| D-2 | FK dual en `turismo_tours/portada/pagina.user_id` hacia `businesses.user_id` | Drop de la FK redundante |
| D-3 | Columnas `listings.categoria`/`subcategoria` (varchar) | Migrar frontend a FK, luego drop |
| D-4 | Migración `user_id` → `business_id` | Pospuesta (ver ROADMAP) |

---

*Homologado contra: BD real de producción, backend `backend/routes/*.js`, frontend `src/**/*.jsx`.*
