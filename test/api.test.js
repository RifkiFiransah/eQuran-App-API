const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createServer } = require('../src/app')
const {
  FakeEquranClient,
  setupServer,
  registerUser,
  authHeader
} = require('../test-utils/helpers')

const validSuratPayload = {
  nomor: 1,
  nama: 'Al-Fatihah',
  jumlahAyat: 7,
  turun: 'mekah',
  arti: 'Pembukaan',
  deskripsi: 'Surat pembuka Al-Quran.'
}

test('GET / mengembalikan informasi API', async (t) => {
  const { server } = await setupServer(t)

  const response = await server.inject('/')

  assert.equal(response.statusCode, 200)
  assert.equal(response.result.status, 'success')
  assert.equal(response.result.data.name, 'equran-api-app')
  assert.ok(response.result.data.endpoints.quranList)
})

test('GET /health mengembalikan status server', async (t) => {
  const { server } = await setupServer(t)

  const response = await server.inject('/health')

  assert.equal(response.statusCode, 200)
  assert.equal(response.result.status, 'success')
  assert.ok(response.result.data.uptimeSeconds >= 0)
})

test('GET /quran/surat mengambil daftar surat dari equran.id', async (t) => {
  const { server } = await setupServer(t)

  const response = await server.inject('/quran/surat')

  assert.equal(response.statusCode, 200)
  assert.equal(response.result.data.total, 3)
  assert.equal(response.result.data.surat.length, 3)
})

test('GET /quran/surat mendukung filter dan pagination', async (t) => {
  const { server } = await setupServer(t)

  const byNama = await server.inject('/quran/surat?nama=baqarah')
  assert.equal(byNama.statusCode, 200)
  assert.equal(byNama.result.data.total, 1)
  assert.equal(byNama.result.data.surat[0].nomor, 2)

  const byTempatTurun = await server.inject('/quran/surat?tempat_turun=mekah')
  assert.equal(byTempatTurun.result.data.total, 1)
  assert.equal(byTempatTurun.result.data.surat[0].nomor, 1)

  const paged = await server.inject('/quran/surat?limit=1&offset=1')
  assert.equal(paged.result.data.surat.length, 1)
  assert.equal(paged.result.data.surat[0].nomor, 2)
})

test('GET /quran/surat/{nomor} memvalidasi nomor surat', async (t) => {
  const { server } = await setupServer(t)

  const detail = await server.inject('/quran/surat/1')
  assert.equal(detail.statusCode, 200)
  assert.equal(detail.result.data.surat.ayat.length, 1)

  const tafsir = await server.inject('/quran/surat/1/tafsir')
  assert.equal(tafsir.statusCode, 200)
  assert.equal(tafsir.result.data.tafsir.tafsir.length, 1)

  const invalid = await server.inject('/quran/surat/115')
  assert.equal(invalid.statusCode, 400)
  assert.equal(invalid.result.status, 'fail')
  assert.equal(invalid.result.message, 'Validasi gagal')

  const missing = await server.inject('/quran/surat/50')
  assert.equal(missing.statusCode, 404)
  assert.equal(missing.result.message, 'Surat tidak ditemukan')
})

test('GET /quran/surat mengembalikan 502 saat equran.id gagal', async (t) => {
  const { server } = await setupServer(t, {
    client: new FakeEquranClient({ fail: true })
  })

  const response = await server.inject('/quran/surat')

  assert.equal(response.statusCode, 502)
  assert.equal(response.result.message, 'Layanan equran.id sedang tidak tersedia')
})

