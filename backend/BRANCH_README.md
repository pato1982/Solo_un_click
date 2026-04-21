# Branch: `feature/db-schema-v2` — Migración BD (Fases 1, 2 y 3)

> **Estado:** ✅ Listo para PR a `main` · **Base:** `main` · **Inicio:** 2026-04-13 · **Completado:** 2026-04-14

## Resumen ejecutivo

Este branch implementa el **refactor completo del modelo de datos** de Solo a un Click en 3 fases incrementales e idempotentes. Los cambios son **100% retrocompatibles**: el frontend actual no requiere ninguna modificación.

**Resultado:** 46 tests de integración en verde, desplegado en entorno VPS dev (`soloaunclick-dev`, puerto 3001).

---

## Changelog por Fase

### ✅ Fase 1 — Unificación de negocios + Soft Delete

**Objetivo:** Consolidar `businesses` + `turismo_negocios` y eliminar borrado físico en listings.

**Cambios en BD:**
- `businesses`: nuevas columnas `tipo VARCHAR(20)` (general|turismo), `ubicacion`, `activo`; `horarios` migrado a JSON nativo
- `listings`: nueva columna `deleted_at TIMESTAMP NULL`
- Datos de `turismo_negocios` migrados a `businesses` con `tipo='turismo'`

**Cambios en código:**
- `turismo.js`: redirige de `turismo_negocios` → `businesses WHERE tipo='turismo'`
- `business.js`: soporte para `ubicacion`, `tipo='general'`, helper `parseHorarios()`
- `listings.js`: `DELETE FROM` → `UPDATE SET activo=0, deleted_at=NOW()` + filtro `AND deleted_at IS NULL` en GET público

---

### ✅ Fase 2 — FK Categorías + JSON Nativo

**Objetivo:** Agregar integridad referencial en listings y eliminar código frágil de parseo JSON.

**Cambios en BD:**
- `listings`: nuevas columnas `categoria_id INT FK NULL` y `subcategoria_id INT FK NULL` con backfill desde texto
- `turismo_tours.imagenes`, `imagenes_crop`: TEXT → JSON nativo
- `turismo_portada.imagenes`, `categorias`, `imagenes_crop`: TEXT → JSON nativo
- `turismo_pagina.crop_superior`, `crop_inferior`: TEXT → JSON nativo
- `activity_log.detalles`: TEXT → JSON nativo

**Cambios en código:**
- `tours.js`: `parseJson()` + `normalizarTour()` — elimina 8 bloques try/catch frágiles
- `portada.js`: `parseJson()` + `normalizarPortada()` — elimina 4 bloques try/catch
- `pagina.js`: `parseJson()` + `normalizarPagina()` — elimina 2 bloques try/catch
- `listings.js`: `resolverCategoriaIds()` — escribe `categoria_id`/`subcategoria_id` en POST y PUT

---

### ✅ Fase 3 — Cleanup Legacy + Integridad Referencial

**Objetivo:** Eliminar la tabla `turismo_negocios` (reemplazada en Fase 1) y reforzar FKs pendientes.

**Cambios en BD:**
- `turismo_negocios`: **eliminada** (todos los datos ya estaban en `businesses`)
- FK `turismo_portada.user_id` → `businesses.user_id` (ON DELETE CASCADE)
- FK `turismo_pagina.user_id` → `businesses.user_id` (ON DELETE CASCADE)
- FK `turismo_tours.user_id` → `businesses.user_id` (ON DELETE CASCADE)
- Índice `idx_businesses_tipo` en `businesses(tipo)`

**Cambios en código:**
- `servidor.js`: fix `TABLE_SCHEMA = 'soloaunclick'` → `TABLE_SCHEMA = DATABASE()` (bug en todos los entornos)

---

## Archivos de migración

