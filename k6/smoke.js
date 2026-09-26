import http from 'k6/http'
import { group, check, fail, sleep } from 'k6'

const BASE_URL = 'http://localhost:3001'

export const options = {
  stages: [
    { duration: '10s', target: 3 }, // warm up
    { duration: '40s', target: 3 }, // measure
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration{name:GET /products}': ['p(95)<300'],
    'http_req_duration{name:GET /products/:id}': ['p(95)<300'],
    'http_req_duration{name:POST /checkout}': ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
}

export default function () {
  let token

  group('login', function () {
    const response = http.post(
      `${BASE_URL}/login`,
      JSON.stringify({ username: 'tester', password: 'secret' }),
      { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /login' } },
    )

    const ok = check(response, { 'logged in': (r) => r.status === 200 })

    if (!ok) {
      sleep(1)
      fail(`login failed with status ${response.status}`)
    }

    token = response.json('token')
  })

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  group('browse products', function () {
    const response = http.get(`${BASE_URL}/products?page=1&limit=20`, {
      tags: { name: 'GET /products' },
    })
    check(response, { 'products listed': (r) => r.status === 200 })
  })

  group('view a product', function () {
    const response = http.get(`${BASE_URL}/products/1`, {
      tags: { name: 'GET /products/:id' },
    })
    check(response, { 'product found': (r) => r.status === 200 })
  })

  group('add to cart', function () {
    const response = http.post(
      `${BASE_URL}/cart`,
      JSON.stringify({ productId: 1, quantity: 1 }),
      { headers: authHeaders, tags: { name: 'POST /cart' } },
    )
    check(response, { 'added to cart': (r) => r.status === 201 })
  })

  group('checkout', function () {
    const response = http.post(`${BASE_URL}/checkout`, null, {
      headers: authHeaders,
      tags: { name: 'POST /checkout' },
    })
    check(response, { 'order created': (r) => r.status === 201 })
  })

  sleep(1)
}
