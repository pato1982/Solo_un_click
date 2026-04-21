# Solo a un Click — Estado del Proyecto

> **Rama activa:** `feature/db-schema-v2` — deployada en servidor de producción
> **Última actualización:** 2026-04-14
> **Estado:** ✅ 46/46 tests en verde · ✅ Deploy en `soloaunclick.cl` completado · Pendiente: PR a main

---

## Contexto del proyecto

**Solo a un Click** es un marketplace local (Argentina) para negocios generales y turismo. El backend es una API REST en **Node.js + Express** con **MySQL 8.0.45** en un VPS Ubuntu. Sin ORM — todo SQL crudo con `mysql2/promise`.

- **Servidor:** `158.220.123.58` (Contabo, Ubuntu 24.04), SSH: `ssh -i ~/.ssh/villarrica root@158.220.123.58`
- **Dominio:** `soloaunclick.cl` — Nginx sirviendo frontend + proxy `/api/ → :3001`
- **Puerto app:** `3001`, PM2 service: `soloaunclick`
- **Repo:** `pato1982/Solo_un_click` (GitHub), rama activa `feature/db-schema-v2`
- **BD:** `soloaunclick` (usuario: `soloaunclick`)
- **BD test:** `soloaunclick_test` (en mismo servidor, para Jest)
- **⚠️ VPS antiguo `45.236.131.104`:** descontinuado — NO usar

---

## Lo que se hizo en este branch

El branch implementa un **refactor completo del modelo de datos** en 3 fases incrementales. El frontend **no requiere ningún cambio** — todos los cambios son retrocompatibles.

---

### Fase 1 — Unificación de negocios + Soft Delete

**Por qué:** Había dos tablas paralelas (`businesses` para negocios generales, `turismo_negocios` para turismo) con estructura distinta. Esto generaba duplicación de lógica y dificultaba agregar features comunes.

**Qué se hizo:**

**BD:**
- `businesses`: columnas nuevas: `tipo VARCHAR(20)` (`general`|`turismo`), `ubicacion TEXT`, `activo TINYINT(1)`, `horarios` migrado a JSON nativo
- `listings`: nueva columna `deleted_at TIMESTAMP NULL` (soft delete)
- Datos de `turismo_negocios` migrados a `businesses` con `tipo='turismo'`

**Código:**
- `routes/turismo.js`: redirige consultas de `turismo_negocios` → `businesses WHERE tipo='turismo'`
- `routes/business.js`: soporte para `ubicacion`, `tipo='general'`, helper `parseHorarios()`
- `routes/listings.js`: `DELETE FROM` → `UPDATE SET activo=0, deleted_at=NOW()` + filtro `AND deleted_at IS NULL` en GET público

**Migración:** `migrations/002_fase1_businesses_unificado.sql`

---

### Fase 2 — FK Categorías + JSON Nativo

**Por qué:** Las columnas de imágenes y crops en tablas de turismo eran `TEXT` con JSON serializado manualmente. Había 14 bloques `try/catch` dispersos para parsear ese JSON. Además, `listings` tenía las categorías solo como texto libre sin FK.

**Qué se hizo:**

**BD:**
- `listings`: columnas `categoria_id INT FK NULL` y `subcategoria_id INT FK NULL` + backfill desde texto
- `turismo_tours.imagenes`, `imagenes_crop`: TEXT → JSON nativo
- `turismo_portada.imagenes`, `categorias`, `imagenes_crop`: TEXT → JSON nativo
- `turismo_pagina.crop_superior`, `crop_inferior`: TEXT → JSON nativo
- `activity_log.detalles`: TEXT → JSON nativo

**Código — patrón establecido:**

```javascript
// Patrón parseJson (usado en tours.js, portada.js, pagina.js)
function parseJson(val, fallback = []) {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'object') return val   // MySQL 8 ya devuelve objeto
  try { return JSON.parse(val) } catch { return fallback }
}
```

- `routes/tours.js`: `parseJson()` + `normalizarTour()` — elimina 8 bloques try/catch
- `routes/portada.js`: `parseJson()` + `normalizarPortada()` — elimina 4 bloques try/catch
- `routes/pagina.js`: `parseJson()` + `normalizarPagina()` — elimina 2 bloques try/catch
- `routes/listings.js`: `resolverCategoriaIds()` — escribe `categoria_id`/`subcategoria_id` en POST y PUT

