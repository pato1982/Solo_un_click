const express = require('express')
const { exec } = require('child_process')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

async function programadorMiddleware(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT rol FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0 || rows[0].rol !== 'programador') {
      return res.status(403).json({ error: 'Acceso denegado' })
    }
    next()
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar permisos' })
  }
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

// GET /api/servidor/stats
router.get('/stats', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    // Disco
    const dfOutput = await execPromise("df -B1 / | tail -1 | awk '{print $2, $3, $4}'")
    const [totalBytes, usedBytes, availBytes] = dfOutput.split(' ').map(Number)

    // Uploads folder size + breakdown
    let uploadsBytes = 0
    let uploadsCarpetas = []
    try {
      const duOutput = await execPromise("du -sb /var/www/soloaunclick/backend/uploads 2>/dev/null | awk '{print $1}'")
      uploadsBytes = parseInt(duOutput) || 0

      // Desglose: subcarpetas
      const subdirsOutput = await execPromise("find /var/www/soloaunclick/backend/uploads -mindepth 1 -maxdepth 1 -type d -exec du -sb {} \\; 2>/dev/null")
      if (subdirsOutput) {
        uploadsCarpetas = subdirsOutput.split('\n').map(line => {
          const [bytes, fullpath] = line.split('\t')
          return { nombre: fullpath.split('/').pop(), bytes: parseInt(bytes) || 0 }
        })
      }

      // Archivos sueltos = total uploads - suma de subcarpetas
      const subdirsTotal = uploadsCarpetas.reduce((sum, c) => sum + c.bytes, 0)
      const looseBytes = uploadsBytes - subdirsTotal
      if (looseBytes > 0) {
        uploadsCarpetas.unshift({ nombre: 'imágenes (raíz)', bytes: looseBytes })
      }

      uploadsCarpetas.sort((a, b) => b.bytes - a.bytes)
    } catch (e) {}

    // Proyecto: desglose de carpetas principales
    let proyectoBytes = 0
    let proyectoCarpetas = []
    try {
      // du --max-depth=1 lista cada subdirectorio + total en una sola pasada
      const projOutput = await execPromise("du -b --max-depth=1 /var/www/soloaunclick 2>/dev/null")
      if (projOutput) {
        const lines = projOutput.split('\n')
        for (const line of lines) {
          const [bytes, fullpath] = line.split('\t')
          const name = fullpath.replace('/var/www/soloaunclick', '').replace(/^\//, '') || ''
          const size = parseInt(bytes) || 0
          if (!name) {
            proyectoBytes = size // línea del total
          } else {
            proyectoCarpetas.push({ nombre: name, bytes: size })
          }
        }
      }

      // Archivos sueltos en raíz del proyecto
      const projSubTotal = proyectoCarpetas.reduce((sum, c) => sum + c.bytes, 0)
      const projLoose = proyectoBytes - projSubTotal
      if (projLoose > 0) {
        proyectoCarpetas.push({ nombre: 'archivos raíz', bytes: projLoose })
      }

      proyectoCarpetas.sort((a, b) => b.bytes - a.bytes)
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
      WHERE table_schema = 'soloaunclick'
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
        proyecto: proyectoBytes,
        proyectoCarpetas,
      },
      bd: {
        total: dbTotal,
        datos: dbDatos,
        indices: dbIndices,
        tablas: dbRows,
      },
    })
  } catch (err) {
    console.error('Error obteniendo stats del servidor:', err)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

module.exports = router
