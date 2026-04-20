# Infraestructura — Solo a un Click

## Servidor VPS

- **Proveedor:** Contabo (Ubuntu 24.04.4 LTS)
- **IP:** 158.220.123.58
- **Dominio:** soloaunclick.cl
- **SSH:** `ssh -i ~/.ssh/villarrica root@158.220.123.58`

## Procesos PM2

| Proceso | Puerto | Entorno | Directorio |
|---------|--------|---------|------------|
| `soloaunclick` | 3001 | production | `/var/www/soloaunclick/backend` |
| `soloaunclick-dev` | 3002 | development | `/var/www/soloaunclick-dev/backend` |

## Gestión de Logs

### PM2 Logrotate

Módulo `pm2-logrotate` instalado con los siguientes parámetros:

```
max_size: 50M
retain: 14 días
compress: true
rotateInterval: 0 0 * * * (medianoche diaria)
```

Logs ubicados en: `/root/.pm2/logs/`

### Nginx Logrotate

Configurado en `/etc/logrotate.d/nginx-soloaunclick`:
- Rotación diaria
- 14 copias retenidas
- Compresión activada (con delaycompress)
- Logs ubicados en: `/var/log/nginx/`

Verificar config: `logrotate -d /etc/logrotate.d/nginx-soloaunclick`

## Monitoreo — Netdata

Netdata v2.10.2 instalado y corriendo en `localhost:19999` (solo acceso local).

### Acceder al dashboard vía SSH Tunnel

```bash
ssh -L 19999:localhost:19999 root@158.220.123.58
# Luego abrir en browser: http://localhost:19999
```

El servicio está configurado para iniciar automáticamente:
```bash
systemctl status netdata
```

## Monitoreo — UptimeRobot

> Configuración manual requerida en https://uptimerobot.com

### Endpoints a monitorear

| Endpoint | Tipo | Keyword |
|----------|------|---------|
| `https://soloaunclick.cl` | HTTP | `Solo a un Click` |
| `https://soloaunclick.cl/api/health` | HTTP | `"status":"ok"` |

Configuración recomendada: intervalo 5 min, alertas a `admin@soloaunclick.cl`

Ver instrucciones completas en: `docs/MONITORING_SETUP.md`

## Ambientes

| Ambiente | Puerto | BD | Branch | URL |
|----------|--------|-----|--------|-----|
| Producción | 3001 | soloaunclick | main | https://soloaunclick.cl |
| Desarrollo | 3002 | soloaunclick_dev | feature/* | http://dev.soloaunclick.cl |

## Acceso SSH

```bash
# Llave privada: ~/.ssh/villarrica
ssh -i ~/.ssh/villarrica -o StrictHostKeyChecking=no root@158.220.123.58
```

## Comandos PM2 frecuentes

```bash
pm2 list                            # Ver todos los procesos
pm2 logs soloaunclick --lines 50    # Ver logs del proceso prod
pm2 restart soloaunclick            # Reiniciar prod (carga .env)
pm2 restart soloaunclick --update-env  # Reiniciar cargando nuevas env vars
pm2 delete soloaunclick && pm2 start ecosystem.config.js --env production  # Reinicio limpio
pm2 save                            # Persistir lista actual de procesos
pm2 startup                         # Configurar autoinicio al rebotar VPS
```

## Base de Datos MySQL

| BD | Usuario | Host | Propósito |
|----|---------|------|-----------|
| `soloaunclick` | `soloaunclick` | localhost | Producción |
| `soloaunclick_dev` | — | localhost | Desarrollo |
| `soloaunclick_test` | — | localhost | Tests |

Autenticación MySQL como root: `mysql --defaults-file=/etc/mysql/debian.cnf`

> **Nota de seguridad:** Las credenciales de BD nunca van en `ecosystem.config.js`.
> Se leen desde `/var/www/soloaunclick/backend/.env` mediante `require('dotenv').config()`.

## Flujo de Trabajo Dev → Prod

1. **Desarrollar en dev:**
   ```bash
   cd /var/www/soloaunclick-dev
   git pull origin feature/db-schema-v2
   cd backend && npm install
   pm2 restart soloaunclick-dev
   ```

2. **Probar en:** `http://158.220.123.58:3002/api/health`

3. **Aplicar migraciones en dev primero, luego en prod:**
   ```bash
   # Dev (usar credenciales del .env de dev)
   mysql --defaults-file=/etc/mysql/debian.cnf soloaunclick_dev < migration.sql
   # Prod (usar credenciales del .env de prod — las credenciales reales están en .env)
   mysql --defaults-file=/etc/mysql/debian.cnf soloaunclick < migration.sql
   ```

4. **Deploy a producción:** Ver `docs/DEPLOYMENT.md` para el proceso completo.

## Nginx Virtual Hosts

| Host | Config |
|------|--------|
| `soloaunclick.cl` | `/etc/nginx/sites-available/soloaunclick` |
| `dev.soloaunclick.cl` | `/etc/nginx/sites-available/soloaunclick-dev` |
