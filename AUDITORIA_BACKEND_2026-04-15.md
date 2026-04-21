# AUDITORÍA COMPLETA BACKEND — Solo a un Click
**Fecha:** 15 de Abril 2026
**Auditora Jefa:** Soledad (Seguridad)
**Equipo:** Auditor Backend · Auditor Infra · Valentina (Rendimiento) · Camila (QA)
**Alcance:** 16 archivos de rutas, ~75 endpoints, Express.js + MySQL 8.0.45

---

## RESUMEN EJECUTIVO

| Severidad | Cantidad | Depts. involucrados |
|-----------|----------|---------------------|
| 🔴 CRÍTICO | 13 | Backend, Infra, Rendimiento, QA |
| 🟠 ALTO | 20 | Backend, Infra, Rendimiento, QA |
| 🟡 MEDIO | 12 | Backend, Infra, Rendimiento |
| 🟢 BAJO | 5 | Backend, Infra |
| **Total** | **50** | |

**Prioridad inmediata:** Los 13 hallazgos CRÍTICOS deben resolverse antes del próximo deploy a producción. Los más urgentes son la inyección de comandos en `servidor.js` y la falta de validación de planes en `carousels.js`.

---

## PARTE I — SEGURIDAD (Auditor Backend)

### [CRÍTICO] C-01 — Reordenamiento de imágenes de carousel sin verificar propiedad

**Ubicación:** `backend/routes/carousels.js` — endpoint PUT /api/carousels/reorder
**Descripción:** El endpoint acepta un array `imageIds` y los reordena, pero no verifica que las imágenes pertenezcan al usuario autenticado.
**Riesgo:** Usuario A puede reordenar (y potencialmente corromper) imágenes del carousel de Usuario B enviando IDs ajenos.
**Remediación:**
```js
// Antes de ejecutar el UPDATE, verificar propiedad:
const [check] = await pool.query(
  'SELECT id FROM media WHERE id IN (?) AND entity_id IN (SELECT id FROM carousels WHERE user_id = ?)',
  [imageIds, req.userId]
);
if (check.length !== imageIds.length) {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```
**Referencia OWASP:** A01:2021 — Broken Access Control

---

### [CRÍTICO] C-02 — Endpoint público de `pagina.js` sin filtro `activo`

**Ubicación:** `backend/routes/pagina.js` — GET /api/pagina/:userId
**Descripción:** El endpoint público devuelve la página de cualquier usuario sin verificar `activo=1`. Usuarios con cuenta desactivada siguen siendo visibles en la plataforma.
**Riesgo:** Exposición de contenido de usuarios baneados/suspendidos.
**Remediación:**
```js
const [rows] = await pool.query(
  'SELECT p.* FROM turismo_pagina p JOIN users u ON u.id = p.user_id WHERE p.user_id = ? AND u.activo = 1',
  [userId]
);
```
**Referencia OWASP:** A01:2021 — Broken Access Control

---

### [CRÍTICO] C-03 — `analytics.js` endpoint público acepta cualquier `user_id`

**Ubicación:** `backend/routes/analytics.js` — POST /api/analytics/event
**Descripción:** El evento de analytics acepta `user_id` directamente del body sin autenticación. Un atacante puede registrar eventos como cualquier usuario.
**Riesgo:** Manipulación de estadísticas, inflación artificial de métricas de otros negocios.
**Remediación:** Ignorar el `user_id` del body; usar `req.userId` del token si el usuario está autenticado, o dejar `null` para visitas anónimas.
**Referencia OWASP:** A01:2021 — Broken Access Control

---

### [ALTO] A-01 — `business.js` expone `plan_id` en respuesta pública

**Ubicación:** `backend/routes/business.js` — GET /api/business/public/:id
**Descripción:** La respuesta pública del negocio incluye `plan_id`, revelando el plan de suscripción del usuario.
**Riesgo:** Información sensible de facturación expuesta. Competidores pueden identificar el plan de otros.
**Remediación:** Excluir `plan_id` del SELECT o del objeto de respuesta.

---

### [ALTO] A-02 — `servidor.js` X-Forwarded-For falsificable en logs

