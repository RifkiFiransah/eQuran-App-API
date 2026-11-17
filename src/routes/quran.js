const {
  getAllSuratHandler,
  getSuratByNomorHandler,
  getTafsirByNomorHandler
} = require('../handlers/quran')
const { quranListQuery, nomorSuratParam } = require('../validations')

module.exports = [
  {
    method: 'GET',
    path: '/quran/surat',
    handler: getAllSuratHandler,
    options: {
      validate: {
        query: quranListQuery
      }
    }
  },
  {
    method: 'GET',
    path: '/quran/surat/{nomor}',
    handler: getSuratByNomorHandler,
    options: {
      validate: {
        params: nomorSuratParam
      }
    }
  },
  {
    method: 'GET',
    path: '/quran/surat/{nomor}/tafsir',
    handler: getTafsirByNomorHandler,
    options: {
      validate: {
        params: nomorSuratParam
      }
    }
  }
]