test('POST /auth/register, login, dan GET /auth/me berjalan', async (t) => {
  const { server } = await setupServer(t)

  const register = await registerUser(server)
  assert.equal(register.statusCode, 201)
  assert.equal(register.result.status, 'success')
  assert.ok(register.result.data.token)
  assert.equal(register.result.data.user.email, 'rifki@example.com')
  assert.equal(register.result.data.user.passwordHash, undefined)

  const duplicate = await registerUser(server)
  assert.equal(duplicate.statusCode, 409)
  assert.equal(duplicate.result.message, 'Email sudah terdaftar')

  const invalidEmail = await registerUser(server, { email: 'bukan-email' })
  assert.equal(invalidEmail.statusCode, 400)
  assert.equal(invalidEmail.result.message, 'Validasi gagal')
  assert.ok(invalidEmail.result.errors.length > 0)

  const shortPassword = await registerUser(server, {
    email: 'lain@example.com',
    password: 'pendek'
  })
  assert.equal(shortPassword.statusCode, 400)

  const login = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'rifki@example.com', password: 'password123' }
  })
  assert.equal(login.statusCode, 200)
  assert.ok(login.result.data.token)

  const wrongPassword = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'rifki@example.com', password: 'salah-password' }
  })
  assert.equal(wrongPassword.statusCode, 401)
  assert.equal(wrongPassword.result.message, 'Email atau password salah')

  const me = await server.inject({
    method: 'GET',
    url: '/auth/me',
    headers: authHeader(register)
  })
  assert.equal(me.statusCode, 200)
  assert.equal(me.result.data.user.email, 'rifki@example.com')

  const withoutToken = await server.inject('/auth/me')
  assert.equal(withoutToken.statusCode, 401)
  assert.equal(withoutToken.result.message, 'Autentikasi diperlukan atau token tidak valid')

  const invalidToken = await server.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: 'Bearer token-palsu' }
  })
  assert.equal(invalidToken.statusCode, 401)
})

test('CRUD /surats membutuhkan autentikasi dan berjalan lengkap', async (t) => {
  const { server } = await setupServer(t)
  const register = await registerUser(server)
  const headers = authHeader(register)

  const withoutToken = await server.inject({
    method: 'POST',
    url: '/surats',
    payload: validSuratPayload
  })
  assert.equal(withoutToken.statusCode, 401)

  const created = await server.inject({
    method: 'POST',
    url: '/surats',
    headers,
    payload: validSuratPayload
  })
  assert.equal(created.statusCode, 201)
  assert.ok(created.result.data.surat.id)
  assert.equal(created.result.data.surat.nomor, 1)
  const id = created.result.data.surat.id

  const duplicate = await server.inject({
    method: 'POST',
    url: '/surats',
    headers,
    payload: { ...validSuratPayload, nama: 'Duplikat' }
  })
  assert.equal(duplicate.statusCode, 409)

  const list = await server.inject({ url: '/surats', headers })
  assert.equal(list.statusCode, 200)
  assert.equal(list.result.data.total, 1)
  assert.equal(list.result.data.surat.length, 1)

  const filtered = await server.inject('/surats?nama=fatihah')
  assert.equal(filtered.result.data.total, 1)

  const detail = await server.inject({
    method: 'GET',
    url: `/surats/${id}`,
    headers
  })
  assert.equal(detail.statusCode, 200)
  assert.equal(detail.result.data.surat.id, id)

  const legacyDetail = await server.inject(`/surat/${id}`)
  assert.equal(legacyDetail.statusCode, 200)
  assert.equal(legacyDetail.result.data.surat.id, id)

  const updated = await server.inject({
    method: 'PUT',
    url: `/surats/${id}`,
    headers,
    payload: { nama: 'Al Fatihah' }
  })
  assert.equal(updated.statusCode, 200)
  assert.equal(updated.result.data.surat.nama, 'Al Fatihah')
  assert.notEqual(updated.result.data.surat.updatedAt, updated.result.data.surat.createdAt)

  const emptyUpdate = await server.inject({
    method: 'PUT',
    url: `/surats/${id}`,
    headers,
    payload: {}
  })
  assert.equal(emptyUpdate.statusCode, 400)

  const second = await server.inject({
    method: 'POST',
    url: '/surats',
    headers,
    payload: { ...validSuratPayload, nomor: 2, nama: 'Al-Baqarah' }
  })
  assert.equal(second.statusCode, 201)

  const duplicateUpdate = await server.inject({
    method: 'PUT',
    url: `/surats/${second.result.data.surat.id}`,
    headers,
    payload: { nomor: 1 }
  })
  assert.equal(duplicateUpdate.statusCode, 409)

  const removed = await server.inject({
    method: 'DELETE',
    url: `/surats/${id}`,
    headers
  })
  assert.equal(removed.statusCode, 200)

  const afterDelete = await server.inject(`/surats/${id}`)
  assert.equal(afterDelete.statusCode, 404)
})

