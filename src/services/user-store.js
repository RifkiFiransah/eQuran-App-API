const { nanoid } = require('nanoid')
const { JsonCollection } = require('./json-store')

class UserStore {
  constructor({ filePath }) {
    this.collection = new JsonCollection(filePath)
  }

  all() {
    return this.collection.all()
  }

  findById(id) {
    return this.collection.find((user) => user.id === id)
  }

  findByEmail(email) {
    const normalized = String(email).trim().toLowerCase()
    return this.collection.find((user) => user.email === normalized)
  }

  create({ name, email, passwordHash }) {
    const user = {
      id: nanoid(16),
      name,
      email: String(email).trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    }

    return this.collection.insert(user)
  }

  toPublic(user) {
    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  }
}

module.exports = { UserStore }
