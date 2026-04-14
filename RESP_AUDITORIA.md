# Informe de Respuesta a Auditoría — Solo a un Click

**Proyecto:** soloaunclick.cl
**Stack:** Express.js + MySQL 8.0 + React 18 + Vite + Tailwind CSS
**VPS:** 158.220.123.58 (Ubuntu 24.04)
**Auditoría realizada:** 2026-03-30
**Correcciones implementadas:** Marzo – Abril 2026
**Última actualización:** 14 de Abril 2026

---

## Resumen Ejecutivo

Se recibió una auditoría de seguridad externa aplicada al backend de Solo a un Click. Tras analizar el código, la mayoría de las vulnerabilidades críticas reportadas **no aplicaban** a este proyecto (ya estaban correctamente implementadas desde el inicio). Sin embargo, se identificaron áreas de mejora reales que fueron corregidas en múltiples sesiones de trabajo.

**Estado final:** ✅ **Auditoría prácticamente completa** — solo quedan 2 ítems menores pendientes.

---

## Fase 1 — Seguridad (Sesión 19 · Marzo 2026)

### ✅ JWT sin valor por defecto hardcodeado
- **Problema:** El JWT_SECRET tenía un fallback hardcodeado en el código.
- **Solución:** Si `JWT_SECRET` no está en las variables de entorno, el servidor se detiene con error fatal. No hay fallback posible.

### ✅ Credenciales de base de datos sin defaults
- **Problema:** Las credenciales MySQL tenían valores por defecto (root sin password).
- **Solución:** El servidor valida que `DB_HOST`, `DB_USER`, `DB_PASS` y `DB_NAME` estén configurados antes de iniciar. Si falta alguno, el proceso se detiene.

### ✅ Expiración de JWT reducida
- **Problema:** Los tokens JWT expiraban en 7 días.
- **Solución:** Expiración reducida a 24 horas.

### ✅ Transacciones en operaciones críticas
- **Problema:** Las funciones de eliminación en cascada ejecutaban múltiples DELETEs en secuencia sin transacción. Si fallaba a mitad, quedaban datos huérfanos.
- **Solución:** Las funciones `deleteListingsByType`, `deleteAllCommerceData` y `deleteAllTurismData` usan `beginTransaction()` + `commit()`/`rollback()`. Los archivos físicos se eliminan DESPUÉS del commit exitoso.
- **También:** Transacciones en creación/edición de listings y operaciones de carruseles.

### ✅ Paginación en endpoints públicos
- **Problema:** Los endpoints podían retornar datasets completos sin límite.
- **Solución:** Paginación en `GET /api/listings` (`?page=1&limit=50`, máx 100). Límite de 200 registros en eventos, locales, tours y portada.

### ✅ Content Security Policy (CSP)
- **Problema:** `contentSecurityPolicy: false` en helmet deshabilitaba completamente CSP.
- **Solución:** CSP configurado con directivas específicas por tipo de recurso.

### ✅ Logging estructurado con Winston
- **Problema:** Solo `console.error` para logging, sin formato estructurado ni persistencia.
- **Solución:** Módulo `logger.js` con Winston. Archivos `logs/error.log` y `logs/combined.log` con rotación automática (5MB, máx 5 archivos). 77 ocurrencias de `console.error` reemplazadas en 15 archivos.

### ✅ Versionamiento de API `/api/v1/`
- **Problema:** Todas las rutas bajo `/api/` sin prefijo de versión. Cambios podrían romper clientes.
- **Solución:** Router centralizado montado en `/api/v1/` con alias `/api/` para compatibilidad. 107 llamadas en 30 archivos frontend actualizadas.

---

## Fase 2 — Base de Datos (Sesión 21 · Abril 2026)

### ✅ Reparación crítica de contraseña MySQL
- **Problema:** La contraseña MySQL estaba rota desde el 9/04 (carácter `!` en bash). La app devolvía "Access denied" en todos los endpoints.
- **Solución:** Recuperación via `skip-grant-tables`. Nueva contraseña `SoloUnClick2026` aplicada en MySQL, `.env`, `ecosystem.config.js` y `CREDENCIALES.md`.

### ✅ 15 índices de rendimiento agregados
- **Problema:** Faltan índices en columnas frecuentemente consultadas.
- **Solución:** Índices compuestos en `listings(tipo, activo)`, `(user_id, activo)`, `(created_at)`, y similares en `turismo_tours`, `turismo_portada`, `eventos`, `page_visits`.

---

## Fase 3 — Integridad y Calidad (Sesión 22 · Abril 2026)

### ✅ Soft delete al cambiar tipo de cuenta
- **Problema:** Al cambiar de cuenta general a turismo (o viceversa), los listings del tipo anterior se eliminaban físicamente.
- **Solución:** Soft delete (`activo=0`, `deleted_at=NOW()`). Los datos se conservan y pueden restaurarse.

### ✅ Validación de categorías contra tabla maestra
- **Problema:** Las categorías se ingresaban como texto libre, sin validar contra las categorías reales del sistema.
- **Solución:** Función `validateCategoria()` en `listings.js` que consulta la tabla `categorias` antes de INSERT/UPDATE.

### ✅ Middleware centralizado de verificación de planes
- **Problema:** La verificación del plan del usuario estaba duplicada en múltiples rutas con lógica inconsistente.
- **Solución:** Middleware `requirePlan(minPlan)` centralizado, aplicado uniformemente en todos los endpoints que requieren plan mínimo.

