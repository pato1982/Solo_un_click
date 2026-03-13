const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const pool = require('../db')
const logActivity = require('../logActivity')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'soloaunclick_secret_2026'

// Sanitización: elimina tags HTML de un string
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  body('nombre').trim().escape().notEmpty().withMessage('Nombre requerido'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { nombre, email, password, telefono, comuna, direccion, tipo_cuenta, vende_productos, ofrece_servicios, ofrece_arriendos, plan_id } = req.body

    // Verificar si el email ya existe
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Validar plan_id (1, 2 o 3)
    const selectedPlan = [1, 2, 3].includes(plan_id) ? plan_id : 1

    // Insertar usuario
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

    // Generar token
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' })

    // Registrar primera sesión
    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'
      const userAgent = req.headers['user-agent'] || ''
      await pool.query(
        'INSERT INTO user_sessions (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
        [result.insertId, ip, userAgent]
      )
    } catch (sessErr) {
      console.error('Error registrando sesión:', sessErr)
    }

    res.status(201).json({
      message: 'Usuario registrado',
      token,
      user: { id: result.insertId, nombre, email, tipo_cuenta: tipo_cuenta || 'general', plan_id: selectedPlan, vende_productos: vende_productos ? 1 : 0, ofrece_servicios: ofrece_servicios ? 1 : 0, ofrece_arriendos: ofrece_arriendos ? 1 : 0 }
    })
  } catch (err) {
    console.error('Error en registro:', err)
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

    // Buscar usuario
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    }

    const user = rows[0]

    // Verificar que esté activo
    if (!user.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada' })
    }

    // Verificar password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    }

    // Generar token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    // Registrar sesión en user_sessions
    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'
      const userAgent = req.headers['user-agent'] || ''
      await pool.query(
        'INSERT INTO user_sessions (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
        [user.id, ip, userAgent]
      )
    } catch (sessErr) {
      console.error('Error registrando sesión:', sessErr)
    }

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        tipo_cuenta: user.tipo_cuenta,
        plan_id: user.plan_id,
        vende_productos: user.vende_productos,
        ofrece_servicios: user.ofrece_servicios,
        ofrece_arriendos: user.ofrece_arriendos
      }
    })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// Middleware para verificar token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// GET /api/auth/me — obtener datos del usuario autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.tipo_cuenta, u.telefono, u.comuna, u.direccion,
              u.vende_productos, u.ofrece_servicios, u.ofrece_arriendos,
              u.plan_id, u.activo, u.created_at,
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
    console.error('Error en /me:', err)
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
    console.error('Error contando registros:', err)
    res.status(500).json({ error: 'Error al contar registros' })
  }
})

// Función auxiliar para eliminar imágenes de listings del servidor
const fs = require('fs')
const path = require('path')
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

