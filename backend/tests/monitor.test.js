const { api, publicApi, DEV_USERS } = require('./setup')

describe('MONITOR /api/v1/monitor', () => {

  describe('GET / — listados del marketplace', () => {
    it('devuelve listings para programador', async () => {
      const res = await api(DEV_USERS.programador).get('/api/v1/monitor')
      expect(res.status).toBe(200)
      expect(res.body.listings).toBeInstanceOf(Array)
      expect(res.body).toHaveProperty('total')
      expect(res.body).toHaveProperty('generado')
    })

    it('cada listing tiene los campos base esperados', async () => {
      const res = await api(DEV_USERS.programador).get('/api/v1/monitor')
      if (res.body.listings.length === 0) return
      const l = res.body.listings[0]
      expect(l).toHaveProperty('id')
      expect(l).toHaveProperty('tipo')
      expect(l).toHaveProperty('nombre')
      expect(l).toHaveProperty('created_at')
    })

    it('respeta el parámetro limit', async () => {
      const res = await api(DEV_USERS.programador).get('/api/v1/monitor?limit=5')
      expect(res.status).toBe(200)
      expect(res.body.listings.length).toBeLessThanOrEqual(5)
    })

    it('rechaza acceso a usuario no-programador', async () => {
      const res = await api(DEV_USERS.general_p1).get('/api/v1/monitor')
      expect(res.status).toBe(403)
    })

    it('rechaza sin autenticación', async () => {
      const res = await publicApi().get('/api/v1/monitor')
      expect(res.status).toBe(401)
    })

    // --- schema-v2 ---

    it('[schema-v2] cada listing expone business_id', async () => {
      const res = await api(DEV_USERS.programador).get('/api/v1/monitor')
      expect(res.status).toBe(200)
      if (res.body.listings.length === 0) return
      for (const l of res.body.listings) {
        expect(l).toHaveProperty('business_id')
        expect(typeof l.business_id).toBe('number')
        expect(l.business_id).toBeGreaterThan(0)
      }
    })

    it('[schema-v2] cada listing expone datos de usuario via JOIN a businesses', async () => {
      const res = await api(DEV_USERS.programador).get('/api/v1/monitor')
      expect(res.status).toBe(200)
      if (res.body.listings.length === 0) return
      const l = res.body.listings[0]
      // Estos campos deben llegar via: listings → businesses → users
      expect(l).toHaveProperty('usuario_nombre')
      expect(l).toHaveProperty('usuario_email')
      expect(l).toHaveProperty('plan_id')
      expect(l).toHaveProperty('plan_nombre')
    })
  })

})
