const path = require('node:path')

const DEFAULT_JWT_SECRET = 'equran-development-secret-change-me'

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const loadConfig = (overrides = {}) => {
  const env = process.env
  const config = {
    port: toNumber(env.PORT, 5000),
    host: env.HOST || '0.0.0.0',
    corsOrigins: env.CORS_ORIGINS
      ? env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
      : ['*'],
    jwtSecret: env.JWT_SECRET || DEFAULT_JWT_SECRET,
    jwtExpiresInSeconds: toNumber(env.JWT_EXPIRES_IN_SECONDS, 60 * 60 * 24),
    dataDir: env.DATA_DIR || path.join(process.cwd(), 'data'),
    equran: {
      baseUrl: env.EQURAN_API_BASE_URL || 'https://equran.id/api',
      timeoutMs: toNumber(env.EQURAN_API_TIMEOUT_MS, 10000),
      cacheTtlMs: toNumber(env.EQURAN_CACHE_TTL_MS, 10 * 60 * 1000)
    },
    isProduction: env.NODE_ENV === 'production'
  }

  return {
    ...config,
    ...overrides,
    equran: { ...config.equran, ...(overrides.equran || {}) }
  }
}

module.exports = { loadConfig, DEFAULT_JWT_SECRET }
