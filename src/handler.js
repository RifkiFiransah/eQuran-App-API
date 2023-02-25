const quran = require('./quran')
const {nanoid} = require('nanoid')

const addSuratHandler = (request, h) => {
  const { nomor , nama, jumlahAyat, turun, arti, deskripsi} = request.payload
  if(nomor == null && nama == null && jumlahAyat == null && arti == null) {
    const response = h.response({
      status: 'fail',
      message: 'Data retrieved Unsuccessfully'
    }).code(400)
    return response
  }
  const id = nanoid(16)
  const createdAt = new Date().toISOString()
  const updatedAt = createdAt

  const addSurat = {
    id, nomor, nama, jumlahAyat, turun, arti, deskripsi, createdAt, updatedAt
  }

  quran.push(addSurat)

  const isSuccess = quran.filter((surat) => surat.id == id).length > 0
  if(isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Data retireved successfully',
      data: {
        quran: quran
      }
    }).code(201)
    return response
  }else {
    const response = h.response({
      status: 'fail',
      message: 'Data retireved Unsuccessfully'
    }).code(500)
    return response

  }
}

const getAllSuratHandler = (request, h) => {
  const {nomor, nama, id} = request.query

  if(!nomor && !nama && !id) {
    const response = h.response({
      status: 'success',
      message: 'Get all data retrieved successfully',
      data: {
        quran: quran.map((q) => ({
          nomor: q.nomor,
          nama: q.nama,
          jumlahAyat: q.jumlahAyat,
          turun: q.turun,
          arti: q.arti
        }))
      }
    }).code(200)
    return response
  }


  if(nomor) {
    const response = h.response({
      status: 'success',
      message: 'Data retrieved by nomor successfully',
      data: {
        quran: quran.map((q) => ({
          nomor: q.nomor,
          nama: q.nama,
          jumlahAyat: q.jumlahAyat,
          turun: q.turun,
          arti: q.arti
        }))
      }
    }).code(200)
    return response
  }
  if(nama) {
    const response = h.response({
      status: 'success',
      message: 'Get data retrieved by nama successfully',
      data: {
        quran: quran.map((q) => ({
          nomor: q.nomor,
          nama: q.nama,
          jumlahAyat: q.jumlahAyat,
          turun: q.turun,
          arti: q.arti
        }))
      }
    }).code(200)
    return response
  }
  if(id) {
    const response = h.response({
      status: 'success',
      message: 'Get data retrieved by id successfully',
      data: {
        quran: quran.map((q) => ({
          nomor: q.nomor,
          nama: q.nama,
          jumlahAyat: q.jumlahAyat,
          turun: q.turun,
          arti: q.arti
        }))
      }
    }).code(200)
    return response
  }

  const response = h.response({
    status: 'fail',
    message: 'Data retrieved unsuccessfullys'
  }).code(400)

  return response
}

const getSuratByIdHandler = (request, h) => {
  const {id} = request.params

  const isSuccess = quran.map((q) => q.id == id)[0]
  if(isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Get data retrieved by id successfully',
      data: {
        quran: quran.map((q) => ({
          nomor: q.nomor,
          nama: q.nama,
          jumlahAyat: q.jumlahAyat,
          turun: q.turun,
          arti: q.arti
        }))
      }
    }).code(200)
    return response
  } else {
    const response = h.response({
      status: 'fail',
      message: 'Get data retrieved by id not found'
    }).code(404)

    return response
  }
}

const editSuratByIdHandler = (request, h) => {
  const {id} = request.params
  const {nomor, nama, jumlahAyat, turun, arti, deskripsi} = request.payload
  const updatedAt = new Date().toISOString()
  const index = quran.findIndex((q) => q.id == id)
  if(index != -1) {
    quran[index] = {
      ...quran[index],
      nomor,
      nama,
      jumlahAyat,
      turun,
      arti,
      deskripsi,
      updatedAt
    }
    const response = h.response({
      status: 'success',
      message: 'Edit data retrieved by id successfully',
      data: {
        quran: quran.map((q) => ({
          nomor: q.nomor,
          nama: q.nama,
          jumlahAyat: q.jumlahAyat,
          turun: q.turun,
          arti: q.arti
        }))
      }
    }).code(200)
    return response
  }
  const response = h.response({
    status: 'fail',
    message: 'Edit data retrieved by id unsuccessfully, id not found'
  }).code(404)
  return response
}

const deleteSuratByIdHandler = (request, h) => {
  const {id} = request.params
  const index = quran.findIndex((q) => q.id == id)
  if (index != -1) {
    quran.splice(index, 1)
    const response = h.response({
      status: 'success',
      message: 'Delete data retrieved by id successfully'
    }).code(200)
    return response
  }
  const response = h.response({
    status: 'fail',
    message: 'Delete data retrieved by id unsuccessfully, id not found'
  }).code(404)
  return response
}

module.exports = {addSuratHandler, getAllSuratHandler, getSuratByIdHandler, editSuratByIdHandler, deleteSuratByIdHandler}