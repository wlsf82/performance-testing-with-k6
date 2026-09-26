import http from 'k6/http'
import { check } from 'k6'

export const options = {
  scenarios: {
    steady_traffic: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
}

export default function () {
  const response = http.get('http://localhost:3001/products')

  check(response, {
    'status is 200': (r) => r.status === 200,
  })
}
