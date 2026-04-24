const { api, publicApi, DEV_USERS } = require('./setup')

describe('POST /api/v1/analytics/track', () => {
  it('registra un page_view válido', async () => {
    const res = await publicApi()
      .post('/api/v1/analytics/track')
      .send({ user_id: DEV_USERS.general_p1, event_type: 'page_view' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true })
  })

  it('registra un product_click con listing_id', async () => {
    const res = await publicApi()
      .post('/api/v1/analytics/track')
      .send({ user_id: DEV_USERS.general_p1, event_type: 'product_click', listing_id: 1 })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true })
  })

  it('rechaza si falta user_id', async () => {
    const res = await publicApi()
      .post('/api/v1/analytics/track')
      .send({ event_type: 'page_view' })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('rechaza si falta event_type', async () => {
    const res = await publicApi()
      .post('/api/v1/analytics/track')
      .send({ user_id: DEV_USERS.general_p1 })
    expect(res.status).toBe(400)
  })

  it('rechaza event_type inválido', async () => {
    const res = await publicApi()
      .post('/api/v1/analytics/track')
      .send({ user_id: DEV_USERS.general_p1, event_type: 'invalid_event' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Tipo inválido/i)
  })

  it('rechaza user_id inexistente', async () => {
    const res = await publicApi()
      .post('/api/v1/analytics/track')
      .send({ user_id: 99999, event_type: 'page_view' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Usuario no válido/i)
  })
})
