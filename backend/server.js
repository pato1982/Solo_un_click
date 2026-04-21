require('dotenv').config()
const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
    release: process.env.npm_package_version,
  })
}
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const crypto = require('crypto')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const logger = require('./logger')
const redis = require('./redis')
const { checkHealth: dbHealth } = require('./db')

const authRoutes = require('./routes/auth')
const listingsRoutes = require('./routes/listings')
const uploadRoutes = require('./routes/upload')
const businessRoutes = require('./routes/business')
const carouselsRoutes = require('./routes/carousels')
const analyticsRoutes = require('./routes/analytics')
const turismoRoutes = require('./routes/turismo')
const toursRoutes = require('./routes/tours')
const portadaRoutes = require('./routes/portada')
const paginaRoutes = require('./routes/pagina')
const categoriasRoutes = require('./routes/categorias')
const passwordResetRoutes = require('./routes/passwordReset')
const localesRoutes = require('./routes/locales')
const eventosRoutes = require('./routes/eventos')
const servidorRoutes = require('./routes/servidor')
const serviciosRoutes = require('./routes/servicios')
const mfaRoutes = require('./routes/mfa')
const monitorRoutes = require('./routes/monitor')

// --- Validación de variables de entorno críticas al arrancar ---
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET no configurado o inseguro: mínimo 32 caracteres requeridos')
}

const app = express()
const PORT = process.env.PORT || 3001

// Nginx reverse proxy: confiar en X-Forwarded-For
app.set('trust proxy', 1)

// --- Request-ID: trazabilidad por request ---
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID()
  res.setHeader('X-Request-ID', req.id)
  next()
})

// --- Request logging estructurado ---
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    logger[level]('request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms,
      ip: req.ip,
    })
  })
  next()
})

// --- Seguridad: Helmet (headers seguros) ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://soloaunclick.cl", "https://www.soloaunclick.cl"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))

// --- Seguridad: CORS restringido ---
// M-05: en producción solo HTTPS. HTTP se mantiene en dev/local para no romper flujos.
const isProd = process.env.NODE_ENV === 'production'
const allowedOrigins = isProd
  ? [
      'https://soloaunclick.cl',
      'https://www.soloaunclick.cl',
    ]
  : [
      'https://soloaunclick.cl',
      'https://www.soloaunclick.cl',
      'http://soloaunclick.cl',
      'http://www.soloaunclick.cl',
      'http://45.236.130.25',
      'http://158.220.123.58',
      'http://localhost:5173',
      'http://localhost:3000',
    ]
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true,
}))

// --- Construir stores de rate limit (Redis si disponible, memory como fallback) ---
function makeStore(prefix) {
  const redisClient = redis.getClient()
  if (redisClient && redis.available()) {
    return new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix,
    })
  }
  return undefined // express-rate-limit usa memory store por defecto
}

// --- Seguridad: Rate Limiting global ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta más tarde' },
  store: makeStore('rl:global:'),
})
app.use(globalLimiter)

// --- Seguridad: Rate Limiting estricto para auth ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, espera 15 minutos' },
  store: makeStore('rl:auth:'),
})

// --- Seguridad: Rate Limiting para password reset ---
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de recuperación, espera 1 hora' },
  store: makeStore('rl:reset:'),
})

// --- Seguridad: Rate Limiting para uploads (evitar llenado de disco) ---
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas subidas de archivos, espera un momento' },
  store: makeStore('rl:upload:'),
})

app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// --- Seguridad: Rate Limiting estricto para MFA ---
const mfaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos MFA. Espera 1 minuto.' },
  store: makeStore('rl:mfa:'),
})

// Rate limiters en endpoints sensibles (ambos prefijos)
app.use('/api/v1/auth/login', authLimiter)
app.use('/api/v1/auth/register', authLimiter)
app.use('/api/v1/auth/refresh', authLimiter)
app.use('/api/v1/auth/mfa/verify', mfaLimiter)
app.use('/api/v1/auth/mfa/enable', mfaLimiter)
app.use('/api/v1/password-reset', resetLimiter)
app.use('/api/v1/upload', uploadLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/refresh', authLimiter)
app.use('/api/auth/mfa/verify', mfaLimiter)
app.use('/api/auth/mfa/enable', mfaLimiter)
app.use('/api/password-reset', resetLimiter)
app.use('/api/upload', uploadLimiter)

const v1Routes = express.Router()
v1Routes.use('/auth', authRoutes)
v1Routes.use('/auth/mfa', mfaRoutes)
v1Routes.use('/listings', listingsRoutes)
v1Routes.use('/upload', uploadRoutes)
v1Routes.use('/business', businessRoutes)
v1Routes.use('/carousels', carouselsRoutes)
v1Routes.use('/analytics', analyticsRoutes)
v1Routes.use('/turismo', turismoRoutes)
v1Routes.use('/tours', toursRoutes)
v1Routes.use('/portada', portadaRoutes)
v1Routes.use('/pagina', paginaRoutes)
v1Routes.use('/categorias', categoriasRoutes)
v1Routes.use('/password-reset', passwordResetRoutes)
v1Routes.use('/locales', localesRoutes)
v1Routes.use('/eventos', eventosRoutes)
v1Routes.use('/servidor', servidorRoutes)
v1Routes.use('/servicios', serviciosRoutes)
v1Routes.use('/monitor', monitorRoutes)

// Montar v1 y mantener /api/ como alias para compatibilidad
app.use('/api/v1', v1Routes)
app.use('/api', v1Routes)

// --- Health check completo ---
app.get('/api/health', async (req, res) => {
  const [db, redisStatus] = await Promise.all([
    dbHealth(),
    (async () => {
      const c = redis.getClient()
      if (!c || !redis.available()) return { status: 'unavailable' }
      try {
        await c.ping()
        return { status: 'ok' }
      } catch (err) {
        return { status: 'error', message: err.message }
      }
    })(),
  ])

  const mem = process.memoryUsage()
  const healthy = db.status === 'ok'
  const status = healthy ? 200 : 503

  res.status(status).json({
    status: healthy ? 'ok' : 'degraded',
    version: 'v2',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    pid: process.pid,
    services: {
      database: db,
      redis: redisStatus,
    },
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
  })
})

// --- Middleware centralizado de errores ---
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler())
}
app.use((err, req, res, next) => {
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({ error: 'Origen no permitido' })
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Archivo demasiado grande (máx 5MB)' })
  }
  if (err.message && err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({ error: err.message })
  }
  logger.error('Error no manejado', { requestId: req.id, error: err.message, stack: err.stack })
  res.status(500).json({ error: 'Error interno del servidor' })
})

async function start() {
  await redis.connect()

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      logger.info('API iniciada', {
        port: PORT,
        pid: process.pid,
        redis: redis.available() ? 'conectado' : 'no disponible (memory fallback)',
      })
    })
  }
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

module.exports = app
