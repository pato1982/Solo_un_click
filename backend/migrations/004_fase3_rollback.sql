-- ============================================================
-- ROLLBACK FASE 3 — Solo a un Click
-- Fecha: 2026-04-14
--
-- Uso: ejecutar SOLO si la migración 004_fase3_cleanup_legacy.sql
-- causó problemas en producción.
--
-- ADVERTENCIA: Este script recrea turismo_negocios vacía.
-- Los datos de la tabla original deben restaurarse desde backup.
-- ============================================================

-- ============================================================
-- 1. Quitar FKs agregadas en Fase 3
-- ============================================================
SET @fk1 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='turismo_portada' AND CONSTRAINT_NAME='fk_turismo_portada_business');
SET @sql1 = IF(@fk1 > 0, 'ALTER TABLE turismo_portada DROP FOREIGN KEY fk_turismo_portada_business', 'SELECT 1');
PREPARE s1 FROM @sql1; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @fk2 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='turismo_pagina' AND CONSTRAINT_NAME='fk_turismo_pagina_business');
SET @sql2 = IF(@fk2 > 0, 'ALTER TABLE turismo_pagina DROP FOREIGN KEY fk_turismo_pagina_business', 'SELECT 1');
PREPARE s2 FROM @sql2; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @fk3 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='turismo_tours' AND CONSTRAINT_NAME='fk_turismo_tours_business');
SET @sql3 = IF(@fk3 > 0, 'ALTER TABLE turismo_tours DROP FOREIGN KEY fk_turismo_tours_business', 'SELECT 1');
PREPARE s3 FROM @sql3; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @fk4 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='eventos' AND CONSTRAINT_NAME='fk_eventos_user_id');
SET @sql4 = IF(@fk4 > 0, 'ALTER TABLE eventos DROP FOREIGN KEY fk_eventos_user_id', 'SELECT 1');
PREPARE s4 FROM @sql4; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @ix1 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='businesses' AND INDEX_NAME='idx_businesses_tipo');
SET @sqlix = IF(@ix1 > 0, 'ALTER TABLE businesses DROP INDEX idx_businesses_tipo', 'SELECT 1');
PREPARE six FROM @sqlix; EXECUTE six; DEALLOCATE PREPARE six;

-- ============================================================
-- 2. Recrear tabla turismo_negocios (estructura original)
-- NOTA: los datos deben restaurarse desde backup del servidor
-- ============================================================
CREATE TABLE IF NOT EXISTS turismo_negocios (
  id          INT           NOT NULL AUTO_INCREMENT,
  user_id     INT           NOT NULL,
  nombre      VARCHAR(200)  DEFAULT NULL,
  descripcion TEXT          DEFAULT NULL,
  direccion   VARCHAR(255)  DEFAULT NULL,
  ubicacion   VARCHAR(255)  DEFAULT NULL,
  whatsapp    VARCHAR(50)   DEFAULT NULL,
  telefono    VARCHAR(50)   DEFAULT NULL,
  correo      VARCHAR(191)  DEFAULT NULL,
  facebook    VARCHAR(255)  DEFAULT NULL,
  instagram   VARCHAR(255)  DEFAULT NULL,
  horarios    TEXT          DEFAULT NULL,
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_turismo_negocios_user_id (user_id),
  CONSTRAINT fk_turismo_negocios_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'ROLLBACK FASE 3 COMPLETO — restaurar datos desde backup' AS resultado;