**Ubicación:** `backend/routes/servidor.js` — middleware de IP
**Descripción:** Se usa `req.headers['x-forwarded-for']` directamente para registrar IPs sin validar que venga de un proxy confiable.
**Riesgo:** Un atacante puede falsificar su IP en todos los logs enviando el header arbitrario, evadiendo bans por IP.
**Remediación:** Configurar `app.set('trust proxy', 1)` solo si hay un proxy real delante, o implementar whitelist de IPs de proxy confiables.

---

### [ALTO] A-03 — `tours.js` acepta precios negativos

**Ubicación:** `backend/routes/tours.js` — POST/PUT
**Descripción:** No hay validación de que `precio` sea un número positivo.
**Riesgo:** Tours publicados con precios negativos; inconsistencia contable.
**Remediación:** `body('precio').isFloat({ min: 0 })` en el validador de express-validator.

---

### [ALTO] A-04 — `pagina.js` no valida que URLs de imagen pertenezcan al servidor

**Ubicación:** `backend/routes/pagina.js` — POST/PUT
**Descripción:** Los campos `imagen_superior` e `imagen_inferior` aceptan cualquier URL sin verificar dominio.
**Riesgo:** Almacenamiento de URLs de servidores externos; riesgo de hotlinking, SSRF indirecto.
**Remediación:** Validar que las URLs comiencen con el dominio del servidor (`https://soloaunclick.cl/uploads/`).

---

### [ALTO] A-05 — `carousels.js` parseInt débil en validación de IDs

**Ubicación:** `backend/routes/carousels.js`
**Descripción:** Se usa `parseInt()` sin base (radix) para parsear IDs, lo que puede producir resultados inesperados con strings como `"08"` (octal en ambientes legacy).
**Remediación:** Usar `parseInt(id, 10)` explícitamente o `Number(id)` con validación `isNaN`.

---

### [MEDIO] M-01 — Sanitización inconsistente en `business.js`

**Ubicación:** `backend/routes/business.js`
**Descripción:** Algunos campos usan `.trim().escape()` y otros solo `.trim()`. Inconsistencia que puede dejar XSS en campos no escapados.
**Remediación:** Aplicar `.escape()` a todos los campos de texto libre.

---

### [MEDIO] M-02 — JSON.parse con catch silencioso en rutas de turismo

**Ubicación:** `backend/routes/turismo.js`, `tours.js`
**Descripción:** Cuando `JSON.parse()` falla en campos como `horarios` o `imagenes`, el catch devuelve `null` sin notificar al cliente.
**Remediación:** Devolver `400 Bad Request` con mensaje claro cuando el JSON está malformado.

---

### [MEDIO] M-03 — Race condition en `portada.js` al actualizar imágenes

**Ubicación:** `backend/routes/portada.js`
**Descripción:** El flujo de actualización de imágenes no usa transacción: si el UPDATE falla a medio camino, quedan imágenes huérfanas en disco.
**Remediación:** Envolver en transacción MySQL + rollback si falla.

---

### [BAJO] B-01 — Límite de tours hardcodeado en `tours.js`

**Ubicación:** `backend/routes/tours.js` (línea ~45)
**Descripción:** El límite de 12 tours por usuario está hardcodeado, no referenciado desde tabla `plans`.
**Remediación:** Leer el límite desde la tabla `plans` para que sea configurable.

---

---

## PARTE II — INFRAESTRUCTURA (Auditor Infra)

### [CRÍTICO] C-04 — Inyección de comandos shell en `servidor.js`

**Ubicación:** `backend/routes/servidor.js`
**Descripción:** Se ejecuta `exec()` con interpolación de strings que incluyen variables controlables por el usuario (rutas de archivos, nombres).
**Riesgo:** Ejecución de comandos arbitrarios en el servidor si una variable contiene `;rm -rf /` o similar.
**Remediación:** Usar `execFile()` con array de argumentos, o mejor aún, reemplazar los comandos shell con equivalentes Node.js nativos (`fs.stat()`, `path.walk()`).
```js
// INCORRECTO:
exec(`du -sb ${userPath}`, callback)

// CORRECTO:
const { size } = await fs.promises.stat(safePath);
```
**Referencia OWASP:** A03:2021 — Injection

---

### [ALTO] A-06 — Stack trace expuesto en logs accesibles

