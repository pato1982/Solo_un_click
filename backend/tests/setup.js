/**
 * Setup global para tests de integración.
 * Apunta al backend real via SSH tunnel (localhost:3002 → VPS:3001).
 * Requiere: ssh -L 3002:localhost:3001 root@158.220.123.58 -N &
 */
const request = require('supertest')

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3002'

// Usuarios de QA disponibles en el VPS (creados en seed_test.sql)
const DEV_USERS = {
  programador: 999,    // rol=programador, plan=3
  general_p1:  1000,   // rol=user, general, plan=1
  general_p2:  1001,   // rol=user, general, plan=2
  general_p3:  1002,   // rol=user, general, plan=3
  turismo_p3:  1003,   // rol=user, turismo, plan=3
}

function api(userId) {
  const agent = request(BASE_URL)
  // Devuelve un wrapper que inyecta el header de dev bypass
  return {
    get: (path) => agent.get(path).set('X-Dev-User-Id', String(userId)),
    post: (path) => agent.post(path).set('X-Dev-User-Id', String(userId)),
    put: (path) => agent.put(path).set('X-Dev-User-Id', String(userId)),
    patch: (path) => agent.patch(path).set('X-Dev-User-Id', String(userId)),
    delete: (path) => agent.delete(path).set('X-Dev-User-Id', String(userId)),
  }
}

function publicApi() {
  return request(BASE_URL)
}

module.exports = { BASE_URL, DEV_USERS, api, publicApi }
