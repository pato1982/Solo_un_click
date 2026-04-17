---
name: "Gmail Send"
description: "Envía correos desde el terminal vía Gmail API. Soporta destinatarios por nombre, adjuntos, CC/BCC y respuestas a threads."
alwaysAllow: ["Bash"]
---

# Gmail Send Skill

Envía correos usando `gws` (Google Workspace CLI) con Gmail API.
Cuenta autenticada: `nicolas.cornejo.herrera@gmail.com`.

## ⚠️ REGLA CRÍTICA

**NUNCA envíes un correo sin mostrar resumen completo y esperar confirmación explícita.**

Flujo obligatorio: Componer → Mostrar resumen → Esperar confirmación → Enviar.

---

## Sintaxis correcta de gws

```bash
# ✅ CORRECTO — siempre incluir --params '{"userId":"me"}'
gws gmail users messages send --params '{"userId":"me"}' --json '<JSON_PAYLOAD>'

# ❌ INCORRECTO — sin --params causa error "userId missing"
gws gmail users messages send --json '<JSON_PAYLOAD>'
```

---

## Paso 1 — Resolver destinatario (solo si no tienen email)

Si el usuario da un nombre, buscar en historial:
```bash
gws gmail users messages list --params '{"userId":"me","q":"to:NOMBRE OR from:NOMBRE","maxResults":5}'
```

## Paso 2 — Componer y enviar

### Correo simple (sin adjunto) — 2 pasos

**Generar payload:**
```bash
node -e "
const subject = 'ASUNTO';
const body = 'CUERPO';
const mime = [
  'MIME-Version: 1.0',
  'From: nicolas.cornejo.herrera@gmail.com',
  'To: DESTINATARIO',
  'Subject: =?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=',
  'Content-Type: text/plain; charset=UTF-8',
  '',
  body
].join('\r\n');
const raw = Buffer.from(mime).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
require('fs').writeFileSync('C:/Windows/Temp/gws_send.json', JSON.stringify({raw}));
console.log('Payload listo');
"
```

**Enviar:**
```bash
gws gmail users messages send --params '{"userId":"me"}' --json "$(cat C:/Windows/Temp/gws_send.json)"
```

---

### Correo con adjunto — 2 pasos

**Generar payload con adjunto:**
```bash
node -e "
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');

const from = 'nicolas.cornejo.herrera@gmail.com';
const to = 'DESTINATARIO';
const subject = 'ASUNTO';
const body = 'CUERPO';
const attachmentPath = 'RUTA_ARCHIVO';

const boundary = 'b_' + Date.now();
const filename = path.basename(attachmentPath);
const fileData = fs.readFileSync(attachmentPath).toString('base64');
const ext = path.extname(filename).toLowerCase();
const mimeTypes = {
  '.pdf':'application/pdf', '.png':'image/png', '.jpg':'image/jpeg',
  '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt':'text/plain', '.csv':'text/csv', '.zip':'application/zip'
};
const mimeType = mimeTypes[ext] || 'application/octet-stream';

const mime = [
  'MIME-Version: 1.0',
  'From: ' + from,
  'To: ' + to,
  'Subject: =?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=',
  'Content-Type: multipart/mixed; boundary=\"' + boundary + '\"',
  '',
  '--' + boundary,
  'Content-Type: text/plain; charset=UTF-8',
  '',
  body,
  '',
  '--' + boundary,
  'Content-Type: ' + mimeType + '; name=\"' + filename + '\"',
  'Content-Transfer-Encoding: base64',
  'Content-Disposition: attachment; filename=\"' + filename + '\"',
  '',
  fileData,
  '--' + boundary + '--'
].join('\r\n');

const raw = Buffer.from(mime).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const jsonPayload = JSON.stringify({ raw });
fs.writeFileSync('C:/Windows/Temp/gws_send.json', jsonPayload);
console.log('Payload listo -', filename, '(' + mimeType + ')');
"
```

**Enviar (usar spawnSync cuando el payload es grande por límite de CLI en Windows):**
```bash
node -e "
const { spawnSync } = require('child_process');
const json = require('fs').readFileSync('C:/Windows/Temp/gws_send.json', 'utf8');
const r = spawnSync('cmd.exe', ['/c','gws','gmail','users','messages','send','--params','{\"userId\":\"me\"}','--json', json], { encoding:'utf8' });
console.log(r.stdout || r.stderr);
"
```

> **Nota:** Para correos sin adjunto el payload es pequeño (~300 chars) y funciona con `$(cat ...)`. Para adjuntos puede superar el límite de argumentos de Windows, por eso se usa `spawnSync`.

---

## Paso 3 — Mostrar resumen y pedir confirmación ⚠️ OBLIGATORIO

```
📧 RESUMEN DEL CORREO — REVISÁ ANTES DE CONFIRMAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Para:     [email]
📝 Asunto:   [asunto completo]
📄 CC/BCC:   [emails o "ninguno"]
📎 Adjuntos: [archivos o "ninguno"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CUERPO COMPLETO]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ Confirma con "sí/enviar/ok" o cancela con "no/cancelar"
```

## Paso 4 — Confirmar resultado

**Éxito:**
```
✅ CORREO ENVIADO — ID: [id] | Para: [email] | [hora]
```

**Error:**
```
❌ ERROR: [mensaje] — Causa: [diagnóstico]
```

---

## Casos especiales

### Responder a thread existente
Agregar al MIME: `In-Reply-To: <MESSAGE-ID>` y `References: <MESSAGE-ID>`
Agregar al JSON payload: `"threadId": "THREAD_ID"`

### Múltiples destinatarios
`"To: email1@a.com, email2@b.com"`

### Ver enviados
```bash
gws gmail users messages list --params '{"userId":"me","q":"in:sent","maxResults":5}'
```

## Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `userId missing` | Falta `--params '{"userId":"me"}'` | Agregar el parámetro |
| `invalid_grant` | Token expirado | `gws auth setup` |
| `invalid argument` | Base64url mal formado | Verificar sin `+`, `/` o `=` al final |
