const express = require('express')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const pool = require('../db')
const { authMiddleware, programadorMiddleware } = require('./auth')
const logger = require('../logger')

const router = express.Router()
const uploadsDir = path.join(__dirname, '..', 'uploads')

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

// Calcula el tamaño total de un directorio de forma recursiva usando fs.promises (sin shell)
async function getDirSize(dirPath) {
  let total = 0
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        total += await getDirSize(full)
      } else if (entry.isFile()) {
        const stat = await fs.promises.stat(full)
        total += stat.size
      }
    }
  } catch {}
  return total
}

// Lista subdirectorios de primer nivel con su tamaño usando fs.promises (sin shell)
async function getSubdirSizes(dirPath) {
  const result = []
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    await Promise.all(
      entries
        .filter(e => e.isDirectory())
        .map(async e => {
          const full = path.join(dirPath, e.name)
          const bytes = await getDirSize(full)
          result.push({ nombre: e.name, bytes })
        })
    )
  } catch {}
  return result
}

// GET /api/servidor/stats
router.get('/stats', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    // Disco
    const dfOutput = await execPromise("df -B1 / | tail -1 | awk '{print $2, $3, $4}'")
    const [totalBytes, usedBytes, availBytes] = dfOutput.split(' ').map(Number)

    // Uploads folder size + breakdown (usando fs.promises, sin exec shell)
    let uploadsBytes = 0
    let uploadsCarpetas = []
    try {
      uploadsCarpetas = await getSubdirSizes(uploadsDir)
      const subdirsTotal = uploadsCarpetas.reduce((sum, c) => sum + c.bytes, 0)

      // Archivos sueltos en la raíz de uploads
      const entries = await fs.promises.readdir(uploadsDir, { withFileTypes: true })
      let looseBytes = 0
      for (const e of entries) {
        if (e.isFile()) {
          const stat = await fs.promises.stat(path.join(uploadsDir, e.name))
          looseBytes += stat.size
        }
      }
      uploadsBytes = subdirsTotal + looseBytes

      if (looseBytes > 0) {
        uploadsCarpetas.unshift({ nombre: 'imágenes (raíz)', bytes: looseBytes })
      }

      uploadsCarpetas.sort((a, b) => b.bytes - a.bytes)
    } catch (e) {}

    // Base de datos
    const [dbRows] = await pool.query(`
      SELECT
        table_name AS tabla,
        ROUND(data_length) AS datos_bytes,
        ROUND(index_length) AS indices_bytes,
        ROUND(data_length + index_length) AS total_bytes,
        table_rows AS filas
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `)

    const dbTotal = dbRows.reduce((sum, t) => sum + (t.total_bytes || 0), 0)
    const dbDatos = dbRows.reduce((sum, t) => sum + (t.datos_bytes || 0), 0)
    const dbIndices = dbRows.reduce((sum, t) => sum + (t.indices_bytes || 0), 0)

    res.json({
      disco: {
        total: totalBytes,
        usado: usedBytes,
        disponible: availBytes,
        uploads: uploadsBytes,
        uploadsCarpetas,
      },
      bd: {
        total: dbTotal,
        datos: dbDatos,
        indices: dbIndices,
        tablas: dbRows,
      },
    })
  } catch (err) {
    logger.error('Error obteniendo stats del servidor', { error: err.message })
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

// GET /api/servidor/estadisticas
router.get('/estadisticas', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    // KPIs de usuarios por plan y tipo
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN tipo_cuenta = 'general' AND plan_id = 1 THEN 1 ELSE 0 END) AS general_gratis,
        SUM(CASE WHEN tipo_cuenta = 'general' AND plan_id = 2 THEN 1 ELSE 0 END) AS general_normal,
        SUM(CASE WHEN tipo_cuenta = 'general' AND plan_id = 3 THEN 1 ELSE 0 END) AS general_premium,
        SUM(CASE WHEN tipo_cuenta = 'turismo' AND plan_id = 1 THEN 1 ELSE 0 END) AS turismo_gratis,
        SUM(CASE WHEN tipo_cuenta = 'turismo' AND plan_id = 3 THEN 1 ELSE 0 END) AS turismo_premium
      FROM users
      WHERE rol != 'programador'
    `)

    // KPIs de visitas al sitio
    const [visitasRows] = await pool.query(`
      SELECT
        COUNT(*) AS total_visitas,
        COUNT(DISTINCT ip) AS visitantes_unicos,
        SUM(CASE WHEN created_at >= CURDATE() THEN 1 ELSE 0 END) AS visitas_hoy,
        SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS visitas_semana,
        SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS visitas_mes,
        COUNT(DISTINCT DATE(created_at)) AS dias_con_datos
      FROM site_visits
    `)

    // Visitantes reiterados: IPs que visitaron más de 1 vez
    const [reiteradosRows] = await pool.query(`
      SELECT COUNT(*) AS reiterados FROM (
        SELECT ip FROM site_visits GROUP BY ip HAVING COUNT(*) > 1
      ) t
    `)

    const v = visitasRows[0]
    const diasConDatos = v.dias_con_datos || 1
    const promedioDiario = v.total_visitas > 0 ? Math.round((v.total_visitas / diasConDatos) * 10) / 10 : 0

    res.json({
      kpis: {
        total: rows[0].total || 0,
        general_gratis: rows[0].general_gratis || 0,
        general_normal: rows[0].general_normal || 0,
        general_premium: rows[0].general_premium || 0,
        turismo_gratis: rows[0].turismo_gratis || 0,
        turismo_premium: rows[0].turismo_premium || 0,
      },
      visitas: {
        promedio_diario: promedioDiario,
        hoy: v.visitas_hoy || 0,
        semanales: v.visitas_semana || 0,
        mensuales: v.visitas_mes || 0,
        total: v.total_visitas || 0,
        visitantes_unicos: v.visitantes_unicos || 0,
        reiterados: reiteradosRows[0].reiterados || 0,
      },
    })
  } catch (err) {
    logger.error('Error obteniendo estadísticas', { error: err.message })
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

// POST /api/servidor/visita (público, registra visita al sitio)
// Deduplicación: máximo 1 registro por IP cada 30 minutos
router.post('/visita', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress
    const userAgent = (req.headers['user-agent'] || '').substring(0, 255)
    const pagina = (req.body.pagina || 'home').substring(0, 100)

    // Verificar si esta IP ya registró visita en los últimos 30 minutos
    const [recent] = await pool.query(
      'SELECT id FROM site_visits WHERE ip = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE) LIMIT 1',
      [ip]
    )
    if (recent.length > 0) return res.json({ ok: true, skipped: true })

    await pool.query(
      'INSERT INTO site_visits (ip, pagina, user_agent) VALUES (?, ?, ?)',
      [ip, pagina, userAgent]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar visita' })
  }
})

module.exports = router
