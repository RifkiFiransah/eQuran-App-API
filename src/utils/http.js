const success = (h, message, data, code = 200) => {
  const payload = { status: 'success', message }
  if (data !== undefined) {
    payload.data = data
  }
  return h.response(payload).code(code)
}

const fail = (h, message, code = 400, extra = {}) => {
  return h.response({ status: 'fail', message, ...extra }).code(code)
}

module.exports = { success, fail }
