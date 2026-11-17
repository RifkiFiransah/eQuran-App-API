const { registerHandler, loginHandler, meHandler } = require('../handlers/auth')
const { registerPayload, loginPayload } = require('../validations')

module.exports = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: registerHandler,
    options: {
      validate: {
        payload: registerPayload
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: loginHandler,
    options: {
      validate: {
        payload: loginPayload
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/me',
    handler: meHandler,
    options: {
      auth: 'jwt'
    }
  }
]
