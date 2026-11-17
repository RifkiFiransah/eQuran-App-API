const fs = require('node:fs')
const path = require('node:path')

class JsonCollection {
  constructor(filePath) {
    this.filePath = filePath
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    this.items = this.load()
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      return []
    }

    const raw = fs.readFileSync(this.filePath, 'utf8').trim()
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      throw new Error(`Berkas data ${this.filePath} harus berisi array JSON`)
    }

    return parsed
  }

  persist() {
    const tempPath = `${this.filePath}.${process.pid}.tmp`
    fs.writeFileSync(tempPath, JSON.stringify(this.items, null, 2), 'utf8')
    fs.renameSync(tempPath, this.filePath)
  }

  all() {
    return [...this.items]
  }

  find(predicate) {
    return this.items.find(predicate) || null
  }

  filter(predicate) {
    return this.items.filter(predicate)
  }

  insert(document) {
    this.items.push(document)
    this.persist()
    return document
  }

  update(predicate, changes) {
    const index = this.items.findIndex(predicate)
    if (index === -1) {
      return null
    }

    const updated = { ...this.items[index], ...changes }
    this.items[index] = updated
    this.persist()
    return updated
  }

  remove(predicate) {
    const index = this.items.findIndex(predicate)
    if (index === -1) {
      return false
    }

    this.items.splice(index, 1)
    this.persist()
    return true
  }

  clear() {
    this.items = []
    this.persist()
  }
}

module.exports = { JsonCollection }
