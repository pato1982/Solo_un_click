const { api, publicApi, DEV_USERS } = require('./setup')

describe('BUSINESS /api/v1/business', () => {

  describe('GET / — negocio del usuario autenticado', () => {
    it('devuelve negocio para usuario autenticado', async () => {
      const res = await api(DEV_USERS.general_p1).get('/api/v1/business')
      expect(res.status).toBe(200)
      // La respuesta envuelve el negocio en {business: {...}}
      expect(res.body).toHaveProperty('business')
      expect(res.body.business).toHaveProperty('user_id', DEV_USERS.general_p1)
    })

    it('rechaza sin autenticación', async () => {
      const res = await publicApi().get('/api/v1/business')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /public/:userId — negocio público', () => {
    it('devuelve negocio de usuario existente', async () => {
      const res = await publicApi().get(`/api/v1/business/public/${DEV_USERS.general_p1}`)
      expect(res.status).toBe(200)
    })

    it('devuelve respuesta para usuario inexistente (vacío o 404)', async () => {
      const res = await publicApi().get('/api/v1/business/public/99999')
      // El backend puede devolver 200 vacío o 404 — ambos son aceptables
      expect([200, 404]).toContain(res.status)
    })
  })

  describe('POST / — crear/actualizar negocio', () => {
    it('guarda negocio con nombre válido', async () => {
      const res = await api(DEV_USERS.general_p2)
        .post('/api/v1/business')
        .send({ nombre_negocio: 'Negocio Test QA P2' })
      expect(res.status).toBe(200)
      expect(res.body.message).toMatch(/guardad/i)
    })

    it('rechaza nombre vacío', async () => {
      const res = await api(DEV_USERS.general_p2)
        .post('/api/v1/business')
        .send({ nombre_negocio: '' })
      expect(res.status).toBe(400)
    })

    it('rechaza nombre de 1 carácter', async () => {
      const res = await api(DEV_USERS.general_p2)
        .post('/api/v1/business')
        .send({ nombre_negocio: 'X' })
      expect(res.status).toBe(400)
    })

    it('rechaza URL de Facebook inválida', async () => {
      const res = await api(DEV_USERS.general_p2)
        .post('/api/v1/business')
        .send({ nombre_negocio: 'Test Negocio', facebook: 'http://otrodomain.com/pagina' })
      expect(res.status).toBe(400)
    })

    it('acepta URL de Facebook válida', async () => {
      const res = await api(DEV_USERS.general_p2)
        .post('/api/v1/business')
        .send({ nombre_negocio: 'Test Negocio', facebook: 'https://facebook.com/mipagina' })
      expect(res.status).toBe(200)
    })

    it('rechaza sin autenticación', async () => {
      const res = await publicApi()
        .post('/api/v1/business')
        .send({ nombre_negocio: 'Test' })
      expect(res.status).toBe(401)
    })
  })

})
