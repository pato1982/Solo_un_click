const express = require('express')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

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

const app = express()
const PORT = 3001

// Nginx reverse proxy: confiar en X-Forwarded-For
app.set('trust proxy', 1)

// --- Seguridad: Helmet (headers seguros) ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Vite/React maneja CSP
}))

// --- Seguridad: CORS restringido ---
const allowedOrigins = [
  'https://soloaunclick.cl',
  'https://www.soloaunclick.cl',
  'http://soloaunclick.cl',
  'http://www.soloaunclick.cl',
  'http://45.236.130.25',
  'http://localhost:5173',
  'http://localhost:3000',
]
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (curl, Postman, mismo servidor)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true,
}))

// --- Seguridad: Rate Limiting global ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // máximo 300 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta más tarde' },
})
app.use(globalLimiter)

// --- Seguridad: Rate Limiting estricto para auth ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // máximo 10 intentos de login/register por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, espera 15 minutos' },
})

// --- Seguridad: Rate Limiting para password reset ---
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 intentos de reset por IP por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de recuperación, espera 1 hora' },
})

app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rutas API (con rate limiters en endpoints sensibles)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/password-reset', resetLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/business', businessRoutes)
app.use('/api/carousels', carouselsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/turismo', turismoRoutes)
app.use('/api/tours', toursRoutes)
app.use('/api/portada', portadaRoutes)
app.use('/api/pagina', paginaRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/password-reset', passwordResetRoutes)
app.use('/api/locales', localesRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/servidor', servidorRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// --- Middleware centralizado de errores ---
app.use((err, req, res, next) => {
  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({ error: 'Origen no permitido' })
  }
  // Error de Multer (tamaño de archivo)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Archivo demasiado grande (máx 5MB)' })
  }
  // Error de Multer (tipo de archivo)
  if (err.message && err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({ error: err.message })
  }
  // Error genérico
  console.error('Error no manejado:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`)
})
