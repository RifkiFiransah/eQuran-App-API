const fs = require('node:fs')
const path = require('node:path')
const openapi = require('../../docs/openapi.json')

const swaggerHtml = fs.readFileSync(path.join(__dirname, '..', 'docs', 'swagger.html'), 'utf8')
const swaggerDistPath = path.dirname(require.resolve('swagger-ui-dist/package.json'))
const assetCache = new Map()

const assetTypes = {
  'swagger-ui.css': 'text/css; charset=utf-8',
  'swagger-ui-bundle.js': 'application/javascript; charset=utf-8',
  'swagger-ui-standalone-preset.js': 'application/javascript; charset=utf-8',
  'favicon-32x32.png': 'image/png'
}

const loadAsset = (file) => {
  if (!assetCache.has(file)) {
    assetCache.set(file, fs.readFileSync(path.join(swaggerDistPath, file)))
  }

  return assetCache.get(file)
}

module.exports = [
  {
    method: 'GET',
    path: '/docs',
    handler: (request, h) => {
      return h.response(swaggerHtml)
        .type('text/html; charset=utf-8')
        .header('cache-control', 'no-cache')
    }
  },
  {
    method: 'GET',
    path: '/docs/assets/{file}',
    handler: (request, h) => {
      const { file } = request.params
      const contentType = assetTypes[file]

      if (!contentType) {
        return h.response({
          status: 'fail',
          message: 'Aset dokumentasi tidak ditemukan'
        }).code(404)
      }

      return h.response(loadAsset(file))
        .type(contentType)
        .header('cache-control', 'public, max-age=86400')
    }
  },
  {
    method: 'GET',
    path: '/openapi.json',
    handler: (request, h) => {
      return h.response(openapi)
        .type('application/json; charset=utf-8')
        .header('cache-control', 'no-cache')
    }
  }
]