**Ubicación:** `backend/` — manejo de errores global
**Descripción:** Los errores con stack trace completo se loggean con `console.error(err)`. Si los logs son accesibles (PM2 logs sin restricción), revelan rutas del servidor y estructura interna.
**Remediación:** Loggear `err.message` + `err.stack` en archivo separado; al cliente devolver solo `{ error: "Error interno del servidor" }`.

---

### [ALTO] A-07 — `JWT_SECRET` potencialmente débil

**Ubicación:** `backend/.env` — variable `JWT_SECRET`
**Descripción:** No se valida en startup que `JWT_SECRET` tenga al menos 32 caracteres de entropía.
**Riesgo:** Con secreto débil, tokens son crackeables por fuerza bruta.
**Remediación:**
```js
// En app.js o index.js al arrancar:
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET inseguro: mínimo 32 caracteres');
}
```

---

### [ALTO] A-08 — Content Security Policy con `unsafe-inline`

**Ubicación:** `backend/` — configuración de Helmet
**Descripción:** La CSP incluye `unsafe-inline` para scripts, anulando la protección XSS.
**Remediación:** Usar nonces o hashes en lugar de `unsafe-inline`:
```js
helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
  }
})
```

---

### [ALTO] A-09 — Sin rate limit en endpoint de upload

**Ubicación:** `backend/routes/upload.js`
**Descripción:** No hay rate limiting en `/api/upload`. Un atacante puede subir miles de archivos llenando el disco.
**Remediación:** Aplicar `express-rate-limit` con máx. 20 uploads/minuto por IP/usuario.

---

### [ALTO] A-10 — HSTS no configurado

**Ubicación:** Configuración de Helmet
**Descripción:** Falta `Strict-Transport-Security` header. El navegador puede ser forzado a usar HTTP.
**Remediación:**
```js
helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })
```

---

### [ALTO] A-11 — X-Frame-Options no configurado

**Ubicación:** Configuración de Helmet
**Descripción:** Falta protección contra clickjacking.
**Remediación:**
```js
helmet.frameguard({ action: 'deny' })
```

---

### [MEDIO] M-04 — Sin archivo `.env.example`

**Ubicación:** Raíz del proyecto
**Descripción:** No existe `.env.example`. Nuevos deployments pueden arrancar sin variables críticas y fallar silenciosamente.
**Remediación:** Crear `.env.example` con todas las variables requeridas (sin valores reales).

---

### [MEDIO] M-05 — CORS permite HTTP (no solo HTTPS)

**Ubicación:** Configuración de CORS
**Descripción:** El origin permitido incluye tanto `http://` como `https://` del dominio. En producción solo debería aceptarse HTTPS.
**Remediación:** Restricción a `https://soloaunclick.cl` únicamente en `NODE_ENV=production`.

---

### [MEDIO] M-06 — Sin `engines` en `package.json`

**Ubicación:** `backend/package.json`
**Descripción:** Sin especificar la versión de Node.js requerida, un update accidental del servidor puede romper la app.
**Remediación:** Agregar `"engines": { "node": ">=18.0.0" }`.

---

### [MEDIO] M-07 — Sin rotación de logs de PM2

**Ubicación:** Configuración PM2 en VPS
**Descripción:** Los logs de PM2 crecen indefinidamente. En producción continua pueden llenar el disco.
**Remediación:** Instalar `pm2-logrotate` y configurar rotación diaria con retención de 14 días.

---

### [MEDIO] M-08 — `Referrer-Policy` no configurado

**Ubicación:** Configuración de Helmet
**Descripción:** Sin este header, el navegador puede enviar la URL completa como Referer a terceros (analytics, CDNs).
**Remediación:** `helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' })`

---

### [BAJO] B-02 — `multer` usa `originalname` sin sanitizar

**Ubicación:** `backend/routes/upload.js`
**Descripción:** El nombre original del archivo se usa en el log. Si contiene caracteres especiales, puede causar problemas en ciertos sistemas de archivos o logs.
**Remediación:** Usar solo el nombre generado internamente por multer/uuid.

---

### [BAJO] B-03 — Conexión MySQL sin SSL

