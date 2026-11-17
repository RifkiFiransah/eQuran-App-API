const Joi = require('joi')

const nomorSuratParam = Joi.object({
  nomor: Joi.number().integer().min(1).max(114).required()
})

const idSuratParam = Joi.object({
  id: Joi.string().trim().min(1).max(64).required()
})

const quranListQuery = Joi.object({
  nama: Joi.string().trim().max(100),
  tempat_turun: Joi.string().lowercase().valid('mekah', 'madinah'),
  limit: Joi.number().integer().min(1).max(114).default(114),
  offset: Joi.number().integer().min(0).default(0)
})

const suratListQuery = Joi.object({
  nomor: Joi.number().integer().min(1).max(114),
  nama: Joi.string().trim().max(100),
  id: Joi.string().trim().max(64),
  limit: Joi.number().integer().min(1).max(114).default(50),
  offset: Joi.number().integer().min(0).default(0)
})

const suratPayload = Joi.object({
  nomor: Joi.number().integer().min(1).max(114).required(),
  nama: Joi.string().trim().min(1).max(100).required(),
  jumlahAyat: Joi.number().integer().min(1).max(300).required(),
  turun: Joi.string().lowercase().valid('mekah', 'madinah').required(),
  arti: Joi.string().trim().min(1).max(200).required(),
  deskripsi: Joi.string().allow('', null).max(5000)
})

const suratUpdatePayload = Joi.object({
  nomor: Joi.number().integer().min(1).max(114),
  nama: Joi.string().trim().min(1).max(100),
  jumlahAyat: Joi.number().integer().min(1).max(300),
  turun: Joi.string().lowercase().valid('mekah', 'madinah'),
  arti: Joi.string().trim().min(1).max(200),
  deskripsi: Joi.string().allow('', null).max(5000)
}).min(1)

const registerPayload = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(150).required(),
  password: Joi.string().min(8).max(72).required()
})

const loginPayload = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(150).required(),
  password: Joi.string().max(72).required()
})

module.exports = {
  nomorSuratParam,
  idSuratParam,
  quranListQuery,
  suratListQuery,
  suratPayload,
  suratUpdatePayload,
  registerPayload,
  loginPayload
}
