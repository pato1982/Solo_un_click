# RESOLUCIÓN AUDITORÍA BACKEND 2 — Solo a un Click
**Fecha original:** 15 de Abril 2026
**Última actualización:** 20 de Abril 2026 (post-Batch B)
**Branch:** `feature/db-schema-v2`
**Estado:** ⚠️ Auditoría re-verificada contra código real — no todos los hallazgos estaban cerrados

---

## RESUMEN REAL (re-auditado 2026-04-20)

| Tipo | Confirmados aplicados | Parciales | No aplicados | No verificables |
|------|---------------------|-----------|--------------|-----------------|
| Código (hallazgos) | 30 + 9 (Batch A) | 7 | 2 | 2 |
| Base de datos | 1 + Batch B (5 tablas) | 0 | 0 | 0 |
| Infraestructura | 2 | 0 | 0 | 0 |
| Históricos | 0 | 0 | 0 | 2 |

**Batch A (commit `49c8a19`):** A-05, A-16, C-12, A-14 parcial, M-06, B-01/C-13, B-03, A-04, M-05, B-05/C-07
**Batch B (commit `19af513`):** Migración `user_id → business_id` en listings + carousels + turismo_*, refactor de 5 routers backend con `attachBusinessId` middleware

### Pendientes residuales
- M-12 (límite imágenes en listings), M-01 (sanitización inconsistente), A-15 (cache categoría), B-02 (audit originalname), A-14/M-05 resto parciales

---

## SPRINT 1 — CRÍTICOS (código)

### C-04 / C-07 — `servidor.js`: exec() reemplazado con fs.promises
**Archivo:** `backend/routes/servidor.js`
- Eliminado uso de `du -sb` y `find ... -exec du -sb` vía shell
- Reemplazado con funciones nativas `getDirSize()` y `getSubdirSizes()` usando `fs.promises.readdir()` + `fs.promises.stat()`
- El `df` para estadísticas de disco se mantiene (sin alternativa nativa)

### C-05 — `servicios.js`: N+1 resuelto
**Archivo:** `backend/routes/servicios.js`
- Antes: 1 query por negocio (100 negocios = 101 queries por request)
- Ahora: 2 queries totales para todos los negocios (1 para negocios, 1 para imágenes)
- La respuesta al frontend es idéntica

### C-08 — `carousels.js`: requirePlan(2) agregado
**Archivo:** `backend/routes/carousels.js`
- Importado `requirePlan` desde `planMiddleware`
- Agregado `requirePlan(2)` a: POST `/:posicion`, PUT `/:posicion/reorder`, DELETE `/:posicion/images/:imageId`

### C-09 — `pagina.js`: requirePlan(3) en PATCH /crop
**Archivo:** `backend/routes/pagina.js`
- Agregado `requirePlan(3)` al endpoint `PATCH /:id/crop`
- POST y PUT ya tenían la validación

### C-10 — `tours.js`: soft delete
**Archivo:** `backend/routes/tours.js`
- Antes: `DELETE FROM turismo_tours WHERE id = ? AND user_id = ?`
- Ahora: `UPDATE turismo_tours SET activo = 0 WHERE id = ? AND user_id = ?`

### C-11 — `portada.js`: soft delete
**Archivo:** `backend/routes/portada.js`
- Antes: `DELETE FROM turismo_portada WHERE id = ? AND user_id = ?`
- Ahora: `UPDATE turismo_portada SET activo = 0 WHERE id = ? AND user_id = ?`

### C-03 — `analytics.js`: validación de user_id
**Archivo:** `backend/routes/analytics.js`
- Agregada query de verificación antes de registrar cualquier evento:
  ```js
  SELECT id FROM users WHERE id = ? AND activo = 1
  ```
- Si el usuario no existe o está inactivo, devuelve 400

---

## SPRINT 2 — ALTOS (código)

### A-08 / A-10 / A-11 / M-08 — `server.js`: Helmet completo
**Archivo:** `backend/server.js`
- Eliminado `unsafe-inline` de `scriptSrc`
- Agregado **HSTS**: maxAge 1 año, includeSubDomains, preload
- Agregado **X-Frame-Options**: deny (protección clickjacking)
- Agregado **Referrer-Policy**: strict-origin-when-cross-origin

