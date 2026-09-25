import http from 'k6/http'
import { group, check, fail, sleep } from 'k6'
import exec from 'k6/execution'
import { SharedArray } from 'k6/data'
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

const BASE_URL = 'http://localhost:3001'

const users = new SharedArray('users', function () {
  return JSON.parse(open('./users.json'))
})

export const options = {
  vus: 20,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
}

export default function () {
  const user = users[exec.vu.idInTest % users.length]
  const productId = ((exec.vu.idInTest - 1) % 500) + 1 // VU 1 gets product 1, VU 2 gets product 2, and VU 501 wraps back to 1
  const page = (exec.scenario.iterationInTest % 25) + 1 // each iteration asks for the next page, cycling through pages 1 to 25

  let token

  group('login', function () {
    const response = http.post(
      `${BASE_URL}/login`,
      JSON.stringify({ username: user.username, password: user.password }),
      { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /login' } },
    )

    const ok = check(response, {
      'logged in': (r) => r.status === 200,
      'token returned': (r) => r.json('token') !== undefined,
    })

    if (!ok) {
      sleep(1)
      fail('login failed, skipping the rest of the iteration')
    }

    token = response.json('token')
  })

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  sleep(randomIntBetween(2, 5))

  group('browse products', function () {
    const response = http.get(`${BASE_URL}/products?page=${page}&limit=20`, {
      tags: { name: 'GET /products' },
    })
    check(response, { 'products listed': (r) => r.status === 200 })
  })

  sleep(randomIntBetween(2, 5))

  group('view a product', function () {
    const response = http.get(`${BASE_URL}/products/${productId}`, {
      tags: { name: 'GET /products/:id' },
    })
    check(response, { 'product found': (r) => r.status === 200 })
  })

  sleep(randomIntBetween(2, 5))

  group('add to cart', function () {
    const response = http.post(
      `${BASE_URL}/cart`,
      JSON.stringify({ productId, quantity: 1 }),
      { headers: authHeaders, tags: { name: 'POST /cart' } },
    )
    check(response, { 'added to cart': (r) => r.status === 201 })
  })

  sleep(randomIntBetween(2, 5))

  group('checkout', function () {
    const response = http.post(`${BASE_URL}/checkout`, null, {
      headers: authHeaders,
      tags: { name: 'POST /checkout' },
    })
    check(response, { 'order created': (r) => r.status === 201 })
  })

  sleep(randomIntBetween(2, 5))
}
