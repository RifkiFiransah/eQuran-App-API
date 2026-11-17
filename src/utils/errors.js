class UpstreamError extends Error {
  constructor(message = 'Layanan equran.id sedang tidak tersedia', options) {
    super(message, options)
    this.name = 'UpstreamError'
  }
}

class NotFoundError extends Error {
  constructor(message = 'Data tidak ditemukan') {
    super(message)
    this.name = 'NotFoundError'
  }
}

module.exports = { UpstreamError, NotFoundError }
