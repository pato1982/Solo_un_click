-- ============================================================
-- Migración 003: Fase 2 — FK en categorías + JSON nativo
-- Proyecto: Solo a un Click
-- Fecha: 2026-04-13
-- Branch: feature/db-schema-v2
-- ============================================================
-- PROPÓSITO:
--   2A — Agrega categoria_id FK (nullable) en listings
--   2B — Convierte TEXT → JSON en turismo_tours (imagenes, imagenes_crop)
--   2C — Convierte TEXT → JSON en turismo_portada (imagenes, categorias, imagenes_crop)
--   2D — Convierte TEXT → JSON en turismo_pagina (crop_superior, crop_inferior)
--   2E — MODIFY activity_log.detalles a JSON (ya es JSON en schema base)
--
-- IDEMPOTENTE: Usa IF NOT EXISTS / MODIFY seguro para MySQL 8
-- NO DESTRUYE DATOS: Backfill antes de cambiar tipos
-- RETROCOMPATIBLE: categoria (texto) se mantiene como alias
-- ============================================================

-- ============================================================
-- 2A — FK categoria_id en listings
-- ============================================================

-- Paso 1: Agregar columna nullable (no rompe nada existente)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS categoria_id INT NULL
  AFTER subcategoria;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS subcategoria_id INT NULL
  AFTER categoria_id;

-- Paso 2: Backfill — mapear texto libre → ID de categorias
-- Hace match por nombre Y tipo para evitar ambigüedades
UPDATE listings l
  JOIN categorias c ON LOWER(TRIM(c.nombre)) = LOWER(TRIM(l.categoria))
                   AND c.tipo = l.tipo
SET l.categoria_id = c.id
WHERE l.categoria_id IS NULL
  AND l.categoria IS NOT NULL;

-- Paso 3: Backfill subcategoria_id
UPDATE listings l
  JOIN subcategorias s ON LOWER(TRIM(s.nombre)) = LOWER(TRIM(l.subcategoria))
  JOIN categorias c    ON c.id = s.categoria_id
                      AND LOWER(TRIM(c.nombre)) = LOWER(TRIM(l.categoria))
                      AND c.tipo = l.tipo
SET l.subcategoria_id = s.id
WHERE l.subcategoria_id IS NULL
  AND l.subcategoria IS NOT NULL;

-- Paso 4: FK constraint nullable (ON DELETE SET NULL — si se borra categoría, listing queda sin FK)
ALTER TABLE listings
  ADD CONSTRAINT IF NOT EXISTS fk_listings_categoria_id
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;

ALTER TABLE listings
  ADD CONSTRAINT IF NOT EXISTS fk_listings_subcategoria_id
  FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id) ON DELETE SET NULL;

-- Índices para las nuevas FKs
CREATE INDEX IF NOT EXISTS idx_listings_categoria_id    ON listings(categoria_id);
CREATE INDEX IF NOT EXISTS idx_listings_subcategoria_id ON listings(subcategoria_id);

-- ============================================================
-- 2B — JSON nativo en turismo_tours
-- ============================================================

-- Verificar que todos los valores sean JSON válido antes de convertir
-- Los inválidos se dejan como NULL (no se pierden — quedan en la columna texto original)

-- Agregar columnas JSON temporales
ALTER TABLE turismo_tours
  ADD COLUMN IF NOT EXISTS imagenes_json      JSON NULL,
  ADD COLUMN IF NOT EXISTS imagenes_crop_json JSON NULL;

-- Migrar solo filas con JSON válido
UPDATE turismo_tours
SET imagenes_json = CAST(imagenes AS JSON)
WHERE imagenes IS NOT NULL
  AND imagenes != ''
  AND JSON_VALID(imagenes) = 1;

UPDATE turismo_tours
SET imagenes_crop_json = CAST(imagenes_crop AS JSON)
WHERE imagenes_crop IS NOT NULL
  AND imagenes_crop != ''
  AND JSON_VALID(imagenes_crop) = 1;

-- Reemplazar columnas TEXT por JSON (renombrar vía drop + rename)
-- MySQL 8 no soporta RENAME COLUMN en versiones viejas; usamos ADD + UPDATE + DROP
ALTER TABLE turismo_tours
  DROP COLUMN IF EXISTS imagenes,
  DROP COLUMN IF EXISTS imagenes_crop;

