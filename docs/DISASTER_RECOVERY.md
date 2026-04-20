# Disaster Recovery — Solo a un Click

**Última actualización:** 2026-04-20  
**Objetivo:** Restaurar servicio completo en menos de 2 horas para cualquier escenario crítico.

---

## Escenario 1: VPS caído (total o inaccesible)

### Detección
- UptimeRobot alerta en `https://soloaunclick.cl`
- `curl -s https://soloaunclick.cl/api/health` no responde

### Paso a paso

```bash
# 1. Intentar SSH — si no responde, escalar a panel Contabo
ssh -i ~/.ssh/villarrica root@158.220.123.58

# 2. Si VPS accesible pero app caída, revisar PM2
pm2 list
pm2 restart soloaunclick
curl http://localhost:3001/api/health

# 3. Si PM2 no está corriendo
pm2 resurrect           # Restaurar desde dump.pm2 guardado
# o
cd /var/www/soloaunclick/backend && pm2 start ecosystem.config.js --env production
pm2 save
```

### Migración a nuevo VPS (si el VPS es irrecuperable)

```bash
# En nuevo VPS (Ubuntu 24.04):
# 1. Instalar Node.js 20 + PM2 + Nginx + MySQL + certbot
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx mysql-server certbot python3-certbot-nginx
npm install -g pm2

# 2. Clonar repositorio
git clone https://github.com/pato1982/Solo_un_click.git /var/www/soloaunclick
cd /var/www/soloaunclick/backend && npm install

# 3. Restaurar .env desde backup seguro (ver gestión de secretos en SECURITY.md)
# Los valores actuales no están en git — deben provenir de backup externo o rotarse

# 4. Restaurar BD desde backup
mysql -u root < backup_soloaunclick_YYYYMMDD.sql

# 5. Configurar Nginx y SSL
# Copiar config desde /etc/nginx/sites-available/ del backup
certbot --nginx -d soloaunclick.cl

# 6. Iniciar app
cd /var/www/soloaunclick/backend
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

**Tiempo estimado:** 60–90 minutos con backup disponible.

---

## Escenario 2: Base de datos corrupta

### Detección
- Health endpoint: `{"services":{"database":{"status":"error"}}}`
- Logs PM2 muestran errores MySQL

### Verificar estado MySQL

```bash
systemctl status mysql
mysql --defaults-file=/etc/mysql/debian.cnf -e "SELECT 1;"
```

### Restaurar desde backup

```bash
# 1. Parar la app para evitar escrituras durante restauración
pm2 stop soloaunclick

# 2. Localizar backup más reciente
ls -lt /var/backups/mysql/ | head -5
# o verificar cron de backup configurado

# 3. Restaurar
mysql --defaults-file=/etc/mysql/debian.cnf -e "DROP DATABASE IF EXISTS soloaunclick; CREATE DATABASE soloaunclick CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql --defaults-file=/etc/mysql/debian.cnf soloaunclick < /var/backups/mysql/soloaunclick_YYYYMMDD.sql

# 4. Reiniciar app
pm2 start soloaunclick
curl http://localhost:3001/api/health
```

### Backup manual inmediato (antes de cualquier operación riesgosa)

```bash
mysqldump --defaults-file=/etc/mysql/debian.cnf soloaunclick > /var/backups/mysql/soloaunclick_$(date +%Y%m%d_%H%M%S).sql
```

---

## Escenario 3: Credenciales comprometidas

### Checklist de rotación completa

```bash
ssh -i ~/.ssh/villarrica root@158.220.123.58

# 1. Generar nuevas claves
NEW_JWT=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
NEW_REFRESH=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
NEW_DB_PASS=$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")

# 2. Rotar DB password en MySQL
mysql --defaults-file=/etc/mysql/debian.cnf -e \
  "ALTER USER 'soloaunclick'@'localhost' IDENTIFIED BY '$NEW_DB_PASS'; FLUSH PRIVILEGES;"

# 3. Actualizar .env
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT|" /var/www/soloaunclick/backend/.env
sed -i "s|^REFRESH_SECRET=.*|REFRESH_SECRET=$NEW_REFRESH|" /var/www/soloaunclick/backend/.env
sed -i "s|^DB_PASS=.*|DB_PASS=$NEW_DB_PASS|" /var/www/soloaunclick/backend/.env

# 4. Reinicio limpio (para cargar nuevas vars desde .env)
pm2 delete soloaunclick
pm2 start /var/www/soloaunclick/backend/ecosystem.config.js --env production
pm2 save

# 5. Verificar
sleep 3 && curl http://localhost:3001/api/health

# 6. Guardar nuevas credenciales en gestor de contraseñas externo
echo "Nuevas credenciales generadas el $(date). Guardar inmediatamente."
```

> **Nota:** Rotar `JWT_SECRET` invalida todos los tokens activos.
> Todos los usuarios deberán re-autenticarse — es correcto.

### Si el repo de GitHub fue comprometido (repo público con secretos)

1. Rotar todas las credenciales (pasos anteriores)
2. Evaluar `git filter-repo` para limpiar historial (ver `docs/SECURITY.md`)
3. Hacer force-push al repo (coordinar con todos los colaboradores)
4. Revisar accesos de GitHub y revocar tokens comprometidos

---

## Escenario 4: Certificado SSL expirado

### Detección
- Browser muestra `NET::ERR_CERT_DATE_INVALID`
- `curl -I https://soloaunclick.cl` devuelve error SSL

### Renovación manual

```bash
ssh -i ~/.ssh/villarrica root@158.220.123.58

# Verificar estado del certificado
certbot certificates

# Forzar renovación manual
certbot renew --force-renewal

# Si falla la renovación automática, renovar con Nginx detenido
systemctl stop nginx
certbot certonly --standalone -d soloaunclick.cl
systemctl start nginx

# Verificar
curl -I https://soloaunclick.cl | grep -E "HTTP|expire"
```

### Renovación automática (verificar que está configurada)

```bash
# Debe existir un cron o systemd timer
systemctl status certbot.timer
# o
crontab -l | grep certbot
```

Certbot por defecto intenta renovar cuando el certificado tiene menos de 30 días.

---

## Contactos y accesos de emergencia

| Recurso | Acceso |
|---------|--------|
| VPS SSH | `ssh -i ~/.ssh/villarrica root@158.220.123.58` |
| Panel Contabo | https://my.contabo.com |
| GitHub repo | https://github.com/pato1982/Solo_un_click |
| UptimeRobot | https://uptimerobot.com |
| Netdata (monitoring) | `ssh -L 19999:localhost:19999 root@158.220.123.58` → http://localhost:19999 |

---

## RTO/RPO objetivos

| Escenario | RTO (tiempo de recuperación) | RPO (pérdida de datos aceptable) |
|-----------|------------------------------|----------------------------------|
| App caída (PM2) | < 5 minutos | 0 |
| VPS inaccesible | < 2 horas | < 24 horas (último backup) |
| BD corrupta | < 30 minutos | < 24 horas (último backup) |
| SSL expirado | < 15 minutos | 0 |
| Credenciales comprometidas | < 30 minutos | 0 |
