const pkg = require('../../package.json')
const { success } = require('../utils/http')
const authRoutes = require('./auth')
const quranRoutes = require('./quran')
const suratRoutes = require('./surat')

const infoRoutes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return success(h, 'e-Quran API berjalan', {
        name: pkg.name,
        version: pkg.version,
        endpoints: {
          info: 'GET /',
          health: 'GET /health',
          quranList: 'GET /quran/surat',
          quranDetail: 'GET /quran/surat/{nomor}',
          quranTafsir: 'GET /quran/surat/{nomor}/tafsir',
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          profile: 'GET /auth/me',
          suratList: 'GET /surats',
          suratDetail: 'GET /surats/{id}',
          suratCreate: 'POST /surats',
          suratUpdate: 'PUT /surats/{id}',
          suratDelete: 'DELETE /surats/{id}'
        }
      })
    }
  },
  {
    method: 'GET',
    path: '/health',
    handler: (request, h) => {
      return success(h, 'Server sehat', {
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      })
    }
  }
]

module.exports = [
  ...infoRoutes,
  ...authRoutes,
  ...quranRoutes,
  ...suratRoutes
]
