const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const pool = require('../db')
const logActivity = require('../logActivity')
const logger = require('../logger')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET no está configurado en variables de entorno')
  process.exit(1)
}

const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET + '_refresh'
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_DAYS = 7
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15
const MIN_PASSWORD_LENGTH = 12 // OWASP ASVS V2.1

// OWASP V2.1: lista de contraseñas comunes prohibidas
const COMMON_PASSWORDS = new Set([
  'password123456', '123456789012', 'qwertyuiop12', 'soloaunclick1',
  'contraseña123', 'administrator1', 'passwordpassw', 'aaaaaaaaaaaa',
  'abcdefghijkl', '111111111111', '123123123123', 'iloveyou12345',
  'welcome12345!', 'letmein12345!', 'dragon123456!', 'monkey123456',
])

function isCommonPassword(password) {
  return COMMON_PASSWORDS.has(password.toLowerCase())
}

function validatePasswordStrength(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Contraseña mínimo ${MIN_PASSWORD_LENGTH} caracteres`
  }
  if (isCommonPassword(password)) {
    return 'Contraseña demasiado común. Elige una más segura.'
  }
  return null
}

const MFA_PENDING_TTL_SECONDS = 5 * 60 // 5 minutos

// Sanitización: elimina tags HTML de un string
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function cookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAgeSeconds * 1000,
    path: '/',
  }
}

async function issueTokens(res, userId, email) {
  const accessToken = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL })

  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` })
  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 19).replace('T', ' ')

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  )

  res.cookie('access_token', accessToken, cookieOptions(15 * 60))
  res.cookie('refresh_token', refreshToken, cookieOptions(REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60))

  return { accessToken, refreshToken }
}

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: MIN_PASSWORD_LENGTH }).withMessage(`Contraseña mínimo ${MIN_PASSWORD_LENGTH} caracteres`),
  body('nombre').trim().escape().notEmpty().withMessage('Nombre requerido'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { nombre, email, password, telefono, comuna, direccion, tipo_cuenta, vende_productos, ofrece_servicios, ofrece_arriendos, plan_id } = req.body

    const pwdError = validatePasswordStrength(password)
    if (pwdError) return res.status(400).json({ error: pwdError })

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const selectedPlan = [1, 2, 3].includes(plan_id) ? plan_id : 1

    const [result] = await pool.query(
      `INSERT INTO users (plan_id, tipo_cuenta, nombre, email, password, telefono, comuna, direccion, vende_productos, ofrece_servicios, ofrece_arriendos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        selectedPlan,
        ['general', 'turismo'].includes(tipo_cuenta) ? tipo_cuenta : 'general',
        sanitize(nombre),
        email,
        hashedPassword,
        sanitize(telefono) || null,
        sanitize(comuna) || null,
        sanitize(direccion) || null,
        vende_productos ? 1 : 0,
        ofrece_servicios ? 1 : 0,
        ofrece_arriendos ? 1 : 0
      ]
    )

    const userId = result.insertId
    const { accessToken } = await issueTokens(res, userId, email)

    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'
      const userAgent = req.headers['user-agent'] || ''
      await pool.query(
        'INSERT INTO user_sessions (user_id, ip, user_agent) VALUES (?, ?, ?)',
        [userId, ip, userAgent]
      )
    } catch (sessErr) {
      logger.error('Error registrando sesión', { error: sessErr.message })
    }

    logger.info('auth:register', { requestId: req.id, userId, email })

    res.status(201).json({
      message: 'Usuario registrado',
      token: accessToken,
      user: { id: userId, nombre, email, tipo_cuenta: tipo_cuenta || 'general', plan_id: selectedPlan, rol: null, vende_productos: vende_productos ? 1 : 0, ofrece_servicios: ofrece_servicios ? 1 : 0, ofrece_arriendos: ofrece_arriendos ? 1 : 0 }
    })
  } catch (err) {
    logger.error('Error en registro', { error: err.message })
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { email, password } = req.body

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const user = rows[0]

    if (!user.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada' })
    }

    // Account lockout check
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      logger.warn('auth:lockout_blocked', { requestId: req.id, userId: user.id, email, lockedUntil: user.locked_until })
      return res.status(429).json({ error: 'Cuenta bloqueada temporalmente. Intenta en 15 minutos.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      const newAttempts = (user.failed_attempts || 0) + 1
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          .toISOString().slice(0, 19).replace('T', ' ')
        await pool.query(
          'UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?',
          [newAttempts, lockUntil, user.id]
        )
        logger.warn('auth:lockout_activated', { requestId: req.id, userId: user.id, email, attempts: newAttempts, lockUntil })
      } else {
        await pool.query(
          'UPDATE users SET failed_attempts = ? WHERE id = ?',
          [newAttempts, user.id]
        )
        logger.warn('auth:login_failed', { requestId: req.id, userId: user.id, email, attempts: newAttempts })
      }
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Reset lockout on successful login
    await pool.query(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?',
      [user.id]
    )

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'

    // MFA challenge: si el usuario tiene MFA activo, emitir token pendiente en vez de JWT completo
    if (user.mfa_enabled) {
      const mfaPlainToken = crypto.randomBytes(32).toString('hex')
      const mfaTokenHash = hashToken(mfaPlainToken)
      const mfaExpiresAt = new Date(Date.now() + MFA_PENDING_TTL_SECONDS * 1000)
        .toISOString().slice(0, 19).replace('T', ' ')

      await pool.query(
        'INSERT INTO mfa_pending_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, mfaTokenHash, mfaExpiresAt]
      )

      logger.info('auth:mfa_required', { requestId: req.id, userId: user.id, email })

      return res.json({
        mfa_required: true,
        mfa_token: mfaPlainToken,
        message: 'Verifica tu segundo factor de autenticación',
      })
    }

    const { accessToken } = await issueTokens(res, user.id, user.email)

    try {
      const userAgent = req.headers['user-agent'] || ''
      await pool.query(
        'INSERT INTO user_sessions (user_id, ip, user_agent) VALUES (?, ?, ?)',
        [user.id, ip, userAgent]
      )
    } catch (sessErr) {
      logger.error('Error registrando sesión', { error: sessErr.message })
    }

    logger.info('auth:login_success', { requestId: req.id, userId: user.id, email })

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
        ofrece_arriendos: user.ofrece_arriendos
      }
    })
  } catch (err) {
    logger.error('Error en login', { error: err.message })
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token
    if (!token) {
      return res.status(401).json({ error: 'Refresh token requerido' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, REFRESH_SECRET)
    } catch {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' })
    }

    const tokenHash = hashToken(token)
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()',
      [tokenHash]
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token revocado o expirado' })
    }

    const [userRows] = await pool.query('SELECT id, email, activo FROM users WHERE id = ?', [decoded.id])
    if (userRows.length === 0 || !userRows[0].activo) {
      return res.status(401).json({ error: 'Usuario no disponible' })
    }

    const user = userRows[0]

    // Rotate: revoke old token, issue new pair
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [tokenHash])

    const { accessToken } = await issueTokens(res, user.id, user.email)

    logger.info('auth:refresh_success', { requestId: req.id, userId: user.id })

    res.json({ token: accessToken })
  } catch (err) {
    logger.error('Error en refresh', { error: err.message })
    res.status(500).json({ error: 'Error al renovar sesión' })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token
    if (token) {
      const tokenHash = hashToken(token)
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL',
        [tokenHash]
      )
    }

    res.clearCookie('access_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' })
    res.clearCookie('refresh_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' })

    logger.info('auth:logout', { requestId: req.id })

    res.json({ message: 'Sesión cerrada' })
  } catch (err) {
    logger.error('Error en logout', { error: err.message })
    res.status(500).json({ error: 'Error al cerrar sesión' })
  }
})

// Middleware para verificar token
function authMiddleware(req, res, next) {
  // Leer desde cookie httpOnly primero, luego header Authorization como fallback
  let token = req.cookies?.access_token

  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

async function programadorMiddleware(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT rol FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0 || rows[0].rol !== 'programador') {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol programador' })
    }
    next()
  } catch (err) {
    logger.error('Error verificando rol programador', { error: err.message })
    res.status(500).json({ error: 'Error al verificar permisos' })
  }
}

// GET /api/auth/me — obtener datos del usuario autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.tipo_cuenta, u.telefono, u.comuna, u.direccion,
              u.vende_productos, u.ofrece_servicios, u.ofrece_arriendos,
              u.plan_id, u.rol, u.activo, u.created_at,
              p.nombre as plan_nombre, p.max_listings, p.tiene_pagina,
              p.tiene_destacados, p.tiene_estadisticas
       FROM users u
       JOIN plans p ON u.plan_id = p.id
       WHERE u.id = ?`,
      [req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({ user: rows[0] })
  } catch (err) {
    logger.error('Error en /me', { error: err.message })
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
})

// GET /api/auth/profile/counts — contar registros por tipo antes de eliminar
router.get('/profile/counts', authMiddleware, async (req, res) => {
  try {
    const uid = req.userId
    const [productos] = await pool.query('SELECT COUNT(*) as c FROM listings WHERE user_id = ? AND tipo = ?', [uid, 'producto'])
    const [servicios] = await pool.query('SELECT COUNT(*) as c FROM listings WHERE user_id = ? AND tipo = ?', [uid, 'servicio'])
    const [arriendos] = await pool.query('SELECT COUNT(*) as c FROM listings WHERE user_id = ? AND tipo = ?', [uid, 'arriendo'])
    const [tours] = await pool.query('SELECT COUNT(*) as c FROM turismo_tours WHERE user_id = ?', [uid])
    const [portada] = await pool.query('SELECT COUNT(*) as c FROM turismo_portada WHERE user_id = ?', [uid])
    const [pagina] = await pool.query('SELECT COUNT(*) as c FROM turismo_pagina WHERE user_id = ?', [uid])
    const [negocio] = await pool.query('SELECT COUNT(*) as c FROM businesses WHERE user_id = ?', [uid])
    const [carousels] = await pool.query('SELECT COUNT(*) as c FROM carousels WHERE user_id = ?', [uid])

    res.json({
      productos: productos[0].c,
      servicios: servicios[0].c,
      arriendos: arriendos[0].c,
      tours: tours[0].c,
      portada: portada[0].c,
      pagina: pagina[0].c,
      negocio: negocio[0].c,
      carousels: carousels[0].c,
    })
  } catch (err) {
    logger.error('Error contando registros', { error: err.message })
    res.status(500).json({ error: 'Error al contar registros' })
  }
})

const fs = require('fs')
const path = require('path')
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

async function deleteListingsByType(userId, tipo) {
  const [result] = await pool.query(
    'UPDATE listings SET activo = 0, deleted_at = NOW() WHERE user_id = ? AND tipo = ? AND activo = 1',
    [userId, tipo]
  )
  return result.affectedRows
}

async function deleteAllCommerceData(userId) {
  await pool.query(
    'UPDATE listings SET activo = 0, deleted_at = NOW() WHERE user_id = ? AND activo = 1',
    [userId]
  )
  await pool.query(
    'UPDATE carousels SET activo = 0, deleted_at = NOW() WHERE user_id = ? AND activo = 1',
    [userId]
  )
  await pool.query(
    'UPDATE businesses SET activo = 0, deleted_at = NOW() WHERE user_id = ?',
    [userId]
  )
}

async function deleteAllTurismData(userId) {
  await pool.query(
    'UPDATE turismo_tours SET activo = 0, deleted_at = NOW() WHERE user_id = ? AND activo = 1',
    [userId]
  )
  await pool.query(
    'UPDATE turismo_portada SET activo = 0, deleted_at = NOW() WHERE user_id = ? AND activo = 1',
    [userId]
  )
  await pool.query(
    'UPDATE turismo_pagina SET activo = 0, deleted_at = NOW() WHERE user_id = ?',
    [userId]
  )
  await pool.query(
    'UPDATE businesses SET activo = 0, deleted_at = NOW() WHERE user_id = ?',
    [userId]
  )
}

// PUT /api/auth/profile — actualizar tipo de cuenta y plan, con eliminación de datos
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { tipo_cuenta, vende_productos, ofrece_servicios, ofrece_arriendos, plan_id, delete_tipos, email, telefono, direccion } = req.body
    const uid = req.userId

    const [currentRows] = await pool.query('SELECT * FROM users WHERE id = ?', [uid])
    if (currentRows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    const current = currentRows[0]

    if (delete_tipos && Array.isArray(delete_tipos)) {
      for (const tipo of delete_tipos) {
        if (tipo === 'producto') await deleteListingsByType(uid, 'producto')
        if (tipo === 'servicio') await deleteListingsByType(uid, 'servicio')
        if (tipo === 'arriendo') await deleteListingsByType(uid, 'arriendo')
      }
    }

    if (tipo_cuenta === 'turismo' && current.tipo_cuenta === 'general') {
      await deleteAllCommerceData(uid)
    }

    if (tipo_cuenta === 'general' && current.tipo_cuenta === 'turismo') {
      await deleteAllTurismData(uid)
    }

    const selectedPlan = [1, 2, 3].includes(plan_id) ? plan_id : current.plan_id
    const tipo = ['general', 'turismo'].includes(tipo_cuenta) ? tipo_cuenta : current.tipo_cuenta

    const newEmail = (typeof email === 'string' && email.trim()) ? email.trim() : current.email
    if (newEmail !== current.email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, uid])
      if (existing.length > 0) return res.status(400).json({ error: 'Ese correo ya está registrado por otro usuario' })
    }
    const newTelefono = (typeof telefono === 'string') ? telefono.trim() : current.telefono
    const newDireccion = (typeof direccion === 'string') ? direccion.trim() : current.direccion

    await pool.query(
      `UPDATE users SET tipo_cuenta = ?, vende_productos = ?, ofrece_servicios = ?, ofrece_arriendos = ?, plan_id = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?`,
      [
        tipo,
        tipo === 'general' ? (vende_productos ? 1 : 0) : 0,
        tipo === 'general' ? (ofrece_servicios ? 1 : 0) : 0,
        tipo === 'general' ? (ofrece_arriendos ? 1 : 0) : 0,
        selectedPlan,
        newEmail,
        newTelefono,
        newDireccion,
        uid
      ]
    )

    const PLAN_NAMES = { 1: 'Gratis', 2: 'Normal', 3: 'Premium' }
    if (selectedPlan !== current.plan_id) {
      await logActivity(uid, 'cambio_plan', 'user', uid, {
        plan_anterior: current.plan_id,
        plan_anterior_nombre: PLAN_NAMES[current.plan_id],
        plan_nuevo: selectedPlan,
        plan_nuevo_nombre: PLAN_NAMES[selectedPlan],
        tipo: selectedPlan > current.plan_id ? 'upgrade' : 'downgrade',
      })
    }

    if (tipo !== current.tipo_cuenta) {
      await logActivity(uid, 'cambio_tipo_cuenta', 'user', uid, {
        tipo_anterior: current.tipo_cuenta,
        tipo_nuevo: tipo,
      })
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.tipo_cuenta, u.telefono, u.comuna, u.direccion,
              u.vende_productos, u.ofrece_servicios, u.ofrece_arriendos,
              u.plan_id, u.activo, u.created_at,
              p.nombre as plan_nombre, p.max_listings, p.tiene_pagina,
              p.tiene_destacados, p.tiene_estadisticas
       FROM users u
       JOIN plans p ON u.plan_id = p.id
       WHERE u.id = ?`,
      [uid]
    )

    res.json({ message: 'Perfil actualizado', user: rows[0] })
  } catch (err) {
    logger.error('Error actualizando perfil', { error: err.message })
    res.status(500).json({ error: 'Error al actualizar perfil' })
  }
})

// GET /api/auth/profile/plans-info
router.get('/profile/plans-info', authMiddleware, async (req, res) => {
  try {
    const tipo = req.query.tipo || 'general'
    let rows
    if (tipo === 'turismo') {
      [rows] = await pool.query('SELECT * FROM plans WHERE id IN (1, 3) ORDER BY id')
    } else {
      [rows] = await pool.query('SELECT * FROM plans ORDER BY id')
    }
    res.json({ plans: rows })
  } catch (err) {
    logger.error('Error obteniendo planes', { error: err.message })
    res.status(500).json({ error: 'Error al obtener planes' })
  }
})

// GET /api/auth/profile/history
router.get('/profile/history', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT accion, detalles, created_at FROM activity_log
       WHERE user_id = ? AND accion IN ('cambio_plan', 'cambio_tipo_cuenta')
       ORDER BY created_at DESC LIMIT 50`,
      [req.userId]
    )
    const history = rows.map(r => ({
      ...r,
      detalles: r.detalles ? (typeof r.detalles === 'string' ? JSON.parse(r.detalles) : r.detalles) : null,
    }))
    res.json({ history })
  } catch (err) {
    logger.error('Error obteniendo historial', { error: err.message })
    res.status(500).json({ error: 'Error al obtener historial' })
  }
})

module.exports = router
module.exports.authMiddleware = authMiddleware
module.exports.programadorMiddleware = programadorMiddleware
module.exports.issueTokens = issueTokens
