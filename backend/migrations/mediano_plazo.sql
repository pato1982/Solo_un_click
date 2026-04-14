-- ============================================================
-- MIGRACIÓN MEDIANO PLAZO — Solo a un Click
-- Fecha: 2026-04-14
-- Tareas: 4 (fusionar businesses), 5 (unificar media), 6 (JSON nativo)
-- Uso: mysql -u soloaunclick -p soloaunclick_db < migrations/mediano_plazo.sql
-- ============================================================

-- ============================================================
-- TAREA 4: Fusionar businesses + turismo_negocios
-- ============================================================

-- Agregar columna ubicacion a businesses (sólo si no existe)
SET @has_ubicacion = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'businesses' AND COLUMN_NAME = 'ubicacion'
);
SET @alter_sql = IF(@has_ubicacion = 0,
  'ALTER TABLE businesses ADD COLUMN ubicacion VARCHAR(255) AFTER direccion',
  'SELECT "ubicacion ya existe, sin cambios" AS info'
);
PREPARE _s FROM @alter_sql;
EXECUTE _s;
DEALLOCATE PREPARE _s;

-- Migrar registros de turismo_negocios que no tienen entrada en businesses
INSERT INTO businesses (user_id, nombre_negocio, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios, activo)
SELECT
  tn.user_id,
  tn.nombre,
  tn.descripcion,
  tn.direccion,
  tn.ubicacion,
  tn.whatsapp,
  tn.telefono,
  tn.correo,
  tn.facebook,
  tn.instagram,
  tn.horarios,
  COALESCE(tn.activo, 1)
FROM turismo_negocios tn
LEFT JOIN businesses b ON b.user_id = tn.user_id
WHERE b.id IS NULL;

-- Copiar ubicacion a businesses existentes si aún no la tienen
UPDATE businesses b
JOIN turismo_negocios tn ON b.user_id = tn.user_id
SET b.ubicacion = tn.ubicacion
WHERE b.ubicacion IS NULL AND tn.ubicacion IS NOT NULL;

-- ============================================================
-- TAREA 5: Crear tabla media y migrar imágenes
-- ============================================================

CREATE TABLE IF NOT EXISTS media (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   INT          NOT NULL,
  url         VARCHAR(500) NOT NULL,
  orden       INT          DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_entity (entity_type, entity_id)
);

-- Migrar listing_images → media (sólo entidades que aún no existen en media)
INSERT INTO media (entity_type, entity_id, url, orden, created_at)
SELECT
  'listing',
  li.listing_id,
  li.url,
  ROW_NUMBER() OVER (PARTITION BY li.listing_id ORDER BY li.id) AS orden,
  li.created_at
FROM listing_images li
WHERE li.listing_id NOT IN (
  SELECT DISTINCT entity_id FROM media WHERE entity_type = 'listing'
);

-- Migrar carousel_images → media
INSERT INTO media (entity_type, entity_id, url, orden, created_at)
SELECT
  'carousel',
  ci.carousel_id,
  ci.imagen_url,
  ci.orden,
  NOW()
FROM carousel_images ci
WHERE ci.carousel_id NOT IN (
  SELECT DISTINCT entity_id FROM media WHERE entity_type = 'carousel'
);

-- ============================================================
-- TAREA 6: Migrar campos JSON-en-TEXT a tipo JSON nativo
-- ============================================================

-- businesses.horarios
UPDATE businesses SET horarios = NULL
WHERE horarios IS NOT NULL AND TRIM(horarios) IN ('', 'null', '[]', '{}');
ALTER TABLE businesses MODIFY COLUMN horarios JSON;

-- turismo_negocios.horarios (tabla legacy, se mantiene por compatibilidad)
UPDATE turismo_negocios SET horarios = NULL
WHERE horarios IS NOT NULL AND TRIM(horarios) IN ('', 'null', '[]', '{}');
ALTER TABLE turismo_negocios MODIFY COLUMN horarios JSON;

-- turismo_tours
UPDATE turismo_tours SET imagenes = NULL
WHERE imagenes IS NOT NULL AND TRIM(imagenes) IN ('', 'null', '[]');
UPDATE turismo_tours SET imagenes_crop = NULL
WHERE imagenes_crop IS NOT NULL AND TRIM(imagenes_crop) IN ('', 'null', '[]', '{}');
ALTER TABLE turismo_tours
  MODIFY COLUMN imagenes JSON,
  MODIFY COLUMN imagenes_crop JSON;

-- turismo_portada
UPDATE turismo_portada SET imagenes = NULL
WHERE imagenes IS NOT NULL AND TRIM(imagenes) IN ('', 'null', '[]');
UPDATE turismo_portada SET categorias = NULL
WHERE categorias IS NOT NULL AND TRIM(categorias) IN ('', 'null', '[]');
ALTER TABLE turismo_portada
  MODIFY COLUMN imagenes JSON,
  MODIFY COLUMN categorias JSON;

SELECT 'Migración mediano plazo completada ✓' AS resultado;