```javascript
// resolverCategoriaIds — busca FK por nombre de texto
async function resolverCategoriaIds(categoria, subcategoria, tipo) {
  let categoriaId = null, subcategoriaId = null
  if (categoria) {
    const [catRows] = await pool.query(
      'SELECT id FROM categorias WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND tipo = ? LIMIT 1',
      [categoria, tipo || 'general']
    )
    if (catRows.length > 0) {
      categoriaId = catRows[0].id
      if (subcategoria) {
        const [subRows] = await pool.query(
          'SELECT id FROM subcategorias WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND categoria_id = ? LIMIT 1',
          [subcategoria, categoriaId]
        )
        if (subRows.length > 0) subcategoriaId = subRows[0].id
      }
    }
  }
  return { categoriaId, subcategoriaId }
}
```

**Migración:** `migrations/003_fase2_fk_categorias_json_nativo.sql`

---

### Fase 3 — Cleanup Legacy + Integridad Referencial

**Por qué:** Con los datos de turismo ya en `businesses` desde Fase 1, la tabla `turismo_negocios` quedó obsoleta. Además, faltaban FKs entre las tablas de turismo y `businesses` para garantizar integridad referencial.

**Qué se hizo:**

**BD:**
- `turismo_negocios`: **eliminada** (pre-check verifica 0 rows sin par en businesses)
- FK `turismo_portada.user_id → businesses.user_id` (ON DELETE CASCADE)
- FK `turismo_pagina.user_id → businesses.user_id` (ON DELETE CASCADE)
- FK `turismo_tours.user_id → businesses.user_id` (ON DELETE CASCADE)
- Índice `idx_businesses_tipo` en `businesses(tipo)`

**Código:**
- `routes/servidor.js`: fix `TABLE_SCHEMA = 'soloaunclick'` → `TABLE_SCHEMA = DATABASE()` (bug silencioso en todos los entornos)

**Migraciones:** `migrations/004_fase3_cleanup_legacy.sql` + `migrations/004_fase3_rollback.sql`

---

## Estado actual del código

### Tests — 46/46 en verde

```
__tests__/business.test.js   13 tests   Businesses unificado, turismo, horarios JSON
__tests__/listings.test.js    8 tests   Soft delete, filtros, JOIN con businesses
__tests__/fase2.test.js      12 tests   categoria_id FK, JSON nativo tours/portada/pagina
__tests__/fase3.test.js      13 tests   Esquema post-cleanup, retrocompat, KPIs
```

**Credenciales del seed de test** (`migrations/seed_test.sql`):

| email | password | rol | tipo_cuenta |
|-------|----------|-----|-------------|
| `admin@test.com` | `Test1234!` | admin | general |
| `user1@test.com` | `Test1234!` | user | general |
| `hotel@test.com` | `Test1234!` | user | turismo |
| `dev@test.com` | `Test1234!` | programador | general |

Hash bcryptjs para `'Test1234!'`: `$2a$10$n0JLDH9Z0ISftnaHEw7QOO0l.cI73BmKP9N3BQJIATHobC/ye8w/O`

---

## Quirks importantes (para no volver a perder tiempo)

### 1. MySQL 8.0.45 — DDL limitado

