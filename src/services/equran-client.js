const { UpstreamError, NotFoundError } = require('../utils/errors')

class EquranClient {
  constructor({ baseUrl, timeoutMs, cacheTtlMs, fetchImpl }) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.timeoutMs = timeoutMs
    this.cacheTtlMs = cacheTtlMs
    this.fetchImpl = fetchImpl || globalThis.fetch
    this.cache = new Map()
  }

  async request(pathname) {
    const url = `${this.baseUrl}${pathname}`
    const cached = this.cache.get(url)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value
    }

    let response
    try {
      const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout
        ? AbortSignal.timeout(this.timeoutMs)
        : undefined

      response = await this.fetchImpl(url, {
        headers: { accept: 'application/json' },
        signal
      })
    }
    catch (error) {
      throw new UpstreamError('Gagal menghubungi layanan equran.id', { cause: error })
    }

    if (response.status === 404) {
      throw new NotFoundError('Surat tidak ditemukan')
    }

    if (!response.ok) {
      throw new UpstreamError(`Layanan equran.id mengembalikan status ${response.status}`)
    }

    let payload
    try {
      payload = await response.json()
    }
    catch (error) {
      throw new UpstreamError('Respons layanan equran.id tidak valid', { cause: error })
    }

    this.cache.set(url, {
      value: payload,
      expiresAt: Date.now() + this.cacheTtlMs
    })

    return payload
  }

  getSuratList() {
    return this.request('/surat')
  }

  getSurat(nomor) {
    return this.request(`/surat/${nomor}`)
  }

  getTafsir(nomor) {
    return this.request(`/tafsir/${nomor}`)
  }

  clearCache() {
    this.cache.clear()
  }
}

module.exports = { EquranClient }
