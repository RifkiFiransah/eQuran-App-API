const {addSuratHandler, getAllSuratHandler} = require('./handler')
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
    handler: () => {}
  },
  {
    method: 'PUT',
    path: '/surat/{id}',
    handler: () => {}
  },
  {
    method: 'DELETE',
    path: '/surat/{id}',
    handler: () => {}
  }
]

module.exports = routes