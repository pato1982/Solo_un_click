-- ============================================================
-- Migración 002: Fase 1 — Unificación businesses + soft delete
-- Proyecto: Solo a un Click
-- Fecha: 2026-04-13
-- Branch: feature/db-schema-v2
-- ============================================================
-- PROPÓSITO:
--   1. Unificar businesses y turismo_negocios en una sola tabla
--   2. Agregar soft delete a listings (deleted_at)
--   3. Usar tipo JSON nativo para horarios en businesses
--   4. Migrar datos existentes de turismo_negocios → businesses
--
-- IDEMPOTENTE: Seguro de ejecutar más de una vez (IF NOT EXISTS / IF EXISTS)
-- NO DESTRUYE DATOS: Solo agrega columnas y migra, no borra nada
-- RETROCOMPATIBLE: El frontend no requiere cambios
-- ============================================================

-- =====================
-- PASO 1: Agregar columnas nuevas a businesses
-- =====================

-- Columna: tipo ('general' | 'turismo')
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'general'
  AFTER instagram;

-- Columna: ubicacion (antes solo en turismo_negocios)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(255) NULL
  AFTER direccion;

-- Columna: activo (antes solo en turismo_negocios)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1
  AFTER tipo;

-- Columna: horarios — cambiar de TEXT a JSON nativo
-- NOTA: MySQL convierte automáticamente TEXT válido a JSON.
-- Si algún valor no es JSON válido, la columna queda como NULL.
ALTER TABLE businesses
  MODIFY COLUMN horarios JSON NULL;

-- Índice para filtrar por tipo
CREATE INDEX IF NOT EXISTS idx_businesses_tipo ON businesses(tipo);

-- =====================
-- PASO 2: Marcar negocios generales existentes con tipo='general'
-- =====================
UPDATE businesses SET tipo = 'general' WHERE tipo = 'general' OR tipo IS NULL OR tipo = '';

-- =====================
-- PASO 3: Migrar turismo_negocios → businesses
-- Solo migra registros de usuarios turismo que AÚN NO tienen entrada en businesses
-- =====================
INSERT INTO businesses (user_id, nombre_negocio, descripcion, direccion, ubicacion,
                        whatsapp, telefono, correo, facebook, instagram, horarios, tipo, activo)
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
  -- Intentar convertir TEXT a JSON; si falla, usar NULL
  CASE
    WHEN tn.horarios IS NOT NULL AND tn.horarios != ''
         AND JSON_VALID(tn.horarios) = 1
    THEN CAST(tn.horarios AS JSON)
    ELSE NULL
  END,
  'turismo',
  tn.activo
FROM turismo_negocios tn
WHERE NOT EXISTS (
  SELECT 1 FROM businesses b WHERE b.user_id = tn.user_id
)
ON DUPLICATE KEY UPDATE
  nombre_negocio = VALUES(nombre_negocio),
  ubicacion      = VALUES(ubicacion),
  tipo           = 'turismo',
  activo         = VALUES(activo);

-- =====================
-- PASO 4: Agregar soft delete a listings
-- =====================
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL
  AFTER activo;

CREATE INDEX IF NOT EXISTS idx_listings_deleted ON listings(deleted_at);

-- =====================
-- VERIFICACIÓN FINAL
-- =====================
SELECT
  'businesses' AS tabla,
  COUNT(*) AS total,
  SUM(tipo = 'general') AS tipo_general,
  SUM(tipo = 'turismo') AS tipo_turismo
FROM businesses
UNION ALL
SELECT
  'listings_con_soft_delete',
  COUNT(*),
  SUM(deleted_at IS NULL),
  SUM(deleted_at IS NOT NULL)
FROM listings;
