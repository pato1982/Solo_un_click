-- Migración 006: Fase 3 — MFA + OWASP ASVS Level 2
-- Fecha: 2026-04-17
-- Descripción: Columnas MFA en users, tabla mfa_attempts, tabla mfa_tokens_pendientes

-- 1. Agregar columnas MFA a tabla users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mfa_enabled       TINYINT(1)   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mfa_secret        VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mfa_backup_codes  TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mfa_enabled_at    TIMESTAMP    DEFAULT NULL;

-- 2. Tabla de intentos MFA (rate limiting y auditoría)
CREATE TABLE IF NOT EXISTS mfa_attempts (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  success     TINYINT(1)   NOT NULL DEFAULT 0,
  ip          VARCHAR(50)  DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mfa_attempts_user   (user_id),
  INDEX idx_mfa_attempts_time   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de tokens MFA pendientes (para el flujo de login en 2 pasos)
-- Cuando password es válida pero MFA aún no verificado, se emite un mfa_token temporal
CREATE TABLE IF NOT EXISTS mfa_pending_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  VARCHAR(64)  NOT NULL,
  expires_at  TIMESTAMP    NOT NULL,
  used        TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mfa_pending_token (token_hash),
  INDEX idx_mfa_pending_user (user_id),
  INDEX idx_mfa_pending_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Índice para lookup rápido de usuarios con MFA activo
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users (mfa_enabled);
