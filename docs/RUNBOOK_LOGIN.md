# Runbook Operacional — Sistema de Login

**Proyecto:** Solo a un Click  
**Versión:** 3.0  
**Audiencia:** DevOps, Desarrolladores, Soporte Nivel 2

---

## Índice Rápido

| Escenario | Sección |
|-----------|---------|
| Usuario bloqueado (lockout) | [§1](#1-usuario-bloqueado-account-lockout) |
| Usuario perdió acceso MFA | [§2](#2-recuperación-mfa) |
| Rotar JWT_SECRET | [§3](#3-rotación-de-jwt_secret) |
| Token de sesión comprometido | [§4](#4-tokens-de-sesión-comprometidos) |
| Redis caído | [§5](#5-redis-caído) |
| Brute force activo | [§6](#6-ataque-de-brute-force-activo) |
| PM2 / proceso caído | [§7](#7-pm2--proceso-caído) |

---

## 1. Usuario Bloqueado (Account Lockout)

**Síntoma:** Usuario reporta error "Cuenta bloqueada temporalmente. Intenta en 15 minutos."

**Causa:** 5 intentos de login fallidos consecutivos → `locked_until` en DB.

### Desbloqueo manual (soporte)

```sql
-- Verificar estado del usuario
SELECT id, email, failed_attempts, locked_until
FROM users
WHERE email = 'usuario@ejemplo.com';

-- Desbloquear
UPDATE users
SET failed_attempts = 0, locked_until = NULL
WHERE email = 'usuario@ejemplo.com';
```

**Nota:** El bloqueo expira automáticamente a los 15 minutos. Solo intervenir si el usuario no puede esperar o si es un falso positivo.

### Si hay múltiples bloqueos consecutivos del mismo usuario

Puede indicar credential stuffing o ataque dirigido. Revisar `mfa_attempts` y `user_sessions`:

```sql
-- Ver últimas sesiones del usuario
SELECT ip, user_agent, created_at
FROM user_sessions
WHERE user_id = <id>
ORDER BY created_at DESC
LIMIT 20;
```

Si hay IPs sospechosas → considerar bloqueo a nivel de Nginx o firewall.

---

## 2. Recuperación MFA

### 2.1 Usuario perdió acceso a su app de autenticación

**Opción 1: Usar backup codes**  
El usuario debe tener sus 8 códigos de recuperación guardados. Los ingresa en el campo de código durante el login MFA.

**Opción 2: Desactivar MFA manualmente (soporte)**

Solo hacer si el usuario ha verificado su identidad por canal alternativo (email, teléfono registrado):

```sql
-- Desactivar MFA del usuario
UPDATE users
SET mfa_enabled = 0,
    mfa_secret = NULL,
    mfa_backup_codes = NULL,
    mfa_enabled_at = NULL
WHERE email = 'usuario@ejemplo.com';
```

Registrar la intervención en el log de soporte con motivo y evidencia de verificación de identidad.

### 2.2 Backup codes agotados

Si el usuario usó todos sus backup codes y también perdió su app:

1. Verificar identidad del usuario por canal alternativo
2. Ejecutar desactivación manual (ver arriba)
3. Solicitar al usuario que reactive MFA y guarde los nuevos backup codes

---

## 3. Rotación de JWT_SECRET

**Cuándo rotar:**
- Sospecha de compromiso del secreto
- Rotación periódica de seguridad (recomendado: cada 90 días)
- Cambio de personal con acceso al servidor

**Impacto:** Todos los tokens de acceso y refresh tokens existentes quedarán inválidos. Los usuarios deberán volver a iniciar sesión.

### Procedimiento

```bash
# 1. Generar nuevo secreto (mínimo 64 caracteres)
openssl rand -hex 64

# 2. Actualizar en el servidor
ssh root@<VPS_IP>
nano /etc/soloaunclick/.env
# Cambiar JWT_SECRET y REFRESH_SECRET

# 3. Limpiar refresh tokens en DB (ya serán inválidos)
mysql -u <user> -p <dbname> -e "
  UPDATE refresh_tokens
  SET revoked_at = NOW()
  WHERE revoked_at IS NULL;
"

# 4. Limpiar tokens MFA pendientes
mysql -u <user> -p <dbname> -e "
  DELETE FROM mfa_pending_tokens WHERE expires_at < NOW();
"

# 5. Reiniciar la aplicación
pm2 restart soloaunclick-backend

# 6. Verificar que arrancó correctamente
pm2 logs soloaunclick-backend --lines 20
curl https://soloaunclick.cl/api/health
```

**Comunicar a usuarios:** Si la rotación es planificada, notificar con al menos 1 hora de anticipación que deberán volver a iniciar sesión.

---

## 4. Tokens de Sesión Comprometidos

**Síntoma:** Se sospecha que un refresh token fue robado.

### Revocar todos los tokens de un usuario específico

```sql
-- Revocar todos los refresh tokens activos del usuario
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE user_id = <user_id>
  AND revoked_at IS NULL;
```

### Revocar un token específico (si se conoce el hash)

```sql
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE token_hash = '<sha256_del_token>';
```

### Si se sospecha de múltiples usuarios afectados

Evaluar rotación completa del JWT_SECRET (ver §3).

---

## 5. Redis Caído

**Síntoma:** El servidor arranca pero los rate limiters usan memoria en lugar de Redis.

**Efecto:** Rate limiting funciona pero no es compartido entre instancias PM2. En cluster con múltiples procesos, los límites son por proceso, no globales.

### Verificar estado Redis

```bash
# En el VPS
redis-cli ping
# Respuesta esperada: PONG

# Ver logs Redis
journalctl -u redis-server -n 50

# Reiniciar Redis
sudo systemctl restart redis-server
```

### Si Redis no levanta

La aplicación continúa funcionando con rate limiting en memoria. No es crítico para disponibilidad, pero reduce protección contra brute force en entornos con múltiples procesos.

Revisar `/var/log/redis/redis-server.log` para errores específicos.

---

## 6. Ataque de Brute Force Activo

**Síntoma:** Logs muestran muchos `auth:login_failed` desde pocas IPs.

### Diagnóstico

```bash
# Ver logs de intentos fallidos recientes
cat /var/log/soloaunclick/combined.log | grep 'login_failed' | tail -100

# Contar por IP
cat /var/log/soloaunclick/combined.log | grep 'login_failed' | \
  python3 -c "
import sys, json, collections
c = collections.Counter()
for line in sys.stdin:
    try:
        d = json.loads(line)
        c[d.get('ip','?')] += 1
    except: pass
for ip, n in c.most_common(20):
    print(f'{n:5d}  {ip}')
"
```

### Bloquear IP en Nginx

```nginx
# /etc/nginx/conf.d/blocklist.conf
deny 1.2.3.4;
```

```bash
nginx -t && systemctl reload nginx
```

### Bloquear con iptables (más agresivo)

```bash
iptables -A INPUT -s 1.2.3.4 -j DROP
# Hacer persistente
iptables-save > /etc/iptables/rules.v4
```

### Verificar que account lockout esté funcionando

```sql
SELECT COUNT(*) as usuarios_bloqueados
FROM users
WHERE locked_until > NOW();
```

---

## 7. PM2 / Proceso Caído

### Ver estado

```bash
pm2 status
pm2 logs soloaunclick-backend --lines 50
```

### Reiniciar

```bash
pm2 restart soloaunclick-backend
```

### Si crashea en loop (restart loop)

```bash
pm2 logs soloaunclick-backend --err --lines 100
```

Causas comunes:
- Variables de entorno no configuradas (`JWT_SECRET`, `DB_HOST`, etc.) → revisar `.env`
- Puerto 3001 en uso → `lsof -i :3001`
- Error de sintaxis en código recién deploado → revisar último commit

### Verificar health completo

```bash
curl -s https://soloaunclick.cl/api/health | python3 -m json.tool
```

Respuesta esperada:
```json
{
  "status": "ok",
  "version": "v2",
  "services": {
    "database": { "status": "ok" },
    "redis": { "status": "ok" }
  }
}
```

---

## 8. Limpieza Periódica de Datos (Mantenimiento)

Ejecutar semanalmente o en cron:

```sql
-- Limpiar refresh tokens expirados o revocados hace más de 30 días
DELETE FROM refresh_tokens
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
   OR (revoked_at IS NOT NULL AND revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Limpiar tokens MFA pendientes expirados
DELETE FROM mfa_pending_tokens
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Limpiar intentos MFA antiguos (>7 días)
DELETE FROM mfa_attempts
WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Limpiar password reset tokens usados o expirados
DELETE FROM password_resets
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
   OR usado = 1;
```

---

## 9. Contactos de Escalación

| Rol | Responsabilidad |
|-----|----------------|
| Desarrollador Backend | Código, APIs, vulnerabilidades |
| DevOps / Infra | VPS, Nginx, PM2, Redis, backups |
| Soporte Nivel 2 | Desbloqueos manuales, recuperación MFA |

---

## 10. Logs y Ubicaciones

| Archivo | Contenido |
|---------|-----------|
| `backend/logs/combined.log` | Todos los eventos (info + warn + error) |
| `backend/logs/error.log` | Solo errores |
| `/var/log/nginx/access.log` | Requests HTTP |
| `/var/log/nginx/error.log` | Errores Nginx |
| Tabla `activity_log` (DB) | Cambios de plan y tipo de cuenta |
| Tabla `mfa_attempts` (DB) | Intentos MFA (exitosos y fallidos) |
| Tabla `user_sessions` (DB) | Historial de logins (IP + user-agent) |
