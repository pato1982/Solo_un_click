const express = require('express')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const pool = require('../db')
const logger = require('../logger')
const { authMiddleware } = require('./auth')

const router = express.Router()

const APP_NAME = process.env.APP_NAME || 'Solo a un Click'
const MFA_PENDING_TTL_SECONDS = 5 * 60 // 5 minutos
const MFA_BACKUP_CODES_COUNT = 8
const MFA_MAX_ATTEMPTS_PER_MINUTE = 5

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function checkMfaRateLimit(userId, ip) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    .toISOString().slice(0, 19).replace('T', ' ')
  const [rows] = await pool.query(
    'SELECT COUNT(*) as cnt FROM mfa_attempts WHERE user_id = ? AND success = 0 AND created_at > ?',
    [userId, oneMinuteAgo]
  )
  return rows[0].cnt >= MFA_MAX_ATTEMPTS_PER_MINUTE
}

async function logMfaAttempt(userId, success, ip) {
  try {
    await pool.query(
      'INSERT INTO mfa_attempts (user_id, success, ip) VALUES (?, ?, ?)',
      [userId, success ? 1 : 0, ip || null]
    )
  } catch (err) {
    logger.error('Error logging MFA attempt', { error: err.message })
  }
}

function generateBackupCodes() {
  const codes = []
  for (let i = 0; i < MFA_BACKUP_CODES_COUNT; i++) {
    const code = crypto.randomBytes(5).toString('hex').toUpperCase()
    codes.push(code)
  }
  return codes
}

// POST /api/auth/mfa/setup — Genera secret y QR code (requiere auth, MFA no activo aún)
router.post('/setup', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT email, mfa_enabled FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const user = rows[0]
    if (user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA ya está activo. Desactívalo primero para reconfigurar.' })
    }

    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
      length: 20,
    })

    // Guardar secret temporalmente (se confirma al hacer /enable)
    await pool.query('UPDATE users SET mfa_secret = ? WHERE id = ?', [secret.base32, req.userId])

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url)

    logger.info('MFA setup iniciado', { userId: req.userId })

    res.json({
      secret: secret.base32,
      qr_code: qrDataUrl,
      manual_entry_key: secret.base32,
      issuer: APP_NAME,
    })
  } catch (err) {
    logger.error('Error en MFA setup', { error: err.message })
    res.status(500).json({ error: 'Error configurando MFA' })
  }
})

// POST /api/auth/mfa/enable — Verifica código TOTP y activa MFA, retorna backup codes
router.post('/enable', [
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Código TOTP inválido (6 dígitos)'),
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'

    const rateLimited = await checkMfaRateLimit(req.userId, ip)
    if (rateLimited) {
      return res.status(429).json({ error: 'Demasiados intentos. Espera 1 minuto.' })
    }

    const [rows] = await pool.query('SELECT mfa_secret, mfa_enabled FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { mfa_secret, mfa_enabled } = rows[0]
    if (mfa_enabled) return res.status(400).json({ error: 'MFA ya está activo' })
    if (!mfa_secret) return res.status(400).json({ error: 'Primero inicia la configuración MFA desde /setup' })

    const { code } = req.body
    const verified = speakeasy.totp.verify({
      secret: mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    })

    await logMfaAttempt(req.userId, verified, ip)

    if (!verified) {
      return res.status(401).json({ error: 'Código incorrecto. Verifica que la hora de tu dispositivo sea correcta.' })
    }

    const backupCodes = generateBackupCodes()
    const backupCodesJson = JSON.stringify(backupCodes)

    await pool.query(
      'UPDATE users SET mfa_enabled = 1, mfa_backup_codes = ?, mfa_enabled_at = NOW() WHERE id = ?',
      [backupCodesJson, req.userId]
    )

    logger.info('MFA activado', { userId: req.userId, ip })

    res.json({
      message: 'MFA activado correctamente',
      backup_codes: backupCodes,
      warning: 'Guarda estos códigos de recuperación en un lugar seguro. No se mostrarán de nuevo.',
    })
  } catch (err) {
    logger.error('Error activando MFA', { error: err.message })
    res.status(500).json({ error: 'Error activando MFA' })
  }
})

