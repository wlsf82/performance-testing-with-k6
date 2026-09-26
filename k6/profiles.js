import http from 'k6/http'
import { check, sleep } from 'k6'

const profiles = {
  smoke: {
    executor: 'constant-vus',
    vus: 3,
    duration: '30s',
  },
  load: {
    executor: 'ramping-vus',
    stages: [
      { duration: '30s', target: 30 },
      { duration: '2m', target: 30 },
      { duration: '30s', target: 0 },
    ],
  },
  stress: {
    executor: 'ramping-vus',
    stages: [
      { duration: '10s', target: 50 },
      { duration: '1m', target: 50 },
      { duration: '10s', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '10s', target: 200 },
      { duration: '1m', target: 200 },
      { duration: '10s', target: 400 },
      { duration: '1m', target: 400 },
      { duration: '30s', target: 0 },
    ],
  },
}

const profile = profiles[__ENV.PROFILE]

if (!profile) {
  throw new Error(`Unknown PROFILE "${__ENV.PROFILE}". Use one of: ${Object.keys(profiles).join(', ')}`)
}

export const options = {
  scenarios: {
    [__ENV.PROFILE]: profile,
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

  sleep(1)
}