| Archivo | Fase | Descripción |
|---------|------|-------------|
| `migrations/000_schema_base.sql` | — | Schema completo desde cero |
| `migrations/002_fase1_businesses_unificado.sql` | 1 | Migración incremental Fase 1 |
| `migrations/003_fase2_fk_categorias_json_nativo.sql` | 2 | FK categorías + JSON nativo |
| `migrations/004_fase3_cleanup_legacy.sql` | 3 | Eliminar legacy + FKs finales |
| `migrations/004_fase3_rollback.sql` | 3 | Rollback de Fase 3 |
| `migrations/seed_test.sql` | — | 10 usuarios, 7 negocios, 14 listings, tours, portadas |

---

## Tests de integración

**Suite:** 46 tests en verde · 4 archivos · Sin mocks — conectan a BD real

| Archivo | Tests | Cubre |
|---------|-------|-------|
| `__tests__/business.test.js` | 13 | Businesses unificado, turismo, horarios JSON |
| `__tests__/listings.test.js` | 8 | Soft delete, filtros, JOIN con businesses |
| `__tests__/fase2.test.js` | 12 | categoria_id FK, JSON nativo tours/portada/pagina |
| `__tests__/fase3.test.js` | 13 | Esquema post-cleanup, retrocompatibilidad, KPIs |

---

## Setup del entorno de testing

### Opción A — Desde cero (BD nueva)

```bash
# 1. Crear BD y usuario en MySQL
mysql -u root -p << 'SQL'
CREATE DATABASE soloaunclick_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sac_test'@'localhost' IDENTIFIED BY 'TuPassword!';
GRANT ALL PRIVILEGES ON soloaunclick_test.* TO 'sac_test'@'localhost';
SQL

# 2. Cargar schema + seed
mysql -u sac_test -p soloaunclick_test < backend/migrations/000_schema_base.sql
mysql -u sac_test -p soloaunclick_test < backend/migrations/seed_test.sql

# 3. Aplicar migraciones de Fase 2 y 3
mysql -u sac_test -p soloaunclick_test < backend/migrations/003_fase2_fk_categorias_json_nativo.sql
mysql -u sac_test -p soloaunclick_test < backend/migrations/004_fase3_cleanup_legacy.sql
```

### Opción B — BD existente con datos

```bash
# Aplicar migraciones en orden
mysql -u root -p soloaunclick < backend/migrations/002_fase1_businesses_unificado.sql
mysql -u root -p soloaunclick < backend/migrations/003_fase2_fk_categorias_json_nativo.sql
mysql -u root -p soloaunclick < backend/migrations/004_fase3_cleanup_legacy.sql
```

### Configurar `.env.test`

```bash
cd backend && cp .env.test.example .env.test
# Editar con credenciales de la BD de test
```

```env
DB_HOST=localhost
DB_USER=sac_test
DB_PASS=TuPassword!
DB_NAME=soloaunclick_test
JWT_SECRET=test_jwt_secret_no_usar_en_produccion_48chars_sac26
PORT=3002
NODE_ENV=test
```

### Correr los tests

```bash
cd backend
npm test
# ó con watch
npm run test:watch
```

---

## Rollback de emergencia

Si Fase 3 causa problemas en producción:

```bash
mysql -u root -p soloaunclick < backend/migrations/004_fase3_rollback.sql
# NOTA: recrea turismo_negocios vacía — restaurar datos desde backup
```

---

## Checklist pre-merge a `main`

- [x] 46 tests de integración en verde
- [x] Migración aplicada en VPS dev y verificada
- [x] `turismo_negocios` eliminada, datos en `businesses`
- [x] JSON nativo en turismo_tours, portada, pagina, activity_log
- [x] FK `categoria_id` en listings con backfill
- [x] Soft delete funcionando con filtros en GET público
- [x] `servidor.js` usa `DATABASE()` en lugar de nombre hardcodeado
- [x] Script de rollback documentado
- [ ] Backup de producción antes del merge
- [ ] Aplicar migraciones en producción en orden (002 → 003 → 004)
- [ ] Smoke test manual en producción post-deploy

---

*Documentado el 2026-04-14 · Branch: feature/db-schema-v2 · 3 fases · 46 tests*