// POST /api/auth/mfa/disable — Desactiva MFA (requiere auth + código TOTP o backup code)
router.post('/disable', [
  body('code').notEmpty().withMessage('Código requerido'),
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'

    const rateLimited = await checkMfaRateLimit(req.userId, ip)
    if (rateLimited) {
      return res.status(429).json({ error: 'Demasiados intentos. Espera 1 minuto.' })
    }

    const [rows] = await pool.query(
      'SELECT mfa_secret, mfa_enabled, mfa_backup_codes FROM users WHERE id = ?',
      [req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { mfa_secret, mfa_enabled, mfa_backup_codes } = rows[0]
    if (!mfa_enabled) return res.status(400).json({ error: 'MFA no está activo' })

    const { code } = req.body

    const totpValid = speakeasy.totp.verify({
      secret: mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    })

    let backupValid = false
    if (!totpValid && mfa_backup_codes) {
      const codes = JSON.parse(mfa_backup_codes)
      const idx = codes.indexOf(code.toUpperCase())
      if (idx !== -1) {
        backupValid = true
        codes.splice(idx, 1)
        await pool.query('UPDATE users SET mfa_backup_codes = ? WHERE id = ?', [JSON.stringify(codes), req.userId])
      }
    }

    await logMfaAttempt(req.userId, totpValid || backupValid, ip)

    if (!totpValid && !backupValid) {
      return res.status(401).json({ error: 'Código incorrecto' })
    }

    await pool.query(
      'UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL, mfa_enabled_at = NULL WHERE id = ?',
      [req.userId]
    )

    logger.info('MFA desactivado', { userId: req.userId, ip })
    res.json({ message: 'MFA desactivado' })
  } catch (err) {
    logger.error('Error desactivando MFA', { error: err.message })
    res.status(500).json({ error: 'Error desactivando MFA' })
  }
})

// POST /api/auth/mfa/verify — Verifica segundo factor durante login
// Recibe: { mfa_token, code }
// Retorna: JWT de sesión completa (igual que /login)
router.post('/verify', [
  body('mfa_token').notEmpty().withMessage('Token MFA requerido'),
  body('code').isLength({ min: 6, max: 10 }).withMessage('Código inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { mfa_token, code } = req.body
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'

    const tokenHash = hashToken(mfa_token)
    const [tokenRows] = await pool.query(
      'SELECT * FROM mfa_pending_tokens WHERE token_hash = ? AND used = 0 AND expires_at > NOW()',
      [tokenHash]
    )

    if (tokenRows.length === 0) {
      return res.status(401).json({ error: 'Token MFA inválido o expirado. Vuelve a iniciar sesión.' })
    }

    const pendingToken = tokenRows[0]
    const userId = pendingToken.user_id

    const rateLimited = await checkMfaRateLimit(userId, ip)
    if (rateLimited) {
      return res.status(429).json({ error: 'Demasiados intentos. Espera 1 minuto.' })
    }

    const [userRows] = await pool.query(
      `SELECT u.*, p.nombre as plan_nombre FROM users u
       JOIN plans p ON u.plan_id = p.id
       WHERE u.id = ? AND u.activo = 1`,
      [userId]
    )

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Usuario no disponible' })
    }

    const user = userRows[0]

    // Verificar TOTP
    const totpValid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    })

    // Verificar backup code si TOTP falla
    let backupUsed = false
    if (!totpValid && user.mfa_backup_codes) {
      const codes = JSON.parse(user.mfa_backup_codes)
      const idx = codes.indexOf(code.toUpperCase())
      if (idx !== -1) {
        backupUsed = true
        codes.splice(idx, 1)
        await pool.query('UPDATE users SET mfa_backup_codes = ? WHERE id = ?', [JSON.stringify(codes), userId])
      }
    }

    await logMfaAttempt(userId, totpValid || backupUsed, ip)

    if (!totpValid && !backupUsed) {
      logger.warn('MFA verify fallido', { userId, ip })
      return res.status(401).json({ error: 'Código incorrecto' })
    }

    // Invalidar el token pending
    await pool.query('UPDATE mfa_pending_tokens SET used = 1 WHERE id = ?', [pendingToken.id])

    // Importar issueTokens desde auth.js
    const { issueTokens } = require('./auth')
    const { accessToken } = await issueTokens(res, user.id, user.email)

    try {
      const userAgent = req.headers['user-agent'] || ''
      await pool.query(
        'INSERT INTO user_sessions (user_id, ip, user_agent) VALUES (?, ?, ?)',
        [user.id, ip, userAgent]
      )
    } catch (sessErr) {
      logger.error('Error registrando sesión post-MFA', { error: sessErr.message })
    }

    logger.info('Login MFA exitoso', { userId: user.id, ip, method: backupUsed ? 'backup_code' : 'totp' })

    res.json({
      message: 'Login exitoso',
      token: accessToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        tipo_cuenta: user.tipo_cuenta,
        plan_id: user.plan_id,
        rol: user.rol,
        vende_productos: user.vende_productos,
        ofrece_servicios: user.ofrece_servicios,
        ofrece_arriendos: user.ofrece_arriendos,
      },
    })
  } catch (err) {
    logger.error('Error en MFA verify', { error: err.message })
    res.status(500).json({ error: 'Error verificando MFA' })
  }
})

