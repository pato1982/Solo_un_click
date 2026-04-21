# Deploy Manual — Solo a un Click

**Última actualización:** 2026-04-20  
**Rama de producción:** `main`  
**VPS:** `158.220.123.58` (Contabo, Ubuntu 24.04)

---

## Prerequisitos

- Acceso SSH con llave `~/.ssh/villarrica`
- Git configurado con acceso de lectura al repositorio
- Permisos para ejecutar `pm2` y `npm` en el VPS

---

## 1. Deploy a Desarrollo (VPS)

```bash
# 1. Pushear rama al remoto desde local
git push origin feature/tu-rama

# 2. Conectarse al VPS
ssh -i ~/.ssh/villarrica root@158.220.123.58

# 3. En el VPS — Pull y reinicio en dev
cd /var/www/soloaunclick-dev
git pull origin feature/tu-rama
cd backend
npm install
pm2 restart soloaunclick-dev

# 4. Verificar que levantó OK
curl http://localhost:3002/api/health
```

### Checklist de pruebas en dev

- [ ] `GET /api/health` devuelve `{"status":"ok"}`
- [ ] Login funciona (POST `/api/v1/auth/login`)
- [ ] Endpoint crítico del cambio funciona
- [ ] No hay errores en `pm2 logs soloaunclick-dev --lines 30`
- [ ] Si hay migración de BD: validar que la BD dev tiene los cambios esperados

---

## 2. Merge a main

```bash
# En local
git checkout main
git merge feature/tu-rama
git push origin main
```

---

## 3. Deploy a Producción (VPS)

```bash
# Conectarse al VPS
ssh -i ~/.ssh/villarrica root@158.220.123.58

# Pull y reinicio en prod
cd /var/www/soloaunclick
git pull origin main
cd backend
npm install
pm2 restart soloaunclick

# Si se agregaron nuevas variables de entorno, usar:
pm2 restart soloaunclick --update-env
```

### Verificación post-deploy

```bash
# 1. Health check
curl http://localhost:3001/api/health
# Esperado: {"status":"ok","services":{"database":{"status":"ok"},...}}

# 2. Ver logs en tiempo real (30 segundos)
pm2 logs soloaunclick --lines 20

# 3. Verificar HTTPS en producción
curl -s https://soloaunclick.cl/api/health | grep '"status":"ok"'
```

### Smoke test manual

- [ ] `https://soloaunclick.cl` carga sin errores
- [ ] Login de usuario real funciona
- [ ] Si el cambio afecta listados, verificar que se muestran correctamente
- [ ] Revisar UptimeRobot: sin alertas activas

---

## 4. Rollback

Si el deploy falla o introduce regresiones:

```bash
ssh -i ~/.ssh/villarrica root@158.220.123.58
cd /var/www/soloaunclick

# Ver últimos commits desplegados
git log --oneline -5

# Volver al commit anterior
git reset --hard HEAD~1
cd backend
npm install
pm2 restart soloaunclick

# Verificar
curl http://localhost:3001/api/health
```

> **Nota:** Si el rollback involucra una migración de BD, el schema cambió y puede
> requerir rollback manual de SQL. Siempre guardar el SQL inverso antes de aplicar migraciones.

---

## 5. Migraciones de Base de Datos

```bash
# Siempre aplicar en dev primero
mysql --defaults-file=/etc/mysql/debian.cnf soloaunclick_dev < migration_NNN.sql

# Validar en dev, luego aplicar en prod
mysql --defaults-file=/etc/mysql/debian.cnf soloaunclick < migration_NNN.sql

# Verificar que la migración se aplicó
mysql --defaults-file=/etc/mysql/debian.cnf soloaunclick -e "DESCRIBE tabla_afectada;"
```

---

## 6. Variables de entorno

Las variables de entorno están en `/var/www/soloaunclick/backend/.env`.  
**Nunca** se almacenan en `ecosystem.config.js` ni en el repositorio.

Para agregar una variable nueva:
1. Agregarla a `backend/.env.example` en el repo con documentación
2. Agregarla con valor real a `/var/www/soloaunclick/backend/.env` en el VPS
3. Reiniciar con `pm2 restart soloaunclick --update-env`

---

## 7. Rotación de credenciales post-deploy

Tras cualquier cambio de `JWT_SECRET` o `DB_PASS` en `.env`:
1. `pm2 delete soloaunclick`
2. `pm2 start ecosystem.config.js --env production`
3. `pm2 save`
4. Verificar `curl http://localhost:3001/api/health`

> Cambiar `JWT_SECRET` invalida **todos los tokens activos** — los usuarios deberán
> re-autenticarse. Es el comportamiento correcto y esperado.
