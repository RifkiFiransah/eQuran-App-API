const {
  getAllSuratHandler,
  getSuratByIdHandler,
  addSuratHandler,
  editSuratByIdHandler,
  deleteSuratByIdHandler
} = require('../handlers/surat')
const {
  suratListQuery,
  suratPayload,
  suratUpdatePayload,
  idSuratParam
} = require('../validations')

const createOptions = {
  auth: 'jwt',
  validate: {
    payload: suratPayload
  }
}

const detailOptions = {
  validate: {
    params: idSuratParam
  }
}

const updateOptions = {
  auth: 'jwt',
  validate: {
    params: idSuratParam,
    payload: suratUpdatePayload
  }
}

const deleteOptions = {
  auth: 'jwt',
  validate: {
    params: idSuratParam
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/surats',
    handler: getAllSuratHandler,
    options: {
      validate: {
        query: suratListQuery
      }
    }
  },
  {
    method: 'POST',
    path: '/surats',
    handler: addSuratHandler,
    options: createOptions
  },
  {
    method: 'POST',
    path: '/surat',
    handler: addSuratHandler,
    options: createOptions
  },
  {
    method: 'GET',
    path: '/surats/{id}',
    handler: getSuratByIdHandler,
    options: detailOptions
  },
  {
    method: 'GET',
    path: '/surat/{id}',
    handler: getSuratByIdHandler,
    options: detailOptions
  },
  {
    method: 'PUT',
    path: '/surats/{id}',
    handler: editSuratByIdHandler,
    options: updateOptions
  },
  {
    method: 'PUT',
    path: '/surat/{id}',
    handler: editSuratByIdHandler,
    options: updateOptions
  },
  {
    method: 'DELETE',
    path: '/surats/{id}',
    handler: deleteSuratByIdHandler,
    options: deleteOptions
  },
  {
    method: 'DELETE',
    path: '/surat/{id}',
    handler: deleteSuratByIdHandler,
    options: deleteOptions
  }
]
