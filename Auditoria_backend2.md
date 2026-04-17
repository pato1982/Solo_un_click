# AUDITORÍA BACKEND 2 — Solo a un Click
**Fecha:** 15 de Abril 2026
**Equipo:** Soledad (Seguridad) · Auditor Backend · Auditor Infra · Valentina (Rendimiento) · Camila (QA)
**Branch de trabajo:** `fix/auditoria-abril-2026`

---

## RESUMEN

| Severidad | Cantidad |
|-----------|----------|
| 🔴 CRÍTICO | 13 |
| 🟠 ALTO | 20 |
| 🟡 MEDIO | 12 |
| 🟢 BAJO | 5 |
| **Total** | **50** |

---

## HALLAZGOS CRÍTICOS (13)

| ID | Archivo | Problema |
|----|---------|----------|
| C-01 | `carousels.js` | Reordenar imágenes sin verificar que pertenezcan al usuario |
| C-02 | `pagina.js` | GET público no filtra usuarios baneados/inactivos |
| C-03 | `analytics.js` | Endpoint acepta cualquier `user_id` del body sin validar |
| C-04 | `servidor.js` | `exec()` shell con interpolación de variables (riesgo de inyección) |
| C-05 | `servicios.js` | N+1 masivo: 1 query por negocio (100+ queries por request) |
| C-06 | `analytics.js` | 7 queries secuenciales en el dashboard (350–700ms) |
| C-07 | `servidor.js` | `exec()` bloquea event loop en directorios grandes |
| C-08 | `carousels.js` | POST/PUT/DELETE sin `requirePlan(2)` — usuarios gratis acceden a carousels |
| C-09 | `pagina.js` | PATCH `/crop` sin `requirePlan(3)` — usuarios plan 2 editan página Premium |
| C-10 | `tours.js` | DELETE físico en lugar de soft delete — datos perdidos irreversiblemente |
| C-11 | `portada.js` | DELETE físico en lugar de soft delete |
| C-12 | `carousels.js` | GET sin filtro de plan — carousels visibles tras downgrade |
| C-13 | `tours.js` | PUT no verifica límite de 12 tours al reactivar |

---

## HALLAZGOS ALTOS (20)

| ID | Archivo | Problema |
|----|---------|----------|
| A-01 | `business.js` | GET público expone `plan_id` (información de facturación) |
| A-02 | `servidor.js` | `X-Forwarded-For` falsificable en logs |
| A-03 | `tours.js` | Acepta precios negativos |
| A-04 | `pagina.js` | Acepta URLs de imagen de dominios externos |
| A-05 | `carousels.js` | `parseInt()` sin radix (base) |
| A-06 | `server.js` | Stack trace completo expuesto en logs PM2 |
| A-07 | `server.js` | `JWT_SECRET` sin validación de longitud mínima al arrancar |
| A-08 | `server.js` | CSP con `unsafe-inline` en scriptSrc |
| A-09 | `upload.js` | Sin rate limit — posible llenado de disco |
| A-10 | `server.js` | HSTS no configurado |
| A-11 | `server.js` | X-Frame-Options no configurado (clickjacking) |
| A-12 | BD `media` | Índice `idx_media_entity` faltante (full scan en imágenes) |
| A-13 | `carousels.js` | Loop secuencial para obtener imágenes (anti-patrón) |
| A-14 | `listings.js` / `servicios.js` | `SELECT *` trae datos innecesarios |
| A-15 | `listings.js` | Query de validación de categoría en cada POST |
| A-16 | `locales.js` | `ORDER BY RAND()` sin índice (200–500ms) |
| A-17 | `listings.js` / `tours.js` | Precios negativos permitidos |
| A-18 | `business.js` | Nombre de negocio vacío o solo espacios permitido |
| A-19 | `business.js` | Inconsistencia slogan: frontend 40 palabras vs backend 10 |
| A-20 | `analytics.js` | `event_type` acepta strings arbitrarios (ya tenía whitelist parcial) |

---

## HALLAZGOS MEDIOS (12)

| ID | Archivo | Problema |
|----|---------|----------|
| M-01 | `business.js` | Sanitización inconsistente (algunos campos sin `.escape()`) |
| M-02 | `turismo.js` / `tours.js` | JSON.parse con catch silencioso al usuario |
| M-03 | `portada.js` | Race condition al actualizar imágenes (sin transacción) |
| M-04 | Proyecto | Sin archivo `.env.example` |
| M-05 | `server.js` | CORS permite HTTP (debería ser solo HTTPS en producción) |
| M-06 | `package.json` | Sin campo `engines` (versión de Node.js) |
| M-07 | VPS | Sin rotación de logs PM2 (crecen indefinidamente) |
| M-08 | `server.js` | `Referrer-Policy` no configurado |
| M-09 | `db.js` | `connectionLimit: 10` insuficiente bajo carga |
| M-10 | Rutas con transacciones | Riesgo de connection leak si falta `finally { conn.release() }` |
| M-11 | `listings.js` | JOIN de 3 tablas sin índice en media |
| M-12 | `upload.js` / rutas | Sin límite de imágenes por entidad |
| M-13 | `turismo.js` / `business.js` | JSON malformado produce error 500 silencioso |

---

## HALLAZGOS BAJOS (5)

| ID | Archivo | Problema |
|----|---------|----------|
| B-01 | `tours.js` | Límite de 12 tours hardcodeado (no lee de tabla `plans`) |
| B-02 | `upload.js` | `originalname` de multer sin sanitizar en logs |
| B-03 | `db.js` | Conexión MySQL sin SSL |
| B-04 | `passwordReset.js` | Email de recuperación sin reintentos |
| B-05 | `servidor.js` | `df` sigue usando `exec()` (sin alternativa nativa) |

---

## PENDIENTES HISTÓRICOS (anteriores a esta auditoría)

| # | Qué | Estado |
|---|-----|--------|
| 1 | SMTP Gmail — recuperación de contraseña | ⏳ Pendiente |
| 2 | CI/CD pipeline — deploys manuales vía SSH | ⏳ Pendiente |
