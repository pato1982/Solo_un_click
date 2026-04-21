# Guía de Monitoreo — Solo a un Click

## Netdata (Métricas VPS en Tiempo Real)

### Acceso vía SSH Tunnel

Netdata está vinculado a `127.0.0.1:19999` por seguridad. Para acceder:

```bash
# Abrir tunnel (dejar corriendo en una terminal)
ssh -L 19999:localhost:19999 root@158.220.123.58

# Abrir en browser
http://localhost:19999
```

### Estado del servicio

```bash
systemctl status netdata
systemctl restart netdata  # si necesita reinicio
```

### Métricas disponibles

- CPU, RAM, Disco, Red en tiempo real
- Procesos del sistema
- Conexiones MySQL
- Nginx (requests/s, códigos de respuesta)

---

## UptimeRobot (Disponibilidad Externa)

### Configuración paso a paso

1. Crear cuenta en https://uptimerobot.com (plan Free: 50 monitores, intervalo 5 min)

2. **Agregar monitor para frontend:**
   - Tipo: HTTP(s)
   - URL: `https://soloaunclick.cl`
   - Nombre: "Solo a un Click - Frontend"
   - Intervalo: 5 minutos
   - Keyword monitoring: `Solo a un Click`

3. **Agregar monitor para API health:**
   - Tipo: HTTP(s)
   - URL: `https://soloaunclick.cl/api/health`
   - Nombre: "Solo a un Click - API Health"
   - Intervalo: 5 minutos
   - Keyword monitoring: `"status":"ok"`

4. **Configurar alertas:**
   - Settings → Alert Contacts → Add Alert Contact
   - Tipo: Email
   - Email: `admin@soloaunclick.cl`
   - Asignar a ambos monitores

5. **Status page pública (opcional):**
   - Status Pages → Create Status Page
   - Agregar ambos monitores
   - URL amigable: `status.soloaunclick.cl`

### Checklist post-configuración

- [ ] Monitor frontend activo y verde
- [ ] Monitor API activo y verde
- [ ] Alerta de email configurada y probada
- [ ] Contacto de emergencia agregado (WhatsApp/Slack opcional)