**Ubicación:** `backend/` — configuración del pool de MySQL
**Descripción:** La conexión a MySQL no usa SSL. Si el tráfico BD-app no es local, está en texto plano.
**Remediación:** Agregar `ssl: { rejectUnauthorized: false }` mínimamente, o mejor con certificados propios.

---

### [BAJO] B-04 — Email de recuperación sin reintentos

**Ubicación:** `backend/routes/passwordReset.js`
**Descripción:** Si el envío de email falla (SMTP down), el token se guarda en BD pero el usuario no recibe nada ni se notifica el error.
**Remediación:** Implementar retry con backoff exponencial o queue de emails.

---

---

## PARTE III — RENDIMIENTO Y BASE DE DATOS (Valentina)

### [CRÍTICO] C-05 — N+1 Query masivo en `servicios.js`

**Ubicación:** `backend/routes/servicios.js`
**Descripción:** Se hace `Promise.all(businesses.map(b => getListings(b.id)))` ejecutando 1 query por negocio. Con 100 negocios en portada = 101 queries por petición.
**Impacto:** Cada carga de portada genera 100+ queries. Con 10 usuarios concurrentes = 1000+ queries simultáneas. Pool de 10 conexiones se satura.
**Solución:**
```sql
-- Reemplazar el Promise.all con un solo JOIN:
SELECT b.*, l.id as listing_id, l.nombre, l.precio, l.tipo
FROM businesses b
LEFT JOIN listings l ON l.user_id = b.user_id AND l.activo = 1
WHERE b.activo = 1
ORDER BY b.id
LIMIT 50
```
**Prioridad de fix:** Inmediato

---

### [CRÍTICO] C-06 — 7 queries secuenciales en `analytics.js` por petición

**Ubicación:** `backend/routes/analytics.js` — GET /api/analytics/dashboard
**Descripción:** El dashboard de analytics ejecuta 7 queries independientes secuencialmente (visitas hoy, ayer, semana, mes, por página, por evento, por listing). Tiempo total estimado: 350-700ms en producción.
**Solución:** Paralelizar con `Promise.all([q1, q2, q3, q4, q5, q6, q7])` para reducir a ~100ms (el tiempo del query más lento).
**Prioridad de fix:** Inmediato

---

### [CRÍTICO] C-07 — `servidor.js` bloquea el event loop con `exec()` shell

**Ubicación:** `backend/routes/servidor.js`
**Descripción:** Los comandos `du -sb` y `find` ejecutados con `exec()` pueden tomar varios segundos en directorios grandes, bloqueando todo el event loop de Node.js durante ese tiempo.
**Impacto:** Todos los endpoints quedan congelados mientras se ejecuta el comando.
**Solución:** Reemplazar con `fs.promises.stat()` + `readdir()` recursivo asíncrono. (Este hallazgo coincide con C-04 de seguridad — doble prioridad.)
**Prioridad de fix:** Inmediato

---

### [ALTO] A-12 — Índice `idx_media_entity` faltante

**Ubicación:** Tabla `media` en MySQL
**Descripción:** Las queries `WHERE entity_type = 'listing' AND entity_id = ?` sobre la tabla `media` no tienen índice compuesto. Full scan en cada consulta de imágenes.
**Impacto:** Con 10,000 registros en `media`, cada query de imágenes tarda ~50ms vs ~1ms con índice.
**Solución:**
```sql
CREATE INDEX idx_media_entity ON media (entity_type, entity_id, orden);
```
**Prioridad de fix:** Inmediato

---

### [ALTO] A-13 — Loop secuencial en `carousels.js` para imágenes

**Ubicación:** `backend/routes/carousels.js`
**Descripción:** Las imágenes de cada carousel se obtienen en un loop `for...of` con `await` dentro (anti-patrón). Con 5 carousels = 5 queries secuenciales.
**Solución:** Una sola query con `WHERE entity_id IN (?)` o JOIN directo.

---

### [ALTO] A-14 — `SELECT *` en queries críticas

**Ubicación:** `backend/routes/listings.js`, `servicios.js`, `turismo.js`
**Descripción:** Múltiples queries usan `SELECT *` trayendo todos los campos incluyendo `descripcion` (TEXT) en listados que solo necesitan nombre, precio e imagen.
**Impacto:** 3-5x más datos transferidos BD→App de lo necesario.
**Solución:** Especificar solo los campos necesarios en cada SELECT.