// GET /api/auth/mfa/status — Estado MFA del usuario autenticado
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT mfa_enabled, mfa_enabled_at FROM users WHERE id = ?',
      [req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { mfa_enabled, mfa_enabled_at } = rows[0]

    let backup_codes_remaining = null
    if (mfa_enabled) {
      const [bcRows] = await pool.query('SELECT mfa_backup_codes FROM users WHERE id = ?', [req.userId])
      if (bcRows[0]?.mfa_backup_codes) {
        backup_codes_remaining = JSON.parse(bcRows[0].mfa_backup_codes).length
      }
    }

    res.json({ mfa_enabled: !!mfa_enabled, mfa_enabled_at, backup_codes_remaining })
  } catch (err) {
    logger.error('Error obteniendo estado MFA', { error: err.message })
    res.status(500).json({ error: 'Error obteniendo estado MFA' })
  }
})

// POST /api/auth/mfa/regenerate-backup-codes — Regenerar backup codes (requiere TOTP activo)
router.post('/regenerate-backup-codes', [
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Código TOTP inválido'),
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'

    const [rows] = await pool.query('SELECT mfa_secret, mfa_enabled FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { mfa_secret, mfa_enabled } = rows[0]
    if (!mfa_enabled) return res.status(400).json({ error: 'MFA no está activo' })

    const verified = speakeasy.totp.verify({
      secret: mfa_secret,
      encoding: 'base32',
      token: req.body.code,
      window: 1,
    })

    await logMfaAttempt(req.userId, verified, ip)

    if (!verified) return res.status(401).json({ error: 'Código TOTP incorrecto' })

    const newCodes = generateBackupCodes()
    await pool.query('UPDATE users SET mfa_backup_codes = ? WHERE id = ?', [JSON.stringify(newCodes), req.userId])

    logger.info('Backup codes regenerados', { userId: req.userId })
    res.json({
      backup_codes: newCodes,
      warning: 'Guarda estos nuevos códigos. Los anteriores ya no son válidos.',
    })
  } catch (err) {
    logger.error('Error regenerando backup codes', { error: err.message })
    res.status(500).json({ error: 'Error regenerando backup codes' })
  }
})

module.exports = router
