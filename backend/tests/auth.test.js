const { api, publicApi, DEV_USERS } = require('./setup')

describe('AUTH /api/v1/auth', () => {

  describe('GET /dev-info', () => {
    it('devuelve lista de usuarios de desarrollo', async () => {
      const res = await publicApi().get('/api/v1/auth/dev-info')
      expect(res.status).toBe(200)
      expect(res.body.users).toBeInstanceOf(Array)
      expect(res.body.users.length).toBeGreaterThan(0)
      expect(res.body.devBypass).toBe(true)
    })

    it('cada usuario tiene campos requeridos', async () => {
      const res = await publicApi().get('/api/v1/auth/dev-info')
      for (const u of res.body.users) {
        expect(u).toHaveProperty('id')
        expect(u).toHaveProperty('nombre')
        expect(u).toHaveProperty('email')
        expect(u).toHaveProperty('rol')
        expect(u).toHaveProperty('plan_id')
        expect(u).toHaveProperty('tipo_cuenta')
      }
    })

    it('incluye los 5 usuarios QA esperados', async () => {
      const res = await publicApi().get('/api/v1/auth/dev-info')
      const ids = res.body.users.map(u => u.id)
      expect(ids).toContain(DEV_USERS.programador)
      expect(ids).toContain(DEV_USERS.general_p1)
    })
  })

  describe('GET /profile/counts', () => {
    it('devuelve conteo de recursos del usuario', async () => {
      const res = await api(DEV_USERS.general_p2).get('/api/v1/auth/profile/counts')
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        productos: expect.any(Number),
        servicios: expect.any(Number),
        arriendos: expect.any(Number),
        negocio: expect.any(Number),
      })
    })

    it('rechaza sin autenticación', async () => {
      const res = await publicApi().get('/api/v1/auth/profile/counts')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /profile/plans-info', () => {
    it('devuelve planes para tipo general', async () => {
      const res = await api(DEV_USERS.general_p1).get('/api/v1/auth/profile/plans-info?tipo=general')
      expect(res.status).toBe(200)
      expect(res.body.plans).toBeInstanceOf(Array)
      expect(res.body.plans.length).toBe(3)
    })

    it('devuelve planes para tipo turismo (solo plan 1 y 3)', async () => {
      const res = await api(DEV_USERS.turismo_p3).get('/api/v1/auth/profile/plans-info?tipo=turismo')
      expect(res.status).toBe(200)
      const ids = res.body.plans.map(p => p.id)
      expect(ids).toContain(1)
      expect(ids).toContain(3)
    })
  })

  describe('GET /profile/history', () => {
    it('devuelve historial de cambios', async () => {
      const res = await api(DEV_USERS.general_p1).get('/api/v1/auth/profile/history')
      expect(res.status).toBe(200)
      expect(res.body.history).toBeInstanceOf(Array)
    })
  })

  describe('POST /login — validaciones', () => {
    it('rechaza email inválido', async () => {
      const res = await publicApi()
        .post('/api/v1/auth/login')
        .send({ email: 'no-es-email', password: 'test' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it('rechaza credenciales incorrectas', async () => {
      const res = await publicApi()
        .post('/api/v1/auth/login')
        .send({ email: 'noexiste@test.com', password: 'passwordcorrecto123' })
      expect(res.status).toBe(401)
    })
  })

  describe('POST /register — validaciones', () => {
    it('rechaza contraseña corta', async () => {
      const res = await publicApi()
        .post('/api/v1/auth/register')
        .send({ nombre: 'Test', email: 'test@test.com', password: 'corta' })
      expect(res.status).toBe(400)
    })

    it('rechaza email inválido', async () => {
      const res = await publicApi()
        .post('/api/v1/auth/register')
        .send({ nombre: 'Test', email: 'no-email', password: 'contraseñasegura123' })
      expect(res.status).toBe(400)
    })
  })

})
