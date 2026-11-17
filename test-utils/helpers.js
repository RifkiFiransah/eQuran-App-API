const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createServer } = require('../src/app')
const { NotFoundError, UpstreamError } = require('../src/utils/errors')

const suratList = [
  {
    nomor: 1,
    nama: 'الفاتحة',
    nama_latin: 'Al-Fatihah',
    jumlah_ayat: 7,
    tempat_turun: 'mekah',
    arti: 'Pembukaan',
    deskripsi: 'Surat pembuka Al-Quran.'
  },
  {
    nomor: 2,
    nama: 'البقرة',
    nama_latin: 'Al-Baqarah',
    jumlah_ayat: 286,
    tempat_turun: 'madinah',
    arti: 'Sapi Betina',
    deskripsi: 'Surat terpanjang dalam Al-Quran.'
  },
  {
    nomor: 3,
    nama: 'آل عمران',
    nama_latin: "Ali 'Imran",
    jumlah_ayat: 200,
    tempat_turun: 'madinah',
    arti: 'Keluarga Imran',
    deskripsi: 'Surat tentang keluarga Imran.'
  }
]

class FakeEquranClient {
  constructor({ fail = false } = {}) {
    this.fail = fail
  }

  async getSuratList() {
    if (this.fail) {
      throw new UpstreamError()
    }

    return suratList
  }

  async getSurat(nomor) {
    if (this.fail) {
      throw new UpstreamError()
    }

    const surat = suratList.find((item) => item.nomor === Number(nomor))
    if (!surat) {
      throw new NotFoundError('Surat tidak ditemukan')
    }

    return {
      ...surat,
      audio: {},
      status: true,
      ayat: [{ id: 1, surah: surat.nomor, nomor: 1, ar: 'بِسْمِ اللّٰهِ', tr: 'Bismillah', idn: 'Dengan nama Allah' }]
    }
  }

  async getTafsir(nomor) {
    if (this.fail) {
      throw new UpstreamError()
    }

    const surat = suratList.find((item) => item.nomor === Number(nomor))
    if (!surat) {
      throw new NotFoundError('Surat tidak ditemukan')
    }

    return {
      ...surat,
      tafsir: [{ ayat: 1, teks: 'Tafsir ayat pertama.' }]
    }
  }
}

const setupServer = async (t, { client = new FakeEquranClient(), config = {} } = {}) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'equran-api-'))
  const server = await createServer({
    config: {
      dataDir,
      jwtSecret: 'test-secret',
      jwtExpiresInSeconds: 3600,
      ...config
    },
    equranClient: client
  })

  await server.initialize()

  t.after(async () => {
    await server.stop()
    fs.rmSync(dataDir, { recursive: true, force: true })
  })

  return { server, dataDir }
}

const registerUser = (server, overrides = {}) => {
  return server.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      name: 'Rifki Firansah',
      email: 'rifki@example.com',
      password: 'password123',
      ...overrides
    }
  })
}

const authHeader = (response) => ({
  authorization: `Bearer ${response.result.data.token}`
})

module.exports = {
  suratList,
  FakeEquranClient,
  setupServer,
  registerUser,
  authHeader
}
