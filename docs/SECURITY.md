# Política de Seguridad — Sistema de Autenticación

**Proyecto:** Solo a un Click  
**Versión:** 3.0 (post-hardening Fase 3)  
**Última revisión:** 2026-04-17  
**Clasificación:** Interno — Equipo de Desarrollo y Operaciones

---

## 1. Alcance

Este documento cubre las políticas de seguridad del sistema de autenticación del marketplace "Solo a un Click". Incluye registro de usuarios, inicio de sesión, gestión de sesiones, autenticación multifactor (MFA), y controles relacionados.

---

## 2. Política de Contraseñas (OWASP ASVS V2.1)

| Requisito | Valor |
|-----------|-------|
| Longitud mínima | 12 caracteres |
| Longitud máxima | Sin límite (bcrypt trunca a 72) |
| Contraseñas comunes | Bloqueadas (lista de 16+ patrones comunes) |
| Algoritmo de hash | bcryptjs, cost factor 12 |
| Reset de contraseña | Token SHA-256 de 32 bytes, expira en 1 hora, uso único |

**Cambios de contraseña:** El endpoint de reset invalida el token tras el primer uso (`usado=1`).  
**Historial:** No se almacenan contraseñas anteriores en esta versión.

---

## 3. Autenticación Multifactor (MFA)

### 3.1 Método soportado

| Método | Estado |
|--------|--------|
| TOTP (Google Authenticator, Authy) | ✅ Activo |
| SMS | ❌ No implementado |
| Email OTP | ❌ No implementado |

### 3.2 Flujo de login con MFA activo

```
1. Usuario envía email + password → POST /api/v1/auth/login
2. Si credenciales válidas y MFA activo:
   → Responde: { mfa_required: true, mfa_token: "<token_temporal>" }
   → mfa_token es un token aleatorio de 32 bytes, válido 5 minutos, hash SHA-256 en DB
3. Usuario envía mfa_token + código TOTP → POST /api/v1/auth/mfa/verify
4. Si código válido: emite JWT de acceso (15m) + refresh token (7d) en cookies HttpOnly
```

### 3.3 Códigos de recuperación (backup codes)

- Se generan **8 códigos** al activar MFA (hex aleatorio de 5 bytes en mayúsculas)
- Cada código es de **uso único** (se elimina del array tras usarse)
- Se almacenan como JSON en `users.mfa_backup_codes`
- El usuario puede regenerar códigos desde su perfil (requiere TOTP activo)

### 3.4 Rate limiting MFA

- Máximo **5 intentos fallidos por minuto** por usuario (controlado en DB `mfa_attempts`)
- Máximo **5 requests/minuto** por IP en endpoints MFA (via express-rate-limit + Redis)

---

## 4. Gestión de Sesiones (OWASP ASVS V3.x)

| Parámetro | Valor |
|-----------|-------|
| Access token | JWT, 15 minutos, HS256 |
| Refresh token | JWT, 7 días, almacenado como hash SHA-256 en DB |
| Almacenamiento | Cookies HttpOnly + SameSite=Strict |
| Rotación | Refresh token se rota en cada uso (revoked_at) |
| Logout | Invalida refresh token en DB + borra cookies |
| Account lockout | 5 intentos fallidos → bloqueo 15 minutos |

**JWT_SECRET:** Mínimo 32 caracteres, validado al arrancar el servidor. Si no está configurado, el proceso termina con error fatal.

---

## 5. Headers de Seguridad HTTP (OWASP ASVS V9.x)

Implementados con `helmet.js`:

| Header | Valor |
|--------|-------|
| Content-Security-Policy | default-src 'self'; scripts solo 'self' |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff (helmet default) |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | helmet default |

---

## 6. Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Global | 300 requests/IP | 15 minutos |
| `/auth/login` `/auth/register` `/auth/refresh` | 10 requests/IP | 15 minutos |
| `/auth/mfa/verify` `/auth/mfa/enable` | 5 requests/IP | 1 minuto |
| `/password-reset` | 5 requests/IP | 1 hora |
| `/upload` | 20 requests/IP | 1 minuto |

Backend de store: **Redis** (con fallback a memoria si Redis no disponible).

---

## 7. Control de Acceso (OWASP ASVS V4.1)

| Rol | Acceso |
|-----|--------|
| `null` (usuario regular) | CRUD de sus propios recursos |
| `programador` | Acceso a endpoints de administración (estadísticas, eventos, locales) |

El rol se verifica en DB en cada request protegido (`programadorMiddleware`). No se confía en el payload del JWT para autorización de roles elevados.

---

## 8. Validación de Inputs (OWASP ASVS V5.1)

- Todos los endpoints de auth usan `express-validator`
- Email: `isEmail().normalizeEmail()`
- Password: `isLength({ min: 12 })`
- Campos de texto: `trim().escape()`
- Queries SQL: **100% parametrizadas** (mysql2 prepared statements)
- Sanitización adicional en campos de texto libre: función `sanitize()` que elimina tags HTML

---

## 9. Logging de Seguridad (OWASP ASVS V7.1)

Eventos registrados con Winston (JSON estructurado):

| Evento | Level | Datos registrados |
|--------|-------|-------------------|
| `auth:login_success` | info | userId, email, requestId |
| `auth:login_failed` | warn | userId, email, attempts |
| `auth:lockout_activated` | warn | userId, email, lockUntil |
| `auth:lockout_blocked` | warn | userId, lockedUntil |
| `auth:mfa_required` | info | userId, email |
| `auth:register` | info | userId, email |
| MFA attempt (DB) | — | userId, success, ip |
| MFA enabled/disabled | info | userId, ip |
| Request log | info/warn/error | method, path, status, ms, ip |

