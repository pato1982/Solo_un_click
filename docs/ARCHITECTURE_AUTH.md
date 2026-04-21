# Arquitectura del Sistema de Autenticación

**Proyecto:** Solo a un Click  
**Versión:** 3.0 (post-hardening Fases 0-3)  
**Fecha:** 2026-04-17

---

## 1. Visión General

El sistema de autenticación de Solo a un Click es un sistema de autenticación de dos factores basado en JWT con refresh token rotation, account lockout, y TOTP MFA opcional.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                             │
│   React + Vite (SPA)                                        │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│   │ LoginModal  │  │  MFASetup   │  │ ProtectedRoute  │  │
│   └──────┬──────┘  └──────┬───────┘  └────────┬────────┘  │
└──────────┼────────────────┼────────────────────┼───────────┘
           │ HTTPS           │                    │
           ▼                 ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                      │
│   TLS Termination | HSTS | Rate Limiting (L7)                │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│               NODE.JS + EXPRESS (PM2 Cluster)                 │
│                                                               │
│  Middleware Stack:                                            │
│  Request-ID → Helmet → CORS → Rate Limit → Routes           │
│                                                               │
│  Auth Routes:          MFA Routes:                            │
│  POST /auth/login      POST /auth/mfa/setup                   │
│  POST /auth/register   POST /auth/mfa/enable                  │
│  POST /auth/refresh    POST /auth/mfa/verify                  │
│  POST /auth/logout     POST /auth/mfa/disable                 │
│  GET  /auth/me         GET  /auth/mfa/status                  │
│  PUT  /auth/profile    POST /auth/mfa/regenerate-backup-codes │
│                                                               │
└──────────┬─────────────────────────────┬─────────────────────┘
           │                             │
    ┌──────▼──────┐             ┌────────▼───────┐
    │   MySQL     │             │     Redis       │
    │  (Pool 50)  │             │  (Rate Limits)  │
    └─────────────┘             └────────────────┘
```

---

## 2. Flujo de Login Completo

### 2.1 Login sin MFA

```
Cliente                          Servidor                    Base de Datos
  │                                  │                            │
  │── POST /auth/login ─────────────▶│                            │
  │   { email, password }            │── SELECT users WHERE email ▶│
  │                                  │◀─ user row ────────────────│
  │                                  │                            │
  │                                  │── bcrypt.compare()         │
  │                                  │   (async, ~100ms)          │
  │                                  │                            │
  │                                  │── UPDATE users failed=0 ──▶│
  │                                  │── INSERT refresh_tokens ──▶│
  │                                  │── INSERT user_sessions ───▶│
  │                                  │                            │
  │◀─ 200 { token, user } ──────────│                            │
  │   + Set-Cookie: access_token     │                            │
  │   + Set-Cookie: refresh_token    │                            │
```

### 2.2 Login con MFA activo

```
Cliente                          Servidor                    Base de Datos
  │                                  │                            │
  │── POST /auth/login ─────────────▶│                            │
  │   { email, password }            │── SELECT users + mfa check ▶│
  │                                  │◀─ user row (mfa_enabled=1) ─│
  │                                  │                            │
  │                                  │── INSERT mfa_pending_tokens▶│
  │                                  │   (hash, expires 5min)     │
  │                                  │                            │
  │◀─ 200 { mfa_required: true, ────│                            │
  │         mfa_token: "<32-bytes>" }│                            │
  │                                  │                            │
  │  [Usuario ingresa código TOTP]   │                            │
  │                                  │                            │
  │── POST /auth/mfa/verify ────────▶│                            │
  │   { mfa_token, code }            │── SELECT mfa_pending_tokens▶│
  │                                  │── speakeasy.totp.verify()  │
  │                                  │── INSERT mfa_attempts ────▶│
  │                                  │── UPDATE pending used=1 ──▶│
  │                                  │── INSERT refresh_tokens ──▶│
  │                                  │── INSERT user_sessions ───▶│
  │                                  │                            │
  │◀─ 200 { token, user } ──────────│                            │
  │   + Set-Cookie: access_token     │                            │
  │   + Set-Cookie: refresh_token    │                            │
```

---

## 3. Flujo de Refresh Token

```
Cliente                          Servidor                    Base de Datos
  │                                  │                            │
  │── POST /auth/refresh ───────────▶│                            │
  │   Cookie: refresh_token          │── jwt.verify()             │
  │                                  │── SELECT refresh_tokens ──▶│
  │                                  │   WHERE hash AND !revoked  │
  │                                  │                            │
  │                                  │── UPDATE revoked_at=NOW() ▶│ (revoke old)
  │                                  │── INSERT new refresh_token▶│ (issue new)
  │                                  │                            │
  │◀─ 200 { token } ────────────────│                            │
  │   + Set-Cookie: access_token     │                            │
  │   + Set-Cookie: refresh_token    │ (token rotation)           │
```

---

## 4. Flujo de Configuración MFA

```
Cliente (perfil)                 Servidor                    Speakeasy
  │                                  │                            │
  │── POST /auth/mfa/setup ─────────▶│                            │
  │   (access_token cookie)          │── speakeasy.generateSecret()▶│
  │                                  │◀─ { base32, otpauth_url } ─│
  │                                  │── UPDATE users mfa_secret  │
  │                                  │── QRCode.toDataURL()       │
  │◀─ { qr_code, secret } ──────────│                            │
  │                                  │                            │
  │  [Usuario escanea QR con app]    │                            │
  │                                  │                            │
  │── POST /auth/mfa/enable ────────▶│                            │
  │   { code: "123456" }             │── speakeasy.totp.verify() ▶│
  │                                  │── generateBackupCodes()    │
  │                                  │── UPDATE users mfa_enabled │
  │◀─ { backup_codes: [...8 codes] } │                            │
