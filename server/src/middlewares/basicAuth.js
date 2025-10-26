export function basicAuth(req, res, next) {
  const b64 = (req.headers.authorization || '').split(' ')[1]
  if (!b64) return unauthorized(res)

  const [user, pass] = Buffer.from(b64, 'base64').toString().split(':')
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) return next()

  return unauthorized(res)
}

function unauthorized(res) {
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"')
  return res.status(401).send('Unauthorized')
}
