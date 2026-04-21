-- Migración 005: Hardening de Autenticación (Fase 1)
-- Fecha: 2026-04-17

-- 1. Columnas de account lockout en users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL;

-- 2. Tabla de refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at  DATETIME NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash)
);