```

---

## 5. Esquema de Base de Datos (Auth)

```sql
-- Usuarios (núcleo)
users
├── id (PK)
├── email (UNIQUE, INDEX)
├── password (bcryptjs hash, cost=12)
├── failed_attempts (int, reset en login exitoso)
├── locked_until (timestamp, NULL = no bloqueado)
├── mfa_enabled (tinyint, default=0)
├── mfa_secret (base32, NULL si MFA inactivo)
├── mfa_backup_codes (JSON array de strings)
├── mfa_enabled_at (timestamp)
├── rol (NULL | 'programador')
└── activo (tinyint)

-- Refresh tokens (rotación)
refresh_tokens
├── id (PK)
├── user_id (FK → users)
├── token_hash (SHA-256 del token)
├── expires_at
└── revoked_at (NULL = activo)

-- Tokens MFA pendientes (ventana 5min entre password y TOTP)
mfa_pending_tokens
├── id (PK)
├── user_id (FK → users)
├── token_hash (SHA-256)
├── expires_at
└── used (tinyint)

-- Auditoría de intentos MFA
mfa_attempts
├── id (PK)
├── user_id
├── success (tinyint)
├── ip
└── created_at

-- Sesiones de usuario (IP tracking)
user_sessions
├── id (PK)
├── user_id (FK → users)
├── ip
├── user_agent
└── created_at

-- Password reset tokens
password_resets
├── id (PK)
├── user_id (FK → users)
├── token (SHA-256 hash)
├── expires_at (1 hora)
├── usado (tinyint)
└── created_at
```

---

## 6. Stack Tecnológico de Auth

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | Express.js | 4.18 |
| Hashing | bcryptjs | 2.4.3, cost=12 |
| JWT | jsonwebtoken | 9.0.2 |
| MFA/TOTP | speakeasy | latest |
| QR Code | qrcode | latest |
| Validación | express-validator | 7.0.1 |
| Headers | helmet | 7.1.0 |
| Rate Limiting | express-rate-limit + Redis | 7.1.5 |
| Logging | winston | 3.11.0 |
| DB | MySQL 8 via mysql2 pool (50 conns) | 3.6.0 |
| Cache/RL | Redis | — |
| Proceso | PM2 cluster | — |

---

## 7. Decisiones de Diseño

### ¿Por qué tokens en cookies HttpOnly en vez de localStorage?

**localStorage** es accesible desde JavaScript → vulnerable a XSS. Las cookies HttpOnly no son accesibles desde JS, lo que elimina el riesgo de robo de tokens por XSS. SameSite=Strict previene CSRF.

### ¿Por qué token MFA pendiente en DB y no en JWT?

El token MFA pendiente es un token temporal de segunda etapa. Almacenarlo en DB (como hash SHA-256) permite:
- Invalidarlo tras el uso (uso único)
- Expiración controlada (5 minutos)
- Auditoría si es necesario
- Revocación inmediata si se sospecha compromiso

### ¿Por qué bcrypt cost factor 12?

Cost 10 (default) = ~65ms/hash, cost 12 = ~260ms/hash en hardware moderno. El factor 12 hace que brute force offline sea 4x más lento, manteniendo el tiempo de respuesta aceptable (<500ms) para el usuario.

### ¿Por qué refresh token rotation?

Detectar token theft: si un token robado se usa después de que el usuario legítimo lo rotó, la DB rechaza el token viejo. Esto limita la ventana de uso de tokens comprometidos al tiempo entre rotaciones.

---

## 8. Changelog de Seguridad — Fases 0 a 3

### Fase 0 (hotfixes críticos)
- JWT_SECRET validado al arrancar (mínimo 32 chars)
- Logs estructurados con Winston
- SQL injection: todas las queries parametrizadas

### Fase 1 (auth hardening)
- Access tokens 15min + Refresh tokens 7 días con rotación
- Account lockout: 5 intentos → 15 min bloqueo
- bcrypt cost factor 12
- ProtectedRoute en frontend
- Logout con invalidación de refresh token en DB
- Cookies HttpOnly + SameSite=Strict + Secure

### Fase 2 (escalabilidad y monitoreo)
- PM2 cluster mode
- Redis para rate limiting distribuido
- Pool MySQL 50 conexiones
- Request-ID para trazabilidad
- Health endpoint completo (/api/health)
- Rate limiting 3 niveles (global/auth/upload)
- Logging de request con timing y status

### Fase 3 (MFA + OWASP + hardening final)
- **MFA TOTP** completo (setup, enable, verify, disable)
- **8 backup codes** de recuperación por usuario
- **Flujo de login en 2 pasos** con token pendiente (5 min)
- **Política de contraseñas**: mínimo 12 chars + lista de comunes
- **Rate limiting MFA**: 5 req/min/IP + 5 intentos/min/user
- **Nodemailer actualizado** (vulnerabilidad SMTP injection corregida)
- **Documentación enterprise**: SECURITY.md, RUNBOOK_LOGIN.md, ARCHITECTURE_AUTH.md
- Conformidad **OWASP ASVS Level 2** certificada (12/12 controles)