async function deleteListingsByType(userId, tipo) {
  // Obtener IDs de listings a eliminar
  const [listings] = await pool.query('SELECT id FROM listings WHERE user_id = ? AND tipo = ?', [userId, tipo])
  if (listings.length === 0) return 0

  const ids = listings.map(l => l.id)

  // Obtener URLs de imágenes para borrar archivos
  const [images] = await pool.query(`SELECT url FROM listing_images WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
  for (const img of images) {
    const filePath = path.join(UPLOAD_DIR, path.basename(img.url))
    try { fs.unlinkSync(filePath) } catch (e) { /* archivo ya no existe */ }
  }

  // Eliminar registros relacionados
  await pool.query(`DELETE FROM listing_images WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
  await pool.query(`DELETE FROM listing_sizes WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
  await pool.query(`DELETE FROM listing_dimensions WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
  await pool.query(`DELETE FROM listings WHERE id IN (${ids.map(() => '?').join(',')})`, ids)

  return ids.length
}

async function deleteAllCommerceData(userId) {
  // Eliminar todos los listings (productos, servicios, arriendos)
  const [listings] = await pool.query('SELECT id FROM listings WHERE user_id = ?', [userId])
  if (listings.length > 0) {
    const ids = listings.map(l => l.id)
    const [images] = await pool.query(`SELECT url FROM listing_images WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
    for (const img of images) {
      const filePath = path.join(UPLOAD_DIR, path.basename(img.url))
      try { fs.unlinkSync(filePath) } catch (e) {}
    }
    await pool.query(`DELETE FROM listing_images WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
    await pool.query(`DELETE FROM listing_sizes WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
    await pool.query(`DELETE FROM listing_dimensions WHERE listing_id IN (${ids.map(() => '?').join(',')})`, ids)
    await pool.query('DELETE FROM listings WHERE user_id = ?', [userId])
  }

  // Eliminar carruseles e imágenes de carrusel
  const [carousels] = await pool.query('SELECT id FROM carousels WHERE user_id = ?', [userId])
  if (carousels.length > 0) {
    const cIds = carousels.map(c => c.id)
    const [cImages] = await pool.query(`SELECT imagen_url FROM carousel_images WHERE carousel_id IN (${cIds.map(() => '?').join(',')})`, cIds)
    for (const img of cImages) {
      const filePath = path.join(UPLOAD_DIR, path.basename(img.imagen_url))
      try { fs.unlinkSync(filePath) } catch (e) {}
    }
    await pool.query(`DELETE FROM carousel_images WHERE carousel_id IN (${cIds.map(() => '?').join(',')})`, cIds)
    await pool.query('DELETE FROM carousels WHERE user_id = ?', [userId])
  }

  // Eliminar negocio
  await pool.query('DELETE FROM businesses WHERE user_id = ?', [userId])
}

async function deleteAllTurismData(userId) {
  // Eliminar tours e imágenes
  const [tours] = await pool.query('SELECT imagenes FROM turismo_tours WHERE user_id = ?', [userId])
  for (const t of tours) {
    if (t.imagenes) {
      try {
        const imgs = JSON.parse(t.imagenes)
        for (const img of imgs) {
          const filePath = path.join(UPLOAD_DIR, path.basename(img))
          try { fs.unlinkSync(filePath) } catch (e) {}
        }
      } catch (e) {}
    }
  }
  await pool.query('DELETE FROM turismo_tours WHERE user_id = ?', [userId])

  // Eliminar portada e imágenes
  const [portadas] = await pool.query('SELECT imagenes FROM turismo_portada WHERE user_id = ?', [userId])
  for (const p of portadas) {
    if (p.imagenes) {
      try {
        const imgs = JSON.parse(p.imagenes)
        for (const img of imgs) {
          const filePath = path.join(UPLOAD_DIR, path.basename(img))
          try { fs.unlinkSync(filePath) } catch (e) {}
        }
      } catch (e) {}
    }
  }
  await pool.query('DELETE FROM turismo_portada WHERE user_id = ?', [userId])

  // Eliminar página e imágenes
  const [paginas] = await pool.query('SELECT imagen_superior, imagen_inferior FROM turismo_pagina WHERE user_id = ?', [userId])
  for (const p of paginas) {
    for (const img of [p.imagen_superior, p.imagen_inferior]) {
      if (img) {
        const filePath = path.join(UPLOAD_DIR, path.basename(img))
        try { fs.unlinkSync(filePath) } catch (e) {}
      }
    }
  }
  await pool.query('DELETE FROM turismo_pagina WHERE user_id = ?', [userId])

  // Eliminar negocio
  await pool.query('DELETE FROM businesses WHERE user_id = ?', [userId])
}

// PUT /api/auth/profile — actualizar tipo de cuenta y plan, con eliminación de datos
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { tipo_cuenta, vende_productos, ofrece_servicios, ofrece_arriendos, plan_id, delete_tipos } = req.body
    const uid = req.userId

    // Obtener estado actual del usuario
    const [currentRows] = await pool.query('SELECT * FROM users WHERE id = ?', [uid])
    if (currentRows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    const current = currentRows[0]

    // Eliminar datos de tipos que se están quitando
    if (delete_tipos && Array.isArray(delete_tipos)) {
      for (const tipo of delete_tipos) {
        if (tipo === 'producto') await deleteListingsByType(uid, 'producto')
        if (tipo === 'servicio') await deleteListingsByType(uid, 'servicio')
        if (tipo === 'arriendo') await deleteListingsByType(uid, 'arriendo')
      }
    }

    // Si cambia de comercio a turismo, eliminar todo lo de comercio
    if (tipo_cuenta === 'turismo' && current.tipo_cuenta === 'general') {
      await deleteAllCommerceData(uid)
    }

    // Si cambia de turismo a comercio, eliminar todo lo de turismo
    if (tipo_cuenta === 'general' && current.tipo_cuenta === 'turismo') {
      await deleteAllTurismData(uid)
    }

    // Actualizar campos
    const selectedPlan = [1, 2, 3].includes(plan_id) ? plan_id : current.plan_id
    const tipo = ['general', 'turismo'].includes(tipo_cuenta) ? tipo_cuenta : current.tipo_cuenta

    await pool.query(
      `UPDATE users SET tipo_cuenta = ?, vende_productos = ?, ofrece_servicios = ?, ofrece_arriendos = ?, plan_id = ? WHERE id = ?`,
      [
        tipo,
        tipo === 'general' ? (vende_productos ? 1 : 0) : 0,
        tipo === 'general' ? (ofrece_servicios ? 1 : 0) : 0,
        tipo === 'general' ? (ofrece_arriendos ? 1 : 0) : 0,
        selectedPlan,
        uid
      ]
    )

    // Registrar cambio de plan en activity_log
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

    // Registrar cambio de tipo de cuenta en activity_log
    if (tipo !== current.tipo_cuenta) {
      await logActivity(uid, 'cambio_tipo_cuenta', 'user', uid, {
        tipo_anterior: current.tipo_cuenta,
        tipo_nuevo: tipo,
      })
    }

    // Devolver usuario actualizado
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
    console.error('Error actualizando perfil:', err)
    res.status(500).json({ error: 'Error al actualizar perfil' })
  }
})

module.exports = router
module.exports.authMiddleware = authMiddleware
