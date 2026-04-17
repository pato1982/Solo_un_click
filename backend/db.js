const mysql = require('mysql2/promise')

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME']
for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    console.error(`FATAL: Variable de entorno ${v} no está configurada`)
    process.exit(1)
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 100,
  connectTimeout: 10000,
  idleTimeout: 60000,
})

async function checkHealth() {
  let conn
  try {
    conn = await pool.getConnection()
    await conn.query('SELECT 1')
    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err.message }
  } finally {
    if (conn) conn.release()
  }
}

module.exports = pool
module.exports.checkHealth = checkHealth