---

### [ALTO] A-15 — Query de validación de categoría en cada POST de listing

**Ubicación:** `backend/routes/listings.js` — POST /api/listings
**Descripción:** Cada vez que se crea un listing, se hace una query a `categorias` para validar. Esta tabla rara vez cambia — ideal para caché en memoria.
**Solución:** Cargar categorías al startup con `node-cache` o variable global, TTL de 1 hora.

---

### [ALTO] A-16 — `ORDER BY RAND()` en `locales.js`

**Ubicación:** `backend/routes/locales.js`
**Descripción:** Hay una query con `ORDER BY RAND()` que causa full table scan + sort en cada request.
**Impacto:** Con 1,000 locales, esta query tarda 200-500ms y no puede usar índice.
**Solución:** Pre-randomizar en cron diario o usar `OFFSET` aleatorio calculado en app.

---

### [MEDIO] M-09 — `connectionLimit: 10` insuficiente

**Ubicación:** `backend/` — configuración del pool MySQL
**Descripción:** Con el N+1 de servicios.js, un solo request puede necesitar 100 conexiones. El pool de 10 produce queue y timeouts bajo carga media.
**Solución:** Después de resolver N+1, aumentar a `connectionLimit: 20-30` y monitorear con `pool.pool._allConnections.length`.

---

### [MEDIO] M-10 — Riesgo de connection leak en transacciones

**Ubicación:** `backend/routes/` — endpoints con `pool.getConnection()`
**Descripción:** Si se usa `pool.getConnection()` y hay un error antes de `connection.release()`, la conexión queda tomada indefinidamente.
**Solución:** Usar siempre `try/finally` para garantizar el release:
```js
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  // ... operaciones
  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release(); // siempre se ejecuta
}
```

---

### [MEDIO] M-11 — JOIN de 3 tablas sin índice en columna de media

**Ubicación:** `backend/routes/listings.js`
**Descripción:** El JOIN `listings → media → users` no puede usar índice compuesto hasta que se cree el de media (A-12). Mientras tanto, full scan en cada consulta de listados.

---

---

## PARTE IV — LÓGICA DE NEGOCIO Y QA (Camila)

### [CRÍTICO] C-08 — Carousels POST/PUT/DELETE sin `requirePlan(2)`

**Ubicación:** `backend/routes/carousels.js`
**Descripción:** Los endpoints de creación, edición y eliminación de carousels no verifican que el usuario tenga plan ≥ 2. Un usuario plan 1 (Gratis) puede crear carousels.
**Regla afectada:** Feature gate: carousel requiere plan ≥ 2.
**Escenario:** Usuario plan 1 hace POST /api/carousels con token válido → crea carousel sin pagar.
**Fix:**
```js
router.post('/api/carousels', authMiddleware, requirePlan(2), async (req, res) => { ... });
router.put('/api/carousels/:id', authMiddleware, requirePlan(2), async (req, res) => { ... });
router.delete('/api/carousels/:id', authMiddleware, requirePlan(2), async (req, res) => { ... });
```

---

### [CRÍTICO] C-09 — `pagina.js` PATCH sin `requirePlan(3)`

**Ubicación:** `backend/routes/pagina.js`
**Descripción:** El endpoint de actualización de página no verifica plan Premium (plan 3).
**Regla afectada:** Feature gate: `pagina` requiere plan = 3.
**Escenario:** Usuario plan 2 edita su página de contenido sin tener plan Premium.
**Fix:** Agregar `requirePlan(3)` al middleware del endpoint PATCH.

---

### [CRÍTICO] C-10 — `tours.js` DELETE es eliminación física, no soft delete

**Ubicación:** `backend/routes/tours.js` — DELETE /api/tours/:id
**Descripción:** El endpoint elimina el tour con `DELETE FROM turismo_tours WHERE id = ?`. No aplica soft delete (`activo=0`, `deleted_at=NOW()`).
**Regla afectada:** Todos los borrados deben ser lógicos (soft delete).
**Impacto:** Pérdida irreversible de datos; analytics con `listing_id` apuntando a tour eliminado quedan huérfanos.
**Fix:**
```js
await pool.query(
  'UPDATE turismo_tours SET activo = 0, deleted_at = NOW() WHERE id = ? AND user_id = ?',
  [tourId, req.userId]
);
```

