const { success, fail } = require('../utils/http')

const getAllSuratHandler = (request, h) => {
  const { nomor, nama, id, limit, offset } = request.query
  const suratStore = request.server.app.suratStore

  const items = suratStore.list({ nomor, nama, id })
  const total = items.length
  const paged = items.slice(offset, offset + limit)

  return success(h, 'Daftar surat berhasil diambil', {
    total,
    limit,
    offset,
    surat: paged
  })
}

const getSuratByIdHandler = (request, h) => {
  const { id } = request.params
  const surat = request.server.app.suratStore.findById(id)

  if (!surat) {
    return fail(h, 'Surat tidak ditemukan', 404)
  }

  return success(h, 'Detail surat berhasil diambil', { surat })
}

const addSuratHandler = (request, h) => {
  const suratStore = request.server.app.suratStore
  const payload = request.payload

  if (suratStore.findByNomor(payload.nomor)) {
    return fail(h, 'Surat dengan nomor tersebut sudah ada', 409)
  }

  const surat = suratStore.create(payload)
  return success(h, 'Surat berhasil ditambahkan', { surat }, 201)
}

const editSuratByIdHandler = (request, h) => {
  const { id } = request.params
  const suratStore = request.server.app.suratStore
  const payload = request.payload
  const existing = suratStore.findById(id)

  if (!existing) {
    return fail(h, 'Surat tidak ditemukan', 404)
  }

  if (payload.nomor !== undefined) {
    const duplicate = suratStore.findByNomor(payload.nomor)
    if (duplicate && duplicate.id !== id) {
      return fail(h, 'Surat dengan nomor tersebut sudah ada', 409)
    }
  }

  const surat = suratStore.update(id, payload)
  return success(h, 'Surat berhasil diperbarui', { surat })
}

const deleteSuratByIdHandler = (request, h) => {
  const { id } = request.params
  const suratStore = request.server.app.suratStore

  if (!suratStore.remove(id)) {
    return fail(h, 'Surat tidak ditemukan', 404)
  }

  return success(h, 'Surat berhasil dihapus')
}

module.exports = {
  getAllSuratHandler,
  getSuratByIdHandler,
  addSuratHandler,
  editSuratByIdHandler,
  deleteSuratByIdHandler
}
