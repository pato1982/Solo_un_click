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

## Ambiente de Desarrollo

### Base de Datos

| BD | Usuario | Host |
|----|---------|------|
| `soloaunclick` (prod) | `soloaunclick` | localhost |
| `soloaunclick_dev` (dev) | `soloaunclick_dev` | localhost |

### Flujo de Trabajo Dev → Prod

1. **Desarrollar en dev:**
   ```bash
   cd /var/www/soloaunclick-dev
   git pull origin feature/db-schema-v2
   cd backend && npm install
   pm2 restart soloaunclick-dev
   ```

2. **Probar en:** `http://158.220.123.58:3002/api/health`

3. **Aplicar migraciones en dev primero:**
   ```bash
   mysql -u soloaunclick_dev -p'DevSoloUnClick2026!' soloaunclick_dev < migration.sql
   # Validar en dev, luego aplicar en prod:
   mysql -u soloaunclick -p'SoloUnClick2026' soloaunclick < migration.sql
   ```

4. **Deploy a producción:**
   ```bash
   cd /var/www/soloaunclick
   git pull origin main
   cd backend && npm install
   pm2 restart soloaunclick
   ```

### Nginx Virtual Hosts

| Host | Config |
|------|--------|
| `soloaunclick.cl` | `/etc/nginx/sites-available/soloaunclick` |
| `dev.soloaunclick.cl` | `/etc/nginx/sites-available/soloaunclick-dev` |
