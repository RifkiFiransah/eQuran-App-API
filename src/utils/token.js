const Jwt = require('@hapi/jwt')

const generateToken = (user, config) => {
  return Jwt.token.generate(
    { sub: user.id, email: user.email, name: user.name },
    { key: config.jwtSecret, algorithms: ['HS256'] },
    { ttlSec: config.jwtExpiresInSeconds }
  )
}

module.exports = { generateToken }
