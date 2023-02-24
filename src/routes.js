const routes= [
  {
    method: 'POST',
    path: '/surats',
    handler: () => {},
    option: {
      cors: {
        origin: ['*']
      }
    }
  },
  {
    method: 'GET',
    path: '/surats',
    handler: () => {}
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