test('payload surat tidak valid ditolak dengan detail validasi', async (t) => {
  const { server } = await setupServer(t)
  const register = await registerUser(server)
  const headers = authHeader(register)

  const invalidNomor = await server.inject({
    method: 'POST',
    url: '/surats',
    headers,
    payload: { ...validSuratPayload, nomor: 0 }
  })
  assert.equal(invalidNomor.statusCode, 400)
  assert.ok(invalidNomor.result.errors.length > 0)

  const missingFields = await server.inject({
    method: 'POST',
    url: '/surats',
    headers,
    payload: { nama: 'Tanpa nomor' }
  })
  assert.equal(missingFields.statusCode, 400)
  assert.ok(missingFields.result.errors.length >= 2)
})

test('GET /docs menyajikan halaman Swagger UI', async (t) => {
  const { server } = await setupServer(t)

  const response = await server.inject('/docs')

  assert.equal(response.statusCode, 200)
  assert.match(response.headers['content-type'], /text\/html/)
  assert.match(response.payload, /SwaggerUIBundle/)
})

test('GET /openapi.json mengembalikan spesifikasi OpenAPI', async (t) => {
  const { server } = await setupServer(t)

  const response = await server.inject('/openapi.json')

  assert.equal(response.statusCode, 200)
  assert.match(response.headers['content-type'], /application\/json/)
  assert.equal(response.result.openapi, '3.0.3')
  assert.equal(response.result.info.title, 'e-Quran API')
  assert.ok(response.result.paths['/quran/surat'])
  assert.ok(response.result.paths['/auth/login'])
})

test('GET /docs/assets menyajikan aset Swagger UI', async (t) => {
  const { server } = await setupServer(t)

  const css = await server.inject('/docs/assets/swagger-ui.css')
  assert.equal(css.statusCode, 200)
  assert.match(css.headers['content-type'], /text\/css/)

  const missing = await server.inject('/docs/assets/tidak-ada.js')
  assert.equal(missing.statusCode, 404)
})

test('endpoint tidak dikenal mengembalikan 404 dengan format konsisten', async (t) => {
  const { server } = await setupServer(t)

  const response = await server.inject('/tidak-ada')

  assert.equal(response.statusCode, 404)
  assert.equal(response.result.status, 'fail')
  assert.equal(response.result.message, 'Endpoint tidak ditemukan')
})

test('data user dan surat tetap ada setelah server restart', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'equran-api-'))
  const config = { dataDir, jwtSecret: 'test-secret', jwtExpiresInSeconds: 3600 }

  t.after(() => {
    fs.rmSync(dataDir, { recursive: true, force: true })
  })

  const firstServer = await createServer({
    config,
    equranClient: new FakeEquranClient()
  })
  await firstServer.initialize()

  const register = await registerUser(firstServer)
  const created = await firstServer.inject({
    method: 'POST',
    url: '/surats',
    headers: authHeader(register),
    payload: validSuratPayload
  })
  assert.equal(created.statusCode, 201)
  await firstServer.stop()

  const secondServer = await createServer({
    config,
    equranClient: new FakeEquranClient()
  })
  await secondServer.initialize()
  t.after(() => secondServer.stop())

  const list = await secondServer.inject('/surats')
  assert.equal(list.result.data.total, 1)

  const login = await secondServer.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'rifki@example.com', password: 'password123' }
  })
  assert.equal(login.statusCode, 200)
})
