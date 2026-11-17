require('dotenv').config()

const { createServer } = require('./app')
const { DEFAULT_JWT_SECRET } = require('./config')

const start = async () => {
  const server = await createServer()
  await server.start()

  const config = server.app.config
  if (config.isProduction && config.jwtSecret === DEFAULT_JWT_SECRET) {
    console.warn('PERINGATAN: JWT_SECRET masih memakai nilai default. Segera atur JWT_SECRET di environment produksi.')
  }

  console.log(`Server berjalan pada: ${server.info.uri}`)

  const shutdown = async (signal) => {
    console.log(`Menerima ${signal}, menghentikan server...`)
    await server.stop({ timeout: 5000 })
    process.exit(0)
  }

  process.on('SIGINT', () => {
    shutdown('SIGINT')
  })

  process.on('SIGTERM', () => {
    shutdown('SIGTERM')
  })
}

start().catch((error) => {
  console.error('Gagal menjalankan server:', error)
  process.exit(1)
})
