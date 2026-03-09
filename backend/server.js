const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes = require('./routes/auth')
const listingsRoutes = require('./routes/listings')
const uploadRoutes = require('./routes/upload')
const businessRoutes = require('./routes/business')

const app = express()
const PORT = 3001

// Middlewares
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rutas API
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/business', businessRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`)
})