Logs almacenados en `backend/logs/` con rotación (5MB, 5 archivos).

---

## 10. TLS / HTTPS (OWASP ASVS V9.1)

- TLS configurado en Nginx (terminación SSL en proxy inverso)
- HSTS activado con `preload` → fuerza HTTPS en navegadores desde primera visita
- Certificados: Let's Encrypt (renovación automática via certbot)
- Cookies con `secure: true` en producción (solo se envían por HTTPS)

---

## 11. Conformidad OWASP ASVS Level 2

| Control | Estado | Notas |
|---------|--------|-------|
| V2.1 Política de contraseñas | ✅ | Mín. 12 chars, lista de comunes |
| V2.2 Mecanismos de auth seguros | ✅ | bcrypt 12, JWT HS256, TOTP |
| V2.4 Almacenamiento seguro de credenciales | ✅ | bcryptjs hash, sin plaintext |
| V3.2 Tokens de sesión seguros | ✅ | HttpOnly, SameSite=Strict, Secure |
| V3.3 Expiración de sesión | ✅ | Access 15m, Refresh 7d configurable |
| V3.4 Tokens en cookies seguras | ✅ | SameSite=Strict, HttpOnly |
| V3.7 Logout con invalidación | ✅ | Revoke en DB |
| V4.1 Control de acceso por roles | ✅ | RBAC básico (null / programador) |
| V5.1 Validación de inputs | ✅ | express-validator en todos los endpoints |
| V7.1 Logging de eventos de seguridad | ✅ | Winston JSON estructurado |
| V9.1 TLS en producción | ✅ | Nginx + Let's Encrypt + HSTS |
| V13.1 MFA para cuentas sensibles | ✅ | TOTP opcional para todos |

---

## 12. Gestión de Secretos

### Principios

- **Nunca en git:** Credenciales, tokens y contraseñas nunca se commiten al repositorio.
- **`.env` en servidor:** Las variables secretas viven exclusivamente en `/var/www/soloaunclick/backend/.env` en el VPS.
- **`ecosystem.config.js` limpio:** Solo define estructura de PM2 (nombre, script, modo). Sin credenciales.
- **dotenv en arranque:** `server.js` llama `require('dotenv').config()` como primera línea para cargar `.env`.
- **`.env.example` documentado:** Todo secreto necesario está listado en `backend/.env.example` con descripción, sin valores reales.

### Variables secretas actuales

| Variable | Descripción | Longitud mínima |
|----------|-------------|-----------------|
| `JWT_SECRET` | Firma de access tokens | 96 chars hex |
| `REFRESH_SECRET` | Firma de refresh tokens | 96 chars hex |
| `DB_PASS` | Password MySQL usuario `soloaunclick` | 32+ chars |
| `SMTP_PASS` | App password SMTP para emails | — |
| `SENTRY_DSN` | DSN de Sentry (no es secreto estricto, pero se trata como variable de entorno) | — |

### Incidente de historial git (2026-04-17 a 2026-04-20)

En el commit `564d129` (2026-04-14), credenciales hardcodeadas fueron introducidas en `ecosystem.config.js`.
El commit `489c015` (2026-04-17) las eliminó del código, pero permanecen en el historial.

**Estado del repositorio:** público en GitHub (`pato1982/Solo_un_click`).  
**Acción tomada (2026-04-20):** Todas las credenciales comprometidas fueron rotadas en el VPS.
Las credenciales antiguas (`SoloUnClick2026`, `soloaunclick_jwt_2026_villarrica_key_change_this`) **ya no son válidas**.

**Decisión sobre rewrite de historial:** No se realizó `git filter-repo` + force-push por el riesgo
de ruptura del historial para colaboradores activos. La rotación de credenciales es la mitigación
suficiente dado que las credenciales antiguas quedaron inservibles.

---

## 13. Política de Rotación de Credenciales

| Credencial | Frecuencia mínima | Rotación inmediata si... |
|------------|-------------------|--------------------------|
| `JWT_SECRET` | 90 días | Posible compromiso, cambio de equipo |
| `REFRESH_SECRET` | 90 días | Posible compromiso |
| `DB_PASS` | 90 días | Posible compromiso, acceso de ex-colaborador |
| `SMTP_PASS` | 180 días | Posible compromiso |
| Llaves SSH (`villarrica`) | 365 días | Posible compromiso, pérdida del archivo |

Para el proceso de rotación, ver `docs/DISASTER_RECOVERY.md` — Escenario 3.

---

## 14. Referencias y Runbooks

- **Runbook de login/autenticación:** `docs/RUNBOOK_LOGIN.md`
- **Infraestructura y accesos:** `docs/INFRASTRUCTURE.md`
- **Proceso de deploy:** `docs/DEPLOYMENT.md`
- **Recuperación ante desastres:** `docs/DISASTER_RECOVERY.md`
- **Monitoreo:** `docs/MONITORING_SETUP.md`

---

## 16. Divulgación Responsable

Si descubres una vulnerabilidad de seguridad en este proyecto, por favor repórtala de forma privada a:

- **Email:** [Completar con email de seguridad del equipo]
- **No publicar** el detalle de la vulnerabilidad antes de que sea corregida

El equipo se compromete a responder dentro de **72 horas** y a publicar un parche en un plazo razonable.

---

## 17. Revisión de este Documento

Este documento debe revisarse:
- Cada 6 meses o después de cambios arquitectónicos significativos
- Después de cualquier incidente de seguridad
- Antes de cada lanzamiento mayor a producción