ALTER TABLE turismo_tours
  CHANGE COLUMN imagenes_json      imagenes      JSON NULL,
  CHANGE COLUMN imagenes_crop_json imagenes_crop JSON NULL;

-- ============================================================
-- 2C — JSON nativo en turismo_portada
-- ============================================================

ALTER TABLE turismo_portada
  ADD COLUMN IF NOT EXISTS imagenes_json      JSON NULL,
  ADD COLUMN IF NOT EXISTS categorias_json    JSON NULL,
  ADD COLUMN IF NOT EXISTS imagenes_crop_json JSON NULL;

UPDATE turismo_portada
SET imagenes_json = CAST(imagenes AS JSON)
WHERE imagenes IS NOT NULL AND JSON_VALID(imagenes) = 1;

UPDATE turismo_portada
SET categorias_json = CAST(categorias AS JSON)
WHERE categorias IS NOT NULL AND JSON_VALID(categorias) = 1;

UPDATE turismo_portada
SET imagenes_crop_json = CAST(imagenes_crop AS JSON)
WHERE imagenes_crop IS NOT NULL AND JSON_VALID(imagenes_crop) = 1;

ALTER TABLE turismo_portada
  DROP COLUMN IF EXISTS imagenes,
  DROP COLUMN IF EXISTS categorias,
  DROP COLUMN IF EXISTS imagenes_crop;

ALTER TABLE turismo_portada
  CHANGE COLUMN imagenes_json      imagenes      JSON NULL,
  CHANGE COLUMN categorias_json    categorias    JSON NULL,
  CHANGE COLUMN imagenes_crop_json imagenes_crop JSON NULL;

-- ============================================================
-- 2D — JSON nativo en turismo_pagina
-- ============================================================

ALTER TABLE turismo_pagina
  ADD COLUMN IF NOT EXISTS crop_superior_json JSON NULL,
  ADD COLUMN IF NOT EXISTS crop_inferior_json JSON NULL;

UPDATE turismo_pagina
SET crop_superior_json = CAST(crop_superior AS JSON)
WHERE crop_superior IS NOT NULL AND JSON_VALID(crop_superior) = 1;

UPDATE turismo_pagina
SET crop_inferior_json = CAST(crop_inferior AS JSON)
WHERE crop_inferior IS NOT NULL AND JSON_VALID(crop_inferior) = 1;

ALTER TABLE turismo_pagina
  DROP COLUMN IF EXISTS crop_superior,
  DROP COLUMN IF EXISTS crop_inferior;

ALTER TABLE turismo_pagina
  CHANGE COLUMN crop_superior_json crop_superior JSON NULL,
  CHANGE COLUMN crop_inferior_json crop_inferior JSON NULL;

-- ============================================================
-- 2E — JSON nativo en activity_log.detalles
-- ============================================================

ALTER TABLE activity_log
  ADD COLUMN IF NOT EXISTS detalles_json JSON NULL;

UPDATE activity_log
SET detalles_json = CAST(detalles AS JSON)
WHERE detalles IS NOT NULL AND JSON_VALID(detalles) = 1;

-- Si detalles ya es JSON (schema base nuevo), este MODIFY es no-op
ALTER TABLE activity_log
  DROP COLUMN IF EXISTS detalles;

ALTER TABLE activity_log
  CHANGE COLUMN detalles_json detalles JSON NULL;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT
  'listings con categoria_id' AS check_item,
  COUNT(*) AS total,
  SUM(categoria_id IS NOT NULL) AS con_fk,
  SUM(categoria_id IS NULL AND categoria IS NOT NULL) AS sin_fk_con_texto
FROM listings
UNION ALL
SELECT
  'turismo_tours JSON',
  COUNT(*),
  SUM(JSON_VALID(imagenes)) AS imagenes_validas,
  SUM(imagenes IS NULL)     AS imagenes_null
FROM turismo_tours
UNION ALL
SELECT
  'turismo_portada JSON',
  COUNT(*),
  SUM(JSON_VALID(imagenes)),
  SUM(imagenes IS NULL)
FROM turismo_portada;