---

### [CRÍTICO] C-11 — `portada.js` DELETE es eliminación física

**Ubicación:** `backend/routes/portada.js` — DELETE /api/portada
**Descripción:** Mismo problema que C-10. DELETE físico en lugar de soft delete.
**Fix:** Aplicar `activo=0` + `deleted_at=NOW()` en lugar de DELETE.

---

### [CRÍTICO] C-12 — `carousels.js` GET sin filtro de plan para listar

**Ubicación:** `backend/routes/carousels.js` — GET /api/carousels
**Descripción:** La consulta pública que devuelve carousels no filtra por plan del usuario. Carousels de usuarios que hicieron downgrade a plan 1 siguen siendo públicamente visibles.
**Regla afectada:** Downgrade de plan debe ocultar contenido premium.
**Fix:** Agregar JOIN con users/plans y filtrar `plan_id >= 2`.

---

### [CRÍTICO] C-13 — `tours.js` PUT no verifica límite de 12 tours

**Ubicación:** `backend/routes/tours.js` — PUT /api/tours/:id
**Descripción:** Al actualizar un tour se puede cambiar su estado de inactivo a activo (ej. campo `activo=1`) sin verificar si el usuario ya tiene 12 tours activos.
**Escenario:** Usuario crea 12 tours → desactiva todos → reactiva uno a uno → vuelve a tener 12 → activa el 13vo via PUT.
**Fix:** En cualquier operación que active un tour, verificar COUNT de tours activos.

---

### [ALTO] A-17 — Precios negativos permitidos en listings y tours

**Ubicación:** `backend/routes/listings.js`, `backend/routes/tours.js`
**Descripción:** No hay validación de que `precio >= 0`. Se puede crear un listing con `precio: -500`.
**Escenario:** POST /api/listings con `{"precio": -9999}` → publicado en la plataforma.
**Fix:** `body('precio').isFloat({ min: 0 })` en express-validator.

---

### [ALTO] A-18 — Nombre de negocio vacío permitido

**Ubicación:** `backend/routes/business.js` — POST/PUT
**Descripción:** Se puede crear/actualizar un negocio con `nombre_negocio: ""` o solo espacios.
**Escenario:** PUT /api/business con `{"nombre_negocio": "   "}` → negocio sin nombre en la plataforma.
**Fix:** `body('nombre_negocio').trim().notEmpty().isLength({ min: 2, max: 100 })`.

---

### [ALTO] A-19 — Inconsistencia de slogan: frontend 40 palabras vs backend 10

**Ubicación:** `backend/routes/business.js` vs frontend
**Descripción:** El frontend valida máximo 40 palabras para el slogan, pero el SKILL.md de Camila documenta que la regla de negocio es 10 palabras. Hay discrepancia — ninguno de los dos corresponde si la regla real no está claramente definida.
**Fix:** Definir la regla oficial, aplicarla en backend con `express-validator`, ajustar frontend para coincidir. El backend es la fuente de verdad.

---

### [ALTO] A-20 — `analytics.js` acepta `event_type` arbitrario

**Ubicación:** `backend/routes/analytics.js` — POST /api/analytics/event
**Descripción:** El campo `event_type` acepta cualquier string. Se pueden registrar eventos inventados que contaminen las estadísticas.
**Fix:**
```js
const VALID_EVENTS = ['view', 'click', 'contact', 'share', 'whatsapp'];
body('event_type').isIn(VALID_EVENTS)
```

---

### [MEDIO] M-12 — Sin límite en número de imágenes por listing/carousel

**Ubicación:** `backend/routes/upload.js`, `listings.js`, `carousels.js`
**Descripción:** No hay validación del máximo de imágenes por entidad. Un usuario puede subir 500 imágenes a un listing.
**Fix:** Verificar COUNT en `media` antes de cada upload: máximo 10 imágenes por listing, 20 por carousel.

---

### [MEDIO] M-13 — JSON malformado en `horarios`/`imagenes` produce error 500 silencioso

**Ubicación:** `backend/routes/turismo.js`, `business.js`
**Descripción:** Si se envía `horarios: "no es json válido"`, el `JSON.parse()` falla y la app devuelve 500 sin mensaje descriptivo.
**Fix:** Validar con `body('horarios').isJSON()` antes de parsear.

