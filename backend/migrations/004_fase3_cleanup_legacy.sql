-- ============================================================
-- MIGRACIÓN FASE 3 — Cleanup Legacy
-- Proyecto: Solo un Click — Branch: feature/db-schema-v2
-- Fecha: 2026-04-14
--
-- Objetivo: Eliminar tabla turismo_negocios y reforzar integridad referencial.
-- La tabla turismo_negocios fue reemplazada en Fase 1 por businesses (tipo='turismo').
-- Todos los datos migrados y verificados. Las rutas no la usan desde Fase 1.
--
-- Estrategia: script idempotente — seguro de ejecutar múltiples veces.
-- Rollback: ver 004_fase3_rollback.sql
-- ============================================================

-- ============================================================
-- PASO 1: Verificación previa (seguridad)
-- Garantiza que no queden rows en turismo_negocios sin equivalente en businesses
-- ============================================================
SELECT
  'Registros en turismo_negocios sin pair en businesses' AS verificacion,
  COUNT(*) AS total_sin_migrar
FROM turismo_negocios tn
WHERE NOT EXISTS (
  SELECT 1 FROM businesses b
  WHERE b.user_id = tn.user_id AND b.tipo = 'turismo'
);

-- ============================================================
-- PASO 2: Eliminar tabla turismo_negocios
-- Prerequisito: todos los datos ya están en businesses (verificado en Fase 1)
-- ============================================================
SET @has_turismo_negocios = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'turismo_negocios'
);
SET @sql_drop = IF(@has_turismo_negocios > 0,
  'DROP TABLE turismo_negocios',
  'SELECT "turismo_negocios ya fue eliminada" AS resultado'
);
PREPARE drop_stmt FROM @sql_drop;
EXECUTE drop_stmt;
DEALLOCATE PREPARE drop_stmt;

-- ============================================================
-- PASO 3: Agregar FK de turismo_portada → businesses
-- Garantiza que una portada siempre pertenezca a un negocio registrado
-- ============================================================
SET @fk_portada_biz = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'turismo_portada'
    AND CONSTRAINT_NAME = 'fk_turismo_portada_business'
);
SET @sql_fk_pb = IF(@fk_portada_biz = 0,
  'ALTER TABLE turismo_portada ADD CONSTRAINT fk_turismo_portada_business
   FOREIGN KEY (user_id) REFERENCES businesses(user_id) ON DELETE CASCADE',
  'SELECT "fk_turismo_portada_business ya existe" AS resultado'
);
PREPARE fk_pb_stmt FROM @sql_fk_pb;
EXECUTE fk_pb_stmt;
DEALLOCATE PREPARE fk_pb_stmt;

-- ============================================================
-- PASO 4: Agregar FK de turismo_pagina → businesses
-- ============================================================
SET @fk_pagina_biz = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'turismo_pagina'
    AND CONSTRAINT_NAME = 'fk_turismo_pagina_business'
);
SET @sql_fk_pab = IF(@fk_pagina_biz = 0,
  'ALTER TABLE turismo_pagina ADD CONSTRAINT fk_turismo_pagina_business
   FOREIGN KEY (user_id) REFERENCES businesses(user_id) ON DELETE CASCADE',
  'SELECT "fk_turismo_pagina_business ya existe" AS resultado'
);
PREPARE fk_pab_stmt FROM @sql_fk_pab;
EXECUTE fk_pab_stmt;
DEALLOCATE PREPARE fk_pab_stmt;

-- ============================================================
-- PASO 5: Agregar FK de turismo_tours → businesses
-- ============================================================
SET @fk_tours_biz = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'turismo_tours'
    AND CONSTRAINT_NAME = 'fk_turismo_tours_business'
);
SET @sql_fk_tb = IF(@fk_tours_biz = 0,
  'ALTER TABLE turismo_tours ADD CONSTRAINT fk_turismo_tours_business
   FOREIGN KEY (user_id) REFERENCES businesses(user_id) ON DELETE CASCADE',
  'SELECT "fk_turismo_tours_business ya existe" AS resultado'
);
PREPARE fk_tb_stmt FROM @sql_fk_tb;
EXECUTE fk_tb_stmt;
DEALLOCATE PREPARE fk_tb_stmt;

-- ============================================================
-- PASO 6: Agregar índice en businesses(tipo) si no existe
-- Optimiza WHERE tipo = 'turismo' / 'general' (query frecuente)
-- ============================================================
SET @idx_biz_tipo = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'businesses'
    AND INDEX_NAME = 'idx_businesses_tipo'
);
SET @sql_idx = IF(@idx_biz_tipo = 0,
  'ALTER TABLE businesses ADD INDEX idx_businesses_tipo (tipo)',
  'SELECT "idx_businesses_tipo ya existe" AS resultado'
);
PREPARE idx_stmt FROM @sql_idx;
EXECUTE idx_stmt;
DEALLOCATE PREPARE idx_stmt;

-- ============================================================
-- PASO 8: Verificación final del estado del esquema
-- ============================================================
SELECT 'FASE 3 COMPLETA' AS resultado, NOW() AS ejecutado_at;

SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
ORDER BY TABLE_NAME;
