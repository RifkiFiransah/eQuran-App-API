const {addSuratHandler, getAllSuratHandler, getSuratByIdHandler, editSuratByIdHandler, deleteSuratByIdHandler} = require('./handler')
const routes= [
  {
    method: 'POST',
    path: '/surat',
    handler: addSuratHandler,
    options: {
      cors: {
        origin: ['*']
      }
    }
  },
  {
    method: 'GET',
    path: '/surats',
    handler: getAllSuratHandler
  },
  {
    method: 'GET',
    path: '/surat/{id}',
    handler: getSuratByIdHandler
  },
  {
    method: 'PUT',
    path: '/surat/{id}',
    handler: editSuratByIdHandler
  },
  {
    method: 'DELETE',
    path: '/surat/{id}',
    handler: deleteSuratByIdHandler
  }
]

module.exports = routes