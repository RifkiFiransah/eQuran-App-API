const bcrypt = require('bcryptjs')
const { success, fail } = require('../utils/http')
const { generateToken } = require('../utils/token')

const DUMMY_HASH = bcrypt.hashSync('equran-dummy-password', 10)

const registerHandler = async (request, h) => {
  const { name, email, password } = request.payload
  const { userStore, config } = request.server.app

  if (userStore.findByEmail(email)) {
    return fail(h, 'Email sudah terdaftar', 409)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = userStore.create({ name, email, passwordHash })
  const token = generateToken(user, config)

  return success(h, 'Registrasi berhasil', {
    user: userStore.toPublic(user),
    token
  }, 201)
}

const loginHandler = async (request, h) => {
  const { email, password } = request.payload
  const { userStore, config } = request.server.app
  const user = userStore.findByEmail(email)
  const passwordHash = user ? user.passwordHash : DUMMY_HASH
  const isValid = await bcrypt.compare(password, passwordHash)

  if (!user || !isValid) {
    return fail(h, 'Email atau password salah', 401)
  }

  const token = generateToken(user, config)

  return success(h, 'Login berhasil', {
    user: userStore.toPublic(user),
    token
  })
}

const meHandler = (request, h) => {
  const { userStore } = request.server.app
  const { user } = request.auth.credentials

  return success(h, 'Profil berhasil diambil', {
    user: userStore.toPublic(user)
  })
}

module.exports = {
  registerHandler,
  loginHandler,
  meHandler
}