### ✅ AdminTour conectado a tabla maestra de categorías
- **Problema:** El panel AdminTour leía las categorías desde los datos de portada del usuario en lugar de la tabla maestra.
- **Solución:** Fetch a `/api/v1/categorias?tipo=turismo` desde la tabla maestra.

---

## Fase 4 — Mediano Plazo (Sesión 22 · Abril 2026)

### ✅ Fusión businesses + turismo_negocios
- **Problema:** Los negocios de turismo y los negocios normales guardaban su información en tablas separadas (`turismo_negocios` y `businesses`).
- **Solución:** Todo negocio (turismo o comercio normal) usa la tabla `businesses`. La distinción es por `tipo_cuenta` del usuario. Se agregó columna `ubicacion` a `businesses`. Tabla `turismo_negocios` eliminada (estaba vacía).

### ✅ Tabla `media` unificada
- **Problema:** Las imágenes de listings usaban `listing_images` y las de carruseles usaban `carousel_images`. Dos sistemas para lo mismo.
- **Solución:** Nueva tabla `media(entity_type, entity_id, url, orden)`. `listings.js`, `carousels.js` y `servicios.js` apuntan a `media`. Tablas legacy eliminadas (estaban vacías).

### ✅ Campos JSON a tipo JSON nativo de MySQL
- **Problema:** Campos como `horarios`, `imagenes`, `categorias` se guardaban como TEXT con formato JSON pero MySQL los trataba como texto plano.
- **Solución:** Migrados a tipo `JSON` nativo: `businesses.horarios`, `turismo_tours.imagenes`, `turismo_tours.imagenes_crop`, `turismo_portada.imagenes`, `turismo_portada.categorias`.

---

## Fase 5 — Correcciones Adicionales (14 Abril 2026)

### ✅ Bug DISTINCT + ORDER BY en categorías de barrio y evento
- **Problema:** Las queries de `locales.js` y `eventos.js` usaban `SELECT DISTINCT` con `ORDER BY cb.orden` pero `orden` no estaba en el SELECT. Fallaban silenciosamente desde el 9/04.
- **Solución:** Se agregó `cb.orden` y `ce.orden` al SELECT en ambas queries.

### ✅ Tablas legacy eliminadas de producción
- `listing_images`, `carousel_images`, `turismo_negocios` eliminadas de la base de datos de producción (estaban vacías). Definiciones removidas de `schema_local.sql`.

---

## Categorías de la Auditoría que NO Aplicaban

Las siguientes vulnerabilidades reportadas **no existían** en Solo a un Click ya que el proyecto fue construido con buenas prácticas desde el inicio:

| Vulnerabilidad | Motivo |
|----------------|--------|
| 94% endpoints sin autenticación | Los endpoints privados ya tenían `authMiddleware` JWT |
| Modo DEMO activo en producción | No existe modo demo en el proyecto |
| Contraseñas sin hash (bcrypt) | Bcrypt con salt rounds 10 desde el inicio |
| CORS abierto (`origin: "*"`) | Ya estaba restringido a dominios específicos |
| Sin validación de inputs | `express-validator` ya implementado |
| SQL injection por queries dinámicas | Todas las queries usan parámetros `?` (prepared statements) |
| Socket.io sin autenticación | El proyecto no usa Socket.io |
| Monolito de 4.900 líneas | Las rutas están separadas en 16 archivos por dominio |
| Sin headers de seguridad (helmet) | Helmet ya estaba implementado |
| Sin rate limiting | Tres rate limiters configurados (global, auth, password reset) |

---

## Pendientes Finales

| # | Pendiente | Prioridad | Detalle |
|---|-----------|-----------|---------|
| 1 | **SMTP Gmail** | Media | Configurar App Password de Gmail y setear `SMTP_USER`/`SMTP_PASS` en el VPS para activar la función "olvidé mi contraseña" |
| 2 | **CI/CD Pipeline** | Baja | Automatizar deploy vía GitHub Actions para que cada `git push` despliegue automáticamente al VPS |

---

## Estado de la Base de Datos en Producción

### Tablas activas (24 tablas)
```
users, plans
businesses           ← incluye negocios de turismo y comercio general
listings, listing_sizes, listing_dimensions
media                ← todas las imágenes del sistema
carousels
categorias, subcategorias
turismo_tours, turismo_portada, turismo_pagina
eventos, categorias_evento
locales_barrio, categorias_barrio
analytics, page_visits, site_visits
activity_log, user_sessions, password_resets
```

### Tablas eliminadas
```
listing_images      → reemplazada por media
carousel_images     → reemplazada por media
turismo_negocios    → reemplazada por businesses
```

---

## Historial de Commits Relacionados

| Commit | Descripción |
|--------|-------------|
| `62ee1f4` | Auditoría de seguridad: correcciones backend + frontend API v1 |
| `e2f02d6` | Auditoría punto 1: soft delete al cambiar tipo de cuenta |
| `35e44c4` | Auditoría punto 2: validación de categorías contra tabla maestra |
| `f312764` | Auditoría punto 3: middleware centralizado de verificación de planes |
| `038c54f` | Agregar seed completo de categorías y subcategorías |
| `48ab26a` | Conectar AdminTour a tabla maestra de categorías |
| `250dfc7` | Auditoría mediano plazo: fusionar businesses, unificar media, JSON nativo |
| `0fcf92f` | Actualizar CHANGELOG sesión 22 y migración SQL corregida |
| `4779d24` | Corregir SQL: DISTINCT + ORDER BY en categorias de barrio y evento |
| `bcc4623` | Eliminar tablas legacy: listing_images, carousel_images, turismo_negocios |

---

*Informe generado el 14 de Abril de 2026.*
