const { nanoid } = require('nanoid')
const { JsonCollection } = require('./json-store')

class SuratStore {
  constructor({ filePath }) {
    this.collection = new JsonCollection(filePath)
  }

  all() {
    return this.collection.all()
  }

  findById(id) {
    return this.collection.find((surat) => surat.id === id)
  }

  findByNomor(nomor) {
    return this.collection.find((surat) => surat.nomor === Number(nomor))
  }

  list({ nomor, nama, id }) {
    let items = this.collection.all()

    if (nomor !== undefined) {
      items = items.filter((surat) => surat.nomor === Number(nomor))
    }

    if (nama) {
      const keyword = String(nama).trim().toLowerCase()
      items = items.filter((surat) => String(surat.nama).toLowerCase().includes(keyword))
    }

    if (id) {
      items = items.filter((surat) => surat.id === id)
    }

    return items
  }

  create(payload) {
    const now = new Date().toISOString()
    const surat = {
      id: nanoid(16),
      nomor: payload.nomor,
      nama: payload.nama,
      jumlahAyat: payload.jumlahAyat,
      turun: payload.turun,
      arti: payload.arti,
      deskripsi: payload.deskripsi || '',
      createdAt: now,
      updatedAt: now
    }

    return this.collection.insert(surat)
  }

  update(id, changes) {
    return this.collection.update(
      (surat) => surat.id === id,
      { ...changes, updatedAt: new Date().toISOString() }
    )
  }

  remove(id) {
    return this.collection.remove((surat) => surat.id === id)
  }
}

module.exports = { SuratStore }
