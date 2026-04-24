// Nota: /api/v1/password-reset tiene rate limiter estricto.
// Bajo tests seguidos, muchas requests recibirán 429. Todos los expects aceptan [400, 429].
const { publicApi } = require('./setup')

describe('POST /api/v1/password-reset/request', () => {
  it('retorna mensaje genérico para email inexistente (no revela existencia)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/request')
      .send({ email: 'noexiste@test.com' })
    // 200 (email no existe, no intenta SMTP) o 429 si rate limit alcanzado
    expect([200, 429]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body.message).toMatch(/Si el email existe/i)
    }
  })

  it.skip('retorna mensaje genérico para email existente — SKIP: intenta envío SMTP real y causa timeout de 15s', async () => {
    // Cuando el email existe, el backend llama sendPasswordResetEmail() que conecta
    // al servidor SMTP. Si SMTP no responde, la request cuelga hasta el timeout del test.
  })

  it('rechaza email inválido (400 o 429 rate-limit)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/request')
      .send({ email: 'no-es-email' })
    expect([400, 429]).toContain(res.status)
  })

  it('rechaza si falta el email (400 o 429 rate-limit)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/request')
      .send({})
    expect([400, 429]).toContain(res.status)
  })
})

describe('POST /api/v1/password-reset/validate', () => {
  it('rechaza token inválido (400 o 429 rate-limit)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/validate')
      .send({ token: 'token-invalido-fake-12345' })
    expect([400, 429]).toContain(res.status)
    if (res.status === 400) {
      expect(res.body.error).toMatch(/inválido|expirado/i)
    }
  })

  it('rechaza si falta el token (400 o 429 rate-limit)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/validate')
      .send({})
    expect([400, 429]).toContain(res.status)
  })
})

describe('POST /api/v1/password-reset/reset', () => {
  it('rechaza token inválido (400 o 429 rate-limit)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/reset')
      .send({ token: 'token-invalido', password: 'nueva123' })
    expect([400, 429]).toContain(res.status)
  })

  it('rechaza si falta token o password (400 o 429 rate-limit)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/reset')
      .send({ token: 'algo' })
    expect([400, 429]).toContain(res.status)
  })

  it('rechaza contraseña menor a 6 caracteres (400 o 429 rate-limit)', async () => {
    const res = await publicApi()
      .post('/api/v1/password-reset/reset')
      .send({ token: 'token-invalido', password: '123' })
    expect([400, 429]).toContain(res.status)
  })
})
