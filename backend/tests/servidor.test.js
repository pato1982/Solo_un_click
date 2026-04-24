const { api, publicApi, DEV_USERS } = require('./setup')

describe('SERVIDOR /api/v1/servidor', () => {

  describe('GET /stats — estadísticas del servidor', () => {
    it('devuelve métricas del servidor para programador', async () => {
      const res = await api(DEV_USERS.programador).get('/api/v1/servidor/stats')
      expect(res.status).toBe(200)
      // Campos reales: disco, bd
      expect(res.body).toHaveProperty('disco')
      expect(res.body).toHaveProperty('bd')
      expect(res.body.disco).toHaveProperty('total')
      expect(res.body.disco).toHaveProperty('disponible')
    })

    it('rechaza acceso a usuario no-programador', async () => {
      const res = await api(DEV_USERS.general_p1).get('/api/v1/servidor/stats')
      expect(res.status).toBe(403)
    })

    it('rechaza sin autenticación', async () => {
      const res = await publicApi().get('/api/v1/servidor/stats')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /estadisticas — KPIs del negocio', () => {
    it('devuelve KPIs de usuarios y visitas', async () => {
      const res = await api(DEV_USERS.programador).get('/api/v1/servidor/estadisticas')
      expect(res.status).toBe(200)
      // Campos reales: kpis, visitas
      expect(res.body).toHaveProperty('kpis')
      expect(res.body).toHaveProperty('visitas')
      expect(res.body.kpis).toHaveProperty('total')
      expect(res.body.visitas).toHaveProperty('total')
    })

    it('rechaza a no-programador', async () => {
      const res = await api(DEV_USERS.general_p1).get('/api/v1/servidor/estadisticas')
      expect(res.status).toBe(403)
    })
  })

  describe('POST /visita — registrar visita', () => {
    it('registra visita correctamente', async () => {
      const res = await publicApi()
        .post('/api/v1/servidor/visita')
        .send({ pagina: '/' })
      expect([200, 201]).toContain(res.status)
    })
  })

})
