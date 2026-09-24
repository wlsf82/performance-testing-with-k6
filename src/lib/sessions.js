import crypto from 'node:crypto'

// One session per successful login, each with its own cart, so concurrent
// users never share (or fight over) the same cart.
const sessions = new Map()

export function createSession(username) {
  const token = crypto.randomUUID()

  sessions.set(token, { username, cart: [] })

  return token
}

export function requireSession(req, res, next) {
  const header = req.get('Authorization') || ''
  const [scheme, token] = header.split(' ')
  const session = scheme === 'Bearer' ? sessions.get(token) : undefined

  if (!session) {
    return res.status(401).json({ error: 'A valid bearer token is required' })
  }

  req.session = session
  next()
}