Esta versión **NO soporta**:
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... AFTER columna` (no se puede combinar IF NOT EXISTS con AFTER)
- `CREATE INDEX IF NOT EXISTS`
- `ADD CONSTRAINT IF NOT EXISTS` para FKs

**Patrón correcto** para DDL idempotente:
```sql
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tabla' AND COLUMN_NAME = 'col'
);
SET @sql = IF(@col_exists = 0, 'ALTER TABLE tabla ADD COLUMN col INT', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### 2. Hash bcrypt — formato Node vs PHP

Laravel usa `$2y$` (PHP format). Node.js `bcryptjs` **no puede verificar** hashes `$2y$`. Siempre generar hashes con Node:

```javascript
const bcrypt = require('bcryptjs')
const hash = await bcrypt.hash('Test1234!', 10)
// → $2a$10$...
```

**Nunca insertar hashes con `$` en comandos de shell** — el shell interpola como variable. Usar un script `.js` que haga el INSERT via pool.

### 3. Jest + pool global

**Problema:** Si `afterAll` en un test file llama `pool.end()`, los archivos de test siguientes fallan con 401 (el pool está cerrado, el login retorna undefined).

**Solución:** Solo `globalTeardown` cierra el pool. Los test files individuales **no** llaman `pool.end()`.

Archivos relevantes:
- `__tests__/setup.js` — `globalSetup` (opcional)
- `__tests__/teardown.js` — cierra el pool
- `jest.config.js` o `package.json` → `"globalTeardown": "./__tests__/teardown.js"`

### 4. Jest + PM2 — EADDRINUSE

Cuando Jest importa `server.js` y PM2 ya tiene la app corriendo en el mismo puerto → `EADDRINUSE`.

**Solución en `server.js`:**
```javascript
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => { ... })
}
module.exports = app
```

### 5. SUM() de MySQL devuelve string

```javascript
// MAL — falla si SUM() devuelve "1" como string
expect(res.body.kpis.turismo_premium).toBeGreaterThan(0)

// BIEN — castear explícitamente
expect(Number(res.body.kpis.turismo_premium)).toBeGreaterThan(0)
```

### 6. eventos.js no tiene user_id

La tabla `eventos` fue diseñada sin columna `user_id` — solo los programadores pueden crear/editar eventos. **No hay FK eventos→users** ni falta agregar una.

---

## Cómo correr los tests

### Setup `.env.test`

```env
DB_HOST=localhost
DB_USER=sac_test
DB_PASS=TuPassword!
DB_NAME=soloaunclick_test
JWT_SECRET=test_jwt_secret_no_usar_en_produccion_48chars_sac26
PORT=3002
NODE_ENV=test
```

### BD desde cero

```bash
mysql -u root -p -e "CREATE DATABASE soloaunclick_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p soloaunclick_test < backend/migrations/000_schema_base.sql
mysql -u root -p soloaunclick_test < backend/migrations/seed_test.sql
mysql -u root -p soloaunclick_test < backend/migrations/003_fase2_fk_categorias_json_nativo.sql
mysql -u root -p soloaunclick_test < backend/migrations/004_fase3_cleanup_legacy.sql
```

### Correr tests

```bash
cd backend
npm test
# ó en watch
npm run test:watch
```

---

## Archivos de migración

| Archivo | Fase | Descripción |
|---------|------|-------------|
| `migrations/000_schema_base.sql` | — | Schema completo desde cero |
| `migrations/002_fase1_businesses_unificado.sql` | 1 | Migración incremental Fase 1 |
| `migrations/003_fase2_fk_categorias_json_nativo.sql` | 2 | FK categorías + JSON nativo |
| `migrations/004_fase3_cleanup_legacy.sql` | 3 | Eliminar legacy + FKs finales |
| `migrations/004_fase3_rollback.sql` | 3 | Rollback Fase 3 |
| `migrations/seed_test.sql` | — | 10 usuarios, 7 negocios, 14 listings, tours, portadas |

---

## Próximos pasos

### Inmediato — PR a `main`

```bash
gh pr create \
  --title "feat(db): refactor BD completo — Fases 1, 2 y 3" \
  --body "..." \
  --base main \
  --head feature/db-schema-v2
```

Checklist pre-merge:
- [x] 46 tests en verde
- [x] Migración aplicada en VPS dev
- [x] Rollback documentado
- [ ] **Backup de producción antes del merge**
- [ ] Aplicar migraciones en producción: 002 → 003 → 004
- [ ] Smoke test manual en producción post-deploy

### Deploy a producción

```bash
# 1. Backup
mysqldump -u root -p soloaunclick > backup_pre_fase123_$(date +%Y%m%d).sql

# 2. Aplicar migraciones en orden
mysql -u root -p soloaunclick < backend/migrations/002_fase1_businesses_unificado.sql
mysql -u root -p soloaunclick < backend/migrations/003_fase2_fk_categorias_json_nativo.sql
mysql -u root -p soloaunclick < backend/migrations/004_fase3_cleanup_legacy.sql

# 3. Reiniciar app
pm2 restart soloaunclick
```

### Rollback de emergencia (Fase 3)

```bash
mysql -u root -p soloaunclick < backend/migrations/004_fase3_rollback.sql
# NOTA: recrea turismo_negocios vacía — restaurar datos desde backup
```

---

## Posibles features próximas (backlog informal)

Mencionadas durante las sesiones de trabajo pero no implementadas aún:

- **Panel de analytics para negocios** — mostrar visitas a su listing específico (tabla `site_visits` ya existe)
- **Búsqueda full-text** en listings (columnas `nombre`, `descripcion`)
- **Paginación** en `GET /listings` (actualmente retorna sin límite con LIMIT 200)
- **Tests para `eventos.js`** — no tienen suite propia aún
- **Tests para `portada.js`** y `pagina.js` — cubiertos indirectamente en `fase2.test.js` vía turismo endpoints

---

*Documentado en sesión 2026-04-13 → 2026-04-14 · Branch: feature/db-schema-v2 · 3 fases · 46 tests*
