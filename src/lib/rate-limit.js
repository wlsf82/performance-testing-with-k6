// A fixed-window rate limiter. Every request counts towards the current
// one-second window, and once the limit is reached the rest of that window
// is refused with a 429 before any real work is done.
//
// The limit is global rather than per client on purpose: every load test
// you run against this API comes from one machine, so a per-IP limit would
// behave exactly the same while being harder to read.
export function fixedWindowRateLimit({ limit, windowMs }) {
  let windowStartedAt = Date.now()
  let requestsInWindow = 0

  return function rateLimit(req, res, next) {
    const now = Date.now()

    if (now - windowStartedAt >= windowMs) {
      windowStartedAt = now
      requestsInWindow = 0
    }

    requestsInWindow += 1

    if (requestsInWindow > limit) {
      const retryAfterSeconds = Math.ceil((windowStartedAt + windowMs - now) / 1000)

      res.set('Retry-After', String(retryAfterSeconds))
      return res.status(429).json({ error: 'Too many requests, slow down' })
    }

    next()
  }
}
