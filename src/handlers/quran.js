const Boom = require('@hapi/boom')
const { success } = require('../utils/http')
const { UpstreamError, NotFoundError } = require('../utils/errors')

const toBoom = (request, error) => {
  if (error instanceof NotFoundError) {
    return Boom.notFound(error.message)
  }

  if (error instanceof UpstreamError) {
    request.log(['equran', 'error'], error)
    return Boom.badGateway(error.message)
  }

  return error
}

const getAllSuratHandler = async (request, h) => {
  const { nama, tempat_turun, limit, offset } = request.query

  try {
    let surat = await request.server.app.equranClient.getSuratList()

    if (nama) {
      const keyword = nama.toLowerCase()
      surat = surat.filter((item) => {
        return String(item.nama_latin || '').toLowerCase().includes(keyword)
          || String(item.nama || '').includes(nama)
          || String(item.arti || '').toLowerCase().includes(keyword)
      })
    }

    if (tempat_turun) {
      surat = surat.filter((item) => String(item.tempat_turun || '').toLowerCase() === tempat_turun)
    }

    const total = surat.length
    const items = surat.slice(offset, offset + limit)

    return success(h, 'Daftar surat berhasil diambil', {
      total,
      limit,
      offset,
      surat: items
    })
  }
  catch (error) {
    throw toBoom(request, error)
  }
}

const getSuratByNomorHandler = async (request, h) => {
  const { nomor } = request.params

  try {
    const surat = await request.server.app.equranClient.getSurat(nomor)
    return success(h, 'Detail surat berhasil diambil', { surat })
  }
  catch (error) {
    throw toBoom(request, error)
  }
}

const getTafsirByNomorHandler = async (request, h) => {
  const { nomor } = request.params

  try {
    const tafsir = await request.server.app.equranClient.getTafsir(nomor)
    return success(h, 'Tafsir surat berhasil diambil', { tafsir })
  }
  catch (error) {
    throw toBoom(request, error)
  }
}

module.exports = {
  getAllSuratHandler,
  getSuratByNomorHandler,
  getTafsirByNomorHandler
}