### C-06 — `analytics.js`: queries paralelas
**Archivo:** `backend/routes/analytics.js`
- Las 7 queries del dashboard ahora se ejecutan con `Promise.all()`
- Tiempo estimado: de ~500ms secuencial a ~100ms paralelo

### A-17 — `listings.js` / `tours.js`: validación de precio
**Archivos:** `backend/routes/listings.js`, `backend/routes/tours.js`
- Agregada validación `parseFloat(precio) < 0` en POST y PUT de ambos archivos
- Devuelve 400 con mensaje claro si el precio es negativo

### A-18 — `business.js`: validación de nombre
**Archivo:** `backend/routes/business.js`
- Agregada validación de nombre no vacío y mínimo 2 caracteres en POST

### C-01 — `carousels.js`: verificación de propiedad en reorder
**Archivo:** `backend/routes/carousels.js`
- Antes de reordenar, se verifica que todos los `imageIds` enviados pertenezcan al carousel del usuario
- Si algún ID no pertenece, devuelve 403

### A-07 — `server.js`: validación de JWT_SECRET al arrancar
**Archivo:** `backend/server.js`
- El servidor lanza error fatal si `JWT_SECRET` no está definido o tiene menos de 32 caracteres
- Evita arrancar con un secreto inseguro

### A-09 — `server.js`: rate limit para uploads
**Archivo:** `backend/server.js`
- Agregado `uploadLimiter`: máximo 20 uploads por IP por minuto
- Aplicado a `/api/upload` y `/api/v1/upload`

---

## SPRINT 3 — PENDIENTES DE CÓDIGO

### C-02 — `pagina.js`: filtro de usuarios activos
**Archivo:** `backend/routes/pagina.js`
- Endpoint público `GET /public/:userId` ahora hace JOIN con `users`
- Solo devuelve la página si `u.activo = 1`
- Usuarios baneados o suspendidos dejan de aparecer públicamente

### A-01 — `business.js`: plan_id removido de respuesta pública
**Archivo:** `backend/routes/business.js`
- Reemplazado `SELECT b.*, u.plan_id` por listado explícito de columnas
- `plan_id` ya no se expone en el endpoint público `GET /:userId`

---

## INFRAESTRUCTURA Y BASE DE DATOS

### Índice MySQL `idx_media_entity`
- **Estado:** Ya existía en producción ✅
- Verificado con `SELECT INDEX_NAME FROM information_schema.STATISTICS`

### pm2-logrotate instalado en VPS
- Instalado módulo `pm2-logrotate v3.0.0`
- Configuración aplicada:
  - Tamaño máximo por archivo: **50MB**
  - Retención: **14 días**
  - Compresión: **activada**
  - Rotación: **diaria (00:00)**

### `.env.example` creado
- **Archivo:** `backend/.env.example`
- Documenta todas las variables requeridas: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`, `NODE_ENV`, `LOG_LEVEL`, `SMTP_*`, `SITE_URL`

---

## ARCHIVOS MODIFICADOS

| Archivo | Cambios |
|---------|---------|
| `backend/server.js` | Helmet completo, JWT check, upload rate limit |
| `backend/routes/carousels.js` | requirePlan(2), ownership check en reorder |
| `backend/routes/pagina.js` | requirePlan(3) en PATCH, filtro activo en GET público |
| `backend/routes/tours.js` | Soft delete, validación precio |
| `backend/routes/portada.js` | Soft delete |
| `backend/routes/analytics.js` | Validar user_id, queries paralelas |
| `backend/routes/servicios.js` | N+1 resuelto |
| `backend/routes/servidor.js` | exec() reemplazado con fs.promises |
| `backend/routes/listings.js` | Validación precio |
| `backend/routes/business.js` | Validación nombre, plan_id removido del GET público |
| `backend/.env.example` | Nuevo archivo de referencia |

---

## PENDIENTE — HISTÓRICOS (a resolver en próxima sesión)

| # | Qué | Descripción |
|---|-----|-------------|
| 1 | **SMTP Gmail** | Recuperación de contraseña no funciona en producción |
| 2 | **CI/CD pipeline** | Deploys son manuales vía SSH + PM2 restart |
