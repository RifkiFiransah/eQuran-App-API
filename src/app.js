const path = require('node:path')
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const { loadConfig } = require('./config')
const { EquranClient } = require('./services/equran-client')
const { UserStore } = require('./services/user-store')
const { SuratStore } = require('./services/surat-store')
const routes = require('./routes')

const DEFAULT_MESSAGES = {
  'Bad Request': 'Permintaan tidak valid',
  'Unauthorized': 'Autentikasi diperlukan atau token tidak valid',
  'Forbidden': 'Akses ditolak',
  'Not Found': 'Endpoint tidak ditemukan',
  'Conflict': 'Data sudah ada',
  'Internal Server Error': 'Terjadi kesalahan pada server',
  'Bad Gateway': 'Layanan equran.id sedang tidak tersedia'
}

const createServer = async (options = {}) => {
  const config = loadConfig(options.config)
  const equranClient = options.equranClient || new EquranClient(config.equran)
  const userStore = options.userStore || new UserStore({
    filePath: path.join(config.dataDir, 'users.json')
  })
  const suratStore = options.suratStore || new SuratStore({
    filePath: path.join(config.dataDir, 'surats.json')
  })

  const server = Hapi.server({
    port: config.port,
    host: config.host,
    routes: {
      cors: {
        origin: config.corsOrigins
      },
      validate: {
        options: {
          abortEarly: false,
          stripUnknown: true
        },
        failAction: (request, h, error) => {
          const errors = error.details
            ? error.details.map((detail) => detail.message)
            : [error.message]

          return h.response({
            status: 'fail',
            message: 'Validasi gagal',
            errors
          }).code(400).takeover()
        }
      }
    }
  })

  server.app.config = config
  server.app.equranClient = equranClient
  server.app.userStore = userStore
  server.app.suratStore = suratStore

  await server.register(Jwt)

  server.auth.strategy('jwt', 'jwt', {
    keys: config.jwtSecret,
    verify: {
      aud: false,
      iss: false,
      sub: false
    },
    validate: (artifacts) => {
      const user = userStore.findById(artifacts.decoded.payload.sub)
      if (!user) {
        return { isValid: false }
      }

      return {
        isValid: true,
        credentials: { user }
      }
    }
  })

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (!response.isBoom) {
      return h.continue
    }

    const statusCode = response.output.statusCode
    let message = response.message

    if (statusCode === 401) {
      message = DEFAULT_MESSAGES.Unauthorized
    }
    else if (DEFAULT_MESSAGES[message]) {
      message = DEFAULT_MESSAGES[message]
    }

    if (statusCode >= 500) {
      request.log(['error'], response)
    }

    return h.response({
      status: 'fail',
      message
    }).code(statusCode)
  })

  server.route(routes)

  return server
}

module.exports = { createServer }
