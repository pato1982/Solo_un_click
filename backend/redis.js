const Redis = require('ioredis')
const logger = require('./logger')

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10)
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined

let client = null
let isAvailable = false

function createClient() {
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null // stop retrying after 3 attempts at startup
      return Math.min(times * 200, 1000)
    },
    enableOfflineQueue: false,
    connectTimeout: 3000,
  })

  redis.on('connect', () => {
    isAvailable = true
    logger.info('Redis conectado', { host: REDIS_HOST, port: REDIS_PORT })
  })

  redis.on('error', (err) => {
    if (isAvailable) {
      logger.warn('Redis desconectado — rate limiting en memoria', { error: err.message })
    }
    isAvailable = false
  })

  redis.on('close', () => {
    isAvailable = false
  })

  return redis
}

async function connect() {
  if (client) return client
  client = createClient()
  try {
    await client.connect()
  } catch (err) {
    logger.warn('Redis no disponible en startup — rate limiting en memoria', { error: err.message })
    isAvailable = false
  }
  return client
}

function getClient() {
  return client
}

function available() {
  return isAvailable
}

module.exports = { connect, getClient, available }