---

---

## PARTE V — HALLAZGOS YA CORREGIDOS (Referencia)

Los siguientes bugs fueron identificados y corregidos en la auditoría del 9 de Abril 2026:

| Hallazgo | Archivo | Fix aplicado |
|----------|---------|--------------|
| DISTINCT + ORDER BY en categorías | `locales.js` | Agregado `cb.orden` al SELECT |
| DISTINCT + ORDER BY en categorías evento | `eventos.js` | Agregado `ce.orden` al SELECT |
| Tablas legacy con datos huérfanos | `schema_local.sql` | Eliminadas `turismo_negocios`, `listing_images`, `carousel_images` |
| Imágenes dispersas en múltiples tablas | `listings.js`, `carousels.js` | Unificadas en tabla polimórfica `media` |

---

## PLAN DE REMEDACIÓN PRIORIZADO

### Sprint Inmediato (esta semana)
| # | Hallazgo | Dept. | Severidad |
|---|----------|-------|-----------|
| 1 | C-04/C-07 — Eliminar `exec()` shell en servidor.js | Infra + Perf | CRÍTICO |
| 2 | C-05 — Resolver N+1 en servicios.js | Rendimiento | CRÍTICO |
| 3 | C-08 — Agregar `requirePlan(2)` a carousels | QA | CRÍTICO |
| 4 | C-09 — Agregar `requirePlan(3)` a pagina | QA | CRÍTICO |
| 5 | C-10 — Cambiar DELETE físico a soft delete en tours | QA | CRÍTICO |
| 6 | C-11 — Cambiar DELETE físico a soft delete en portada | QA | CRÍTICO |
| 7 | C-03 — Sanitizar user_id en analytics | Backend | CRÍTICO |
| 8 | A-12 — Crear índice `idx_media_entity` | Rendimiento | ALTO |

### Próximo Sprint
| # | Hallazgo | Dept. | Severidad |
|---|----------|-------|-----------|
| 9 | A-08 — Remover CSP unsafe-inline | Infra | ALTO |
| 10 | A-10/A-11 — Agregar HSTS y X-Frame-Options | Infra | ALTO |
| 11 | C-06 — Paralelizar queries de analytics | Rendimiento | CRÍTICO |
| 12 | A-17/A-18 — Validar precios y nombres vacíos | QA | ALTO |
| 13 | A-20 — Whitelist de event_type | QA | ALTO |
| 14 | C-01 — Verificar propiedad en reorder de imágenes | Backend | CRÍTICO |
| 15 | C-13 — Verificar límite de tours en PUT | QA | CRÍTICO |

### Largo Plazo
| # | Hallazgo | Dept. | Severidad |
|---|----------|-------|-----------|
| 16 | A-06 — Sistema de logging estructurado | Infra | ALTO |
| 17 | A-07 — Validación de JWT_SECRET al startup | Infra | ALTO |
| 18 | A-09 — Rate limit en uploads | Infra | ALTO |
| 19 | A-13/A-14 — Optimizar queries de carousels y listings | Rendimiento | ALTO |
| 20 | M-09 — Aumentar connectionLimit tras resolver N+1 | Rendimiento | MEDIO |
| 21 | M-04 — Crear .env.example | Infra | MEDIO |
| 22 | M-07 — Configurar pm2-logrotate | Infra | MEDIO |
| 23 | M-12 — Límite de imágenes por entidad | QA | MEDIO |
| 24 | A-19 — Unificar regla de slogan frontend/backend | QA | ALTO |

---

## PENDIENTES PREVIOS (no relacionados a esta auditoría)

1. **SMTP Gmail** — Recuperación de contraseña por email no funciona en producción (servicio SMTP no configurado). Hallazgo conocido de auditoría previa.
2. **CI/CD Pipeline** — No existe pipeline de deployment automático. Los deploys son manuales via SSH + PM2 restart.

---

*Reporte consolidado por Soledad — Auditora de Seguridad*
*Equipo: Auditor Backend · Auditor Infra · Valentina (Rendimiento) · Camila (QA)*
*Solo a un Click — Villarrica, Chile*
