-- ============================================================
-- MIGRACIÓN: user_id → business_id en 5 tablas
-- Archivo: 2026_04_20__user_id_to_business_id.sql
-- Autor: Craft Agent · 2026-04-20
-- Branch: feature/db-schema-v2
-- ============================================================
-- PRECONDICIONES:
--   1. Backup mysqldump validado (/var/backups/mysql/ con fecha de hoy)
--   2. Backend pausado (pm2 stop soloaunclick) durante la migración
--   3. Relación 1:1 entre users y businesses está garantizada a nivel de producto
--
-- ESTRATEGIA:
--   - ADD COLUMN business_id (nullable) en las 5 tablas
--   - BACKFILL: UPDATE ... JOIN businesses b ON b.user_id = t.user_id
--   - ADD FOREIGN KEY business_id → businesses(id)
--   - NO se elimina user_id (coexiste en esta fase, drop en fase 2)
--
-- ROLLBACK: ver archivo 2026_04_20__user_id_to_business_id.rollback.sql
-- ============================================================

START TRANSACTION;

-- Verificación previa: abortar si hay users sin business
SELECT COUNT(*) AS users_sin_business
  FROM users u
  LEFT JOIN businesses b ON b.user_id = u.id
  WHERE u.activo = 1 AND b.id IS NULL;
-- Si el valor anterior > 0, abortar y crear businesses para esos usuarios primero.

-- --------------------------------------------------------------
-- 1. LISTINGS
-- --------------------------------------------------------------
ALTER TABLE listings ADD COLUMN business_id INT NULL AFTER user_id;
UPDATE listings l
  JOIN businesses b ON b.user_id = l.user_id
  SET l.business_id = b.id;
ALTER TABLE listings ADD INDEX idx_listings_business_id (business_id);
ALTER TABLE listings
  ADD CONSTRAINT fk_listings_business_id
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- --------------------------------------------------------------
-- 2. CAROUSELS
-- --------------------------------------------------------------
ALTER TABLE carousels ADD COLUMN business_id INT NULL AFTER user_id;
UPDATE carousels c
  JOIN businesses b ON b.user_id = c.user_id
  SET c.business_id = b.id;
ALTER TABLE carousels ADD INDEX idx_carousels_business_id (business_id);
ALTER TABLE carousels
  ADD CONSTRAINT fk_carousels_business_id
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- --------------------------------------------------------------
-- 3. TURISMO_TOURS
-- --------------------------------------------------------------
ALTER TABLE turismo_tours ADD COLUMN business_id INT NULL AFTER user_id;
UPDATE turismo_tours t
  JOIN businesses b ON b.user_id = t.user_id
  SET t.business_id = b.id;
ALTER TABLE turismo_tours ADD INDEX idx_turismo_tours_business_id (business_id);
-- NOTA: antes de agregar FK, eliminar la FK dual heredada (ver diagrama_BD_v2).
-- Se deja como tarea separada para no romper esta migración si los constraint names varían.
ALTER TABLE turismo_tours
  ADD CONSTRAINT fk_turismo_tours_business_id
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- --------------------------------------------------------------
-- 4. TURISMO_PORTADA
-- --------------------------------------------------------------
ALTER TABLE turismo_portada ADD COLUMN business_id INT NULL AFTER user_id;
UPDATE turismo_portada t
  JOIN businesses b ON b.user_id = t.user_id
  SET t.business_id = b.id;
ALTER TABLE turismo_portada ADD UNIQUE INDEX uk_turismo_portada_business_id (business_id);
ALTER TABLE turismo_portada
  ADD CONSTRAINT fk_turismo_portada_business_id
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- --------------------------------------------------------------
-- 5. TURISMO_PAGINA
-- --------------------------------------------------------------
ALTER TABLE turismo_pagina ADD COLUMN business_id INT NULL AFTER user_id;
UPDATE turismo_pagina t
  JOIN businesses b ON b.user_id = t.user_id
  SET t.business_id = b.id;
ALTER TABLE turismo_pagina ADD UNIQUE INDEX uk_turismo_pagina_business_id (business_id);
ALTER TABLE turismo_pagina
  ADD CONSTRAINT fk_turismo_pagina_business_id
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- --------------------------------------------------------------
-- VALIDACIÓN POST-MIGRACIÓN (ejecutar MANUALMENTE antes del COMMIT)
-- --------------------------------------------------------------
-- SELECT 'listings' t, SUM(business_id IS NULL) nulos, COUNT(*) total FROM listings
-- UNION ALL SELECT 'carousels', SUM(business_id IS NULL), COUNT(*) FROM carousels
-- UNION ALL SELECT 'turismo_tours', SUM(business_id IS NULL), COUNT(*) FROM turismo_tours
-- UNION ALL SELECT 'turismo_portada', SUM(business_id IS NULL), COUNT(*) FROM turismo_portada
-- UNION ALL SELECT 'turismo_pagina', SUM(business_id IS NULL), COUNT(*) FROM turismo_pagina;
--
-- Esperado: nulos = 0 en todas las filas (para registros de users con business activo).
-- Si algún registro tiene business_id NULL, investigar antes de COMMIT.

-- COMMIT;   -- descomentar tras validar
-- ROLLBACK; -- alternativa si algo no cuadra

-- ============================================================
-- FASE 2 (semana siguiente, tras observación):
--   ALTER TABLE listings DROP FOREIGN KEY <fk_user>;
--   ALTER TABLE listings DROP COLUMN user_id;
--   (repetir para las otras 4 tablas)
-- ============================================================
