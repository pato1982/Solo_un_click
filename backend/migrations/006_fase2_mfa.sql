-- Migración 006: MFA (Autenticación de Dos Factores) — Fase 2
-- Columnas en users + tablas de soporte para TOTP con speakeasy
-- MFA deshabilitado por defecto (mfa_enabled = 0) hasta activación por usuario

-- Columnas MFA en tabla users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mfa_enabled    TINYINT(1)   NOT NULL DEFAULT 0    AFTER locked_until,
  ADD COLUMN IF NOT EXISTS mfa_secret     VARCHAR(64)  NULL     DEFAULT NULL  AFTER mfa_enabled,
  ADD COLUMN IF NOT EXISTS mfa_backup_codes JSON        NULL     DEFAULT NULL  AFTER mfa_secret,
  ADD COLUMN IF NOT EXISTS mfa_enabled_at DATETIME     NULL     DEFAULT NULL  AFTER mfa_backup_codes;

-- Intentos de verificación MFA (rate limiting por usuario)
CREATE TABLE IF NOT EXISTS mfa_attempts (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  success    TINYINT(1)   NOT NULL DEFAULT 0,
  ip         VARCHAR(45)  NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mfa_attempts_user_time (user_id, created_at),
  CONSTRAINT fk_mfa_attempts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens temporales de segundo factor (paso intermedio entre /login y /mfa/verify)
CREATE TABLE IF NOT EXISTS mfa_pending_tokens (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  token_hash VARCHAR(64)  NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  expires_at DATETIME     NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mfa_pending_token (token_hash),
  KEY idx_mfa_pending_user (user_id),
  CONSTRAINT fk_mfa_pending_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
