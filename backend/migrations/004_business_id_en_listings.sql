-- ============================================================
-- Migración 004: Reemplazar listings.user_id por listings.business_id
-- Proyecto: Solo a un Click
-- Fecha: 2026-04-20
-- Branch: feature/db-schema-v2
-- ============================================================
-- CONTEXTO:
--   La migración 2026_04_20__user_id_to_business_id.sql (Fase 1) ya agregó
--   business_id como nullable y lo pobló con JOIN a businesses.
--   Esta migración (Fase 2) completa el cambio:
--     - Hace NOT NULL la columna business_id
--     - Agrega la FK a businesses(id) si no existe
--     - Elimina la FK vieja a users(id)
--     - Elimina la columna user_id
--
-- PRECONDICIONES:
--   1. Backup mysqldump validado antes de ejecutar
--   2. Backend pausado (pm2 stop soloaunclick) durante la migración
--   3. Fase 1 ya ejecutada: business_id existe y está poblado en listings
--
-- ROLLBACK: Restaurar desde backup (cambio destructivo — no hay rollback directo)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- PASO 0: Verificación previa — listings sin business_id
-- ============================================================
-- Ejecutar manualmente y confirmar que el resultado es 0 antes de continuar:
--   SELECT COUNT(*) AS listings_sin_business_id
--     FROM listings
--     WHERE business_id IS NULL;
--
-- Si el resultado > 0, ejecutar primero la Fase 1:
--   backend/migrations/2026_04_20__user_id_to_business_id.sql
-- ============================================================

-- ============================================================
-- PASO 1: Agregar columna business_id (nullable) si no existe ya
-- ============================================================
-- Idempotente: solo agrega si la columna no existe.
-- Si la Fase 1 ya la creó, este bloque no hace nada.
-- Ejecutar condicionalmente desde la aplicación o verificar con:
--   SHOW COLUMNS FROM listings LIKE 'business_id';

ALTER TABLE listings ADD COLUMN IF NOT EXISTS business_id INT NULL AFTER user_id;

-- ============================================================
-- PASO 2: Poblar business_id desde businesses (backfill)
-- ============================================================
-- Idempotente: solo actualiza filas donde business_id es NULL.
UPDATE listings l
  JOIN businesses b ON b.user_id = l.user_id
  SET l.business_id = b.id
  WHERE l.business_id IS NULL;

-- ============================================================
-- PASO 3: Verificación intermedia — confirmar 0 NULLs
-- ============================================================
-- Ejecutar manualmente antes de continuar con el Paso 4:
--   SELECT COUNT(*) AS nulos FROM listings WHERE business_id IS NULL;
-- Esperado: 0. Si hay NULLs, investigar users sin businesses antes de continuar.

-- ============================================================
-- PASO 4: Hacer NOT NULL (requiere 0 nulos en business_id)
-- ============================================================
ALTER TABLE listings MODIFY COLUMN business_id INT NOT NULL;

-- ============================================================
-- PASO 5: Agregar FK a businesses(id) si no existe ya
-- ============================================================
-- Nota: si la Fase 1 ya creó fk_listings_business_id, este ALTER fallará
-- con "Duplicate foreign key constraint name". Verificar con:
--   SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
--     WHERE TABLE_NAME = 'listings' AND COLUMN_NAME = 'business_id';
-- Si ya existe, saltar este paso.

ALTER TABLE listings
  ADD CONSTRAINT fk_listings_business_id
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- ============================================================
-- PASO 6: Agregar índice en business_id si no existe
-- ============================================================
-- Ejecutar solo si el índice no existe (verificar con SHOW INDEX FROM listings).
-- La FK del Paso 5 crea automáticamente un índice en MySQL si no hay uno previo.
-- Si la Fase 1 ya creó idx_listings_business_id, saltar este paso.

-- ALTER TABLE listings ADD INDEX idx_listings_business_id (business_id);

-- ============================================================
-- PASO 7: Eliminar FK vieja sobre user_id
-- ============================================================
-- IMPORTANTE: el nombre real del constraint puede diferir según entorno.
-- Verificar el nombre exacto con:
--   SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
--     WHERE TABLE_NAME = 'listings' AND COLUMN_NAME = 'user_id';
-- En schema_local.sql el constraint no tiene nombre explícito (MySQL lo genera).
-- En 000_schema_base.sql el nombre es 'fk_listings_user_id'.

ALTER TABLE listings DROP FOREIGN KEY fk_listings_user_id;

-- ============================================================
-- PASO 8: Eliminar columna user_id
-- ============================================================
ALTER TABLE listings DROP COLUMN user_id;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
-- Confirmar estructura correcta de la tabla tras la migración:
SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'listings'
  AND COLUMN_NAME IN ('user_id', 'business_id')
ORDER BY ORDINAL_POSITION;
-- Esperado: solo aparece 'business_id' con IS_NULLABLE='NO'

-- Confirmar FK activa:
SELECT
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'listings'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
-- Esperado: fk_listings_business_id → businesses(id)

-- Confirmar 0 huérfanos:
SELECT COUNT(*) AS huerfanos
  FROM listings l
  LEFT JOIN businesses b ON b.id = l.business_id
  WHERE b.id IS NULL;
-- Esperado: 0

SET FOREIGN_KEY_CHECKS = 1;

SELECT '004_business_id_en_listings.sql ejecutada exitosamente ✓' AS resultado;
