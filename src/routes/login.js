import express from 'express'
import { createSession } from '../lib/sessions.js'
import { fixedWindowRateLimit } from '../lib/rate-limit.js'

// Every account shares one password, so any list of usernames works as test
// data. The one you will use by hand is "tester".
const PASSWORD = 'secret'

export const router = express.Router()

router.post(
  '/',
  fixedWindowRateLimit({ limit: 30, windowMs: 1000 }),
  (req, res) => {
    const { username, password } = req.body || {}

    if (typeof username !== 'string' || username.trim() === '' || typeof password !== 'string') {
      return res.status(400).json({ error: 'username and password are required' })
    }

    if (password !== PASSWORD) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    res.json({ token: createSession(username) })
  },
)
